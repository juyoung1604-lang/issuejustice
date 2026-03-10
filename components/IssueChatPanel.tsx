'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

interface IssueChatPanelProps {
  issueId: string | number
}

interface ChatMessage {
  id: string
  nickname: string
  message: string
  createdAt: string
}

const CHAT_STORAGE_PREFIX = 'issuejustice_live_chat_v1_'
const NICKNAME_STORAGE_KEY = 'issuejustice_live_chat_nickname'
const MAX_MESSAGE_LENGTH = 300
const MAX_MESSAGES = 200

function applyWordFilter(text: string, words: string[]): { result: string; filtered: boolean } {
  if (!text || typeof text !== 'string') return { result: text ?? '', filtered: false }
  let result = text
  let filtered = false
  for (const word of words) {
    const w = word.trim()
    if (!w) continue
    try {
      const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      // test()와 같은 regex 객체를 재사용하면 gi 플래그의 lastIndex가 이동해 replace 누락 발생 → replace만 사용하고 변경 여부로 판단
      const replaced = result.replace(new RegExp(escaped, 'gi'), '****')
      if (replaced !== result) {
        filtered = true
        result = replaced
      }
    } catch {
      // 잘못된 정규식은 건너뜀
    }
  }
  return { result, filtered }
}

const NICKNAME_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
]

function getStorageKey(issueId: string | number): string {
  return `${CHAT_STORAGE_PREFIX}${issueId}`
}

function hashText(text: string): number {
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0
  }
  return hash
}

function getNicknameColor(nickname: string): string {
  if (!nickname) return '#94a3b8'
  return NICKNAME_COLORS[hashText(nickname) % NICKNAME_COLORS.length]
}

function formatTime(isoString: string): string {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

export default function IssueChatPanel({ issueId }: IssueChatPanelProps) {
  const [nickname, setNickname] = useState('')
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [error, setError] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const [bannedWords, setBannedWords] = useState<string[]>([])
  const listRef = useRef<HTMLDivElement>(null)

  const storageKey = useMemo(() => getStorageKey(issueId), [issueId])

  useEffect(() => {
    try {
      const savedNickname = localStorage.getItem(NICKNAME_STORAGE_KEY)
      if (savedNickname) {
        setNickname(savedNickname)
      } else {
        const fallbackNickname = `시민${Math.floor(Math.random() * 9000 + 1000)}`
        setNickname(fallbackNickname)
        localStorage.setItem(NICKNAME_STORAGE_KEY, fallbackNickname)
      }
    } catch {
      // noop
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/admin/settings', { signal: controller.signal })
      .then(r => r.json())
      .then(json => {
        const raw = json.data?.chat_banned_words
        if (raw && typeof raw === 'string') {
          setBannedWords(raw.split(',').map((w: string) => w.trim()).filter(Boolean))
        }
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[]
        if (Array.isArray(parsed)) {
          setMessages(parsed.slice(-MAX_MESSAGES))
        } else {
          setMessages([])
        }
      } else {
        setMessages([])
      }
    } catch {
      setMessages([])
    } finally {
      setHydrated(true)
    }
  }, [storageKey])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-MAX_MESSAGES)))
    } catch {
      // noop
    }
  }, [messages, hydrated, storageKey])

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  const handleNicknameChange = (value: string) => {
    setNickname(value)
    try {
      localStorage.setItem(NICKNAME_STORAGE_KEY, value)
    } catch {
      // noop
    }
  }

  const handleSend = () => {
    const normalizedNickname = nickname.trim()
    const normalizedMessage = draft.trim()

    if (!normalizedNickname) {
      setError('닉네임을 입력해 주세요.')
      return
    }
    if (!normalizedMessage) {
      setError('메시지를 입력해 주세요.')
      return
    }

    let filteredMessage = normalizedMessage.slice(0, MAX_MESSAGE_LENGTH)
    try {
      filteredMessage = applyWordFilter(filteredMessage, bannedWords).result
    } catch {
      // 필터 오류 시 원문 그대로 저장
    }

    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      nickname: normalizedNickname.slice(0, 20),
      message: filteredMessage,
      createdAt: new Date().toISOString(),
    }

    setMessages(prev => [...prev, newMessage].slice(-MAX_MESSAGES))
    setDraft('')
    setError('')
  }

  return (
    <section className="rounded-[1.6rem] border border-gray-800 bg-[#0f0f0f] text-white overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <p className="text-sm font-black tracking-wider">LIVE CHAT</p>
        </div>
        <p className="text-[11px] font-bold text-gray-400">{messages.length} messages</p>
      </div>

      <div ref={listRef} className="h-72 overflow-y-auto no-scrollbar px-4 py-3 space-y-2 bg-black/25">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
            <i className="ri-chat-3-line text-2xl mb-2" />
            <p className="text-sm font-bold">아직 채팅이 없습니다.</p>
            <p className="text-xs mt-1">첫 메시지로 대화를 시작해 보세요.</p>
          </div>
        ) : (
          messages.map(message => {
            let displayMsg = message.message ?? ''
            let filtered = false
            try {
              const r = applyWordFilter(displayMsg, bannedWords)
              displayMsg = r.result
              filtered = r.filtered
            } catch { /* 필터 오류 무시 */ }
            return (
              <div key={message.id} className="text-sm leading-relaxed">
                <span
                  className="font-black mr-2"
                  style={{ color: getNicknameColor(message.nickname) }}
                >
                  {message.nickname}
                </span>
                <span className="text-gray-100 break-words">{displayMsg}</span>
                <span className="text-[10px] text-gray-500 ml-2">{formatTime(message.createdAt)}</span>
                {filtered && (
                  <span className="ml-2 text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                    ⚠ 일부 표현 필터링됨
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="p-3 md:p-4 border-t border-white/10 bg-[#111111]">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={nickname}
            onChange={e => handleNicknameChange(e.target.value)}
            placeholder="닉네임"
            maxLength={20}
            className="w-full sm:w-32 md:w-48 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs md:text-sm font-bold text-white placeholder:text-gray-500 focus:outline-none focus:border-red-400 flex-shrink-0"
          />
          <div className="w-full min-w-0 sm:flex-1 flex gap-2">
            <input
              value={draft}
              onChange={e => {
                setDraft(e.target.value)
                if (error) setError('')
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="메시지 입력..."
              maxLength={MAX_MESSAGE_LENGTH}
              className="flex-1 min-w-0 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs md:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-red-400"
            />
            <button
              type="button"
              onClick={handleSend}
              className="px-3 md:px-4 py-2 rounded-xl bg-red-500 text-white text-xs md:text-sm font-black hover:bg-red-600 transition-colors shrink-0"
            >
              전송
            </button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[9px] md:text-[11px] font-bold text-gray-500">{draft.length}/{MAX_MESSAGE_LENGTH}</p>
          {error && <p className="text-[9px] md:text-[11px] font-bold text-red-400 break-words">{error}</p>}
        </div>
        {bannedWords.length > 0 && (
          <p className="text-[9px] font-bold text-gray-600 mt-1">⚠ 부적절한 표현은 자동으로 ****로 표시됩니다.</p>
        )}
      </div>
    </section>
  )
}
