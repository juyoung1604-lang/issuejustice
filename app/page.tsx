'use client'

import { useState, useEffect } from 'react'
import { FileUpload, type UploadedAttachment } from '@/components/FileUpload'

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
  }
]

const STATS = { totalIssues: 248, totalSupport: 18400, resolvedCases: 12 }

const PRINCIPLES = [
  { icon: "📋", title: "증거 기반", description: "판결문, 처분서, 공문 등 실제 자료를 첨부합니다. 관리자 검토 후 공개되어 신뢰성을 확보합니다. 허위 사실은 즉시 삭제됩니다." },
  { icon: "🔒", title: "개인정보 보호", description: "실명 공개는 하지 않습니다. 휴대폰 인증으로만 식별하며, 개인정보와 공무원 실명은 자동 마스킹됩니다." },
  { icon: "⚖️", title: "공익 목적 명시", description: "본 플랫폼은 공익 목적의 의견 개진 플랫폼입니다. 게시 내용은 사실로 단정하지 않으며, 다양한 시각이 존재할 수 있습니다." },
  { icon: "👥", title: "통제형 댓글", description: "사실 보완과 법률 의견 중심의 댓글만 허용합니다. 감정적 비방, 욕설은 운영자에 의해 즉시 삭제됩니다." },
  { icon: "🔍", title: "관리자 사전 검토", description: "모든 이슈는 공개 전 관리자 검토를 거칩니다. 법률 자문단이 검토한 이슈에는 별도 배지가 부여됩니다." },
  { icon: "📡", title: "공론화 연결", description: "누적된 이슈는 언론·국회·감사원 전달용 리포트로 생성됩니다. 개인의 목소리를 제도적 변화로 연결합니다." }
]

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeModalId, setActiveModalId] = useState<number | null>(null)
  const [toast, setToast] = useState({ message: "", visible: false })
  const [supportedIds, setSupportedIds] = useState<number[]>([])
  const [issueFilter, setIssueFilter] = useState("전체")
  const [rankingPeriod, setRankingPeriod] = useState("주간")
  const [reportAttachments, setReportAttachments] = useState<UploadedAttachment[]>([])

  // 제보 폼 상태
  const [formStep, setFormStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    field: "",
    region: "",
    date: "",
    overview: "",
    problemSense: ""
  })
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible")
        }
      })
    }, { threshold: 0.1 })

    const elements = document.querySelectorAll(".fade-in")
    elements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [issueFilter, formStep])

  const scrollToSection = (id: string) => {
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

  const openModal = (id: number) => {
    setActiveModalId(id)
    document.body.style.overflow = "hidden"
  }

  const closeModal = () => {
    setActiveModalId(null)
    document.body.style.overflow = "auto"
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedRequests.length === 0) {
      showToast("요청 사항을 1개 이상 선택해 주세요.")
      return
    }

    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          enforcement_type: formData.type,
          field_category: formData.field,
          region: formData.region,
          occurred_at: formData.date || null,
          overview: formData.overview,
          sense: formData.problemSense,
          requests: selectedRequests,
        }),
      })
      if (!res.ok) {
        const { error } = await res.json()
        showToast(`오류: ${error || '제출에 실패했습니다.'}`)
        return
      }
    } catch {
      showToast("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
      return
    }

    const attachmentMessage =
      reportAttachments.length > 0
        ? ` 첨부자료 ${reportAttachments.length}건이 함께 접수되었습니다.`
        : " 검토 후 공개됩니다."
    showToast(`제보가 성공적으로 접수되었습니다.${attachmentMessage}`)
    setFormStep(1)
    setFormData({
      title: "",
      type: "",
      field: "",
      region: "",
      date: "",
      overview: "",
      problemSense: ""
    })
    setSelectedRequests([])
    setReportAttachments([])
  }

  const toggleRequest = (req: string) => {
    setSelectedRequests(prev => 
      prev.includes(req) ? prev.filter(r => r !== req) : [...prev, req]
    )
  }

  const filteredIssues = issueFilter === "전체" ? ISSUES : ISSUES.filter(i => i.tags.includes(issueFilter))
  const sortedRanking = [...ISSUES].sort((a, b) => b.support - a.support).slice(0, 5)

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "공론화진행": return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "검증중": return "bg-blue-50 text-blue-700 border-blue-200"
      case "기관전달": return "bg-orange-50 text-orange-700 border-orange-200"
      case "접수됨": return "bg-amber-50 text-amber-700 border-amber-200"
      default: return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "공론화진행": return "🟢"
      case "검증중": return "🔵"
      case "기관전달": return "🟠"
      case "접수됨": return "🟡"
      default: return "⚪"
    }
  }

  const getRankBadgeStyle = (index: number) => {
    switch (index) {
      case 0: return "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-lg"
      case 1: return "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-white shadow-lg"
      case 2: return "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-white shadow-lg"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const currentModalIssue = ISSUES.find(i => i.id === activeModalId)

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* 헤더 */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${isScrolled ? "glass-effect shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2.5 text-xl font-bold hover:opacity-70 transition-all duration-300 cursor-pointer group">
              <div className="w-2 h-2 bg-red-500 rounded-full group-hover:scale-125 transition-transform duration-300" />
              <span className="text-gray-900">시민신문고</span>
            </button>
            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md">베타</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {["이슈 목록", "인기 랭킹", "제보하기", "운영 원칙"].map((label, i) => {
              const ids = ["issues", "ranking", "register", "principles"]
              return (
                <button key={label} onClick={() => scrollToSection(ids[i])} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-all duration-300 cursor-pointer whitespace-nowrap">
                  {label}
                </button>
              )
            })}
            <div className="w-px h-5 bg-gray-200 mx-2" />
            <button onClick={() => scrollToSection("register")} className="px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer whitespace-nowrap">
              + 이슈 제보
            </button>
          </nav>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section id="hero" className="relative pt-24 pb-16 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slideUp">
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">시민 공론 플랫폼</div>
              <h1 className="text-6xl md:text-7xl font-black leading-tight">
                상식을<br />기록하면<br /><em className="not-italic text-red-500">세상이 바뀐다</em>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                불합리한 법집행 사례를 증거와 구조로 기록하고, 시민의 공감으로 공론화합니다. 개인의 분노가 아닌 데이터로 상식을 시각화합니다.
              </p>
              <div className="flex gap-8">
                <div>
                  <div className="text-4xl font-black text-gray-900">{STATS.totalIssues}</div>
                  <div className="text-sm text-gray-600 mt-1">등록된 이슈</div>
                </div>
                <div>
                  <div className="text-4xl font-black text-gray-900">{(STATS.totalSupport / 1000).toFixed(1)}k</div>
                  <div className="text-sm text-gray-600 mt-1">누적 공감수</div>
                </div>
                <div>
                  <div className="text-4xl font-black text-gray-900">{STATS.resolvedCases}</div>
                  <div className="text-sm text-gray-600 mt-1">개선 완료 사례</div>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => scrollToSection("register")} className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap text-lg">
                  이슈 제보하기 →
                </button>
                <button onClick={() => scrollToSection("issues")} className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:border-gray-400 transition-colors cursor-pointer whitespace-nowrap text-lg">
                  전체 이슈 보기
                </button>
              </div>
            </div>

            <div className="relative animate-slideUp" style={{ animationDelay: "0.2s" }}>
              <div className="absolute -right-12 -top-12 text-[200px] font-black text-gray-100 select-none pointer-events-none">고발</div>
              <div className="relative space-y-3 bg-white/50 backdrop-blur-sm p-6 rounded-2xl">
                {ISSUES.slice(0, 5).map((issue, i) => (
                  <div key={issue.id} onClick={() => openModal(issue.id)} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${i < 3 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"}`}>
                      {i < 3 ? "▲" : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-red-500 transition-colors">{issue.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {issue.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{tag}</span>
                        ))}
                        <span className="text-xs text-gray-500">{issue.region}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-lg font-bold text-gray-900">{issue.support.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">공감</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 이슈 리스트 섹션 */}
      <section id="issues" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div className="animate-slideUp">
              <div className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-3">최신 이슈</div>
              <h2 className="text-5xl font-black text-gray-900 leading-tight">기록된 불합리들</h2>
            </div>
            <button className="text-sm font-semibold text-red-500 hover:text-red-600 hover:gap-2 flex items-center gap-1 transition-all duration-300 cursor-pointer whitespace-nowrap group">
              전체보기 <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5 mb-10 animate-slideUp">
            {["전체", "과잉단속", "선별집행", "형평성", "절차위반", "권한남용"].map(filter => (
              <button key={filter} onClick={() => setIssueFilter(filter)} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${issueFilter === filter ? "bg-gray-900 text-white shadow-lg scale-105" : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md hover:scale-105 border border-gray-200"}`}>
                {filter}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
              <div key={issue.id} onClick={() => openModal(issue.id)} className="fade-in bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 smooth-shadow hover:smooth-shadow-lg hover:scale-[1.02] transition-all duration-500 cursor-pointer group">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusStyle(issue.status)}`}>
                      {getStatusEmoji(issue.status)} {issue.status}
                    </span>
                    {issue.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium">{tag}</span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 font-medium">{issue.date}</div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-500 transition-colors duration-300">{issue.title}</h3>
                <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">{issue.summary}</p>
                <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-red-500 font-bold">
                    <i className="ri-heart-fill" />
                    <span>{issue.support.toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-gray-500 font-medium flex items-center gap-1">
                    <i className="ri-map-pin-line" />
                    {issue.region}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 랭킹 섹션 */}
      <section id="ranking" className="py-24 px-6 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div className="animate-slideUp">
              <div className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">인기 랭킹</div>
              <h2 className="text-5xl font-black text-white leading-tight">가장 많은 공감을<br />받은 이슈</h2>
            </div>
            <button className="text-sm font-semibold text-red-400 hover:text-red-300 hover:gap-2 flex items-center gap-1 transition-all duration-300 cursor-pointer whitespace-nowrap group">
              전체보기 <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>

          <div className="flex gap-1 mb-10 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-1.5 w-fit animate-slideUp border border-gray-700">
            {["주간", "월간", "누적"].map((p) => (
              <button key={p} onClick={() => setRankingPeriod(p)} className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${rankingPeriod === p ? "bg-white text-gray-900 shadow-lg" : "text-gray-400 hover:text-white hover:bg-gray-700/50"}`}>
                {p}인기
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {sortedRanking.map((issue, i) => (
              <div key={issue.id} onClick={() => openModal(issue.id)} className="fade-in flex items-center gap-6 p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl hover:bg-gray-700/50 hover:border-gray-600 hover:scale-[1.01] transition-all duration-500 cursor-pointer group">
                <div className={`flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-xl text-2xl font-black transition-transform duration-300 group-hover:scale-110 ${getRankBadgeStyle(i)}`}>
                  {i < 3 ? `0${i + 1}` : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {issue.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-700/70 text-gray-300 border border-gray-600 rounded-lg text-xs font-medium">{tag}</span>
                    ))}
                    <span className="px-3 py-1 bg-gray-700/70 text-gray-300 border border-gray-600 rounded-lg text-xs font-medium flex items-center gap-1">
                      <i className="ri-map-pin-line" /> {issue.region}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors duration-300">{issue.title}</h3>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-3xl font-black text-red-400 group-hover:scale-110 transition-transform duration-300">{issue.support.toLocaleString()}</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider mt-1 font-semibold">지지수</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 제보 섹션 */}
      <section id="register" className="py-20 px-6 bg-[#F8F7F4]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-2">이슈 제보</div>
            <h2 className="text-4xl font-black text-gray-900">당신의 경험을<br />기록하세요</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <p className="text-lg text-gray-600 leading-relaxed">사실 중심으로 작성된 이슈는 관리자 검토 후 공개됩니다. 법률 자문단이 검토한 이슈에는 별도 배지가 부여됩니다.</p>
              <div className="space-y-6">
                {[
                  ["01", "기본 정보 입력", "발생 지역, 시점, 관련 기관, 법집행 유형을 선택합니다."],
                  ["02", "구조화된 본문 작성", "사건 개요, 문제점, 상식적 판단, 유사 사례를 항목별로 기술합니다."],
                  ["03", "증빙 자료 첨부", "판결문, 처분서, 공문 등을 개인정보 가림 처리 후 첨부합니다."],
                  ["04", "관리자 검토 후 공개", "허위사실이나 감정적 표현이 없는지 확인 후 1~3일 내 공개됩니다."]
                ].map(([num, title, desc]) => (
                  <div key={num} className="flex gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center ${num === '01' ? 'bg-red-500' : 'bg-gray-900'} text-white font-black text-lg rounded-xl`}>{num}</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
                      <p className="text-sm text-gray-600">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-bold text-gray-400">단계 {formStep} / 2</span>
                <div className="flex gap-2 w-32">
                  <div className={`flex-1 h-2 rounded-full transition-colors ${formStep >= 1 ? "bg-red-500" : "bg-gray-200"}`} />
                  <div className={`flex-1 h-2 rounded-full transition-colors ${formStep >= 2 ? "bg-red-500" : "bg-gray-200"}`} />
                </div>
              </div>
              
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {formStep === 1 ? (
                  <div className="space-y-6 animate-slideUp">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">제목 <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="사건을 한 눈에 알 수 있는 제목을 입력하세요." 
                        maxLength={100} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm" 
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">법집행 유형 <span className="text-red-500">*</span></label>
                        <select 
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm" 
                          required
                        >
                          <option value="">선택하세요</option>
                          {["과잉단속", "선별집행", "형평성", "절차위반", "권한남용", "명확성없음", "행정편의", "기타"].map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">분야 <span className="text-red-500">*</span></label>
                        <select 
                          value={formData.field}
                          onChange={(e) => setFormData({...formData, field: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm" 
                          required
                        >
                          <option value="">선택하세요</option>
                          {["형사", "세무", "건축", "영업", "노동", "환경", "교통", "교육", "기타"].map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">지역 <span className="text-red-500">*</span></label>
                        <select 
                          value={formData.region}
                          onChange={(e) => setFormData({...formData, region: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm" 
                          required
                        >
                          <option value="">선택하세요</option>
                          {["서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"].map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">발생 시점 <span className="text-red-500">*</span></label>
                        <input 
                          type="date" 
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm" 
                          required 
                        />
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        if (formData.title && formData.type && formData.field && formData.region && formData.date) {
                          setFormStep(2)
                        } else {
                          showToast("모든 필수 항목을 입력해 주세요.")
                        }
                      }}
                      className="w-full px-6 py-4 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap text-lg"
                    >
                      상세 내용 작성하기 <i className="ri-arrow-right-line" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 animate-slideUp">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">요청 사항 <span className="text-red-500">*</span></label>
                      <div className="flex flex-wrap gap-2">
                        {["재검토", "감사", "제도개선", "공론화"].map(req => (
                          <button 
                            key={req} 
                            type="button" 
                            onClick={() => toggleRequest(req)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${selectedRequests.includes(req) ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                          >
                            {req}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">사건 개요 <span className="text-red-500">*</span></label>
                      <textarea 
                        value={formData.overview}
                        onChange={(e) => setFormData({...formData, overview: e.target.value})}
                        placeholder="언제, 어디서, 무슨 일이 있었는지 사실 중심으로 기술해 주세요." 
                        rows={4} 
                        maxLength={500} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">상식적으로 문제되는 지점 <span className="text-red-500">*</span></label>
                      <textarea 
                        value={formData.problemSense}
                        onChange={(e) => setFormData({...formData, problemSense: e.target.value})}
                        placeholder="왜 이 법 집행이 상식에 어긋난다고 생각하는지 논리적으로 기술해 주세요." 
                        rows={4} 
                        maxLength={500} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">증빙 자료 첨부</label>
                      <p className="text-xs text-gray-500 mb-3">직접 파일 업로드(PDF/JPG/PNG/WEBP, 최대 10MB) 또는 클라우드 공유 URL 입력 방식을 사용할 수 있습니다.</p>
                      <FileUpload mode="local" onFilesChange={setReportAttachments} />
                      <p className="text-xs text-gray-500 mt-2">현재 첨부된 자료: {reportAttachments.length}건</p>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        type="button" 
                        onClick={() => setFormStep(1)}
                        className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 text-gray-900 font-bold rounded-lg hover:border-gray-400 transition-colors"
                      >
                        이전으로
                      </button>
                      <button 
                        type="submit" 
                        className="flex-[2] px-6 py-4 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap text-lg"
                      >
                        <span>📋</span> <span>제보 등록하기</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 원칙 섹션 */}
      <section id="principles" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 animate-slideUp">
            <div className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-3">플랫폼 원칙</div>
            <h2 className="text-5xl font-black text-gray-900 leading-tight">신뢰가 공론화의<br />기반입니다</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className="fade-in bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 smooth-shadow hover:smooth-shadow-lg hover:scale-[1.02] hover:border-gray-300 transition-all duration-500 group">
                <div className="w-16 h-16 flex items-center justify-center text-4xl mb-5 group-hover:scale-110 transition-transform duration-300">{principle.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-red-500 transition-colors duration-300">{principle.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-16 mb-16">
            <div>
              <div className="flex items-center gap-2.5 text-2xl font-bold mb-5">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span>시민신문고</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">증거와 구조로 '상식'을 시각화하는 시민 공론 플랫폼. 개인의 분노가 아닌 데이터로 세상을 바꿉니다.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-5 text-lg">플랫폼</h4>
              <div className="space-y-3">
                {["전체 이슈", "인기 랭킹", "이슈 제보", "자료 아카이브", "제보 가이드"].map((label, i) => {
                  const ids = ["issues", "ranking", "register", "", ""]
                  return (
                    <button key={label} onClick={() => ids[i] && scrollToSection(ids[i])} className="block text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm cursor-pointer text-left">
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-5 text-lg">정보</h4>
              <div className="space-y-3">
                {["운영 원칙", "법률 자문단", "개인정보처리방침", "이용약관", "문의하기"].map((label, i) => {
                  const ids = ["principles", "", "", "", ""]
                  return (
                    <button key={label} onClick={() => ids[i] && scrollToSection(ids[i])} className="block text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm cursor-pointer text-left">
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-10">
            <p className="text-gray-400 text-sm mb-3 font-medium">© 2025 시민신문고. All rights reserved.</p>
            <p className="text-gray-500 text-xs mb-3 leading-relaxed">본 플랫폼은 공익 목적의 의견 개진 플랫폼이며, 게시 내용은 사실로 단정하지 않습니다.</p>
            <p className="text-gray-600 text-xs">리액트 + 넥스트JS 기반<br />v1.0.0-베타</p>
          </div>
        </div>
      </footer>

      {/* 모달 */}
      {activeModalId && currentModalIssue && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300 opacity-100`} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className={`bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden smooth-shadow-xl transition-all duration-500 scale-100 opacity-100`}>
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 p-6 z-10">
              <div className="flex items-start justify-between mb-4">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusStyle(currentModalIssue.status)}`}>
                  {getStatusEmoji(currentModalIssue.status)} {currentModalIssue.status}
                </span>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full text-2xl cursor-pointer w-10 h-10 flex items-center justify-center transition-all duration-300">✕</button>
              </div>
              <h2 className="text-3xl font-black text-gray-900 leading-tight">{currentModalIssue.title}</h2>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="p-6">
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 mb-8 smooth-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-5xl font-black text-gray-900 mb-2">{(supportedIds.includes(currentModalIssue.id) ? currentModalIssue.support + 1 : currentModalIssue.support).toLocaleString()}</div>
                      <div className="text-sm text-gray-600 font-medium">명이 이 이슈에 공감합니다</div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {["형평성", "과잉처벌", "법해석", "공익성"].map(reason => (
                          <button key={reason} className="px-4 py-2 rounded-lg text-xs font-semibold bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:scale-105 transition-all duration-300 cursor-pointer">
                            {reason}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => toggleSupport(currentModalIssue.id)} className={`px-7 py-3.5 rounded-xl font-bold transition-all duration-300 cursor-pointer whitespace-nowrap hover:scale-105 ${supportedIds.includes(currentModalIssue.id) ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-red-500 text-white hover:bg-red-600 shadow-lg"}`}>
                      {supportedIds.includes(currentModalIssue.id) ? "공감 취소" : "👍 공감합니다"}
                    </button>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="animate-slideUp">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-red-500 rounded-full" />사건 개요
                    </h3>
                    <p className="text-gray-700 leading-relaxed pl-4">{currentModalIssue.overview}</p>
                  </div>
                  <div className="animate-slideUp">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-red-500 rounded-full" />문제가 된 법집행
                    </h3>
                    <p className="text-gray-700 leading-relaxed pl-4">{currentModalIssue.problem}</p>
                  </div>
                  <div className="animate-slideUp">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-red-500 rounded-full" />상식적 문제점
                    </h3>
                    <p className="text-gray-700 leading-relaxed pl-4">{currentModalIssue.sense}</p>
                  </div>
                  {currentModalIssue.attachments.length > 0 && (
                    <div className="animate-slideUp">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-red-500 rounded-full" />첨부 자료
                      </h3>
                      <div className="space-y-3 pl-4">
                        {currentModalIssue.attachments.map((file, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all duration-300 cursor-pointer group">
                            <i className="ri-file-text-line text-xl text-gray-400 group-hover:text-red-500 transition-colors w-6 h-6 flex items-center justify-center" />
                            <span className="text-sm text-gray-700 font-medium">{file}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 */}
      {toast.visible && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
          <div className="bg-gray-900 text-white px-8 py-4 rounded-2xl smooth-shadow-xl backdrop-blur-sm flex items-center gap-3">
            <i className="ri-checkbox-circle-fill text-green-400 text-xl w-6 h-6 flex items-center justify-center" />
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
