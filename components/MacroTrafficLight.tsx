import type { MacroConditionResult } from '@/types'

interface MacroTrafficLightProps {
  score: number
  conditions: MacroConditionResult[]
  compact?: boolean
}

function statusDot(status: MacroConditionResult['status']) {
  if (status === 'met') return 'bg-emerald-500'
  if (status === 'watch') return 'bg-amber-500'
  if (status === 'not_met') return 'bg-slate-300'
  return 'bg-slate-200'
}

function statusLabel(status: MacroConditionResult['status']) {
  if (status === 'met') return 'Met'
  if (status === 'watch') return 'Watch'
  if (status === 'not_met') return 'Not met'
  return '—'
}

function overallLabel(score: number, total: number) {
  const ratio = score / total
  if (ratio >= 0.8) return 'Macro Aligning — Build Position'
  if (ratio >= 0.4) return 'Watch Closely'
  return 'Too Early'
}

export default function MacroTrafficLight({ score, conditions, compact = false }: MacroTrafficLightProps) {
  const total = conditions.length

  if (compact) {
    return (
      <div className="flex items-center gap-1.5" title={`Macro Match: ${score}/${total} conditions met`}>
        {conditions.map((c, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${statusDot(c.status)}`}
            title={`${c.label}: ${c.idealDesc} | Current: ${c.currentLabel}`}
          />
        ))}
        <span className="text-xs text-slate-500 ml-1">{score}/{total}</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Macro Match</span>
        <span className="text-sm font-bold text-slate-900">{score}/{total}</span>
      </div>

      <div className="space-y-2">
        {conditions.map((c, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot(c.status)}`} />
              <span className="text-slate-600 truncate">{c.label}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-slate-400 text-xs">{c.idealDesc}</span>
              <span className="text-slate-900 tabular-nums text-xs w-16 text-right">
                {c.currentLabel}
              </span>
              <span className={`text-xs w-14 text-right ${
                c.status === 'met' ? 'text-emerald-600' :
                c.status === 'watch' ? 'text-amber-600' : 'text-slate-400'
              }`}>
                {statusLabel(c.status)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={`text-xs font-medium mt-2 ${
        score / total >= 0.8 ? 'text-emerald-600' :
        score / total >= 0.4 ? 'text-amber-600' : 'text-slate-400'
      }`}>
        {overallLabel(score, total)}
      </div>
    </div>
  )
}
