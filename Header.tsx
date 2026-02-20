'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Bell, Menu, X, LogIn, LogOut, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const NAV_LINKS = [
  { href: '/issues', label: '전체 이슈' },
  { href: '/issues?sort=latest', label: '최신 이슈' },
  { href: '/ranking', label: '추천 랭킹' },
  { href: '/guide', label: '제보 가이드' },
]

export function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/issues?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const isActive = (href: string) => {
    const base = href.split('?')[0]
    return pathname === base || pathname.startsWith(base + '/')
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* 상단 바 */}
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 font-black text-slate-900 text-lg shrink-0">
          <Bell size={20} className="text-blue-600" />
          시민신문고
        </Link>

        {/* 검색 (데스크탑) */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            type="text"
            placeholder="이슈 검색..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
        </form>

        <div className="flex-1" />

        {/* 액션 버튼들 */}
        <div className="flex items-center gap-2">
          {/* 모바일 검색 버튼 */}
          <button
            onClick={() => setSearchOpen(v => !v)}
            className="md:hidden p-2 text-slate-600 hover:text-blue-600"
          >
            <Search size={18} />
          </button>

          {/* 제보하기 */}
          <Link
            href="/issues/new"
            className="hidden sm:flex btn-primary py-2 px-4 text-sm items-center gap-1.5"
          >
            + 제보하기
          </Link>

          {/* 로그인/사용자 */}
          {user ? (
            <div className="flex items-center gap-1">
              <span className="text-sm text-slate-600 hidden md:block">
                <User size={14} className="inline mr-1" />
                {user.email?.split('@')[0]}
              </span>
              <button
                onClick={handleSignOut}
                className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                title="로그아웃"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-1 text-sm text-slate-600 hover:text-blue-600 font-medium">
              <LogIn size={16} />
              <span className="hidden sm:block">로그인</span>
            </Link>
          )}

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden p-2 text-slate-600"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* 모바일 검색 */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              type="text"
              placeholder="이슈 검색..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
        </div>
      )}

      {/* 하단 네비게이션 바 (데스크탑) */}
      <nav className="hidden md:block border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 flex gap-0">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive(link.href)
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* 모바일 메뉴 드롭다운 */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <nav className="px-4 py-2">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/issues/new"
              onClick={() => setMenuOpen(false)}
              className="block mt-2 btn-primary text-center"
            >
              + 제보하기
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
