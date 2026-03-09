import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data: issues, error } = await supabaseAdmin
    .from('issues')
    .select('status, is_published, support_count, field_category, region, enforcement_type, created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const total = issues?.length ?? 0
  const pending = issues?.filter(i => !i.is_published && i.status !== '종결').length ?? 0
  const totalSupport = issues?.reduce((sum, i) => sum + (i.support_count || 0), 0) ?? 0

  const statusCounts: Record<string, number> = {}
  const fieldCounts: Record<string, number> = {}
  const regionCounts: Record<string, number> = {}
  const typeCounts: Record<string, number> = {}

  issues?.forEach(i => {
    statusCounts[i.status] = (statusCounts[i.status] || 0) + 1
    fieldCounts[i.field_category] = (fieldCounts[i.field_category] || 0) + 1
    regionCounts[i.region] = (regionCounts[i.region] || 0) + 1
    typeCounts[i.enforcement_type] = (typeCounts[i.enforcement_type] || 0) + 1
  })

  return NextResponse.json({ total, pending, totalSupport, statusCounts, fieldCounts, regionCounts, typeCounts })
}
