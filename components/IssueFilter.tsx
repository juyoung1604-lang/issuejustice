'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { IssueFilters, EnforcementType, FieldCategory, IssueStatus, SortOrder } from '@/types'
import { ENFORCEMENT_TYPES, FIELD_CATEGORIES, STATUS_CONFIG } from '@/types'

const REGIONS = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'support_count', label: '추천순' },
  { value: 'trending', label: '주목도순' },
]

interface IssueFilterProps {
  currentFilters: IssueFilters
}

export function IssueFilter({ currentFilters }: IssueFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page') // 필터 변경 시 첫 페이지로
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const clearAll = () => router.push(pathname)

  const hasFilters = !!(
    currentFilters.enforcement_type ||
    currentFilters.field_category ||
    currentFilters.status ||
    currentFilters.region ||
    currentFilters.q
  )

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
      {/* 검색 */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          defaultValue={currentFilters.q}
          placeholder="이슈 제목, 요약 검색..."
          className="input pl-9"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              updateFilter('q', (e.target as HTMLInputElement).value || undefined)
            }
          }}
        />
      </div>

      {/* 필터 행 */}
      <div className="flex flex-wrap gap-2">
        {/* 법집행 유형 */}
        <select
          value={currentFilters.enforcement_type ?? ''}
          onChange={e => updateFilter('enforcement_type', e.target.value || undefined)}
          className="input !w-auto text-sm"
        >
          <option value="">전체 유형</option>
          {ENFORCEMENT_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* 분야 */}
        <select
          value={currentFilters.field_category ?? ''}
          onChange={e => updateFilter('field_category', e.target.value || undefined)}
          className="input !w-auto text-sm"
        >
          <option value="">전체 분야</option>
          {FIELD_CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* 지역 */}
        <select
          value={currentFilters.region ?? ''}
          onChange={e => updateFilter('region', e.target.value || undefined)}
          className="input !w-auto text-sm"
        >
          <option value="">전체 지역</option>
          {REGIONS.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {/* 상태 */}
        <select
          value={currentFilters.status ?? ''}
          onChange={e => updateFilter('status', e.target.value || undefined)}
          className="input !w-auto text-sm"
        >
          <option value="">전체 상태</option>
          {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map(s => (
            <option key={s} value={s}>{STATUS_CONFIG[s].emoji} {STATUS_CONFIG[s].label}</option>
          ))}
        </select>

        {/* 정렬 */}
        <div className="ml-auto flex gap-1">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => updateFilter('sort', opt.value)}
              className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                (currentFilters.sort ?? 'latest') === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 활성 필터 태그 + 초기화 */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-slate-100">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <SlidersHorizontal size={12} /> 적용된 필터:
          </span>
          {currentFilters.q && (
            <FilterTag label={`검색: "${currentFilters.q}"`} onRemove={() => updateFilter('q', undefined)} />
          )}
          {currentFilters.enforcement_type && (
            <FilterTag label={currentFilters.enforcement_type} onRemove={() => updateFilter('enforcement_type', undefined)} />
          )}
          {currentFilters.field_category && (
            <FilterTag label={currentFilters.field_category} onRemove={() => updateFilter('field_category', undefined)} />
          )}
          {currentFilters.region && (
            <FilterTag label={currentFilters.region} onRemove={() => updateFilter('region', undefined)} />
          )}
          {currentFilters.status && (
            <FilterTag label={STATUS_CONFIG[currentFilters.status as keyof typeof STATUS_CONFIG]?.label ?? currentFilters.status} onRemove={() => updateFilter('status', undefined)} />
          )}
          <button
            onClick={clearAll}
            className="text-xs text-red-500 hover:text-red-700 font-medium ml-auto"
          >
            전체 초기화
          </button>
        </div>
      )}
    </div>
  )
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-blue-900">
        <X size={10} />
      </button>
    </span>
  )
}
