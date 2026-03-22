'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PainIndexBadge from '@/components/PainIndexBadge'
import VelocityBadge from '@/components/VelocityBadge'
import StageChip, { STAGES, STAGE_LABELS } from '@/components/StageChip'
import MacroTrafficLight from '@/components/MacroTrafficLight'
import EmptyState from '@/components/EmptyState'
import { Toast, useToast } from '@/components/Toast'
import { buildAiBriefPrompt } from '@/lib/ai-brief'
import { computeMacroMatch } from '@/lib/macro-match'
import type { ResearchItem, MacroSnapshot, Stage, Catalyst } from '@/types'

interface InboxClientProps {
  items: ResearchItem[]
  macroSnapshot: MacroSnapshot | null
}

function CatalystList({ catalysts }: { catalysts: Catalyst[] }) {
  const upcoming = catalysts
    .filter(c => c.event_date && new Date(c.event_date) >= new Date())
    .sort((a, b) => new Date(a.event_date!).getTime() - new Date(b.event_date!).getTime())
    .slice(0, 3)

  const past = catalysts
    .filter(c => c.event_date && new Date(c.event_date) < new Date())
    .slice(0, 2)

  if (catalysts.length === 0) return null

  return (
    <div className="mt-3 space-y-1">
      {upcoming.map(c => (
        <div key={c.id} className="flex items-center gap-2 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
          <span className="text-slate-600">{c.title}</span>
          {c.event_date && (
            <span className="text-slate-400 ml-auto flex-shrink-0">
              {new Date(c.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      ))}
      {past.map(c => (
        <div key={c.id} className="flex items-center gap-2 text-xs opacity-50">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
          <span className="text-slate-500 line-through">{c.title}</span>
          <span className="text-slate-400 ml-auto flex-shrink-0">Passed</span>
        </div>
      ))}
    </div>
  )
}

function ResearchCard({
  item,
  macroSnapshot,
  onStageChange,
  onNoteAdd,
  onCatalystAdd,
  onDelete,
  onThesisUpdate,
}: {
  item: ResearchItem
  macroSnapshot: MacroSnapshot | null
  onStageChange: (id: string, stage: Stage) => void
  onNoteAdd: (id: string, content: string) => void
  onCatalystAdd: (id: string, title: string, date: string, impact: string) => void
  onDelete: (id: string) => void
  onThesisUpdate: (id: string, thesis: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showStageMenu, setShowStageMenu] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [showCatalystForm, setShowCatalystForm] = useState(false)
  const [showThesisEdit, setShowThesisEdit] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [thesisContent, setThesisContent] = useState(item.thesis ?? '')
  const [catalystTitle, setCatalystTitle] = useState('')
  const [catalystDate, setCatalystDate] = useState('')
  const [catalystImpact, setCatalystImpact] = useState('unknown')
  const [briefModalContent, setBriefModalContent] = useState<string | null>(null)
  const [briefLoading, setBriefLoading] = useState(false)
  const { toast, showToast, dismissToast } = useToast()

  const { score: macroScore, conditions: macroConditions } = computeMacroMatch(
    item.macro_backdrop,
    macroSnapshot
  )

  const notes = (item.notes ?? []).slice().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  async function handleBriefClick() {
    setBriefLoading(true)
    await new Promise(r => setTimeout(r, 200)) // "Assembling…" UX
    const prompt = buildAiBriefPrompt(item, macroSnapshot, macroScore)

    try {
      await navigator.clipboard.writeText(prompt)
      showToast('Copied! Paste into Claude.ai')
    } catch {
      // Clipboard API unavailable — show fallback modal
      setBriefModalContent(prompt)
    } finally {
      setBriefLoading(false)
    }
  }

  const daysOfHistory = item.updated_at
    ? Math.floor((Date.now() - new Date(item.created_at).getTime()) / 86400000)
    : 0

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Card header — always visible */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <PainIndexBadge value={item.pain_index} size="md" />
              <h2 className="text-base font-medium text-slate-900 truncate">{item.name}</h2>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <div className="relative">
                <StageChip stage={item.stage} onClick={() => setShowStageMenu(v => !v)} />
                {showStageMenu && (
                  <div className="absolute z-10 top-7 left-0 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[160px]">
                    {STAGES.map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          onStageChange(item.id, s)
                          setShowStageMenu(false)
                        }}
                        className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 transition-colors ${s === item.stage ? 'font-medium text-slate-900' : 'text-slate-600'}`}
                      >
                        {STAGE_LABELS[s]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <VelocityBadge delta={null} daysOfHistory={daysOfHistory} />
              {macroConditions.length > 0 && (
                <MacroTrafficLight score={macroScore} conditions={macroConditions} compact={true} />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleBriefClick}
              disabled={briefLoading}
              className="text-xs text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
            >
              {briefLoading ? 'Assembling…' : 'AI Brief'}
            </button>
            <button
              onClick={() => setExpanded(v => !v)}
              className="text-slate-400 hover:text-slate-700 transition-colors"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Thesis snippet */}
        {item.thesis && !expanded && (
          <p className="text-sm text-slate-600 mt-3 leading-relaxed line-clamp-2">{item.thesis}</p>
        )}

        {/* Next catalyst */}
        {!expanded && item.catalysts && item.catalysts.length > 0 && (
          <CatalystList catalysts={item.catalysts} />
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-100 divide-y divide-slate-100">
          {/* Thesis editor */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Thesis</h3>
              <button
                onClick={() => setShowThesisEdit(v => !v)}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                {showThesisEdit ? 'Cancel' : 'Edit'}
              </button>
            </div>
            {showThesisEdit ? (
              <div className="space-y-2">
                <textarea
                  value={thesisContent}
                  onChange={e => setThesisContent(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                  rows={4}
                  placeholder="Write your investment thesis..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { onThesisUpdate(item.id, thesisContent); setShowThesisEdit(false) }}
                    className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowThesisEdit(false)}
                    className="text-xs text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.thesis ?? <span className="text-slate-300">No thesis yet — click Edit to add one.</span>}
              </p>
            )}
          </div>

          {/* Macro backdrop */}
          {macroConditions.length > 0 && (
            <div className="p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Macro Match</h3>
              <MacroTrafficLight score={macroScore} conditions={macroConditions} />
              {item.macro_backdrop?.notes && (
                <p className="text-xs text-slate-500 mt-2 italic">{item.macro_backdrop.notes}</p>
              )}
            </div>
          )}

          {/* Catalysts */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Catalysts</h3>
              <button
                onClick={() => setShowCatalystForm(v => !v)}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                + Add
              </button>
            </div>

            {showCatalystForm && (
              <div className="mb-3 p-3 bg-slate-50 rounded-lg space-y-2">
                <input
                  value={catalystTitle}
                  onChange={e => setCatalystTitle(e.target.value)}
                  placeholder="Catalyst title (e.g. IAEA Annual Report)"
                  className="w-full text-sm border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={catalystDate}
                    onChange={e => setCatalystDate(e.target.value)}
                    className="flex-1 text-sm border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <select
                    value={catalystImpact}
                    onChange={e => setCatalystImpact(e.target.value)}
                    className="text-sm border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="unknown">Unknown</option>
                    <option value="bullish">Bullish</option>
                    <option value="bearish">Bearish</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!catalystTitle) return
                      onCatalystAdd(item.id, catalystTitle, catalystDate, catalystImpact)
                      setCatalystTitle(''); setCatalystDate(''); setCatalystImpact('unknown')
                      setShowCatalystForm(false)
                    }}
                    className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowCatalystForm(false)}
                    className="text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {item.catalysts && item.catalysts.length > 0 ? (
              <CatalystList catalysts={item.catalysts} />
            ) : (
              <p className="text-xs text-slate-400">No catalysts recorded.</p>
            )}
          </div>

          {/* Notes */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Research Notes</h3>
              <button
                onClick={() => setShowNoteForm(v => !v)}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                + Add note
              </button>
            </div>

            {showNoteForm && (
              <div className="mb-3 space-y-2">
                <textarea
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="Add a research note — Pain Index and macro score will be auto-captured..."
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!noteContent.trim()) return
                      onNoteAdd(item.id, noteContent)
                      setNoteContent('')
                      setShowNoteForm(false)
                    }}
                    className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowNoteForm(false)}
                    className="text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {notes.length > 0 ? (
              <div className="space-y-3">
                {notes.slice(0, 5).map(note => (
                  <div key={note.id} className="text-sm">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-slate-400">
                        {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      {note.pain_index_at_time !== null && (
                        <span className="text-xs text-amber-600 tabular-nums">PI:{note.pain_index_at_time}</span>
                      )}
                      {note.stage_at_time && (
                        <span className="text-xs text-slate-400">·{note.stage_at_time.replace('_', ' ')}</span>
                      )}
                    </div>
                    <p className="text-slate-600 leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No notes yet.</p>
            )}
          </div>

          {/* Delete */}
          <div className="p-4 flex justify-end">
            <button
              onClick={() => onDelete(item.id)}
              className="text-xs text-slate-400 hover:text-red-600 transition-colors"
            >
              Remove from Inbox
            </button>
          </div>
        </div>
      )}

      {/* AI Brief fallback modal */}
      {briefModalContent && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">AI Brief Prompt</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Clipboard unavailable — copy manually</span>
                <button
                  onClick={() => setBriefModalContent(null)}
                  className="text-slate-400 hover:text-slate-700"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                {briefModalContent}
              </pre>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
    </div>
  )
}

export default function InboxClient({ items: initialItems, macroSnapshot }: InboxClientProps) {
  const router = useRouter()
  const [items, setItems] = useState<ResearchItem[]>(initialItems)
  const [stageFilter, setStageFilter] = useState<Stage | 'all'>('all')
  const { toast, showToast, dismissToast } = useToast()

  const filtered = stageFilter === 'all'
    ? items
    : items.filter(i => i.stage === stageFilter)

  const handleStageChange = useCallback(async (id: string, stage: Stage) => {
    // Optimistic update
    setItems(prev => prev.map(i => i.id === id ? { ...i, stage } : i))

    try {
      const res = await fetch('/api/inbox/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stage }),
      })
      if (!res.ok) {
        // Revert
        setItems(initialItems)
        showToast('Save failed — stage not updated. Try again.', 'error')
      }
    } catch {
      setItems(initialItems)
      showToast('Save failed — stage not updated. Try again.', 'error')
    }
  }, [initialItems, showToast])

  const handleNoteAdd = useCallback(async (id: string, content: string) => {
    const item = items.find(i => i.id === id)
    try {
      const res = await fetch('/api/inbox/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: id,
          content,
          pain_index_at_time: item?.pain_index,
          stage_at_time: item?.stage,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      // Refresh data
      router.refresh()
      showToast('Note saved')
    } catch {
      showToast('Failed to save note', 'error')
    }
  }, [items, router, showToast])

  const handleCatalystAdd = useCallback(async (id: string, title: string, date: string, impact: string) => {
    try {
      const res = await fetch('/api/inbox/catalysts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: id, title, event_date: date || null, expected_impact: impact }),
      })
      if (!res.ok) throw new Error('Failed')
      router.refresh()
      showToast('Catalyst added')
    } catch {
      showToast('Failed to add catalyst', 'error')
    }
  }, [router, showToast])

  const handleDelete = useCallback(async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    try {
      await fetch(`/api/inbox/remove?id=${id}`, { method: 'DELETE' })
    } catch {
      setItems(initialItems)
      showToast('Failed to remove item', 'error')
    }
  }, [initialItems, showToast])

  const handleThesisUpdate = useCallback(async (id: string, thesis: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, thesis } : i))
    try {
      const res = await fetch('/api/inbox/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, thesis }),
      })
      if (!res.ok) throw new Error('Failed')
      showToast('Thesis saved')
    } catch {
      showToast('Failed to save thesis', 'error')
    }
  }, [showToast])

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Research Inbox</h1>
        <select
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value as Stage | 'all')}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
          aria-label="Filter by stage"
        >
          <option value="all">All Stages</option>
          {STAGES.map(s => (
            <option key={s} value={s}>{STAGE_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          message="Find a distressed industry in the Scanner and add it. The most uncomfortable trade is usually the best one."
          action={
            <Link
              href="/scanner"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Go to Scanner →
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(item => (
            <ResearchCard
              key={item.id}
              item={item}
              macroSnapshot={macroSnapshot}
              onStageChange={handleStageChange}
              onNoteAdd={handleNoteAdd}
              onCatalystAdd={handleCatalystAdd}
              onDelete={handleDelete}
              onThesisUpdate={handleThesisUpdate}
            />
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
    </>
  )
}
