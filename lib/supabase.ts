import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

// 브라우저 환경에서 중복 생성을 방지하고, 
// supabaseAdmin의 경우 세션 지속성을 꺼서 GoTrue 충돌을 방지합니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false, // 관리자 클라이언트는 세션을 저장하지 않도록 설정 (브라우저 경고 해결)
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})
