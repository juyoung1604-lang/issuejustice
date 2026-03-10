import type { Metadata } from 'next'
import TextPageTemplate from '@/components/TextPageTemplate'

export const metadata: Metadata = {
  title: '제보 가이드 | 시민신문고',
  description: '시민신문고 제보 작성 및 첨부 자료 제출 가이드를 안내합니다.',
}

export default function GuidePage() {
  return (
    <TextPageTemplate
      category="Platform"
      title="제보 가이드"
      description="제보는 공론화를 위한 출발점입니다. 정확한 사실과 검증 가능한 자료를 중심으로 작성하면 검토 속도와 공개 신뢰도가 함께 올라갑니다."
      updatedAt="2026-03-10"
      sections={[
        {
          title: '작성 기본 원칙',
          body: [
            '사건 개요에는 언제, 어디서, 누가, 어떤 처분을 받았는지 사실 위주로 작성합니다.',
            '의견과 사실을 구분해 서술하고, 확인되지 않은 추정은 명확히 표시합니다.',
            '비속어, 혐오표현, 개인 공격성 표현은 게시 전 단계에서 제한될 수 있습니다.',
          ],
        },
        {
          title: '첨부 자료 제출 방식',
          body: [
            '직접 업로드: PDF, JPG, PNG, WEBP 파일을 최대 10MB까지 올릴 수 있습니다.',
            '클라우드 URL 입력: Drive, OneDrive, Dropbox 등 공유 링크를 첨부할 수 있습니다.',
            '자료는 관리자 검토 후 공개되며, 필요 시 추가 소명 또는 원본 확인 요청이 있을 수 있습니다.',
          ],
        },
        {
          title: '개인정보 보호 체크리스트',
          body: [
            '이름, 주민등록번호, 계좌번호, 연락처 등 식별 정보는 반드시 가림 처리합니다.',
            '제3자의 민감정보를 포함한 자료는 사전 동의 또는 법적 근거 없이는 게시하지 않습니다.',
          ],
        },
      ]}
      quickLinks={[
        { label: '운영 원칙', href: '/principles' },
        { label: '개인정보 처리방침', href: '/privacy' },
        { label: '홈으로 이동', href: '/' },
      ]}
    />
  )
}
