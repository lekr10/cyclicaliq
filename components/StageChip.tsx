import type { Stage } from '@/types'

const STAGE_LABELS: Record<Stage, string> = {
  watching: 'Watching',
  researching: 'Researching',
  accumulating: 'Accumulating',
  full_position: 'Full Position',
  trimming: 'Trimming',
  exited: 'Exited',
}

const STAGE_STYLES: Record<Stage, string> = {
  watching: 'bg-slate-100 text-slate-600',
  researching: 'bg-blue-50 text-blue-700',
  accumulating: 'bg-amber-50 text-amber-800',
  full_position: 'bg-emerald-50 text-emerald-700',
  trimming: 'bg-orange-50 text-orange-700',
  exited: 'bg-slate-100 text-slate-400',
}

interface StageChipProps {
  stage: Stage
  onClick?: () => void
}

export const STAGES: Stage[] = ['watching', 'researching', 'accumulating', 'full_position', 'trimming', 'exited']

export default function StageChip({ stage, onClick }: StageChipProps) {
  const label = STAGE_LABELS[stage]
  const style = STAGE_STYLES[stage]

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style} hover:opacity-80 transition-opacity`}
      >
        {label}
      </button>
    )
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  )
}

export { STAGE_LABELS }
