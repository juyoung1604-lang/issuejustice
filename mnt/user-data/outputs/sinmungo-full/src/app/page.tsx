// app/page.tsx
import Link from 'next/link'
import { ArrowRight, Shield, TrendingUp, Users } from 'lucide-react'
import { getIssues, getRanking } from '@/lib/api/issues'
import { IssueCard } from '@/components/issues/IssueCard'
import { STATUS_CONFIG } from '@/types'
import type { IssueStatus } from '@/types'

export default async function HomePage() {
  const [recent, ranking] = await Promise.all([
    getIssues({ sort: 'latest', per_page: 4 }),
    getRanking('weekly', 5),
  ])

  const statusCounts: Partial<Record<IssueStatus, number>> = {}
  // 실제로는 별도 집계 쿼리가 필요하지만, 여기서는 UI만 표시
  const mockCounts: Record<IssueStatus, number> = {
    '접수됨': 42, '검증중': 18, '공론화진행': 9, '기관전달': 3, '종결': 24
  }

  return (
    <main>
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-blue-400 text-sm font-semibold mb-3 tracking-wide uppercase">
            시민 공론 플랫폼
          </p>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
            증거와 구조로<br />
            <span className="text-blue-400">&apos;상식&apos;</span>을 시각화합니다
          </h1>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            불합리한 법집행 사례를 기록하고, 시민의 지지로 공론화하여
            언론·국회·감사기관에 전달합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/issues/new" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors flex items-center justify-center gap-2">
              이슈 제보하기 <ArrowRight size={18} />
            </Link>
            <Link href="/issues" className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-xl transition-colors">
              이슈 둘러보기
            </Link>
          </div>

          {/* 상태 카운터 */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {(Object.entries(mockCounts) as [IssueStatus, number][]).map(([status, count]) => (
              <div key={status} className="text-center">
                <p className="text-2xl font-black">{count}</p>
                <p className="text-xs text-slate-400">{STATUS_CONFIG[status].emoji} {STATUS_CONFIG[status].label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 플랫폼 특징 */}
      <section className="py-12 px-4 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: '증거 기반',
              desc: '판결문, 처분서 등 실제 자료를 첨부. 관리자 검토 후 공개되어 신뢰성을 확보합니다.',
            },
            {
              icon: Users,
              title: '시민 공감',
              desc: '휴대폰 인증 회원이 공감 이유와 함께 추천. 여론을 수치로 시각화합니다.',
            },
            {
              icon: TrendingUp,
              title: '공론화 연결',
              desc: '누적된 이슈를 언론·국회·감사기관 전달용 리포트로 자동 생성합니다.',
            },
          ].map(feature => (
            <div key={feature.title} className="flex gap-4">
              <div className="bg-blue-50 rounded-xl w-12 h-12 flex items-center justify-center shrink-0">
                <feature.icon size={22} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* 최신 이슈 */}
        <section className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-900">최신 이슈</h2>
            <Link href="/issues" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              전체보기 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {recent.data.map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </section>

        {/* 주간 랭킹 */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-900">🏆 주간 TOP</h2>
            <Link href="/ranking" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              전체보기 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {ranking.map((issue, i) => (
              <Link key={issue.id} href={`/issues/${issue.id}`} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
                <span className="font-black text-lg w-6 text-center text-slate-400">
                  {i < 3 ? ['🏆', '🥈', '🥉'][i] : `${i + 1}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 line-clamp-1">{issue.title}</p>
                  <p className="text-xs text-slate-400">{issue.field_category} · {issue.region}</p>
                </div>
                <p className="text-sm font-bold text-blue-600 shrink-0">
                  {issue.support_count.toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
