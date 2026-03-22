'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onDismiss: () => void
}

export function Toast({ message, type = 'info', duration = 3000, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  const bg = type === 'success' ? 'bg-slate-900' : type === 'error' ? 'bg-red-600' : 'bg-slate-700'

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${bg} text-white text-sm px-4 py-3 rounded-lg shadow-lg max-w-sm`} role="status">
      {message}
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null)

  function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    setToast({ message, type })
  }

  function dismissToast() {
    setToast(null)
  }

  return { toast, showToast, dismissToast }
}
