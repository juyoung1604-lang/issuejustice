'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('ko-KR', { hour12: false }))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  const handleLogin = async () => {
    if (!password) { setError('비밀번호를 입력해 주세요.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const json = await res.json()
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setError(json.error || '로그인 실패')
        setShake(true)
        setTimeout(() => setShake(false), 500)
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg0:#050810;--bg1:#080d18;--bg2:#0c1220;--bg3:#101828;
          --bdr:#162232;--bdr2:#1e3047;
          --teal:#00d4a8;--tealD:rgba(0,212,168,.10);--tealG:rgba(0,212,168,.05);
          --red:#e04848;--redD:rgba(224,72,72,.10);
          --t0:#ffffff;--t1:#e8edf2;--t2:#8899a8;--t3:#4a5a6a;
          --f-mono:'IBM Plex Mono',monospace;
          --f-sans:'Noto Sans KR',sans-serif;
        }
        html,body{height:100%;}
        body{background:var(--bg0);color:var(--t0);font-family:var(--f-sans);display:flex;flex-direction:column;min-height:100vh;overflow:hidden;}

        .grid-bg{
          position:fixed;inset:0;
          background-image:
            linear-gradient(rgba(0,212,168,.03) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,212,168,.03) 1px,transparent 1px);
          background-size:40px 40px;
          pointer-events:none;z-index:0;
        }
        .glow{position:fixed;top:-200px;left:50%;transform:translateX(-50%);width:600px;height:400px;background:radial-gradient(ellipse at center,rgba(0,212,168,.06),transparent 70%);pointer-events:none;z-index:0;}

        .topbar{position:fixed;top:0;left:0;right:0;height:48px;background:var(--bg1);border-bottom:1px solid var(--bdr2);display:flex;align-items:center;justify-content:space-between;padding:0 20px;z-index:10;}
        .topbar-brand{display:flex;align-items:center;gap:10px;font-family:var(--f-mono);}
        .topbar-mark{width:26px;height:26px;border:1.5px solid var(--teal);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--teal);}
        .topbar-name{font-size:11px;font-weight:600;letter-spacing:.5px;}
        .topbar-sub{font-size:9px;color:var(--teal);letter-spacing:2px;}
        .topbar-clock{font-family:var(--f-mono);font-size:12px;color:var(--t2);letter-spacing:1px;}

        .wrap{flex:1;display:flex;align-items:center;justify-content:center;padding:80px 20px 40px;position:relative;z-index:1;}

        .card{width:100%;max-width:400px;background:var(--bg1);border:1px solid var(--bdr2);padding:40px 36px 36px;position:relative;}
        .card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--teal),transparent);}

        .card-eyebrow{font-family:var(--f-mono);font-size:9px;letter-spacing:3px;color:var(--teal);text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:8px;}
        .card-eyebrow::before{content:'';width:16px;height:1px;background:var(--teal);}
        .card-title{font-family:var(--f-mono);font-size:22px;font-weight:700;color:var(--t0);margin-bottom:6px;letter-spacing:-.3px;}
        .card-sub{font-family:var(--f-mono);font-size:10px;color:var(--t2);margin-bottom:32px;}

        .fg{margin-bottom:18px;}
        .flbl{display:block;font-family:var(--f-mono);font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:var(--t2);margin-bottom:7px;}
        .finput{
          width:100%;background:var(--bg2);border:1px solid var(--bdr2);color:var(--t0);
          font-family:var(--f-mono);font-size:13px;padding:11px 14px;
          outline:none;transition:border-color .2s,box-shadow .2s;border-radius:2px;
        }
        .finput:focus{border-color:var(--teal);box-shadow:0 0 0 2px rgba(0,212,168,.12);}
        .finput::placeholder{color:var(--t3);}

        .btn-login{
          width:100%;padding:12px;background:var(--tealD);border:1px solid rgba(0,212,168,.4);
          color:var(--teal);font-family:var(--f-mono);font-size:12px;font-weight:700;
          letter-spacing:1px;cursor:pointer;transition:all .2s;border-radius:2px;
          display:flex;align-items:center;justify-content:center;gap:8px;
        }
        .btn-login:hover:not(:disabled){background:var(--teal);color:var(--bg0);box-shadow:0 0 20px rgba(0,212,168,.3);}
        .btn-login:disabled{opacity:.5;cursor:not-allowed;}

        .err-box{
          background:var(--redD);border:1px solid rgba(224,72,72,.3);
          color:var(--red);font-family:var(--f-mono);font-size:11px;
          padding:10px 14px;margin-bottom:16px;border-radius:2px;
          display:flex;align-items:center;gap:8px;
        }

        @keyframes shake{
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(4px)}
        }
        .shake{animation:shake .4s ease;}

        .card-footer{margin-top:28px;padding-top:20px;border-top:1px solid var(--bdr2);font-family:var(--f-mono);font-size:9px;color:var(--t3);display:flex;justify-content:space-between;align-items:center;}
        .sys-dot{display:inline-block;width:5px;height:5px;border-radius:50%;background:#2ec98a;box-shadow:0 0 5px #2ec98a;margin-right:5px;}
      `}</style>

      <div className="grid-bg" />
      <div className="glow" />

      <div className="topbar">
        <div className="topbar-brand">
          <div className="topbar-mark">IJ</div>
          <div>
            <div className="topbar-name">ISSUE JUSTICE</div>
            <div className="topbar-sub">ADMIN SYSTEM</div>
          </div>
        </div>
        <div className="topbar-clock">{clock}</div>
      </div>

      <div className="wrap">
        <div className={`card${shake ? ' shake' : ''}`}>
          <div className="card-eyebrow">Secure Access</div>
          <div className="card-title">관리자 로그인</div>
          <div className="card-sub">관리자 비밀번호를 입력하세요</div>

          {error && (
            <div className="err-box">
              <span>⚠</span> {error}
            </div>
          )}

          <div className="fg">
            <label className="flbl">Password</label>
            <input
              className="finput"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
              autoFocus
            />
          </div>

          <button className="btn-login" onClick={handleLogin} disabled={loading}>
            {loading ? '⟳ 인증 중...' : '→ 관리자 패널 접속'}
          </button>

          <div className="card-footer">
            <span><span className="sys-dot" />시스템 정상</span>
            <span>ISSUE JUSTICE v{process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0'}</span>
          </div>
        </div>
      </div>
    </>
  )
}
