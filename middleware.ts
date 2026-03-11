import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'admin_session'
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000 // 8시간

async function hmacHex(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    const dotIdx = token.indexOf('.')
    if (dotIdx === -1) return false
    const ts = token.slice(0, dotIdx)
    const sig = token.slice(dotIdx + 1)
    if (!ts || !sig) return false

    const age = Date.now() - Number(ts)
    if (age < 0 || age > SESSION_MAX_AGE_MS) return false

    const expected = await hmacHex(secret, ts)
    // constant-time compare
    if (expected.length !== sig.length) return false
    let diff = 0
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
    return diff === 0
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const secret =
      process.env.ADMIN_SESSION_SECRET ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      'fallback-dev-secret'

    const token = request.cookies.get(SESSION_COOKIE)?.value
    const valid = token ? await verifyToken(token, secret) : false

    if (!valid) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
