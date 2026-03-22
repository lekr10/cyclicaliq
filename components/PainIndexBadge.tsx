interface PainIndexBadgeProps {
  value: number | null
  showBar?: boolean
  size?: 'sm' | 'md' | 'lg'
}

function getPainColor(value: number): string {
  if (value >= 80) return 'text-amber-800'
  if (value >= 50) return 'text-amber-600'
  return 'text-slate-400'
}

function getPainBarColor(value: number): string {
  if (value >= 80) return 'bg-amber-800'
  if (value >= 50) return 'bg-amber-600'
  return 'bg-slate-300'
}

export default function PainIndexBadge({ value, showBar = false, size = 'md' }: PainIndexBadgeProps) {
  if (value === null) {
    return <span className="text-slate-300 tabular-nums">—</span>
  }

  const colorClass = getPainColor(value)
  const barColor = getPainBarColor(value)
  const textSize = size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-base' : 'text-2xl'

  return (
    <div className="flex items-center gap-3">
      <span
        className={`${textSize} font-bold ${colorClass} tabular-nums`}
        title={`Pain Index: ${value}/100`}
      >
        {value}
      </span>
      {showBar && (
        <div
          className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[80px]"
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Pain Index: ${value}`}
        >
          <div
            className={`h-full ${barColor} rounded-full transition-all`}
            style={{ width: `${value}%` }}
          />
        </div>
      )}
    </div>
  )
}
