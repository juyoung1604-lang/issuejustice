export type IssueStatus = '접수됨' | '검증중' | '공론화진행' | '기관전달' | '종결'
export type IssueConclusion = '개선' | '기각' | '보류'
export type CommentType = '사실보완' | '법률의견' | '일반' | '운영자코멘트'

export type EnforcementType = string
export type FieldCategory = string
export type SortOrder = 'latest' | 'support_count' | 'trending'

export interface IssueFilters {
  enforcement_type?: string
  field_category?: string
  status?: string
  region?: string
  q?: string
  sort?: SortOrder
  page?: string
}

export const ENFORCEMENT_TYPES = ['경찰', '검찰', '구청', '시청', '세무서', '기타']
export const FIELD_CATEGORIES = ['교통', '위생', '건축', '환경', '교육', '기타']

export interface Attachment {
  id: string
  issue_id: string
  file_url: string
  file_type: '판결문' | '처분서' | '공문' | '녹취요약' | '언론기사'
  original_name: string
  is_approved: boolean
  created_at: string
}

export interface Comment {
  id: string
  issue_id: string
  user_id: string
  parent_id?: string
  type: CommentType
  content: string
  author_nickname: string
  support_count: number
  is_hidden: boolean
  is_pinned: boolean
  created_at: string
  updated_at: string
  replies?: Comment[]
}

export const STATUS_CONFIG: Record<IssueStatus, { label: string; emoji: string }> = {
  '접수됨': { label: '접수됨', emoji: '📝' },
  '검증중': { label: '검증중', emoji: '🔍' },
  '공론화진행': { label: '공론화진행', emoji: '📣' },
  '기관전달': { label: '기관전달', emoji: '🏢' },
  '종결': { label: '종결', emoji: '✅' },
}
