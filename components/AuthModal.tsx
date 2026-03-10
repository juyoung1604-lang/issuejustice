'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Step = 'email' | 'otp' | 'done'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AuthModal({ open, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setStep('email')
    setEmail('')
    setOtp('')
    setError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) return
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      })
      if (err) throw err
      setStep('otp')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '이메일 발송에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (otp.length < 6) return
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'email',
      })
      if (err) throw err
      setStep('done')
      setTimeout(() => {
        handleClose()
        onSuccess?.()
      }, 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '인증 코드가 올바르지 않습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[200] bg-gray-900/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-0 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                  시민신문고
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {step === 'done' ? '인증 완료!' : step === 'otp' ? '코드 입력' : '이메일로 로그인'}
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">
                {step === 'done'
                  ? '내 제보를 어디서든 확인할 수 있습니다.'
                  : step === 'otp'
                  ? `${email} 로 발송된 6자리 코드를 입력하세요.`
                  : '이메일 인증으로 기기에 관계없이 내 제보를 관리하세요.'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 transition-all shrink-0 ml-4"
            >
              <i className="ri-close-line text-lg" />
            </button>
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            {/* 완료 상태 */}
            {step === 'done' && (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-16 h-16 flex items-center justify-center bg-emerald-50 rounded-2xl">
                  <i className="ri-check-double-line text-3xl text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-emerald-600">로그인되었습니다</p>
              </div>
            )}

            {/* 이메일 입력 */}
            {step === 'email' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    이메일 주소
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    autoFocus
                    required
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-500 font-bold bg-red-50 px-4 py-3 rounded-xl">
                    <i className="ri-error-warning-line mr-1" />{error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-red-500 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:hover:bg-gray-900 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 발송 중...</>
                  ) : (
                    <><i className="ri-mail-send-line" /> 인증 코드 받기</>
                  )}
                </button>

                <p className="text-[10px] text-gray-400 text-center font-medium leading-relaxed">
                  가입 없이 이메일만으로 로그인됩니다.<br />개인정보는 제보 연결에만 사용됩니다.
                </p>
              </form>
            )}

            {/* OTP 입력 */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    6자리 인증 코드
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    autoFocus
                    inputMode="numeric"
                    maxLength={6}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl text-2xl font-black text-gray-900 text-center tracking-[0.5em] placeholder:text-gray-200 placeholder:tracking-normal focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-500 font-bold bg-red-50 px-4 py-3 rounded-xl">
                    <i className="ri-error-warning-line mr-1" />{error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-red-500 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:hover:bg-gray-900 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 확인 중...</>
                  ) : (
                    <><i className="ri-shield-check-line" /> 인증 확인</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp(''); setError('') }}
                  className="w-full py-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  이메일 다시 입력하기
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
