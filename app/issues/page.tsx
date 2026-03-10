import type { Metadata } from 'next'
import TextPageTemplate from '@/components/TextPageTemplate'

export const metadata: Metadata = {
  title: '최신 이슈 | 시민신문고',
  description: '시민신문고에 등록되는 최신 이슈의 검토 기준과 공개 절차를 안내합니다.',
}

export default function IssuesPage() {
  return (
    <TextPageTemplate
      category="Platform"
      title="최신 이슈"
      description="시민신문고는 접수된 제보를 사실성, 공익성, 개인정보 보호 기준으로 검토한 뒤 순차적으로 공개합니다. 이 페이지는 최신 이슈가 어떤 기준으로 노출되는지 설명합니다."
      updatedAt="2026-03-10"
      sections={[
        {
          title: '이슈 공개 기준',
          body: [
            '사건 개요, 발생 시점, 관련 기관이 구체적으로 작성된 제보를 우선 검토합니다.',
            '개인정보가 포함된 자료는 비식별 처리 여부를 확인한 뒤 공개 대상에 포함합니다.',
            '감정적 비방이나 확인되지 않은 단정 표현은 보완 요청 또는 비공개 처리될 수 있습니다.',
          ],
        },
        {
          title: '노출 우선순위',
          body: [
            '최근 등록된 이슈를 기본으로 하되, 공감 증가 속도와 사회적 파급도를 함께 반영합니다.',
            '같은 사안을 중복 제보한 경우 대표 이슈로 병합해 정보 밀도를 높입니다.',
          ],
        },
        {
          title: '검토 상태 안내',
          body: [
            '접수됨: 기본 요건 충족 여부를 확인하는 초기 단계입니다.',
            '검증중: 자료 진위 및 표현 적합성을 확인하는 단계입니다.',
            '공론화진행·기관전달: 일정 기준을 충족해 공론화 또는 전달 절차에 진입한 상태입니다.',
          ],
        },
      ]}
      quickLinks={[
        { label: '공감 랭킹', href: '/ranking' },
        { label: '제보 가이드', href: '/guide' },
        { label: '홈으로 이동', href: '/' },
      ]}
    />
  )
}
