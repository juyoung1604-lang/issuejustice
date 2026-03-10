import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Next.js 개발 환경에서 글로벌 객체에 인스턴스를 저장하여 중복 생성을 방지합니다.
const globalForSupabase = globalThis as unknown as {
  supabase: SupabaseClient | undefined
  supabaseAdmin: SupabaseClient | undefined
}

/**
 * 일반 사용자용 클라이언트
 */
export const supabase = 
  globalForSupabase.supabase ?? 
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: 'issuejustice-auth-token',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })

if (process.env.NODE_ENV !== 'production') globalForSupabase.supabase = supabase

/**
 * 관리자용 클라이언트 (서버 전용)
 */
export const supabaseAdmin = (() => {
  // 브라우저에서는 인스턴스 생성 및 경고 발생을 원천 차단
  if (typeof window !== 'undefined') return null as unknown as SupabaseClient

  if (globalForSupabase.supabaseAdmin) return globalForSupabase.supabaseAdmin

  const client = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })

  if (process.env.NODE_ENV !== 'production') globalForSupabase.supabaseAdmin = client
  return client
})()
