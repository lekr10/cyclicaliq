interface VelocityBadgeProps {
  delta: number | null
  daysOfHistory: number
}

export default function VelocityBadge({ delta, daysOfHistory }: VelocityBadgeProps) {
  // Days 1-29: show "building history"
  if (daysOfHistory < 30 || delta === null) {
    return (
      <span
        className="text-xs text-slate-400"
        title="Sentiment velocity requires 30 days of history"
      >
        N/A
      </span>
    )
  }

  const isWorsening = delta > 0
  const isRecovering = delta < 0
  const isFlat = delta === 0

  if (isFlat) {
    return (
      <span
        className="text-xs text-slate-400 tabular-nums"
        title="30-day change in Pain Index. No change."
      >
        → 0
      </span>
    )
  }

  const arrow = isWorsening ? '↑' : '↓'
  const sign = isWorsening ? '+' : ''
  const colorClass = isWorsening ? 'text-amber-600' : 'text-emerald-600'

  return (
    <span
      className={`text-xs font-medium ${colorClass} tabular-nums`}
      title={`30-day change in Pain Index. ${isWorsening ? 'Positive = more distressed.' : 'Negative = recovering.'}`}
    >
      {arrow} {sign}{delta}
    </span>
  )
}
