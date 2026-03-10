'use client'

import { useState, useEffect } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  /** 로그인된 경우 user.id, 아닌 경우 localStorage deviceToken */
  submitterToken: string
}

export function useAuth(): AuthState & {
  signOut: () => Promise<void>
} {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [deviceToken, setDeviceToken] = useState('')

  useEffect(() => {
    let token = localStorage.getItem('sinmungo_device_token')
    if (!token) {
      token = crypto.randomUUID()
      localStorage.setItem('sinmungo_device_token', token)
    }
    setDeviceToken(token)

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return {
    user,
    session,
    loading,
    submitterToken: user?.id ?? deviceToken,
    signOut,
  }
}
