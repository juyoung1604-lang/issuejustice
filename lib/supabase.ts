import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// 클라이언트 싱글톤 변수
let supabaseInstance: SupabaseClient | null = null
let supabaseAdminInstance: SupabaseClient | null = null

/**
 * 일반 사용자용 클라이언트 (싱글톤)
 */
export const supabase = (() => {
  if (supabaseInstance) return supabaseInstance
  
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: 'issuejustice-auth-token',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
  return supabaseInstance
})()

/**
 * 관리자용 클라이언트 (서버 사이드 전용 싱글톤)
 * 브라우저 환경에서는 생성을 차단하여 GoTrue 인스턴스 중복 경고 및 보안 위험을 방지합니다.
 */
export const supabaseAdmin = (() => {
  // 브라우저 환경이면 생성을 건너뛰거나 더미를 반환
  if (typeof window !== 'undefined') return null as unknown as SupabaseClient

  if (supabaseAdminInstance) return supabaseAdminInstance

  if (!supabaseServiceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is missing.')
    return supabase as SupabaseClient
  }

  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
  return supabaseAdminInstance
})()
