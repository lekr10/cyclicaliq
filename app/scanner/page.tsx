import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import ScannerClient from './ScannerClient'
import type { Industry } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ScannerPage() {
  const supabase = await createClient()

  const { data: industries, error } = await supabase
    .from('industries')
    .select('*')
    .eq('is_active', true)
    .order('current_pain_index', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('Scanner load error:', error)
  }

  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Most Distressed Industries</h1>
            <p className="text-sm text-slate-500 mt-0.5">74 GICS industries ranked by Pain Index — updated nightly</p>
          </div>
        </div>
        <ScannerClient industries={(industries as Industry[]) ?? []} />
      </main>
    </>
  )
}
