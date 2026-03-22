import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import yahooFinance from 'yahoo-finance2'
import { verifyCronSecret } from '@/lib/cron-auth'

// Bootstrap endpoint for cold-start: computes peak_price_5yr in 50-ticker chunks
// Call 9× manually after first deploy (74 industries × avg 6 tickers / 50 = ~9 chunks)
// After bootstrap, nightly Edge Function uses cached values

const CHUNK_SIZE = 50

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret')
  if (!verifyCronSecret(secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const offset = parseInt(request.nextUrl.searchParams.get('offset') ?? '0')

  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get all unique tickers across all active industries
  const { data: industries } = await serviceSupabase
    .from('industries')
    .select('constituents')
    .eq('is_active', true)

  if (!industries) return NextResponse.json({ error: 'No industries' }, { status: 500 })

  const allTickers = [...new Set(industries.flatMap(i => i.constituents as string[]))]
  const chunk = allTickers.slice(offset, offset + CHUNK_SIZE)

  if (chunk.length === 0) {
    return NextResponse.json({ done: true, message: 'Bootstrap complete — all tickers processed' })
  }

  let processed = 0
  let errors = 0

  for (const ticker of chunk) {
    try {
      // Check if already computed recently
      const { data: existing } = await serviceSupabase
        .from('market_snapshots')
        .select('peak_price_5yr_computed_at')
        .eq('ticker_or_sector', ticker)
        .not('peak_price_5yr', 'is', null)
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .single()

      const computedAt = existing?.peak_price_5yr_computed_at
      if (computedAt && Date.now() - new Date(computedAt).getTime() < 30 * 86400000) {
        processed++
        continue  // Skip — recently computed
      }

      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 5 * 365 * 86400000)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const historical: any[] = await yahooFinance.historical(ticker, {
        period1: startDate,
        period2: endDate,
        interval: '1mo',
      })

      if (historical.length > 0) {
        const peakPrice5yr = Math.max(...historical.map((h: { close?: number }) => h.close ?? 0))
        const today = new Date().toISOString().split('T')[0]

        await serviceSupabase.from('market_snapshots').upsert({
          ticker_or_sector: ticker,
          peak_price_5yr: peakPrice5yr,
          peak_price_5yr_computed_at: new Date().toISOString(),
          snapshot_date: today,
          last_fetched_at: new Date().toISOString(),
        }, { onConflict: 'ticker_or_sector,snapshot_date', ignoreDuplicates: false })
      }

      processed++
      await new Promise(r => setTimeout(r, 300))
    } catch (e) {
      console.error(`Bootstrap error for ${ticker}:`, e)
      errors++
    }
  }

  const nextOffset = offset + CHUNK_SIZE
  const hasMore = nextOffset < allTickers.length

  return NextResponse.json({
    ok: true,
    processed,
    errors,
    chunk: `${offset}–${offset + chunk.length - 1}`,
    total: allTickers.length,
    nextOffset: hasMore ? nextOffset : null,
    done: !hasMore,
    message: hasMore
      ? `Processed chunk ${offset}–${offset + chunk.length - 1}. Call again with ?offset=${nextOffset} to continue.`
      : 'Bootstrap complete!',
  })
}
