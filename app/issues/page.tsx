'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import FileViewerModal from '@/components/FileViewerModal'
import IssueChatPanel from '@/components/IssueChatPanel'

// 샘플 데이터 (DB 공개 이슈가 없을 때 및 정식 서비스 전환 전 폴백)
const SAMPLE_ISSUES = [
  { id: '1', title: "A구청의 일방적인 영업정지 처분 사례", summary: "절차적 정당성 없는 행정 처분으로 인한 소상공인 피해 발생", support: 1245, date: "2024.03.08", region: "서울", tags: ["절차위반", "권한남용"], status: "공론화진행", overview: "A구청에서 사전 통지 없이 영업정지 처분을 내렸습니다.", sense: "행정절차법 제21조 위반 소지가 다분합니다.", attachments: ['처분서_A구.pdf'] },
  { id: '2', title: "교통 단속 카메라 오작동 의심 제보", summary: "특정 구간에서 동시 다발적인 과태료 부과 및 데이터 불일치", support: 892, date: "2024.03.07", region: "경기", tags: ["과잉단속", "형평성"], status: "검증중", overview: "카메라 센서 오류로 속도가 잘못 측정된 사례가 빈번합니다.", sense: "기기 결함에 대한 전수 조사가 필요합니다.", attachments: ['과태료고지서_B구.pdf', '단속현황_통계.xlsx'] },
  { id: '3', title: "대기업과 중소기업 간의 세무 조사 형평성", summary: "동일 사안에 대해 기업 규모별 상이한 잣대 적용 사례 기록", support: 3421, date: "2024.03.05", region: "인천", tags: ["선별집행", "형평성"], status: "기관전달", overview: "중소기업에만 가혹한 세무 조사가 반복되고 있습니다.", sense: "평등의 원칙과 조세 형평성에 어긋납니다.", attachments: ['세무조사결과통지서.pdf', '대기업_처분사례_비교.xlsx'] },
  { id: '4', title: "공원 부지 용도 변경 관련 절차 하자", summary: "주민 동의 없는 용도 변경 및 특정 업체 특혜 의혹", support: 2156, date: "2024.03.02", region: "부산", tags: ["절차위반", "권한남용"], status: "공론화진행", overview: "공원 부지가 갑자기 상업 지구로 변경되었습니다.", sense: "도시계획법상 주민 의견 수렴 절차가 누락되었습니다.", attachments: ['건축물대장.pdf'] },
  { id: '5', title: "전통시장 현대화 사업 예산 집행 불투명", summary: "사업 진행 과정에서의 예산 낭비 및 선정 기준 모호성", support: 567, date: "2024.02.28", region: "대전", tags: ["행정편의", "절차위반"], status: "접수됨", overview: "예산 집행 내역이 공개되지 않고 있습니다.", sense: "정보공개법 위반 및 예산 유용 가능성이 있습니다.", attachments: [] },
  { id: '6', title: "주택 밀집 구역 일방 통행 지정 민원", summary: "현장 실사 없는 일방 통행 지정으로 주민 불편 가중", support: 432, date: "2024.02.25", region: "광주", tags: ["행정편의"], status: "검증중", overview: "주민들의 의견을 전혀 반영하지 않은 도로 행정입니다.", sense: "현장 행정의 부재와 시민 불편 초래입니다.", attachments: ['시정권고서.pdf'] },
  { id: '7', title: "아파트 단지 내 택배 차량 진입 금지 처분", summary: "공공 도로 성격의 단지 내 도로 이용 제한에 대한 법적 쟁점", support: 1560, date: "2024.02.20", region: "경기", tags: ["형평성"], status: "공론화진행", overview: "택배 기사님들의 통행권이 침해받고 있습니다.", sense: "이동권 보장과 상생의 관점에서 문제가 있습니다.", attachments: [] },
  { id: '8', title: "환경 오염 유발 업체에 대한 봐주기식 단속", summary: "반복적인 폐수 배출에도 가벼운 경고 처분에 그치는 현장", support: 2890, date: "2024.02.15", region: "울산", tags: ["선별집행"], status: "기관전달", overview: "수년째 폐수가 방류되고 있으나 솜방망이 처벌뿐입니다.", sense: "환경법 집행의 실효성 확보가 절실합니다.", attachments: [] },
  { id: '9', title: "소상공인 대상 위생 점검 과도한 빈도", summary: "대형마트 대비 3배 이상 잦은 위생 점검으로 영업 부담 가중", support: 718, date: "2024.02.10", region: "서울", tags: ["선별집행", "형평성"], status: "검증중", overview: "같은 업종이라도 소규모 업체에 점검이 집중됩니다.", sense: "행정력 집행에 있어 일관성 있는 기준이 필요합니다.", attachments: [] },
]

const DEMO_ATTACHMENT_LIBRARY: Record<string, { url: string; mimeType: string }> = {
  '처분서_A구.pdf': { url: '/evidence/sample-proof.svg', mimeType: 'image/svg+xml' },
  '과태료고지서_B구.pdf': { url: '/evidence/sample-proof.svg', mimeType: 'image/svg+xml' },
  '세무조사결과통지서.pdf': { url: '/evidence/sample-proof.svg', mimeType: 'image/svg+xml' },
  '대기업_처분사례_비교.xlsx': { url: '/evidence/sample-comparison.csv', mimeType: 'text/csv' },
  '건축물대장.pdf': { url: '/evidence/sample-proof.svg', mimeType: 'image/svg+xml' },
  '시정권고서.pdf': { url: '/evidence/sample-proof.svg', mimeType: 'image/svg+xml' },
  '단속현황_통계.xlsx': { url: '/evidence/sample-comparison.csv', mimeType: 'text/csv' },
}

interface IssueAttachment {
  id?: string
  original_name: string
  file_url?: string
  file_type?: string
  mime_type?: string
}

interface DisplayIssue {
  id: string
  title: string
  summary: string
  support: number
  date: string
  region: string
  tags: string[]
  status: string
  overview: string
  sense: string
  attachments: string[]
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

const CATEGORY_FILTERS = ["전체", "과잉단속", "선별집행", "형평성", "절차위반", "권한남용", "행정편의"]
const STATUS_FILTERS = ["전체", "공론화진행", "기관전달", "검증중", "접수됨"]
const ITEMS_PER_PAGE = 9

const NAV_MENUS = [
  { label: "전체 이슈", href: "/issues", icon: "ri-file-list-3-line", desc: "모든 제보 사례" },
  { label: "최신 이슈", href: "/issues?sort=latest", icon: "ri-time-line", desc: "최근 접수순" },
]

function IssuesContent() {
  const searchParams = useSearchParams()
  const sortParam = searchParams.get('sort')
  const queryParam = searchParams.get('q') || ''

  const [tagFilter, setTagFilter] = useState("전체")
  const [statusFilter, setStatusFilter] = useState("전체")
  const [activeModalId, setActiveModalId] = useState<string | null>(null)
  const [supportedIds, setSupportedIds] = useState<string[]>([])
  const [activeAttachment, setActiveAttachment] = useState<IssueAttachment | null>(null)
  const [isAttachmentViewerOpen, setIsAttachmentViewerOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(queryParam)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // DB 이슈 + 샘플 표시 설정
  const [dbIssues, setDbIssues] = useState<DisplayIssue[]>([])
  const [showSampleIssues, setShowSampleIssues] = useState(true)

  useEffect(() => {
    fetch('/api/issues')
      .then(r => r.json())
      .then(json => {
        if (json.data) {
          setDbIssues(json.data.map((i: {
            id: string; title: string; summary: string; status: string;
            enforcement_type: string; field_category: string; region: string;
            occurred_at: string | null; created_at: string; support_count: number;
            overview: string; sense: string;
          }) => ({
            id: i.id,
            title: i.title,
            summary: i.summary || '',
            status: i.status,
            tags: [i.enforcement_type, i.field_category].filter(Boolean),
            region: i.region,
            date: (i.occurred_at || i.created_at || '').slice(0, 10).replace(/-/g, '.'),
            support: i.support_count || 0,
            overview: i.overview || '',
            sense: i.sense || '',
            attachments: [],
          })))
        }
      })
      .catch(() => {})

    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(json => {
        if (json.data?.show_sample_issues !== undefined) {
          setShowSampleIssues(json.data.show_sample_issues !== 'false')
        }
      })
      .catch(() => {})
  }, [])

  // 샘플 우선, DB 후순위
  const sampleIssues: DisplayIssue[] = showSampleIssues ? SAMPLE_ISSUES : []
  const allIssues: DisplayIssue[] = [...sampleIssues, ...dbIssues]

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const onPop = () => {
      const id = new URLSearchParams(window.location.search).get('issue')
      if (id && allIssues.some(i => i.id === id)) setActiveModalId(id)
      else setActiveModalId(null)
    }
    onPop()
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [allIssues])

  const openModal = useCallback((id: string) => {
    setActiveModalId(id)
    document.body.style.overflow = 'hidden'
    const url = new URL(window.location.href)
    url.searchParams.set('issue', id)
    window.history.pushState(null, '', url.toString())
  }, [])

  const closeModal = useCallback(() => {
    setActiveModalId(null)
    document.body.style.overflow = 'auto'
    const url = new URL(window.location.href)
    url.searchParams.delete('issue')
    window.history.pushState(null, '', url.toString())
  }, [])

  const normalizeAttachment = (input: string | IssueAttachment): IssueAttachment => {
    if (typeof input !== 'string') return input
    const demo = DEMO_ATTACHMENT_LIBRARY[input]
    return { original_name: input, file_url: demo?.url, mime_type: demo?.mimeType || inferMimeTypeFromName(input), file_type: '증빙자료' }
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

  const getStatusDot = (status: string) => {
    switch (status) {
      case "공론화진행": return "bg-emerald-500"
      case "검증중": return "bg-blue-500"
      case "기관전달": return "bg-orange-500"
      case "접수됨": return "bg-amber-500"
      default: return "bg-gray-400"
    }
  }

  // 정렬 + 필터 + 검색
  let filtered = [...allIssues]
  if (sortParam === 'latest') filtered.sort((a, b) => b.date.localeCompare(a.date))
  else filtered.sort((a, b) => b.support - a.support)
  if (tagFilter !== "전체") filtered = filtered.filter(i => i.tags.includes(tagFilter))
  if (statusFilter !== "전체") filtered = filtered.filter(i => i.status === statusFilter)
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase()
    filtered = filtered.filter(i => i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q))
  }
  const toIso = (d: string) => d.replace(/\./g, '-')
  if (dateFrom) filtered = filtered.filter(i => toIso(i.date) >= dateFrom)
  if (dateTo) filtered = filtered.filter(i => toIso(i.date) <= dateTo)

  const totalCount = filtered.length
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const displayed = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // 필터 바뀔 때 첫 페이지로
  const resetPage = () => setCurrentPage(1)

  const currentModalIssue = allIssues.find(i => i.id === activeModalId)
  const isLatestMode = sortParam === 'latest'

  const activeNav = (href: string) => {
    if (href === '/issues?sort=latest') return isLatestMode
    if (href === '/issues') return !isLatestMode
    return false
  }

  // 페이지네이션 번호 배열 생성 (최대 7개 표시)
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '...')[] = []
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages)
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
    }
    return pages
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">

      {/* ── 헤더 ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white/95 backdrop-blur-2xl border-b border-gray-100 shadow-sm' : 'bg-white border-b border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full group-hover:scale-150 transition-transform duration-300" />
            <span className="text-lg md:text-xl font-black tracking-tighter text-gray-900 group-hover:text-red-500 transition-colors">시민신문고</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_MENUS.map(menu => (
              <Link key={menu.href} href={menu.href} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${activeNav(menu.href) ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                <i className={`${menu.icon} text-base`} />{menu.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/#register" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white font-black text-sm rounded-xl hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <i className="ri-edit-line" />이슈 제보하기
            </Link>
            <button onClick={() => setIsMobileMenuOpen(v => !v)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
              <i className={`text-lg ${isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-3-line'}`} />
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-1">
            {NAV_MENUS.map(menu => (
              <Link key={menu.href} href={menu.href} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeNav(menu.href) ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <i className={`${menu.icon} text-lg`} />
                  <div>
                    <p className="text-sm font-black">{menu.label}</p>
                    <p className="text-[10px] font-medium text-gray-400">{menu.desc}</p>
                  </div>
                </div>
                <i className="ri-arrow-right-s-line text-lg opacity-40" />
              </Link>
            ))}
            <Link href="/#register" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 mt-3 px-4 py-3 bg-red-500 text-white font-black text-sm rounded-xl">
              <i className="ri-edit-line" /> 이슈 제보하기
            </Link>
          </div>
        )}
      </header>

      {/* ── 서브 네비 탭 바 ── */}
      <div className="fixed top-16 md:top-20 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
            {NAV_MENUS.map(menu => (
              <Link key={menu.href} href={menu.href} className={`flex items-center gap-2 px-5 py-4 text-sm font-black whitespace-nowrap border-b-2 transition-all duration-200 ${activeNav(menu.href) ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-200'}`}>
                <i className={`${menu.icon} text-base`} />{menu.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── 메인 콘텐츠 ── */}
      <main className="pt-[7.5rem] md:pt-36 pb-32 px-6">
        <div className="max-w-7xl mx-auto">

          {/* 페이지 히어로 */}
          <div className="py-12 md:py-16 mb-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold tracking-widest uppercase">
                  <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                  {isLatestMode ? '최신 이슈' : '전체 이슈'}
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight">
                  {isLatestMode ? '최근 접수된\n이슈 목록' : '모든 불합리\n사례 기록'}
                </h1>
                <p className="text-base md:text-lg text-gray-500 font-medium max-w-lg leading-relaxed">
                  {isLatestMode ? '최근 접수된 순으로 정렬된 이슈 목록입니다.' : '시민들이 직접 기록한 법집행 불균형 사례 전체를 확인하세요.'}
                </p>
              </div>
              <div className="flex gap-8 md:gap-10 shrink-0">
                {[
                  { label: "전체 이슈", value: allIssues.length },
                  { label: "공론화 진행", value: allIssues.filter(i => i.status === '공론화진행').length },
                  { label: "기관 전달", value: allIssues.filter(i => i.status === '기관전달').length },
                ].map(stat => (
                  <div key={stat.label} className="text-center md:text-right">
                    <div className="text-2xl md:text-3xl font-black text-gray-900">{stat.value}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 검색 + 정렬 */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); resetPage() }}
                placeholder="이슈 제목, 요약 검색..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/10 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setSearchQuery(''); setTagFilter('전체'); setStatusFilter('전체'); setDateFrom(''); setDateTo(''); resetPage() }}
                className={`inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl text-sm font-black transition-all duration-200 ${!searchQuery && tagFilter === '전체' && statusFilter === '전체' && !dateFrom && !dateTo ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'}`}
              >
                <i className="ri-search-2-line" /> 전체검색
              </button>
              <Link href="/issues?sort=latest" className={`inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl text-sm font-black transition-all duration-200 ${isLatestMode ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                <i className="ri-time-line" /> 최신순
              </Link>
            </div>
          </div>

          {/* 일자별 조회 */}
          <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-white border border-gray-100 rounded-2xl">
            <span className="text-xs font-black text-gray-500 flex items-center gap-1.5 shrink-0">
              <i className="ri-calendar-line text-gray-400" /> 일자별 조회
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); resetPage() }} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/10 transition-all cursor-pointer" />
              <span className="text-xs font-bold text-gray-300">~</span>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); resetPage() }} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/10 transition-all cursor-pointer" />
              {(dateFrom || dateTo) && (
                <button onClick={() => { setDateFrom(''); setDateTo(''); resetPage() }} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                  <i className="ri-close-line" /> 초기화
                </button>
              )}
            </div>
            {(dateFrom || dateTo) && (
              <span className="text-[11px] font-bold text-red-500 ml-1">
                {dateFrom && dateTo ? `${dateFrom} ~ ${dateTo}` : dateFrom ? `${dateFrom} 이후` : `${dateTo} 이전`}
                {' · '}{totalCount}건
              </span>
            )}
          </div>

          {/* 태그 필터 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORY_FILTERS.map(f => (
              <button key={f} onClick={() => { setTagFilter(f); resetPage() }} className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 ${tagFilter === f ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300 hover:text-gray-700'}`}>
                {f}
              </button>
            ))}
          </div>

          {/* 상태 필터 */}
          <div className="flex flex-wrap gap-2 mb-10">
            {STATUS_FILTERS.map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); resetPage() }} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all duration-200 ${statusFilter === s ? 'bg-red-500 text-white' : 'bg-white border border-gray-100 text-gray-400 hover:border-gray-300 hover:text-gray-600'}`}>
                {s !== '전체' && <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === s ? 'bg-white' : getStatusDot(s)}`} />}
                {s}
              </button>
            ))}
            <span className="ml-2 inline-flex items-center text-xs font-bold text-gray-400">{totalCount}건</span>
          </div>

          {/* 이슈 그리드 */}
          {displayed.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {displayed.map((issue, idx) => (
                <div
                  key={issue.id}
                  onClick={() => openModal(issue.id)}
                  className="group bg-white rounded-[2rem] p-7 md:p-8 border border-gray-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col h-full"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${getStatusStyle(issue.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(issue.status)}`} />
                      {issue.status}
                    </span>
                    <span className="text-[10px] font-bold text-gray-300">{issue.date}</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-extrabold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-red-500 transition-colors duration-300 flex-grow">
                    {issue.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400 font-medium mb-6 line-clamp-2 leading-relaxed">
                    {issue.summary}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {issue.tags.map((tag, ti) => (
                      <span key={`${tag}-${ti}`} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-50 text-gray-400 border border-gray-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-5 border-t border-gray-50 mt-auto">
                    <div className="flex items-center gap-1.5 text-red-500 font-black text-sm">
                      <i className="ri-heart-fill" />
                      {issue.support.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                      <i className="ri-map-pin-2-fill" /> {issue.region}
                      {issue.attachments.length > 0 && (
                        <><span className="text-gray-200">·</span><i className="ri-attachment-2" /><span>{issue.attachments.length}</span></>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center">
              <i className="ri-search-line text-5xl text-gray-200 mb-5 block" />
              <p className="text-lg font-black text-gray-400 mb-2">검색 결과가 없습니다</p>
              <p className="text-sm text-gray-300 font-medium">다른 키워드나 필터를 사용해 보세요.</p>
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-14">
              {/* 이전 */}
              <button
                onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:border-gray-900 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
              >
                <i className="ri-arrow-left-s-line text-lg" />
              </button>

              {/* 페이지 번호 */}
              {getPageNumbers().map((page, i) =>
                page === '...' ? (
                  <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-300 text-sm font-bold">···</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => { setCurrentPage(page as number); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-black transition-all ${
                      currentPage === page
                        ? 'bg-gray-900 text-white shadow-lg'
                        : 'border border-gray-200 bg-white text-gray-500 hover:border-gray-900 hover:text-gray-900'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              {/* 다음 */}
              <button
                onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:border-gray-900 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
              >
                <i className="ri-arrow-right-s-line text-lg" />
              </button>
            </div>
          )}

          {/* 페이지 정보 */}
          {totalPages > 1 && (
            <p className="text-center text-xs font-bold text-gray-300 mt-4">
              {totalCount}건 중 {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}건 표시 · {currentPage} / {totalPages} 페이지
            </p>
          )}

          {/* 하단 CTA */}
          <div className="mt-20 text-center space-y-4">
            <p className="text-sm text-gray-400 font-bold">불합리한 사례를 목격하셨나요?</p>
            <Link href="/#register" className="inline-flex items-center gap-3 px-10 py-5 bg-gray-900 text-white font-black rounded-2xl hover:bg-red-500 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group text-base md:text-lg">
              직접 이슈 제보하기
              <i className="ri-arrow-right-up-line group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </main>

      {/* ── 이슈 상세 모달 ── */}
      {activeModalId && currentModalIssue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-4" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-50 px-8 md:px-10 py-6 md:py-8 flex items-start justify-between gap-4">
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-black border tracking-wider uppercase ${getStatusStyle(currentModalIssue.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(currentModalIssue.status)}`} />
                    {currentModalIssue.status}
                  </span>
                  <span className="text-[10px] font-bold text-gray-300 tracking-widest uppercase">
                    {currentModalIssue.region} · {currentModalIssue.date}
                  </span>
                </div>
                <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tighter leading-snug">{currentModalIssue.title}</h2>
              </div>
              <button onClick={closeModal} className="shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gray-50 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all duration-300">
                <i className="ri-close-line text-xl md:text-2xl" />
              </button>
            </div>

            <div className="overflow-y-auto flex-grow p-8 md:p-10 space-y-10 no-scrollbar">
              {/* 공감 패널 */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
                <div className="space-y-1 text-center md:text-left">
                  <div className="text-5xl md:text-6xl font-black tracking-tighter text-red-500">
                    {(supportedIds.includes(currentModalIssue.id) ? currentModalIssue.support + 1 : currentModalIssue.support).toLocaleString()}
                  </div>
                  <p className="text-xs font-bold text-gray-400 tracking-wide uppercase">명이 이 상식에 지지를 보냈습니다</p>
                </div>
                <button
                  onClick={() => setSupportedIds(prev => prev.includes(currentModalIssue.id) ? prev.filter(id => id !== currentModalIssue.id) : [...prev, currentModalIssue.id])}
                  className={`px-8 py-4 md:px-10 md:py-5 rounded-2xl font-black text-base md:text-lg transition-all duration-500 active:scale-95 ${supportedIds.includes(currentModalIssue.id) ? 'bg-white/10 text-white border border-white/10 hover:bg-white/20' : 'bg-red-500 text-white shadow-2xl shadow-red-500/40 hover:bg-red-600'}`}
                >
                  {supportedIds.includes(currentModalIssue.id) ? '지지를 철회하시겠습니까?' : '👍 상식에 지지하기'}
                </button>
              </div>

              {/* 내용 */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-10">
                <div className="space-y-3">
                  <h3 className="text-base md:text-lg font-black text-gray-900 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-red-500 rounded-full" />사건 개요
                  </h3>
                  <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed bg-gray-50 p-5 md:p-6 rounded-2xl border border-gray-100">{currentModalIssue.overview}</p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-base md:text-lg font-black text-gray-900 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-red-500 rounded-full" />상식적 문제점
                  </h3>
                  <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed bg-gray-50 p-5 md:p-6 rounded-2xl border border-gray-100">{currentModalIssue.sense}</p>
                </div>
              </div>

              {/* 첨부 자료 */}
              {currentModalIssue.attachments.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-black text-gray-900 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-gray-900 rounded-full" />검증된 증거 자료
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentModalIssue.attachments.map((raw, i) => {
                      const att = normalizeAttachment(raw)
                      return (
                        <button key={i} onClick={() => { setActiveAttachment(att); setIsAttachmentViewerOpen(true) }} className="w-full text-left flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-red-200 hover:bg-red-50/30 transition-all group">
                          <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-gray-400 group-hover:text-red-500 transition-colors shadow-sm">
                            <i className={att.mime_type === 'application/pdf' ? 'ri-file-pdf-2-line text-lg' : 'ri-attachment-2 text-lg'} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-700 truncate">{att.original_name}</p>
                            <p className="text-[11px] font-medium text-gray-400 mt-0.5">클릭하여 보기</p>
                          </div>
                          <i className="ri-eye-line text-gray-300 group-hover:text-red-400 transition-colors" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 채팅 */}
              <div className="space-y-4 pt-6 border-t border-gray-50">
                <h3 className="text-base md:text-lg font-black text-gray-900 flex items-center gap-3">
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
        fileName={activeAttachment?.original_name}
        fileUrl={activeAttachment?.file_url}
        mimeType={activeAttachment?.mime_type}
        onClose={() => { setIsAttachmentViewerOpen(false); setActiveAttachment(null) }}
      />

      {/* ── 푸터 ── */}
      <footer className="bg-gray-900 text-white py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
              <span className="text-2xl md:text-3xl font-black tracking-tighter">시민신문고</span>
            </div>
            <p className="text-gray-500 font-bold max-w-sm leading-relaxed text-sm md:text-base">증거와 구조로 '상식'을 시각화합니다.<br />개인의 분노가 아닌 데이터로 세상을 바꿉니다.</p>
            <div className="flex gap-4">
              {["ri-facebook-fill", "ri-twitter-x-fill", "ri-instagram-line", "ri-youtube-fill"].map(icon => (
                <a key={icon} href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500 transition-all duration-300"><i className={icon} /></a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-6 md:mb-8">Platform</h4>
            <ul className="space-y-3 md:space-y-4 font-bold text-xs md:text-sm text-gray-400">
              {[{ label: "전체 이슈", href: "/issues" }, { label: "공감 랭킹", href: "/ranking" }, { label: "제보 가이드", href: "/guide" }, { label: "데이터 아카이브", href: "/archive" }].map(item => (
                <li key={item.label}><Link href={item.href} className="hover:text-white transition-colors hover:translate-x-1 inline-block">{item.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-6 md:mb-8">Information</h4>
            <ul className="space-y-3 md:space-y-4 font-bold text-xs md:text-sm text-gray-400">
              {[{ label: "운영 원칙", href: "/principles" }, { label: "개인정보 처리방침", href: "/privacy" }, { label: "이용 약관", href: "/terms" }, { label: "법률자문단 및 시민배심원", href: "/advisory" }].map(item => (
                <li key={item.label}><Link href={item.href} className="hover:text-white transition-colors hover:translate-x-1 inline-block">{item.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 md:mt-24 pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-gray-600 tracking-widest uppercase">© 2026 Citizen Justice. All Rights Reserved.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/issues" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-black text-gray-300 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all duration-300">
              <i className="ri-file-list-3-line" /> 전체 이슈보기
            </Link>
            <span className="text-[10px] font-black text-gray-600 tracking-widest uppercase">Version 1.0.0-Beta</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">System Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function IssuesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F7F4]" />}>
      <IssuesContent />
    </Suspense>
  )
}
