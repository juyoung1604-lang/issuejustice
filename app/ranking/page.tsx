import type { Metadata } from 'next'
import TextPageTemplate from '@/components/TextPageTemplate'

export const metadata: Metadata = {
  title: '공감 랭킹 | 시민신문고',
  description: '시민신문고 공감 랭킹 산정 방식과 운영 원칙을 안내합니다.',
}

export default function RankingPage() {
  return (
    <TextPageTemplate
      category="Platform"
      title="공감 랭킹"
      description="공감 랭킹은 단순 수치 경쟁이 아니라 공론화 우선순위를 정하기 위한 보조 지표입니다. 조작을 막기 위한 검증 로직과 운영 기준을 함께 적용합니다."
      updatedAt="2026-03-10"
      sections={[
        {
          title: '랭킹 산정 원리',
          body: [
            '기본 지표는 누적 공감 수와 최근 기간 내 증가량입니다.',
            '짧은 시간에 비정상적으로 발생한 반복 반응은 자동으로 감쇠 처리됩니다.',
            '랭킹은 주간, 월간, 누적 기준으로 분리해 편향을 줄입니다.',
          ],
        },
        {
          title: '운영 상 안전장치',
          body: [
            '동일 기기 또는 비정상 패턴으로 추정되는 반응은 내부 점검 대상이 됩니다.',
            '허위·비방성 게시물은 랭킹 노출 전 단계에서 제외될 수 있습니다.',
            '랭킹 상위 노출은 사실 확정을 의미하지 않으며, 공적 검토 우선순위만을 의미합니다.',
          ],
        },
        {
          title: '활용 목적',
          body: [
            '높은 공감과 근거를 동시에 갖춘 이슈를 우선 검토·리포트화해 제도 개선 논의로 연결합니다.',
            '시민이 어떤 분야에서 구조적 불합리를 크게 체감하는지 데이터로 파악합니다.',
          ],
        },
      ]}
      quickLinks={[
        { label: '최신 이슈', href: '/issues' },
        { label: '데이터 아카이브', href: '/archive' },
        { label: '홈으로 이동', href: '/' },
      ]}
    />
  )
}
