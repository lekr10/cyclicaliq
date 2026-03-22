import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, ...updates } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Ensure RLS — only update rows the user owns
  const allowed = ['stage', 'thesis', 'key_companies', 'pain_index', 'ticker']
  const filtered: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in updates) filtered[key] = updates[key]
  }

  const { error } = await supabase
    .from('research_items')
    .update(filtered)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
