import type { Metadata } from 'next'
import TextPageTemplate from '@/components/TextPageTemplate'
import AdvisoryApplySection from '@/components/AdvisoryApplySection'

export const metadata: Metadata = {
  title: '법률자문단 및 시민배심원 | 시민신문고',
  description: '시민신문고 법률자문단 및 시민배심원 운영 구조를 안내합니다.',
}

export default function AdvisoryPage() {
  return (
    <>
    <TextPageTemplate
      category="Information"
      title="법률자문단 및 시민배심원"
      description="시민신문고는 법률 전문성과 시민 관점을 함께 반영하기 위해 법률자문단과 시민배심원 체계를 운영합니다. 두 그룹은 역할을 분리해 상호 보완적으로 검토합니다."
      updatedAt="2026-03-10"
      sections={[
        {
          title: '법률자문단 역할',
          body: [
            '쟁점 사건의 법적 용어, 절차 해석, 표현 적정성을 검토합니다.',
            '명예훼손, 사생활 침해, 허위사실 가능성이 있는 내용의 공개 리스크를 점검합니다.',
          ],
        },
        {
          title: '시민배심원 역할',
          body: [
            '사회적 체감도, 공익성, 공론화 필요성을 시민 관점에서 평가합니다.',
            '전문성 편향을 줄이고 실제 생활 맥락에서의 문제 인식을 반영합니다.',
          ],
        },
        {
          title: '협업 방식',
          body: [
            '법률자문단은 법적 위험과 표현 타당성을, 시민배심원은 공익성과 사회적 중요도를 중심으로 판단합니다.',
            '최종 공개 여부는 두 그룹 의견과 운영 기준을 종합해 결정됩니다.',
          ],
        },
      ]}
      quickLinks={[
        { label: '운영 원칙', href: '/principles' },
        { label: '이용 약관', href: '/terms' },
        { label: '홈으로 이동', href: '/' },
      ]}
    />
    <AdvisoryApplySection />
    </>
  )
}
