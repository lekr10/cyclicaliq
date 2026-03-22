import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const NEWS_CACHE_TTL_HOURS = 6

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const industry_id = request.nextUrl.searchParams.get('industry_id')
  const days = parseInt(request.nextUrl.searchParams.get('days') ?? '30')

  if (!industry_id) {
    return NextResponse.json({ error: 'industry_id required' }, { status: 400 })
  }

  // Get industry for keywords
  const { data: industry } = await supabase
    .from('industries')
    .select('id, name, news_keywords')
    .eq('id', industry_id)
    .single()

  if (!industry) {
    return NextResponse.json({ error: 'Industry not found' }, { status: 404 })
  }

  // Check cache freshness
  const cacheThreshold = new Date(Date.now() - NEWS_CACHE_TTL_HOURS * 3600000).toISOString()
  const { data: cached } = await supabase
    .from('news_articles')
    .select('*')
    .eq('industry_id', industry_id)
    .gte('fetched_at', cacheThreshold)
    .order('published_at', { ascending: false })
    .limit(50)

  if (cached && cached.length > 0) {
    return NextResponse.json({ articles: cached, source: 'cache' })
  }

  // Fetch fresh from GNews API
  // GNews free tier supports keyword search with date filtering (unlike NewsAPI free which is top-headlines only)
  const apiKey = process.env.GNEWS_API_KEY
  if (!apiKey) {
    const { data: stale } = await supabase
      .from('news_articles')
      .select('*')
      .eq('industry_id', industry_id)
      .order('published_at', { ascending: false })
      .limit(50)
    return NextResponse.json({ articles: stale ?? [], source: 'stale' })
  }

  const fromDate = new Date(Date.now() - days * 86400000).toISOString()
  const keywords = industry.news_keywords ?? industry.name
  const url = new URL('https://gnews.io/api/v4/search')
  url.searchParams.set('q', keywords)
  url.searchParams.set('lang', 'en')
  url.searchParams.set('max', '50')
  url.searchParams.set('from', fromDate)
  url.searchParams.set('sortby', 'publishedAt')
  url.searchParams.set('token', apiKey)

  const newsRes = await fetch(url.toString(), { next: { revalidate: 0 } })

  if (newsRes.status === 429) {
    console.error(`[news] GNews rate limited for industry ${industry.name}`)
    const { data: stale } = await supabase
      .from('news_articles')
      .select('*')
      .eq('industry_id', industry_id)
      .order('published_at', { ascending: false })
      .limit(50)
    return NextResponse.json(
      { articles: stale ?? [], source: 'stale', rateLimited: true },
      { status: 429 }
    )
  }

  if (!newsRes.ok) {
    console.error(`[news] GNews HTTP ${newsRes.status} for industry ${industry.name}`)
    const { data: stale } = await supabase
      .from('news_articles')
      .select('*')
      .eq('industry_id', industry_id)
      .order('published_at', { ascending: false })
      .limit(50)
    return NextResponse.json({ articles: stale ?? [], source: 'stale', error: 'GNews error' })
  }

  const newsData = await newsRes.json()
  if (newsData.errors) {
    console.error(`[news] GNews error for industry ${industry.name}:`, newsData.errors)
  } else {
    console.log(`[news] GNews OK for industry ${industry.name}: totalArticles=${newsData.totalArticles}, articles=${newsData.articles?.length ?? 0}`)
  }

  // GNews response shape: { totalArticles, articles: [{ title, description, content, url, publishedAt, source: { name, url } }] }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const articles = (newsData.articles ?? []).map((a: any) => ({
    industry_id,
    title: a.title,
    url: a.url,
    source: a.source?.name ?? null,
    published_at: a.publishedAt ?? null,
    description: a.description ?? null,
    fetched_at: new Date().toISOString(),
  }))

  if (articles.length > 0) {
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await serviceSupabase
      .from('news_articles')
      .upsert(articles, { onConflict: 'url', ignoreDuplicates: true })

    // Clean up articles older than 90 days
    const cutoff = new Date(Date.now() - 90 * 86400000).toISOString()
    await serviceSupabase
      .from('news_articles')
      .delete()
      .eq('industry_id', industry_id)
      .lt('published_at', cutoff)
  }

  // Return fresh articles from DB (consistent format)
  const { data: fresh, error: freshError } = await supabase
    .from('news_articles')
    .select('*')
    .eq('industry_id', industry_id)
    .order('published_at', { ascending: false })
    .limit(50)

  if (freshError) console.error(`[news] DB read error for industry ${industry.name}:`, freshError.message)
  console.log(`[news] Returning ${fresh?.length ?? 0} articles for industry ${industry.name}`)

  return NextResponse.json({ articles: fresh ?? [], source: 'fresh' })
}
