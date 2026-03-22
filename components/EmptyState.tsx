import type { ReactNode } from 'react'

interface EmptyStateProps {
  message: string
  action?: ReactNode
}

export default function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-slate-500 text-sm max-w-sm leading-relaxed">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
