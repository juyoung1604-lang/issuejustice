import type { Metadata } from 'next'
import TextPageTemplate from '@/components/TextPageTemplate'

export const metadata: Metadata = {
  title: '최신 이슈 | 시민신문고',
  description: '시민신문고에 최근 접수된 최신 이슈의 공개 기준과 정렬 방식을 안내합니다.',
}

export default function LatestIssuesPage() {
  return (
    <TextPageTemplate
      category="Platform"
      title="최신 이슈"
      description="시민신문고에 접수된 제보는 사실성, 공익성, 개인정보 보호 기준을 충족한 경우 순차적으로 공개됩니다. 최신 이슈는 가장 최근에 검토·공개된 사례를 접수 시점 기준으로 정렬해 보여줍니다."
      updatedAt="2026-03-10"
      sections={[
        {
          title: '최신 이슈 정렬 기준',
          body: [
            '관리자 검토를 통과한 제보가 공개 시점 역순으로 정렬됩니다.',
            '동일 날짜에 여러 건이 공개된 경우, 공감 증가 속도를 보조 기준으로 적용합니다.',
            '중복 제보로 판단된 사안은 대표 이슈로 병합하여 최신 이슈 목록에 노출됩니다.',
          ],
        },
        {
          title: '이슈 공개 기준',
          body: [
            '사건 개요, 발생 시점, 관련 기관이 구체적으로 작성된 제보를 우선 검토합니다.',
            '개인정보가 포함된 자료는 비식별 처리 여부를 확인한 뒤 공개 대상에 포함합니다.',
            '감정적 비방이나 확인되지 않은 단정 표현은 보완 요청 또는 비공개 처리될 수 있습니다.',
          ],
        },
        {
          title: '검토 상태 안내',
          body: [
            '접수됨 — 기본 요건 충족 여부를 확인하는 초기 단계입니다.',
            '검증중 — 자료 진위 및 표현 적합성을 확인하는 단계입니다.',
            '공론화진행 — 일정 기준을 충족해 공론화 절차에 진입한 상태입니다.',
            '기관전달 — 관련 기관 또는 언론에 이슈가 전달된 상태입니다.',
          ],
        },
        {
          title: '최신 이슈 활용 방법',
          body: [
            '각 이슈 카드를 클릭하면 사건 개요, 증거 자료, 시민 채팅을 확인할 수 있습니다.',
            '공감 버튼을 눌러 이슈의 공론화 우선순위 상승에 기여할 수 있습니다.',
            '유사한 사례를 경험한 경우 직접 제보하여 데이터를 보강할 수 있습니다.',
          ],
        },
      ]}
      quickLinks={[
        { label: '전체 이슈 목록', href: '/issues' },
        { label: '공감 랭킹', href: '/ranking' },
        { label: '이슈 제보하기', href: '/#register' },
        { label: '홈으로 이동', href: '/' },
      ]}
    />
  )
}
