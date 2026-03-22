import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import IndustryDetailClient from './IndustryDetailClient'
import type { Industry, NewsArticle, MacroSnapshot } from '@/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function IndustryDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [industryResult, newsResult, macroResult] = await Promise.all([
    supabase.from('industries').select('*').eq('id', id).single(),
    supabase
      .from('news_articles')
      .select('*')
      .eq('industry_id', id)
      .order('published_at', { ascending: false })
      .limit(50),
    supabase
      .from('macro_snapshots')
      .select('*')
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single(),
  ])

  if (industryResult.error || !industryResult.data) {
    notFound()
  }

  // Check if news cache is stale (> 6 hours)
  const latestArticle = newsResult.data?.[0]
  const newsCacheAge = latestArticle?.fetched_at
    ? (Date.now() - new Date(latestArticle.fetched_at).getTime()) / 3600000
    : Infinity
  const newsCacheStale = newsCacheAge > 6

  return (
    <>
      <Nav />
      <IndustryDetailClient
        industry={industryResult.data as Industry}
        cachedArticles={(newsResult.data as NewsArticle[]) ?? []}
        newsCacheStale={newsCacheStale}
        macroSnapshot={macroResult.data as MacroSnapshot | null}
      />
    </>
  )
}
