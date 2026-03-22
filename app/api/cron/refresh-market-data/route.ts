import { NextRequest, NextResponse, after } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { verifyCronSecret } from '@/lib/cron-auth'
import { refreshIndustry } from '@/app/api/refresh/route'

// Vercel cron: 0 23 * * * (6pm ET = 11pm UTC)
// Also triggered manually from scanner cold-start
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret')
  // Allow Vercel cron (via Authorization: Bearer) OR manual trigger with x-cron-secret
  const authHeader = request.headers.get('authorization')
  const cronToken = authHeader?.replace('Bearer ', '') ?? secret

  // Allow authenticated Supabase users to trigger manually (e.g. cold-start button)
  let authorizedBySession = false
  if (!verifyCronSecret(cronToken)) {
    try {
      const supabase = await createServerClient()
      const { data: { user } } = await supabase.auth.getUser()
      authorizedBySession = !!user
    } catch { /* ignore */ }
  }

  if (!verifyCronSecret(cronToken) && !authorizedBySession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get all active industries
  const { data: industries, error } = await serviceSupabase
    .from('industries')
    .select('id, name, constituents')
    .eq('is_active', true)

  if (error || !industries) {
    return NextResponse.json({ error: 'Failed to load industries' }, { status: 500 })
  }

  // Use after() to keep processing alive after response is sent
  after(async () => {
    await refreshMacroData(serviceSupabase)
    await processAllIndustries(industries, serviceSupabase).catch(e =>
      console.error('Nightly refresh error:', e)
    )
  })

  return NextResponse.json({
    ok: true,
    message: `Nightly refresh started for ${industries.length} industries`,
    industries: industries.length,
  })
}

async function processAllIndustries(
  industries: { id: string; name: string; constituents: string[] }[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceSupabase: any
) {
  let success = 0
  let failure = 0

  for (const industry of industries) {
    try {
      await refreshIndustry(industry, serviceSupabase)
      success++
      // 500ms between industries
      await new Promise(r => setTimeout(r, 500))
    } catch (e) {
      console.error(`Industry ${industry.name} refresh failed:`, e)
      failure++

      // Abort if 5+ consecutive Yahoo Finance failures
      if (failure >= 5 && success === 0) {
        console.error('YAHOO_FINANCE_TOTAL_FAILURE: Aborting nightly refresh after 5 consecutive failures')
        break
      }
    }
  }

  console.log(`Nightly refresh complete: ${success} success, ${failure} failure`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function refreshMacroData(serviceSupabase: any) {
  const fredKey = process.env.FRED_API_KEY
  if (!fredKey) return

  const today = new Date().toISOString().split('T')[0]
  const series = {
    fed_funds_rate: 'FEDFUNDS',
    cpi_yoy: 'CPIAUCSL',
    core_pce_yoy: 'PCEPILFE',
    unemployment_rate: 'UNRATE',
    yield_10yr: 'DGS10',
    yield_2yr: 'DGS2',
  }

  const results: Record<string, number | null> = {}

  for (const [key, seriesId] of Object.entries(series)) {
    try {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${fredKey}&file_type=json&sort_order=desc&limit=2`
      const res = await fetch(url)
      if (!res.ok) continue
      const data = await res.json()
      const latest = data.observations?.find((o: { value: string }) => o.value !== '.')
      results[key] = latest ? parseFloat(latest.value) : null
    } catch {
      results[key] = null
    }
  }

  const yield10yr = results.yield_10yr ?? null
  const yield2yr = results.yield_2yr ?? null
  const yieldCurve = (yield10yr !== null && yield2yr !== null) ? yield10yr - yield2yr : null

  // ON CONFLICT DO NOTHING — preserve daily history
  await serviceSupabase.from('macro_snapshots').upsert({
    ...results,
    yield_curve_spread: yieldCurve,
    snapshot_date: today,
    fetched_at: new Date().toISOString(),
  }, { onConflict: 'snapshot_date', ignoreDuplicates: true })
}
