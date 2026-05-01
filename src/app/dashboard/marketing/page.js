'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// ─── Config Supabase ─────────────────────────────────────────
const SUPABASE_URL      = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';

// ─── 🔑 Config plateformes publicitaires (Meta, TikTok, YouTube…)
// ─── Pour changer une API plateforme, modifiez UNIQUEMENT platformsConfig.js
import {
  META_APP_ID,
  META_API_VERSION,
  PLATFORM_PRICES,
  COMMISSION_ODA_RATE,
  SMARTBOOST_FEE_RATE,
} from './platformsConfig';

let _sb = null;
function sb() {
  if (!_sb) {
    const { createClient } = require('@supabase/supabase-js');
    _sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _sb;
}

// ─── Données analytiques (démo — à remplacer par API Meta/TikTok)
const MONTHS     = ['Jan','Fév','Mar','Avr','Mai','Jun'];
const CHART_DATA = {
  depenses:    [45000, 82000, 67000, 124000, 98000, 156000],
  impressions: [12400, 28900, 22100, 48700,  38200, 67500],
  clics:       [340,   820,   670,   1240,   980,   1560],
  conversions: [12,    34,    28,    52,     43,    71],
  revenus:     [180000,340000,280000,520000, 415000,680000],
};

// ─── Packs publicitaires
const PACKS = [
  {
    id: 'starter', icon: '🌱', name: 'Starter',
    price: 14900, period: '/ mois · Débutants',
    color: '#34C759', popular: false, dark: false,
    features: [
      ['✅','3 boosts produits / mois'],
      ['✅','Audience Cameroun'],
      ['✅','Rapports hebdomadaires'],
      ['✅','Pub ODA Marketplace'],
      ['✅','Support par email'],
      ['❌','SmartBoost™ Auto'],
      ['❌','Ciblage avancé multi-ville'],
    ],
    ctaLabel: 'Choisir Starter', ctaStyle: 'outline',
  },
  {
    id: 'growth', icon: '🚀', name: 'Growth',
    price: 49900, period: '/ mois · En croissance',
    color: '#FF6B00', popular: true, dark: false,
    features: [
      ['✅','Boosts illimités / mois'],
      ['✅','Ciblage Yaoundé + Douala + Bafoussam'],
      ['✅','SmartBoost™ inclus'],
      ['✅','Rapports quotidiens'],
      ['✅','Pub ODA Premium Placement'],
      ['✅','Support prioritaire 24h'],
      ['✅','Intégration WhatsApp Business'],
    ],
    ctaLabel: 'Passer à Growth', ctaStyle: 'primary',
  },
  {
    id: 'elite', icon: '👑', name: 'Elite',
    price: 149900, period: '/ mois · Entreprises',
    color: '#FFD700', popular: false, dark: true,
    features: [
      ['✅','Boosts illimités + campagnes multi-produits'],
      ['✅','SmartBoost™ Auto 24/7 + IA adaptative'],
      ['✅','Ciblage national personnalisé'],
      ['✅','Analytics avancées + ROI garanti'],
      ['✅','Account Manager dédié'],
      ['✅','API Webhooks + intégrations custom'],
      ['✅','White-label rapport acheteurs'],
    ],
    ctaLabel: 'Contacter un conseiller', ctaStyle: 'gold',
  },
];

// ─── Sections navigation mobile
const MOBILE_NAV_SECTIONS = [
  { key:'connexions',  icon:'📡', label:'Connexions\nPlateformes',        color:'rgba(24,119,242,.12)',  accent:'#1877F2' },
  { key:'produits',    icon:'⚡', label:'Produits\nBoostables',            color:'rgba(255,107,0,.12)',   accent:'#FF6B00' },
  { key:'packs',       icon:'👑', label:'Packs\nPublicitaires',            color:'rgba(88,86,214,.12)',   accent:'#5856D6' },
  { key:'analytics',  icon:'📈', label:'Analytics &\nPerformance',        color:'rgba(52,199,89,.12)',   accent:'#34C759' },
  { key:'preferences', icon:'⚙️', label:'Préférences\nPublicitaires',      color:'rgba(0,122,255,.12)',   accent:'#007AFF' },
  { key:'interne',     icon:'🏪', label:'Publicité Interne\nODA Marketplace', color:'rgba(255,107,0,.12)', accent:'#FF6B00' },
];

// ─── CSS Global ────────────────────────────────────────────────
const MKT_STYLES = `
  :root {
    --meta-blue:   #1877F2;
    --meta-dk:     #0d5dbf;
    --ig-pink:     #E1306C;
    --sb-orange:   #FF6B00;
    --sb-light:    #FFF0E6;
    --growth:      #00C853;
    --growth-dk:   #009624;
    --gold:        #F4B400;
  }

  .mkt-page { padding:16px; max-width:1280px; margin:0 auto; padding-bottom:80px; }

  /* ── AIDE ── */
  .mkt-help-btn-bar {
    display:flex; align-items:center; justify-content:space-between;
    background:linear-gradient(90deg,#0a1628 0%,#112244 50%,#0a1628 100%);
    border-radius:14px; padding:10px 16px; margin-bottom:18px;
    border:1px solid rgba(255,255,255,.1);
  }
  .mkt-help-tagline { color:rgba(255,255,255,.75); font-size:.75rem; font-weight:500;
    display:flex; align-items:center; gap:8px; }
  .mkt-help-tagline-dot { width:6px; height:6px; border-radius:50%;
    background:var(--sb-orange); animation:mktPulse 1.8s ease-in-out infinite; }
  @keyframes mktPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.7)} }
  .mkt-help-open-btn {
    display:flex; align-items:center; gap:7px;
    background:linear-gradient(135deg,var(--sb-orange),#FF9500);
    color:white; border:none; padding:9px 16px; border-radius:10px;
    font-size:.78rem; font-weight:700; cursor:pointer; font-family:'Poppins',sans-serif;
    box-shadow:0 4px 14px rgba(255,107,0,.4); transition:transform .15s,box-shadow .15s;
    -webkit-tap-highlight-color:transparent; flex-shrink:0;
  }
  .mkt-help-open-btn:active { transform:scale(.93); box-shadow:none; }

  /* ── Overlay modal aide ── */
  .mkt-help-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.55);
    backdrop-filter:blur(4px); z-index:10000;
    display:flex; align-items:flex-end; animation:mktFadeIn .2s ease;
  }
  @media(min-width:600px){ .mkt-help-overlay{ align-items:center; justify-content:center; } }
  @keyframes mktFadeIn { from{opacity:0} to{opacity:1} }
  .mkt-help-drawer {
    background:white; border-radius:24px 24px 0 0; width:100%;
    max-height:90vh; overflow:hidden; display:flex; flex-direction:column;
    animation:mktSlideUp .32s cubic-bezier(.34,1.3,.64,1);
  }
  @media(min-width:600px){ .mkt-help-drawer{ border-radius:24px; width:480px; max-height:80vh; } }
  @keyframes mktSlideUp { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
  .mkt-help-header { display:flex; align-items:center; justify-content:space-between; padding:18px 20px 0; }
  .mkt-help-header-title { font-size:.8rem; font-weight:700; color:var(--text-2); text-transform:uppercase; letter-spacing:.6px; }
  .mkt-help-close {
    width:32px; height:32px; border-radius:50%; background:#F2F2F7; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center; font-size:1rem; color:var(--text-2);
    -webkit-tap-highlight-color:transparent;
  }
  .mkt-help-dots { display:flex; gap:6px; justify-content:center; padding:14px 0 0; }
  .mkt-help-dot { height:6px; border-radius:3px; background:#E5E5EA; cursor:pointer;
    transition:width .3s cubic-bezier(.34,1.3,.64,1),background .3s; }
  .mkt-help-dot.active { background:var(--sb-orange); width:22px !important; }
  .mkt-help-content { flex:1; overflow-y:auto; padding:20px 24px 12px; scrollbar-width:none; }
  .mkt-help-content::-webkit-scrollbar { display:none; }
  .mkt-help-page-icon-wrap {
    width:80px; height:80px; border-radius:24px;
    display:flex; align-items:center; justify-content:center;
    font-size:2.4rem; margin:0 auto 18px; box-shadow:0 8px 24px rgba(0,0,0,.1);
  }
  .mkt-help-step-badge {
    display:inline-flex; align-items:center; background:rgba(255,107,0,.1); color:var(--sb-orange);
    font-size:.68rem; font-weight:800; padding:4px 10px; border-radius:20px;
    margin-bottom:10px; letter-spacing:.4px; text-transform:uppercase;
  }
  .mkt-help-page-title { font-size:1.25rem; font-weight:800; color:var(--text-1); margin-bottom:4px; text-align:center; line-height:1.2; }
  .mkt-help-page-sub { font-size:.78rem; color:var(--text-2); text-align:center; margin-bottom:16px; font-weight:500; }
  .mkt-help-page-desc { font-size:.85rem; color:var(--text-1); line-height:1.65; margin-bottom:18px; text-align:center; }
  .mkt-help-tips { background:#F7F8FA; border-radius:14px; padding:14px 16px; display:flex; flex-direction:column; gap:9px; margin-bottom:10px; }
  .mkt-help-tip { display:flex; align-items:flex-start; gap:10px; font-size:.8rem; color:var(--text-1); font-weight:500; line-height:1.4; }
  .mkt-help-tip-icon {
    width:22px; height:22px; border-radius:8px; background:white;
    box-shadow:0 1px 4px rgba(0,0,0,.1); display:flex; align-items:center;
    justify-content:center; font-size:.8rem; flex-shrink:0; margin-top:1px;
  }
  .mkt-help-nav { display:flex; gap:10px; align-items:center; padding:14px 20px 20px; border-top:.5px solid var(--border); }
  .mkt-help-prev {
    width:44px; height:44px; border-radius:12px; border:1.5px solid var(--border);
    background:white; display:flex; align-items:center; justify-content:center;
    font-size:1.1rem; cursor:pointer; flex-shrink:0; -webkit-tap-highlight-color:transparent;
  }
  .mkt-help-prev:disabled { opacity:.3; cursor:default; }
  .mkt-help-next {
    flex:1; height:44px; border-radius:12px; border:none; font-size:.88rem; font-weight:700;
    cursor:pointer; font-family:'Poppins',sans-serif; -webkit-tap-highlight-color:transparent;
  }

  /* ── HERO ── */
  .mkt-hero {
    background:linear-gradient(135deg,#0a1628 0%,#0d2a54 45%,#1a1035 100%);
    border-radius:20px; padding:28px 24px; color:white; margin-bottom:20px;
    position:relative; overflow:hidden;
  }
  .mkt-hero::before {
    content:''; position:absolute; inset:0;
    background:radial-gradient(circle at 80% 20%,rgba(24,119,242,.35) 0%,transparent 60%),
               radial-gradient(circle at 20% 80%,rgba(255,107,0,.2) 0%,transparent 50%);
    pointer-events:none;
  }
  .mkt-hero-grid { display:grid; grid-template-columns:1fr; gap:20px; position:relative; z-index:1; }
  @media(min-width:768px){ .mkt-hero-grid{ grid-template-columns:1fr auto; align-items:center; } }
  .mkt-hero-title {
    font-size:1.6rem; font-weight:800; margin:0 0 4px;
    background:linear-gradient(90deg,#fff 0%,#93c5fd 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  @media(min-width:480px){ .mkt-hero-title{ font-size:2rem; } }
  .mkt-hero-sub { font-size:.85rem; opacity:.75; margin:0 0 20px; line-height:1.5; }
  .mkt-hero-btns { display:flex; flex-wrap:wrap; gap:10px; }
  .mkt-btn-meta {
    background:var(--meta-blue); color:white; border:none; padding:10px 18px; border-radius:10px;
    font-weight:600; font-size:.85rem; cursor:pointer; display:flex; align-items:center; gap:7px;
    font-family:'Poppins',sans-serif; transition:transform .15s,background .15s; -webkit-tap-highlight-color:transparent;
  }
  .mkt-btn-meta:active { transform:scale(.94); background:var(--meta-dk); }
  .mkt-btn-create {
    background:rgba(255,255,255,.15); color:white; border:1.5px solid rgba(255,255,255,.35);
    padding:10px 18px; border-radius:10px; font-weight:600; font-size:.85rem; cursor:pointer;
    font-family:'Poppins',sans-serif; transition:transform .15s,background .15s; -webkit-tap-highlight-color:transparent;
  }
  .mkt-btn-create:active { transform:scale(.94); background:rgba(255,255,255,.25); }
  .mkt-btn-sb {
    background:linear-gradient(135deg,var(--sb-orange),#FF9500); color:white; border:none;
    padding:10px 18px; border-radius:10px; font-weight:700; font-size:.85rem; cursor:pointer;
    font-family:'Poppins',sans-serif; box-shadow:0 4px 14px rgba(255,107,0,.4);
    transition:transform .15s,box-shadow .15s; -webkit-tap-highlight-color:transparent;
  }
  .mkt-btn-sb:active { transform:scale(.94); box-shadow:none; }

  /* ── KPI Cards ── */
  .mkt-kpi-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin-top:20px; }
  @media(min-width:600px){ .mkt-kpi-grid{ grid-template-columns:repeat(5,1fr); } }
  .mkt-kpi-card {
    background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15);
    border-radius:14px; padding:14px 12px; backdrop-filter:blur(10px);
    transition:transform .2s,background .2s;
  }
  .mkt-kpi-card:hover { background:rgba(255,255,255,.15); transform:translateY(-2px); }
  .mkt-kpi-label { font-size:.7rem; opacity:.65; margin-bottom:4px; text-transform:uppercase; letter-spacing:.5px; }
  .mkt-kpi-value { font-size:1.15rem; font-weight:800; }
  .mkt-kpi-delta { font-size:.7rem; margin-top:3px; }
  .mkt-kpi-up   { color:#4ade80; }
  .mkt-kpi-down { color:#f87171; }

  /* ── Sections ── */
  .mkt-section { margin-bottom:20px; }
  .mkt-section-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
  .mkt-section-title { font-size:1rem; font-weight:700; color:var(--text-1); display:flex; align-items:center; gap:8px; }
  .mkt-section-link { font-size:.78rem; color:var(--primary); font-weight:600; background:none; border:none; cursor:pointer; font-family:'Poppins',sans-serif; padding:0; }
  .mkt-card { background:var(--card-bg); border-radius:16px; padding:18px; box-shadow:var(--shadow-sm); border:.5px solid var(--border); }

  /* ── META CONNEXIONS ── */
  .mkt-meta-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
  @media(min-width:600px){ .mkt-meta-grid{ grid-template-columns:repeat(3,1fr); } }
  @media(min-width:900px){ .mkt-meta-grid{ grid-template-columns:repeat(4,1fr); } }
  .mkt-meta-item {
    display:flex; flex-direction:column; align-items:center; text-align:center; gap:8px;
    padding:16px 10px 14px; border-radius:16px; border:1.5px solid var(--border);
    background:#FAFAFA; transition:border-color .2s,transform .2s,box-shadow .2s;
  }
  .mkt-meta-item:hover { border-color:var(--meta-blue); transform:translateY(-2px); box-shadow:0 6px 18px rgba(0,0,0,.07); }
  .mkt-meta-icon { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0; }
  .mkt-meta-name { font-weight:700; font-size:.78rem; line-height:1.2; color:var(--text-1); }
  .mkt-meta-status { font-size:.68rem; display:flex; align-items:center; justify-content:center; gap:4px; }
  .mkt-status-connected { color:var(--success); }
  .mkt-status-disconnected { color:var(--danger); }
  .mkt-meta-connect-btn {
    margin-top:6px; width:100%; padding:8px 10px; border-radius:10px; font-size:.72rem;
    font-weight:700; cursor:pointer; font-family:'Poppins',sans-serif; border:none;
    white-space:nowrap; transition:transform .15s,opacity .15s; -webkit-tap-highlight-color:transparent;
  }
  .mkt-meta-connect-btn:active { transform:scale(.93); opacity:.85; }

  /* ── PRODUCTS GRID ── */
  .mkt-products-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
  @media(min-width:600px){ .mkt-products-grid{ grid-template-columns:repeat(3,1fr); } }
  @media(min-width:900px){ .mkt-products-grid{ grid-template-columns:repeat(4,1fr); } }
  @media(min-width:1200px){ .mkt-products-grid{ grid-template-columns:repeat(6,1fr); } }
  .mkt-product-card {
    background:var(--card-bg); border-radius:14px; overflow:hidden;
    border:.5px solid var(--border); box-shadow:var(--shadow-sm);
    transition:transform .2s var(--spring),box-shadow .2s;
  }
  .mkt-product-card:hover { transform:translateY(-4px); box-shadow:var(--shadow-md); }
  .mkt-product-img { width:100%; aspect-ratio:1; object-fit:cover; display:block; background:#F2F2F7; }
  .mkt-product-body { padding:10px; }
  .mkt-product-name { font-weight:600; font-size:.8rem; margin-bottom:4px; line-height:1.3;
    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .mkt-product-price { font-size:.85rem; font-weight:700; color:var(--primary); margin-bottom:4px; }
  .mkt-product-meta { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
  .mkt-product-stock { font-size:.7rem; color:var(--text-2); }
  .mkt-sync-badge { font-size:.62rem; padding:2px 7px; border-radius:20px; font-weight:600; }
  .mkt-sync-ok { background:rgba(52,199,89,.12); color:var(--success); }
  .mkt-sync-no { background:rgba(255,149,0,.12); color:var(--accent); }
  .mkt-boost-btn {
    width:100%; padding:8px 4px; border:none; border-radius:9px;
    background:linear-gradient(135deg,var(--sb-orange),#FF9500); color:white;
    font-weight:700; font-size:.75rem; cursor:pointer; font-family:'Poppins',sans-serif;
    box-shadow:0 3px 10px rgba(255,107,0,.3); transition:transform .15s,box-shadow .15s;
    -webkit-tap-highlight-color:transparent;
  }
  .mkt-boost-btn:active { transform:scale(.93); box-shadow:none; }

  /* ── SKELETON ── */
  .mkt-skeleton {
    background:linear-gradient(90deg,#F2F2F7 25%,#E8E8ED 50%,#F2F2F7 75%);
    background-size:200% 100%; animation:mktSkeleton 1.4s ease infinite; border-radius:10px;
  }
  @keyframes mktSkeleton { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .mkt-product-card-skeleton { border-radius:14px; overflow:hidden; border:.5px solid var(--border); }

  /* ── BOOST MODAL (nouveau) ── */
  .mkt-modal-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.6);
    backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
    z-index:2000; display:flex; align-items:flex-end; justify-content:center;
    animation:mktFadeIn .25s ease;
  }
  @media(min-width:600px){ .mkt-modal-overlay{ align-items:center; } }
  .mkt-modal {
    background:white; border-radius:24px 24px 0 0; width:100%; max-width:560px;
    max-height:92vh; overflow-y:auto; padding:24px;
    animation:mktSlideUp .35s cubic-bezier(.34,1.56,.64,1);
  }
  @media(min-width:600px){ .mkt-modal{ border-radius:24px; max-height:88vh; } }
  .mkt-modal-handle { width:36px; height:4px; background:#E5E5EA; border-radius:4px; margin:0 auto 20px; display:block; }
  @media(min-width:600px){ .mkt-modal-handle{ display:none; } }
  .mkt-modal-title { font-size:1.15rem; font-weight:800; margin-bottom:4px; }
  .mkt-modal-sub { font-size:.82rem; color:var(--text-2); margin-bottom:20px; }

  /* Pills */
  .mkt-budget-pills { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:18px; }
  .mkt-pill {
    padding:9px 16px; border-radius:50px; border:1.5px solid var(--border);
    font-size:.82rem; font-weight:600; cursor:pointer; font-family:'Poppins',sans-serif;
    background:white; transition:all .15s; -webkit-tap-highlight-color:transparent;
  }
  .mkt-pill.active { background:var(--sb-orange); color:white; border-color:var(--sb-orange); box-shadow:0 4px 12px rgba(255,107,0,.3); }
  .mkt-pill:not(.active):hover { border-color:var(--sb-orange); color:var(--sb-orange); }

  /* Plateformes checkboxes */
  .mkt-platform-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; margin-bottom:18px; }
  @media(min-width:480px){ .mkt-platform-grid{ grid-template-columns:repeat(3,1fr); } }
  .mkt-platform-check {
    display:flex; flex-direction:column; align-items:center; gap:6px;
    padding:12px 8px; border-radius:14px; border:2px solid var(--border);
    cursor:pointer; transition:all .2s; -webkit-tap-highlight-color:transparent;
    position:relative; background:#FAFAFA;
  }
  .mkt-platform-check.selected { border-color:var(--sb-orange); background:#FFF5EE; }
  .mkt-platform-check.disabled { opacity:.4; cursor:not-allowed; }
  .mkt-platform-check-icon { font-size:1.4rem; }
  .mkt-platform-check-name { font-size:.72rem; font-weight:700; color:var(--text-1); }
  .mkt-platform-check-price { font-size:.68rem; color:var(--text-2); }
  .mkt-platform-check-badge {
    position:absolute; top:-6px; right:-6px; background:#34C759; color:white;
    font-size:.55rem; font-weight:800; padding:2px 5px; border-radius:6px;
  }

  /* Form */
  .mkt-form-label { font-size:.78rem; font-weight:700; color:var(--text-2); text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; display:block; }
  .mkt-form-group { margin-bottom:16px; }
  .mkt-select {
    width:100%; padding:12px 14px; border-radius:11px; border:1.5px solid var(--border);
    font-family:'Poppins',sans-serif; font-size:.85rem; background:#FAFAFA; color:var(--text-1);
    appearance:none; cursor:pointer; transition:border-color .2s;
  }
  .mkt-select:focus { outline:none; border-color:var(--primary); background:white; }
  .mkt-input {
    width:100%; padding:12px 14px; border-radius:11px; border:1.5px solid var(--border);
    font-family:'Poppins',sans-serif; font-size:.85rem; background:#FAFAFA; color:var(--text-1);
    transition:border-color .2s;
  }
  .mkt-input:focus { outline:none; border-color:var(--primary); background:white; }

  /* SmartBoost Toggle */
  .mkt-sb-toggle {
    background:linear-gradient(135deg,#FFF0E6,#FFE0C9); border:1.5px solid rgba(255,107,0,.25);
    border-radius:14px; padding:14px 16px; display:flex; align-items:center; gap:12px;
    margin-bottom:18px; cursor:pointer; transition:box-shadow .2s; -webkit-tap-highlight-color:transparent;
  }
  .mkt-sb-toggle:hover { box-shadow:0 4px 14px rgba(255,107,0,.2); }
  .mkt-toggle-track { width:44px; height:26px; border-radius:13px; flex-shrink:0; transition:background .25s; position:relative; background:#E5E5EA; }
  .mkt-toggle-track.on { background:var(--sb-orange); }
  .mkt-toggle-thumb { position:absolute; top:3px; left:3px; width:20px; height:20px; border-radius:50%; background:white; box-shadow:0 2px 6px rgba(0,0,0,.2); transition:transform .25s cubic-bezier(.34,1.56,.64,1); }
  .mkt-toggle-track.on .mkt-toggle-thumb { transform:translateX(18px); }

  /* Récapitulatif boost */
  .mkt-total-box { background:linear-gradient(135deg,#0a1628,#1a1035); border-radius:14px; padding:16px 18px; color:white; margin-bottom:18px; }
  .mkt-total-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
  .mkt-total-label { font-size:.82rem; opacity:.7; }
  .mkt-total-val { font-size:.9rem; font-weight:600; }
  .mkt-total-final { font-size:1.4rem; font-weight:800; color:#FF9500; }
  .mkt-total-divider { border:none; border-top:.5px solid rgba(255,255,255,.15); margin:10px 0; }
  .mkt-total-note { font-size:.7rem; opacity:.5; text-align:center; margin-top:8px; }

  /* Boutons modal */
  .mkt-modal-cta {
    width:100%; padding:15px; border:none; border-radius:14px;
    background:linear-gradient(135deg,var(--sb-orange),#FF9500);
    color:white; font-size:1rem; font-weight:700; cursor:pointer;
    font-family:'Poppins',sans-serif; box-shadow:0 6px 20px rgba(255,107,0,.35);
    transition:transform .15s,box-shadow .15s; -webkit-tap-highlight-color:transparent;
  }
  .mkt-modal-cta:active { transform:scale(.97); box-shadow:none; }
  .mkt-modal-cta:disabled { opacity:.5; cursor:not-allowed; }
  .mkt-modal-cancel {
    width:100%; padding:14px; border:1.5px solid var(--border); border-radius:14px;
    background:white; color:var(--text-2); font-size:.9rem; font-weight:600;
    cursor:pointer; font-family:'Poppins',sans-serif; margin-top:10px;
    transition:transform .15s,background .15s; -webkit-tap-highlight-color:transparent;
  }
  .mkt-modal-cancel:active { transform:scale(.97); background:#F2F2F7; }

  /* Alerte aucune plateforme */
  .mkt-no-platform-alert {
    background:rgba(255,59,48,.06); border:1.5px solid rgba(255,59,48,.2);
    border-radius:12px; padding:14px 16px; font-size:.82rem; color:#FF3B30;
    text-align:center; margin-bottom:16px; font-weight:500;
  }

  /* ── PACKS ── */
  .mkt-packs-grid { display:grid; grid-template-columns:1fr; gap:14px; }
  @media(min-width:600px){ .mkt-packs-grid{ grid-template-columns:repeat(3,1fr); } }
  .mkt-pack { border-radius:18px; padding:20px 18px; border:2px solid var(--border); position:relative; transition:transform .2s,box-shadow .2s; background:var(--card-bg); }
  .mkt-pack:hover { transform:translateY(-4px); box-shadow:var(--shadow-md); }
  .mkt-pack.popular { border-color:var(--sb-orange); box-shadow:0 6px 24px rgba(255,107,0,.2); }
  .mkt-pack-badge { position:absolute; top:-10px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg,var(--sb-orange),#FF9500); color:white; font-size:.68rem; font-weight:700; padding:4px 12px; border-radius:20px; white-space:nowrap; letter-spacing:.3px; }
  .mkt-pack-icon { font-size:2rem; margin-bottom:10px; }
  .mkt-pack-name { font-size:1rem; font-weight:800; margin-bottom:4px; }
  .mkt-pack-price { font-size:1.5rem; font-weight:800; margin-bottom:2px; }
  .mkt-pack-period { font-size:.72rem; color:var(--text-2); margin-bottom:14px; }
  .mkt-pack-feature { display:flex; align-items:center; gap:7px; font-size:.8rem; margin-bottom:7px; color:var(--text-1); }
  .mkt-pack-feature span:first-child { font-size:.9rem; flex-shrink:0; }
  .mkt-pack-cta { width:100%; padding:12px; border-radius:11px; border:none; font-weight:700; font-size:.85rem; cursor:pointer; font-family:'Poppins',sans-serif; margin-top:16px; transition:transform .15s,opacity .15s; -webkit-tap-highlight-color:transparent; }
  .mkt-pack-cta:active { transform:scale(.95); }
  .mkt-pack-cta.primary { background:linear-gradient(135deg,var(--sb-orange),#FF9500); color:white; box-shadow:0 4px 14px rgba(255,107,0,.3); }
  .mkt-pack-cta.outline { background:transparent; color:var(--primary); border:1.5px solid var(--primary); }

  /* ── ANALYTICS ── */
  .mkt-analytics-tabs { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:16px; }
  .mkt-analytics-tab { padding:7px 14px; border-radius:50px; font-size:.78rem; font-weight:600; cursor:pointer; border:1.5px solid var(--border); background:white; font-family:'Poppins',sans-serif; color:var(--text-2); transition:all .15s; -webkit-tap-highlight-color:transparent; }
  .mkt-analytics-tab.active { background:var(--primary); color:white; border-color:var(--primary); box-shadow:0 3px 10px rgba(0,122,255,.25); }
  .mkt-chart-area { width:100%; height:160px; position:relative; overflow:hidden; }
  @media(min-width:600px){ .mkt-chart-area{ height:200px; } }
  .mkt-chart-svg { width:100%; height:100%; }
  .mkt-chart-labels { display:flex; justify-content:space-between; padding:6px 0 0; font-size:.68rem; color:var(--text-2); }
  .mkt-top-products { margin-top:18px; }
  .mkt-top-row { display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:.5px solid var(--border); }
  .mkt-top-row:last-child { border-bottom:none; }
  .mkt-top-rank { width:24px; height:24px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:.72rem; font-weight:800; flex-shrink:0; }
  .mkt-top-bar-wrap { flex:1; height:6px; background:var(--bg); border-radius:3px; overflow:hidden; }
  .mkt-top-bar { height:100%; border-radius:3px; transition:width .6s ease; }
  .mkt-top-pct { font-size:.75rem; font-weight:700; color:var(--text-2); width:36px; text-align:right; }

  /* ── PRÉFÉRENCES ── */
  .mkt-prefs-grid { display:grid; grid-template-columns:1fr; gap:12px; }
  @media(min-width:600px){ .mkt-prefs-grid{ grid-template-columns:repeat(2,1fr); } }
  .mkt-pref-item { display:flex; justify-content:space-between; align-items:center; padding:14px 16px; border-radius:12px; background:#FAFAFA; border:1px solid var(--border); }
  .mkt-pref-label { font-weight:600; font-size:.85rem; }
  .mkt-pref-sub { font-size:.72rem; color:var(--text-2); margin-top:2px; }

  /* ── PUBLICITÉ INTERNE ── */
  .mkt-internal-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
  @media(min-width:600px){ .mkt-internal-grid{ grid-template-columns:repeat(3,1fr); } }
  @media(min-width:900px){ .mkt-internal-grid{ grid-template-columns:repeat(4,1fr); } }
  .mkt-internal-card { border-radius:14px; overflow:hidden; border:.5px solid var(--border); box-shadow:var(--shadow-sm); background:white; position:relative; transition:transform .2s; }
  .mkt-internal-card:hover { transform:translateY(-3px); }
  .mkt-sponsored-badge { position:absolute; top:8px; left:8px; background:rgba(255,107,0,.92); color:white; font-size:.6rem; font-weight:700; padding:3px 7px; border-radius:6px; letter-spacing:.3px; }
  .mkt-internal-img { width:100%; aspect-ratio:1; object-fit:cover; display:block; }
  .mkt-internal-body { padding:10px; }
  .mkt-internal-name { font-size:.78rem; font-weight:600; margin-bottom:4px; }
  .mkt-internal-price { font-size:.82rem; font-weight:800; color:var(--primary); }

  /* ── TOASTS ── */
  .mkt-toast-stack { position:fixed; top:66px; right:12px; z-index:9999; display:flex; flex-direction:column; gap:8px; max-width:320px; width:calc(100vw - 24px); }
  .mkt-toast { background:white; padding:14px 18px; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,.14); font-family:'Poppins',sans-serif; font-size:.86rem; font-weight:500; animation:mktToastIn .4s cubic-bezier(.34,1.56,.64,1); }
  @keyframes mktToastIn { from{transform:translateX(120%);opacity:0} to{transform:translateX(0);opacity:1} }

  /* ── NAVIGATION MOBILE ── */
  .mkt-mobile-nav { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px; }
  .mkt-mobile-nav-btn {
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px;
    padding:20px 10px 18px; border-radius:18px; border:1.5px solid var(--border);
    background:var(--card-bg); cursor:pointer; font-family:'Poppins',sans-serif;
    box-shadow:var(--shadow-sm); transition:transform .15s,box-shadow .15s,border-color .2s;
    -webkit-tap-highlight-color:transparent; text-align:center; min-height:100px;
  }
  .mkt-mobile-nav-btn:active { transform:scale(.94); box-shadow:none; }
  .mkt-mobile-nav-icon { font-size:2rem; line-height:1; }
  .mkt-mobile-nav-label { font-size:.73rem; font-weight:700; color:var(--text-1); line-height:1.35; white-space:pre-line; }
  .mkt-mobile-back {
    display:inline-flex; align-items:center; gap:7px; padding:10px 16px 10px 10px;
    margin-bottom:16px; background:var(--card-bg); border:1.5px solid var(--border);
    border-radius:12px; cursor:pointer; font-family:'Poppins',sans-serif; font-size:.85rem;
    font-weight:700; color:var(--text-1); box-shadow:var(--shadow-sm);
    transition:transform .15s,background .15s; -webkit-tap-highlight-color:transparent;
  }
  .mkt-mobile-back:active { transform:scale(.95); background:#F2F2F7; }
  .mkt-mobile-back-arrow { font-size:1rem; color:var(--primary); }
`;

// ─── Mini SVG Line Chart ───────────────────────────────────────
function LineChart({ data, color }) {
  const w = 600, h = 160, pad = 20;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + ((1 - (v - min) / range) * (h - pad * 2));
    return `${x},${y}`;
  });
  const area = `${pts[0].split(',')[0]},${h} ${pts.join(' ')} ${pts[pts.length-1].split(',')[0]},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mkt-chart-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#grad-${color.replace('#','')})`}/>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2);
        const y = pad + ((1 - (v - min) / range) * (h - pad * 2));
        return <circle key={i} cx={x} cy={y} r="4" fill={color} stroke="white" strokeWidth="2"/>;
      })}
    </svg>
  );
}

// ─── Toggle Switch ─────────────────────────────────────────────
function Toggle({ on, onToggle }) {
  return (
    <div className={`mkt-toggle-track${on ? ' on' : ''}`} onClick={onToggle} style={{ cursor:'pointer' }}>
      <div className="mkt-toggle-thumb" />
    </div>
  );
}

// ─── Pages du guide d'aide ─────────────────────────────────────
const HELP_PAGES = [
  {
    step:null, icon:'🚀', title:'ODA Marketing Center', subtitle:'Boostez vos ventes au Cameroun',
    desc:'Publiez vos produits sur Facebook, Instagram, TikTok et ODA Marketplace en quelques clics. Notre IA SmartBoost™ optimise automatiquement vos campagnes pour maximiser vos ventes.',
    tips:[
      { icon:'🇨🇲', text:'100 % adapté au marché camerounais' },
      { icon:'📱', text:'Paiement Mobile Money (Orange, MTN)' },
      { icon:'📈', text:'Résultats mesurables en temps réel' },
    ],
    color:'#FF6B00', bg:'rgba(255,107,0,.12)',
  },
  {
    step:1, icon:'🔗', title:'Connecter vos plateformes', subtitle:'Facebook · Instagram · WhatsApp · TikTok',
    desc:'Commencez par connecter vos comptes publicitaires dans la section "Connexions Plateformes". Chaque plateforme connectée multiplie la portée de vos annonces.',
    tips:[
      { icon:'👆', text:'Appuyez sur "Connexions Plateformes" depuis l\'accueil' },
      { icon:'✅', text:'Autorisez l\'accès à chaque compte en un clic' },
      { icon:'💡', text:'Un seul compte suffit pour commencer à vendre' },
    ],
    color:'#1877F2', bg:'rgba(24,119,242,.12)',
  },
  {
    step:2, icon:'📦', title:'Choisir un produit à booster', subtitle:'Depuis votre catalogue ODA',
    desc:'Sélectionnez un produit publié sur votre boutique ODA. Seuls les produits au statut "Publié" apparaissent dans la liste des produits boostables.',
    tips:[
      { icon:'📸', text:'Ajoutez des photos haute qualité pour plus de clics' },
      { icon:'💰', text:'Renseignez un prix clair et attractif' },
      { icon:'📦', text:'Les produits avec du stock disponible vendent mieux' },
    ],
    color:'#34C759', bg:'rgba(52,199,89,.12)',
  },
  {
    step:3, icon:'⚙️', title:'Configurer la campagne', subtitle:'Plateformes · Budget · Durée · Audience',
    desc:'Sélectionnez les plateformes connectées où diffuser, définissez la durée et l\'audience cible. Le tarif est calculé automatiquement par plateforme et par jour.',
    tips:[
      { icon:'💸', text:'Facebook + Instagram : 1 500 FCFA/jour chacun' },
      { icon:'📍', text:'Yaoundé + Douala = meilleur retour sur investissement' },
      { icon:'📅', text:'7 jours de diffusion = résultats optimaux' },
    ],
    color:'#5856D6', bg:'rgba(88,86,214,.12)',
  },
  {
    step:4, icon:'🤖', title:'SmartBoost™ par IA', subtitle:'+5 % de frais · +performances garanties',
    desc:'Activez SmartBoost™ pour que notre IA optimise horaires, audiences et placements, et rééquilibre le budget automatiquement vers la plateforme qui performe le mieux toutes les 6h.',
    tips:[
      { icon:'🕐', text:'Actif 24 h/24, 7 j/7 sans intervention manuelle' },
      { icon:'📉', text:'Réduit le coût par conversion jusqu\'à 30 %' },
      { icon:'🔄', text:'Rééquilibrage automatique toutes les 6h entre plateformes' },
    ],
    color:'#FF9500', bg:'rgba(255,149,0,.12)',
  },
  {
    step:5, icon:'📊', title:'Suivre vos performances', subtitle:'Analytics & ROI en temps réel',
    desc:'Consultez impressions, clics, conversions et revenus dans la section Analytics. SmartBoost™ vous indique quelle plateforme performe le mieux pour concentrer votre budget.',
    tips:[
      { icon:'👁', text:'Impressions · Clics · Taux de conversion' },
      { icon:'💵', text:'Revenus générés et ROI calculé automatiquement' },
      { icon:'🏆', text:'Top 4 des produits les plus performants' },
    ],
    color:'#34C759', bg:'rgba(52,199,89,.12)',
  },
  {
    step:null, icon:'👑', title:'Packs & Paiement', subtitle:'Starter · Growth · Elite',
    desc:'Choisissez un abonnement mensuel adapté à votre activité. Payez facilement avec Orange Money, MTN Mobile Money ou carte bancaire. Remboursement garanti en cas de panne.',
    tips:[
      { icon:'🌱', text:'Starter : 14 900 FCFA / mois — idéal pour débutants' },
      { icon:'🚀', text:'Growth : 49 900 FCFA / mois — le plus populaire' },
      { icon:'🔒', text:'Paiement 100 % sécurisé, remboursable en cas de panne' },
    ],
    color:'#FFD700', bg:'rgba(255,215,0,.12)',
  },
];

// ─── Composant HelpCenter ──────────────────────────────────────
function HelpCenter() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const total   = HELP_PAGES.length;
  const current = HELP_PAGES[page];
  const isLast  = page === total - 1;
  function close() { setOpen(false); setPage(0); }

  return (
    <>
      <div className="mkt-help-btn-bar">
        <div className="mkt-help-tagline">
          <span className="mkt-help-tagline-dot" />
          ODA Marketing Center · Boostez vos ventes au Cameroun
        </div>
        <button className="mkt-help-open-btn" onClick={() => setOpen(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
          </svg>
          Aide
        </button>
      </div>
      {open && (
        <div className="mkt-help-overlay" onClick={e => { if (e.target === e.currentTarget) close(); }}>
          <div className="mkt-help-drawer">
            <div className="mkt-help-header">
              <div className="mkt-help-header-title">Guide d'utilisation</div>
              <button className="mkt-help-close" onClick={close}>✕</button>
            </div>
            <div className="mkt-help-dots">
              {HELP_PAGES.map((_, i) => (
                <div key={i} className={`mkt-help-dot${i === page ? ' active' : ''}`}
                  style={{ width: i === page ? 22 : 6 }} onClick={() => setPage(i)} />
              ))}
            </div>
            <div className="mkt-help-content">
              <div className="mkt-help-page-icon-wrap" style={{ background: current.bg, marginTop:8 }}>
                {current.icon}
              </div>
              <div style={{ textAlign:'center' }}>
                {current.step ? (
                  <span className="mkt-help-step-badge" style={{ background:current.bg, color:current.color }}>
                    Étape {current.step} / {HELP_PAGES.filter(p => p.step).length}
                  </span>
                ) : (
                  <span className="mkt-help-step-badge" style={{ background:'#F2F2F7', color:'#666' }}>
                    {page === 0 ? '✦ Introduction' : '✦ Information'}
                  </span>
                )}
              </div>
              <div className="mkt-help-page-title" style={{ marginTop:10 }}>{current.title}</div>
              <div className="mkt-help-page-sub">{current.subtitle}</div>
              <p className="mkt-help-page-desc">{current.desc}</p>
              <div className="mkt-help-tips">
                {current.tips.map((tip, i) => (
                  <div className="mkt-help-tip" key={i}>
                    <div className="mkt-help-tip-icon">{tip.icon}</div>
                    <span>{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mkt-help-nav">
              <button className="mkt-help-prev" disabled={page === 0} onClick={() => setPage(p => p-1)}>←</button>
              <button
                className="mkt-help-next"
                style={isLast
                  ? { background:'#34C759', color:'white', boxShadow:'0 4px 14px rgba(52,199,89,.35)' }
                  : { background:`linear-gradient(135deg,${current.color},${current.color}CC)`, color:'white', boxShadow:`0 4px 14px ${current.color}55` }
                }
                onClick={() => isLast ? close() : setPage(p => p+1)}
              >
                {isLast ? '✅ Compris, allons-y !' : 'Suivant →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Skeleton produits ─────────────────────────────────────────
function ProductSkeleton() {
  return (
    <>
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="mkt-product-card-skeleton">
          <div className="mkt-skeleton" style={{ width:'100%', aspectRatio:'1' }} />
          <div style={{ padding:10 }}>
            <div className="mkt-skeleton" style={{ height:12, marginBottom:8, borderRadius:6 }} />
            <div className="mkt-skeleton" style={{ height:12, width:'60%', marginBottom:8, borderRadius:6 }} />
            <div className="mkt-skeleton" style={{ height:32, marginTop:4, borderRadius:9 }} />
          </div>
        </div>
      ))}
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function OdaMarketingCenter() {
  const { user } = useAuth();
  const router   = useRouter();

  // ─── State produits
  const [products,        setProducts]        = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ─── State UI
  const [activeTab,      setActiveTab]      = useState('depenses');
  const [boostProduct,   setBoostProduct]   = useState(null);
  const [toasts,         setToasts]         = useState([]);
  const [activeSection,  setActiveSection]  = useState(null);
  const [isMobile,       setIsMobile]       = useState(false);

  // ─── State connexion Meta (plateformes)
  const [metaStatus, setMetaStatus] = useState({
    facebook:  false,
    instagram: false,
    whatsapp:  false,
    tiktok:    false,
    youtube:   false,
    business:  false,
    adaccount: false,
    pixel:     false,
  });

  // ─── Token Meta (stocké après connexion OAuth)
  const [metaAccessToken, setMetaAccessToken] = useState(null);

  // ─── State nouveau formulaire boost
  const [boostPlateformes,  setBoostPlateformes]  = useState([]);   // plateformes sélectionnées
  const [boostDuration,     setBoostDuration]     = useState('7');  // jours
  const [boostAudience,     setBoostAudience]     = useState('cameroun');
  const [boostObjectif,     setBoostObjectif]     = useState('ventes');
  const [smartBoost,        setSmartBoost]        = useState(true);

  // ─── State préférences
  const [prefs, setPrefs] = useState({
    budgetJour:     5000,
    budgetMois:     150000,
    autoBoost:      false,
    smartBoostAuto: true,
    notifs:         true,
  });

  // ─── Détection mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ─── Injection styles
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('oda-mkt-style')) return;
    const el = document.createElement('style');
    el.id = 'oda-mkt-style';
    el.textContent = MKT_STYLES;
    document.head.appendChild(el);
  }, []);

  // ─── Chargement du SDK Facebook
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.FB) return; // déjà chargé

    window.fbAsyncInit = function () {
      window.FB.init({
        appId:   META_APP_ID,
        cookie:  true,
        xfbml:   true,
        version: META_API_VERSION,
      });
      // Vérifier si l'utilisateur est déjà connecté
      window.FB.getLoginStatus(response => {
        if (response.status === 'connected') {
          const token = response.authResponse.accessToken;
          setMetaAccessToken(token);
          setMetaStatus(p => ({ ...p, facebook: true, instagram: true }));
        }
      });
    };

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://connect.facebook.net/fr_FR/sdk.js`;
    document.head.appendChild(script);
  }, []);

  // ─── Chargement produits Supabase
  useEffect(() => {
    if (!user) return;
    chargerProduits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function chargerProduits() {
    try {
      setLoadingProducts(true);
      const { data, error } = await sb()
        .from('produits')
        .select('id,nom,description,prix,stock,categorie,statut,main_image,description_images,created_at')
        .eq('user_id', user.id)
        .eq('statut', 'published')
        .order('created_at', { ascending: false })
        .limit(12);
      if (error) throw error;
      setProducts((data || []).map(p => ({
        id:          p.id,
        nom:         p.nom,
        description: p.description,
        prix:        p.prix,
        stock:       p.stock,
        categorie:   p.categorie,
        statut:      p.statut,
        image:       p.main_image || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200&h=200&fit=crop',
        synced:      !!p.main_image,
      })));
    } catch (err) {
      console.error(err);
      toast('❌ Impossible de charger les produits', 'error');
    } finally {
      setLoadingProducts(false);
    }
  }

  // ─── Scroll lock
  useEffect(() => {
    document.body.style.overflow = boostProduct ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [boostProduct]);

  // ─── Toast helper
  const toast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800);
  }, []);

  // ────────────────────────────────────────────────────────────
  // CONNEXION META FACEBOOK (OAuth réel via FB SDK)
  // ────────────────────────────────────────────────────────────
  function handleMetaConnect(key) {
    // Plateformes Meta (même API) : facebook, instagram, business, adaccount, pixel
    const metaPlatforms = ['facebook', 'instagram', 'business', 'adaccount', 'pixel'];

    if (metaStatus[key]) {
      // Déjà connecté → déconnecter
      if (typeof window !== 'undefined' && window.FB && key === 'facebook') {
        window.FB.logout(() => {
          setMetaStatus(p => {
            const next = { ...p };
            metaPlatforms.forEach(k => { next[k] = false; });
            return next;
          });
          setMetaAccessToken(null);
          toast('🔌 Déconnecté de Meta', 'warning');
        });
      } else {
        setMetaStatus(p => ({ ...p, [key]: false }));
        toast('🔌 Déconnecté', 'warning');
      }
      return;
    }

    // Connexion selon la plateforme
    if (metaPlatforms.includes(key)) {
      // Utiliser le SDK Facebook pour les plateformes Meta
      if (typeof window === 'undefined' || !window.FB) {
        toast('⏳ SDK Facebook en cours de chargement, réessayez...', 'warning');
        return;
      }
      window.FB.login(response => {
        if (response.authResponse) {
          const token = response.authResponse.accessToken;
          setMetaAccessToken(token);
          // Vérifier le token et récupérer les infos via Graph API
          window.FB.api('/me', { fields:'id,name', access_token: token }, (data) => {
            if (data && !data.error) {
              // Connecter toutes les plateformes Meta d'un coup
              setMetaStatus(p => ({ ...p, facebook:true, instagram:true, business:true, adaccount:true, pixel:true }));
              toast(`✅ ${data.name} connecté à Meta (Facebook + Instagram) !`, 'success');
              // Sauvegarder dans Supabase
              sauvegarderTokenMeta(token, data.id, data.name);
            } else {
              toast('❌ Erreur lors de la connexion Meta', 'error');
            }
          });
        } else {
          toast('❌ Connexion annulée', 'error');
        }
      }, {
        scope: 'public_profile,email',
        return_scopes: true,
      });

    } else if (key === 'whatsapp') {
      // WhatsApp Business via Meta Business API
      if (typeof window === 'undefined' || !window.FB) {
        toast('⏳ SDK en cours de chargement...', 'warning');
        return;
      }
      window.FB.login(response => {
        if (response.authResponse) {
          setMetaStatus(p => ({ ...p, whatsapp: true }));
          toast('✅ WhatsApp Business connecté !', 'success');
        }
      }, { scope: 'whatsapp_business_management,whatsapp_business_messaging' });

    } else {
      // TikTok / YouTube : simulation (leurs SDKs sont séparés)
      toast(`🔜 Connexion ${key === 'tiktok' ? 'TikTok' : 'YouTube'} — bientôt disponible !`, 'info');
    }
  }

  async function sauvegarderTokenMeta(token, fbId, fbName) {
    try {
      await sb().from('meta_connexions').upsert({
        user_id:      user.id,
        fb_user_id:   fbId,
        fb_user_name: fbName,
        access_token: token,
        connected_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    } catch (e) {
      console.error('Erreur sauvegarde token Meta:', e);
    }
  }

  // ────────────────────────────────────────────────────────────
  // CALCUL BOOST — Tarif en fonction des plateformes + durée
  // ────────────────────────────────────────────────────────────
  const dureeJours = parseInt(boostDuration) || 7;

  // Budget de base = somme des tarifs des plateformes sélectionnées × durée
  const budgetBase = boostPlateformes.reduce((sum, pf) => sum + (PLATFORM_PRICES[pf] || 0), 0) * dureeJours;

  // Frais SmartBoost™ = 5% du budget de base (votre revenu)
  const fraisSmartBoost = smartBoost ? Math.round(budgetBase * SMARTBOOST_FEE_RATE) : 0;

  // Commission ODA = 10% du budget de base (votre revenu — non affiché à l'utilisateur)
  const commissionODA = Math.round(budgetBase * COMMISSION_ODA_RATE);

  // Budget net envoyé aux plateformes = budget de base - commission ODA
  const budgetNetMeta = budgetBase - commissionODA;

  // Total que l'utilisateur paie
  const totalAPayer = budgetBase + fraisSmartBoost;

  // ────────────────────────────────────────────────────────────
  // HANDLER BOOST → Redirige vers page paiement
  // ────────────────────────────────────────────────────────────
  async function handleBoost() {
    if (!boostProduct || boostPlateformes.length === 0) return;

    // Sauvegarder la commande de boost dans Supabase
    try {
      const { data: boostData, error } = await sb().from('boosts').insert({
        user_id:          user.id,
        produit_id:       boostProduct.id,
        produit_nom:      boostProduct.nom,
        plateformes:      boostPlateformes,
        duree_jours:      dureeJours,
        audience:         boostAudience,
        objectif:         boostObjectif,
        smart_boost:      smartBoost,
        budget_base:      budgetBase,
        frais_smartboost: fraisSmartBoost,
        commission_oda:   commissionODA,
        budget_net_meta:  budgetNetMeta,
        total_a_payer:    totalAPayer,
        statut:           'en_attente_paiement',
        created_at:       new Date().toISOString(),
      }).select().single();

      if (error) throw error;

      // Construire les paramètres pour la page paiement
      const params = new URLSearchParams({
        boost_id:         boostData.id,
        produit_nom:      boostProduct.nom,
        produit_image:    boostProduct.image,
        plateformes:      boostPlateformes.join(','),
        duree:            boostDuration,
        total:            totalAPayer.toString(),
        budget_base:      budgetBase.toString(),
        frais_smartboost: fraisSmartBoost.toString(),
        smart_boost:      smartBoost.toString(),
        objectif:         boostObjectif,
        audience:         boostAudience,
      });

      // Fermer le modal
      setBoostProduct(null);

      // Rediriger vers la page paiement
      router.push(`/dashboard/paiement?${params.toString()}`);

    } catch (err) {
      console.error(err);
      toast('❌ Erreur lors de la préparation du boost', 'error');
    }
  }

  // ─── Ouvrir le modal boost + sélectionner plateformes connectées par défaut
  function ouvrirBoost(produit) {
    // Sélectionner automatiquement les plateformes connectées au démarrage
    const connectees = Object.entries(metaStatus)
      .filter(([key, val]) => val && PLATFORM_PRICES[key])
      .map(([key]) => key);
    setBoostPlateformes(connectees);
    setBoostProduct(produit);
  }

  function togglePlateforme(key) {
    if (!metaStatus[key]) return; // pas connectée → ignorer
    setBoostPlateformes(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  // ─── Autres handlers
  function handlePrefToggle(key) { setPrefs(p => ({ ...p, [key]: !p[key] })); }
  function handlePackCTA(pack) {
    if (pack.id === 'elite') {
      toast('🤝 Un conseiller vous contacte sous 24h', 'success');
    } else {
      toast(`💳 Paiement Mobile Money — Pack ${pack.name} ${pack.price.toLocaleString('fr-FR')} FCFA/mois`, 'info');
    }
  }

  // ─── Analytics config
  const chartConfig = {
    depenses:    { color:'#1877F2', label:'Dépenses Pub (FCFA)', data:CHART_DATA.depenses },
    impressions: { color:'#34C759', label:'Impressions',         data:CHART_DATA.impressions },
    clics:       { color:'#FF9500', label:'Clics',               data:CHART_DATA.clics },
    conversions: { color:'#FF6B00', label:'Conversions',         data:CHART_DATA.conversions },
    revenus:     { color:'#5856D6', label:'Revenus (FCFA)',       data:CHART_DATA.revenus },
  };
  const currentChart = chartConfig[activeTab];

  const topProducts = products.slice(0, 4).map((p, i) => ({
    nom:   p.nom,
    pct:   [92, 78, 63, 47][i] || 40,
    color: ['#1877F2','#34C759','#FF9500','#5856D6'][i],
  }));

  // ─── Définition des plateformes (section Connexions)
  const META_ITEMS = [
    {
      key: 'facebook',
      icon: <img src="https://cdn.simpleicons.org/facebook/1877F2" alt="Facebook" width={22} height={22} style={{ display:'block' }} />,
      name: 'Facebook', bg: 'rgba(24,119,242,.1)', btnColor: '#1877F2',
    },
    {
      key: 'instagram',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <defs>
            <radialGradient id="ig-rg1" cx="30%" cy="107%" r="150%">
              <stop offset="0%"  stopColor="#fdf497"/>
              <stop offset="5%"  stopColor="#fdf497"/>
              <stop offset="45%" stopColor="#fd5949"/>
              <stop offset="60%" stopColor="#d6249f"/>
              <stop offset="90%" stopColor="#285AEB"/>
            </radialGradient>
          </defs>
          <path fill="url(#ig-rg1)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      name: 'Instagram', bg: 'rgba(225,48,108,.1)', btnColor: '#d6249f',
    },
    {
      key: 'business',
      icon: <img src="https://cdn.simpleicons.org/meta/0081FB" alt="Meta" width={22} height={22} style={{ display:'block' }} />,
      name: 'Business Manager', bg: 'rgba(0,129,251,.1)', btnColor: '#0081FB',
    },
    {
      key: 'adaccount',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#0081FB"/>
          <path d="M7 16l2.5-6 2.5 4 2-3 2.5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      name: 'Ad Account', bg: 'rgba(0,129,251,.08)', btnColor: '#0081FB',
    },
    {
      key: 'pixel',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24">
          <rect width="24" height="24" rx="6" fill="#FF6B00"/>
          <rect x="6"  y="6"  width="5" height="5" rx="1" fill="white"/>
          <rect x="13" y="6"  width="5" height="5" rx="1" fill="white" opacity=".6"/>
          <rect x="6"  y="13" width="5" height="5" rx="1" fill="white" opacity=".6"/>
          <rect x="13" y="13" width="5" height="5" rx="1" fill="white"/>
        </svg>
      ),
      name: 'Meta Pixel', bg: 'rgba(255,107,0,.1)', btnColor: '#FF6B00',
    },
    {
      key: 'whatsapp',
      icon: <img src="https://cdn.simpleicons.org/whatsapp/25D366" alt="WhatsApp" width={22} height={22} style={{ display:'block' }} />,
      name: 'WhatsApp Business', bg: 'rgba(37,211,102,.1)', btnColor: '#25D366',
    },
    {
      key: 'youtube',
      icon: <img src="https://cdn.simpleicons.org/youtube/FF0000" alt="YouTube" width={22} height={22} style={{ display:'block' }} />,
      name: 'YouTube Ads', bg: 'rgba(255,0,0,.1)', btnColor: '#FF0000',
    },
    {
      key: 'tiktok',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="black">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.5a8.18 8.18 0 004.78 1.52V6.56a4.85 4.85 0 01-1.01.13z"/>
        </svg>
      ),
      name: 'TikTok Ads', bg: 'rgba(0,0,0,.06)', btnColor: '#010101',
    },
  ];

  // ─── Plateformes disponibles dans le modal boost (celles qui ont un tarif)
  const BOOST_PLATFORMS = [
    { key:'facebook',  label:'Facebook',  emoji:'📘', prix: PLATFORM_PRICES.facebook  },
    { key:'instagram', label:'Instagram', emoji:'📸', prix: PLATFORM_PRICES.instagram },
    { key:'whatsapp',  label:'WhatsApp',  emoji:'💬', prix: PLATFORM_PRICES.whatsapp  },
    { key:'tiktok',    label:'TikTok',    emoji:'🎵', prix: PLATFORM_PRICES.tiktok    },
    { key:'youtube',   label:'YouTube',   emoji:'▶️', prix: PLATFORM_PRICES.youtube   },
  ];

  if (!user) return null;

  const showSection = (key) => !isMobile || activeSection === key;
  const activeSectionLabel = MOBILE_NAV_SECTIONS.find(s => s.key === activeSection)?.label?.replace('\n',' ') || '';

  // Nombre de plateformes connectées
  const nbConnectees = Object.entries(metaStatus).filter(([k, v]) => v && PLATFORM_PRICES[k]).length;

  return (
    <>
      <div className="mkt-page">

        {/* ── Barre aide + ticker ── */}
        <HelpCenter />

        {/* ══════════════════════════════════════
            1. HERO
        ══════════════════════════════════════ */}
        {(!isMobile || !activeSection) && (
          <div className="mkt-hero">
            <div className="mkt-hero-grid">
              <div>
                <h1 className="mkt-hero-title">ODA Marketing Center 🚀</h1>
                <p className="mkt-hero-sub">
                  Boostez vos ventes partout au Cameroun — Facebook, Instagram, WhatsApp, TikTok &amp; ODA SmartBoost™
                  {nbConnectees > 0 && (
                    <span style={{ marginLeft:8, background:'rgba(52,199,89,.2)', color:'#4ade80', padding:'2px 8px', borderRadius:20, fontSize:'.75rem', fontWeight:700 }}>
                      ✓ {nbConnectees} plateforme{nbConnectees > 1 ? 's' : ''} connectée{nbConnectees > 1 ? 's' : ''}
                    </span>
                  )}
                </p>
                <div className="mkt-hero-btns">
                  <button
                    className="mkt-btn-meta"
                    onClick={() => {
                      if (isMobile) {
                        setActiveSection('connexions');
                      } else {
                        handleMetaConnect('facebook');
                      }
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    {metaStatus.facebook ? '✓ Meta connecté' : 'Se connecter Meta'}
                  </button>
                  <button className="mkt-btn-create" onClick={() => router.push('/dashboard/campagnes/new')}>
                    ✏️ Créer une campagne
                  </button>
                  <button
                    className="mkt-btn-sb"
                    onClick={() => {
                      if (isMobile) {
                        setActiveSection('produits');
                      } else {
                        if (products.length > 0) ouvrirBoost(products[0]);
                      }
                    }}
                  >
                    ⚡ Booster un produit
                  </button>
                </div>
              </div>
            </div>
            {!isMobile && (
              <div className="mkt-kpi-grid">
                {[
                  { label:'Dépenses pub',  value:'156 200 F', delta:'+18%', up:true, icon:'💸' },
                  { label:'Impressions',   value:'67 500',    delta:'+32%', up:true, icon:'👁️' },
                  { label:'Clics',         value:'1 560',     delta:'+24%', up:true, icon:'👆' },
                  { label:'Conversions',   value:'71',        delta:'+45%', up:true, icon:'🎯' },
                  { label:'Revenus',       value:'680 000 F', delta:'+28%', up:true, icon:'💰' },
                ].map(k => (
                  <div className="mkt-kpi-card" key={k.label}>
                    <div className="mkt-kpi-label">{k.icon} {k.label}</div>
                    <div className="mkt-kpi-value">{k.value}</div>
                    <div className={`mkt-kpi-delta ${k.up ? 'mkt-kpi-up' : 'mkt-kpi-down'}`}>
                      {k.up ? '↑' : '↓'} {k.delta} ce mois
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Navigation mobile ── */}
        {isMobile && !activeSection && (
          <div className="mkt-mobile-nav">
            {MOBILE_NAV_SECTIONS.map(section => (
              <button key={section.key} className="mkt-mobile-nav-btn"
                style={{ borderColor: section.accent + '40' }}
                onClick={() => setActiveSection(section.key)}
              >
                <div className="mkt-mobile-nav-icon" style={{
                  background:section.color, borderRadius:14, width:52, height:52,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem',
                }}>
                  {section.icon}
                </div>
                <div className="mkt-mobile-nav-label">{section.label}</div>
              </button>
            ))}
          </div>
        )}

        {/* ── Bouton retour mobile ── */}
        {isMobile && activeSection && (
          <button className="mkt-mobile-back" onClick={() => setActiveSection(null)}>
            <span className="mkt-mobile-back-arrow">←</span>
            Retour
          </button>
        )}

        {/* ══════════════════════════════════════
            2. CONNEXIONS PLATEFORMES
        ══════════════════════════════════════ */}
        {showSection('connexions') && (
          <div className="mkt-section">
            <div className="mkt-section-head">
              <div className="mkt-section-title">
                <span style={{ background:'rgba(24,119,242,.1)', borderRadius:8, padding:'4px 8px' }}>📡</span>
                Connexions Plateformes
              </div>
              <button className="mkt-section-link">Tout gérer →</button>
            </div>
            {/* Bandeau info Meta */}
            <div style={{ background:'rgba(24,119,242,.06)', border:'1px solid rgba(24,119,242,.15)', borderRadius:12, padding:'12px 16px', marginBottom:14, fontSize:'.8rem', color:'#1877F2', fontWeight:500 }}>
              💡 Connecter Facebook active automatiquement : Instagram, Business Manager, Ad Account et Meta Pixel en un seul clic.
            </div>
            <div className="mkt-card">
              <div className="mkt-meta-grid">
                {META_ITEMS.map(item => {
                  const connected = metaStatus[item.key] ?? false;
                  return (
                    <div className="mkt-meta-item" key={item.key}>
                      <div className="mkt-meta-icon" style={{ background:item.bg }}>{item.icon}</div>
                      <div className="mkt-meta-name">{item.name}</div>
                      {PLATFORM_PRICES[item.key] && (
                        <div style={{ fontSize:'.65rem', color:'var(--text-2)', fontWeight:600 }}>
                          {PLATFORM_PRICES[item.key].toLocaleString('fr-FR')} F/jour
                        </div>
                      )}
                      <div className={`mkt-meta-status ${connected ? 'mkt-status-connected' : 'mkt-status-disconnected'}`}>
                        <span style={{ fontSize:'.55rem' }}>{connected ? '●' : '○'}</span>
                        {connected ? 'Connecté' : 'Non connecté'}
                      </div>
                      <button
                        className="mkt-meta-connect-btn"
                        style={{
                          background: connected ? '#F2F2F7' : (item.btnColor || '#1877F2'),
                          color:      connected ? '#8E8E93' : 'white',
                          boxShadow:  connected ? 'none'    : `0 3px 10px ${item.btnColor || '#1877F2'}44`,
                        }}
                        onClick={() => handleMetaConnect(item.key)}
                      >
                        {connected ? 'Gérer' : 'Connecter'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            3. PRODUITS BOOSTABLES
        ══════════════════════════════════════ */}
        {showSection('produits') && (
          <div className="mkt-section">
            <div className="mkt-section-head">
              <div className="mkt-section-title">
                <span style={{ background:'rgba(255,107,0,.1)', borderRadius:8, padding:'4px 8px' }}>⚡</span>
                Produits Boostables
                {!loadingProducts && products.length > 0 && (
                  <span style={{ fontSize:'.72rem', background:'rgba(52,199,89,.1)', color:'#34C759', padding:'2px 8px', borderRadius:20, fontWeight:600 }}>
                    {products.length} publiés
                  </span>
                )}
              </div>
              <button className="mkt-section-link" onClick={() => router.push('/dashboard/produits')}>
                Tous les produits →
              </button>
            </div>
            <div className="mkt-products-grid">
              {loadingProducts ? (
                <ProductSkeleton />
              ) : products.length === 0 ? (
                <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'40px 20px',
                  background:'var(--card-bg)', borderRadius:16, border:'.5px solid var(--border)' }}>
                  <div style={{ fontSize:'3rem', marginBottom:12 }}>📦</div>
                  <div style={{ fontWeight:700, marginBottom:8 }}>Aucun produit publié</div>
                  <div style={{ color:'var(--text-2)', fontSize:'.85rem', marginBottom:16 }}>
                    Ajoutez des produits à votre catalogue pour pouvoir les booster
                  </div>
                  <button
                    style={{ padding:'10px 20px', background:'linear-gradient(135deg,#FF6B00,#FF9500)', color:'white', border:'none', borderRadius:10, fontWeight:700, cursor:'pointer', fontFamily:'Poppins,sans-serif' }}
                    onClick={() => router.push('/dashboard')}
                  >
                    + Ajouter un produit
                  </button>
                </div>
              ) : (
                products.map(p => (
                  <div className="mkt-product-card" key={p.id}>
                    <img
                      src={p.image} alt={p.nom} className="mkt-product-img"
                      onError={e => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23F2F2F7" width="200" height="200"/></svg>'; }}
                    />
                    <div className="mkt-product-body">
                      <div className="mkt-product-name">{p.nom}</div>
                      <div className="mkt-product-price">{p.prix.toLocaleString('fr-FR')} FCFA</div>
                      <div className="mkt-product-meta">
                        <span className="mkt-product-stock">Stock: {p.stock}</span>
                        <span className={`mkt-sync-badge ${p.synced ? 'mkt-sync-ok' : 'mkt-sync-no'}`}>
                          {p.synced ? '✓ Sync' : '⚠ Sync'}
                        </span>
                      </div>
                      <button className="mkt-boost-btn" onClick={() => ouvrirBoost(p)}>
                        🚀 Booster
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            4. PACKS PUBLICITAIRES
        ══════════════════════════════════════ */}
        {showSection('packs') && (
          <div className="mkt-section">
            <div className="mkt-section-head">
              <div className="mkt-section-title">
                <span style={{ background:'rgba(88,86,214,.1)', borderRadius:8, padding:'4px 8px' }}>👑</span>
                Packs Publicitaires
              </div>
              <span style={{ fontSize:'.72rem', color:'var(--text-2)' }}>Paiement Mobile Money · CB</span>
            </div>
            <div className="mkt-packs-grid">
              {PACKS.map(pack => (
                <div key={pack.id} className={`mkt-pack${pack.popular ? ' popular' : ''}`}
                  style={pack.dark ? { background:'linear-gradient(135deg,#0a1628,#1a1035)', color:'white', border:'2px solid rgba(255,255,255,.1)' } : {}}
                >
                  {pack.popular && <div className="mkt-pack-badge">⚡ LE PLUS POPULAIRE</div>}
                  <div className="mkt-pack-icon">{pack.icon}</div>
                  <div className="mkt-pack-name" style={pack.dark ? { color:'white' } : {}}>{pack.name}</div>
                  <div className="mkt-pack-price" style={{ color:pack.color }}>{pack.price.toLocaleString('fr-FR')} F</div>
                  <div className="mkt-pack-period" style={pack.dark ? { color:'rgba(255,255,255,.5)' } : {}}>{pack.period}</div>
                  {pack.features.map(([icon,txt], i) => (
                    <div className="mkt-pack-feature" key={i} style={pack.dark ? { color:'rgba(255,255,255,.85)' } : {}}>
                      <span>{icon}</span>
                      <span style={{ opacity: icon === '❌' ? .45 : 1 }}>{txt}</span>
                    </div>
                  ))}
                  {pack.ctaStyle === 'gold' ? (
                    <button className="mkt-pack-cta" style={{ background:'linear-gradient(135deg,#FFD700,#FF9500)', color:'white', fontWeight:800, marginTop:16, width:'100%', padding:12, border:'none', borderRadius:11, cursor:'pointer', fontFamily:'Poppins,sans-serif', boxShadow:'0 4px 16px rgba(255,215,0,.35)' }}
                      onClick={() => handlePackCTA(pack)}>
                      {pack.ctaLabel}
                    </button>
                  ) : (
                    <button className={`mkt-pack-cta ${pack.ctaStyle}`} onClick={() => handlePackCTA(pack)}>
                      {pack.ctaLabel}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            5. ANALYTICS & PERFORMANCE
        ══════════════════════════════════════ */}
        {showSection('analytics') && (
          <div className="mkt-section">
            <div className="mkt-section-head">
              <div className="mkt-section-title">
                <span style={{ background:'rgba(52,199,89,.1)', borderRadius:8, padding:'4px 8px' }}>📈</span>
                Analytics & Performance
              </div>
              <button className="mkt-section-link">Rapport complet →</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:14 }}>
              <div className="mkt-card">
                <div className="mkt-analytics-tabs">
                  {Object.entries(chartConfig).map(([key, cfg]) => (
                    <button key={key} className={`mkt-analytics-tab${activeTab === key ? ' active' : ''}`} onClick={() => setActiveTab(key)}>
                      {cfg.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
                <div style={{ marginBottom:6 }}>
                  <div style={{ fontSize:'.78rem', fontWeight:700, color:currentChart.color, marginBottom:2 }}>{currentChart.label}</div>
                  <div style={{ fontSize:'1.6rem', fontWeight:800 }}>{currentChart.data[currentChart.data.length-1].toLocaleString('fr-FR')}</div>
                </div>
                <div className="mkt-chart-area"><LineChart data={currentChart.data} color={currentChart.color} /></div>
                <div className="mkt-chart-labels">{MONTHS.map(m => <span key={m}>{m}</span>)}</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:14 }}>
                <div className="mkt-card">
                  <div style={{ fontSize:'.9rem', fontWeight:700, marginBottom:14, display:'flex', justifyContent:'space-between' }}>
                    <span>📊 ROI par canal</span>
                    <span style={{ color:'#34C759', fontSize:'.8rem' }}>Juin 2025</span>
                  </div>
                  {[
                    { label:'Facebook Ads',  pct:86, color:'#1877F2', roi:'+340%' },
                    { label:'Instagram Ads', pct:72, color:'#E1306C', roi:'+285%' },
                    { label:'SmartBoost™',   pct:94, color:'#FF6B00', roi:'+420%' },
                    { label:'ODA Interne',   pct:60, color:'#5856D6', roi:'+210%' },
                  ].map(item => (
                    <div key={item.label} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                        <span style={{ fontSize:'.8rem', fontWeight:600 }}>{item.label}</span>
                        <span style={{ fontSize:'.8rem', fontWeight:700, color:item.color }}>{item.roi}</span>
                      </div>
                      <div style={{ height:8, background:'#F2F2F7', borderRadius:4, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${item.pct}%`, background:item.color, borderRadius:4, transition:'width .6s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mkt-card">
                  <div style={{ fontSize:'.9rem', fontWeight:700, marginBottom:14 }}>🏆 Produits les plus performants</div>
                  {topProducts.length > 0 ? (
                    <div className="mkt-top-products">
                      {topProducts.map((p, i) => (
                        <div className="mkt-top-row" key={p.nom}>
                          <div className="mkt-top-rank" style={{ background:`${p.color}20`, color:p.color }}>{i+1}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:'.8rem', fontWeight:600, marginBottom:5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.nom}</div>
                            <div className="mkt-top-bar-wrap">
                              <div className="mkt-top-bar" style={{ width:`${p.pct}%`, background:p.color }} />
                            </div>
                          </div>
                          <div className="mkt-top-pct" style={{ color:p.color }}>{p.pct}%</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color:'var(--text-2)', fontSize:'.85rem', textAlign:'center', padding:'20px 0' }}>
                      Aucune donnée — lancez votre première campagne
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            6. PRÉFÉRENCES PUBLICITAIRES
        ══════════════════════════════════════ */}
        {showSection('preferences') && (
          <div className="mkt-section">
            <div className="mkt-section-head">
              <div className="mkt-section-title">
                <span style={{ background:'rgba(0,122,255,.1)', borderRadius:8, padding:'4px 8px' }}>⚙️</span>
                Préférences Publicitaires
              </div>
            </div>
            <div className="mkt-card">
              <div className="mkt-prefs-grid">
                <div className="mkt-pref-item">
                  <div>
                    <div className="mkt-pref-label">💸 Budget quotidien max</div>
                    <div className="mkt-pref-sub">Limite de dépense par jour</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <input type="number" value={prefs.budgetJour}
                      onChange={e => setPrefs(p => ({ ...p, budgetJour: parseInt(e.target.value)||0 }))}
                      style={{ width:90, padding:'6px 10px', border:'1.5px solid var(--border)', borderRadius:8, fontFamily:'Poppins,sans-serif', fontSize:'.82rem', textAlign:'right' }}
                    />
                    <span style={{ fontSize:'.72rem', color:'var(--text-2)', flexShrink:0 }}>FCFA</span>
                  </div>
                </div>
                <div className="mkt-pref-item">
                  <div>
                    <div className="mkt-pref-label">📅 Budget mensuel max</div>
                    <div className="mkt-pref-sub">Plafond de dépense par mois</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <input type="number" value={prefs.budgetMois}
                      onChange={e => setPrefs(p => ({ ...p, budgetMois: parseInt(e.target.value)||0 }))}
                      style={{ width:100, padding:'6px 10px', border:'1.5px solid var(--border)', borderRadius:8, fontFamily:'Poppins,sans-serif', fontSize:'.82rem', textAlign:'right' }}
                    />
                    <span style={{ fontSize:'.72rem', color:'var(--text-2)', flexShrink:0 }}>FCFA</span>
                  </div>
                </div>
                <div className="mkt-pref-item" style={{ cursor:'pointer' }} onClick={() => handlePrefToggle('autoBoost')}>
                  <div>
                    <div className="mkt-pref-label">🤖 Auto-Boost</div>
                    <div className="mkt-pref-sub">Booster auto vos top produits</div>
                  </div>
                  <Toggle on={prefs.autoBoost} onToggle={() => handlePrefToggle('autoBoost')} />
                </div>
                <div className="mkt-pref-item" style={{ cursor:'pointer' }} onClick={() => handlePrefToggle('smartBoostAuto')}>
                  <div>
                    <div className="mkt-pref-label">⚡ SmartBoost™ Auto</div>
                    <div className="mkt-pref-sub">Optimisation IA continue (+5%)</div>
                  </div>
                  <Toggle on={prefs.smartBoostAuto} onToggle={() => handlePrefToggle('smartBoostAuto')} />
                </div>
                <div className="mkt-pref-item" style={{ cursor:'pointer' }} onClick={() => handlePrefToggle('notifs')}>
                  <div>
                    <div className="mkt-pref-label">🔔 Notifications</div>
                    <div className="mkt-pref-sub">Alertes performance et ROI</div>
                  </div>
                  <Toggle on={prefs.notifs} onToggle={() => handlePrefToggle('notifs')} />
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', padding:'0 4px' }}>
                  <button
                    style={{ padding:'12px 24px', background:'var(--primary)', color:'white', border:'none', borderRadius:11, fontWeight:700, fontSize:'.85rem', cursor:'pointer', fontFamily:'Poppins,sans-serif', boxShadow:'0 4px 14px rgba(0,122,255,.3)' }}
                    onClick={() => toast('💾 Préférences sauvegardées !', 'success')}
                  >
                    💾 Sauvegarder
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            7. PUBLICITÉ INTERNE ODA
        ══════════════════════════════════════ */}
        {showSection('interne') && (
          <div className="mkt-section">
            <div className="mkt-section-head">
              <div className="mkt-section-title">
                <span style={{ background:'rgba(255,107,0,.1)', borderRadius:8, padding:'4px 8px' }}>🏪</span>
                Publicité Interne ODA Marketplace
              </div>
              <button className="mkt-section-link">Gérer mes emplacements →</button>
            </div>
            <div className="mkt-card" style={{ marginBottom:14 }}>
              <div style={{ fontSize:'.9rem', fontWeight:700, marginBottom:14 }}>📍 Emplacements disponibles</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(1,1fr)', gap:10 }}>
                {[
                  { icon:'🏠', name:"Page d'accueil ODA",    desc:'Bannière principale — 2 000+ visiteurs/jour', prix:'15 000 FCFA/sem', active:true,  badge:'🔥 TOP' },
                  { icon:'🔍', name:'Résultats de recherche', desc:'Apparaître en haut des recherches',           prix:'8 000 FCFA/sem',  active:false, badge:null },
                  { icon:'📦', name:'Pages catégorie',        desc:'Mise en avant par catégorie produit',         prix:'6 000 FCFA/sem',  active:true,  badge:null },
                  { icon:'📱', name:'Notifications push ODA', desc:'Notification directe aux acheteurs',          prix:'12 000 FCFA/sem', active:false, badge:'⚡ NOUVEAU' },
                ].map(slot => (
                  <div key={slot.name} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px', borderRadius:12, border:`1.5px solid ${slot.active ? 'rgba(255,107,0,.35)' : 'var(--border)'}`, background:slot.active ? 'rgba(255,107,0,.04)' : '#FAFAFA' }}>
                    <span style={{ fontSize:'1.4rem', flexShrink:0 }}>{slot.icon}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                        <span style={{ fontWeight:700, fontSize:'.85rem' }}>{slot.name}</span>
                        {slot.badge && (
                          <span style={{ background:slot.badge.includes('NOUVEAU') ? '#5856D6' : '#FF3B30', color:'white', fontSize:'.6rem', fontWeight:700, padding:'2px 6px', borderRadius:6 }}>{slot.badge}</span>
                        )}
                      </div>
                      <div style={{ fontSize:'.75rem', color:'var(--text-2)' }}>{slot.desc}</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:'.75rem', fontWeight:700, color:'var(--primary)', marginBottom:6 }}>{slot.prix}</div>
                      <button
                        style={{ padding:'6px 14px', borderRadius:8, border:'none', background:slot.active ? '#F2F2F7' : '#FF6B00', color:slot.active ? 'var(--text-2)' : 'white', fontWeight:700, fontSize:'.72rem', cursor:'pointer', fontFamily:'Poppins,sans-serif' }}
                        onClick={() => toast(slot.active ? '⏸ Emplacement désactivé' : '✅ Emplacement activé !', slot.active ? 'warning' : 'success')}
                      >
                        {slot.active ? '⏸ Actif' : '▶ Activer'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mkt-card">
              <div style={{ fontSize:'.9rem', fontWeight:700, marginBottom:14 }}>👁 Aperçu — Produits Sponsorisés dans ODA</div>
              {loadingProducts ? (
                <div className="mkt-internal-grid">
                  {[1,2,3,4].map(i => <div key={i} className="mkt-skeleton" style={{ borderRadius:14, aspectRatio:'1' }} />)}
                </div>
              ) : (
                <div className="mkt-internal-grid">
                  {products.slice(0,4).map(p => (
                    <div className="mkt-internal-card" key={p.id}>
                      <div className="mkt-sponsored-badge">SPONSORISÉ</div>
                      <img src={p.image} alt={p.nom} className="mkt-internal-img"
                        onError={e => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23F2F2F7" width="200" height="200"/></svg>'; }} />
                      <div className="mkt-internal-body">
                        <div className="mkt-internal-name">{p.nom}</div>
                        <div className="mkt-internal-price">{p.prix.toLocaleString('fr-FR')} FCFA</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>{/* /mkt-page */}


      {/* ══════════════════════════════════════
          MODAL BOOST — Nouveau formulaire intelligent
      ══════════════════════════════════════ */}
      {boostProduct && (
        <div className="mkt-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setBoostProduct(null); }}>
          <div className="mkt-modal">
            <span className="mkt-modal-handle" />

            {/* Header produit */}
            <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:20 }}>
              <img src={boostProduct.image} alt={boostProduct.nom}
                style={{ width:56, height:56, borderRadius:12, objectFit:'cover', flexShrink:0 }}
                onError={e => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect fill="%23F2F2F7" width="56" height="56"/></svg>'; }}
              />
              <div>
                <div className="mkt-modal-title">⚡ SmartBoost™</div>
                <div className="mkt-modal-sub">{boostProduct.nom} — {boostProduct.prix.toLocaleString('fr-FR')} FCFA</div>
              </div>
            </div>

            {/* ── Sélection des plateformes ── */}
            <div className="mkt-form-group">
              <label className="mkt-form-label">📡 Plateformes de diffusion</label>

              {nbConnectees === 0 && (
                <div className="mkt-no-platform-alert">
                  ⚠️ Aucune plateforme connectée. Connectez au moins une plateforme dans la section "Connexions" pour booster votre produit.
                </div>
              )}

              <div className="mkt-platform-grid">
                {BOOST_PLATFORMS.map(pf => {
                  const connected = metaStatus[pf.key];
                  const selected  = boostPlateformes.includes(pf.key);
                  return (
                    <div
                      key={pf.key}
                      className={`mkt-platform-check${selected ? ' selected' : ''}${!connected ? ' disabled' : ''}`}
                      onClick={() => connected && togglePlateforme(pf.key)}
                    >
                      {connected && <div className="mkt-platform-check-badge">✓</div>}
                      <div className="mkt-platform-check-icon">{pf.emoji}</div>
                      <div className="mkt-platform-check-name">{pf.label}</div>
                      <div className="mkt-platform-check-price">
                        {connected
                          ? `${pf.prix.toLocaleString('fr-FR')} F/j`
                          : 'Non connecté'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {boostPlateformes.length > 0 && (
                <div style={{ fontSize:'.78rem', color:'var(--text-2)', marginTop:4, fontWeight:500 }}>
                  ✅ {boostPlateformes.length} plateforme{boostPlateformes.length > 1 ? 's' : ''} sélectionnée{boostPlateformes.length > 1 ? 's' : ''} — votre produit sera diffusé sur chacune
                </div>
              )}
            </div>

            {/* ── Durée ── */}
            <div className="mkt-form-group">
              <label className="mkt-form-label">📅 Durée de la campagne</label>
              <div className="mkt-budget-pills">
                {[
                  { val:'3',  label:'3 jours' },
                  { val:'7',  label:'7 jours' },
                  { val:'14', label:'14 jours' },
                  { val:'30', label:'30 jours' },
                ].map(d => (
                  <button key={d.val} className={`mkt-pill${boostDuration === d.val ? ' active' : ''}`}
                    onClick={() => setBoostDuration(d.val)}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Audience ── */}
            <div className="mkt-form-group">
              <label className="mkt-form-label">🎯 Audience cible</label>
              <select className="mkt-select" value={boostAudience} onChange={e => setBoostAudience(e.target.value)}>
                <option value="cameroun">🇨🇲 Tout le Cameroun</option>
                <option value="yaounde">📍 Yaoundé seulement</option>
                <option value="douala">📍 Douala seulement</option>
                <option value="yaounde-douala">📍 Yaoundé + Douala</option>
                <option value="bafoussam">📍 Bafoussam seulement</option>
                <option value="custom">✏️ Zone personnalisée</option>
              </select>
            </div>

            {/* ── Objectif ── */}
            <div className="mkt-form-group">
              <label className="mkt-form-label">🏁 Objectif de campagne</label>
              <div className="mkt-budget-pills">
                {[
                  { val:'ventes',    label:'🛒 Ventes' },
                  { val:'trafic',    label:'👁 Trafic' },
                  { val:'whatsapp',  label:'💬 WhatsApp' },
                  { val:'notoriete', label:'📣 Notoriété' },
                ].map(o => (
                  <button key={o.val} className={`mkt-pill${boostObjectif === o.val ? ' active' : ''}`}
                    onClick={() => setBoostObjectif(o.val)}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── SmartBoost Toggle ── */}
            <div className="mkt-sb-toggle" onClick={() => setSmartBoost(v => !v)}>
              <div style={{ fontSize:'1.5rem' }}>⚡</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:'.88rem', color:'#FF6B00' }}>
                  SmartBoost™ — Analyse & optimisation IA continue (+5%)
                </div>
                <div style={{ fontSize:'.75rem', color:'#555', marginTop:2 }}>
                  Rééquilibre le budget entre plateformes toutes les 6h selon les performances
                </div>
              </div>
              <Toggle on={smartBoost} onToggle={() => setSmartBoost(v => !v)} />
            </div>

            {/* ── Récapitulatif financier ── */}
            {boostPlateformes.length > 0 ? (
              <div className="mkt-total-box">
                {/* Détail par plateforme */}
                {boostPlateformes.map(pf => {
                  const plat = BOOST_PLATFORMS.find(p => p.key === pf);
                  const montant = (PLATFORM_PRICES[pf] || 0) * dureeJours;
                  return (
                    <div className="mkt-total-row" key={pf}>
                      <span className="mkt-total-label">{plat?.emoji} {plat?.label} × {dureeJours}j</span>
                      <span className="mkt-total-val">{montant.toLocaleString('fr-FR')} F</span>
                    </div>
                  );
                })}

                <hr className="mkt-total-divider" />

                <div className="mkt-total-row">
                  <span className="mkt-total-label">Budget publicitaire total</span>
                  <span className="mkt-total-val">{budgetBase.toLocaleString('fr-FR')} F</span>
                </div>

                {smartBoost && (
                  <div className="mkt-total-row">
                    <span className="mkt-total-label">⚡ SmartBoost™ IA (+5%)</span>
                    <span className="mkt-total-val" style={{ color:'#FF9500' }}>+{fraisSmartBoost.toLocaleString('fr-FR')} F</span>
                  </div>
                )}

                <hr className="mkt-total-divider" />

                <div className="mkt-total-row" style={{ marginBottom:0 }}>
                  <span style={{ fontWeight:700, fontSize:'.9rem', opacity:.85 }}>Total à payer</span>
                  <span className="mkt-total-final">{totalAPayer.toLocaleString('fr-FR')} FCFA</span>
                </div>

                <div className="mkt-total-note">
                  Paiement sécurisé · Orange Money · MTN · Carte bancaire
                </div>
              </div>
            ) : (
              <div style={{ background:'rgba(142,142,147,.08)', borderRadius:14, padding:'16px', marginBottom:18, textAlign:'center', color:'var(--text-2)', fontSize:'.85rem' }}>
                Sélectionnez au moins une plateforme pour voir le tarif
              </div>
            )}

            {/* ── CTA ── */}
            <button
              className="mkt-modal-cta"
              onClick={handleBoost}
              disabled={boostPlateformes.length === 0 || totalAPayer === 0}
            >
              💳 Payer {totalAPayer > 0 ? `${totalAPayer.toLocaleString('fr-FR')} FCFA` : '—'} et lancer le boost
            </button>
            <button className="mkt-modal-cancel" onClick={() => setBoostProduct(null)}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* ── TOASTS ── */}
      <div className="mkt-toast-stack">
        {toasts.map(t => (
          <div key={t.id} className="mkt-toast" style={{
            borderLeft:`4px solid ${
              t.type === 'success' ? '#34C759' :
              t.type === 'error'   ? '#FF3B30' :
              t.type === 'warning' ? '#FF9500' : '#007AFF'
            }`,
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}