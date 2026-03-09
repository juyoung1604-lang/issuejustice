import { supabase } from '@/lib/supabase'
import type { Comment, CommentType } from '@/types'

export async function getComments(issueId: string, sort: 'support_count' | 'latest' = 'support_count'): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('issue_id', issueId)
    .is('parent_id', null)
    .eq('is_hidden', false)
    .order(sort, { ascending: false })

  if (error) throw error

  // Fetch replies
  const parentIds = data?.map(c => c.id) || []
  if (parentIds.length > 0) {
    const { data: replies, error: replyError } = await supabase
      .from('comments')
      .select('*')
      .in('parent_id', parentIds)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true })

    if (replyError) throw replyError

    return data.map(c => ({
      ...c,
      replies: replies.filter(r => r.parent_id === c.id)
    }))
  }

  return data ?? []
}

export async function createComment({
  issueId, userId, content, type, parentId
}: {
  issueId: string
  userId: string
  content: string
  type: CommentType
  parentId?: string
}): Promise<Comment> {
  // Get user nickname from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', userId)
    .single()

  const { data, error } = await supabase
    .from('comments')
    .insert({
      issue_id: issueId,
      user_id: userId,
      content,
      type,
      parent_id: parentId,
      author_nickname: profile?.nickname || '익명'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function toggleCommentSupport(commentId: string, userId: string): Promise<{ supported: boolean; support_count: number }> {
  // Check if already supported
  const { data: existing } = await supabase
    .from('comment_supports')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    // Remove support
    await supabase
      .from('comment_supports')
      .delete()
      .eq('id', existing.id)
  } else {
    // Add support
    await supabase
      .from('comment_supports')
      .insert({ comment_id: commentId, user_id: userId })
  }

  // Get updated count
  const { data: comment } = await supabase
    .from('comments')
    .select('support_count')
    .eq('id', commentId)
    .single()

  return { supported: !existing, support_count: comment?.support_count ?? 0 }
}
