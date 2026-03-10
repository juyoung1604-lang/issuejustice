import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

/**
 * 일반 사용자용 클라이언트 (익명 키)
 * 브라우저 인증 세션을 유지합니다.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'issuejustice-auth-token', // 명시적 키 지정으로 충돌 방지
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

/**
 * 관리자용 클라이언트 (서비스 롤 키)
 * 서버 사이드 전용이며, 브라우저에서 사용할 경우 세션을 저장하지 않습니다.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    // 관리자 클라이언트는 별도의 저장소를 사용하거나 아예 사용하지 않도록 설정
    storage: typeof window !== 'undefined' ? undefined : undefined 
  }
})
