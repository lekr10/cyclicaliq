'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PainIndexBadge from '@/components/PainIndexBadge'
import VelocityBadge from '@/components/VelocityBadge'
import EmptyState from '@/components/EmptyState'
import { Toast, useToast } from '@/components/Toast'
import type { Industry } from '@/types'

interface ScannerClientProps {
  industries: Industry[]
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

export default function ScannerClient({ industries }: ScannerClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [refreshingId, setRefreshingId] = useState<string | null>(null)
  const [firstRunLoading, setFirstRunLoading] = useState(false)
  const { toast, showToast, dismissToast } = useToast()

  const hasData = industries.length > 0

  async function handleRefresh(industry: Industry) {
    setRefreshingId(industry.id)
    try {
      const res = await fetch(`/api/refresh?industry_id=${industry.id}`, {
        method: 'POST',
        headers: {
          'x-cron-secret': '',  // client-side refresh uses session auth, not cron secret
        },
      })
      if (!res.ok) throw new Error('Refresh failed')
      startTransition(() => router.refresh())
      showToast('Data refreshed')
    } catch {
      showToast('Refresh failed — try again', 'error')
    } finally {
      setRefreshingId(null)
    }
  }

  async function handleFirstRun() {
    setFirstRunLoading(true)
    try {
      const res = await fetch('/api/cron/refresh-market-data', {
        method: 'POST',
        headers: { 'x-cron-secret': '' },
      })
      if (!res.ok) throw new Error('Failed')
      showToast('First refresh started — this takes a few minutes. Reload when done.')
    } catch {
      showToast('Failed to start refresh', 'error')
    } finally {
      setFirstRunLoading(false)
    }
  }

  if (!hasData) {
    return (
      <>
        <EmptyState
          message="Awaiting first data refresh — check back after the nightly run at 6pm ET, or run the first refresh manually."
          action={
            <button
              onClick={handleFirstRun}
              disabled={firstRunLoading}
              className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {firstRunLoading ? 'Starting…' : 'Run First Refresh ▶'}
            </button>
          }
        />
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
      </>
    )
  }

  // Compute daysOfHistory for velocity badge
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
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide w-10">
                #
              </th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                Industry
              </th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                Sector
              </th>
              <th scope="col" className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide w-44">
                Pain Index
              </th>
              <th scope="col" className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide w-20">
                1yr
              </th>
              <th scope="col" className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide w-20">
                3yr
              </th>
              <th scope="col" className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide w-24">
                30d Δ
              </th>
              <th scope="col" className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide w-16">
                ETF
              </th>
              <th scope="col" className="w-20 px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {industries.map((industry, idx) => (
              <tr
                key={industry.id}
                className="hover:bg-slate-50 cursor-pointer group transition-colors"
                onClick={() => router.push(`/industry/${industry.id}`)}
                onKeyDown={e => e.key === 'Enter' && router.push(`/industry/${industry.id}`)}
                tabIndex={0}
                role="row"
                aria-label={`${industry.name}: Pain Index ${industry.current_pain_index ?? 'N/A'}`}
              >
                <td className="px-4 py-3 text-slate-400 tabular-nums text-xs">
                  {idx + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{industry.name}</div>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {industry.sector}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <StaleDataBadge lastFetchedAt={industry.last_fetched_at} />
                    <PainIndexBadge value={industry.current_pain_index} showBar={true} size="sm" />
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600 text-xs">
                  {industry.current_return_1yr !== null
                    ? `${industry.current_return_1yr > 0 ? '+' : ''}${industry.current_return_1yr.toFixed(1)}%`
                    : <span className="text-slate-300">—</span>
                  }
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600 text-xs">
                  {industry.current_return_3yr !== null
                    ? `${industry.current_return_3yr > 0 ? '+' : ''}${industry.current_return_3yr.toFixed(1)}%`
                    : <span className="text-slate-300">—</span>
                  }
                </td>
                <td className="px-4 py-3 text-right">
                  <VelocityBadge
                    delta={industry.sentiment_velocity}
                    daysOfHistory={getDaysOfHistory(industry)}
                  />
                </td>
                <td className="px-4 py-3 text-right text-xs text-slate-400 font-mono">
                  {industry.etf_proxy ?? '—'}
                </td>
                <td
                  className="px-4 py-3 text-right"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleRefresh(industry)}
                    disabled={refreshingId === industry.id}
                    className="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-opacity"
                    aria-label={`Refresh ${industry.name}`}
                  >
                    {refreshingId === industry.id ? '…' : '↻'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />
      )}
    </>
  )
}
