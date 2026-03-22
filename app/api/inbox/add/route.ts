import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, type, industry_id, pain_index, ticker } = body

  if (!name || !type) {
    return NextResponse.json({ error: 'name and type required' }, { status: 400 })
  }

  // Check if already in inbox
  const { data: existing } = await supabase
    .from('research_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('name', name)
    .single()

  if (existing) {
    return NextResponse.json({ id: existing.id, alreadyExists: true })
  }

  const { data, error } = await supabase
    .from('research_items')
    .insert({
      user_id: user.id,
      name,
      type,
      industry_id: industry_id ?? null,
      pain_index: pain_index ?? null,
      ticker: ticker ?? null,
      stage: 'watching',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
