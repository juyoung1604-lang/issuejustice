// app/ranking/page.tsx
import Link from 'next/link'
import { Trophy, TrendingUp, Calendar, Infinity } from 'lucide-react'
import { getRanking } from '@/lib/api/issues'
import { STATUS_CONFIG } from '@/types'
import type { RankingPeriod } from '@/types'

interface PageProps {
  searchParams: { period?: string }
}

const PERIODS: { value: RankingPeriod; label: string; icon: typeof Trophy }[] = [
  { value: 'weekly', label: '주간 TOP', icon: TrendingUp },
  { value: 'monthly', label: '월간 TOP', icon: Calendar },
  { value: 'all', label: '누적 TOP', icon: Infinity },
]

const MEDALS = ['🏆', '🥈', '🥉']

export default async function RankingPage({ searchParams }: PageProps) {
  const period = (searchParams.period as RankingPeriod) ?? 'weekly'
  const issues = await getRanking(period, 20)

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Trophy size={24} className="text-amber-500" />
          추천 랭킹
        </h1>
        <p className="text-slate-500 mt-1">많은 시민이 공감한 이슈를 확인하세요.</p>
      </div>

      {/* 기간 탭 */}
      <div className="flex gap-2 mb-6 bg-white rounded-xl border border-slate-200 p-1">
        {PERIODS.map(p => (
          <Link
            key={p.value}
            href={`/ranking?period=${p.value}`}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              period === p.value
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <p.icon size={14} />
            {p.label}
          </Link>
        ))}
      </div>

      {/* 랭킹 목록 */}
      {issues.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Trophy size={40} className="mx-auto mb-2 opacity-20" />
          <p>해당 기간에 이슈가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue, i) => {
            const status = STATUS_CONFIG[issue.status]
            const isTop3 = i < 3
            return (
              <div
                key={issue.id}
                className={`bg-white rounded-xl border p-5 flex items-start gap-4 transition-shadow hover:shadow-md ${
                  isTop3 ? 'border-amber-200 shadow-sm' : 'border-slate-200'
                }`}
              >
                {/* 순위 */}
                <div className={`shrink-0 w-10 text-center font-black ${
                  i === 0 ? 'text-2xl' : i < 3 ? 'text-xl' : 'text-lg text-slate-400'
                }`}>
                  {MEDALS[i] ?? `#${i + 1}`}
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2 items-center">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.emoji} {status.label}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {issue.field_category}
                    </span>
                    <span className="text-xs text-slate-400">{issue.region}</span>
                  </div>
                  <Link href={`/issues/${issue.id}`}>
                    <h2 className="font-bold text-slate-900 line-clamp-2 hover:text-blue-700 transition-colors mb-1">
                      {issue.title}
                    </h2>
                  </Link>
                  <p className="text-sm text-slate-500 line-clamp-1">{issue.summary}</p>
                </div>

                {/* 추천 수 */}
                <div className="shrink-0 text-right">
                  <p className={`font-black text-xl ${isTop3 ? 'text-blue-600' : 'text-slate-700'}`}>
                    {issue.support_count.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">추천</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
