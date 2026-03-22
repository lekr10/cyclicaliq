'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PainIndexBadge from '@/components/PainIndexBadge'
import VelocityBadge from '@/components/VelocityBadge'
import { Toast, useToast } from '@/components/Toast'
import type { Industry, NewsArticle, MacroSnapshot } from '@/types'

interface Props {
  industry: Industry
  cachedArticles: NewsArticle[]
  newsCacheStale: boolean
  macroSnapshot: MacroSnapshot | null
}

function ArticleCard({ article }: { article: NewsArticle }) {
  const published = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  const isWSJ = article.source?.toLowerCase().includes('wall street journal') ||
                article.source?.toLowerCase().includes('wsj')

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {article.source}
            </span>
            {isWSJ && (
              <span className="text-xs text-slate-400">(headline only)</span>
            )}
            {published && (
              <span className="text-xs text-slate-400">{published}</span>
            )}
          </div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-slate-900 hover:text-slate-600 leading-snug block"
          >
            {article.title}
          </a>
          {article.description && (
            <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
              {article.description}
            </p>
          )}
        </div>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition-colors"
          aria-label="Open article"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  )
}

export default function IndustryDetailClient({ industry, cachedArticles, newsCacheStale, macroSnapshot }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [articles, setArticles] = useState<NewsArticle[]>(cachedArticles)
  const [newsLoading, setNewsLoading] = useState(false)
  const [newsError, setNewsError] = useState<string | null>(null)
  const [addedToInbox, setAddedToInbox] = useState(false)
  const [addingToInbox, setAddingToInbox] = useState(false)
  const [timeWindow, setTimeWindow] = useState<'7' | '30' | '90' | '365'>('30')
  const { toast, showToast, dismissToast } = useToast()

  // Compute days of history for velocity
  const daysOfHistory = industry.last_fetched_at
    ? Math.floor((Date.now() - new Date(industry.last_fetched_at).getTime()) / 86400000)
    : 0

  async function fetchNews() {
    setNewsLoading(true)
    setNewsError(null)
    try {
      const res = await fetch(`/api/news?industry_id=${industry.id}&days=${timeWindow}`)
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 429) {
          setNewsError('Daily news limit reached — resets midnight UTC. Showing last cached articles.')
        } else {
          setNewsError('News unavailable — showing last cached articles.')
        }
        return
      }
      setArticles(data.articles ?? [])
    } catch {
      setNewsError('News unavailable — showing last cached articles.')
    } finally {
      setNewsLoading(false)
    }
  }

  async function handleAddToInbox() {
    setAddingToInbox(true)
    try {
      const res = await fetch('/api/inbox/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: industry.name,
          type: 'industry',
          industry_id: industry.id,
          pain_index: industry.current_pain_index,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setAddedToInbox(true)
      showToast('Added to Inbox')
    } catch {
      showToast('Failed to add to inbox', 'error')
    } finally {
      setAddingToInbox(false)
    }
  }

  // Pain Index component breakdown (from industry denormalized data)
  const painIndex = industry.current_pain_index

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      {/* Back */}
      <Link
        href="/scanner"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Scanner
      </Link>

      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{industry.name}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {industry.sector}
              {industry.etf_proxy && (
                <> · Tradeable via <span className="font-mono">{industry.etf_proxy}</span> ({industry.etf_proxy_name})</>
              )}
            </p>
          </div>
          <div className="text-right">
            <PainIndexBadge value={painIndex} size="lg" />
            <div className="text-xs text-slate-400 mt-1">Pain Index</div>
          </div>
        </div>

        {/* Returns + velocity row */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          {industry.current_return_1yr !== null && (
            <div>
              <span className="text-slate-400 mr-1.5">1yr</span>
              <span className="text-slate-900 tabular-nums font-medium">
                {industry.current_return_1yr > 0 ? '+' : ''}{industry.current_return_1yr.toFixed(1)}%
              </span>
            </div>
          )}
          {industry.current_return_3yr !== null && (
            <div>
              <span className="text-slate-400 mr-1.5">3yr</span>
              <span className="text-slate-900 tabular-nums font-medium">
                {industry.current_return_3yr > 0 ? '+' : ''}{industry.current_return_3yr.toFixed(1)}%
              </span>
            </div>
          )}
          <div>
            <span className="text-slate-400 mr-1.5">30d sentiment</span>
            <VelocityBadge delta={industry.sentiment_velocity} daysOfHistory={daysOfHistory} />
          </div>
          {industry.last_fetched_at && (
            <div className="text-slate-400 text-xs">
              Updated {new Date(industry.last_fetched_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column: News + cyclical drivers */}
        <div className="col-span-2 space-y-6">
          {/* News feed */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Recent Coverage</h2>
              <div className="flex items-center gap-3">
                <select
                  id="news-time-window"
                  name="newsTimeWindow"
                  value={timeWindow}
                  onChange={e => setTimeWindow(e.target.value as typeof timeWindow)}
                  className="text-xs border border-slate-200 rounded px-2 py-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
                <button
                  onClick={fetchNews}
                  disabled={newsLoading}
                  className="text-xs text-slate-500 hover:text-slate-900 disabled:opacity-40 transition-colors"
                >
                  {newsLoading ? 'Loading…' : newsCacheStale ? 'Refresh ↻' : 'Load ↻'}
                </button>
              </div>
            </div>

            {newsError && (
              <div className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                {newsError}
              </div>
            )}

            {newsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse h-16 bg-slate-100 rounded-lg" />
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="text-sm text-slate-400 text-center py-8">
                No recent coverage found for {industry.name}. Try expanding the time window.
              </div>
            ) : (
              <div className="space-y-3">
                {articles.slice(0, 20).map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {articles.length > 0 && (
              <p className="text-xs text-slate-400 mt-3">
                As of {articles[0]?.fetched_at ? new Date(articles[0].fetched_at).toLocaleString() : 'unknown'}
              </p>
            )}
          </div>

          {/* Cyclical drivers */}
          {industry.cyclical_drivers && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">Cyclical Drivers</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{industry.cyclical_drivers}</p>
            </div>
          )}
        </div>

        {/* Right column: Macro + constituents */}
        <div className="space-y-4">
          {/* Pain Index snapshot */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Pain Index</h2>
            <div className="text-center mb-4">
              <PainIndexBadge value={painIndex} size="lg" />
              <div className="text-xs text-slate-400 mt-1">out of 100</div>
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Drawdown (60%)</span>
                <span className="text-slate-700">primary signal</span>
              </div>
              <div className="flex justify-between">
                <span>Short Interest (25%)</span>
                <span className="text-slate-700">best-effort</span>
              </div>
              <div className="flex justify-between">
                <span>Analyst Consensus (15%)</span>
                <span className="text-slate-700">best-effort</span>
              </div>
            </div>
          </div>

          {/* Macro snapshot */}
          {macroSnapshot && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Current Macro</h2>
              <div className="space-y-2 text-sm">
                {macroSnapshot.fed_funds_rate !== null && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fed Funds</span>
                    <span className="text-slate-900 tabular-nums">{macroSnapshot.fed_funds_rate.toFixed(2)}%</span>
                  </div>
                )}
                {macroSnapshot.cpi_yoy !== null && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">CPI YoY</span>
                    <span className="text-slate-900 tabular-nums">{macroSnapshot.cpi_yoy.toFixed(1)}%</span>
                  </div>
                )}
                {macroSnapshot.unemployment_rate !== null && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Unemployment</span>
                    <span className="text-slate-900 tabular-nums">{macroSnapshot.unemployment_rate.toFixed(1)}%</span>
                  </div>
                )}
                {macroSnapshot.yield_10yr !== null && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">10yr Yield</span>
                    <span className="text-slate-900 tabular-nums">{macroSnapshot.yield_10yr.toFixed(2)}%</span>
                  </div>
                )}
                {macroSnapshot.yield_curve_spread !== null && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Yield Curve</span>
                    <span className={`tabular-nums ${macroSnapshot.yield_curve_spread >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {macroSnapshot.yield_curve_spread > 0 ? '+' : ''}{macroSnapshot.yield_curve_spread.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-3">
                As of {new Date(macroSnapshot.snapshot_date).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Key constituents */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Representative Stocks</h2>
            <div className="flex flex-wrap gap-2">
              {industry.constituents.map(ticker => (
                <a
                  key={ticker}
                  href={`https://www.tradingview.com/chart/?symbol=${ticker}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                >
                  {ticker}
                </a>
              ))}
            </div>
            {industry.etf_proxy && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Tradeable via{' '}
                  <a
                    href={`https://www.tradingview.com/chart/?symbol=${industry.etf_proxy}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-slate-900 hover:underline"
                  >
                    {industry.etf_proxy}
                  </a>
                  {industry.etf_proxy_name && ` (${industry.etf_proxy_name})`}
                </p>
              </div>
            )}
          </div>

          {/* Add to Inbox CTA */}
          <div className="sticky bottom-4">
            <button
              onClick={handleAddToInbox}
              disabled={addingToInbox || addedToInbox}
              className="w-full bg-slate-900 text-white text-sm font-medium py-3 rounded-xl hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {addedToInbox ? '✓ In Inbox' : addingToInbox ? 'Adding…' : '+ Add to Inbox'}
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
    </main>
  )
}
