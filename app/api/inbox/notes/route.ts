import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { item_id, content, pain_index_at_time, stage_at_time, macro_score_at_time } = body

  if (!item_id || !content) {
    return NextResponse.json({ error: 'item_id and content required' }, { status: 400 })
  }

  // Verify ownership via RLS (the insert policy checks research_items.user_id)
  const { data, error } = await supabase
    .from('research_notes')
    .insert({
      item_id,
      content,
      pain_index_at_time: pain_index_at_time ?? null,
      stage_at_time: stage_at_time ?? null,
      macro_score_at_time: macro_score_at_time ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
