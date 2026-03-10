import type { Metadata } from 'next'
import TextPageTemplate from '@/components/TextPageTemplate'

export const metadata: Metadata = {
  title: '개인정보 처리방침 | 시민신문고',
  description: '시민신문고 개인정보 처리방침 안내 페이지입니다.',
}

export default function PrivacyPage() {
  return (
    <TextPageTemplate
      category="Information"
      title="개인정보 처리방침"
      description="시민신문고는 서비스 제공에 필요한 최소한의 개인정보만 처리합니다. 개인정보는 관련 법령과 내부 보호 기준에 따라 안전하게 관리됩니다."
      updatedAt="2026-03-10"
      sections={[
        {
          title: '수집 항목 및 목적',
          body: [
            '서비스 이용 기록, 기기 식별 토큰, 제보 작성 정보는 제보 접수·중복 방지·운영 안정화 목적으로 처리됩니다.',
            '법령상 의무 또는 분쟁 대응이 필요한 경우에 한해 관련 기록을 보관할 수 있습니다.',
          ],
        },
        {
          title: '보관 및 파기',
          body: [
            '개인정보는 처리 목적 달성 후 지체 없이 파기하는 것을 원칙으로 합니다.',
            '다만 관계 법령에 보관 의무가 있는 항목은 해당 기간 동안 분리 보관 후 파기합니다.',
          ],
        },
        {
          title: '이용자 권리',
          body: [
            '이용자는 본인 정보의 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다.',
            '요청은 서비스 내 문의 채널을 통해 접수되며, 본인 확인 절차 후 처리됩니다.',
          ],
        },
      ]}
      quickLinks={[
        { label: '이용 약관', href: '/terms' },
        { label: '운영 원칙', href: '/principles' },
        { label: '홈으로 이동', href: '/' },
      ]}
    />
  )
}
