'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MyPageDrawer from '@/components/MyPageDrawer'
import FileViewerModal from '@/components/FileViewerModal'
import IssueChatPanel from '@/components/IssueChatPanel'
import { FileUpload } from '@/components/FileUpload'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

interface IssueAttachment {
  id?: string
  original_name: string
  file_url?: string
  file_type?: string
  mime_type?: string
}

type IssueAttachmentInput = string | IssueAttachment
type SharePlatform = 'x' | 'facebook' | 'kakaostory'

const DEMO_ATTACHMENT_LIBRARY: Record<string, { url: string; mimeType: string }> = {
  '처분서_A구.pdf': { url: '/evidence/sample-proof.svg', mimeType: 'image/svg+xml' },
  '과태료고지서_B구.pdf': { url: '/evidence/sample-proof.svg', mimeType: 'image/svg+xml' },
  '세무조사결과통지서.pdf': { url: '/evidence/sample-proof.svg', mimeType: 'image/svg+xml' },
  '대기업_처분사례_비교.xlsx': { url: '/evidence/sample-comparison.csv', mimeType: 'text/csv' },
  '건축물대장.pdf': { url: '/evidence/sample-proof.svg', mimeType: 'image/svg+xml' },
  '시정권고서.pdf': { url: '/evidence/sample-proof.svg', mimeType: 'image/svg+xml' },
  '단속현황_통계.xlsx': { url: '/evidence/sample-comparison.csv', mimeType: 'text/csv' },
}

function inferMimeTypeFromName(fileName: string): string {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.pdf')) return 'application/pdf'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.gif')) return 'image/gif'
  if (lower.endsWith('.svg')) return 'image/svg+xml'
  if (lower.endsWith('.csv')) return 'text/csv'
  if (lower.endsWith('.xlsx')) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  return 'application/octet-stream'
}

function normalizeAttachment(input: IssueAttachmentInput): IssueAttachment {
  if (typeof input !== 'string') {
    return {
      ...input,
      mime_type: input.mime_type || inferMimeTypeFromName(input.original_name),
    }
  }

  const demo = DEMO_ATTACHMENT_LIBRARY[input]
  return {
    original_name: input,
    file_url: demo?.url,
    mime_type: demo?.mimeType || inferMimeTypeFromName(input),
    file_type: '증빙자료',
  }
}

// 모의 데이터 (한국어 사례)
const ISSUES = [
  {
    id: 1,
    title: "동일 경범죄 위반에 A구는 훈방, B구는 과태료 48만원 부과",
    summary: "동일한 경범죄처벌법 위반 행위에 대해 지역별로 처벌 수위가 최대 10배 이상 차이 나는 사례가 다수 확인됨.",
    status: "공론화진행",
    tags: ["형평성", "형사"],
    region: "서울",
    date: "2024-11-15",
    support: 2341,
    overview: "서울시 A구와 B구에서 동일한 경범죄처벌법 위반 사안에 대해 전혀 다른 처분이 내려졌습니다. A구에서는 구두 경고로 끝났으나, B구에서는 48만원의 과태료가 부과되었습니다.",
    problem: "A구 경찰서는 동일 사안에 대해 훈방 조치를 취했으나, B구 경찰서는 과태료 48만원을 부과했습니다. 관할 지역에 따라 법 집행 수위가 10배 이상 차이나는 것은 법 앞의 평등 원칙에 위배됩니다.",
    sense: "동일한 법률 위반 행위에 대해 거주지역에 따라 처벌이 달라지는 것은 명백한 형평성 문제입니다. 법 집행 기준의 표준화가 시급합니다.",
    attachments: ["처분서_A구.pdf", "과태료고지서_B구.pdf"]
  },
  {
    id: 2,
    title: "소규모 자영업자 세무조사, 대기업 동일 위반 대비 5배 중한 처분",
    summary: "매출 3억 이하 소규모 자영업자에 대한 세무조사 처분이 동일 위반 내용의 대기업 대비 현저히 중하게 부과된 사례.",
    status: "검증중",
    tags: ["선별집행", "세무"],
    region: "경기",
    date: "2024-10-03",
    support: 1892,
    overview: "연매출 2억 5천만원의 소규모 음식점 사업자가 세무조사를 받아 800만 원의 가산세를 부과받았습니다. 같은 시기 동일한 유형의 위반(매입세액공제 오류)으로 조사받은 대기업은 매출 대비 가산세율이 1/5 수준이었습니다.",
    problem: "소규모 자영업자는 실수로 인한 매입세액공제 오류에 대해 매출의 3.2% 수준의 가산세가 부과된 반면, 대기업은 동일 위반 유형에 대해 매출의 0.6% 수준만 부과되었습니다.",
    sense: "세무 위반의 중대성은 금액 규모와 고의성에 비례해야 하나, 현실은 영세사업자에게 더 가혹합니다. 집행의 형평성 검토가 필요합니다.",
    attachments: ["세무조사결과통지서.pdf", "대기업_처분사례_비교.xlsx"]
  },
  {
    id: 3,
    title: "건축물 용도변경 신고 없이 10년 영업한 대형 상가, 단 경고로 종결",
    summary: "영세 음식점에는 즉시 영업정지 처분이 내려진 동일 위반 사항에 대해, 대형 쇼핑몰에는 시정권고만 부과.",
    status: "기관전달",
    tags: ["선별집행", "건축"],
    region: "부산",
    date: "2024-09-21",
    support: 1547,
    overview: "부산시 해운대구의 대형 복합쇼핑몰이 건축법상 용도변경 신고 없이 10년간 영업했으나 시정권고만 받았습니다. 같은 구청에서 소규모 음식점은 동일 위반으로 즉시 영업정지 처분을 받았습니다.",
    problem: "대형 쇼핑몰은 건축물대장상 업무시설로 등재되어 있으나 실제로는 판매시설로 사용 중이었습니다. 10년간 방치되다 민원 제기 후에야 시정권고만 내려졌습니다.",
    sense: "동일한 건축법 위반에 대해 사업장 규모에 따라 처분 수위가 극명하게 달라지는 것은 공정한 법 집행이라 볼 수 없습니다.",
    attachments: ["건축물대장.pdf", "시정권고서.pdf"]
  },
  {
    id: 4,
    title: "교통단속 카메라 사각지대 구간에만 집중적 수동 단속 시행",
    summary: "CCTV 미설치 구간에서만 반복적으로 수동 단속이 집중되어, 단속 수입 극대화 의도가 명백하다는 민원이 잇따르고 있음.",
    status: "검증중",
    tags: ["행정편의", "교통"],
    region: "대구",
    date: "2024-11-01",
    support: 754,
    overview: "대구시 수성구 특정 구간에서 무인단속카메라가 없는 곳에서만 집중적으로 경찰 수동단속이 이뤄지고 있습니다.",
    problem: "해당 구간은 제한속도 50km/h이나 도로 설계상 70km/h로 주행이 자연스러운 구조입니다.",
    sense: "교통 안전이 목적이라면 사고 다발 지역에 단속이 집중되어야 하나, 실상은 단속 수입 극대화에 초점이 맞춰져 있습니다.",
    attachments: ["단속현황_통계.xlsx"]
  }
]

const STATS = { totalIssues: 248, totalSupport: 18400, resolvedCases: 12 }

const PRINCIPLES = [
  { icon: "ri-government-line", title: "증거 기반", description: "판결문, 처분서, 공문 등 실제 자료를 첨부합니다. 관리자 검토 후 공개되어 신뢰성을 확보합니다." },
  { icon: "ri-lock-2-line", title: "개인정보 보호", description: "실명 공개는 하지 않습니다. 휴대폰 인증으로만 식별하며, 개인정보는 자동 마스킹됩니다." },
  { icon: "ri-scales-3-line", title: "공익 목적 명시", description: "본 플랫폼은 공익 목적의 의견 개진 플랫폼입니다. 다양한 시각이 존재함을 존중합니다." },
  { icon: "ri-chat-voice-line", title: "통제형 댓글", description: "사실 보완과 법률 의견 중심의 댓글만 허용합니다. 비방 및 욕설은 즉시 삭제됩니다." },
  { icon: "ri-search-eye-line", title: "관리자 사전 검토", description: "모든 이슈는 공개 전 관리자 검토를 거칩니다. 자문단 검토 이슈에는 별도 배지가 부여됩니다." },
  { icon: "ri-broadcast-line", title: "공론화 연결", description: "누적된 이슈는 언론 및 관계 기관 전달용 리포트로 생성되어 제도적 변화를 이끌어냅니다." }
]

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [activeModalId, setActiveModalId] = useState<number | null>(null)
  const [toast, setToast] = useState({ message: "", visible: false })
  const [supportedIds, setSupportedIds] = useState<number[]>([])
  const [issueFilter, setIssueFilter] = useState("전체")
  const [rankingPeriod, setRankingPeriod] = useState("주간")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [myPageOpen, setMyPageOpen] = useState(false)
  const { user, submitterToken } = useAuth()
  const [activeAttachment, setActiveAttachment] = useState<IssueAttachment | null>(null)
  const [isAttachmentViewerOpen, setIsAttachmentViewerOpen] = useState(false)
  const [isAttachmentLoading, setIsAttachmentLoading] = useState(false)

  // 제보 폼 상태
  const [formStep, setFormStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "", type: "", field: "", region: "", date: "", overview: "", problemSense: ""
  })
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [createdIssueId, setCreatedIssueId] = useState<string | null>(null)
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false)

  // 이메일 연결 상태 (Step 3)
  const [linkEmail, setLinkEmail] = useState('')
  const [linkOtp, setLinkOtp] = useState('')
  const [linkStep, setLinkStep] = useState<'idle' | 'sending' | 'otp' | 'verified'>('idle')
  const [linkError, setLinkError] = useState('')
  const [linkLoading, setLinkLoading] = useState(false)

  // 애니메이션용 Observer
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible")
        }
      })
    }, { threshold: 0.15 })

    document.querySelectorAll(".fade-in, .stagger-item").forEach(el => observer.observe(el))

    return () => {
      window.removeEventListener("scroll", handleScroll)
      observer.disconnect()
    }
  }, [issueFilter, formStep])

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false)
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const showToast = (message: string) => {
    setToast({ message, visible: true })
    setTimeout(() => setToast({ message: "", visible: false }), 3000)
  }

  const toggleSupport = (id: number) => {
    if (supportedIds.includes(id)) {
      setSupportedIds(prev => prev.filter(item => item !== id))
      showToast("공감을 취소했습니다.")
    } else {
      setSupportedIds(prev => [...prev, id])
      showToast("공감을 보냈습니다! 공감이 모일수록 공론화 가능성이 높아집니다.")
    }
  }

  const buildIssueShareUrl = (id: number) => {
    if (typeof window === 'undefined') return `/?issue=${id}`
    const url = new URL(window.location.href)
    url.searchParams.set('issue', String(id))
    return url.toString()
  }

  const updateIssueQueryParam = (issueId: number | null, historyMode: 'push' | 'replace' = 'push') => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)

    if (issueId === null) {
      url.searchParams.delete('issue')
    } else {
      url.searchParams.set('issue', String(issueId))
    }

    if (historyMode === 'replace') {
      window.history.replaceState(window.history.state, '', url.toString())
    } else {
      window.history.pushState(window.history.state, '', url.toString())
    }
  }

  const openModal = (id: number, options?: { syncUrl?: boolean }) => {
    setActiveModalId(id)
    document.body.style.overflow = "hidden"
    if (options?.syncUrl !== false) {
      updateIssueQueryParam(id)
    }
  }

  const closeModal = (options?: { syncUrl?: boolean }) => {
    setActiveModalId(null)
    document.body.style.overflow = "auto"
    setIsAttachmentViewerOpen(false)
    setActiveAttachment(null)
    if (options?.syncUrl !== false) {
      updateIssueQueryParam(null)
    }
  }

  useEffect(() => {
    const syncModalFromUrl = () => {
      const issueParam = new URLSearchParams(window.location.search).get('issue')
      if (!issueParam) {
        closeModal({ syncUrl: false })
        return
      }

      const issueId = Number(issueParam)
      const isValidIssue = Number.isInteger(issueId) && ISSUES.some(issue => issue.id === issueId)
      if (!isValidIssue) {
        closeModal({ syncUrl: false })
        return
      }

      openModal(issueId, { syncUrl: false })
    }

    syncModalFromUrl()
    window.addEventListener('popstate', syncModalFromUrl)
    return () => {
      window.removeEventListener('popstate', syncModalFromUrl)
      document.body.style.overflow = 'auto'
    }
  }, [])

  const openAttachmentViewer = async (input: IssueAttachmentInput) => {
    const attachment = normalizeAttachment(input)
    let resolvedUrl = attachment.file_url

    if (attachment.id) {
      setIsAttachmentLoading(true)
      try {
        const res = await fetch(`/api/attachments/${attachment.id}/signed-url`)
        const json = await res.json()
        if (res.ok && json.url) {
          resolvedUrl = json.url as string
        }
      } catch {
        // ignore and fallback to existing url
      } finally {
        setIsAttachmentLoading(false)
      }
    }

    if (!resolvedUrl) {
      showToast('첨부 자료 URL을 찾을 수 없어 미리보기를 열 수 없습니다.')
      return
    }

    setActiveAttachment({
      ...attachment,
      file_url: resolvedUrl,
      mime_type: attachment.mime_type || inferMimeTypeFromName(attachment.original_name),
    })
    setIsAttachmentViewerOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleCreateIssueAndNext = async () => {
    if (!formData.overview || !formData.problemSense) {
      showToast("사건 개요와 문제점을 모두 입력해 주세요.")
      return
    }
    setIsSubmittingIssue(true)
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          enforcement_type: formData.type,
          field_category: formData.field || formData.type,
          region: formData.region,
          occurred_at: formData.date || null,
          overview: formData.overview,
          sense: formData.problemSense,
          requests: selectedRequests,
          submitter_token: submitterToken || null,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        setCreatedIssueId(json.data?.id ?? null)
        setFormStep(3)
      } else {
        const json = await res.json()
        showToast(json.error || "제보 접수 중 오류가 발생했습니다.")
      }
    } catch {
      showToast("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.")
    } finally {
      setIsSubmittingIssue(false)
    }
  }

  const handleCompleteSubmission = () => {
    showToast("제보가 성공적으로 접수되었습니다. 검토 후 공개됩니다.")
    setFormStep(1)
    setCreatedIssueId(null)
    setFormData({ title: "", type: "", field: "", region: "", date: "", overview: "", problemSense: "" })
    setSelectedRequests([])
    setLinkEmail('')
    setLinkOtp('')
    setLinkStep('idle')
    setLinkError('')
  }

  const handleLinkSendOtp = async () => {
    if (!linkEmail.trim()) return
    setLinkError('')
    setLinkLoading(true)
    setLinkStep('sending')
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: linkEmail.trim(),
        options: { shouldCreateUser: true },
      })
      if (error) throw error
      setLinkStep('otp')
    } catch (err: unknown) {
      setLinkError(err instanceof Error ? err.message : '이메일 발송에 실패했습니다.')
      setLinkStep('idle')
    } finally {
      setLinkLoading(false)
    }
  }

  const handleLinkVerifyOtp = async () => {
    if (linkOtp.length < 6 || !createdIssueId) return
    setLinkError('')
    setLinkLoading(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: linkEmail.trim(),
        token: linkOtp.trim(),
        type: 'email',
      })
      if (error) throw error

      const userId = data.user?.id
      if (!userId) throw new Error('사용자 정보를 확인할 수 없습니다.')

      // 이슈의 submitter_token을 user.id로 업데이트
      const deviceToken = submitterToken
      const res = await fetch(`/api/issues/${createdIssueId}/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_token: deviceToken, user_id: userId }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || '연결 실패')
      }

      setLinkStep('verified')
    } catch (err: unknown) {
      setLinkError(err instanceof Error ? err.message : '인증 코드가 올바르지 않습니다.')
    } finally {
      setLinkLoading(false)
    }
  }

  const toggleRequest = (req: string) => {
    setSelectedRequests(prev => prev.includes(req) ? prev.filter(r => r !== req) : [...prev, req])
  }

  const filteredIssues = issueFilter === "전체" ? ISSUES : ISSUES.filter(i => i.tags.includes(issueFilter))
  const sortedRanking = [...ISSUES].sort((a, b) => b.support - a.support).slice(0, 5)
  const currentModalIssue = ISSUES.find(i => i.id === activeModalId)
  const issueShareUrl = currentModalIssue ? buildIssueShareUrl(currentModalIssue.id) : ''

  const copyIssueShareUrl = async () => {
    if (!issueShareUrl) return
    try {
      await navigator.clipboard.writeText(issueShareUrl)
      showToast('이슈 링크를 복사했습니다.')
      return
    } catch {
      // fallback below
    }

    const textarea = document.createElement('textarea')
    textarea.value = issueShareUrl
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(textarea)

    if (copied) {
      showToast('이슈 링크를 복사했습니다.')
    } else {
      showToast('URL 복사에 실패했습니다. 링크를 직접 선택해 복사해 주세요.')
    }
  }

  const shareIssueToSns = (platform: SharePlatform) => {
    if (!currentModalIssue || !issueShareUrl) return

    const shareText = `[시민신문고] ${currentModalIssue.title}`
    const encodedUrl = encodeURIComponent(issueShareUrl)
    const encodedText = encodeURIComponent(shareText)

    const shareUrlByPlatform: Record<SharePlatform, string> = {
      x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      kakaostory: `https://story.kakao.com/share?url=${encodedUrl}`,
    }

    window.open(shareUrlByPlatform[platform], '_blank', 'noopener,noreferrer,width=640,height=720')
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "공론화진행": return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "검증중": return "bg-blue-50 text-blue-700 border-blue-200"
      case "기관전달": return "bg-orange-50 text-orange-700 border-orange-200"
      case "접수됨": return "bg-amber-50 text-amber-700 border-amber-200"
      default: return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getRankBadgeStyle = (index: number) => {
    switch (index) {
      case 0: return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg"
      case 1: return "bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg"
      case 2: return "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] selection:bg-red-100 selection:text-red-600">
      {/* 🧭 고정 헤더 (글래스모피즘) */}
      <header className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${isScrolled ? "glass-effect py-3 shadow-sm" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full group-hover:scale-150 transition-transform duration-500" />
            <span className="text-xl font-black tracking-tight text-gray-900">시민신문고</span>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-gray-900 text-white text-[10px] font-bold rounded uppercase tracking-tighter">BETA</span>
          </div>

          {/* 데스크탑 네비게이션 */}
          <nav className="hidden md:flex items-center gap-2">
            {["핫이슈", "이슈목록", "공감랭킹", "운영원칙"].map((label, i) => {
              const ids = ["hot", "issues", "ranking", "principles"]
              return (
                <button key={label} onClick={() => scrollToSection(ids[i])} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-red-500 hover:bg-white rounded-xl transition-all duration-300">
                  {label}
                </button>
              )
            })}
            <div className="w-px h-4 bg-gray-200 mx-2" />
            <button onClick={() => setMyPageOpen(true)} className={`px-4 py-2.5 border text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${user ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-400' : 'bg-white border-gray-200 text-gray-700 hover:border-red-300 hover:text-red-500'}`}>
              <i className={user ? 'ri-shield-user-line' : 'ri-user-line'} />
              {user ? user.email?.split('@')[0] : '내 제보'}
            </button>
            <button onClick={() => scrollToSection("register")} className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-red-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95">
              이슈 제보하기
            </button>
          </nav>

          {/* 모바일 햄버거 버튼 */}
          <button className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <i className={`text-xl ${isMobileMenuOpen ? "ri-close-line" : "ri-menu-line"}`} />
          </button>
        </div>

        {/* 모바일 메뉴 오버레이 */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl p-6 flex flex-col gap-4 animate-slide-up">
            {["핫이슈", "이슈목록", "공감랭킹", "운영원칙"].map((label, i) => (
              <button key={label} onClick={() => scrollToSection(["hot", "issues", "ranking", "principles"][i])} className="text-left py-3 text-lg font-bold text-gray-800 border-b border-gray-50">
                {label}
              </button>
            ))}
            <button onClick={() => { setIsMobileMenuOpen(false); setMyPageOpen(true) }} className="text-left py-3 text-lg font-bold text-red-500 flex items-center gap-2">
              <i className="ri-user-line" /> 내 제보 보기
            </button>
          </div>
        )}
      </header>

      {/* 🚀 히어로 섹션 (역동적인 타이포그래피) */}
      <section id="hero" className="relative pt-32 md:pt-40 pb-20 px-6 overflow-hidden bg-gradient-to-b from-white to-[#F8F7F4]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 md:space-y-10 fade-in text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase">
              <span className="w-1 h-1 bg-red-600 rounded-full animate-pulse" /> 시민 공론 플랫폼
            </div>
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black leading-[1.2] md:leading-[1.1] tracking-tighter text-gray-900 break-keep">
              상식을<br />기록하면<br /><span className="text-red-500">세상이<br className="sm:hidden" /> 바뀐다</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-full md:max-w-lg font-medium break-keep">
              불합리한 법집행 사례를 증거와 구조로 기록하고,<br className="hidden sm:block" />
              시민의 지지와 공감으로 공론화합니다. 데이터로 상식을 시각화합니다.
            </p>
            
            <div className="flex flex-wrap justify-start gap-6 md:gap-10 py-4 border-y border-gray-100">
              {[["등록 이슈", STATS.totalIssues], ["누적 공감", "18.4k"], ["해결 사례", STATS.resolvedCases]].map(([label, val]) => (
                <div key={label as string} className="min-w-fit">
                  <div className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{val}</div>
                  <div className="text-[10px] md:text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-start">
              <button onClick={() => scrollToSection("register")} className="px-8 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-base md:text-lg active:scale-95 flex items-center justify-center gap-2">
                지금 이슈 제보하기 <i className="ri-arrow-right-line" />
              </button>
              <button onClick={() => scrollToSection("issues")} className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 font-bold rounded-2xl hover:border-gray-900 transition-all duration-300 text-base md:text-lg active:scale-95 flex items-center justify-center">
                실시간 이슈 보기
              </button>
            </div>
          </div>

          <div className="relative fade-in mt-10 lg:mt-0" style={{ transitionDelay: '300ms' }}>
            <div className="relative space-y-2.5 sm:space-y-4 bg-white/40 backdrop-blur-xl p-3 sm:p-8 rounded-[2rem] border border-white shadow-2xl">
              {ISSUES.slice(0, 5).map((issue, i) => (
                <div key={issue.id} onClick={() => openModal(issue.id)} className="stagger-item flex items-center gap-3 sm:gap-5 p-2.5 sm:p-5 bg-white rounded-2xl smooth-shadow hover:smooth-shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
                  <div className={`flex-shrink-0 w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl font-black text-[10px] sm:text-sm ${i < 3 ? "bg-red-500 text-white shadow-md shadow-red-200" : "bg-gray-100 text-gray-400"}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] sm:text-sm font-bold text-gray-900 truncate group-hover:text-red-500 transition-colors">{issue.title}</div>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                      <span className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-tighter">{issue.tags[0]}</span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full" />
                      <span className="text-[8px] sm:text-[10px] font-bold text-gray-400">{issue.region}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[11px] sm:text-sm font-black text-gray-900 tracking-tighter">{issue.support.toLocaleString()}</div>
                    <div className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase">지지수</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ⭐ 추천 이슈 섹션 */}
      <section id="hot" className="py-20 md:py-28 px-6 bg-white border-t border-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-4 fade-in">
            <div className="space-y-2 md:space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold tracking-widest uppercase">
                <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" /> 편집장 추천
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">지금 주목할 이슈</h2>
              <p className="text-sm md:text-base text-gray-400 font-medium">공론화 가능성이 높은 대표 사례를 선별했습니다.</p>
            </div>
          </div>

          {/* 추천 이슈 카드 — 상위 3개 (공론화진행·기관전달·검증중 순) */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[ISSUES[0], ISSUES[2], ISSUES[1]].map((issue, idx) => (
              <div
                key={issue.id}
                onClick={() => openModal(issue.id)}
                className={`fade-in group relative rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
                  idx === 0
                    ? 'bg-gray-900 text-white'
                    : 'bg-[#F8F7F4] border border-gray-100'
                }`}
                style={{ transitionDelay: `${idx * 120}ms` }}
              >
                {idx === 0 && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,#ef4444_0%,transparent_60%)] opacity-20 pointer-events-none" />
                )}
                <div className="relative p-7 md:p-9 flex flex-col h-full min-h-[280px]">
                  <div className="flex items-center justify-between mb-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${
                      idx === 0
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : getStatusStyle(issue.status)
                    }`}>
                      {issue.status}
                    </span>
                    <span className={`text-[10px] font-bold ${idx === 0 ? 'text-gray-500' : 'text-gray-400'}`}>
                      {issue.region} · {issue.date}
                    </span>
                  </div>

                  <h3 className={`text-lg md:text-xl font-extrabold leading-snug mb-3 line-clamp-2 flex-grow group-hover:text-red-500 transition-colors duration-300 ${
                    idx === 0 ? 'text-white group-hover:text-red-400' : 'text-gray-900'
                  }`}>
                    {issue.title}
                  </h3>

                  <p className={`text-xs md:text-sm font-medium leading-relaxed line-clamp-2 mb-6 ${
                    idx === 0 ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {issue.summary}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className={`flex items-center gap-1.5 text-xs font-black ${idx === 0 ? 'text-red-400' : 'text-red-500'}`}>
                      <i className="ri-heart-fill" />
                      {issue.support.toLocaleString()} 공감
                    </div>
                    <div className={`flex flex-wrap gap-1.5`}>
                      {issue.tags.map(tag => (
                        <span key={tag} className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          idx === 0 ? 'bg-white/10 text-gray-400' : 'bg-white text-gray-500 border border-gray-200'
                        }`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 📄 최신 이슈 섹션 (세련된 카드 레이아웃) */}
      <section id="issues" className="py-24 md:py-32 px-6 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
            <div className="fade-in space-y-3">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">최신 불합리 사례</h2>
              <p className="text-base md:text-lg text-gray-500 font-medium">시민들이 직접 제보한 상식 밖의 사례들입니다.</p>
            </div>
            <div className="flex flex-wrap gap-2 fade-in">
              {["전체", "과잉단속", "선별집행", "형평성", "절차위반", "권한남용"].map(filter => (
                <button key={filter} onClick={() => setIssueFilter(filter)} className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 ${issueFilter === filter ? "bg-gray-900 text-white shadow-xl scale-105" : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent"}`}>
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredIssues.slice(0, 6).map((issue, idx) => (
              <div key={issue.id} onClick={() => openModal(issue.id)} className="fade-in bg-white rounded-[2rem] p-6 md:p-8 border border-gray-50 smooth-shadow hover:smooth-shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group flex flex-col h-full" style={{ transitionDelay: `${idx * 100}ms` }}>
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${getStatusStyle(issue.status)}`}>
                    {issue.status}
                  </span>
                  <span className="text-[10px] md:text-[11px] font-bold text-gray-300">{issue.date}</span>
                </div>
                <h3 className="text-lg md:text-xl font-extrabold text-gray-900 mb-4 line-clamp-2 leading-snug group-hover:text-red-500 transition-colors duration-300 flex-grow">
                  {issue.title}
                </h3>
                <p className="text-sm text-gray-500 font-medium mb-6 md:mb-8 line-clamp-2 leading-relaxed italic">
                  "{issue.summary}"
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                  <div className="flex items-center gap-2 text-red-500 font-black tracking-tighter">
                    <i className="ri-heart-fill animate-pulse" />
                    <span>{issue.support.toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-400 font-bold flex items-center gap-1.5">
                    <i className="ri-map-pin-2-fill" /> {issue.region}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center fade-in">
            <Link href="/issues" className="inline-flex items-center gap-3 px-10 py-5 bg-gray-900 text-white font-black rounded-2xl hover:bg-red-500 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
              전체 사례보기
              <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 🏆 랭킹 섹션 (다크 테마 + 그라데이션) */}
      <section id="ranking" className="py-24 md:py-32 px-6 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#1f2937_0%,#111827_100%)]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-8">
            <div className="fade-in space-y-4">
              <div className="text-red-500 font-black tracking-[0.2em] uppercase text-[10px]">Public Consensus</div>
              <h2 className="text-3xl md:text-6xl font-black text-white leading-tight tracking-tighter">가장 많은 공감을<br className="hidden md:block" /> 받은 상식</h2>
            </div>
            <div className="flex p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 fade-in overflow-x-auto no-scrollbar">
              {["주간", "월간", "누적"].map((p) => (
                <button key={p} onClick={() => setRankingPeriod(p)} className={`px-4 py-2 md:px-6 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all duration-500 whitespace-nowrap ${rankingPeriod === p ? "bg-white text-gray-900 shadow-2xl" : "text-gray-400 hover:text-white"}`}>
                  {p}공감
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {sortedRanking.map((issue, i) => (
              <div key={issue.id} onClick={() => openModal(issue.id)} className="fade-in flex flex-row items-start md:items-center gap-4 md:gap-8 p-5 md:p-8 bg-white/5 hover:bg-white/10 border border-white/5 rounded-3xl transition-all duration-500 cursor-pointer group" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-20 md:h-20 flex items-center justify-center rounded-xl md:rounded-[1.5rem] text-sm sm:text-lg md:text-3xl font-black transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${getRankBadgeStyle(i)}`}>
                  0{i + 1}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex flex-wrap justify-start gap-2 md:gap-3 mb-2 md:mb-4">
                    {issue.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 md:px-3 md:py-1 bg-white/5 text-gray-400 border border-white/10 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{tag}</span>
                    ))}
                  </div>
                  <h3 className="text-base sm:text-lg md:text-2xl font-black text-white group-hover:text-red-400 transition-colors duration-300 tracking-tight leading-snug">{issue.title}</h3>
                </div>
                <div className="flex-shrink-0 text-right hidden sm:block">
                  <div className="text-2xl md:text-4xl font-black text-red-500 tracking-tighter group-hover:scale-110 transition-transform duration-500">{issue.support.toLocaleString()}</div>
                  <div className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Supporters</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ✍️ 제보 섹션 (크고 명확한 프리미엄 폼) */}
      <section id="register" className="py-24 md:py-32 px-6 bg-[#F8F7F4]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-12 md:gap-20">
          <div className="lg:col-span-2 space-y-8 md:space-y-12 fade-in">
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight">당신의 경험을<br />기록하세요</h2>
              <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed">
                사실 중심으로 작성된 이슈는 전문 검토를 거쳐 공개됩니다. 
                증거가 뒷받침될 때 우리의 목소리는 힘을 얻습니다.
              </p>
            </div>
            
            <div className="space-y-6 md:space-y-8">
              {[
                { n: "01", t: "데이터 구조화", d: "사건 개요와 문제점을 논리적으로 구분하여 기술합니다." },
                { n: "02", t: "증빙 아카이브", d: "공문, 처분서 등 사실을 입증할 자료를 안전하게 보관합니다." },
                { n: "03", t: "공론화 리포트", d: "전문가 자문을 거쳐 공공기관 및 언론에 전달됩니다." }
              ].map((item) => (
                <div key={item.n} className="flex gap-6 md:gap-8 group">
                  <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-xl md:text-2xl font-black text-red-500 smooth-shadow group-hover:bg-red-500 group-hover:text-white transition-all duration-500">
                    {item.n}
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl font-extrabold text-gray-900 mb-1 md:mb-2">{item.t}</h4>
                    <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 fade-in" style={{ transitionDelay: '200ms' }}>
            <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 border border-gray-100 smooth-shadow-xl relative overflow-hidden">
              {/* 폼 단계 표시기 — 클릭으로 이동 가능 */}
              <div className="mb-10 md:mb-14 relative z-10">
                {/* 단계 번호 + 라벨 */}
                <div className="flex items-center gap-0 mb-6 md:mb-8">
                  {[
                    { n: 1, label: "기본 정보" },
                    { n: 2, label: "상세 내용" },
                    { n: 3, label: "자료 업로드" },
                  ].map(({ n, label }, idx) => {
                    const isActive = formStep === n
                    const isDone = formStep > n
                    // 클릭 가능 조건: 이미 지난 단계이거나 Step 3는 issueId가 있을 때
                    const canClick =
                      (n < formStep) ||
                      (n === 3 && !!createdIssueId)
                    return (
                      <div key={n} className="flex items-center">
                        <button
                          type="button"
                          disabled={!canClick && !isActive}
                          onClick={() => {
                            if (n === 1) setFormStep(1)
                            else if (n === 2 && formStep !== 2) setFormStep(2)
                            else if (n === 3 && createdIssueId) setFormStep(3)
                          }}
                          className={`flex flex-col items-center gap-1.5 group transition-all duration-200 ${canClick ? 'cursor-pointer' : isActive ? 'cursor-default' : 'cursor-not-allowed opacity-40'}`}
                        >
                          <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center text-sm md:text-base font-black transition-all duration-300 ${
                            isActive
                              ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-110'
                              : isDone
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-400'
                          } ${canClick && !isActive ? 'group-hover:bg-red-400 group-hover:text-white' : ''}`}>
                            {isDone ? <i className="ri-check-line" /> : n}
                          </div>
                          <span className={`text-[10px] md:text-xs font-black whitespace-nowrap transition-colors ${isActive ? 'text-red-500' : isDone ? 'text-gray-700' : 'text-gray-300'}`}>
                            {label}
                          </span>
                        </button>
                        {idx < 2 && (
                          <div className={`w-12 md:w-20 h-0.5 mx-1 md:mx-2 mb-5 transition-all duration-500 ${formStep > n ? 'bg-gray-900' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    )
                  })}
                </div>
                {/* 현재 단계 제목 */}
                <div className="flex items-center gap-3">
                  {formStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setFormStep(formStep - 1 as 1 | 2)}
                      className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all shrink-0"
                    >
                      <i className="ri-arrow-left-line text-base md:text-lg" />
                    </button>
                  )}
                  <div>
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-red-500">Step {formStep} of 3</span>
                    <h3 className="text-xl md:text-3xl font-black text-gray-900 leading-tight">
                      {formStep === 1 ? "기본 정보 입력" : formStep === 2 ? "상세 내용 작성" : "자료 업로드"}
                    </h3>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleFormSubmit} className="space-y-8 md:space-y-10 relative z-10">
                {formStep === 1 ? (
                  <div className="space-y-8 md:space-y-10 step-enter">
                    <div className="group">
                      <label className="block text-[10px] md:text-sm font-black text-gray-400 uppercase tracking-widest mb-3 md:mb-4 group-focus-within:text-red-500 transition-colors">이슈 제목 <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="사건을 한 눈에 알 수 있는 제목을 입력하세요." 
                        className="w-full bg-white px-6 py-4 md:px-8 md:py-6 border-2 border-gray-200 rounded-2xl md:rounded-[2rem] focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all text-base md:text-xl font-bold placeholder:text-gray-300" 
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="group">
                        <label className="block text-[10px] md:text-sm font-black text-gray-400 uppercase tracking-widest mb-3 md:mb-4">법집행 유형</label>
                        <div className="relative">
                          <select 
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                            className="w-full bg-white px-6 py-4 md:px-8 md:py-6 border-2 border-gray-200 rounded-2xl md:rounded-[2rem] focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all text-base md:text-xl font-bold appearance-none cursor-pointer" 
                            required
                          >
                            <option value="">선택하세요</option>
                            {["과잉단속", "선별집행", "형평성", "절차위반", "권한남용", "행정편의"].map(opt => <option key={opt}>{opt}</option>)}
                          </select>
                          <i className="ri-arrow-down-s-line absolute right-6 md:right-8 top-1/2 -translate-y-1/2 text-xl md:text-2xl text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-[10px] md:text-sm font-black text-gray-400 uppercase tracking-widest mb-3 md:mb-4">지역</label>
                        <div className="relative">
                          <select 
                            value={formData.region}
                            onChange={(e) => setFormData({...formData, region: e.target.value})}
                            className="w-full bg-white px-6 py-4 md:px-8 md:py-6 border-2 border-gray-200 rounded-2xl md:rounded-[2rem] focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all text-base md:text-xl font-bold appearance-none cursor-pointer" 
                            required
                          >
                            <option value="">선택하세요</option>
                            {["서울", "부산", "대구", "인천", "광주", "대전", "울산", "경기", "기타"].map(opt => <option key={opt}>{opt}</option>)}
                          </select>
                          <i className="ri-arrow-down-s-line absolute right-6 md:right-8 top-1/2 -translate-y-1/2 text-xl md:text-2xl text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => formData.title && formData.type && formData.region ? setFormStep(2) : showToast("필수 항목을 모두 입력해 주세요.")}
                      className="w-full py-5 md:py-7 bg-gray-900 text-white font-black rounded-2xl md:rounded-[2rem] hover:bg-red-500 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 active:scale-[0.98] text-lg md:text-2xl group"
                    >
                      상세 내용 작성하러 가기
                      <i className="ri-arrow-right-up-line ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                ) : formStep === 2 ? (
                  <div className="space-y-8 md:space-y-10 step-enter">
                    <div className="group">
                      <label className="block text-[10px] md:text-sm font-black text-gray-400 uppercase tracking-widest mb-3 md:mb-4">요청 사항</label>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {["재검토", "감사 요청", "제도 개선", "공론화"].map(req => (
                          <button 
                            key={req} 
                            type="button" 
                            onClick={() => toggleRequest(req)}
                            className={`px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-black transition-all duration-300 ${selectedRequests.includes(req) ? "bg-red-500 text-white shadow-xl shadow-red-200" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                          >
                            {req}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[10px] md:text-sm font-black text-gray-400 uppercase tracking-widest mb-3 md:mb-4 group-focus-within:text-red-500 transition-colors">사건 개요</label>
                      <textarea 
                        value={formData.overview}
                        onChange={(e) => setFormData({...formData, overview: e.target.value})}
                        placeholder="언제, 어디서, 무슨 일이 있었는지 객관적 사실을 기술해 주세요." 
                        rows={5} 
                        className="w-full bg-white px-6 py-4 md:px-8 md:py-6 border-2 border-gray-200 rounded-2xl md:rounded-[2rem] focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all text-base md:text-xl font-bold resize-none placeholder:text-gray-300" 
                        required 
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[10px] md:text-sm font-black text-gray-400 uppercase tracking-widest mb-3 md:mb-4 group-focus-within:text-red-500 transition-colors">상식적으로 문제되는 지점</label>
                      <textarea 
                        value={formData.problemSense}
                        onChange={(e) => setFormData({...formData, problemSense: e.target.value})}
                        placeholder="왜 이 집행이 부당하다고 생각하시나요?" 
                        rows={5} 
                        className="w-full bg-white px-6 py-4 md:px-8 md:py-6 border-2 border-gray-200 rounded-2xl md:rounded-[2rem] focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all text-base md:text-xl font-bold resize-none placeholder:text-gray-300" 
                        required 
                      />
                    </div>
                    <div className="flex gap-4 md:gap-6">
                      <button type="button" onClick={() => setFormStep(1)} className="flex-1 py-5 md:py-7 bg-gray-50 text-gray-400 font-black rounded-2xl md:rounded-[2rem] hover:bg-gray-100 transition-all text-base md:text-xl">이전 단계</button>
                      <button
                        type="button"
                        onClick={handleCreateIssueAndNext}
                        disabled={isSubmittingIssue}
                        className="flex-[2] py-5 md:py-7 bg-red-500 text-white font-black rounded-2xl md:rounded-[2rem] hover:bg-red-600 hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-[0.98] text-lg md:text-2xl disabled:opacity-60 disabled:scale-100 inline-flex items-center justify-center gap-3"
                      >
                        {isSubmittingIssue ? (
                          <>
                            <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            접수 중...
                          </>
                        ) : (
                          <>
                            다음: 자료 첨부
                            <i className="ri-arrow-right-line" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Step 3: 자료 업로드 */
                  <div className="space-y-8 md:space-y-10 step-enter">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 md:p-6">
                      <div className="flex items-start gap-3">
                        <i className="ri-information-line text-blue-500 text-xl mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm md:text-base font-black text-blue-900">자료 첨부는 선택 사항입니다</p>
                          <p className="text-xs md:text-sm text-blue-700 mt-1 font-medium leading-relaxed">
                            판결문, 처분서, 공문, 녹취요약, 언론기사 등 이슈를 뒷받침하는 자료를 첨부하면 검토 및 공론화에 도움이 됩니다.
                            파일(PDF·이미지) 또는 클라우드 URL로 첨부할 수 있습니다.
                          </p>
                        </div>
                      </div>
                    </div>

                    {createdIssueId ? (
                      <FileUpload
                        mode="remote"
                        issueId={createdIssueId}
                      />
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-sm font-bold">
                        이슈 정보를 불러오는 중입니다...
                      </div>
                    )}

                    {/* 이메일 연결 섹션 — 비로그인 사용자에게만 표시 */}
                    {!user && (
                      <div className="border-2 border-dashed border-gray-200 rounded-2xl md:rounded-[2rem] overflow-hidden">
                        {linkStep === 'verified' ? (
                          /* 인증 완료 */
                          <div className="p-6 md:p-8 flex flex-col items-center gap-3 text-center bg-emerald-50">
                            <div className="w-12 h-12 flex items-center justify-center bg-emerald-500 rounded-2xl">
                              <i className="ri-shield-check-fill text-2xl text-white" />
                            </div>
                            <p className="text-base font-black text-emerald-800">이메일 인증 완료!</p>
                            <p className="text-xs text-emerald-600 font-medium leading-relaxed">
                              <span className="font-black">{linkEmail}</span> 계정에 이 제보가 연결되었습니다.<br />
                              언제 어디서든 <strong>내 제보</strong>에서 확인할 수 있습니다.
                            </p>
                          </div>
                        ) : linkStep === 'otp' ? (
                          /* OTP 입력 */
                          <div className="p-6 md:p-8 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-9 h-9 flex items-center justify-center bg-gray-900 rounded-xl shrink-0">
                                <i className="ri-shield-keyhole-line text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-gray-900">인증 코드 입력</p>
                                <p className="text-xs text-gray-400 font-medium">{linkEmail} 로 발송된 6자리 코드</p>
                              </div>
                            </div>
                            <input
                              type="text"
                              value={linkOtp}
                              onChange={e => setLinkOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="123456"
                              inputMode="numeric"
                              maxLength={6}
                              autoFocus
                              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl text-2xl font-black text-gray-900 text-center tracking-[0.5em] placeholder:text-gray-200 placeholder:tracking-normal focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all"
                            />
                            {linkError && (
                              <p className="text-xs text-red-500 font-bold bg-red-50 px-4 py-2 rounded-xl">
                                <i className="ri-error-warning-line mr-1" />{linkError}
                              </p>
                            )}
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => { setLinkStep('idle'); setLinkOtp(''); setLinkError('') }}
                                className="flex-1 py-3 bg-gray-100 text-gray-500 font-black rounded-xl hover:bg-gray-200 transition-all text-sm"
                              >
                                취소
                              </button>
                              <button
                                type="button"
                                onClick={handleLinkVerifyOtp}
                                disabled={linkLoading || linkOtp.length < 6}
                                className="flex-[2] py-3 bg-gray-900 text-white font-black rounded-xl hover:bg-red-500 transition-all duration-300 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                              >
                                {linkLoading ? (
                                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 확인 중...</>
                                ) : (
                                  <><i className="ri-shield-check-line" /> 인증 완료</>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* 이메일 입력 */
                          <div className="p-6 md:p-8 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-xl shrink-0">
                                <i className="ri-mail-lock-line text-gray-500 text-lg" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-gray-900">이메일로 내 제보 연결 <span className="text-xs font-bold text-gray-400 ml-1">선택</span></p>
                                <p className="text-xs text-gray-400 font-medium">이메일 인증 시 어떤 기기에서도 내 제보를 확인할 수 있습니다</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="email"
                                value={linkEmail}
                                onChange={e => { setLinkEmail(e.target.value); setLinkError('') }}
                                placeholder="example@email.com"
                                className="flex-1 min-w-0 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all"
                              />
                              <button
                                type="button"
                                onClick={handleLinkSendOtp}
                                disabled={linkLoading || !linkEmail.trim()}
                                className="shrink-0 px-4 py-3 bg-gray-900 text-white font-black rounded-xl hover:bg-red-500 transition-all duration-300 disabled:opacity-50 text-sm flex items-center gap-1.5 whitespace-nowrap"
                              >
                                {linkLoading ? (
                                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <i className="ri-mail-send-line" />
                                )}
                                인증 코드 받기
                              </button>
                            </div>
                            {linkError && (
                              <p className="text-xs text-red-500 font-bold bg-red-50 px-4 py-2 rounded-xl">
                                <i className="ri-error-warning-line mr-1" />{linkError}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-4 md:gap-6 pt-4">
                      <button
                        type="button"
                        onClick={handleCompleteSubmission}
                        className="w-full py-5 md:py-7 bg-gray-900 text-white font-black rounded-2xl md:rounded-[2rem] hover:bg-red-500 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 active:scale-[0.98] text-lg md:text-2xl group"
                      >
                        제보 완료하기
                        <i className="ri-check-line ml-3 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                    <p className="text-center text-xs text-gray-400 font-medium">
                      자료를 첨부하지 않아도 제보가 접수됩니다. 나중에 추가할 수 있습니다.
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 💎 플랫폼 원칙 (아이콘 & 그리드) */}
      <section id="principles" className="py-24 md:py-32 px-6 bg-white border-t border-gray-50">
        <div className="max-w-7xl mx-auto space-y-16 md:space-y-20">
          <div className="text-center space-y-4 fade-in">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter">흔들리지 않는 플랫폼 원칙</h2>
            <p className="text-base md:text-lg text-gray-400 font-bold max-w-2xl mx-auto">신뢰가 있어야 공론화가 가능합니다. 우리는 가장 엄격한 기준으로 정보를 다룹니다.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {PRINCIPLES.map((principle, i) => (
              <div key={principle.title} className="fade-in bg-[#F8F7F4]/50 border border-gray-100 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 hover:bg-white hover:smooth-shadow-xl hover:-translate-y-2 transition-all duration-500 group" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-white rounded-2xl text-2xl md:text-3xl text-gray-900 smooth-shadow group-hover:scale-110 group-hover:rotate-6 group-hover:text-red-500 transition-all duration-500 mb-6 md:mb-8">
                  <i className={principle.icon} />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3 md:mb-4 tracking-tight">{principle.title}</h3>
                <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed tracking-tight">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🌑 푸터 (다크 & 미니멀) */}
      <footer className="bg-gray-900 text-white py-16 md:py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 relative z-10">
          <div className="md:col-span-2 space-y-6 md:space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
              <span className="text-2xl md:text-3xl font-black tracking-tighter">시민신문고</span>
            </div>
            <p className="text-gray-500 font-bold max-w-sm leading-relaxed text-sm md:text-base">
              증거와 구조로 '상식'을 시각화합니다.<br />
              개인의 분노가 아닌 데이터로 세상을 바꿉니다.
            </p>
            <div className="flex gap-4">
              {["ri-facebook-fill", "ri-twitter-x-fill", "ri-instagram-line", "ri-youtube-fill"].map(icon => (
                <a key={icon} href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500 transition-all duration-300">
                  <i className={icon} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-6 md:mb-8">Platform</h4>
            <ul className="space-y-3 md:space-y-4 font-bold text-xs md:text-sm text-gray-400">
              {[
                { label: "최신 이슈", href: "/issues/latest" },
                { label: "공감 랭킹", href: "/ranking" },
                { label: "제보 가이드", href: "/guide" },
                { label: "데이터 아카이브", href: "/archive" },
              ].map(item => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors transition-transform hover:translate-x-1 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-6 md:mb-8">Information</h4>
            <ul className="space-y-3 md:space-y-4 font-bold text-xs md:text-sm text-gray-400">
              {[
                { label: "운영 원칙", href: "/principles" },
                { label: "개인정보 처리방침", href: "/privacy" },
                { label: "이용 약관", href: "/terms" },
                { label: "법률자문단 및 시민배심원", href: "/advisory" },
              ].map(item => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors transition-transform hover:translate-x-1 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 md:mt-24 pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left">
          <p className="text-[10px] font-black text-gray-600 tracking-widest uppercase">© 2026 Citizen Justice. All Rights Reserved.</p>
          <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
            <span className="text-[10px] font-black text-gray-600 tracking-widest uppercase">Version 1.0.0-Beta</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">System Online</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 🖼 상세 이슈 모달 (부드러운 열림/닫힘) */}
      {activeModalId && currentModalIssue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-4 animate-slide-up" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-hidden smooth-shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-50 px-6 py-6 md:px-10 md:py-8 z-10 flex items-center justify-between">
              <div className="space-y-1 md:space-y-2">
                <div className="flex items-center gap-2 md:gap-3">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] md:text-[10px] font-black border tracking-wider uppercase ${getStatusStyle(currentModalIssue.status)}`}>
                    {currentModalIssue.status}
                  </span>
                  <span className="text-[9px] md:text-[10px] font-bold text-gray-300 tracking-widest uppercase">{currentModalIssue.region} · {currentModalIssue.date}</span>
                </div>
                <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tighter line-clamp-1">{currentModalIssue.title}</h2>
              </div>
              <button onClick={() => closeModal()} className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-xl md:rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all duration-300">
                <i className="ri-close-line text-xl md:text-2xl" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-grow p-6 md:p-10 space-y-10 md:space-y-12 no-scrollbar">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[1.5rem] md:rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
                <div className="space-y-2 text-center md:text-left">
                  <div className="text-4xl md:text-6xl font-black tracking-tighter text-red-500">{(supportedIds.includes(currentModalIssue.id) ? currentModalIssue.support + 1 : currentModalIssue.support).toLocaleString()}</div>
                  <p className="text-xs font-bold text-gray-400 tracking-wide uppercase">명이 이 상식에 지지를 보냈습니다</p>
                </div>
                <div className="w-full md:w-auto md:min-w-[360px] space-y-3">
                  <button onClick={() => toggleSupport(currentModalIssue.id)} className={`w-full px-8 py-4 md:px-10 md:py-5 rounded-xl md:rounded-2xl font-black text-base md:text-lg transition-all duration-500 active:scale-95 ${supportedIds.includes(currentModalIssue.id) ? "bg-white/10 text-white border border-white/10 hover:bg-white/20" : "bg-red-500 text-white shadow-2xl shadow-red-500/40 hover:bg-red-600"}`}>
                    {supportedIds.includes(currentModalIssue.id) ? "지지를 철회하시겠습니까?" : "👍 상식에 지지하기"}
                  </button>
                  <div className="rounded-xl md:rounded-2xl border border-white/10 bg-white/5 p-3 md:p-4 space-y-3">
                    <p className="text-[10px] md:text-[11px] font-black text-gray-300 uppercase tracking-[0.16em]">이슈 링크 공유</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={copyIssueShareUrl}
                        className="px-2.5 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-[11px] md:text-xs font-bold text-gray-100 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <i className="ri-share-forward-line text-base" />
                        공유
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          shareIssueToSns('x')
                        }}
                        className="px-2.5 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-[11px] md:text-xs font-bold text-gray-100 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <i className="ri-twitter-x-line text-base" />
                        X
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          shareIssueToSns('facebook')
                        }}
                        className="px-2.5 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-[11px] md:text-xs font-bold text-gray-100 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <i className="ri-facebook-circle-line text-base" />
                        Facebook
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          shareIssueToSns('kakaostory')
                        }}
                        className="px-2.5 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-[11px] md:text-xs font-bold text-gray-100 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <i className="ri-chat-3-line text-base" />
                        Kakao
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-black text-gray-900 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-red-500 rounded-full" />사건 개요
                  </h3>
                  <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100">{currentModalIssue.overview}</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-black text-gray-900 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-red-500 rounded-full" />상식적 문제점
                  </h3>
                  <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100">{currentModalIssue.sense}</p>
                </div>
              </div>

              {currentModalIssue.attachments.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-gray-50">
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-gray-900 rounded-full" />검증된 증거 자료
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentModalIssue.attachments.map((rawAttachment, i) => {
                      const attachment = normalizeAttachment(rawAttachment)
                      const isPdf = attachment.mime_type === 'application/pdf'
                      const iconClass = isPdf ? 'ri-file-pdf-2-line' : 'ri-attachment-2'

                      return (
                        <button
                          key={`${attachment.original_name}-${i}`}
                          type="button"
                          onClick={() => openAttachmentViewer(rawAttachment)}
                          className="w-full text-left flex items-center gap-4 p-5 bg-gray-50 border border-gray-100 rounded-2xl hover:border-red-200 transition-all group cursor-pointer"
                        >
                          <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-xl text-gray-400 group-hover:text-red-500 transition-colors">
                            <i className={iconClass} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-600 truncate">{attachment.original_name}</p>
                            <p className="text-[11px] font-bold text-gray-400 mt-1">
                              클릭하여 보기
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-6 pt-6 border-t border-gray-50">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-red-500 rounded-full" />시민 라이브 채팅
                </h3>
                <IssueChatPanel issueId={currentModalIssue.id} />
              </div>
            </div>
          </div>
        </div>
      )}

      <FileViewerModal
        open={isAttachmentViewerOpen}
        loading={isAttachmentLoading}
        fileName={activeAttachment?.original_name}
        fileUrl={activeAttachment?.file_url}
        mimeType={activeAttachment?.mime_type}
        fileTypeLabel={activeAttachment?.file_type}
        onClose={() => {
          setIsAttachmentViewerOpen(false)
          setActiveAttachment(null)
        }}
      />

      {/* 🔔 알림 토스트 (미니멀 & 세련됨) */}
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-slide-up">
          <div className="bg-gray-900/95 backdrop-blur-xl text-white px-8 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4">
            <div className="w-6 h-6 flex items-center justify-center bg-red-500 rounded-full text-xs">
              <i className="ri-check-line" />
            </div>
            <p className="text-sm font-bold tracking-tight">{toast.message}</p>
          </div>
        </div>
      )}

      {/* 📋 마이페이지 드로어 */}
      <MyPageDrawer open={myPageOpen} onClose={() => setMyPageOpen(false)} />

      {/* 🔝 최상단 이동 버튼 */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 right-8 z-[50] w-12 h-12 md:w-14 md:h-14 bg-white text-gray-900 rounded-2xl smooth-shadow-xl border border-gray-100 flex items-center justify-center transition-all duration-500 hover:bg-gray-900 hover:text-white hover:-translate-y-2 active:scale-90 ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
        aria-label="Scroll to top"
      >
        <i className="ri-arrow-up-line text-xl md:text-2xl" />
      </button>
    </div>
  )
}
