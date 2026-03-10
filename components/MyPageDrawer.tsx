'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

interface MyIssue {
  id: string
  title: string
  status: string
  is_published: boolean
  overview: string
  sense: string
  requests: string[]
  supplement_note: string
  withdrawal_requested: boolean
  created_at: string
  region: string
  enforcement_type: string
}

interface Props {
  open: boolean
  onClose: () => void
  deviceToken?: string
}

type Screen = 'list' | 'detail' | 'login-email' | 'login-otp'

const STATUS_STYLE: Record<string, string> = {
  '접수됨': 'bg-amber-50 text-amber-700 border-amber-200',
  '검증중': 'bg-blue-50 text-blue-700 border-blue-200',
  '공론화진행': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '기관전달': 'bg-orange-50 text-orange-700 border-orange-200',
  '종결': 'bg-gray-50 text-gray-500 border-gray-200',
}

export default function MyPageDrawer({ open, onClose }: Props) {
  const { user, submitterToken, signOut, loading: authLoading } = useAuth()
  const [screen, setScreen] = useState<Screen>('list')
  const [issues, setIssues] = useState<MyIssue[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<MyIssue | null>(null)
  const [toast, setToast] = useState('')
  const [activeAction, setActiveAction] = useState<'supplement' | 'edit' | null>(null)
  const [supplementText, setSupplementText] = useState('')
  const [editOverview, setEditOverview] = useState('')
  const [editSense, setEditSense] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [withdrawConfirm, setWithdrawConfirm] = useState(false)

  // Inline login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginOtp, setLoginOtp] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const fetchIssues = useCallback(async () => {
    if (!submitterToken) return
    setLoading(true)
    try {
      const res = await fetch(`/api/my-issues?token=${submitterToken}`)
      const json = await res.json()
      if (json.data) setIssues(json.data)
    } catch {
      showToast('목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [submitterToken])

  useEffect(() => {
    if (open) {
      if (!authLoading) {
        if (user) {
          fetchIssues()
          setScreen('list')
        } else {
          setScreen('login-email')
          setLoginEmail('')
          setLoginOtp('')
          setLoginError('')
        }
      }
    }
  }, [open, user, authLoading, fetchIssues])

  const openDetail = (issue: MyIssue) => {
    setSelectedIssue(issue)
    setScreen('detail')
    setActiveAction(null)
    setSupplementText('')
    setEditOverview(issue.overview)
    setEditSense(issue.sense)
    setWithdrawConfirm(false)
  }

  const handleSupplement = async () => {
    if (!selectedIssue || !supplementText.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/my-issues/${selectedIssue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: submitterToken, action: 'supplement', data: { note: supplementText } }),
      })
      const json = await res.json()
      if (json.ok) {
        showToast('보완 내용이 추가되었습니다.')
        setActiveAction(null)
        setSupplementText('')
        await fetchIssues()
        const updated = issues.find(i => i.id === selectedIssue.id)
        if (updated) setSelectedIssue(updated)
      } else {
        showToast(json.error || '오류가 발생했습니다.')
      }
    } catch {
      showToast('오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedIssue) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/my-issues/${selectedIssue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: submitterToken, action: 'edit', data: { overview: editOverview, sense: editSense } }),
      })
      const json = await res.json()
      if (json.ok) {
        showToast('내용이 수정되었습니다.')
        setActiveAction(null)
        await fetchIssues()
      } else {
        showToast(json.error || '오류가 발생했습니다.')
      }
    } catch {
      showToast('오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWithdraw = async () => {
    if (!selectedIssue) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/my-issues/${selectedIssue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: submitterToken, action: 'withdraw', data: {} }),
      })
      const json = await res.json()
      if (json.ok) {
        if (json.deleted) {
          showToast('제보가 삭제되었습니다.')
        } else {
          showToast('철회 요청이 접수되었습니다. 관리자 검토 후 처리됩니다.')
        }
        setScreen('list')
        setSelectedIssue(null)
        await fetchIssues()
      } else {
        showToast(json.error || '오류가 발생했습니다.')
      }
    } catch {
      showToast('오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
      setWithdrawConfirm(false)
    }
  }

  const handleLoginSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    if (!loginEmail.trim()) return
    setLoginLoading(true)
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: loginEmail.trim(),
        options: { shouldCreateUser: true },
      })
      if (err) throw err
      setScreen('login-otp')
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : '이메일 발송에 실패했습니다.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLoginVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    if (loginOtp.length < 6) return
    setLoginLoading(true)
    try {
      const { error: err } = await supabase.auth.verifyOtp({
        email: loginEmail.trim(),
        token: loginOtp.trim(),
        type: 'email',
      })
      if (err) throw err
      // Auth state change will trigger useEffect → fetchIssues + screen = 'list'
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : '인증 코드가 올바르지 않습니다.')
    } finally {
      setLoginLoading(false)
    }
  }

  const canEdit = selectedIssue?.status === '접수됨' && !selectedIssue?.is_published
  const canWithdraw = selectedIssue && !['종결'].includes(selectedIssue.status) && !selectedIssue.withdrawal_requested
  const canSupplement = selectedIssue && selectedIssue.status !== '종결'

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[150] bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 z-[160] w-full max-w-xl bg-white shadow-2xl flex flex-col" style={{ borderRadius: '2rem 0 0 2rem' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {(screen === 'detail' || screen === 'login-otp') && (
              <button
                onClick={() => {
                  if (screen === 'detail') { setScreen('list'); setSelectedIssue(null); setActiveAction(null); setWithdrawConfirm(false) }
                  if (screen === 'login-otp') { setScreen('login-email'); setLoginOtp(''); setLoginError('') }
                }}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition-all"
              >
                <i className="ri-arrow-left-line text-gray-600" />
              </button>
            )}
            <div>
              <h2 className="text-xl font-black text-gray-900">
                {screen === 'list' ? '내 제보 목록' : screen === 'detail' ? '제보 상세' : screen === 'login-otp' ? '코드 입력' : '이메일로 로그인'}
              </h2>
              {screen === 'list' && (
                <div className="flex items-center gap-2 mt-0.5">
                  {!authLoading && user ? (
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-1">
                      <i className="ri-shield-check-fill" /> {user.email}
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      디바이스 · {submitterToken.slice(0, 8).toUpperCase()}
                    </p>
                  )}
                </div>
              )}
              {screen === 'login-email' && (
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">기기 관계없이 내 제보를 확인하세요</p>
              )}
              {screen === 'login-otp' && (
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{loginEmail} 로 발송된 코드</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!authLoading && user && (
              <button
                onClick={signOut}
                title="로그아웃"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all"
              >
                <i className="ri-logout-box-r-line text-base" />
              </button>
            )}
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 hover:bg-red-50 hover:text-red-500 transition-all">
              <i className="ri-close-line text-xl" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* Login: email input */}
          {screen === 'login-email' && (
            <div className="p-8 flex flex-col gap-6">
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-16 h-16 flex items-center justify-center bg-gray-900 rounded-2xl">
                  <i className="ri-mail-lock-line text-3xl text-white" />
                </div>
                <p className="text-sm text-gray-500 font-medium text-center leading-relaxed">
                  이메일 인증으로 어떤 기기에서도<br />내 제보를 확인할 수 있습니다.
                </p>
              </div>
              <form onSubmit={handleLoginSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">이메일 주소</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="example@email.com"
                    autoFocus
                    required
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all"
                  />
                </div>
                {loginError && (
                  <p className="text-xs text-red-500 font-bold bg-red-50 px-4 py-3 rounded-xl">
                    <i className="ri-error-warning-line mr-1" />{loginError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loginLoading || !loginEmail.trim()}
                  className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-red-500 hover:shadow-xl transition-all duration-300 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 발송 중...</>
                  ) : (
                    <><i className="ri-mail-send-line" /> 인증 코드 받기</>
                  )}
                </button>
                <p className="text-[10px] text-gray-400 text-center font-medium leading-relaxed">
                  가입 없이 이메일만으로 로그인됩니다.<br />개인정보는 제보 연결에만 사용됩니다.
                </p>
              </form>
            </div>
          )}

          {/* Login: OTP input */}
          {screen === 'login-otp' && (
            <div className="p-8 flex flex-col gap-6">
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-16 h-16 flex items-center justify-center bg-gray-900 rounded-2xl">
                  <i className="ri-shield-keyhole-line text-3xl text-white" />
                </div>
                <p className="text-sm text-gray-500 font-medium text-center leading-relaxed">
                  <span className="font-black text-gray-900">{loginEmail}</span><br />으로 발송된 6자리 코드를 입력하세요.
                </p>
              </div>
              <form onSubmit={handleLoginVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">6자리 인증 코드</label>
                  <input
                    type="text"
                    value={loginOtp}
                    onChange={e => setLoginOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    autoFocus
                    inputMode="numeric"
                    maxLength={6}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl text-2xl font-black text-gray-900 text-center tracking-[0.5em] placeholder:text-gray-200 placeholder:tracking-normal focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all"
                  />
                </div>
                {loginError && (
                  <p className="text-xs text-red-500 font-bold bg-red-50 px-4 py-3 rounded-xl">
                    <i className="ri-error-warning-line mr-1" />{loginError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loginLoading || loginOtp.length < 6}
                  className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-red-500 hover:shadow-xl transition-all duration-300 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 확인 중...</>
                  ) : (
                    <><i className="ri-shield-check-line" /> 인증 확인</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setScreen('login-email'); setLoginOtp(''); setLoginError('') }}
                  className="w-full py-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  이메일 다시 입력하기
                </button>
              </form>
            </div>
          )}

          {screen === 'list' && (
            <div className="p-6 space-y-3">
              {/* 이메일 로그인 유도 (디바이스 토큰 사용중) */}
              {!authLoading && !user && (
                <button
                  onClick={() => { setLoginEmail(''); setLoginOtp(''); setLoginError(''); setScreen('login-email') }}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl text-left group hover:from-red-600 hover:to-red-500 transition-all duration-300"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl shrink-0">
                    <i className="ri-mail-lock-line text-white text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white">이메일로 로그인하면</p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">어떤 기기에서도 내 제보를 확인할 수 있습니다</p>
                  </div>
                  <i className="ri-arrow-right-line text-gray-500 group-hover:text-white transition-colors" />
                </button>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin" />
                  <span className="text-sm font-bold">불러오는 중...</span>
                </div>
              )}
              {!loading && issues.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded-2xl text-3xl text-gray-300">
                    <i className="ri-inbox-line" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-500">이 기기에서 제보한 이슈가 없습니다.</p>
                    <p className="text-xs text-gray-400 mt-1">제보하기 섹션에서 이슈를 등록해 주세요.</p>
                  </div>
                </div>
              )}
              {!loading && issues.map(issue => (
                <button
                  key={issue.id}
                  onClick={() => openDetail(issue)}
                  className="w-full text-left p-6 bg-white border border-gray-100 rounded-2xl hover:border-red-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider flex-shrink-0 ${STATUS_STYLE[issue.status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      {issue.status}
                    </span>
                    <span className="text-[10px] font-bold text-gray-300">
                      {new Date(issue.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-gray-900 line-clamp-2 group-hover:text-red-500 transition-colors leading-snug">
                    {issue.title}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] font-bold text-gray-400">{issue.region}</span>
                    <span className="w-1 h-1 bg-gray-200 rounded-full" />
                    <span className="text-[10px] font-bold text-gray-400">{issue.enforcement_type}</span>
                    {issue.withdrawal_requested && (
                      <span className="ml-auto text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">철회요청중</span>
                    )}
                    {issue.supplement_note && (
                      <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <i className="ri-attachment-line" /> 보완자료
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {screen === 'detail' && selectedIssue && (
            <div className="p-6 space-y-6">
              {/* Status badge */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${STATUS_STYLE[selectedIssue.status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  {selectedIssue.status}
                </span>
                {selectedIssue.is_published && (
                  <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-green-50 text-green-700 border border-green-200 uppercase">공개됨</span>
                )}
                {selectedIssue.withdrawal_requested && (
                  <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-orange-50 text-orange-700 border border-orange-200 uppercase">철회요청중</span>
                )}
                <span className="ml-auto text-[10px] font-bold text-gray-400">
                  {new Date(selectedIssue.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              <h3 className="text-xl font-black text-gray-900 leading-snug">{selectedIssue.title}</h3>

              {/* Overview */}
              {selectedIssue.overview && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-4 bg-red-500 rounded-full" /> 사건 개요
                  </h4>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    {selectedIssue.overview}
                  </p>
                </div>
              )}

              {/* Sense */}
              {selectedIssue.sense && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-4 bg-gray-900 rounded-full" /> 상식적 문제점
                  </h4>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    {selectedIssue.sense}
                  </p>
                </div>
              )}

              {/* Supplement note */}
              {selectedIssue.supplement_note && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" /> 보완 내용
                  </h4>
                  <div className="text-sm text-gray-600 font-medium leading-relaxed bg-blue-50 p-4 rounded-2xl border border-blue-100 whitespace-pre-wrap">
                    {selectedIssue.supplement_note}
                  </div>
                </div>
              )}

              {/* Actions */}
              {!activeAction && !withdrawConfirm && (
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {canSupplement && (
                    <button
                      onClick={() => setActiveAction('supplement')}
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-transparent rounded-2xl transition-all group"
                    >
                      <i className="ri-add-circle-line text-2xl text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <span className="text-[11px] font-black text-gray-500 group-hover:text-blue-600">보완하기</span>
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => setActiveAction('edit')}
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-amber-50 hover:border-amber-200 border border-transparent rounded-2xl transition-all group"
                    >
                      <i className="ri-edit-line text-2xl text-gray-400 group-hover:text-amber-500 transition-colors" />
                      <span className="text-[11px] font-black text-gray-500 group-hover:text-amber-600">내용 수정</span>
                    </button>
                  )}
                  {canWithdraw && (
                    <button
                      onClick={() => setWithdrawConfirm(true)}
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-red-50 hover:border-red-200 border border-transparent rounded-2xl transition-all group"
                    >
                      <i className="ri-delete-bin-line text-2xl text-gray-400 group-hover:text-red-500 transition-colors" />
                      <span className="text-[11px] font-black text-gray-500 group-hover:text-red-600">철회하기</span>
                    </button>
                  )}
                </div>
              )}

              {/* Supplement form */}
              {activeAction === 'supplement' && (
                <div className="space-y-4 bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <h4 className="text-sm font-black text-blue-800">보완 내용 추가</h4>
                  <p className="text-xs text-blue-600 font-medium">기존 내용에 추가 정보나 자료를 보완할 수 있습니다.</p>
                  <textarea
                    value={supplementText}
                    onChange={e => setSupplementText(e.target.value)}
                    placeholder="보완할 내용을 입력하세요..."
                    rows={5}
                    className="w-full bg-white px-4 py-3 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 text-sm font-medium resize-none"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setActiveAction(null)} className="flex-1 py-3 bg-white text-gray-500 font-black rounded-xl hover:bg-gray-50 transition-all text-sm">취소</button>
                    <button onClick={handleSupplement} disabled={submitting || !supplementText.trim()} className="flex-[2] py-3 bg-blue-500 text-white font-black rounded-xl hover:bg-blue-600 transition-all text-sm disabled:opacity-50">
                      {submitting ? '저장 중...' : '보완 내용 저장'}
                    </button>
                  </div>
                </div>
              )}

              {/* Edit form */}
              {activeAction === 'edit' && (
                <div className="space-y-4 bg-amber-50 p-6 rounded-2xl border border-amber-100">
                  <h4 className="text-sm font-black text-amber-800">내용 수정</h4>
                  <p className="text-xs text-amber-600 font-medium">접수됨 상태이고 미공개인 경우에만 수정 가능합니다.</p>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-amber-700 uppercase tracking-widest">사건 개요</label>
                    <textarea
                      value={editOverview}
                      onChange={e => setEditOverview(e.target.value)}
                      rows={4}
                      className="w-full bg-white px-4 py-3 border-2 border-amber-100 rounded-xl focus:outline-none focus:border-amber-400 text-sm font-medium resize-none"
                    />
                    <label className="block text-[10px] font-black text-amber-700 uppercase tracking-widest">상식적 문제점</label>
                    <textarea
                      value={editSense}
                      onChange={e => setEditSense(e.target.value)}
                      rows={4}
                      className="w-full bg-white px-4 py-3 border-2 border-amber-100 rounded-xl focus:outline-none focus:border-amber-400 text-sm font-medium resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setActiveAction(null)} className="flex-1 py-3 bg-white text-gray-500 font-black rounded-xl hover:bg-gray-50 transition-all text-sm">취소</button>
                    <button onClick={handleEdit} disabled={submitting} className="flex-[2] py-3 bg-amber-500 text-white font-black rounded-xl hover:bg-amber-600 transition-all text-sm disabled:opacity-50">
                      {submitting ? '저장 중...' : '수정 내용 저장'}
                    </button>
                  </div>
                </div>
              )}

              {/* Withdraw confirm */}
              {withdrawConfirm && (
                <div className="space-y-4 bg-red-50 p-6 rounded-2xl border border-red-100">
                  <h4 className="text-sm font-black text-red-800">제보 철회</h4>
                  {selectedIssue.is_published ? (
                    <p className="text-xs text-red-600 font-medium leading-relaxed">
                      공개된 이슈는 즉시 삭제되지 않으며 <strong>철회 요청</strong>이 관리자에게 전달됩니다.
                      관리자 검토 후 처리됩니다.
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 font-medium leading-relaxed">
                      미공개 이슈는 즉시 <strong>삭제</strong>됩니다. 이 작업은 되돌릴 수 없습니다.
                    </p>
                  )}
                  <div className="flex gap-3">
                    <button onClick={() => setWithdrawConfirm(false)} className="flex-1 py-3 bg-white text-gray-500 font-black rounded-xl hover:bg-gray-50 transition-all text-sm">취소</button>
                    <button onClick={handleWithdraw} disabled={submitting} className="flex-[2] py-3 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 transition-all text-sm disabled:opacity-50">
                      {submitting ? '처리 중...' : (selectedIssue.is_published ? '철회 요청하기' : '즉시 삭제하기')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-gray-900/95 backdrop-blur-xl text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 text-sm font-bold">
              <div className="w-5 h-5 flex items-center justify-center bg-red-500 rounded-full text-xs flex-shrink-0">
                <i className="ri-check-line" />
              </div>
              {toast}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
