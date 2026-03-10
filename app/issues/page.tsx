'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import FileViewerModal from '@/components/FileViewerModal'
import IssueChatPanel from '@/components/IssueChatPanel'

// 메인 페이지의 데이터 구조와 동일하게 사용 (향후 API 연동 시 통합 관리 필요)
const ISSUES = [
  { id: 1, title: "A구청의 일방적인 영업정지 처분 사례", summary: "절차적 정당성 없는 행정 처분으로 인한 소상공인 피해 발생", support: 1245, date: "2024.03.08", region: "서울", tags: ["절차위반", "권한남용"], status: "공론화진행", overview: "A구청에서 사전 통지 없이 영업정지 처분을 내렸습니다.", sense: "행정절차법 제21조 위반 소지가 다분합니다.", attachments: ['처분서_A구.pdf'] },
  { id: 2, title: "교통 단속 카메라 오작동 의심 제보", summary: "특정 구간에서 동시 다발적인 과태료 부과 및 데이터 불일치", support: 892, date: "2024.03.07", region: "경기", tags: ["과잉단속", "형평성"], status: "검증중", overview: "카메라 센서 오류로 속도가 잘못 측정된 사례가 빈번합니다.", sense: "기기 결함에 대한 전수 조사가 필요합니다.", attachments: ['과태료고지서_B구.pdf', '단속현황_통계.xlsx'] },
  { id: 3, title: "대기업과 중소기업 간의 세무 조사 형평성", summary: "동일 사안에 대해 기업 규모별 상이한 잣대 적용 사례 기록", support: 3421, date: "2024.03.05", region: "인천", tags: ["선별집행", "형평성"], status: "기관전달", overview: "중소기업에만 가혹한 세무 조사가 반복되고 있습니다.", sense: "평등의 원칙과 조세 형평성에 어긋납니다.", attachments: ['세무조사결과통지서.pdf', '대기업_처분사례_비교.xlsx'] },
  { id: 4, title: "공원 부지 용도 변경 관련 절차 하자", summary: "주민 동의 없는 용도 변경 및 특정 업체 특혜 의혹", support: 2156, date: "2024.03.02", region: "부산", tags: ["절차위반", "권한남용"], status: "공론화진행", overview: "공원 부지가 갑자기 상업 지구로 변경되었습니다.", sense: "도시계획법상 주민 의견 수렴 절차가 누락되었습니다.", attachments: ['건축물대장.pdf'] },
  { id: 5, title: "전통시장 현대화 사업 예산 집행 불투명", summary: "사업 진행 과정에서의 예산 낭비 및 선정 기준 모호성", support: 567, date: "2024.02.28", region: "대전", tags: ["행정편의", "절차위반"], status: "접수됨", overview: "예산 집행 내역이 공개되지 않고 있습니다.", sense: "정보공개법 위반 및 예산 유용 가능성이 있습니다.", attachments: [] },
  { id: 6, title: "주택 밀집 구역 일방 통행 지정 민원", summary: "현장 실사 없는 일방 통행 지정으로 주민 불편 가중", support: 432, date: "2024.02.25", region: "광주", tags: ["행정편의"], status: "검증중", overview: "주민들의 의견을 전혀 반영하지 않은 도로 행정입니다.", sense: "현장 행정의 부재와 시민 불편 초래입니다.", attachments: ['시정권고서.pdf'] },
  { id: 7, title: "아파트 단지 내 택배 차량 진입 금지 처분", summary: "공공 도로 성격의 단지 내 도로 이용 제한에 대한 법적 쟁점", support: 1560, date: "2024.02.20", region: "경기", tags: ["형평성"], status: "공론화진행", overview: "택배 기사님들의 통행권이 침해받고 있습니다.", sense: "이동권 보장과 상생의 관점에서 문제가 있습니다.", attachments: [] },
  { id: 8, title: "환경 오염 유발 업체에 대한 봐주기식 단속", summary: "반복적인 폐수 배출에도 가벼운 경고 처분에 그치는 현장", support: 2890, date: "2024.02.15", region: "울산", tags: ["선별집행"], status: "기관전달", overview: "수년째 폐수가 방류되고 있으나 솜방망이 처벌뿐입니다.", sense: "환경법 집행의 실효성 확보가 절실합니다.", attachments: [] },
]

interface IssueAttachment {
  id?: string
  original_name: string
  file_url?: string
  file_type?: string
  mime_type?: string
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

const DEMO_ATTACHMENT_LIBRARY: Record<string, { url: string; mimeType: string }> = {
  '처분서_A구.pdf': { url: '/evidence/sample-proof.svg', mimeType: 'image/svg+xml' },
  '과태료고지서_B구.pdf': { url: '/evidence/sample-proof.svg', mimeType: 'image/svg+xml' },
  '세무조사결과통지서.pdf': { url: '/evidence/sample-proof.svg', mimeType: 'image/svg+xml' },
  '대기업_처분사례_비교.xlsx': { url: '/evidence/sample-comparison.csv', mimeType: 'text/csv' },
  '건축물대장.pdf': { url: '/evidence/sample-proof.svg', mimeType: 'image/svg+xml' },
  '시정권고서.pdf': { url: '/evidence/sample-proof.svg', mimeType: 'image/svg+xml' },
  '단속현황_통계.xlsx': { url: '/evidence/sample-comparison.csv', mimeType: 'text/csv' },
}

export default function IssuesPage() {
  const [filter, setFilter] = useState("전체")
  const [activeModalId, setActiveModalId] = useState<number | null>(null)
  const [supportedIds, setSupportedIds] = useState<number[]>([])
  const [activeAttachment, setActiveAttachment] = useState<IssueAttachment | null>(null)
  const [isAttachmentViewerOpen, setIsAttachmentViewerOpen] = useState(false)

  const filtered = filter === "전체" ? ISSUES : ISSUES.filter(i => i.tags.includes(filter))
  const currentModalIssue = ISSUES.find(i => i.id === activeModalId)

  const normalizeAttachment = (input: string | IssueAttachment): IssueAttachment => {
    if (typeof input !== 'string') return input
    const demo = DEMO_ATTACHMENT_LIBRARY[input]
    return {
      original_name: input,
      file_url: demo?.url,
      mime_type: demo?.mimeType || inferMimeTypeFromName(input),
      file_type: '증빙자료'
    }
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

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <Header />
      
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 섹션 */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4">
              <span className="w-1 h-1 bg-red-600 rounded-full animate-pulse" /> Archive
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-6">
              전체 불합리 사례
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl leading-relaxed">
              시민들이 기록한 모든 사례를 한눈에 확인하고 지지를 보낼 수 있습니다.<br />
              상식 밖의 집행, 데이터로 시각화합니다.
            </p>
          </div>

          {/* 필터 바 */}
          <div className="flex flex-wrap gap-2 mb-12">
            {["전체", "과잉단속", "선별집행", "형평성", "절차위반", "권한남용"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-3 rounded-2xl text-sm font-black transition-all duration-300 ${filter === f ? "bg-gray-900 text-white shadow-xl scale-105" : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-100"}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* 리스트 그리드 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((issue, idx) => (
              <div 
                key={issue.id} 
                onClick={() => setActiveModalId(issue.id)}
                className="bg-white rounded-[2rem] p-8 border border-gray-50 smooth-shadow hover:smooth-shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-8">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${getStatusStyle(issue.status)}`}>
                    {issue.status}
                  </span>
                  <span className="text-[11px] font-bold text-gray-300">{issue.date}</span>
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-4 line-clamp-2 leading-snug group-hover:text-red-500 transition-colors duration-300 flex-grow">
                  {issue.title}
                </h3>
                <p className="text-sm text-gray-500 font-medium mb-8 line-clamp-2 leading-relaxed italic">
                  "{issue.summary}"
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                  <div className="flex items-center gap-2 text-red-500 font-black tracking-tighter">
                    <i className="ri-heart-fill animate-pulse" />
                    <span>{issue.support.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                    <i className="ri-map-pin-2-fill" /> {issue.region}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-32 text-center">
              <i className="ri-search-line text-6xl text-gray-200 mb-6 block" />
              <p className="text-xl font-bold text-gray-400">해당 카테고리의 사례가 아직 없습니다.</p>
            </div>
          )}
        </div>
      </main>

      {/* 상세 모달 (메인 페이지와 동일한 로직) */}
      {activeModalId && currentModalIssue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-4" onClick={(e) => e.target === e.currentTarget && setActiveModalId(null)}>
          <div className="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-hidden smooth-shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-50 px-10 py-8 z-10 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border tracking-wider uppercase ${getStatusStyle(currentModalIssue.status)}`}>
                    {currentModalIssue.status}
                  </span>
                  <span className="text-[10px] font-bold text-gray-300 tracking-widest uppercase">{currentModalIssue.region} · {currentModalIssue.date}</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{currentModalIssue.title}</h2>
              </div>
              <button onClick={() => setActiveModalId(null)} className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all duration-300">
                <i className="ri-close-line text-2xl" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-grow p-10 space-y-12 no-scrollbar">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
                <div className="space-y-2 text-center md:text-left">
                  <div className="text-6xl font-black tracking-tighter text-red-500">{(supportedIds.includes(currentModalIssue.id) ? currentModalIssue.support + 1 : currentModalIssue.support).toLocaleString()}</div>
                  <p className="text-sm font-bold text-gray-400 tracking-wide uppercase">명이 이 상식에 지지를 보냈습니다</p>
                </div>
                <button 
                  onClick={() => setSupportedIds(prev => prev.includes(currentModalIssue.id) ? prev.filter(id => id !== currentModalIssue.id) : [...prev, currentModalIssue.id])}
                  className={`px-10 py-5 rounded-2xl font-black text-lg transition-all duration-500 active:scale-95 ${supportedIds.includes(currentModalIssue.id) ? "bg-white/10 text-white border border-white/10 hover:bg-white/20" : "bg-red-500 text-white shadow-2xl shadow-red-500/40 hover:bg-red-600"}`}
                >
                  {supportedIds.includes(currentModalIssue.id) ? "지지를 철회하시겠습니까?" : "👍 상식에 지지하기"}
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-red-500 rounded-full" />사건 개요
                  </h3>
                  <p className="text-gray-500 font-medium leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100">{currentModalIssue.overview}</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-red-500 rounded-full" />상식적 문제점
                  </h3>
                  <p className="text-gray-500 font-medium leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100">{currentModalIssue.sense}</p>
                </div>
              </div>

              {currentModalIssue.attachments.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-gray-900 rounded-full" />검증된 증거 자료
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentModalIssue.attachments.map((rawAttachment, i) => {
                      const attachment = normalizeAttachment(rawAttachment)
                      const iconClass = attachment.mime_type === 'application/pdf' ? 'ri-file-pdf-2-line' : 'ri-attachment-2'
                      return (
                        <button key={i} onClick={() => { setActiveAttachment(attachment); setIsAttachmentViewerOpen(true) }} className="w-full text-left flex items-center gap-4 p-5 bg-gray-50 border border-gray-100 rounded-2xl hover:border-red-200 transition-all group">
                          <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-xl text-gray-400 group-hover:text-red-500 transition-colors">
                            <i className={iconClass} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-600 truncate">{attachment.original_name}</p>
                            <p className="text-[11px] font-bold text-gray-400 mt-1">클릭하여 보기</p>
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
        fileName={activeAttachment?.original_name}
        fileUrl={activeAttachment?.file_url}
        mimeType={activeAttachment?.mime_type}
        onClose={() => { setIsAttachmentViewerOpen(false); setActiveAttachment(null) }}
      />

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white py-24 px-6 mt-32">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="flex items-center justify-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-3xl font-black tracking-tighter">시민신문고</span>
          </div>
          <p className="text-gray-500 font-bold max-w-sm mx-auto">
            증거와 구조로 '상식'을 시각화합니다.<br />
            © 2026 Citizen Justice. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
