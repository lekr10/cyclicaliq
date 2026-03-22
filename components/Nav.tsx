'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isScanner = pathname === '/scanner' || pathname.startsWith('/industry')
  const isInbox = pathname === '/inbox'

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Wordmark */}
        <Link href="/scanner" className="text-slate-900 font-semibold text-base tracking-tight">
          CyclicalIQ
        </Link>

        {/* Nav tabs */}
        <nav className="flex items-center gap-1" role="navigation" aria-label="Main navigation">
          <Link
            href="/scanner"
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isScanner
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
            aria-current={isScanner ? 'page' : undefined}
          >
            Scanner
          </Link>
          <Link
            href="/inbox"
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isInbox
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
            aria-current={isInbox ? 'page' : undefined}
          >
            Inbox
          </Link>
        </nav>

        {/* User */}
        <button
          onClick={handleSignOut}
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Sign out"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
