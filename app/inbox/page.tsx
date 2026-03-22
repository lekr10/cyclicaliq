import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import InboxClient from './InboxClient'
import type { ResearchItem, MacroSnapshot } from '@/types'

export const dynamic = 'force-dynamic'

export default async function InboxPage() {
  const supabase = await createClient()

  const [itemsResult, macroResult] = await Promise.all([
    supabase
      .from('research_items')
      .select(`
        *,
        catalysts(*),
        research_notes(id, content, pain_index_at_time, stage_at_time, macro_score_at_time, created_at),
        macro_backdrops(*)
      `)
      .order('pain_index', { ascending: false }),
    supabase
      .from('macro_snapshots')
      .select('*')
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single(),
  ])

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <InboxClient
          items={(itemsResult.data as ResearchItem[]) ?? []}
          macroSnapshot={macroResult.data as MacroSnapshot | null}
        />
      </main>
    </>
  )
}
