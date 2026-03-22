import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import YahooFinanceClass from 'yahoo-finance2'
const yahooFinance = new (YahooFinanceClass as unknown as new () => typeof YahooFinanceClass)()
import { aggregateTickersForIndustry, type TickerData } from '@/lib/pain-index'

// On-demand single-industry refresh
// Called by scanner row "Refresh" button
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const industry_id = request.nextUrl.searchParams.get('industry_id')
  if (!industry_id) return NextResponse.json({ error: 'industry_id required' }, { status: 400 })

  const { data: industry } = await supabase
    .from('industries')
    .select('id, name, constituents')
    .eq('id', industry_id)
    .single()

  if (!industry) return NextResponse.json({ error: 'Industry not found' }, { status: 404 })

  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const result = await refreshIndustry(industry, serviceSupabase)
    return NextResponse.json(result)
  } catch (e) {
    console.error('Refresh error:', e)
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 })
  }
}

export async function refreshIndustry(
  industry: { id: string; name: string; constituents: string[] },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceSupabase: any
) {
  const tickers = industry.constituents
  const today = new Date().toISOString().split('T')[0]
  const tickerData: TickerData[] = []
  const returns: { return1yr: number | null; return3yr: number | null }[] = []

  for (const ticker of tickers) {
    try {
      // Get quote data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const quote: any = await yahooFinance.quote(ticker)

      // Get existing peak price from cache or compute
      const { data: existing } = await serviceSupabase
        .from('market_snapshots')
        .select('peak_price_5yr, peak_price_5yr_computed_at')
        .eq('ticker_or_sector', ticker)
        .not('peak_price_5yr', 'is', null)
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .single()

      let peakPrice5yr: number | null = existing?.peak_price_5yr ?? null

      // Recompute if null or older than 30 days
      if (!peakPrice5yr || (existing?.peak_price_5yr_computed_at &&
          Date.now() - new Date(existing.peak_price_5yr_computed_at).getTime() > 30 * 86400000)) {
        try {
          const endDate = new Date()
          const startDate = new Date(endDate.getTime() - 5 * 365 * 86400000)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const historical: any[] = await yahooFinance.historical(ticker, {
            period1: startDate,
            period2: endDate,
            interval: '1mo',
          })
          if (historical.length > 0) {
            peakPrice5yr = Math.max(...historical.map((h: { close?: number }) => h.close ?? 0))
          }
        } catch {
          // Historical fetch failed — keep existing or null
        }
      }

      const currentPrice = (quote?.regularMarketPrice as number | undefined) ?? null
      const shortInterest = (quote?.shortPercentOfFloat as number | undefined) ?? null
      const analyst = (quote?.recommendationMean as number | undefined) ?? null

      tickerData.push({
        ticker,
        currentPrice,
        peakPrice5yr,
        shortPercentOfFloat: shortInterest,
        recommendationMean: analyst,
      })

      // Compute 1yr and 3yr returns
      const return1yr = (quote?.fiftyTwoWeekChangePercent as number | undefined) ?? null
      returns.push({ return1yr, return3yr: null })

      // Insert snapshot — ON CONFLICT DO NOTHING to preserve history
      await serviceSupabase.from('market_snapshots').upsert({
        ticker_or_sector: ticker,
        return_1yr: return1yr,
        return_3yr: null,
        short_interest: shortInterest,
        analyst_consensus: analyst,
        pain_index: null, // computed at industry level
        peak_price_5yr: peakPrice5yr,
        peak_price_5yr_computed_at: peakPrice5yr ? new Date().toISOString() : null,
        snapshot_date: today,
        last_fetched_at: new Date().toISOString(),
      }, { onConflict: 'ticker_or_sector,snapshot_date', ignoreDuplicates: true })

      // 300ms delay between tickers (yahoo-finance2 unofficial)
      await new Promise(r => setTimeout(r, 300))
    } catch (e) {
      console.error(`Failed to fetch ${ticker}:`, e)
      tickerData.push({ ticker, currentPrice: null, peakPrice5yr: null, shortPercentOfFloat: null, recommendationMean: null })
    }
  }

  // Compute industry-level Pain Index
  const painResult = aggregateTickersForIndustry(tickerData)
  const avgReturn1yr = returns.filter(r => r.return1yr !== null).reduce((a, b, i, arr) => a + b.return1yr! / arr.length, 0) || null

  // Compute 30-day velocity
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  const { data: oldSnapshot } = await serviceSupabase
    .from('market_snapshots')
    .select('pain_index')
    .eq('ticker_or_sector', industry.name)
    .lte('snapshot_date', thirtyDaysAgo)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single()

  const velocity = (painResult.painIndex !== null && oldSnapshot?.pain_index !== null && oldSnapshot?.pain_index !== undefined)
    ? painResult.painIndex - oldSnapshot.pain_index
    : null

  // Insert industry-level snapshot — ON CONFLICT DO NOTHING
  await serviceSupabase.from('market_snapshots').upsert({
    ticker_or_sector: industry.name,
    return_1yr: avgReturn1yr,
    return_3yr: null,
    short_interest: painResult.shortInterestRaw,
    analyst_consensus: painResult.analystRaw,
    pain_index: painResult.painIndex,
    snapshot_date: today,
    last_fetched_at: new Date().toISOString(),
  }, { onConflict: 'ticker_or_sector,snapshot_date', ignoreDuplicates: true })

  // Update denormalized columns on industries table
  await serviceSupabase
    .from('industries')
    .update({
      current_pain_index: painResult.painIndex,
      current_return_1yr: avgReturn1yr,
      current_return_3yr: null,
      current_snapshot_date: today,
      last_fetched_at: new Date().toISOString(),
      sentiment_velocity: velocity,
    })
    .eq('id', industry.id)

  return { painIndex: painResult.painIndex, velocity, tickers: tickers.length }
}
