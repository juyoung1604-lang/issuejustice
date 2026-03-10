import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import nodemailer from 'nodemailer'

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: '유효한 이메일을 입력해 주세요.' }, { status: 400 })
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return NextResponse.json({ error: '이메일 서비스가 설정되지 않았습니다.' }, { status: 500 })
  }

  const code = generateCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10분

  const { error: dbError } = await supabaseAdmin
    .from('email_otp_codes')
    .insert({ email: email.toLowerCase().trim(), code, expires_at: expiresAt })

  if (dbError) {
    return NextResponse.json({ error: '코드 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }

  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from: `"시민신문고" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '[시민신문고] 내 제보 확인 인증 코드',
      html: `
        <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 480px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
          <div style="background: #111827; padding: 24px 32px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%;"></div>
              <span style="color: #ffffff; font-size: 18px; font-weight: 900; letter-spacing: -0.5px;">시민신문고</span>
            </div>
          </div>
          <div style="padding: 32px;">
            <h2 style="font-size: 20px; font-weight: 900; color: #111827; margin: 0 0 8px;">내 제보 확인 인증 코드</h2>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 28px; line-height: 1.6;">
              아래 6자리 코드를 입력해 주세요.<br/>코드는 <strong>10분간</strong> 유효합니다.
            </p>
            <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 28px;">
              <span style="font-size: 40px; font-weight: 900; letter-spacing: 0.4em; color: #ef4444; font-family: monospace;">${code}</span>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.6;">
              본인이 요청하지 않은 경우 이 이메일을 무시해 주세요.<br/>
              시민신문고는 이 코드를 전화, 문자로 요청하지 않습니다.
            </p>
          </div>
        </div>
      `,
    })
  } catch {
    return NextResponse.json({ error: '이메일 발송에 실패했습니다. Gmail 설정을 확인해 주세요.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
