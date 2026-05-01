'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

/* PawaPay — appels via les routes Next.js /api/pawapay/* */
const PAWAPAY_DEPOSIT_URL = '/api/pawapay/deposit';
const PAWAPAY_STATUS_URL  = (id) => `/api/pawapay/status/${id}`;
const POLL_INTERVAL_MS    = 3000;   // vérification toutes les 3 s
const POLL_MAX_ATTEMPTS   = 40;     // 40 × 3 s = 2 min max

const PLANS = {
  gratuit:  { nom:'Débutant', limite:10,  prix:0,    icon:'🌱', badge:'🎁 Gratuit',       variant:'free',     ctaLabel:'Plan actuel', disabled:true },
  starter:  { nom:'Starter',  limite:80,  prix:1000, icon:'⚡', badge:'🚀 Populaire',      variant:'starter',  ctaLabel:'Choisir ce plan →' },
  business: { nom:'Business', limite:150, prix:1500, icon:'🏆', badge:'⭐ Recommandé',     variant:'business', ctaLabel:'Choisir ce plan →', recommended:true },
  premium:  { nom:'Premium',  limite:250, prix:2500, icon:'👑', badge:'💎 Premium',        variant:'premium',  ctaLabel:'Choisir ce plan →' },
};

const PLAN_ORDER = ['gratuit','starter','business','premium'];

const FEATURES = {
  gratuit:  [
    { ok:true,  text:'10 produits max' },
    { ok:true,  text:'Gestion basique' },
    { ok:true,  text:'Support communauté' },
    { ok:false, text:'Statistiques' },
    { ok:false, text:'Support prioritaire' },
  ],
  starter:  [
    { ok:true, text:'80 produits max' },
    { ok:true, text:'Gestion avancée' },
    { ok:true, text:'Statistiques détaillées' },
    { ok:true, text:'Support prioritaire' },
    { ok:true, text:'Export de données' },
  ],
  business: [
    { ok:true, text:'150 produits max' },
    { ok:true, text:'Tout du Starter' },
    { ok:true, text:'Analyses avancées' },
    { ok:true, text:'Support 24/7' },
    { ok:true, text:'Codes promo' },
  ],
  premium: [
    { ok:true, text:'250 produits max' },
    { ok:true, text:'Tout du Business' },
    { ok:true, text:'Multi-boutiques' },
    { ok:true, text:'API & Intégrations' },
    { ok:true, text:'Manager dédié' },
  ],
};

/* ══════════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════════ */
const PAGE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --bg:       #07071A;
    --bg2:      #0E0E2C;
    --surface:  rgba(255,255,255,0.05);
    --border:   rgba(255,255,255,0.10);
    --violet:   #7C3AED;
    --violet-l: #A78BFA;
    --gold:     #F59E0B;
    --cyan:     #06B6D4;
    --green:    #10B981;
    --red:      #EF4444;
    --text:     #F0EEF9;
    --muted:    rgba(240,238,249,0.50);
    --glow-v:   0 0 40px rgba(124,58,237,0.45);
    --glow-g:   0 0 40px rgba(245,158,11,0.40);
    --r:        20px;
    --r2:       28px;
    --t:        0.35s;
    --ease:     cubic-bezier(.25,.8,.25,1);
  }

  @keyframes abo-flyIn    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
  @keyframes abo-blink    { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes abo-spin     { to{transform:rotate(360deg)} }
  @keyframes abo-slideR   { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
  @keyframes abo-shimmer  { to{left:100%} }
  @keyframes abo-scaleUp  { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} }
  @keyframes abo-slideUp  { from{transform:translateY(60px)} to{transform:translateY(0)} }

  /* ── Page wrapper ── */
  .abo-page {
    font-family:'DM Sans',sans-serif;
    background:var(--bg);
    color:var(--text);
    min-height:100vh;
    overflow-x:hidden;
    line-height:1.6;
    position:relative;
  }

  /* ── Background particles canvas ── */
  #abo-bgCanvas { position:fixed; inset:0; z-index:0; pointer-events:none; }

  /* ── Main ── */
  .abo-main {
    position:relative; z-index:1;
    padding:32px 16px 80px;
    max-width:900px; margin:0 auto;
  }

  /* ── Hero ── */
  .abo-hero { text-align:center; margin-bottom:40px; animation:abo-flyIn .8s var(--ease) both; }
  .abo-hero-pill {
    display:inline-flex; align-items:center; gap:8px;
    padding:6px 16px; border-radius:50px;
    background:rgba(124,58,237,0.15); border:1px solid rgba(124,58,237,0.35);
    font-size:.8rem; font-weight:600; color:var(--violet-l);
    margin-bottom:20px; letter-spacing:.5px;
  }
  .abo-hero-dot {
    width:7px; height:7px; border-radius:50%;
    background:var(--violet-l); animation:abo-blink 1.4s infinite;
  }
  .abo-hero-title {
    font-family:'Syne',sans-serif;
    font-size:clamp(2rem,8vw,3.2rem); font-weight:800; line-height:1.15; margin-bottom:14px;
  }
  .abo-hero-grd {
    background:linear-gradient(120deg,#fff 10%,var(--violet-l) 45%,var(--cyan));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  }
  .abo-hero-sub { color:var(--muted); font-size:1rem; max-width:360px; margin:0 auto; }

  /* ── Status banner ── */
  .abo-status {
    margin-bottom:32px; padding:16px 20px; border-radius:var(--r);
    background:var(--surface); border:1px solid var(--border);
    display:flex; align-items:center; gap:14px;
    animation:abo-flyIn .9s var(--ease) .1s both;
    backdrop-filter:blur(10px);
  }
  .abo-status-orb {
    width:48px; height:48px; border-radius:14px;
    background:linear-gradient(135deg,var(--violet),var(--cyan));
    display:flex; align-items:center; justify-content:center;
    font-size:22px; flex-shrink:0; box-shadow:var(--glow-v);
  }
  .abo-status-label { font-size:.8rem; color:var(--muted); font-weight:500; }
  .abo-status-val   { font-size:1rem; font-weight:600; color:var(--text); }

  /* ── Plans scroll ── */
  .abo-plans-wrap { margin-bottom:48px; animation:abo-flyIn 1s var(--ease) .2s both; }
  .abo-plans-scroll {
    display:flex; gap:16px; overflow-x:auto;
    padding:8px 4px 20px; scroll-snap-type:x mandatory;
    -webkit-overflow-scrolling:touch; scrollbar-width:none;
  }
  .abo-plans-scroll::-webkit-scrollbar { display:none; }
  @media(min-width:768px){
    .abo-plans-scroll { display:grid; grid-template-columns:repeat(4,1fr); overflow:visible; }
  }

  /* ── Plan card ── */
  .abo-card {
    flex:0 0 88vw; max-width:340px; scroll-snap-align:center;
    border-radius:var(--r2); padding:28px 22px 24px;
    position:relative; overflow:hidden; cursor:pointer;
    border:1.5px solid var(--border); background:var(--surface);
    backdrop-filter:blur(16px);
    transition:transform var(--t) var(--ease), box-shadow var(--t) var(--ease), border-color var(--t);
    -webkit-tap-highlight-color:transparent;
  }
  @media(min-width:768px){ .abo-card { flex:1; max-width:none; } }

  .abo-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    border-radius:28px 28px 0 0; background:var(--card-grad); opacity:.9;
  }
  .abo-card::after {
    content:''; position:absolute; width:180px; height:180px; border-radius:50%;
    background:var(--card-orb); top:-60px; right:-60px;
    filter:blur(60px); opacity:.25; pointer-events:none; transition:opacity .4s;
  }
  .abo-card:hover::after { opacity:.5; }
  .abo-card:hover   { transform:translateY(-6px); box-shadow:0 20px 50px rgba(0,0,0,.5); }
  .abo-card.abo-active { border-color:rgba(255,255,255,.35); box-shadow:0 0 0 2px rgba(255,255,255,.2),0 20px 50px rgba(0,0,0,.5); }

  .abo-card.free     { --card-grad:linear-gradient(90deg,#10B981,#06B6D4); --card-orb:#10B981; }
  .abo-card.starter  { --card-grad:linear-gradient(90deg,#3B82F6,#7C3AED); --card-orb:#3B82F6; }
  .abo-card.business { --card-grad:linear-gradient(90deg,#F59E0B,#EF4444); --card-orb:#F59E0B;
                       box-shadow:0 0 0 1.5px rgba(245,158,11,0.4),var(--glow-g); }
  .abo-card.premium  { --card-grad:linear-gradient(90deg,#7C3AED,#EC4899); --card-orb:#7C3AED; }

  /* Card content */
  .abo-card-badge {
    display:inline-flex; align-items:center; gap:5px; padding:4px 10px;
    border-radius:30px; font-size:.7rem; font-weight:700;
    letter-spacing:.8px; text-transform:uppercase;
    background:var(--card-grad); color:#fff; margin-bottom:18px;
  }
  .abo-card-icon { font-size:2.4rem; margin-bottom:10px; display:block; }
  .abo-card-name { font-family:'Syne',sans-serif; font-size:1.4rem; font-weight:800; margin-bottom:4px; }
  .abo-card-price { display:flex; align-items:baseline; gap:4px; margin-bottom:6px; }
  .abo-card-amount { font-family:'Syne',sans-serif; font-size:clamp(1.8rem,6vw,2.4rem); font-weight:800; }
  .abo-card-curr  { font-size:.78rem; color:var(--muted); white-space:nowrap; }
  .abo-card-period{ font-size:.8rem; color:var(--muted); margin-bottom:14px; }

  /* Usage bar */
  .abo-bar-wrap { margin-bottom:16px; }
  .abo-bar-label { display:flex; justify-content:space-between; font-size:.75rem; color:var(--muted); margin-bottom:5px; }
  .abo-bar-label .abo-used { color:var(--text); font-weight:700; }
  .abo-bar-track { height:6px; border-radius:4px; background:rgba(255,255,255,.08); overflow:hidden; }
  .abo-bar-fill  { height:100%; border-radius:4px; background:var(--card-grad); transition:width 1s cubic-bezier(.25,.8,.25,1); }

  /* Features */
  .abo-features { list-style:none; margin-bottom:22px; }
  .abo-features li {
    display:flex; align-items:center; gap:9px;
    padding:7px 0; font-size:.88rem; color:rgba(240,238,249,.85);
    border-bottom:1px solid rgba(255,255,255,.06);
  }
  .abo-features li:last-child { border-bottom:none; }
  .abo-fi { font-size:1rem; flex-shrink:0; }
  .abo-no { color:var(--muted); text-decoration:line-through; }

  /* CTA button */
  .abo-cta {
    width:100%; padding:13px; border-radius:14px;
    font-family:'DM Sans',sans-serif; font-size:.95rem; font-weight:700;
    border:none; cursor:pointer;
    background:var(--card-grad); color:#fff;
    transition:opacity var(--t),transform var(--t);
    position:relative; overflow:hidden;
  }
  .abo-cta::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(rgba(255,255,255,.18),transparent);
    opacity:0; transition:opacity .25s;
  }
  .abo-cta:hover::after { opacity:1; }
  .abo-cta:active { transform:scale(.97); }
  .abo-cta.abo-cta-disabled { background:rgba(255,255,255,.10); cursor:default; }
  .abo-cta:disabled { opacity:.6; cursor:not-allowed; }

  /* Dots indicator (mobile) */
  .abo-dots { display:flex; justify-content:center; gap:6px; margin-top:4px; }
  .abo-dot { width:6px; height:6px; border-radius:50%; background:var(--border); transition:all .3s; }
  .abo-dot.abo-dot-active { width:20px; border-radius:4px; background:var(--violet-l); }
  @media(min-width:768px){ .abo-dots { display:none; } }

  /* FAQ */
  .abo-faq { animation:abo-flyIn 1.1s var(--ease) .35s both; }
  .abo-faq-title { font-family:'Syne',sans-serif; font-size:1.5rem; font-weight:800; text-align:center; margin-bottom:20px; }
  .abo-faq-grid { display:grid; gap:12px; }
  @media(min-width:600px){ .abo-faq-grid { grid-template-columns:1fr 1fr; } }
  .abo-faq-item {
    padding:18px; border-radius:var(--r); background:var(--surface);
    border:1px solid var(--border); transition:border-color var(--t); cursor:pointer;
  }
  .abo-faq-item:hover { border-color:rgba(124,58,237,.4); }
  .abo-faq-q { font-weight:600; font-size:.92rem; margin-bottom:8px; }
  .abo-faq-a { font-size:.84rem; color:var(--muted); line-height:1.55; }

  /* ── Modal ── */
  .abo-overlay {
    position:fixed; inset:0; background:rgba(7,7,26,.85);
    backdrop-filter:blur(16px); z-index:500;
    display:flex; align-items:flex-end; justify-content:center;
    opacity:0; pointer-events:none; transition:opacity .4s var(--ease);
  }
  @media(min-width:600px){ .abo-overlay { align-items:center; } }
  .abo-overlay.abo-open { opacity:1; pointer-events:all; }

  .abo-sheet {
    width:100%; max-width:480px; background:var(--bg2);
    border:1px solid var(--border); border-radius:28px 28px 0 0;
    padding:8px 24px 40px;
    transform:translateY(60px); transition:transform .45s var(--ease);
    position:relative; max-height:92vh; overflow-y:auto;
  }
  @media(min-width:600px){ .abo-sheet { border-radius:28px; transform:scale(.93); } }
  .abo-overlay.abo-open .abo-sheet { transform:translateY(0); }
  @media(min-width:600px){ .abo-overlay.abo-open .abo-sheet { transform:scale(1); } }

  .abo-handle { width:40px; height:4px; border-radius:2px; background:var(--border); margin:12px auto 20px; }
  .abo-modal-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:22px; }
  .abo-modal-ttl { font-family:'Syne',sans-serif; font-size:1.3rem; font-weight:800; }
  .abo-modal-x {
    width:36px; height:36px; border-radius:50%; border:1px solid var(--border);
    background:var(--surface); color:var(--text); font-size:18px; cursor:pointer;
    display:flex; align-items:center; justify-content:center; transition:all .25s;
  }
  .abo-modal-x:hover { background:var(--red); border-color:var(--red); }

  /* Steps */
  .abo-steps { display:flex; justify-content:center; gap:6px; margin-bottom:28px; }
  .abo-step { flex:1; max-width:70px; height:4px; border-radius:2px; background:rgba(255,255,255,.12); transition:all .4s; }
  .abo-step.abo-step-active { background:var(--violet-l); }
  .abo-step.abo-step-done   { background:var(--green); }

  /* Summary */
  .abo-summary {
    background:rgba(255,255,255,.04); border:1px solid var(--border);
    border-radius:var(--r); padding:20px; margin-bottom:24px;
  }
  .abo-sum-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid rgba(255,255,255,.07); }
  .abo-sum-row:last-child { border-bottom:none; }
  .abo-sum-row.abo-total { padding-top:16px; margin-top:8px; border-top:1px solid rgba(255,255,255,.15); }
  .abo-sum-lbl { font-size:.85rem; color:var(--muted); }
  .abo-sum-val { font-size:.95rem; font-weight:600; }
  .abo-sum-row.abo-total .abo-sum-lbl { font-weight:700; color:var(--text); font-size:1rem; }
  .abo-sum-row.abo-total .abo-sum-val { font-size:1.3rem; font-weight:800; color:var(--violet-l); }

  /* Trust badges */
  .abo-trust { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:24px; }
  .abo-trust-badge {
    flex:1; min-width:80px; padding:12px 8px; border-radius:14px; text-align:center;
    background:rgba(255,255,255,.04); border:1px solid var(--border);
    font-size:.72rem; color:var(--muted); font-weight:600; line-height:1.4;
  }
  .abo-trust-badge .abo-ti { font-size:1.5rem; display:block; margin-bottom:4px; }

  /* ── Phone input ── */
  .abo-phone-wrap { margin-bottom:20px; }
  .abo-phone-label {
    display:block; font-size:.8rem; font-weight:600;
    color:var(--muted); margin-bottom:8px; letter-spacing:.3px;
  }
  .abo-phone-input {
    width:100%; padding:14px 16px; border-radius:14px; box-sizing:border-box;
    background:rgba(255,255,255,0.06); border:1.5px solid var(--border);
    color:var(--text); font-size:1rem; font-family:'DM Sans',sans-serif;
    outline:none; transition:border-color .25s;
  }
  .abo-phone-input::placeholder { color:rgba(240,238,249,0.3); }
  .abo-phone-input:focus { border-color:rgba(124,58,237,.6); }

  /* Pay button */
  .abo-btn-pay {
    width:100%; padding:16px; border-radius:16px; border:none;
    background:linear-gradient(135deg,var(--violet),var(--cyan));
    color:#fff; font-family:'DM Sans',sans-serif; font-size:1.05rem; font-weight:700;
    cursor:pointer; position:relative; overflow:hidden;
    box-shadow:0 8px 32px rgba(124,58,237,.4); transition:opacity .3s,transform .3s;
  }
  .abo-btn-pay:hover  { opacity:.9; transform:translateY(-2px); }
  .abo-btn-pay:active { transform:scale(.97); }
  .abo-btn-pay:disabled { opacity:.6; cursor:not-allowed; transform:none; }
  .abo-btn-pay::after {
    content:''; position:absolute; top:0; left:-100%; width:50%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);
    animation:abo-shimmer 2s infinite;
  }

  /* Loading overlay */
  .abo-loading {
    position:fixed; inset:0; background:rgba(7,7,26,.92);
    backdrop-filter:blur(20px); z-index:600;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:16px; opacity:0; pointer-events:none; transition:opacity .4s;
  }
  .abo-loading.abo-show { opacity:1; pointer-events:all; }
  .abo-loader-ring {
    width:56px; height:56px; border-radius:50%;
    border:3px solid rgba(255,255,255,.12); border-top-color:var(--violet-l);
    animation:abo-spin .8s linear infinite;
  }
  .abo-loader-txt { font-family:'Syne',sans-serif; font-size:1.1rem; font-weight:700; }
  .abo-loader-sub { font-size:.85rem; color:var(--muted); }

  /* Notifications */
  .abo-notif-area { position:fixed; top:80px; right:16px; z-index:700; display:flex; flex-direction:column; gap:10px; pointer-events:none; }
  .abo-notif {
    padding:12px 18px; border-radius:14px; font-size:.88rem; font-weight:600;
    max-width:320px; animation:abo-slideR .4s var(--ease); pointer-events:all;
    backdrop-filter:blur(16px); border:1px solid var(--border);
  }
  .abo-notif.success { background:rgba(16,185,129,.18); border-color:rgba(16,185,129,.4); color:#6EE7B7; }
  .abo-notif.error   { background:rgba(239,68,68,.18);  border-color:rgba(239,68,68,.4);  color:#FCA5A5; }
  .abo-notif.info    { background:rgba(124,58,237,.18); border-color:rgba(124,58,237,.4); color:var(--violet-l); }
  .abo-notif.warning { background:rgba(245,158,11,.18); border-color:rgba(245,158,11,.4); color:var(--gold); }

  /* Confetti canvas */
  #abo-confettiCanvas { position:fixed; inset:0; z-index:800; pointer-events:none; }
`;

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('abo-style')) return;
  const el = document.createElement('style');
  el.id = 'abo-style';
  el.textContent = PAGE_CSS;
  document.head.appendChild(el);
}

/* ══════════════════════════════════════════════════════════
   PARTICLES BACKGROUND (canvas)
══════════════════════════════════════════════════════════ */
function initParticles(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  window.addEventListener('resize', () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; });

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 1.5 + 0.5,
    dx: (Math.random() - 0.5) * 0.3,
    dy: (Math.random() - 0.5) * 0.3,
    o: Math.random() * 0.4 + 0.1,
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167,139,250,${p.o})`;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   CONFETTI
══════════════════════════════════════════════════════════ */
function lancerConfetti(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  const colors = ['#7C3AED','#F59E0B','#06B6D4','#10B981','#EC4899','#A78BFA'];
  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * W, y: -20,
    w: Math.random() * 10 + 5, h: Math.random() * 6 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.2,
    vy: Math.random() * 4 + 2,
    vx: (Math.random() - 0.5) * 3,
  }));
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      p.x += p.vx; p.y += p.vy; p.angle += p.spin;
    });
    frame++;
    if (frame < 180) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, W, H);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   COMPOSANT NOTIFICATION
══════════════════════════════════════════════════════════ */
function Notif({ notifications }) {
  return (
    <div className="abo-notif-area">
      {notifications.map(n => (
        <div key={n.id} className={`abo-notif ${n.type}`}>{n.msg}</div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════════ */
export default function AbonnementPage() {
  const supabase            = getSupabase();
  const { user, loading: authLoading } = useAuth();
  const router       = useRouter();

  const [abonnement,  setAbonnement]  = useState(null);
  const [nbPublies,   setNbPublies]   = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [payLoading,    setPayLoading]    = useState(false);
  const [showLoading,   setShowLoading]   = useState(false);
  const [pollingActive, setPollingActive] = useState(false);
  const pollRef = useRef(false);

  /* ── NOUVEAU : numéro Mobile Money saisi par l'utilisateur ── */
  const [phoneInput, setPhoneInput] = useState('');

  /* Modal */
  const [modalOpen,   setModalOpen]   = useState(false);
  const [modalPlan,   setModalPlan]   = useState(null);
  const [stepState,   setStepState]   = useState([0,0,0]);

  /* Scroll dots */
  const [activeDot,   setActiveDot]   = useState(0);
  const scrollRef = useRef(null);

  /* Notifications */
  const [notifs, setNotifs] = useState([]);
  const notifId = useRef(0);

  /* Canvas refs */
  const bgRef       = useRef(null);
  const confettiRef = useRef(null);

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    if (bgRef.current) initParticles(bgRef.current);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      loadData();
    } else {
      setLoading(false);
      router.push('/login');
    }
  }, [user, authLoading]);

  /* Scroll dots tracking */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.offsetWidth);
      setActiveDot(idx);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Notification helper ── */
  function showNotif(msg, type = 'info') {
    const id = ++notifId.current;
    setNotifs(p => [...p, { id, msg, type }]);
    setTimeout(() => setNotifs(p => p.filter(n => n.id !== id)), 4200);
  }

  /* ── Charger données ── */
  async function loadData() {
    try {
      const [{ data: abo }, { data: prods }] = await Promise.all([
        supabase.from('abonnements').select('*').eq('user_id', user.id).single(),
        supabase.from('produits').select('id').eq('user_id', user.id).eq('statut', 'published'),
      ]);
      setAbonnement(abo);
      setNbPublies(prods?.length || 0);
    } catch { /* no active subscription is OK */ }
    finally { setLoading(false); }
  }

  /* ── Statut banner text ── */
  function getStatusText() {
    if (loading) return 'Chargement…';
    if (!abonnement || abonnement.statut !== 'actif') return `🟡 Plan Gratuit — ${nbPublies}/10 produits publiés`;
    const plan = PLANS[abonnement.plan];
    const exp  = abonnement.date_expiration ? new Date(abonnement.date_expiration).toLocaleDateString('fr-FR') : '?';
    return `✅ ${plan?.nom || abonnement.plan} — ${nbPublies}/${plan?.limite || '?'} publiés — expire le ${exp}`;
  }

  /* ── Bar width ── */
  function barWidth(limite) {
    return Math.min(100, (nbPublies / limite) * 100) + '%';
  }
  function barColor(limite) {
    const pct = (nbPublies / limite) * 100;
    if (pct >= 100) return 'linear-gradient(90deg,#EF4444,#DC2626)';
    if (pct >= 80)  return 'linear-gradient(90deg,#EF4444,#F59E0B)';
    if (pct >= 60)  return 'linear-gradient(90deg,#F59E0B,#FDE68A)';
    return undefined;
  }

  /* ── Ouvrir modal ── */
  function ouvrirModal(planKey) {
    if (planKey === 'gratuit') { showNotif('🌱 Vous êtes déjà sur le plan Gratuit !', 'info'); return; }
    setModalPlan(planKey);
    setStepState([1, 0, 0]);
    setPhoneInput(''); // reset du champ téléphone à chaque ouverture
    setModalOpen(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
  }

  function fermerModal() {
    setModalOpen(false);
    setTimeout(() => setModalPlan(null), 500);
  }

  /* ── Procéder au paiement via PawaPay ── */
  async function procederPaiement() {
    if (!modalPlan || payLoading || pollingActive) return;

    /* ── Validation du numéro de téléphone ── */
    const phone = phoneInput.trim() || user.phone || user.user_metadata?.phone;
    if (!phone) {
      showNotif('⚠️ Veuillez entrer votre numéro Mobile Money (MTN ou Orange)', 'warning');
      return;
    }
    if (phone.replace(/\D/g, '').length < 9) {
      showNotif('⚠️ Numéro invalide — ex : 237690000000', 'warning');
      return;
    }

    const plan = PLANS[modalPlan];
    setPayLoading(true);
    setStepState([1, 0, 0]);

    try {
      /* ── Étape 1 : générer une référence client ── */
      const clientReferenceId = `ODA-${user.id}-${Date.now()}`;
      setStepState([2, 1, 0]);

      /* ── Étape 2 : initier le dépôt PawaPay ── */
      const response = await fetch(PAWAPAY_DEPOSIT_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount:            plan.prix,
          phone:             phone.replace(/\D/g, ''), // chiffres uniquement
          planNom:           plan.nom,
          planKey:           modalPlan,
          userId:            user.id,
          clientReferenceId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Erreur serveur (${response.status})`);

      const { depositId } = data;
      if (!depositId) throw new Error('depositId absent dans la réponse PawaPay');

      /* ── Étape 3 : sauvegarder localement ── */
      localStorage.setItem('paiement_en_attente', JSON.stringify({
        plan: modalPlan, prix: plan.prix, limite: plan.limite,
        userId: user.id, depositId, clientReferenceId, initiatedAt: Date.now(),
      }));

      setStepState([2, 2, 1]);
      setPayLoading(false);
      setPollingActive(true);
      pollRef.current = true;
      showNotif('📲 Vérifiez votre téléphone et confirmez le paiement Mobile Money…', 'info');

      /* ── Étape 4 : polling jusqu'à confirmation ── */
      await pollDepositStatus(depositId, modalPlan);

    } catch (err) {
      showNotif(`❌ ${err.message}`, 'error');
      setStepState([1, 0, 0]);
      setPayLoading(false);
      setPollingActive(false);
      pollRef.current = false;
    }
  }

  /* ── Polling du statut PawaPay ── */
  async function pollDepositStatus(depositId, planKey) {
    for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
      if (!pollRef.current) return;
      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
      if (!pollRef.current) return;

      try {
        const res  = await fetch(PAWAPAY_STATUS_URL(depositId));
        const data = await res.json();

        if (data.status === 'COMPLETED') {
          setStepState([2, 2, 2]);
          await activerAbonnement(planKey, depositId);
          lancerConfetti(confettiRef.current);
          showNotif('🎉 Paiement confirmé ! Abonnement activé.', 'success');
          localStorage.removeItem('paiement_en_attente');
          fermerModal();
          setPollingActive(false);
          pollRef.current = false;
          setTimeout(() => router.replace('/dashboard/produits'), 3000);
          return;
        }

        if (data.status === 'FAILED' || data.status === 'REFUNDED') {
          throw new Error(`Paiement échoué : ${data.failureReason?.message || 'raison inconnue'}`);
        }
        // INITIATED | PENDING → continuer
      } catch (err) {
        if (err.message.startsWith('Paiement échoué')) {
          showNotif(`❌ ${err.message}`, 'error');
          localStorage.removeItem('paiement_en_attente');
          fermerModal();
          setPollingActive(false);
          pollRef.current = false;
          setStepState([0, 0, 0]);
          return;
        }
        // erreur réseau temporaire → on continue le polling
        console.warn('[Polling] Erreur temporaire:', err.message);
      }
    }

    /* Timeout 2 min */
    showNotif('⏰ Délai dépassé. Si vous avez confirmé, actualisez la page.', 'warning');
    setPollingActive(false);
    pollRef.current = false;
    setStepState([0, 0, 0]);
  }

  /* ── Activer l'abonnement dans Supabase ── */
  async function activerAbonnement(planKey, depositId) {
    const planInfo       = PLANS[planKey];
    const dateDebut      = new Date();
    const dateExpiration = new Date();
    dateExpiration.setMonth(dateExpiration.getMonth() + 1);

    const { error } = await supabase.from('abonnements').upsert({
      user_id:         user.id,
      plan:            planKey,
      limite_produits: planInfo?.limite,
      date_debut:      dateDebut.toISOString(),
      date_expiration: dateExpiration.toISOString(),
      statut:          'actif',
      reference:       depositId,
    }, { onConflict: 'user_id' });

    if (error) throw error;
    await loadData();
    await gererProduitsSelonLimite();
  }

  /* ── Gérer produits selon limite ── */
  async function gererProduitsSelonLimite() {
    try {
      const { data: abo } = await supabase.from('abonnements').select('*').eq('user_id', user.id).single();
      if (!abo) return;
      const { data: prods } = await supabase.from('produits').select('id').eq('user_id', user.id).eq('statut','published').order('created_at', { ascending:false });
      if (!prods) return;
      const surplus = prods.slice(abo.limite_produits);
      if (surplus.length > 0) {
        await supabase.from('produits').update({ statut:'draft', date_draft:new Date().toISOString() }).in('id', surplus.map(p => p.id));
      }
    } catch (e) { console.error(e); }
  }

  /* ── Is current plan ── */
  function isCurrent(planKey) {
    if (!abonnement || abonnement.statut !== 'actif') return planKey === 'gratuit';
    return abonnement.plan === planKey;
  }

  const modalInfo = modalPlan ? PLANS[modalPlan] : null;

  const stepClass = (i) => {
    if (stepState[i] === 2) return 'abo-step abo-step-done';
    if (stepState[i] === 1) return 'abo-step abo-step-active';
    return 'abo-step';
  };

  /* ══ RENDER ══ */
  return (
    <div className="abo-page">
      <canvas ref={bgRef} id="abo-bgCanvas" />
      <canvas ref={confettiRef} id="abo-confettiCanvas" />

      <Notif notifications={notifs} />

      <main className="abo-main">

        {/* ─ Hero ─ */}
        <div className="abo-hero">
          <div className="abo-hero-pill">
            <span className="abo-hero-dot" />
            Plans &amp; Abonnements
          </div>
          <h1 className="abo-hero-title">
            Propulsez<br />
            <span className="abo-hero-grd">votre boutique</span>
          </h1>
          <p className="abo-hero-sub">Choisissez le plan parfait pour développer votre activité</p>
        </div>

        {/* ─ Status banner ─ */}
        <div className="abo-status">
          <div className="abo-status-orb">📊</div>
          <div>
            <div className="abo-status-label">Votre abonnement actuel</div>
            <div className="abo-status-val">{getStatusText()}</div>
          </div>
        </div>

        {/* ─ Plans ─ */}
        <div className="abo-plans-wrap">
          <div className="abo-plans-scroll" ref={scrollRef}>
            {PLAN_ORDER.map(key => {
              const plan      = PLANS[key];
              const feats     = FEATURES[key];
              const isActive  = isCurrent(key);
              const barW      = barWidth(plan.limite);
              const barC      = barColor(plan.limite);

              return (
                <div
                  key={key}
                  className={`abo-card ${plan.variant}${isActive ? ' abo-active' : ''}`}
                  onClick={() => !isActive && ouvrirModal(key)}
                >
                  <div className="abo-card-badge">{plan.badge}</div>
                  <span className="abo-card-icon">{plan.icon}</span>
                  <div className="abo-card-name">{plan.nom}</div>
                  <div className="abo-card-price">
                    <span className="abo-card-amount">{plan.prix.toLocaleString('fr-FR')}</span>
                    <span className="abo-card-curr">FCFA / mois</span>
                  </div>

                  {/* Usage bar */}
                  <div className="abo-bar-wrap">
                    <div className="abo-bar-label">
                      <span>Publiés</span>
                      <span><span className="abo-used">{nbPublies}</span>&nbsp;/&nbsp;{plan.limite}</span>
                    </div>
                    <div className="abo-bar-track">
                      <div
                        className="abo-bar-fill"
                        style={{ width: barW, ...(barC ? { background: barC } : {}) }}
                      />
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="abo-features">
                    {feats.map((f, i) => (
                      <li key={i}>
                        <span className="abo-fi">{f.ok ? '✅' : '❌'}</span>
                        <span className={f.ok ? '' : 'abo-no'}>{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    className={`abo-cta${isActive || key === 'gratuit' ? ' abo-cta-disabled' : ''}`}
                    onClick={e => { e.stopPropagation(); !isActive && ouvrirModal(key); }}
                    disabled={isActive}
                  >
                    {isActive ? '✅ Plan actuel' : plan.ctaLabel}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Scroll dots (mobile) */}
          <div className="abo-dots">
            {PLAN_ORDER.map((_, i) => (
              <div key={i} className={`abo-dot${activeDot === i ? ' abo-dot-active' : ''}`} />
            ))}
          </div>
        </div>

        {/* ─ FAQ ─ */}
        <section className="abo-faq">
          <h2 className="abo-faq-title">Questions fréquentes</h2>
          <div className="abo-faq-grid">
            {[
              { q:'💳 Comment payer ?',         a:'Via PawaPay — Orange Money ou MTN MoMo, 100% sécurisé. Vous recevez une invite de confirmation directement sur votre téléphone.' },
              { q:'🔄 Changer de plan ?',        a:'Oui, à tout moment. Upgrade ou downgrade effectif immédiatement.' },
              { q:'📦 Dépassement de limite ?',  a:'Les produits excédentaires passent en brouillon, restaurés lors d\'un upgrade.' },
              { q:'⏰ Durée ?',                  a:'Mensuel, renouvelable. Annulation libre à tout moment.' },
            ].map((item, i) => (
              <div key={i} className="abo-faq-item">
                <div className="abo-faq-q">{item.q}</div>
                <div className="abo-faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ─ Modal paiement ─ */}
      <div
        className={`abo-overlay${modalOpen ? ' abo-open' : ''}`}
        onClick={e => e.target === e.currentTarget && fermerModal()}
      >
        <div className="abo-sheet">
          <div className="abo-handle" />
          <div className="abo-modal-hdr">
            <span className="abo-modal-ttl">Finaliser</span>
            <button className="abo-modal-x" onClick={fermerModal}>✕</button>
          </div>

          {/* Steps */}
          <div className="abo-steps">
            {[0,1,2].map(i => <div key={i} className={stepClass(i)} />)}
          </div>

          {/* Summary */}
          {modalInfo && (
            <div className="abo-summary">
              {[
                { lbl:'Plan',     val: modalInfo.nom },
                { lbl:'Produits', val: `${modalInfo.limite} produits` },
                { lbl:'Durée',    val: '1 mois' },
              ].map(r => (
                <div key={r.lbl} className="abo-sum-row">
                  <span className="abo-sum-lbl">{r.lbl}</span>
                  <span className="abo-sum-val">{r.val}</span>
                </div>
              ))}
              <div className="abo-sum-row abo-total">
                <span className="abo-sum-lbl">Total</span>
                <span className="abo-sum-val">{modalInfo.prix.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          )}

          {/* Trust badges */}
          <div className="abo-trust">
            {[
              { icon:'🔒', label:'Sécurisé' },
              { icon:'⚡', label:'Activation\nimmédiate' },
              { icon:'🔄', label:'Annulable' },
              { icon:'📱', label:'Mobile Money' },
            ].map(b => (
              <div key={b.label} className="abo-trust-badge">
                <span className="abo-ti">{b.icon}</span>
                {b.label}
              </div>
            ))}
          </div>

          {/* ── Champ numéro Mobile Money (NOUVEAU) ── */}
          {!pollingActive && (
            <div className="abo-phone-wrap">
              <label className="abo-phone-label">📱 Numéro Mobile Money (MTN ou Orange)</label>
              <input
                className="abo-phone-input"
                type="tel"
                inputMode="numeric"
                placeholder="Ex : 237690000000"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                disabled={payLoading}
              />
            </div>
          )}

          {/* Pay button */}
          <button
            className="abo-btn-pay"
            onClick={procederPaiement}
            disabled={payLoading || pollingActive}
          >
            {payLoading    ? '⏳ Initialisation…'
           : pollingActive ? '📲 En attente de confirmation…'
           :                 '💳 Payer maintenant'}
          </button>

          {/* Indicateur polling */}
          {pollingActive && (
            <div style={{textAlign:'center',marginTop:14,fontSize:'.82rem',color:'var(--muted)',lineHeight:1.5}}>
              Confirmez le paiement sur votre téléphone.<br/>
              <span style={{color:'var(--violet-l)',fontWeight:600}}>Cette fenêtre se fermera automatiquement.</span>
              <button
                onClick={() => { pollRef.current = false; setPollingActive(false); setStepState([0,0,0]); fermerModal(); }}
                style={{display:'block',margin:'10px auto 0',background:'none',border:'1px solid var(--border)',
                        color:'var(--muted)',borderRadius:8,padding:'4px 14px',cursor:'pointer',fontSize:'.78rem'}}
              >Annuler</button>
            </div>
          )}
        </div>
      </div>

      {/* ─ Loading overlay ─ */}
      <div className={`abo-loading${showLoading ? ' abo-show' : ''}`}>
        <div className="abo-loader-ring" />
        <div className="abo-loader-txt">Paiement en cours…</div>
        <div className="abo-loader-sub">Confirmation Mobile Money via PawaPay 🔐</div>
      </div>
    </div>
  );
}