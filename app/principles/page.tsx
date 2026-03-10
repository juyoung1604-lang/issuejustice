import type { Metadata } from 'next'
import TextPageTemplate from '@/components/TextPageTemplate'

export const metadata: Metadata = {
  title: '운영 원칙 | 시민신문고',
  description: '시민신문고 운영 원칙과 심사 기준을 안내합니다.',
}

export default function PrinciplesPage() {
  return (
    <TextPageTemplate
      category="Information"
      title="운영 원칙"
      description="시민신문고는 공익성과 신뢰를 우선으로 운영됩니다. 아래 원칙은 제보 등록, 자료 검토, 공개 운영 전 과정에 동일하게 적용됩니다."
      updatedAt="2026-03-10"
      sections={[
        {
          title: '증거 기반 운영',
          body: [
            '주장보다 근거를 우선하며, 첨부 자료와 사건 맥락을 함께 검토합니다.',
            '사실 확정이 어려운 내용은 표현 수위를 조정하거나 보류할 수 있습니다.',
          ],
        },
        {
          title: '표현 책임과 공익성',
          body: [
            '사실 확인이 어려운 인신공격, 비방, 혐오 표현은 허용하지 않습니다.',
            '개별 사건을 넘어 제도 개선 논의에 기여할 수 있는 공익적 맥락을 우선 평가합니다.',
          ],
        },
        {
          title: '개인정보 보호',
          body: [
            '개인정보 및 민감정보는 수집 최소화와 비식별화 원칙을 적용합니다.',
            '제3자 권리 침해 가능성이 높은 자료는 제한 공개 또는 비공개 처리합니다.',
          ],
        },
      ]}
      quickLinks={[
        { label: '제보 가이드', href: '/guide' },
        { label: '개인정보 처리방침', href: '/privacy' },
        { label: '홈으로 이동', href: '/' },
      ]}
    />
  )
}
