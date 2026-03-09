'use client'

import { useState, useEffect } from 'react'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg0:#050810;--bg1:#080d18;--bg2:#0c1220;--bg3:#101828;
  --panel:#09101c;--panel2:#0c1525;
  --bdr:#162232;--bdr2:#1e3047;
  --teal:#00d4a8;--tealD:rgba(0,212,168,.10);--tealG:rgba(0,212,168,.05);
  --amber:#f0a500;--amberD:rgba(240,165,0,.10);
  --red:#e04848;--redD:rgba(224,72,72,.10);
  --blue:#3a8ad4;--blueD:rgba(58,138,212,.10);
  --green:#2ec98a;--greenD:rgba(46,201,138,.10);
  --t0:#d8eaf8;--t1:#6a9ab8;--t2:#2e4a62;--t3:#152233;
  --f-mono:'IBM Plex Mono',monospace;
  --f-sans:'Noto Sans KR',sans-serif;
  --sw:220px;--th:52px;
}
html{font-size:14px;}
body{background:var(--bg0);color:var(--t0);font-family:var(--f-sans);font-weight:400;line-height:1.6;overflow-x:hidden;min-height:100vh;}
body::before{content:'';position:fixed;inset:0;z-index:9999;pointer-events:none;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.045) 2px,rgba(0,0,0,.045) 4px);}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:var(--bg1);}
::-webkit-scrollbar-thumb{background:var(--bdr2);border-radius:2px;}

/* TOPBAR */
#tb{position:fixed;top:0;left:0;right:0;height:var(--th);z-index:200;background:var(--bg1);border-bottom:1px solid var(--bdr2);display:flex;align-items:center;}
.tb-brand{width:var(--sw);height:100%;display:flex;align-items:center;gap:10px;padding:0 18px;border-right:1px solid var(--bdr2);flex-shrink:0;}
.tb-mark{width:30px;height:30px;border:1.5px solid var(--teal);display:flex;align-items:center;justify-content:center;font-family:var(--f-mono);font-size:13px;font-weight:700;color:var(--teal);position:relative;flex-shrink:0;}
.tb-mark::before{content:'';position:absolute;inset:-5px;border:1px solid rgba(0,212,168,.15);}
.tb-mark-glow{position:absolute;inset:-10px;background:radial-gradient(ellipse at center,rgba(0,212,168,.1),transparent 70%);pointer-events:none;}
.tb-brand-txt{font-family:var(--f-mono);}
.tb-brand-name{font-size:11px;font-weight:600;color:var(--t0);letter-spacing:.5px;}
.tb-brand-sub{font-size:9px;color:var(--teal);letter-spacing:2px;text-transform:uppercase;}
.tb-mid{flex:1;display:flex;align-items:center;gap:14px;padding:0 20px;}
.tb-sys{display:flex;align-items:center;gap:7px;font-family:var(--f-mono);font-size:10px;color:var(--t2);}
.sys-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:blink 2s ease-in-out infinite;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
.tb-divider{width:1px;height:18px;background:var(--bdr2);}
.tb-clock{font-family:var(--f-mono);font-size:13px;font-weight:500;color:var(--t1);margin-left:auto;letter-spacing:1px;}
.tb-right{display:flex;align-items:center;gap:6px;padding:0 18px 0 14px;border-left:1px solid var(--bdr2);}
.tb-icon{position:relative;width:32px;height:32px;border:1px solid var(--bdr2);background:none;color:var(--t1);font-size:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:2px;transition:all .2s;}
.tb-icon:hover{border-color:var(--teal);color:var(--teal);box-shadow:0 0 10px rgba(0,212,168,.2);}
.tb-icon .nb{position:absolute;top:-5px;right:-5px;background:var(--red);color:white;font-family:var(--f-mono);font-size:8px;font-weight:700;width:15px;height:15px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1.5px solid var(--bg1);}
.admin-chip{display:flex;align-items:center;gap:8px;border:1px solid var(--bdr2);padding:4px 10px 4px 5px;cursor:pointer;transition:border-color .2s;border-radius:2px;}
.admin-chip:hover{border-color:var(--teal);}
.admin-av{width:26px;height:26px;background:var(--tealD);border:1px solid var(--teal);border-radius:2px;display:flex;align-items:center;justify-content:center;font-family:var(--f-mono);font-size:11px;font-weight:700;color:var(--teal);}
.admin-nm{font-family:var(--f-mono);font-size:10px;color:var(--t0);}
.admin-rl{font-size:9px;color:var(--teal);letter-spacing:1px;}

/* SIDEBAR */
#sb{position:fixed;top:var(--th);left:0;bottom:0;width:var(--sw);background:var(--bg1);border-right:1px solid var(--bdr2);z-index:100;display:flex;flex-direction:column;overflow-y:auto;}
.nav-grp{padding:14px 0 4px;}
.nav-grp-lbl{font-family:var(--f-mono);font-size:9px;letter-spacing:2px;color:var(--t3);text-transform:uppercase;padding:0 14px;margin-bottom:3px;}
.nav-btn{width:100%;display:flex;align-items:center;gap:9px;padding:9px 14px;border:none;border-left:2px solid transparent;background:none;font-family:var(--f-sans);font-size:12px;font-weight:500;color:var(--t2);text-align:left;cursor:pointer;transition:all .14s;}
.nav-btn:hover{background:var(--tealG);color:var(--t0);border-left-color:var(--bdr2);}
.nav-btn.active{background:var(--tealD);color:var(--teal);border-left-color:var(--teal);font-weight:600;}
.nav-ico{font-size:13px;width:16px;text-align:center;flex-shrink:0;}
.nav-badge{margin-left:auto;font-family:var(--f-mono);font-size:9px;font-weight:700;padding:1px 6px;border-radius:2px;min-width:20px;text-align:center;}
.nb-r{background:var(--redD);color:var(--red);border:1px solid rgba(224,72,72,.3);}
.nb-a{background:var(--amberD);color:var(--amber);border:1px solid rgba(240,165,0,.3);}
.nb-t{background:var(--tealD);color:var(--teal);border:1px solid rgba(0,212,168,.3);}
.sb-foot{margin-top:auto;padding:14px;border-top:1px solid var(--bdr2);font-family:var(--f-mono);font-size:9px;color:var(--t3);line-height:2.2;}
.sbf-row{display:flex;align-items:center;gap:6px;}
.sbf-dot{width:5px;height:5px;border-radius:50%;}
.dot-ok{background:var(--green);box-shadow:0 0 5px var(--green);}
.dot-warn{background:var(--amber);}

/* MAIN */
#main{margin-left:var(--sw);margin-top:var(--th);padding:24px;min-height:calc(100vh - var(--th));position:relative;z-index:1;}
.tab-content{animation:fin .24s ease;}
@keyframes fin{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}

/* PAGE HEADER */
.ph{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:22px;padding-bottom:16px;border-bottom:1px solid var(--bdr2);}
.ph-eyebrow{font-family:var(--f-mono);font-size:9px;letter-spacing:2px;color:var(--teal);text-transform:uppercase;margin-bottom:3px;}
.ph-title{font-family:var(--f-mono);font-size:20px;font-weight:600;color:var(--t0);letter-spacing:-.3px;}
.ph-sub{font-family:var(--f-mono);font-size:10px;color:var(--t2);margin-top:3px;}
.ph-actions{display:flex;gap:8px;}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;gap:6px;padding:7px 15px;border:1px solid;font-family:var(--f-mono);font-size:10px;font-weight:600;cursor:pointer;letter-spacing:.3px;transition:all .15s;border-radius:2px;}
.btn-t{background:var(--tealD);border-color:rgba(0,212,168,.4);color:var(--teal);}
.btn-t:hover{background:var(--teal);color:var(--bg0);box-shadow:0 0 14px rgba(0,212,168,.35);}
.btn-r{background:var(--redD);border-color:rgba(224,72,72,.4);color:var(--red);}
.btn-r:hover{background:var(--red);color:#fff;}
.btn-a{background:var(--amberD);border-color:rgba(240,165,0,.4);color:var(--amber);}
.btn-a:hover{background:var(--amber);color:var(--bg0);}
.btn-g{background:transparent;border-color:var(--bdr2);color:var(--t1);}
.btn-g:hover{border-color:var(--t1);color:var(--t0);}
.sm{padding:4px 10px;font-size:9px;}

/* PANEL */
.panel{background:var(--panel);border:1px solid var(--bdr2);overflow:hidden;position:relative;}
.panel-head{padding:11px 18px;border-bottom:1px solid var(--bdr2);display:flex;align-items:center;justify-content:space-between;background:var(--bg2);}
.panel-title{font-family:var(--f-mono);font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--t1);display:flex;align-items:center;gap:8px;}
.panel-title::before{content:'';width:3px;height:11px;background:var(--teal);box-shadow:0 0 6px var(--teal);}
.panel-body{padding:18px;}

/* KPI */
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;}
.kpi{background:var(--panel);border:1px solid var(--bdr2);padding:18px;position:relative;overflow:hidden;cursor:default;transition:transform .2s,border-color .2s;}
.kpi:hover{transform:translateY(-2px);}
.kpi-bar{position:absolute;top:0;left:0;right:0;height:2px;}
.kpi-lbl{font-family:var(--f-mono);font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:var(--t2);margin-bottom:10px;}
.kpi-num{font-family:var(--f-mono);font-size:34px;font-weight:600;line-height:1;margin-bottom:6px;text-shadow:0 0 20px currentColor;}
.kpi-sub{font-family:var(--f-mono);font-size:9px;color:var(--t2);}
.kpi-ico{position:absolute;bottom:12px;right:14px;font-size:24px;opacity:.07;}
.c-t .kpi-num{color:var(--teal);} .c-t .kpi-bar{background:var(--teal);box-shadow:0 0 8px var(--teal);} .c-t:hover{border-color:rgba(0,212,168,.4);}
.c-a .kpi-num{color:var(--amber);} .c-a .kpi-bar{background:var(--amber);box-shadow:0 0 8px var(--amber);} .c-a:hover{border-color:rgba(240,165,0,.4);}
.c-r .kpi-num{color:var(--red);}   .c-r .kpi-bar{background:var(--red);box-shadow:0 0 8px var(--red);}   .c-r:hover{border-color:rgba(224,72,72,.4);}
.c-b .kpi-num{color:var(--blue);}  .c-b .kpi-bar{background:var(--blue);box-shadow:0 0 8px var(--blue);}  .c-b:hover{border-color:rgba(58,138,212,.4);}

/* BADGES */
.badge{display:inline-flex;align-items:center;gap:3px;font-family:var(--f-mono);font-size:10px;font-weight:600;padding:2px 8px;letter-spacing:.3px;border:1px solid;border-radius:2px;}
.b-접수됨{background:rgba(240,165,0,.08);border-color:rgba(240,165,0,.3);color:var(--amber);}
.b-검증중{background:rgba(58,138,212,.08);border-color:rgba(58,138,212,.3);color:var(--blue);}
.b-공론화진행{background:rgba(0,212,168,.08);border-color:rgba(0,212,168,.3);color:var(--teal);}
.b-기관전달{background:rgba(224,72,72,.08);border-color:rgba(224,72,72,.3);color:var(--red);}
.b-종결{background:rgba(106,154,184,.08);border-color:rgba(106,154,184,.3);color:var(--t1);}
.tag{display:inline-block;font-family:var(--f-mono);font-size:10px;padding:1px 7px;background:var(--bg3);border:1px solid var(--bdr);color:var(--t1);}

/* TABLE */
.tbl{width:100%;border-collapse:collapse;}
.tbl th{font-family:var(--f-mono);font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--t2);text-align:left;padding:9px 14px;background:var(--bg2);border-bottom:1px solid var(--bdr2);white-space:nowrap;}
.tbl td{padding:11px 14px;border-bottom:1px solid var(--bdr);vertical-align:middle;font-size:12px;}
.tbl tbody tr{transition:background .12s;}
.tbl tbody tr:hover{background:var(--tealG);cursor:pointer;}
.tbl tbody tr:last-child td{border-bottom:none;}
.tt{color:var(--t0);font-size:12px;font-weight:500;line-height:1.4;max-width:280px;}
.ts{font-size:10px;color:var(--t2);margin-top:2px;max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tm{font-family:var(--f-mono);font-size:11px;color:var(--t1);white-space:nowrap;}

/* BAR CHART */
.barchart{display:flex;flex-direction:column;gap:10px;}
.brow{display:grid;grid-template-columns:72px 1fr 42px;gap:10px;align-items:center;}
.blbl{font-family:var(--f-mono);font-size:10px;color:var(--t1);text-align:right;}
.btrack{background:var(--bg2);border-radius:1px;height:5px;overflow:hidden;border:1px solid var(--bdr);}
.bfill{height:100%;border-radius:1px;transition:width 1.1s cubic-bezier(.4,0,.2,1);}
.bval{font-family:var(--f-mono);font-size:10px;color:var(--t2);text-align:right;}

/* ACTIVITY FEED */
.feed-item{display:grid;grid-template-columns:8px 1fr auto;gap:12px;padding:11px 0;border-bottom:1px solid var(--bdr);align-items:start;}
.feed-item:last-child{border-bottom:none;}
.fdot{width:7px;height:7px;border-radius:50%;margin-top:5px;}
.fd-t{background:var(--teal);box-shadow:0 0 6px var(--teal);}
.fd-a{background:var(--amber);}
.fd-r{background:var(--red);}
.fd-b{background:var(--blue);}
.fd-g{background:var(--green);}
.ftxt{font-size:11px;color:var(--t1);line-height:1.5;}
.ftxt strong{color:var(--t0);font-weight:600;}
.ftime{font-family:var(--f-mono);font-size:9px;color:var(--t2);white-space:nowrap;}

/* RANKING */
.rank-row{display:grid;grid-template-columns:28px 1fr auto;gap:10px;padding:10px 18px;border-bottom:1px solid var(--bdr);align-items:center;cursor:pointer;transition:background .12s;}
.rank-row:hover{background:var(--tealG);}
.rank-row:last-child{border-bottom:none;}
.rank-n{font-family:var(--f-mono);font-size:13px;font-weight:700;color:var(--t3);text-align:center;}
.rank-n.r1{color:#ffd700;text-shadow:0 0 8px rgba(255,215,0,.5);}
.rank-n.r2{color:#aab8c2;}
.rank-n.r3{color:#cd7f32;}
.rank-t{font-size:12px;color:var(--t0);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.rank-c{font-family:var(--f-mono);font-size:12px;color:var(--teal);font-weight:600;white-space:nowrap;}

/* STATUS GRID */
.sopt-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.sopt{padding:10px 14px;border:1px solid var(--bdr2);background:var(--bg2);font-family:var(--f-mono);font-size:11px;cursor:pointer;display:flex;align-items:center;gap:8px;color:var(--t1);border-radius:2px;transition:all .14s;}
.sopt:hover{border-color:var(--teal);color:var(--teal);background:var(--tealD);}
.sopt.sel{border-color:var(--teal);color:var(--teal);background:var(--tealD);}

/* FORM */
.fg{margin-bottom:16px;}
.flbl{display:block;font-family:var(--f-mono);font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:var(--t2);margin-bottom:6px;}
.finput,.fselect,.ftextarea{width:100%;background:var(--bg2);border:1px solid var(--bdr2);color:var(--t0);padding:8px 12px;font-size:12px;font-family:var(--f-mono);outline:none;transition:border-color .15s;appearance:none;border-radius:2px;}
.finput:focus,.fselect:focus,.ftextarea:focus{border-color:var(--teal);}
.finput::placeholder{color:var(--t3);}
.ftextarea{resize:vertical;min-height:80px;}

/* MODAL */
.overlay{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.78);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;visibility:hidden;transition:all .22s;}
.overlay.open{opacity:1;visibility:visible;}
.modal{background:var(--bg1);border:1px solid var(--bdr2);max-width:580px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 0 60px rgba(0,0,0,.7),0 0 0 1px rgba(0,212,168,.07);transform:translateY(12px) scale(.975);transition:transform .22s;}
.overlay.open .modal{transform:translateY(0) scale(1);}
.modal-lg{max-width:700px;}
.modal-head{padding:17px 22px;border-bottom:1px solid var(--bdr2);display:flex;align-items:center;justify-content:space-between;background:var(--bg2);}
.modal-ttl{font-family:var(--f-mono);font-size:11px;font-weight:600;color:var(--teal);letter-spacing:1px;text-transform:uppercase;}
.modal-x{width:28px;height:28px;border:1px solid var(--bdr2);background:none;color:var(--t1);font-size:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:2px;transition:all .14s;}
.modal-x:hover{border-color:var(--red);color:var(--red);}
.modal-body{padding:22px;}
.modal-foot{padding:14px 22px;border-top:1px solid var(--bdr2);background:var(--bg2);display:flex;gap:8px;justify-content:flex-end;}
.ds{margin-bottom:18px;}
.ds-lbl{font-family:var(--f-mono);font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:var(--t2);border-bottom:1px solid var(--bdr2);padding-bottom:5px;margin-bottom:7px;}
.ds-txt{font-size:12px;color:var(--t1);line-height:1.8;}

/* TOAST */
#toasts{position:fixed;bottom:22px;right:22px;z-index:9998;display:flex;flex-direction:column;gap:8px;}
.toast-item{background:var(--bg2);border:1px solid var(--bdr2);border-left:3px solid var(--teal);padding:11px 17px;font-family:var(--f-mono);font-size:11px;color:var(--t0);box-shadow:0 8px 32px rgba(0,0,0,.6);max-width:330px;display:flex;align-items:center;gap:10px;}
.toast-item.err{border-left-color:var(--red);}
.toast-item.warn{border-left-color:var(--amber);}
.toast-item.ok{border-left-color:var(--green);}

/* TOGGLE */
.tog-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--bdr);}
.tog-row:last-child{border-bottom:none;}
.tog-info h4{font-size:12px;font-weight:500;color:var(--t0);}
.tog-info p{font-size:10px;color:var(--t2);font-family:var(--f-mono);margin-top:1px;}
.toggle{width:40px;height:20px;border-radius:10px;background:var(--bdr2);border:none;position:relative;cursor:pointer;transition:background .2s;flex-shrink:0;}
.toggle.on{background:var(--teal);box-shadow:0 0 8px rgba(0,212,168,.35);}
.toggle::after{content:'';position:absolute;width:16px;height:16px;border-radius:50%;background:var(--bg0);top:2px;left:2px;transition:left .2s;box-shadow:0 1px 4px rgba(0,0,0,.6);}
.toggle.on::after{left:22px;}

/* REPORT CARD */
.rc{border:1px solid var(--bdr2);background:var(--panel);padding:16px 18px;margin-bottom:10px;transition:border-color .14s;}
.rc-type{font-family:var(--f-mono);font-size:9px;letter-spacing:1px;background:var(--redD);border:1px solid rgba(224,72,72,.3);color:var(--red);padding:2px 8px;display:inline-block;}
.rc-title{font-size:13px;font-weight:600;color:var(--t0);margin:6px 0 10px;}
.rc-reason{background:var(--bg2);border-left:3px solid var(--amber);padding:8px 12px;font-family:var(--f-mono);font-size:11px;color:var(--t1);line-height:1.6;}
.rc-foot{display:flex;align-items:center;justify-content:space-between;margin-top:12px;}
.rc-meta{font-family:var(--f-mono);font-size:10px;color:var(--t2);}

/* GRIDS */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.g-main{display:grid;grid-template-columns:1.7fr 1fr;gap:16px;margin-bottom:16px;}
.g-col{display:flex;flex-direction:column;gap:16px;}
.mb16{margin-bottom:16px;}
.mb20{margin-bottom:20px;}
.info-row{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg2);border:1px solid var(--bdr);font-size:11px;margin-bottom:6px;}
.info-row span:first-child{color:var(--t2);font-family:var(--f-mono);}
.info-row span:last-child{color:var(--t0);font-family:var(--f-mono);}
.stat-box{text-align:center;padding:16px;background:var(--bg2);border:1px solid var(--bdr2);}
.stat-num2{font-family:var(--f-mono);font-size:28px;font-weight:600;line-height:1;margin-bottom:4px;}
.stat-lbl{font-family:var(--f-mono);font-size:9px;letter-spacing:1px;color:var(--t2);text-transform:uppercase;}
`

const PENDING = [
  {id:243,title:'교통단속 카메라 사각지대 집중 단속 행정편의 의혹',summary:'대구 CCTV 미설치 200m 구간에 3개월간 847건 수동 단속',type:'행정편의',field:'교통',region:'대구',date:'2025-02-20',overview:'대구시 OO구 일대 CCTV 단속 사각지대 200m 구간에서 최근 3개월간 총 847건의 수동 단속이 집중되었습니다.',problem:'도로교통법상 단속 장소 선정은 교통사고 예방 목적에 따라야 하며, 단속 실적·수입 극대화를 위한 장소 선정은 허용되지 않습니다.',sense:'동일한 위반임에도 CCTV 유무에 따라 단속 여부가 달라지는 것은 법 집행의 자의성을 보여줍니다.'},
  {id:244,title:'지자체 공공공사 수의계약 반복 발주 의혹',summary:'동일 업체에 3년간 수의계약 47건, 총액 23억원 발주',type:'권한남용',field:'건축',region:'경남',date:'2025-02-19',overview:'경남 OO시가 동일 업체에 3년간 수의계약 47건, 총액 23억원을 발주한 사실이 확인됩니다.',problem:'지방계약법상 수의계약은 예외적으로만 허용되며, 동일 업체 반복 발주는 입찰 방해 소지가 있습니다.',sense:'공정한 입찰 없이 특정 업체에 반복 발주하는 것은 공익을 침해하는 행위입니다.'},
  {id:245,title:'건강보험 급여 항목 심사기준 지역별 상이 적용',summary:'동일 처방전에 서울은 급여 인정, 지방은 100% 삭감',type:'형평성',field:'기타',region:'전남',date:'2025-02-19',overview:'동일 처방전(희귀질환 치료제)에 대해 서울 소재 병원은 급여 인정, 전남 소재 병원은 100% 삭감된 사례입니다.',problem:'건강보험 심사평가원의 급여 기준은 전국 동일하게 적용되어야 합니다.',sense:'거주 지역에 따라 동일 질환의 치료 접근성이 달라지는 것은 의료 형평성 원칙에 반합니다.'},
  {id:246,title:'소방 시설 점검 동일 위반 업소간 처분 차이',summary:'PC방 형사 고발, 인근 노래방 개선명령만 — 동일 위반',type:'형평성',field:'영업',region:'인천',date:'2025-02-18',overview:'인천 OO소방서가 동일한 스프링클러 미설치 위반에 대해 PC방은 형사 고발, 인근 노래방은 개선명령만 부과하였습니다.',problem:'화재예방법 동일 조항 위반에 대한 처분 기준이 업종에 따라 달리 적용된 근거가 없습니다.',sense:'동일 위반에 대한 처분 차이는 재량권 남용에 해당합니다.'},
  {id:247,title:'폐업 신고 후 4개월간 부가세 납부 요구 지속',summary:'적법한 폐업 신고 완료 후 세무서 시스템 미갱신으로 고지 반복',type:'절차위반',field:'세무',region:'서울',date:'2025-02-18',overview:'2024년 10월 폐업 신고를 완료하였으나, 세무서 내부 시스템 미갱신으로 2025년 2월까지 부가세 납부 안내문이 지속 발송되었습니다.',problem:'국세기본법상 폐업 신고 처리는 신고일로부터 즉시 효력이 발생합니다.',sense:'행정기관 내부 오류를 납세자에게 전가하는 것은 납세자 권익을 침해합니다.'},
  {id:248,title:'동일 위반 건물에 인접 자치구 처분 7배 차이',summary:'A구 50만원 vs B구 350만원 — 동일 건축물 유지관리 위반',type:'형평성',field:'건축',region:'서울',date:'2025-02-20',overview:'서울 인접 두 자치구(A구, B구)에서 동일한 건축물 유지관리 위반 기준으로 각각 50만원, 350만원의 과태료가 부과된 사례입니다.',problem:'서울시 건축 조례 동일 조항의 위반 과태료 기준은 구별로 차이가 없어야 합니다.',sense:'같은 서울시 내에서 자치구에 따라 처벌이 7배 차이나는 것은 법 앞의 평등 원칙에 반합니다.'},
]

const ALL_ISSUES = [
  {id:1,title:'동일 경범죄 위반 지역별 처벌 최대 10배 차이',status:'공론화진행',field:'형사',region:'서울',support:2341,pub:true},
  {id:2,title:'소규모 자영업자 세무조사 형평성 문제',status:'검증중',field:'세무',region:'경기',support:1892,pub:true},
  {id:3,title:'건축물 용도변경 대기업 vs 영세업소 차별 처분',status:'기관전달',field:'건축',region:'부산',support:1547,pub:true},
  {id:4,title:'노동감독관 체불임금 신고 4개월째 미착수',status:'접수됨',field:'노동',region:'인천',support:983,pub:true},
  {id:5,title:'교통단속 카메라 사각지대 집중 수동 단속',status:'검증중',field:'교통',region:'대구',support:754,pub:true},
  {id:6,title:'영업허가 갱신 서류 관청 내부 분실 후 허가 취소',status:'공론화진행',field:'영업',region:'광주',support:1203,pub:true},
  {id:7,title:'고용노동부 직업훈련 지원금 기준 불명확',status:'종결',field:'노동',region:'대전',support:412,pub:true},
  {id:8,title:'공원 내 소음 단속 기준 업소별 차별 적용',status:'검증중',field:'환경',region:'서울',support:623,pub:true},
]

const FILES = [
  {id:1,name:'처분서_가림처리_243.pdf',type:'처분서',issue:'#243 교통단속 사각지대',date:'2025-02-20',size:'2.1 MB'},
  {id:2,name:'공문_수의계약_244.pdf',type:'공문',issue:'#244 수의계약 반복 발주',date:'2025-02-19',size:'4.8 MB'},
  {id:3,name:'처분서_건강보험_245.jpg',type:'처분서',issue:'#245 건강보험 급여 차별',date:'2025-02-19',size:'1.3 MB'},
  {id:4,name:'공문_소방점검_246.pdf',type:'공문',issue:'#246 소방시설 처분 차이',date:'2025-02-18',size:'3.2 MB'},
]

const COMMENTS = [
  {type:'사실보완',content:'관련 사례로 2023년 서울행정법원 판결이 있습니다.',author:'user_a9k2',issue:'#241',time:'15분 전',flagged:false},
  {type:'법률의견',content:'형사소송법 제196조 해석상 해당 처분은 절차 하자 소지가 있습니다.',author:'user_b7m1',issue:'#238',time:'1시간 전',flagged:false},
  {type:'일반',content:'이 문제 진짜 심각하다. 이런거 왜 아무도 모르는거야?',author:'user_c3x4',issue:'#243',time:'2시간 전',flagged:false},
  {type:'일반',content:'담당 공무원 실명 밝혀야 한다!!!',author:'user_d8p9',issue:'#235',time:'3시간 전',flagged:true},
  {type:'사실보완',content:'국민권익위원회 2024년 보고서에도 유사 사례가 언급되어 있습니다.',author:'user_e2q7',issue:'#240',time:'4시간 전',flagged:false},
]

const REPORTS_DATA = [
  {id:1,type:'개인정보 침해',title:'#237 세무조사 형평성 이슈',reason:'게시글에 특정 세무공무원 실명이 포함되어 있습니다. 개인정보 침해 소지가 있습니다.',reporter:'user_f5r2',time:'1시간 전'},
  {id:2,type:'허위사실',title:'#231 노동청 민원 처리 지연',reason:'사실과 다른 내용이 포함되어 있습니다. 처리 기간이 과장되어 있습니다.',reporter:'user_g6s8',time:'3시간 전'},
  {id:3,type:'비방·욕설',title:'#228 교통 단속 민원',reason:'댓글에 특정인에 대한 욕설이 포함되어 있어 신고합니다.',reporter:'user_h4t3',time:'5시간 전'},
]

type Tab = 'dashboard'|'pending'|'all'|'statusmgmt'|'files'|'comments'|'reports'|'analytics'|'settings'

interface ToastMsg { id: number; msg: string; type: string }
interface DetailIssue { id: number; title: string; overview: string; problem: string; sense: string; type: string; field: string; region: string; date: string }
interface StatusIssue { id: number; title: string; status: string }

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [clock, setClock] = useState('')
  const [uptime, setUptime] = useState('00:00:00')
  const [dashDate, setDashDate] = useState('')
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const [pendingList, setPendingList] = useState(PENDING)
  const [fileList, setFileList] = useState(FILES)
  const [reportList, setReportList] = useState(REPORTS_DATA)
  const [commentList, setCommentList] = useState(COMMENTS)
  const [hiddenComments, setHiddenComments] = useState<number[]>([])

  // Modals
  const [detailIssue, setDetailIssue] = useState<DetailIssue | null>(null)
  const [statusIssue, setStatusIssue] = useState<StatusIssue | null>(null)
  const [rejectIssue, setRejectIssue] = useState<{id:number,title:string} | null>(null)
  const [selSt, setSelSt] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [statusNote, setStatusNote] = useState('')

  // Toggles
  const [toggles, setToggles] = useState({ accept:true, comment:true, guest:true, mask:true })

  const startTime = typeof window !== 'undefined' ? Date.now() : 0

  const toast = (msg: string, type = '') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }

  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, '0')
    const tick = () => {
      const now = new Date()
      setClock(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`)
      setDashDate(now.toLocaleString('ko-KR', { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' }))
      const e = Math.floor((Date.now() - startTime) / 1000)
      setUptime(`${pad(Math.floor(e/3600))}:${pad(Math.floor((e%3600)/60))}:${pad(e%60)}`)
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setDetailIssue(null); setStatusIssue(null); setRejectIssue(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const approveIssue = (id: number) => {
    setPendingList(l => l.filter(x => x.id !== id))
    toast(`이슈 #${id} 승인 완료 — 공개 처리되었습니다.`, 'ok')
  }

  const confirmReject = () => {
    if (!rejectReason.trim()) { toast('거절 사유를 입력하세요.', 'err'); return }
    if (rejectIssue) {
      setPendingList(l => l.filter(x => x.id !== rejectIssue.id))
      toast(`이슈 #${rejectIssue.id} 거절 처리되었습니다.`, 'err')
    }
    setRejectIssue(null); setRejectReason('')
  }

  const submitStatus = () => {
    if (!selSt) { toast('상태를 선택하세요.', 'err'); return }
    toast(`이슈 #${statusIssue?.id} → [${selSt}] 변경 완료`, 'ok')
    setStatusIssue(null); setSelSt(''); setStatusNote('')
  }

  const approveFile = (id: number) => { setFileList(l => l.filter(x => x.id !== id)); toast('첨부파일 승인 완료', 'ok') }
  const rejectFile = (id: number) => { setFileList(l => l.filter(x => x.id !== id)); toast('첨부파일 거절됨', 'err') }
  const resolveReport = (id: number, status: string) => { setReportList(l => l.filter(x => x.id !== id)); toast(`신고 #${id} ${status} 처리됨`, status==='기각'?'warn':'ok') }
  const hideComment = (idx: number) => { setHiddenComments(h => [...h, idx]); toast('댓글 숨김 처리됨', 'warn') }

  const NAV = [
    { group:'Overview', items:[{id:'dashboard',ico:'◈',label:'대시보드'}] },
    { group:'이슈 관리', items:[{id:'pending',ico:'◉',label:'승인 대기',badge:pendingList.length,bc:'nb-r'},{id:'all',ico:'☰',label:'전체 이슈',badge:248,bc:'nb-t'},{id:'statusmgmt',ico:'◑',label:'상태 관리'}] },
    { group:'콘텐츠', items:[{id:'files',ico:'📎',label:'첨부파일 검토',badge:fileList.length,bc:'nb-a'},{id:'comments',ico:'💬',label:'댓글 관리'},{id:'reports',ico:'⚑',label:'신고 처리',badge:reportList.length,bc:'nb-r'}] },
    { group:'분석·시스템', items:[{id:'analytics',ico:'▦',label:'통계·분석'},{id:'settings',ico:'⚙',label:'시스템 설정'}] },
  ]

  const toastIcons: Record<string,string> = { ok:'✓', err:'✕', warn:'⚠', '':'●' }
  const toastColors: Record<string,string> = { ok:'var(--green)', err:'var(--red)', warn:'var(--amber)', '':'var(--teal)' }

  const barData = [
    {label:'접수됨',val:42,pct:28,color:'var(--amber)'},
    {label:'검증중',val:18,pct:12,color:'var(--blue)'},
    {label:'공론화',val:28,pct:19,color:'var(--teal)'},
    {label:'기관전달',val:12,pct:8,color:'var(--red)'},
    {label:'종결',val:148,pct:100,color:'var(--t2)'},
  ]
  const fieldData = [
    {label:'형사',val:72,pct:100,color:'linear-gradient(90deg,var(--teal),var(--blue))'},
    {label:'교통',val:55,pct:76,color:'var(--teal)'},
    {label:'세무',val:40,pct:56,color:'var(--teal)'},
    {label:'건축',val:33,pct:46,color:'var(--teal)'},
    {label:'노동',val:28,pct:39,color:'var(--teal)'},
  ]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* TOPBAR */}
      <div id="tb">
        <div className="tb-brand">
          <div className="tb-mark"><div className="tb-mark-glow" />관</div>
          <div className="tb-brand-txt">
            <div className="tb-brand-name">시민신문고</div>
            <div className="tb-brand-sub">Admin Console</div>
          </div>
        </div>
        <div className="tb-mid">
          <div className="tb-sys"><div className="sys-dot" />SYSTEM ONLINE</div>
          <div className="tb-divider" />
          <div className="tb-sys">DB CONNECTED</div>
          <div className="tb-divider" />
          <div className="tb-sys">v1.0.0-beta</div>
          <div className="tb-clock">{clock}</div>
        </div>
        <div className="tb-right">
          <button className="tb-icon" onClick={() => toast('신고 3건·첨부파일 4건 승인 대기 중입니다.','warn')}>🔔<span className="nb">3</span></button>
          <button className="tb-icon" onClick={() => toast('리포트 생성 기능 준비 중입니다.')}>📊</button>
          <div className="tb-divider" />
          <div className="admin-chip">
            <div className="admin-av">관</div>
            <div><div className="admin-nm">관리자</div><div className="admin-rl">SUPER ADMIN</div></div>
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      <nav id="sb">
        {NAV.map(g => (
          <div key={g.group} className="nav-grp">
            <div className="nav-grp-lbl">{g.group}</div>
            {g.items.map((item: any) => (
              <button key={item.id} className={`nav-btn${tab === item.id ? ' active' : ''}`} onClick={() => setTab(item.id as Tab)}>
                <span className="nav-ico">{item.ico}</span>{item.label}
                {item.badge > 0 && <span className={`nav-badge ${item.bc}`}>{item.badge}</span>}
              </button>
            ))}
          </div>
        ))}
        <button className="nav-btn" style={{color:'var(--red)',marginTop:'4px'}} onClick={() => toast('로그아웃 처리되었습니다.')}>
          <span className="nav-ico">→</span>로그아웃
        </button>
        <div className="sb-foot">
          <div className="sbf-row"><div className="sbf-dot dot-ok" />데이터베이스 정상</div>
          <div className="sbf-row"><div className="sbf-dot dot-ok" />Storage 정상</div>
          <div className="sbf-row"><div className="sbf-dot dot-warn" />업타임: {uptime}</div>
          <div style={{marginTop:'8px',color:'var(--t3)'}}>BUILD 2025.02.23</div>
        </div>
      </nav>

      {/* MAIN */}
      <main id="main">

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div className="tab-content">
            <div className="ph">
              <div>
                <div className="ph-eyebrow">Overview</div>
                <div className="ph-title">대시보드</div>
                <div className="ph-sub">{dashDate}</div>
              </div>
              <div className="ph-actions">
                <button className="btn btn-g sm" onClick={() => toast('새로고침 완료')}>↻ 새로고침</button>
                <button className="btn btn-t sm" onClick={() => toast('PDF 리포트 생성 중...','ok')}>📊 리포트 생성</button>
              </div>
            </div>
            <div className="kpi-grid mb20">
              <div className="kpi c-t"><div className="kpi-bar" /><div className="kpi-lbl">전체 이슈</div><div className="kpi-num">248</div><div className="kpi-sub">▲ 12건 이번 주</div><div className="kpi-ico">📋</div></div>
              <div className="kpi c-a"><div className="kpi-bar" /><div className="kpi-lbl">승인 대기</div><div className="kpi-num">{pendingList.length}</div><div className="kpi-sub">검토 필요</div><div className="kpi-ico">⏳</div></div>
              <div className="kpi c-r"><div className="kpi-bar" /><div className="kpi-lbl">미처리 신고</div><div className="kpi-num">{reportList.length}</div><div className="kpi-sub">▲ 1건 신규</div><div className="kpi-ico">⚑</div></div>
              <div className="kpi c-b"><div className="kpi-bar" /><div className="kpi-lbl">총 추천 수</div><div className="kpi-num">18.4k</div><div className="kpi-sub">▲ 342 오늘</div><div className="kpi-ico">👍</div></div>
            </div>
            <div className="g-main">
              <div className="panel">
                <div className="panel-head"><span className="panel-title">이슈 상태별 현황</span><span style={{fontFamily:'var(--f-mono)',fontSize:'9px',color:'var(--t2)'}}>REALTIME</span></div>
                <div className="panel-body">
                  <div className="barchart mb20">
                    {barData.map(b => (
                      <div key={b.label} className="brow">
                        <div className="blbl">{b.label}</div>
                        <div className="btrack"><div className="bfill" style={{background:b.color,width:`${b.pct}%`}} /></div>
                        <div className="bval">{b.val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{borderTop:'1px solid var(--bdr2)',paddingTop:'16px'}}>
                    <div style={{fontFamily:'var(--f-mono)',fontSize:'9px',letterSpacing:'1.5px',color:'var(--t2)',textTransform:'uppercase',marginBottom:'12px'}}>분야별 TOP 5</div>
                    <div className="barchart">
                      {fieldData.map(b => (
                        <div key={b.label} className="brow">
                          <div className="blbl">{b.label}</div>
                          <div className="btrack"><div className="bfill" style={{background:b.color,width:`${b.pct}%`}} /></div>
                          <div className="bval">{b.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="g-col">
                <div className="panel">
                  <div className="panel-head"><span className="panel-title">주간 추천 TOP 5</span></div>
                  <div>
                    {[{n:'1',cls:'r1',t:'동일 경범죄 지역별 처벌 10배 차이',c:'2,341'},{n:'2',cls:'r2',t:'소규모 자영업자 세무조사 형평성',c:'1,892'},{n:'3',cls:'r3',t:'건축물 용도변경 대기업 vs 영세업소',c:'1,547'},{n:'4',cls:'',t:'영업허가 서류 관청 내부 분실',c:'1,203'},{n:'5',cls:'',t:'노동감독관 체불임금 4개월 미착수',c:'983'}].map(r => (
                      <div key={r.n} className="rank-row">
                        <div className={`rank-n${r.cls?' '+r.cls:''}`}>{r.n}</div>
                        <div className="rank-t">{r.t}</div>
                        <div className="rank-c">{r.c}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="panel" style={{flex:1}}>
                  <div className="panel-head"><span className="panel-title">최근 활동 로그</span></div>
                  <div className="panel-body" style={{padding:'0 18px'}}>
                    <div className="feed-item"><div className="fdot fd-t" /><div className="ftxt"><strong>이슈 #248</strong> 신규 접수 — 교통단속 사각지대</div><div className="ftime">방금</div></div>
                    <div className="feed-item"><div className="fdot fd-a" /><div className="ftxt"><strong>첨부파일 4건</strong> 승인 대기 중</div><div className="ftime">12분</div></div>
                    <div className="feed-item"><div className="fdot fd-b" /><div className="ftxt">이슈 #241 → <strong>공론화진행</strong> 전환</div><div className="ftime">1시간</div></div>
                    <div className="feed-item"><div className="fdot fd-r" /><div className="ftxt"><strong>신고</strong> — #237 개인정보 침해 의심</div><div className="ftime">2시간</div></div>
                    <div className="feed-item"><div className="fdot fd-g" /><div className="ftxt">이슈 #239 <strong>승인·공개</strong> 완료</div><div className="ftime">3시간</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PENDING */}
        {tab === 'pending' && (
          <div className="tab-content">
            <div className="ph">
              <div><div className="ph-eyebrow">Issue Management</div><div className="ph-title">승인 대기</div><div className="ph-sub">관리자 검토 후 공개됩니다. {pendingList.length}건 대기 중.</div></div>
              <div className="ph-actions"><button className="btn btn-g sm" onClick={() => toast('일괄 처리 기능 준비 중','warn')}>일괄 처리</button></div>
            </div>
            <div className="panel">
              <table className="tbl">
                <thead><tr><th>#</th><th>제목 / 요약</th><th>유형</th><th>분야</th><th>지역</th><th>제출일</th><th>액션</th></tr></thead>
                <tbody>
                  {pendingList.map(p => (
                    <tr key={p.id} onClick={() => setDetailIssue(p)}>
                      <td className="tm">#{p.id}</td>
                      <td><div className="tt">{p.title}</div><div className="ts">{p.summary}</div></td>
                      <td><span className="tag">{p.type}</span></td>
                      <td><span className="tag">{p.field}</span></td>
                      <td className="tm">{p.region}</td>
                      <td className="tm">{p.date}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                          <button className="btn btn-t sm" onClick={() => approveIssue(p.id)}>✓ 승인</button>
                          <button className="btn btn-g sm" onClick={() => { setStatusIssue({id:p.id,title:p.title,status:'접수됨'}); setSelSt('') }}>상태</button>
                          <button className="btn btn-r sm" onClick={() => { setRejectIssue({id:p.id,title:p.title}); setRejectReason('') }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ALL ISSUES */}
        {tab === 'all' && (
          <div className="tab-content">
            <div className="ph"><div><div className="ph-eyebrow">Issue Management</div><div className="ph-title">전체 이슈</div><div className="ph-sub">총 248건 등록됨</div></div></div>
            <div style={{display:'flex',gap:'8px',marginBottom:'14px',flexWrap:'wrap'}}>
              <input className="finput" style={{maxWidth:'240px',flex:1}} placeholder="제목 검색..." />
              <select className="fselect" style={{width:'auto'}}><option>전체 상태</option><option>접수됨</option><option>검증중</option><option>공론화진행</option><option>기관전달</option><option>종결</option></select>
              <select className="fselect" style={{width:'auto'}}><option>전체 분야</option><option>형사</option><option>세무</option><option>건축</option><option>노동</option><option>교통</option></select>
            </div>
            <div className="panel">
              <table className="tbl">
                <thead><tr><th>#</th><th>제목</th><th>상태</th><th>분야</th><th>지역</th><th>추천</th><th>공개</th><th>액션</th></tr></thead>
                <tbody>
                  {ALL_ISSUES.map(i => (
                    <tr key={i.id}>
                      <td className="tm" style={{color:'var(--t2)'}}>#{i.id}</td>
                      <td><div className="tt">{i.title}</div></td>
                      <td><span className={`badge b-${i.status}`}>{i.status}</span></td>
                      <td><span className="tag">{i.field}</span></td>
                      <td className="tm">{i.region}</td>
                      <td className="tm" style={{color:'var(--teal)'}}>{i.support.toLocaleString()}</td>
                      <td><span style={{fontFamily:'var(--f-mono)',fontSize:'10px',color:i.pub?'var(--green)':'var(--red)'}}>{i.pub?'● 공개':'○ 비공개'}</span></td>
                      <td onClick={e => e.stopPropagation()}>
                        <button className="btn btn-g sm" onClick={() => { setStatusIssue({id:i.id,title:i.title,status:i.status}); setSelSt('') }}>상태변경</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STATUS MGMT */}
        {tab === 'statusmgmt' && (
          <div className="tab-content">
            <div className="ph"><div><div className="ph-eyebrow">Issue Management</div><div className="ph-title">상태 관리</div><div className="ph-sub">이슈 진행 상태를 변경합니다.</div></div></div>
            <div className="g2">
              <div className="panel">
                <div className="panel-head"><span className="panel-title">공론화 진행 중</span></div>
                <table className="tbl"><thead><tr><th>제목</th><th>추천</th><th>변경</th></tr></thead><tbody>
                  {[{id:1,title:'동일 경범죄 위반 지역별 처벌 10배 차이',support:'2,341'},{id:6,title:'영업허가 갱신 서류 분실 후 허가 취소',support:'1,203'}].map(r=>(
                    <tr key={r.id} onClick={() => { setStatusIssue({id:r.id,title:r.title,status:'공론화진행'}); setSelSt('') }}>
                      <td><div className="tt">{r.title}</div></td>
                      <td className="tm" style={{color:'var(--teal)'}}>{r.support}</td>
                      <td><button className="btn btn-g sm" onClick={e=>{e.stopPropagation();setStatusIssue({id:r.id,title:r.title,status:'공론화진행'});setSelSt('')}}>변경</button></td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="panel">
                <div className="panel-head"><span className="panel-title">기관 전달</span></div>
                <table className="tbl"><thead><tr><th>제목</th><th>추천</th><th>변경</th></tr></thead><tbody>
                  <tr onClick={() => { setStatusIssue({id:3,title:'건축물 용도변경 대기업 vs 영세업소 차별',status:'기관전달'}); setSelSt('') }}>
                    <td><div className="tt">건축물 용도변경 대기업 vs 영세업소 차별</div></td>
                    <td className="tm" style={{color:'var(--red)'}}>1,547</td>
                    <td><button className="btn btn-g sm" onClick={e=>{e.stopPropagation();setStatusIssue({id:3,title:'건축물 용도변경',status:'기관전달'});setSelSt('')}}>변경</button></td>
                  </tr>
                </tbody></table>
              </div>
            </div>
          </div>
        )}

        {/* FILES */}
        {tab === 'files' && (
          <div className="tab-content">
            <div className="ph"><div><div className="ph-eyebrow">Content</div><div className="ph-title">첨부파일 검토</div><div className="ph-sub">개인정보 가림 처리 여부 확인 후 승인하세요.</div></div></div>
            <div className="panel">
              <table className="tbl">
                <thead><tr><th>파일명</th><th>유형</th><th>연결 이슈</th><th>제출일</th><th>크기</th><th>액션</th></tr></thead>
                <tbody>
                  {fileList.map(f => (
                    <tr key={f.id}>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                          <div style={{width:'30px',height:'36px',background:'var(--bg3)',border:'1px solid var(--bdr2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',flexShrink:0}}>{f.type==='처분서'?'📄':'📋'}</div>
                          <span style={{fontFamily:'var(--f-mono)',fontSize:'11px',color:'var(--t0)'}}>{f.name}</span>
                        </div>
                      </td>
                      <td><span className="tag">{f.type}</span></td>
                      <td className="tm" style={{color:'var(--blue)'}}>{f.issue}</td>
                      <td className="tm">{f.date}</td>
                      <td className="tm" style={{color:'var(--t2)'}}>{f.size}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{display:'flex',gap:'4px'}}>
                          <button className="btn btn-g sm" onClick={() => toast('파일 미리보기 — 준비 중')}>보기</button>
                          <button className="btn btn-t sm" onClick={() => approveFile(f.id)}>✓ 승인</button>
                          <button className="btn btn-r sm" onClick={() => rejectFile(f.id)}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COMMENTS */}
        {tab === 'comments' && (
          <div className="tab-content">
            <div className="ph"><div><div className="ph-eyebrow">Content</div><div className="ph-title">댓글 관리</div><div className="ph-sub">최근 댓글 및 신고 댓글을 검토합니다.</div></div></div>
            <div className="panel">
              <table className="tbl">
                <thead><tr><th>유형</th><th>내용</th><th>작성자</th><th>이슈</th><th>시간</th><th>액션</th></tr></thead>
                <tbody>
                  {commentList.map((c, i) => {
                    const typeColor: Record<string,string> = {'사실보완':'var(--teal)','법률의견':'var(--blue)','일반':'var(--t1)'}
                    return (
                      <tr key={i} style={c.flagged?{background:'rgba(224,72,72,.04)'}:{}}>
                        <td><span style={{fontFamily:'var(--f-mono)',fontSize:'10px',color:typeColor[c.type]||'var(--t1)'}}>{c.type}</span></td>
                        <td style={{maxWidth:'270px'}}><div style={{fontSize:'11px',color:'var(--t0)',lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{c.content}</div></td>
                        <td className="tm" style={{color:'var(--t2)'}}>{c.author}</td>
                        <td className="tm" style={{color:'var(--blue)'}}>{c.issue}</td>
                        <td className="tm">{c.time}</td>
                        <td onClick={e => e.stopPropagation()}>
                          {c.flagged
                            ? <button className="btn btn-r sm" disabled={hiddenComments.includes(i)} onClick={() => hideComment(i)}>{hiddenComments.includes(i)?'숨김완료':'숨김'}</button>
                            : <button className="btn btn-g sm">유지</button>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORTS */}
        {tab === 'reports' && (
          <div className="tab-content">
            <div className="ph"><div><div className="ph-eyebrow">Content</div><div className="ph-title">신고 처리</div><div className="ph-sub">{reportList.length}건 처리 대기 중</div></div></div>
            <div>
              {reportList.map(r => (
                <div key={r.id} className="rc">
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'12px'}}>
                    <div style={{flex:1}}>
                      <span className="rc-type">{r.type}</span>
                      <div className="rc-title">{r.title}</div>
                      <div className="rc-reason">{r.reason}</div>
                      <div className="rc-foot"><div className="rc-meta">신고자: {r.reporter} · {r.time}</div></div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:'6px',flexShrink:0,marginTop:'4px'}}>
                      <button className="btn btn-g sm" onClick={() => toast('이슈 페이지로 이동합니다.')}>이슈 확인</button>
                      <button className="btn btn-r sm" onClick={() => resolveReport(r.id,'처리')}>처리 완료</button>
                      <button className="btn btn-g sm" onClick={() => resolveReport(r.id,'기각')}>기각</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {tab === 'analytics' && (
          <div className="tab-content">
            <div className="ph">
              <div><div className="ph-eyebrow">Analytics</div><div className="ph-title">통계·분석</div><div className="ph-sub">2024년 9월 서비스 시작 이후</div></div>
              <div className="ph-actions"><button className="btn btn-t sm" onClick={() => toast('엑셀 내보내기 준비 중','ok')}>📥 내보내기</button></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'20px'}}>
              {[{n:'12',c:'var(--green)',l:'개선 사례'},{n:'9',c:'var(--teal)',l:'기관 전달'},{n:'4.2일',c:'var(--amber)',l:'평균 검토 기간'},{n:'96%',c:'var(--blue)',l:'이슈 승인율'}].map(s=>(
                <div key={s.l} className="stat-box"><div className="stat-num2" style={{color:s.c}}>{s.n}</div><div className="stat-lbl">{s.l}</div></div>
              ))}
            </div>
            <div className="g2 mb16">
              <div className="panel">
                <div className="panel-head"><span className="panel-title">월별 이슈 등록 추이</span></div>
                <div className="panel-body">
                  <div style={{fontFamily:'var(--f-mono)',fontSize:'9px',color:'var(--t2)',marginBottom:'12px'}}>단위: 건 / ■ = 4건</div>
                  <div style={{fontFamily:'var(--f-mono)',fontSize:'12px',lineHeight:2.8,color:'var(--teal)'}}>
                    {[['9월','████████','32'],['10월','████████████','48'],['11월','██████████████████','71'],['12월','████████████████████████','97']].map(([m,b,n])=>(
                      <div key={m} style={{display:'flex',gap:'10px',alignItems:'center'}}>
                        <span style={{color:'var(--t2)',width:'32px',fontSize:'10px'}}>{m}</span>
                        <span style={{letterSpacing:'-1px'}}>{b}</span>
                        <span style={{color:'var(--t2)',fontSize:'10px',marginLeft:'4px'}}>{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="panel">
                <div className="panel-head"><span className="panel-title">지역별 분포</span></div>
                <div className="panel-body">
                  <div className="barchart">
                    {[{l:'서울',v:78,p:100},{l:'경기',v:52,p:67},{l:'부산',v:28,p:36},{l:'인천',v:21,p:27},{l:'기타',v:69,p:89}].map(b=>(
                      <div key={b.l} className="brow"><div className="blbl">{b.l}</div><div className="btrack"><div className="bfill" style={{background:'var(--teal)',width:`${b.p}%`}} /></div><div className="bval">{b.v}</div></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="g2">
              <div className="panel">
                <div className="panel-head"><span className="panel-title">법집행 유형별</span></div>
                <div className="panel-body">
                  <div className="barchart">
                    {[{l:'형평성',v:65,p:100},{l:'과잉단속',v:48,p:74},{l:'선별집행',v:42,p:65},{l:'절차위반',v:35,p:54},{l:'권한남용',v:22,p:34}].map(b=>(
                      <div key={b.l} className="brow"><div className="blbl">{b.l}</div><div className="btrack"><div className="bfill" style={{background:'var(--amber)',width:`${b.p}%`}} /></div><div className="bval">{b.v}</div></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="panel">
                <div className="panel-head"><span className="panel-title">관련 기관별</span></div>
                <div className="panel-body">
                  <div className="barchart">
                    {[{l:'경찰',v:88,p:100},{l:'지자체',v:62,p:70},{l:'국세청',v:40,p:45},{l:'검찰',v:28,p:32},{l:'기타',v:30,p:34}].map(b=>(
                      <div key={b.l} className="brow"><div className="blbl">{b.l}</div><div className="btrack"><div className="bfill" style={{background:'var(--blue)',width:`${b.p}%`}} /></div><div className="bval">{b.v}</div></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div className="tab-content">
            <div className="ph">
              <div><div className="ph-eyebrow">System</div><div className="ph-title">시스템 설정</div><div className="ph-sub">플랫폼 운영 설정을 관리합니다.</div></div>
              <div className="ph-actions"><button className="btn btn-t sm" onClick={() => toast('설정이 저장되었습니다.','ok')}>💾 저장</button></div>
            </div>
            <div className="g2">
              <div>
                <div className="panel mb16">
                  <div className="panel-head"><span className="panel-title">공개 설정</span></div>
                  <div className="panel-body">
                    {([['accept','신규 이슈 접수','새 이슈 제보 허용 여부'],['comment','댓글 허용','이슈별 댓글 작성 가능 여부'],['guest','비회원 열람','로그인 없이 이슈 조회 허용'],['mask','자동 마스킹','이름·주민번호 자동 가림 처리']] as const).map(([k,h,p])=>(
                      <div key={k} className="tog-row">
                        <div className="tog-info"><h4>{h}</h4><p>{p}</p></div>
                        <button className={`toggle${toggles[k]?' on':''}`} onClick={()=>setToggles(t=>({...t,[k]:!t[k]}))} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-head"><span className="panel-title">알림 설정</span></div>
                  <div className="panel-body">
                    <div className="fg"><label className="flbl">관리자 이메일</label><input className="finput" type="email" defaultValue="admin@sinmungo.kr" /></div>
                    <div className="fg"><label className="flbl">알림 임계값 (추천 수)</label><input className="finput" type="number" defaultValue={500} placeholder="이 수치 이상 시 알림" /></div>
                  </div>
                </div>
              </div>
              <div className="panel">
                <div className="panel-head"><span className="panel-title">시스템 정보</span></div>
                <div className="panel-body">
                  {[['플랫폼 버전','v1.0.0-beta','var(--teal)'],['Next.js','16.x','var(--t0)'],['Supabase','2.99.0','var(--t0)'],['DB 상태','● 정상','var(--green)'],['Storage','● 정상 (128MB / 10GB)','var(--green)'],['마지막 백업','2025-02-20 03:00','var(--t0)']].map(([l,v,c])=>(
                    <div key={l as string} className="info-row"><span>{l}</span><span style={{color:c as string}}>{v}</span></div>
                  ))}
                  <div className="info-row"><span>업타임</span><span>{uptime}</span></div>
                  <div style={{display:'flex',gap:'8px',marginTop:'16px'}}>
                    <button className="btn btn-t sm" style={{flex:1}} onClick={() => toast('수동 백업 시작','ok')}>🔒 수동 백업</button>
                    <button className="btn btn-r sm" style={{flex:1}} onClick={() => toast('캐시 초기화 완료')}>🗑 캐시 초기화</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: 이슈 상세 */}
      <div className={`overlay${detailIssue?' open':''}`} onClick={e=>{if(e.target===e.currentTarget)setDetailIssue(null)}}>
        {detailIssue && (
          <div className="modal modal-lg">
            <div className="modal-head"><span className="modal-ttl">이슈 상세 검토</span><button className="modal-x" onClick={()=>setDetailIssue(null)}>✕</button></div>
            <div className="modal-body">
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'14px'}}>
                <span className="badge b-접수됨">접수됨</span>
                <span className="tag">{detailIssue.type}</span>
                <span className="tag">{detailIssue.field}</span>
                <span className="tag">{detailIssue.region}</span>
                <span style={{fontFamily:'var(--f-mono)',fontSize:'10px',color:'var(--t2)'}}>{detailIssue.date}</span>
              </div>
              <div style={{fontSize:'16px',fontWeight:700,color:'var(--t0)',marginBottom:'20px',lineHeight:1.4}}>{detailIssue.title}</div>
              <div className="ds"><div className="ds-lbl">사건 개요</div><div className="ds-txt">{detailIssue.overview}</div></div>
              <div className="ds"><div className="ds-lbl">문제가 된 법집행</div><div className="ds-txt">{detailIssue.problem}</div></div>
              <div className="ds"><div className="ds-lbl">상식적 문제점</div><div className="ds-txt">{detailIssue.sense}</div></div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-r sm" onClick={()=>{const p=pendingList.find(x=>x.id===detailIssue.id);setDetailIssue(null);if(p){setRejectIssue({id:p.id,title:p.title});setRejectReason('')}}}>✕ 거절</button>
              <button className="btn btn-g sm" onClick={()=>{setDetailIssue(null);setStatusIssue({id:detailIssue.id,title:detailIssue.title,status:'접수됨'});setSelSt('')}}>상태 변경</button>
              <button className="btn btn-t sm" onClick={()=>{approveIssue(detailIssue.id);setDetailIssue(null)}}>✓ 승인 공개</button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: 상태 변경 */}
      <div className={`overlay${statusIssue?' open':''}`} onClick={e=>{if(e.target===e.currentTarget)setStatusIssue(null)}}>
        {statusIssue && (
          <div className="modal">
            <div className="modal-head"><span className="modal-ttl">이슈 상태 변경</span><button className="modal-x" onClick={()=>setStatusIssue(null)}>✕</button></div>
            <div className="modal-body">
              <div style={{background:'var(--bg2)',border:'1px solid var(--bdr2)',padding:'10px 14px',fontFamily:'var(--f-mono)',fontSize:'11px',color:'var(--t1)',marginBottom:'18px'}}>#{statusIssue.id} — {statusIssue.title}</div>
              <div className="fg">
                <label className="flbl">새 상태 선택 *</label>
                <div className="sopt-grid">
                  {['접수됨','검증중','공론화진행','기관전달'].map(s=>(
                    <div key={s} className={`sopt${selSt===s?' sel':''}`} onClick={()=>setSelSt(s)}>
                      {s==='접수됨'?'🟡':s==='검증중'?'🔵':s==='공론화진행'?'🟢':'🔷'} {s}
                    </div>
                  ))}
                  <div className={`sopt${selSt==='종결'?' sel':''}`} style={{gridColumn:'span 2'}} onClick={()=>setSelSt('종결')}>⚫ 종결</div>
                </div>
              </div>
              <div className="fg">
                <label className="flbl">관리자 메모</label>
                <textarea className="ftextarea" value={statusNote} onChange={e=>setStatusNote(e.target.value)} placeholder="변경 사유나 참고사항을 입력하세요." />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-g sm" onClick={()=>setStatusIssue(null)}>취소</button>
              <button className="btn btn-t sm" onClick={submitStatus}>변경 확인</button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: 거절 */}
      <div className={`overlay${rejectIssue?' open':''}`} onClick={e=>{if(e.target===e.currentTarget)setRejectIssue(null)}}>
        {rejectIssue && (
          <div className="modal">
            <div className="modal-head"><span className="modal-ttl" style={{color:'var(--red)'}}>이슈 게시 거절</span><button className="modal-x" onClick={()=>setRejectIssue(null)}>✕</button></div>
            <div className="modal-body">
              <div style={{background:'var(--redD)',border:'1px solid rgba(224,72,72,.3)',padding:'10px 14px',fontFamily:'var(--f-mono)',fontSize:'11px',color:'var(--red)',marginBottom:'16px'}}>
                ⚠ 거절된 이슈는 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
              </div>
              <div className="fg">
                <label className="flbl">거절 사유 * (내부 기록용)</label>
                <textarea className="ftextarea" value={rejectReason} onChange={e=>setRejectReason(e.target.value)} placeholder="허위사실, 개인정보 포함, 규정 위반 등 구체적인 사유를 입력하세요." />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-g sm" onClick={()=>setRejectIssue(null)}>취소</button>
              <button className="btn btn-r sm" onClick={confirmReject}>거절 확정</button>
            </div>
          </div>
        )}
      </div>

      {/* TOASTS */}
      <div id="toasts">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item${t.type?' '+t.type:''}`}>
            <span style={{color:toastColors[t.type]||'var(--teal)',fontFamily:'var(--f-mono)',fontWeight:700,fontSize:'13px'}}>{toastIcons[t.type]||'●'}</span>
            {t.msg}
          </div>
        ))}
      </div>
    </>
  )
}
