'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PainIndexBadge from '@/components/PainIndexBadge'
import VelocityBadge from '@/components/VelocityBadge'
import EmptyState from '@/components/EmptyState'
import { Toast, useToast } from '@/components/Toast'
import type { Industry } from '@/types'

interface ScannerClientProps {
  industries: Industry[]
  onRefreshAll: () => void
  refreshLoading: boolean
}

function StaleDataBadge({ lastFetchedAt }: { lastFetchedAt: string | null }) {
  if (!lastFetchedAt) return null
  const ageHours = (Date.now() - new Date(lastFetchedAt).getTime()) / 3600000
  if (ageHours <= 24) return null

  return (
    <span
      className="inline-flex items-center gap-1 text-xs text-slate-400"
      title={`Last updated ${new Date(lastFetchedAt).toLocaleString()}`}
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Stale
    </span>
  )
}

export default function ScannerClient({ industries }: { industries: Industry[] }) {
  const router = useRouter()
  const [refreshLoading, setRefreshLoading] = useState(false)
  const { toast, showToast, dismissToast } = useToast()

  async function handleRefreshAll() {
    setRefreshLoading(true)
    try {
      const res = await fetch('/api/cron/refresh-market-data', { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      showToast('Refresh started — takes a few minutes. Reload when done.')
    } catch {
      showToast('Failed to start refresh', 'error')
    } finally {
      setRefreshLoading(false)
    }
  }

  if (industries.length === 0) {
    return (
      <>
        <EmptyState
          message="No industries found — run the database migrations first."
          action={
            <button
              onClick={handleRefreshAll}
              disabled={refreshLoading}
              className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {refreshLoading ? 'Starting…' : 'Run First Refresh ▶'}
            </button>
          }
        />
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
      </>
    )
  }

  function getDaysOfHistory(industry: Industry): number {
    if (!industry.last_fetched_at) return 0
    return Math.floor((Date.now() - new Date(industry.last_fetched_at).getTime()) / 86400000)
  }

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm" aria-label="Most Distressed Industries by Pain Index">
          <caption className="sr-only">
            74 GICS industries ranked by Pain Index. Higher Pain Index = more distressed sector.
          </caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide w-10">#</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Industry</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Sector</th>
              <th scope="col" className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide w-44">Pain Index</th>
              <th scope="col" className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide w-20">1yr</th>
              <th scope="col" className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide w-20">3yr</th>
              <th scope="col" className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide w-24">30d Δ</th>
              <th scope="col" className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide w-16">ETF</th>
              <th scope="col" className="text-right px-4 py-3 w-24">
                <button
                  onClick={handleRefreshAll}
                  disabled={refreshLoading}
                  className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-40 transition-colors font-normal normal-case tracking-normal"
                >
                  {refreshLoading ? 'Refreshing…' : '↻ Refresh all'}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {industries.map((industry, idx) => (
              <tr
                key={industry.id}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => router.push(`/industry/${industry.id}`)}
                onKeyDown={e => e.key === 'Enter' && router.push(`/industry/${industry.id}`)}
                tabIndex={0}
                role="row"
                aria-label={`${industry.name}: Pain Index ${industry.current_pain_index ?? 'N/A'}`}
              >
                <td className="px-4 py-3 text-slate-400 tabular-nums text-xs">{idx + 1}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{industry.name}</div>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{industry.sector}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <StaleDataBadge lastFetchedAt={industry.last_fetched_at} />
                    <PainIndexBadge value={industry.current_pain_index} showBar={true} size="sm" />
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600 text-xs">
                  {industry.current_return_1yr !== null
                    ? `${industry.current_return_1yr > 0 ? '+' : ''}${industry.current_return_1yr.toFixed(1)}%`
                    : <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600 text-xs">
                  {industry.current_return_3yr !== null
                    ? `${industry.current_return_3yr > 0 ? '+' : ''}${industry.current_return_3yr.toFixed(1)}%`
                    : <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <VelocityBadge delta={industry.sentiment_velocity} daysOfHistory={getDaysOfHistory(industry)} />
                </td>
                <td className="px-4 py-3 text-right text-xs text-slate-400 font-mono">
                  {industry.etf_proxy ?? '—'}
                </td>
                <td className="px-4 py-3" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
    </>
  )
}
