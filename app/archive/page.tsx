import type { Metadata } from 'next'
import TextPageTemplate from '@/components/TextPageTemplate'

export const metadata: Metadata = {
  title: '데이터 아카이브 | 시민신문고',
  description: '시민신문고 데이터 아카이브의 구성, 공개 범위, 활용 원칙을 안내합니다.',
}

export default function ArchivePage() {
  return (
    <TextPageTemplate
      category="Platform"
      title="데이터 아카이브"
      description="데이터 아카이브는 공론화 과정을 기록하고 제도 개선 근거를 축적하기 위한 저장소입니다. 이슈 단위의 변화 흐름과 검토 이력을 투명하게 관리합니다."
      updatedAt="2026-03-10"
      sections={[
        {
          title: '아카이브 구성',
          body: [
            '이슈 메타데이터: 분야, 지역, 상태, 공감 추세 등 핵심 지표를 구조화합니다.',
            '검토 이력: 접수부터 전달까지의 단계별 기록을 남겨 프로세스 투명성을 확보합니다.',
            '첨부 자료: 승인된 증빙자료를 유형별로 분류해 재검토 가능성을 높입니다.',
          ],
        },
        {
          title: '공개 범위',
          body: [
            '개인정보 및 식별가능 정보는 비공개 또는 비식별 처리 후 제한적으로 노출합니다.',
            '민감 사건은 공익성, 위해 가능성, 사실확인 상태를 종합 검토해 공개 수준을 조정합니다.',
          ],
        },
        {
          title: '활용 정책',
          body: [
            '아카이브 데이터는 공익 목적의 분석·리포트 작성에 우선 활용됩니다.',
            '무단 재식별, 명예훼손 목적 재가공, 상업적 오남용은 제한될 수 있습니다.',
          ],
        },
      ]}
      quickLinks={[
        { label: '공감 랭킹', href: '/ranking' },
        { label: '운영 원칙', href: '/principles' },
        { label: '홈으로 이동', href: '/' },
      ]}
    />
  )
}
