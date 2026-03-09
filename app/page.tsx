'use client'

import { useState, useEffect } from 'react'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --ink: #0d0d0d; --paper: #f4f1ea; --cream: #ece8df;
  --red: #c0392b; --orange: #e67e22; --gold: #b8860b;
  --steel: #2c3e50; --muted: #6b6355; --border: #c4bfb4; --white: #ffffff;
  --font-serif: 'Nanum Myeongjo', Georgia, serif;
  --font-sans: 'Noto Sans KR', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
}

html { scroll-behavior: smooth; }
body { background: var(--paper); color: var(--ink); font-family: var(--font-sans); font-weight: 400; line-height: 1.6; overflow-x: hidden; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--cream); }
::-webkit-scrollbar-thumb { background: var(--border); }

/* HEADER */
.site-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: var(--ink); border-bottom: 3px solid var(--red);
  padding: 0 32px; height: 56px;
  display: flex; align-items: center; justify-content: space-between;
}
.header-left { display: flex; align-items: center; gap: 16px; }
.logo {
  font-family: var(--font-serif); font-size: 20px; font-weight: 800;
  color: var(--white); letter-spacing: -0.5px; text-decoration: none;
  display: flex; align-items: center; gap: 8px;
}
.logo-dot { width: 8px; height: 8px; background: var(--red); border-radius: 50%; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(.85)} }
.header-badge { font-family: var(--font-mono); font-size: 10px; color: var(--orange); border: 1px solid var(--orange); padding: 2px 7px; letter-spacing: 1px; }
.site-header nav { display: flex; gap: 24px; align-items: center; }
.site-header nav a { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.6); text-decoration: none; letter-spacing: .5px; transition: color .2s; }
.site-header nav a:hover { color: var(--white); }
.header-cta { background: var(--red) !important; color: var(--white) !important; padding: 6px 16px; font-weight: 700 !important; letter-spacing: 0 !important; transition: background .2s !important; }
.header-cta:hover { background: #a93226 !important; }

/* HERO */
#hero { margin-top: 56px; min-height: calc(100vh - 56px); display: grid; grid-template-columns: 1fr 1fr; position: relative; overflow: hidden; }
.hero-left { background: var(--ink); padding: 80px 60px 80px 72px; display: flex; flex-direction: column; justify-content: center; position: relative; }
.hero-left::after { content:''; position:absolute; right:0; top:40px; bottom:40px; width:4px; background:var(--red); }
.hero-eyebrow { font-family: var(--font-mono); font-size: 11px; color: var(--red); letter-spacing: 3px; text-transform: uppercase; margin-bottom: 32px; display: flex; align-items: center; gap: 12px; }
.hero-eyebrow::before { content:''; width:32px; height:1px; background:var(--red); }
.hero-title { font-family: var(--font-serif); font-size: clamp(40px,5vw,68px); font-weight: 800; line-height: 1.1; color: var(--white); margin-bottom: 32px; letter-spacing: -1.5px; }
.hero-title em { font-style: normal; color: var(--red); display: block; }
.hero-desc { font-size: 15px; color: rgba(255,255,255,.55); line-height: 1.8; max-width: 380px; margin-bottom: 48px; font-weight: 300; }
.hero-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.1); margin-bottom: 48px; }
.stat-item { padding: 20px; background: var(--ink); }
.stat-num { font-family: var(--font-mono); font-size: 28px; font-weight: 500; color: var(--white); display: block; }
.stat-label { font-size: 11px; color: rgba(255,255,255,.4); letter-spacing: .5px; margin-top: 4px; }
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.btn-primary { background: var(--red); color: var(--white); border: none; padding: 14px 28px; font-family: var(--font-sans); font-size: 14px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all .2s; letter-spacing: .5px; }
.btn-primary:hover { background: #a93226; transform: translateY(-1px); }
.btn-secondary { background: transparent; color: rgba(255,255,255,.7); border: 1px solid rgba(255,255,255,.2); padding: 14px 28px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all .2s; }
.btn-secondary:hover { border-color: rgba(255,255,255,.5); color: var(--white); }
.hero-right { background: var(--cream); padding: 60px 48px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; }
.hero-right::before { content:'이슈 현황'; font-family: var(--font-mono); font-size: 10px; color: var(--muted); letter-spacing: 2px; position: absolute; top: 28px; left: 48px; }
.issue-item { border-top: 1px solid var(--border); padding: 16px 0; cursor: pointer; transition: all .25s; display: grid; grid-template-columns: auto 1fr auto; gap: 16px; align-items: center; }
.issue-item:last-child { border-bottom: 1px solid var(--border); }
.issue-item:hover { padding-left: 8px; }
.issue-rank { font-family: var(--font-mono); font-size: 12px; color: var(--muted); width: 24px; }
.issue-rank.top { color: var(--red); font-weight: 500; }
.issue-body { overflow: hidden; }
.issue-title { font-size: 14px; font-weight: 700; color: var(--ink); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 4px; }
.issue-meta { display: flex; gap: 8px; font-family: var(--font-mono); font-size: 10px; color: var(--muted); }
.issue-tag { background: var(--paper); border: 1px solid var(--border); padding: 1px 6px; font-size: 10px; color: var(--steel); }
.issue-support { text-align: right; font-family: var(--font-mono); }
.issue-support-num { font-size: 18px; font-weight: 500; color: var(--ink); display: block; }
.issue-support-label { font-size: 9px; color: var(--muted); letter-spacing: 1px; }
.hero-bg-text { position: absolute; bottom: -20px; right: -10px; font-family: var(--font-serif); font-size: 200px; font-weight: 800; color: rgba(0,0,0,.03); line-height: 1; pointer-events: none; user-select: none; letter-spacing: -8px; }

/* SECTIONS */
section { padding: 100px 72px; }
.section-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 56px; border-bottom: 3px solid var(--ink); padding-bottom: 20px; }
.section-label { font-family: var(--font-mono); font-size: 11px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
.section-title { font-family: var(--font-serif); font-size: clamp(28px,3vw,42px); font-weight: 800; line-height: 1.2; letter-spacing: -1px; }
.see-all { font-size: 13px; font-weight: 600; color: var(--red); text-decoration: none; display: flex; align-items: center; gap: 6px; white-space: nowrap; align-self: flex-end; margin-bottom: 4px; border-bottom: 1px solid var(--red); padding-bottom: 1px; }

/* ISSUES */
#issues { background: var(--paper); }
.filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 32px; }
.filter-btn { background: transparent; border: 1px solid var(--border); padding: 7px 16px; font-size: 12px; font-weight: 500; color: var(--muted); cursor: pointer; transition: all .2s; font-family: var(--font-sans); }
.filter-btn:hover, .filter-btn.active { background: var(--ink); color: var(--white); border-color: var(--ink); }
.issues-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(320px,1fr)); gap: 1px; background: var(--border); border: 1px solid var(--border); }
.issue-card { background: var(--paper); padding: 28px; display: flex; flex-direction: column; gap: 12px; cursor: pointer; transition: background .2s; position: relative; overflow: hidden; }
.issue-card:hover { background: var(--cream); }
.issue-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:transparent; transition:background .2s; }
.issue-card:hover::before { background: var(--red); }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.card-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.card-date { font-family: var(--font-mono); font-size: 11px; color: var(--muted); white-space: nowrap; }
.card-title { font-family: var(--font-serif); font-size: 17px; font-weight: 700; line-height: 1.45; color: var(--ink); letter-spacing: -.3px; }
.card-summary { font-size: 13px; color: var(--muted); line-height: 1.7; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border); }
.card-support { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 13px; color: var(--ink); }
.heart { color: var(--red); }
.card-region { font-size: 11px; color: var(--muted); font-family: var(--font-mono); }
.status-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; padding: 2px 8px; letter-spacing: .5px; }
.status-접수됨 { background: #fff3cd; color: #856404; }
.status-검증중 { background: #d1ecf1; color: #0c5460; }
.status-공론화진행 { background: #d4edda; color: #155724; }
.status-기관전달 { background: #fde8d8; color: #7d3c00; }
.status-종결 { background: #e2e3e5; color: #383d41; }

/* RANKING */
#ranking { background: var(--ink); }
#ranking .section-title { color: var(--white); }
#ranking .section-label { color: rgba(255,255,255,.4); }
#ranking .section-header { border-color: rgba(255,255,255,.15); }
#ranking .see-all { color: var(--red); border-color: var(--red); }
.ranking-tabs { display: flex; margin-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,.1); }
.ranking-tab { padding: 10px 24px; font-size: 13px; font-weight: 500; color: rgba(255,255,255,.4); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; background: transparent; border-top:0; border-left:0; border-right:0; font-family: var(--font-sans); transition: all .2s; }
.ranking-tab.active, .ranking-tab:hover { color: var(--white); border-bottom-color: var(--red); }
.ranking-item { display: grid; grid-template-columns: 48px 1fr auto; gap: 20px; align-items: center; padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,.07); cursor: pointer; transition: padding-left .2s; }
.ranking-item:hover { padding-left: 8px; }
.rank-num { font-family: var(--font-mono); font-size: 28px; font-weight: 500; color: rgba(255,255,255,.15); text-align: center; line-height: 1; }
.rank-num.gold { color: #ffd700; }
.rank-num.silver { color: #c0c0c0; }
.rank-num.bronze { color: #cd7f32; }
.ranking-tags { display: flex; gap: 6px; margin-bottom: 6px; flex-wrap: wrap; }
.rtag { font-family: var(--font-mono); font-size: 10px; color: rgba(255,255,255,.35); border: 1px solid rgba(255,255,255,.1); padding: 2px 8px; }
.ranking-title { font-family: var(--font-serif); font-size: 16px; font-weight: 700; color: var(--white); line-height: 1.4; }
.ranking-support { text-align: right; }
.ranking-num { font-family: var(--font-mono); font-size: 24px; font-weight: 500; color: var(--red); display: block; }
.ranking-unit { font-size: 10px; color: rgba(255,255,255,.3); letter-spacing: 1px; }

/* REGISTER */
#register { background: var(--cream); padding: 100px 72px; }
.register-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 80px; align-items: start; }
.register-steps { display: flex; flex-direction: column; gap: 0; margin-top: 40px; }
.step { display: grid; grid-template-columns: 40px 1fr; gap: 16px; padding: 20px 0; border-top: 1px solid var(--border); align-items: start; }
.step:last-child { border-bottom: 1px solid var(--border); }
.step-num { font-family: var(--font-mono); font-size: 24px; font-weight: 500; color: var(--border); line-height: 1; padding-top: 2px; }
.step-content h4 { font-size: 15px; font-weight: 700; margin-bottom: 4px; color: var(--ink); }
.step-content p { font-size: 13px; color: var(--muted); line-height: 1.6; }
.register-form-wrap { background: var(--paper); border: 1px solid var(--border); padding: 40px; position: relative; }
.register-form-wrap::before { content:'이슈 제보'; font-family: var(--font-mono); font-size: 10px; letter-spacing: 2px; color: var(--white); background: var(--red); padding: 4px 12px; position: absolute; top: -14px; left: 32px; }
.form-group { margin-bottom: 20px; }
.form-label { display: block; font-size: 12px; font-weight: 600; color: var(--steel); letter-spacing: .5px; margin-bottom: 6px; }
.form-label .req { color: var(--red); margin-left: 2px; }
.form-input, .form-select, .form-textarea { width: 100%; background: var(--white); border: 1px solid var(--border); border-radius: 0; padding: 10px 14px; font-size: 14px; font-family: var(--font-sans); color: var(--ink); outline: none; transition: border-color .2s; appearance: none; }
.form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--ink); }
.form-textarea { resize: vertical; min-height: 100px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.type-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.type-chip { background: transparent; border: 1px solid var(--border); padding: 6px 12px; font-size: 12px; font-weight: 500; color: var(--muted); cursor: pointer; transition: all .15s; font-family: var(--font-sans); }
.type-chip:hover, .type-chip.selected { background: var(--ink); color: var(--white); border-color: var(--ink); }
.form-submit { width: 100%; background: var(--ink); color: var(--white); border: none; padding: 16px; font-size: 15px; font-weight: 700; font-family: var(--font-sans); cursor: pointer; letter-spacing: .5px; transition: all .2s; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; }
.form-submit:hover { background: var(--red); }

/* PRINCIPLES */
#principles { background: var(--paper); padding: 100px 72px; }
.principles-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); margin-top: 56px; }
.principle-card { background: var(--paper); padding: 40px 36px; }
.principle-icon { font-size: 32px; margin-bottom: 20px; display: block; }
.principle-title { font-family: var(--font-serif); font-size: 18px; font-weight: 700; margin-bottom: 12px; letter-spacing: -.3px; }
.principle-desc { font-size: 13px; color: var(--muted); line-height: 1.8; }

/* FOOTER */
.site-footer { background: var(--ink); padding: 60px 72px; border-top: 3px solid var(--red); }
.footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 60px; }
.footer-logo { font-family: var(--font-serif); font-size: 22px; font-weight: 800; color: var(--white); margin-bottom: 12px; }
.footer-tagline { font-size: 13px; color: rgba(255,255,255,.35); line-height: 1.7; max-width: 280px; }
.footer-heading { font-size: 11px; font-weight: 700; color: rgba(255,255,255,.4); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; font-family: var(--font-mono); }
.footer-links { display: flex; flex-direction: column; gap: 10px; }
.footer-links a { font-size: 13px; color: rgba(255,255,255,.55); text-decoration: none; transition: color .2s; }
.footer-links a:hover { color: var(--white); }
.footer-bottom { margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,.08); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.footer-bottom p { font-size: 11px; color: rgba(255,255,255,.25); font-family: var(--font-mono); line-height: 1.6; }
.footer-legal { text-align: right; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.7); display: flex; align-items: center; justify-content: center; padding: 24px; opacity: 0; visibility: hidden; transition: all .3s; }
.modal-overlay.open { opacity: 1; visibility: visible; }
.modal { background: var(--paper); max-width: 760px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; transform: translateY(20px); transition: transform .3s; }
.modal-overlay.open .modal { transform: translateY(0); }
.modal-header { background: var(--ink); padding: 32px 40px; position: relative; }
.modal-close { position: absolute; top: 20px; right: 20px; background: transparent; border: 1px solid rgba(255,255,255,.2); color: rgba(255,255,255,.6); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; transition: all .2s; }
.modal-close:hover { background: var(--red); border-color: var(--red); color: var(--white); }
.modal-status { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.modal-title { font-family: var(--font-serif); font-size: 22px; font-weight: 800; color: var(--white); line-height: 1.3; letter-spacing: -.5px; }
.modal-body { padding: 40px; }
.modal-support-box { background: var(--cream); border-left: 4px solid var(--red); padding: 24px 28px; margin-bottom: 32px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.support-count-big { font-family: var(--font-mono); font-size: 48px; font-weight: 500; color: var(--red); line-height: 1; }
.support-label { font-size: 13px; color: var(--muted); margin-top: 4px; }
.support-btn { background: var(--red); color: var(--white); border: none; padding: 12px 28px; font-size: 15px; font-weight: 700; font-family: var(--font-sans); cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all .2s; white-space: nowrap; }
.support-btn:hover { background: #a93226; transform: translateY(-1px); }
.support-btn.supported { background: var(--steel); }
.modal-section { margin-bottom: 28px; }
.modal-section h3 { font-size: 13px; font-weight: 700; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid var(--border); padding-bottom: 8px; margin-bottom: 12px; font-family: var(--font-mono); }
.modal-section p { font-size: 14px; line-height: 1.8; color: var(--ink); }
.modal-attachments { display: flex; flex-wrap: wrap; gap: 8px; }
.attachment-chip { background: var(--cream); border: 1px solid var(--border); padding: 6px 12px; font-size: 12px; font-family: var(--font-mono); color: var(--steel); display: flex; align-items: center; gap: 6px; }
.reason-select { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px; }
.reason-chip { background: transparent; border: 1px solid var(--border); padding: 6px 14px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all .15s; font-family: var(--font-sans); color: var(--muted); }
.reason-chip:hover, .reason-chip.active { background: var(--ink); color: var(--white); border-color: var(--ink); }

/* TOAST */
.toast { position: fixed; bottom: 32px; right: 32px; z-index: 300; background: var(--ink); color: var(--white); padding: 14px 24px; font-size: 13px; border-left: 4px solid var(--red); transform: translateX(120%); transition: transform .3s ease; max-width: 320px; }
.toast.show { transform: translateX(0); }
.toast.success { border-left-color: #27ae60; }

/* RESPONSIVE */
@media (max-width: 900px) {
  #hero { grid-template-columns: 1fr; }
  .hero-right { display: none; }
  .hero-left { padding: 60px 32px; }
  section { padding: 60px 24px; }
  #register { padding: 60px 24px; }
  .register-grid { grid-template-columns: 1fr; gap: 40px; }
  .principles-grid { grid-template-columns: 1fr; }
  .footer-grid { grid-template-columns: 1fr; gap: 32px; }
  .issues-grid { grid-template-columns: 1fr; }
  .site-header nav { display: none; }
  .site-footer { padding: 48px 24px; }
  .section-header { flex-direction: column; gap: 12px; }
}
`

const ISSUES = [
  { id:1, title:"동일 경범죄 위반에 A구는 훈방, B구는 과태료 48만원 부과", summary:"동일한 경범죄처벌법 위반 행위에 대해 지역별로 처벌 수위가 최대 10배 이상 차이 나는 사례가 다수 확인됨.", type:"형평성", field:"형사", region:"서울", date:"2024-11-15", status:"공론화진행", support:2341, attachments:["처분서","공문"], overview:"2024년 10월, 동일한 공원 내 금지행위(불법 취식) 위반으로 A구에서는 훈방 조치, B구에서는 즉결심판 회부 및 과태료 48만원이 부과되었습니다. 해당 사례를 포함해 동일 법령 위반에 대한 지역별 처벌 차이 사례가 총 47건 수집되었습니다.", problem:"경범죄처벌법 제3조 동일 조항 위반임에도 불구하고, 담당 경찰관 및 관할 서에 따라 훈방에서 즉결심판까지 처분이 임의적으로 결정되고 있습니다. 법 적용의 일관성이 전혀 없습니다.", sense:"동일한 행위에 대해 지역에 따라 수십 배의 처벌 차이가 발생하는 것은 법 앞에 평등이라는 헌법적 가치를 침해합니다. 명확한 내부 기준이 있어야 합니다.", requests:["재검토","제도개선"] },
  { id:2, title:"소규모 자영업자 세무조사, 대기업 동일 위반 대비 5배 중한 처분", summary:"매출 3억 이하 소규모 자영업자에 대한 세무조사 처분이 동일 위반 내용의 대기업 대비 현저히 중하게 부과된 사례.", type:"선별집행", field:"세무", region:"경기", date:"2024-10-03", status:"검증중", support:1892, attachments:["처분서"], overview:"소규모 식당 운영자가 세금계산서 발급 누락(150만원 상당)으로 가산세 포함 780만원 처분을 받았습니다. 동일한 위반을 한 대기업(누락액 4700만원)은 가산세 없이 본세만 납부하는 수정신고로 종결된 사실이 확인됩니다.", problem:"국세기본법상 세무조사 선정 기준과 처분 기준이 규모에 따라 차등 적용되는 구체적 근거가 없음에도 불구하고, 실무에서는 사실상 소규모 사업자에게 더 가혹한 처분이 이루어지고 있습니다.", sense:"조세법률주의 원칙에 따라 동일 위반에는 동일 기준이 적용되어야 합니다. 납세자 규모에 따른 처분 차등은 법적 근거 없이 행해지는 행정 편의적 집행입니다.", requests:["감사","공론화"] },
  { id:3, title:"건축물 용도변경 신고 없이 10년 영업한 대형 상가, 단 경고로 종결", summary:"영세 음식점에는 즉시 영업정지 처분이 내려진 동일 위반 사항에 대해, 대형 쇼핑몰에는 시정권고만 부과.", type:"선별집행", field:"건축", region:"부산", date:"2024-09-21", status:"기관전달", support:1547, attachments:["처분서","판결문","공문"], overview:"부산 소재 영세 음식점(35㎡)이 건축물대장상 용도와 다른 영업을 이유로 즉시 영업정지 3개월 처분을 받았습니다. 같은 구청 관할 대형 쇼핑몰(3층 전체)의 동일 위반에 대해서는 시정권고 후 6개월 자진 이행으로 종결된 사실이 문서로 확인됩니다.", problem:"건축법 제19조 위반 처분 기준인 '건축물 용도변경 미신고'에 대한 처분 수위는 동일한 법령 조항에 근거해야 합니다. 위반 면적 및 기간이 오히려 대형 쇼핑몰이 훨씬 큼에도 경한 처분이 내려졌습니다.", sense:"행정 처분은 위반의 경중, 기간, 면적에 비례해야 합니다. 소규모 업소에 더 무거운 처분이 내려지는 것은 비례원칙에 반하는 명백한 형평성 위반입니다.", requests:["재검토","감사","공론화"] },
  { id:4, title:"노동감독관, 체불임금 신고 4개월째 사실조사 미착수", summary:"체불임금 진정 후 4개월이 지나도록 사실조사는커녕 사건담당자 배정조차 안 된 사례.", type:"절차위반", field:"노동", region:"인천", date:"2024-08-14", status:"접수됨", support:983, attachments:["공문"], overview:"2024년 4월, 3개월치 임금 총 850만원의 체불 사실을 진정서와 증거자료(급여명세서, 통장내역)와 함께 제출하였으나, 8월 현재까지 담당 감독관 배정 및 사실조사 착수가 이루어지지 않고 있습니다.", problem:"근로기준법 제105조 및 고용노동부 훈령 '임금체불 진정 처리지침'에 의하면 접수 후 30일 이내 사실조사에 착수해야 합니다. 이를 120일 이상 초과한 것은 명백한 절차 위반입니다.", sense:"피해 근로자는 생계 위기에 처해 있는 반면 법정 처리 기간을 4배 이상 초과한 무대응은 행정의 직무 유기에 해당합니다.", requests:["재검토","감사"] },
  { id:5, title:"교통단속 카메라 사각지대 구간에만 집중적 수동 단속 시행", summary:"CCTV 미설치 구간에서만 반복적으로 수동 단속이 집중되어, 단속 수입 극대화 의도가 명백하다는 민원이 잇따르고 있음.", type:"행정편의", field:"교통", region:"대구", date:"2024-11-01", status:"검증중", support:754, attachments:[], overview:"대구시 OO구 일대 CCTV 단속 사각지대 200m 구간에서 최근 3개월간 총 847건의 수동 단속이 집중되었습니다. 인근 CCTV 설치 구간의 같은 기간 자동 단속 건수는 23건에 불과합니다.", problem:"도로교통법상 단속 장소 선정은 교통사고 예방 목적에 따라야 하며, 단속 실적·수입 극대화를 위한 장소 선정은 허용되지 않습니다.", sense:"동일한 위반임에도 CCTV 유무에 따라 단속 여부가 달라지는 것은 법 집행의 자의성을 보여줍니다.", requests:["재검토","제도개선"] },
  { id:6, title:"영업허가 갱신 서류 기한 내 제출했음에도 '누락' 처리 후 허가 취소", summary:"법정 기한 전에 등기우편으로 발송한 갱신 서류가 구청 내부 전달 과정에서 분실되어 허가 취소된 사례.", type:"절차위반", field:"영업", region:"광주", date:"2024-10-18", status:"공론화진행", support:1203, attachments:["처분서","공문"], overview:"영업허가 갱신 서류를 법정 마감일 5일 전 등기우편으로 발송하였으나(등기번호 확인 가능), 구청 내부에서 행정서류 분실이 발생하여 '기한 내 미제출'로 처리 후 영업허가가 취소되었습니다.", problem:"행정절차법 제17조에 따르면 우편으로 제출된 서류는 발송일 기준으로 접수된 것으로 봅니다. 구청 내부 분실을 사유로 시민에게 책임을 전가하는 것은 위법입니다.", sense:"행정기관의 실수로 인한 피해를 시민에게 부담시키는 것은 신뢰 원칙에 반합니다.", requests:["재검토","감사","공론화"] },
]

const RANKING_DATA: Record<string, number[]> = { weekly:[0,1,5,3,2], monthly:[1,0,2,5,3], all:[0,1,2,3,5] }

const STATUS_EMOJI: Record<string, string> = { 접수됨:'🟡', 검증중:'🔵', 공론화진행:'🟢', 기관전달:'🟠', 종결:'⚪' }

interface Issue {
  id: number; title: string; summary: string; type: string; field: string;
  region: string; date: string; status: string; support: number;
  attachments: string[]; overview: string; problem: string; sense: string; requests: string[];
}

export default function HomePage() {
  const [filter, setFilter] = useState('all')
  const [rankingPeriod, setRankingPeriod] = useState('weekly')
  const [modalIssue, setModalIssue] = useState<Issue | null>(null)
  const [supported, setSupported] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [selectedChips, setSelectedChips] = useState<string[]>([])
  const [toast, setToast] = useState({ msg: '', type: '', show: false })
  const [form, setForm] = useState({ title:'', type:'', field:'', region:'', date:'', overview:'', problem:'' })

  const showToast = (msg: string, type = '') => {
    setToast({ msg, type, show: true })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500)
  }

  const filteredIssues = filter === 'all' ? ISSUES : ISSUES.filter(i => i.type === filter)
  const rankingIssues = RANKING_DATA[rankingPeriod].map(id => ISSUES[id])

  const openModal = (issue: Issue) => {
    setModalIssue(issue)
    setSupported(false)
    setSelectedReason('')
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setModalIssue(null)
    document.body.style.overflow = ''
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const toggleSupport = () => {
    setSupported(s => {
      const next = !s
      showToast(next ? '공감해 주셔서 감사합니다. 이슈가 공론화에 더 가까워졌습니다.' : '공감이 취소되었습니다.', next ? 'success' : '')
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.type || !form.field || !form.overview || !form.problem) {
      showToast('필수 항목을 모두 입력해 주세요.')
      return
    }
    showToast('제보가 접수되었습니다. 관리자 검토 후 1~3일 내 공개됩니다.', 'success')
    setForm({ title:'', type:'', field:'', region:'', date:'', overview:'', problem:'' })
    setSelectedChips([])
  }

  const toggleChip = (chip: string) => {
    setSelectedChips(c => c.includes(chip) ? c.filter(x => x !== chip) : [...c, chip])
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* HEADER */}
      <header className="site-header">
        <div className="header-left">
          <a href="#" className="logo"><div className="logo-dot" />시민신문고</a>
          <div className="header-badge">BETA</div>
        </div>
        <nav>
          <a href="#issues">이슈 목록</a>
          <a href="#ranking">추천 랭킹</a>
          <a href="#register">제보하기</a>
          <a href="#principles">운영 원칙</a>
          <a href="#register" className="header-cta">+ 이슈 제보</a>
        </nav>
      </header>

      {/* HERO */}
      <section id="hero">
        <div className="hero-left">
          <div className="hero-eyebrow">시민 공론 플랫폼</div>
          <h1 className="hero-title">상식을<br />기록하면<br /><em>세상이 바뀐다</em></h1>
          <p className="hero-desc">불합리한 법집행 사례를 증거와 구조로 기록하고, 시민의 공감으로 공론화합니다. 개인의 분노가 아닌 데이터로 상식을 시각화합니다.</p>
          <div className="hero-stats">
            <div className="stat-item"><span className="stat-num">248</span><div className="stat-label">등록 이슈</div></div>
            <div className="stat-item"><span className="stat-num">18.4k</span><div className="stat-label">총 추천</div></div>
            <div className="stat-item"><span className="stat-num">12</span><div className="stat-label">개선 사례</div></div>
          </div>
          <div className="hero-actions">
            <a href="#register" className="btn-primary">이슈 제보하기 →</a>
            <a href="#issues" className="btn-secondary">전체 이슈 보기</a>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-bg-text">고발</div>
          <div className="issue-ticker">
            {ISSUES.slice(0, 5).map((issue, i) => (
              <div key={issue.id} className="issue-item" onClick={() => openModal(issue)}>
                <div className={`issue-rank ${i < 2 ? 'top' : ''}`}>{i < 3 ? '▲' : i + 1}</div>
                <div className="issue-body">
                  <div className="issue-title">{issue.title}</div>
                  <div className="issue-meta">
                    <span className="issue-tag">{issue.type}</span>
                    <span className="issue-tag">{issue.field}</span>
                    <span>{issue.region}</span>
                  </div>
                </div>
                <div className="issue-support">
                  <span className="issue-support-num">{issue.support.toLocaleString()}</span>
                  <span className="issue-support-label">추천</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ISSUES */}
      <section id="issues">
        <div className="section-header">
          <div><div className="section-label">전체 이슈</div><h2 className="section-title">기록된 불합리들</h2></div>
          <a href="#" className="see-all">전체보기 →</a>
        </div>
        <div className="filter-bar">
          {['all','과잉단속','선별집행','형평성','절차위반','권한남용','행정편의'].map(f => (
            <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? '전체' : f}
            </button>
          ))}
        </div>
        <div className="issues-grid">
          {filteredIssues.map(issue => (
            <div key={issue.id} className="issue-card" onClick={() => openModal(issue)}>
              <div className="card-header">
                <div className="card-tags">
                  <span className={`status-badge status-${issue.status}`}>{STATUS_EMOJI[issue.status]} {issue.status}</span>
                  <span className="issue-tag">{issue.type}</span>
                  <span className="issue-tag">{issue.field}</span>
                </div>
                <div className="card-date">{issue.date}</div>
              </div>
              <div className="card-title">{issue.title}</div>
              <div className="card-summary">{issue.summary}</div>
              <div className="card-footer">
                <div className="card-support"><span className="heart">♥</span> {issue.support.toLocaleString()} 공감</div>
                <div className="card-region">📍 {issue.region}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RANKING */}
      <section id="ranking">
        <div className="section-header">
          <div><div className="section-label">추천 랭킹</div><h2 className="section-title">가장 많은 공감을<br />받은 이슈</h2></div>
          <a href="#" className="see-all">전체보기 →</a>
        </div>
        <div className="ranking-tabs">
          {[['weekly','주간 TOP'],['monthly','월간 TOP'],['all','누적 TOP']].map(([p,l]) => (
            <button key={p} className={`ranking-tab${rankingPeriod === p ? ' active' : ''}`} onClick={() => setRankingPeriod(p)}>{l}</button>
          ))}
        </div>
        <div className="ranking-list">
          {rankingIssues.map((issue, i) => (
            <div key={issue.id} className="ranking-item" onClick={() => openModal(issue)}>
              <div className={`rank-num${i===0?' gold':i===1?' silver':i===2?' bronze':''}`}>0{i+1}</div>
              <div>
                <div className="ranking-tags">
                  <span className="rtag">{issue.type}</span>
                  <span className="rtag">{issue.field}</span>
                  <span className="rtag">{issue.region}</span>
                </div>
                <div className="ranking-title">{issue.title}</div>
              </div>
              <div className="ranking-support">
                <span className="ranking-num">{issue.support.toLocaleString()}</span>
                <span className="ranking-unit">SUPPORT</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* REGISTER */}
      <section id="register">
        <div className="section-header">
          <div><div className="section-label">이슈 제보</div><h2 className="section-title">당신의 경험을<br />기록하세요</h2></div>
        </div>
        <div className="register-grid">
          <div className="register-info">
            <p style={{fontSize:'15px',color:'var(--muted)',lineHeight:1.8,marginBottom:'32px'}}>사실 중심으로 작성된 이슈는 관리자 검토 후 공개됩니다. 법률 자문단이 검토한 이슈에는 별도 배지가 부여됩니다.</p>
            <div className="register-steps">
              {[
                ['01','기본 정보 입력','발생 지역, 시점, 관련 기관, 법집행 유형을 선택합니다.'],
                ['02','구조화된 본문 작성','사건 개요, 문제점, 상식적 판단, 유사 사례를 항목별로 기술합니다.'],
                ['03','증빙 자료 첨부','판결문, 처분서, 공문 등을 개인정보 가림 처리 후 첨부합니다.'],
                ['04','관리자 검토 후 공개','허위사실이나 감정적 표현이 없는지 확인 후 1~3일 내 공개됩니다.'],
              ].map(([num,title,desc]) => (
                <div key={num} className="step">
                  <div className="step-num">{num}</div>
                  <div className="step-content"><h4>{title}</h4><p>{desc}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="register-form-wrap">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">제목<span className="req">*</span></label>
                <input type="text" className="form-input" placeholder="사실 중심으로 작성해 주세요." maxLength={100} value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">법집행 유형<span className="req">*</span></label>
                  <select className="form-select" value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                    <option value="">선택하세요</option>
                    {['과잉단속','선별집행','형평성','절차위반','권한남용','명확성없음','행정편의','기타'].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">분야<span className="req">*</span></label>
                  <select className="form-select" value={form.field} onChange={e => setForm(f=>({...f,field:e.target.value}))}>
                    <option value="">선택하세요</option>
                    {['형사','세무','건축','영업','노동','환경','교통','교육','기타'].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">지역<span className="req">*</span></label>
                  <select className="form-select" value={form.region} onChange={e => setForm(f=>({...f,region:e.target.value}))}>
                    <option value="">선택하세요</option>
                    {['서울','부산','대구','인천','광주','대전','울산','세종','경기','강원','충북','충남','전북','전남','경북','경남','제주'].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">발생 시점<span className="req">*</span></label>
                  <input type="date" className="form-input" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">요청 사항<span className="req">*</span></label>
                <div className="type-chips">
                  {['재검토','감사','제도개선','공론화'].map(chip => (
                    <button type="button" key={chip} className={`type-chip${selectedChips.includes(chip)?' selected':''}`} onClick={() => toggleChip(chip)}>{chip}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">사건 개요<span className="req">*</span></label>
                <textarea className="form-textarea" placeholder="언제, 어디서, 무슨 일이 있었는지 사실 중심으로 기술해 주세요." value={form.overview} onChange={e => setForm(f=>({...f,overview:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">상식적으로 문제되는 지점<span className="req">*</span></label>
                <textarea className="form-textarea" placeholder="왜 이 법집행이 상식에 어긋난다고 생각하는지 논리적으로 기술해 주세요." value={form.problem} onChange={e => setForm(f=>({...f,problem:e.target.value}))} />
              </div>
              <button type="submit" className="form-submit"><span>📋</span> 제보 등록하기</button>
            </form>
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section id="principles">
        <div className="section-header">
          <div><div className="section-label">플랫폼 원칙</div><h2 className="section-title">신뢰가 공론화의<br />기반입니다</h2></div>
        </div>
        <div className="principles-grid">
          {[
            ['📋','증거 기반','판결문, 처분서, 공문 등 실제 자료를 첨부합니다. 관리자 검토 후 공개되어 신뢰성을 확보합니다. 허위 사실은 즉시 삭제됩니다.'],
            ['🔒','개인정보 보호','실명 공개는 하지 않습니다. 휴대폰 인증으로만 식별하며, 개인정보와 공무원 실명은 자동 마스킹됩니다.'],
            ['⚖️','공익 목적 명시','본 플랫폼은 공익 목적의 의견 개진 플랫폼입니다. 게시 내용은 사실로 단정하지 않으며, 다양한 시각이 존재할 수 있습니다.'],
            ['👥','통제형 댓글','사실 보완과 법률 의견 중심의 댓글만 허용합니다. 감정적 비방, 욕설은 운영자에 의해 즉시 삭제됩니다.'],
            ['🔍','관리자 사전 검토','모든 이슈는 공개 전 관리자 검토를 거칩니다. 법률 자문단이 검토한 이슈에는 별도 배지가 부여됩니다.'],
            ['📡','공론화 연결','누적된 이슈는 언론·국회·감사원 전달용 리포트로 생성됩니다. 개인의 목소리를 제도적 변화로 연결합니다.'],
          ].map(([icon,title,desc]) => (
            <div key={title as string} className="principle-card">
              <span className="principle-icon">{icon}</span>
              <h3 className="principle-title">{title}</h3>
              <p className="principle-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">🔔 시민신문고</div>
            <p className="footer-tagline">증거와 구조로 &apos;상식&apos;을 시각화하는 시민 공론 플랫폼. 개인의 분노가 아닌 데이터로 세상을 바꿉니다.</p>
          </div>
          <div>
            <div className="footer-heading">플랫폼</div>
            <div className="footer-links">
              <a href="#issues">전체 이슈</a>
              <a href="#ranking">추천 랭킹</a>
              <a href="#register">이슈 제보</a>
              <a href="#">자료 아카이브</a>
              <a href="#">제보 가이드</a>
            </div>
          </div>
          <div>
            <div className="footer-heading">정보</div>
            <div className="footer-links">
              <a href="#principles">운영 원칙</a>
              <a href="#">법률 자문단</a>
              <a href="#">개인정보처리방침</a>
              <a href="#">이용약관</a>
              <a href="#">문의하기</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 시민신문고. All rights reserved.<br />본 플랫폼은 공익 목적의 의견 개진 플랫폼이며, 게시 내용은 사실로 단정하지 않습니다.</p>
          <p className="footer-legal">Next.js + Supabase<br />v1.0.0-beta</p>
        </div>
      </footer>

      {/* MODAL */}
      {modalIssue && (
        <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="modal">
            <div className="modal-header">
              <button className="modal-close" onClick={closeModal}>✕</button>
              <div className="modal-status">
                <span className={`status-badge status-${modalIssue.status}`}>{STATUS_EMOJI[modalIssue.status]} {modalIssue.status}</span>
                <span className="issue-tag">{modalIssue.type}</span>
                <span className="issue-tag">{modalIssue.field}</span>
                <span style={{fontFamily:'var(--font-mono)',fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>{modalIssue.region} · {modalIssue.date}</span>
              </div>
              <h2 className="modal-title">{modalIssue.title}</h2>
            </div>
            <div className="modal-body">
              <div className="modal-support-box">
                <div>
                  <div className="support-count-big">{(supported ? modalIssue.support + 1 : modalIssue.support).toLocaleString()}</div>
                  <div className="support-label">명이 이 이슈에 공감합니다</div>
                  <div className="reason-select">
                    {['형평성','과잉처벌','법해석','공익성'].map(r => (
                      <button key={r} className={`reason-chip${selectedReason === r ? ' active' : ''}`} onClick={() => setSelectedReason(r)}>{r}</button>
                    ))}
                  </div>
                </div>
                <button className={`support-btn${supported ? ' supported' : ''}`} onClick={toggleSupport}>
                  {supported ? '✓ 공감 취소' : '👍 공감합니다'}
                </button>
              </div>
              <div className="modal-section"><h3>사건 개요</h3><p>{modalIssue.overview}</p></div>
              <div className="modal-section"><h3>문제가 된 법집행</h3><p>{modalIssue.problem}</p></div>
              <div className="modal-section"><h3>상식적 문제점</h3><p>{modalIssue.sense}</p></div>
              {modalIssue.attachments.length > 0 && (
                <div className="modal-section">
                  <h3>첨부 자료</h3>
                  <div className="modal-attachments">
                    {modalIssue.attachments.map(a => (
                      <div key={a} className="attachment-chip">📄 {a} <span style={{opacity:.4}}>(검토완료)</span></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      <div className={`toast${toast.show ? ' show' : ''}${toast.type ? ' ' + toast.type : ''}`}>{toast.msg}</div>
    </>
  )
}
