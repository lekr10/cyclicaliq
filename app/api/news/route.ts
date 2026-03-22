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

  // Fetch fresh from NewsAPI
  const apiKey = process.env.NEWS_API_KEY
  if (!apiKey) {
    // Return stale cached articles if API key missing
    const { data: stale } = await supabase
      .from('news_articles')
      .select('*')
      .eq('industry_id', industry_id)
      .order('published_at', { ascending: false })
      .limit(50)
    return NextResponse.json({ articles: stale ?? [], source: 'stale' })
  }

  const fromDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]
  const keywords = industry.news_keywords ?? industry.name
  const url = new URL('https://newsapi.org/v2/everything')
  url.searchParams.set('q', keywords)
  url.searchParams.set('from', fromDate)
  url.searchParams.set('sortBy', 'publishedAt')
  url.searchParams.set('pageSize', '50')
  url.searchParams.set('language', 'en')
  url.searchParams.set('apiKey', apiKey)

  const newsRes = await fetch(url.toString(), { next: { revalidate: 0 } })

  if (newsRes.status === 429) {
    // Daily limit hit — return last cached articles
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
    const { data: stale } = await supabase
      .from('news_articles')
      .select('*')
      .eq('industry_id', industry_id)
      .order('published_at', { ascending: false })
      .limit(50)
    return NextResponse.json({ articles: stale ?? [], source: 'stale', error: 'NewsAPI error' })
  }

  const newsData = await newsRes.json()
  const articles = newsData.articles ?? []

  if (articles.length > 0) {
    // Write to cache using service role (upsert with ON CONFLICT DO NOTHING via unique URL)
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toInsert = articles.map((a: any) => ({
      industry_id,
      title: a.title,
      url: a.url,
      source: a.source?.name ?? null,
      published_at: a.publishedAt ?? null,
      description: a.description ?? null,
      fetched_at: new Date().toISOString(),
    }))

    await serviceSupabase
      .from('news_articles')
      .upsert(toInsert, { onConflict: 'url', ignoreDuplicates: true })

    // Clean up articles older than 90 days
    const cutoff = new Date(Date.now() - 90 * 86400000).toISOString()
    await serviceSupabase
      .from('news_articles')
      .delete()
      .eq('industry_id', industry_id)
      .lt('published_at', cutoff)
  }

  // Return fresh articles from DB (consistent format)
  const { data: fresh } = await supabase
    .from('news_articles')
    .select('*')
    .eq('industry_id', industry_id)
    .order('published_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ articles: fresh ?? [], source: 'fresh' })
}
