import type { Metadata } from 'next'
import TextPageTemplate from '@/components/TextPageTemplate'

export const metadata: Metadata = {
  title: '이용 약관 | 시민신문고',
  description: '시민신문고 이용 약관 안내 페이지입니다.',
}

export default function TermsPage() {
  return (
    <TextPageTemplate
      category="Information"
      title="이용 약관"
      description="이 약관은 시민신문고 서비스 이용과 관련한 기본 권리와 의무를 정리합니다. 이용자는 서비스 이용 시 아래 기준에 동의한 것으로 봅니다."
      updatedAt="2026-03-10"
      sections={[
        {
          title: '서비스 이용 원칙',
          body: [
            '이용자는 사실 기반의 제보와 건전한 의견 표현을 원칙으로 서비스에 참여해야 합니다.',
            '허위사실 유포, 명예훼손, 차별·혐오 표현, 불법 콘텐츠 게시는 제한됩니다.',
          ],
        },
        {
          title: '게시물 처리',
          body: [
            '운영 정책 위반 또는 법적 문제 소지가 있는 게시물은 사전 통지 없이 비공개 또는 삭제될 수 있습니다.',
            '증빙 자료는 검토 상태에 따라 노출 범위가 조정될 수 있습니다.',
          ],
        },
        {
          title: '책임 범위',
          body: [
            '플랫폼은 이용자 게시물의 사실관계를 최종 확정하지 않으며, 공익 목적 검토와 운영 관리를 수행합니다.',
            '이용자는 본인이 게시한 내용에 대한 법적 책임을 부담합니다.',
          ],
        },
      ]}
      quickLinks={[
        { label: '개인정보 처리방침', href: '/privacy' },
        { label: '법률자문단 및 시민배심원', href: '/advisory' },
        { label: '홈으로 이동', href: '/' },
      ]}
    />
  )
}
