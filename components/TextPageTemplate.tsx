import Link from 'next/link'

export interface TextPageSection {
  title: string
  body: string[]
}

export interface TextPageQuickLink {
  label: string
  href: string
}

interface TextPageTemplateProps {
  category: string
  title: string
  description: string
  updatedAt: string
  sections: TextPageSection[]
  quickLinks?: TextPageQuickLink[]
}

export default function TextPageTemplate({
  category,
  title,
  description,
  updatedAt,
  sections,
  quickLinks = [],
}: TextPageTemplateProps) {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-gray-900">
      <header className="border-b border-gray-200/80 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black tracking-tight hover:opacity-80 transition-opacity">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            시민신문고
          </Link>
          <Link href="/" className="text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">
            홈으로
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 md:py-20">
        <section className="rounded-[2rem] border border-gray-200 bg-white p-8 md:p-12 smooth-shadow mb-8">
          <p className="text-xs font-black tracking-[0.22em] text-red-500 uppercase mb-4">{category}</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-5">{title}</h1>
          <p className="text-gray-600 font-medium leading-relaxed max-w-3xl">{description}</p>
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-bold text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            최종 업데이트: {updatedAt}
          </div>
        </section>

        <section className="space-y-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-gray-200 bg-white p-6 md:p-7">
              <h2 className="text-xl font-black tracking-tight mb-4">{section.title}</h2>
              <div className="space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-gray-600 font-medium leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </section>

        {quickLinks.length > 0 && (
          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 md:p-7">
            <h3 className="text-sm font-black tracking-[0.15em] text-gray-500 uppercase mb-4">바로가기</h3>
            <div className="flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-full text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-900 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
