'use client'

import { useState } from 'react'

type ApplyType = '법률자문단' | '시민배심원'

interface FormState {
  name: string
  email: string
  phone: string
  profession: string
  experience: string
  motivation: string
}

const INITIAL_FORM: FormState = {
  name: '',
  email: '',
  phone: '',
  profession: '',
  experience: '',
  motivation: '',
}

export default function AdvisoryApplySection() {
  const [openType, setOpenType] = useState<ApplyType | null>(null)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [privacyAgreed, setPrivacyAgreed] = useState(false)

  const openModal = (type: ApplyType) => {
    setOpenType(type)
    setForm(INITIAL_FORM)
    setError('')
    setSuccess(false)
    setPrivacyAgreed(false)
  }

  const closeModal = () => {
    if (submitting) return
    setOpenType(null)
    setSuccess(false)
    setError('')
  }

  const handleChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const handleSubmit = async () => {
    if (!openType) return
    const { name, email, profession, experience, motivation } = form
    if (!name.trim() || !email.trim() || !profession.trim() || !experience.trim() || !motivation.trim()) {
      setError('필수 항목을 모두 입력해 주세요.')
      return
    }
    if (!privacyAgreed) {
      setError('개인정보 수집·이용에 동의해 주세요.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: openType, ...form }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || '신청 중 오류가 발생했습니다.')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* 지원하기 버튼 영역 */}
      <div className="mx-auto max-w-3xl px-4 py-10 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => openModal('법률자문단')}
          className="flex-1 py-4 px-6 rounded-2xl bg-gray-900 border border-gray-700 text-white font-black text-base hover:border-red-500 hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <span className="text-xl">⚖️</span>
          법률자문단 지원하기
          <span className="text-xs font-bold text-gray-400 ml-auto">→</span>
        </button>
        <button
          onClick={() => openModal('시민배심원')}
          className="flex-1 py-4 px-6 rounded-2xl bg-gray-900 border border-gray-700 text-white font-black text-base hover:border-red-500 hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <span className="text-xl">🏛️</span>
          시민배심원 지원하기
          <span className="text-xs font-bold text-gray-400 ml-auto">→</span>
        </button>
      </div>

      {/* 모달 오버레이 */}
      {openType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-[#111111] border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div>
                <p className="text-[10px] font-bold text-red-400 tracking-widest uppercase mb-0.5">Application</p>
                <h2 className="text-base font-black text-white">{openType} 신청</h2>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {success ? (
              <div className="px-6 py-12 text-center">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-lg font-black text-white mb-2">신청이 완료되었습니다</h3>
                <p className="text-sm text-gray-400 mb-6">
                  {openType} 신청이 접수되었습니다.<br />
                  검토 후 입력하신 이메일로 연락드리겠습니다.
                </p>
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-colors"
                >
                  닫기
                </button>
              </div>
            ) : (
              <div className="px-6 py-5 space-y-4">
                {/* 이름 */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1.5">
                    이름 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="실명 또는 활동명"
                    maxLength={50}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* 이메일 */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1.5">
                    이메일 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="연락 가능한 이메일"
                    maxLength={100}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* 전화번호 */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1.5">
                    전화번호 <span className="text-gray-600">(선택)</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="010-0000-0000"
                    maxLength={20}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* 직업/전공 */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1.5">
                    직업 / 전공 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.profession}
                    onChange={e => handleChange('profession', e.target.value)}
                    placeholder={openType === '법률자문단' ? '변호사, 법학교수, 법학대학원생 등' : '직업 또는 주요 활동 분야'}
                    maxLength={100}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* 관련 경력/경험 */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1.5">
                    관련 경력 / 경험 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.experience}
                    onChange={e => handleChange('experience', e.target.value)}
                    placeholder={openType === '법률자문단' ? '법률 관련 경력, 자격증, 주요 업무 경험 등' : '시민 활동, 공익 관련 경험, 사회 참여 이력 등'}
                    maxLength={500}
                    rows={3}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-400 resize-none"
                  />
                </div>

                {/* 지원 동기 */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1.5">
                    지원 동기 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.motivation}
                    onChange={e => handleChange('motivation', e.target.value)}
                    placeholder="시민신문고 활동에 참여하려는 이유와 기여하고 싶은 부분을 작성해 주세요."
                    maxLength={1000}
                    rows={4}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-400 resize-none"
                  />
                </div>

                {/* 개인정보 수집·이용 동의 */}
                <div className="bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-3.5">
                  <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">개인정보 수집·이용 동의 <span className="text-red-400">*</span></p>
                  <div className="text-xs text-gray-500 leading-relaxed mb-3 space-y-1">
                    <p><span className="text-gray-400 font-bold">수집 항목:</span> 이름, 이메일, 전화번호(선택), 직업/전공, 경력·경험, 지원동기</p>
                    <p><span className="text-gray-400 font-bold">수집 목적:</span> {openType} 신청 접수 및 심사, 결과 안내</p>
                    <p><span className="text-gray-400 font-bold">보유 기간:</span> 신청일로부터 1년 (또는 동의 철회 시 즉시 삭제)</p>
                    <p className="text-gray-600">※ 동의를 거부할 권리가 있으나, 거부 시 신청이 불가합니다.</p>
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={privacyAgreed}
                      onChange={e => {
                        setPrivacyAgreed(e.target.checked)
                        if (error) setError('')
                      }}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 accent-red-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">
                      개인정보 수집·이용에 동의합니다.
                    </span>
                  </label>
                </div>

                {error && (
                  <p className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-1 pb-1">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 font-black text-sm hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? '신청 중...' : '신청 제출'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
