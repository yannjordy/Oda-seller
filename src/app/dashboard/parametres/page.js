'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Icons } from '@/components/icons';

/* ═══════════════════════════════════════════════════════════════
   PALETTE & FONTS
   ═══════════════════════════════════════════════════════════════ */
const FONTS = [
  { label: 'Outfit',        value: 'Outfit',        url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap' },
  { label: 'Sora',          value: 'Sora',          url: 'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap' },
  { label: 'Figtree',       value: 'Figtree',       url: 'https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap' },
  { label: 'Nunito',        value: 'Nunito',        url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap' },
  { label: 'DM Sans',       value: 'DM Sans',       url: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap' },
  { label: 'Plus Jakarta',  value: 'Plus Jakarta Sans', url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap' },
  { label: 'Lexend',        value: 'Lexend',        url: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap' },
  { label: 'Manrope',       value: 'Manrope',       url: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap' },
];

const PALETTES = [
  { name: 'ODA Orange',  primary: '#FF6B00', secondary: '#1D1D1F', accent: '#FF9A3C' },
  { name: 'Indigo',      primary: '#6366F1', secondary: '#1E1B4B', accent: '#818CF8' },
  { name: 'Émeraude',    primary: '#10B981', secondary: '#064E3B', accent: '#34D399' },
  { name: 'Ciel',        primary: '#0EA5E9', secondary: '#0C4A6E', accent: '#38BDF8' },
  { name: 'Rose',        primary: '#F43F5E', secondary: '#4C0519', accent: '#FB7185' },
  { name: 'Violet',      primary: '#8B5CF6', secondary: '#2E1065', accent: '#A78BFA' },
  { name: 'Ambre',       primary: '#F59E0B', secondary: '#451A03', accent: '#FBBF24' },
  { name: 'Ardoise',     primary: '#64748B', secondary: '#0F172A', accent: '#94A3B8' },
  { name: 'Teal',        primary: '#14B8A6', secondary: '#134E4A', accent: '#2DD4BF' },
  { name: 'Cramoisi',    primary: '#E11D48', secondary: '#4C0519', accent: '#FB7185' },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

  /* ── Reset & base ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Animations ── */
  @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
  @keyframes slideIn   { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:none} }
  @keyframes slideOut  { from{opacity:1;transform:none} to{opacity:0;transform:translateX(24px)} }
  @keyframes scaleIn   { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes shimmer   { 0%{background-position:-400% 0} 100%{background-position:400% 0} }
  @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes pageEnter { from{opacity:0;transform:translateX(20px) scale(.985)} to{opacity:1;transform:translateX(0) scale(1)} }
  @keyframes pageExit  { from{opacity:1;transform:translateX(0) scale(1)} to{opacity:0;transform:translateX(-16px) scale(.985)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes odaPopIn  { 0%{opacity:0;transform:translateY(10px) scale(.97)} 60%{opacity:1;transform:translateY(-2px) scale(1.01)} 100%{opacity:1;transform:none} }

  /* ── Variables — alignées sur layout.js ── */
  :root {
    --bg:           #F2F2F7;
    --bg-card:      #FFFFFF;
    --bg-raised:    #EFEFEF;
    --bg-hover:     #E5E5EA;
    --border:       #E5E5EA;
    --border-md:    rgba(0,0,0,0.11);
    --text-1:       #000000;
    --text-2:       #8E8E93;
    --text-3:       #C7C7CC;
    --accent:       #FF6B00;
    --accent-dim:   rgba(255,107,0,0.09);
    --accent-glow:  rgba(255,107,0,0.22);
    --primary:      #007AFF;
    --primary-dim:  rgba(0,122,255,0.10);
    --secondary:    #5856D6;
    --green:        #34C759;
    --green-dim:    rgba(52,199,89,0.10);
    --red:          #FF3B30;
    --red-dim:      rgba(255,59,48,0.09);
    --yellow:       #FF9500;
    --yellow-dim:   rgba(255,149,0,0.10);
    --radius-sm:    10px;
    --radius-md:    14px;
    --radius-lg:    20px;
    --radius-xl:    28px;
    --shadow-sm:    0 1px 3px rgba(0,0,0,.08);
    --shadow-md:    0 4px 12px rgba(0,0,0,.10);
    --shadow-lg:    0 8px 24px rgba(0,0,0,.12);
    --ease:         cubic-bezier(.4,0,.2,1);
    --spring:       cubic-bezier(.34,1.56,.64,1);
    --transition:   .18s cubic-bezier(.4,0,.2,1);
    --font:         'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  /* ── Layout ── */
  .p-wrap {
    display: grid;
    grid-template-columns: 260px 1fr;
    min-height: 100vh;
    background: var(--bg);
    font-family: var(--font);
    color: var(--text-1);
  }
  @media(max-width:1024px){ .p-wrap{grid-template-columns:1fr} }

  /* ════════════════════════════════
     SIDEBAR — style layout.js
  ════════════════════════════════ */
  .p-side {
    background: #FAFAFA;
    border-right: .5px solid rgba(0,0,0,.08);
    padding: 0;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    scrollbar-width: none;
  }
  .p-side::-webkit-scrollbar { display: none; }
  @media(max-width:1024px){ .p-side{display:none} }

  /* Hero brand */
  .p-side-brand {
    background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    padding: 28px 16px 22px;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }
  .p-side-brand::before {
    content: '';
    position: absolute; top: -30px; right: -30px;
    width: 100px; height: 100px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,122,255,.28) 0%, transparent 70%);
  }
  .p-side-brand::after {
    content: '';
    position: absolute; bottom: -20px; left: -14px;
    width: 70px; height: 70px; border-radius: 50%;
    background: radial-gradient(circle, rgba(88,86,214,.2) 0%, transparent 70%);
  }
  .p-side-logo {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: 10px;
  }
  .p-side-logo-icon {
    width: 36px; height: 36px;
    background: white; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem;
    box-shadow: 0 4px 10px rgba(0,0,0,.2);
    flex-shrink: 0;
  }
  .p-side-logo-text {
    font-size: 1rem; font-weight: 700; color: white; letter-spacing: -.2px;
  }
  .p-side-logo-sub {
    font-size: .66rem; color: rgba(255,255,255,.48); font-weight: 400; margin-top: 1px;
  }

  .p-nav-section {
    padding: 14px 16px 5px;
    font-size: .65rem;
    font-weight: 600;
    letter-spacing: .8px;
    text-transform: uppercase;
    color: var(--text-2);
  }

  .p-nav-btn {
    display: flex;
    align-items: center;
    gap: 11px;
    width: 100%;
    padding: 9px 11px;
    margin: 1px 0;
    border: none;
    background: none;
    cursor: pointer;
    text-align: left;
    font-size: .88rem;
    font-weight: 500;
    color: #1C1C1E;
    border-radius: 11px;
    transition: background .18s var(--ease), transform .18s var(--spring), color .18s;
    font-family: var(--font);
    position: relative;
    min-height: 46px;
    -webkit-tap-highlight-color: transparent;
  }
  .p-nav-btn:hover  { background: rgba(0,0,0,.05); }
  .p-nav-btn:active { transform: scale(.96); }
  .p-nav-btn.active {
    background: var(--primary-dim);
    color: var(--primary);
    font-weight: 600;
  }
  .p-nav-ico {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 9px;
    background: #EFEFEF;
    font-size: .95rem;
    flex-shrink: 0;
    transition: background var(--transition), box-shadow var(--transition), transform .2s var(--spring);
  }
  .p-nav-btn.active .p-nav-ico {
    background: var(--primary);
    box-shadow: 0 4px 10px rgba(0,122,255,.32);
    color: #fff;
  }
  .p-nav-btn:active .p-nav-ico { transform: scale(.9); }
  .p-nav-chevron {
    margin-left: auto; color: #C7C7CC; font-size: .72rem; flex-shrink: 0;
    transition: transform .2s var(--spring), color .18s;
  }
  .p-nav-btn.active .p-nav-chevron { color: var(--primary); transform: translateX(2px); }

  .p-side-footer {
    margin-top: auto;
    padding: 14px 16px;
    border-top: .5px solid var(--border);
  }
  .p-side-footer-tag {
    font-size: .68rem;
    color: var(--text-3);
    text-align: center;
    letter-spacing: .04em;
  }

  /* ════════════════════════════════
     MAIN
  ════════════════════════════════ */
  /* ════════════════════════════════
     MAIN ENTRANCE
  ════════════════════════════════ */
  .p-main {
    background: var(--bg);
    padding: 40px 48px;
    max-width: 900px;
    animation: pageEnter .3s cubic-bezier(.22,1,.36,1) both;
  }
  @media(max-width:768px){ .p-main{padding:24px 16px} }

  /* ── Page header ── */
  .p-head {
    margin-bottom: 32px;
    animation: fadeUp .35s ease;
  }
  .p-head-eyebrow {
    font-size: .7rem;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .p-head h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-1);
    line-height: 1.2;
    margin-bottom: 6px;
    letter-spacing: -.02em;
  }
  .p-head p { font-size: .9rem; color: var(--text-2); }

  /* ── Divider ── */
  .p-divider { height:1px; background:var(--border); margin:24px 0; }

  /* ════════════════════════════════
     CARD
  ════════════════════════════════ */
  .p-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px;
    margin-bottom: 16px;
    animation: fadeUp .35s ease;
    transition: border-color var(--transition), box-shadow var(--transition);
    box-shadow: var(--shadow-sm);
  }
  .p-card:hover { border-color: var(--border-md); box-shadow: var(--shadow-md); }

  .p-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .p-card-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-1);
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .p-card-title-icon {
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    background: var(--bg-raised);
    border-radius: 7px;
    font-size: .85rem;
  }
  .p-card-desc { font-size: .8125rem; color: var(--text-2); }

  /* ════════════════════════════════
     FORM ELEMENTS
  ════════════════════════════════ */
  .p-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media(max-width:600px){ .p-grid{grid-template-columns:1fr} }

  .p-field { display:flex; flex-direction:column; gap:6px; }

  .p-lbl {
    font-size: .8125rem;
    font-weight: 500;
    color: var(--text-2);
    letter-spacing: .01em;
  }

  .p-inp, .p-ta, .p-sel {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--border-md);
    border-radius: var(--radius-sm);
    font-size: .875rem;
    color: var(--text-1);
    background: #FFFFFF;
    outline: none;
    transition: border var(--transition), box-shadow var(--transition), background var(--transition);
    font-family: var(--font);
  }
  .p-inp::placeholder, .p-ta::placeholder { color: var(--text-3); }
  .p-inp:hover, .p-ta:hover, .p-sel:hover { border-color: rgba(0,0,0,.18); background: #FAFAFA; }
  .p-inp:focus, .p-ta:focus, .p-sel:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-dim);
    background: #FFFFFF;
  }
  .p-sel option { background: #FFFFFF; color: var(--text-1); }
  .p-ta { resize: vertical; min-height: 90px; }
  .p-hint { font-size: .75rem; color: var(--text-3); }

  /* ════════════════════════════════
     BUTTONS
  ════════════════════════════════ */
  .p-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 10px 20px;
    border-radius: var(--radius-sm);
    font-size: .875rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all var(--transition);
    font-family: var(--font);
    letter-spacing: .01em;
    white-space: nowrap;
  }
  .p-btn:disabled { opacity: .4; cursor: not-allowed; }

  .p-btn-primary {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
    box-shadow: 0 2px 12px var(--accent-glow);
  }
  .p-btn-primary:hover:not(:disabled) {
    background: #ff7d1a;
    box-shadow: 0 4px 20px var(--accent-glow);
    transform: translateY(-1px);
  }
  .p-btn-primary:active:not(:disabled) { transform: none; }

  .p-btn-ghost {
    background: var(--bg-raised);
    color: var(--text-2);
    border-color: var(--border-md);
  }
  .p-btn-ghost:hover:not(:disabled) { background: var(--bg-hover); color: var(--text-1); border-color: rgba(255,255,255,.2); }

  .p-btn-danger {
    background: var(--red-dim);
    color: var(--red);
    border-color: rgba(242,69,61,.25);
  }
  .p-btn-danger:hover:not(:disabled) { background: rgba(242,69,61,.2); }

  .p-btn-success {
    background: var(--green-dim);
    color: var(--green);
    border-color: rgba(29,185,84,.25);
  }
  .p-btn-success:hover:not(:disabled) { background: rgba(29,185,84,.22); }

  .p-btn-sm { padding: 7px 14px; font-size: .8125rem; }
  .p-btn-xs { padding: 5px 10px; font-size: .75rem; border-radius: 6px; }

  .p-btn-group { display:flex; gap:8px; flex-wrap:wrap; }

  /* ════════════════════════════════
     TOGGLE
  ════════════════════════════════ */
  .p-toggle { position:relative; width:44px; height:24px; flex-shrink:0; cursor:pointer; }
  .p-toggle input { opacity:0; width:0; height:0; position:absolute; }
  .p-toggle-track {
    position: absolute;
    inset: 0;
    background: #DDE1EC;
    border: 1px solid rgba(0,0,0,.1);
    border-radius: 24px;
    transition: all .22s ease;
  }
  .p-toggle-track::before {
    content: '';
    position: absolute;
    top: 2px; left: 2px;
    width: 18px; height: 18px;
    background: #FFFFFF;
    border-radius: 50%;
    transition: all .22s cubic-bezier(.4,0,.2,1);
    box-shadow: 0 1px 4px rgba(0,0,0,.18);
  }
  .p-toggle input:checked + .p-toggle-track {
    background: var(--accent);
    border-color: var(--accent);
  }
  .p-toggle input:checked + .p-toggle-track::before {
    transform: translateX(20px);
    background: #fff;
  }

  /* ════════════════════════════════
     ROW SETTING
  ════════════════════════════════ */
  .p-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid var(--border);
  }
  .p-row:last-child { border-bottom:none; padding-bottom:0; }
  .p-row:first-child { padding-top:0; }
  .p-row-info { flex:1; }
  .p-row-title { font-size:.875rem; font-weight:500; color:var(--text-1); }
  .p-row-desc  { font-size:.8rem; color:var(--text-2); margin-top:3px; line-height:1.4; }

  /* ════════════════════════════════
     SLUG BOX
  ════════════════════════════════ */
  .p-slug-box {
    background: var(--green-dim);
    border: 1px solid rgba(29,185,84,.2);
    border-radius: var(--radius-md);
    padding: 18px 20px;
    margin-bottom: 20px;
  }
  .p-slug-status { margin-top:8px; font-size:.8125rem; font-weight:600; }
  .p-slug-status.ok   { color:var(--green); }
  .p-slug-status.fail { color:var(--red); }

  .p-slug-handle {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-1);
    letter-spacing: -.01em;
    margin-bottom: 14px;
  }
  .p-slug-handle span { color:var(--accent); }

  /* ════════════════════════════════
     PALETTE DROPDOWN
  ════════════════════════════════ */
  .p-palette-dropdown {
    position: relative;
    margin-bottom: 20px;
  }
  .p-palette-trigger {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px 16px;
    background: #FFFFFF;
    border: 1.5px solid var(--border-md);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition);
    font-family: var(--font);
    font-size: .875rem;
    font-weight: 500;
    color: var(--text-1);
  }
  .p-palette-trigger:hover { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-dim); }
  .p-palette-trigger .p-pt-swatches { display:flex; gap:4px; }
  .p-palette-trigger .p-pt-swatch { width:16px; height:16px; border-radius:5px; box-shadow:0 1px 3px rgba(0,0,0,.18); }
  .p-palette-trigger .p-pt-name { flex:1; text-align:left; }
  .p-palette-trigger .p-pt-arrow { color:var(--text-3); font-size:.75rem; transition:transform var(--transition); }
  .p-palette-dropdown.open .p-pt-arrow { transform:rotate(180deg); }

  .p-palette-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0; right: 0;
    background: #FFFFFF;
    border: 1.5px solid var(--border-md);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    z-index: 100;
    overflow: hidden;
    animation: scaleIn .18s ease;
    transform-origin: top center;
  }
  .p-palette-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 16px;
    cursor: pointer;
    transition: background var(--transition);
    font-size: .875rem;
    font-weight: 500;
    color: var(--text-1);
  }
  .p-palette-option:hover { background: var(--bg-raised); }
  .p-palette-option.active { background: var(--accent-dim); color:var(--accent); }
  .p-palette-option .p-po-swatches { display:flex; gap:4px; }
  .p-palette-option .p-po-swatch { width:14px; height:14px; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,.18); }
  .p-palette-option .p-po-check { margin-left:auto; font-size:.8rem; color:var(--accent); }

  /* ════════════════════════════════
     FONT DROPDOWN
  ════════════════════════════════ */
  .p-font-dropdown { position:relative; }
  .p-font-trigger {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px 16px;
    background: #FFFFFF;
    border: 1.5px solid var(--border-md);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition);
    font-family: var(--font);
    font-size: .875rem;
    font-weight: 500;
    color: var(--text-1);
  }
  .p-font-trigger:hover { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-dim); }
  .p-font-trigger .p-ft-preview { font-size:1rem; font-weight:700; flex:1; text-align:left; }
  .p-font-trigger .p-ft-name { font-size:.8rem; color:var(--text-2); }
  .p-font-trigger .p-ft-arrow { color:var(--text-3); font-size:.75rem; transition:transform var(--transition); }
  .p-font-dropdown.open .p-ft-arrow { transform:rotate(180deg); }

  .p-font-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0; right: 0;
    background: #FFFFFF;
    border: 1.5px solid var(--border-md);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    z-index: 100;
    overflow: hidden;
    animation: scaleIn .18s ease;
    transform-origin: top center;
    max-height: 280px;
    overflow-y: auto;
  }
  .p-font-menu::-webkit-scrollbar { width:4px; }
  .p-font-menu::-webkit-scrollbar-track { background:transparent; }
  .p-font-menu::-webkit-scrollbar-thumb { background:var(--border-md); border-radius:4px; }
  .p-font-option {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background var(--transition);
    border-bottom: 1px solid var(--border);
  }
  .p-font-option:last-child { border-bottom:none; }
  .p-font-option:hover { background: var(--bg-raised); }
  .p-font-option.active { background: var(--accent-dim); }
  .p-font-option .p-fo-preview { font-size:1.1rem; font-weight:700; color:var(--text-1); flex:1; }
  .p-font-option.active .p-fo-preview { color:var(--accent); }
  .p-font-option .p-fo-name { font-size:.75rem; color:var(--text-2); }
  .p-font-option .p-fo-check { font-size:.8rem; color:var(--accent); }

  /* ════════════════════════════════
     UPLOAD ZONE
  ════════════════════════════════ */
  .p-upload-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .p-upload {
    border: 1.5px dashed var(--border-md);
    border-radius: var(--radius-sm);
    padding: 14px 10px;
    text-align: center;
    cursor: pointer;
    transition: all var(--transition);
    background: #F8F9FD;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-height: 72px;
  }
  .p-upload:hover { border-color:var(--accent); background:var(--accent-dim); }
  .p-upload.has-img { border-style:solid; border-color:rgba(29,185,84,.3); background:var(--green-dim); }
  .p-upload-img { max-width:100%; max-height:38px; border-radius:6px; }
  .p-upload-icon { font-size:1.1rem; opacity:.7; }
  .p-upload-label { font-size:.72rem; color:var(--text-2); font-weight:500; line-height:1.3; }

  /* ════════════════════════════════
     ZONE ROW (LIVRAISON)
  ════════════════════════════════ */
  .p-zone {
    display: grid;
    grid-template-columns: 1fr 1fr 36px;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
  }
  @media(max-width:600px){ .p-zone{grid-template-columns:1fr 1fr 36px} }

  .p-zone-del {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px;
    border: none; border-radius: 10px;
    background: var(--red-dim);
    color: var(--red);
    cursor: pointer;
    flex-shrink: 0;
    transition: background .18s var(--ease), transform .18s var(--spring), box-shadow .18s;
  }
  .p-zone-del:hover {
    background: rgba(255,59,48,.18);
    box-shadow: 0 2px 8px rgba(255,59,48,.22);
    transform: scale(1.08);
  }
  .p-zone-del:active { transform: scale(.92); }

  /* ════════════════════════════════
     PAYMENT PROVIDER BLOCKS
  ════════════════════════════════ */
  .p-provider-block {
    background: #F8F9FD;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 16px;
    margin-bottom: 12px;
    transition: border-color var(--transition);
  }
  .p-provider-block:hover { border-color:var(--border-md); }
  .p-provider-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .p-provider-label {
    font-size: .875rem;
    font-weight: 600;
    color: var(--text-1);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .p-provider-badge {
    font-size: .65rem;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 20px;
  }
  .p-badge-mtn    { background:#fffbeb; color:#92400e; }
  .p-badge-orange { background:#fff7ed; color:#9a3412; }

  /* ════════════════════════════════
     COLOR PICKER ROW
  ════════════════════════════════ */
  .p-color-row { display:flex; gap:10px; align-items:center; }
  .p-color-swatch {
    width: 38px; height: 38px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-md);
    cursor: pointer;
    overflow: hidden;
    flex-shrink: 0;
    transition: transform var(--transition);
  }
  .p-color-swatch:hover { transform:scale(1.08); }
  .p-color-swatch input[type=color] {
    width: 150%;
    height: 150%;
    margin: -25%;
    border: none;
    padding: 0;
    cursor: pointer;
    background: none;
  }

  /* ════════════════════════════════
     TOAST
  ════════════════════════════════ */
  .p-toast {
    position: fixed;
    top: 24px; right: 24px;
    z-index: 10000;
    background: #FFFFFF;
    border: 1px solid var(--border-md);
    border-radius: var(--radius-md);
    padding: 14px 20px;
    box-shadow: var(--shadow-md);
    font-size: .875rem;
    font-weight: 500;
    color: var(--text-1);
    animation: slideIn .3s cubic-bezier(.4,0,.2,1);
    cursor: pointer;
    max-width: 360px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Outfit', sans-serif;
  }
  .p-toast::before {
    content: '';
    display: block;
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    background: #64748B;
  }
  .p-toast.success::before { background:var(--green); box-shadow:0 0 8px rgba(29,185,84,.5); }
  .p-toast.error::before   { background:var(--red);   box-shadow:0 0 8px rgba(242,69,61,.5); }
  .p-toast.warning::before { background:var(--yellow); box-shadow:0 0 8px rgba(245,166,35,.5); }

  /* ════════════════════════════════
     MOBILE BAR — floating pill
  ════════════════════════════════ */
  .p-mob {
    position: fixed;
    bottom: calc(20px + env(safe-area-inset-bottom));
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255,255,255,0.96);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1.5px solid rgba(255,255,255,0.85);
    border-radius: 36px;
    display: none;
    z-index: 9999;
    padding: 8px 10px;
    overflow-x: auto;
    gap: 2px;
    box-shadow: 0 8px 40px rgba(0,0,0,.13), 0 2px 10px rgba(0,0,0,.07), 0 0 0 1px rgba(0,0,0,.04);
    width: max-content;
    max-width: calc(100vw - 32px);
  }
  .p-mob::-webkit-scrollbar { display:none; }
  @media(max-width:1024px){ .p-mob{display:flex} body{padding-bottom:100px} }

  .p-mob-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px 14px;
    border-radius: 28px;
    color: var(--text-3);
    font-size: .6rem;
    font-weight: 600;
    letter-spacing: .03em;
    min-width: 54px;
    flex-shrink: 0;
    transition: all .26s cubic-bezier(.4,0,.2,1);
    font-family: var(--font);
    position: relative;
  }
  .p-mob-btn:hover { color:var(--text-2); background:var(--bg-raised); }
  .p-mob-btn.active {
    color: var(--accent);
    background: var(--accent-dim);
    border-radius: 24px;
  }
  .p-mob-btn .p-mob-ico {
    font-size: 1.2rem;
    transition: transform .26s cubic-bezier(.34,1.56,.64,1);
  }
  .p-mob-btn.active .p-mob-ico { transform: scale(1.22) translateY(-1px); }

  /* ════════════════════════════════
     PREVIEW MODAL
  ════════════════════════════════ */
  .p-modal-bg {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 9998;
    background: rgba(0,0,0,.75);
    align-items: center;
    justify-content: center;
    padding: 20px;
    backdrop-filter: blur(4px);
  }
  .p-modal-bg.open { display:flex; animation:scaleIn .25s ease; }
  .p-modal-box {
    background: #FFFFFF;
    border: 1px solid var(--border-md);
    border-radius: var(--radius-lg);
    width: 100%;
    max-width: 440px;
    height: 82vh;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
  }
  .p-modal-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: #F5F6FA;
    border-bottom: 1px solid var(--border);
  }
  .p-modal-dots { display:flex; gap:6px; }
  .p-modal-dots i { width:11px; height:11px; border-radius:50%; }
  .p-modal-url {
    flex: 1;
    background: #FFFFFF;
    border: 1px solid var(--border-md);
    border-radius: 20px;
    padding: 5px 14px;
    font-size: .72rem;
    color: var(--text-2);
    font-family: 'SF Mono','Fira Code',monospace;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .p-modal-iframe { flex:1; border:none; }

  /* ════════════════════════════════
     DROPDOWN PORTAL MODAL
  ════════════════════════════════ */
  .p-dd-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9990;
    background: rgba(15,17,23,0.18);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    animation: fadeIn .18s ease;
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }

  .p-dd-portal {
    position: fixed;
    z-index: 9995;
    background: #FFFFFF;
    border: 1.5px solid var(--border-md);
    border-radius: var(--radius-md);
    box-shadow: 0 24px 60px rgba(0,0,0,.22), 0 4px 16px rgba(0,0,0,.10);
    animation: scaleIn .18s cubic-bezier(.22,1,.36,1);
    transform-origin: top center;
    overflow: hidden;
  }
  .p-dd-portal-scroll {
    max-height: 300px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--border-md) transparent;
  }
  .p-dd-portal-scroll::-webkit-scrollbar { width: 4px; }
  .p-dd-portal-scroll::-webkit-scrollbar-thumb { background: var(--border-md); border-radius: 4px; }


  .p-section-anim {
    animation: pageEnter .34s cubic-bezier(.22,1,.36,1);
    will-change: opacity, transform;
  }
  .p-section-anim > * {
    animation: fadeUp .38s cubic-bezier(.22,1,.36,1) both;
  }
  .p-section-anim > *:nth-child(1) { animation-delay: .04s; }
  .p-section-anim > *:nth-child(2) { animation-delay: .08s; }
  .p-section-anim > *:nth-child(3) { animation-delay: .12s; }
  .p-section-anim > *:nth-child(4) { animation-delay: .16s; }

  /* ── LOADING ── */
  .p-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: var(--bg);
    font-family: var(--font);
    color: var(--text-2);
    flex-direction: column;
    gap: 16px;
  }
  .p-spin {
    width: 32px; height: 32px;
    border: 2px solid var(--border-md);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin .8s linear infinite;
  }

  /* ════════════════════════════════
     INLINE FORM SPACING UTIL
  ════════════════════════════════ */
  .p-stack { display:flex; flex-direction:column; gap:14px; }
  .p-link { color:var(--accent); font-size:.875rem; font-weight:500; cursor:pointer; text-decoration:none; }
  .p-link:hover { text-decoration:underline; }
`;

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
function injectCSS() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('p-css')) return;
  const s = document.createElement('style'); s.id = 'p-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

function loadFont(name) {
  if (typeof document === 'undefined') return;
  const f = FONTS.find(x => x.value === name);
  if (!f) return;
  const existing = document.getElementById('p-font');
  if (existing) existing.remove();
  const l = document.createElement('link'); l.id = 'p-font'; l.rel = 'stylesheet'; l.href = f.url;
  document.head.appendChild(l);
}

function toast(msg, type = 'info') {
  if (typeof document === 'undefined') return;
  const t = document.createElement('div');
  t.className = `p-toast ${type}`;
  t.textContent = msg;
  t.onclick = () => t.remove();
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'slideOut .3s ease forwards';
    setTimeout(() => t.remove(), 300);
  }, 3200);
}

/* ═══════════════════════════════════════════════════════════════
   DEFAULTS
   ═══════════════════════════════════════════════════════════════ */
const DEFAULTS = {
  general:      { nom:'', description:'', email:'', telephone:'', adresse:'' },
  identifiant:  { slug:'', disponible:false, auto:false },
  paiement: {
    carte:  { actif:false, cle:'', confirme:false },
    mobile: { actif:false, confirme:false, mtn:{actif:false,nomCompte:'',numero:'',confirme:false}, orange:{actif:false,nomCompte:'',numero:'',confirme:false} },
    cash:   { actif:false, confirme:false },
    devise: 'FCFA'
  },
  livraison: { fraisDouala:1000, fraisAutres:2500, delai:'2-5 jours ouvrables', gratuit:false, montantMin:50000, zonesPersonnalisees:[] },
  apparence: { couleurPrimaire:'#FF6B00', couleurSecondaire:'#1D1D1F', accent:'#FF9A3C', logo:'', favicon:'', police:'Outfit' },
  notifications: { commandes:true, stock:true, clients:false, rapports:true }
};

function deepMerge(def, inc) {
  if (!inc || typeof inc !== 'object') return def;
  const r = { ...def };
  for (const k of Object.keys(def)) {
    const d = def[k], i = inc[k];
    if (i === undefined || i === null) { r[k] = d; }
    else if (typeof d === 'object' && !Array.isArray(d)) { r[k] = deepMerge(d, i); }
    else { r[k] = i; }
  }
  return r;
}

function genSlug() { return `oda-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`; }

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   DROPDOWN PORTAL — renders menu at body level to avoid z-index issues
   ═══════════════════════════════════════════════════════════════ */
function DropdownPortal({ triggerRef, open, onClose, children }) {
  const [style, setStyle] = useState({});
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;
    const menuH = 310;
    const above = spaceBelow < menuH && spaceAbove > spaceBelow;
    setStyle({
      left:  r.left,
      width: r.width,
      ...(above
        ? { bottom: window.innerHeight - r.top + 6, top: 'auto' }
        : { top: r.bottom + 6 }
      ),
    });
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div className="p-dd-backdrop" onClick={onClose} />
      <div className="p-dd-portal" style={style}>
        <div className="p-dd-portal-scroll">{children}</div>
      </div>
    </>,
    document.body
  );
}

/* ─── Icône Poubelle SVG ─── */
function TrashIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

function Toggle({ id, checked, onChange }) {
  return (
    <label className="p-toggle">
      <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="p-toggle-track" />
    </label>
  );
}

function UpZone({ value, onFile, icon, label, accept }) {
  const ref = useRef(null);
  const has = !!value;
  function pick(file) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast('Fichier trop lourd (max 2 MB)', 'error'); return; }
    if (!file.type.startsWith('image/')) { toast('Image uniquement', 'error'); return; }
    const r = new FileReader();
    r.onload = e => onFile(e.target.result);
    r.readAsDataURL(file);
  }
  return (
    <div className={`p-upload${has ? ' has-img' : ''}`} onClick={() => ref.current?.click()}>
      {has
        ? (<><img className="p-upload-img" src={value} alt="" /><span style={{ fontSize:'.68rem', color:'var(--green)', fontWeight:600 }}>{Icons.check} Chargé</span></>)
        : (<><span className="p-upload-icon">{icon}</span><span className="p-upload-label">{label}</span><span style={{ fontSize:'.65rem', color:'var(--text-3)' }}>max 2 MB</span></>)
      }
      <input ref={ref} type="file" accept={accept || 'image/*'} hidden onChange={e => pick(e.target.files[0])} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function ParametresPage() {
  const supabase = getSupabase();
  const { user } = useAuth();
  const router = useRouter();

  const [section, setSection] = useState('general');
  const [params, setParams] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [slugIn, setSlugIn] = useState('');
  const [slugSt, setSlugSt] = useState(null);
  const [showSlug, setShowSlug] = useState(false);

  const [pw, setPw] = useState({ new:'', confirm:'' });
  const [pwBusy, setPwBusy] = useState(false);

  const [prevOpen, setPrevOpen] = useState(false);
  const [prevUrl,  setPrevUrl]  = useState('');
  const iframeRef = useRef(null);

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [fontOpen,    setFontOpen]    = useState(false);
  const [animKey,     setAnimKey]     = useState(0);
  const palTriggerRef  = useRef(null);
  const fontTriggerRef = useRef(null);

  // Close dropdowns when changing section
  

  useEffect(() => { injectCSS(); }, []);
  useEffect(() => { if (user) load(); }, [user]);

  /* ── Load ── */
  async function load() {
    try {
      const { data } = await supabase.from('parametres_boutique').select('*').eq('user_id', user.id).single();
      if (data?.config) {
        const m = deepMerge(DEFAULTS, data.config);
        setParams(m); setSlugIn(m.identifiant?.slug || '');
        if (!m.identifiant?.slug) await initSlug(m);
      } else {
        const loc = localStorage.getItem(`p_${user.id}`);
        if (loc) {
          try {
            const p = deepMerge(DEFAULTS, JSON.parse(loc));
            setParams(p); setSlugIn(p.identifiant?.slug || '');
            if (!p.identifiant?.slug) await initSlug(p);
          } catch { await initSlug(DEFAULTS); }
        } else { await initSlug(DEFAULTS); }
      }
    } catch { await initSlug(DEFAULTS); }
    finally { setLoading(false); }
  }

  async function initSlug(base) {
    const s = genSlug();
    const n = deepMerge(DEFAULTS, { ...base, identifiant:{ slug:s, disponible:true, auto:true, dateCreation:new Date().toISOString() } });
    setParams(n); setSlugIn(s); await save(n);
    toast('Identifiant unique généré', 'success');
  }

  /* ── Save ── */
  async function save(p = params) {
    if (!user?.id) return false;
    localStorage.setItem(`p_${user.id}`, JSON.stringify(p));
    localStorage.setItem('parametres_boutique', JSON.stringify(p));
    try {
      const { error } = await supabase.from('parametres_boutique').upsert(
        { user_id:user.id, config:p, updated_at:new Date().toISOString() },
        { onConflict:'user_id' }
      );
      return !error;
    } catch { return false; }
  }

  function up(path, val) {
    setParams(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      const ks = path.split('.');
      let o = n;
      ks.forEach((k, i) => { if (i === ks.length-1) o[k] = val; else o = o[k]; });
      return n;
    });
  }

  /* ── Slug check ── */
  async function checkSlug(s) {
    if (s === params.identifiant?.slug) { setSlugSt({ ok:true, msg:'Identifiant actuel' }); return true; }
    if (s.length < 3) { setSlugSt({ ok:false, msg:'Minimum 3 caractères' }); return false; }
    try {
      const { data } = await supabase.from('parametres_boutique').select('user_id').eq('config->identifiant->>slug', s).neq('user_id', user.id).single();
      const ok = !data;
      setSlugSt({ ok, msg: ok ? <>{Icons.check} Disponible</> : <>{Icons.close} Déjà utilisé</> });
      return ok;
    } catch { return false; }
  }

  async function submitSlug(e) {
    e.preventDefault();
    const s = slugIn.toLowerCase().replace(/[^a-z0-9-]/g,'');
    if (s.length < 3) { toast('Minimum 3 caractères', 'error'); return; }
    if (!(await checkSlug(s))) { toast('Identifiant non disponible', 'error'); return; }
    const n = { ...params, identifiant:{ slug:s, disponible:true, auto:false, dateCreation:params.identifiant?.dateCreation || new Date().toISOString() } };
    setParams(n); setShowSlug(false);
    const ok = await save(n);
    toast(ok ? 'Identifiant sauvegardé' : 'Sauvegardé localement', ok ? 'success' : 'warning');
  }

  /* ── Handlers ── */
  async function saveGeneral(e) {
    e.preventDefault(); setSaving(true);
    const ok = await save(); setSaving(false);
    toast(ok ? 'Modifications enregistrées' : 'Sauvegardé localement', ok ? 'success' : 'warning');
  }

  async function confirmerPaiement(type) { up(`paiement.${type}.confirme`, true); await save(); toast(`Paiement ${type} confirmé`, 'success'); }
  async function confirmerMM() { up('paiement.mobile.confirme', true); up('paiement.mobile.mtn.confirme', true); up('paiement.mobile.orange.confirme', true); await save(); toast('Mobile Money confirmé', 'success'); }

  async function saveShipping(e) { e.preventDefault(); const ok = await save(); toast(ok ? 'Livraison sauvegardée' : 'Sauvegardé localement', ok ? 'success' : 'warning'); }

  function addZone() { up('livraison.zonesPersonnalisees', [...(params.livraison.zonesPersonnalisees||[]), { nom:'', frais:0 }]); }
  function upZone(i, k, v) { const z = [...(params.livraison.zonesPersonnalisees||[])]; z[i] = { ...z[i], [k]:v }; up('livraison.zonesPersonnalisees', z); }
  function rmZone(i) { up('livraison.zonesPersonnalisees', (params.livraison.zonesPersonnalisees||[]).filter((_,x) => x!==i)); }

  async function saveNotifs() { const ok = await save(); toast(ok ? 'Notifications sauvegardées' : 'Sauvegardé localement', ok ? 'success' : 'warning'); }

  async function submitPw(e) {
    e.preventDefault();
    if (pw.new !== pw.confirm) { toast('Mots de passe différents', 'error'); return; }
    if (pw.new.length < 6) { toast('Minimum 6 caractères', 'error'); return; }
    setPwBusy(true);
    try { const { error } = await supabase.auth.updateUser({ password:pw.new }); if (error) throw error; toast('Mot de passe modifié', 'success'); setPw({ new:'', confirm:'' }); }
    catch(err) { toast(`Erreur : ${err.message}`, 'error'); }
    finally { setPwBusy(false); }
  }

  async function saveApp() { setSaving(true); const ok = await save(); setSaving(false); toast(ok ? 'Apparence sauvegardée' : 'Sauvegardé localement', ok ? 'success' : 'warning'); }

  async function resetApp() {
    if (!confirm("Réinitialiser l'apparence par défaut ?")) return;
    const n = { ...params, apparence:{ couleurPrimaire:'#FF6B00', couleurSecondaire:'#1D1D1F', accent:'#FF9A3C', logo:'', favicon:'', police:'Outfit' } };
    setParams(n); await save(n); toast('Apparence réinitialisée', 'success');
  }

  async function upImg(key, b64) {
    const n = JSON.parse(JSON.stringify(params)); n.apparence[key] = b64; setParams(n);
    const ok = await save(n);
    toast(ok ? `${key === 'logo' ? 'Logo' : 'Favicon'} mis à jour` : 'Sauvegardé localement', ok ? 'success' : 'warning');
  }

  function applyPalette(pal) {
    setParams(prev => {
      const n = JSON.parse(JSON.stringify(prev));
      n.apparence.couleurPrimaire   = pal.primary;
      n.apparence.couleurSecondaire = pal.secondary;
      n.apparence.accent            = pal.accent;
      return n;
    });
  }

  function copyLink() {
    const url = `${window.location.origin}/dashboard/boutique?shop=${params.identifiant?.slug}`;
    navigator.clipboard.writeText(url).then(() => toast('Lien copié', 'success'));
  }

  function openPreview() {
    const s = params.identifiant?.slug;
    const url = s ? `${window.location.origin}/dashboard/boutique?shop=${s}` : `${window.location.origin}/dashboard/boutique`;
    setPrevUrl(url); setPrevOpen(true);
    setTimeout(() => { if (iframeRef.current) iframeRef.current.src = url; }, 100);
  }

  useEffect(() => { loadFont(params.apparence?.police); }, [params.apparence?.police]);

  function changeSection(id) {
    setPaletteOpen(false);
    setFontOpen(false);
    setSection(id);
    setAnimKey(k => k + 1);
  }

  /* ── Nav config ── */
  const NAV = [
    { id:'general',  ico: Icons.general,  label:'Général' },
    { id:'slug',     ico: Icons.link,     label:'Identifiant' },
    { id:'payment',  ico: Icons.card,     label:'Paiement' },
    { id:'shipping', ico: Icons.shipping, label:'Livraison' },
    { id:'notifs',   ico: Icons.bell,     label:'Notifications' },
    { id:'security', ico: Icons.lock,     label:'Sécurité' },
    { id:'app',      ico: Icons.palette,  label:'Apparence' },
  ];

  const NAV_DESC = {
    general:  'Informations de base de votre boutique',
    slug:     'Identifiant unique et URL personnalisée',
    payment:  'Méthodes de paiement acceptées',
    shipping: 'Frais et zones de livraison',
    notifs:   'Alertes et notifications email',
    security: 'Mot de passe et données du compte',
    app:      'Couleurs, polices et images de la boutique',
  };

  const linkUrl = params.identifiant?.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/boutique?shop=${params.identifiant.slug}`
    : '';

  if (loading) return (
    <div className="p-loading">
      <div className="p-spin" />
      <span>Chargement des paramètres…</span>
    </div>
  );

  const currentNav = NAV.find(n => n.id === section);

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="p-wrap">

      {/* ════════ SIDEBAR ════════ */}
      <aside className="p-side">
        <div className="p-side-brand">
          <div className="p-side-logo">
            <div className="p-side-logo-icon">{Icons.settings}</div>
            <div>
              <div className="p-side-logo-text">ODA Studio</div>
              <div className="p-side-logo-sub">Paramètres</div>
            </div>
          </div>
        </div>

        <div className="p-nav-section">Menu</div>
        <div style={{ padding:'0 8px' }}>
          {NAV.map(n => (
            <button key={n.id} className={`p-nav-btn${section===n.id?' active':''}`} onClick={() => changeSection(n.id)}>
              <span className="p-nav-ico">{n.ico}</span>
              <span>{n.label}</span>
              <span className="p-nav-chevron">›</span>
            </button>
          ))}
        </div>

        <div className="p-side-footer">
          <div className="p-side-footer-tag">ODA Studio · v2.0</div>
        </div>
      </aside>

      {/* ════════ MAIN ════════ */}
      <main className="p-main" key={animKey}>

        {/* Page header */}
        <div className="p-head">
          <div className="p-head-eyebrow">{currentNav?.ico} {currentNav?.label}</div>
          <h1>{currentNav?.label}</h1>
          <p>{NAV_DESC[section]}</p>
        </div>

        {/* ════ GÉNÉRAL ════ */}
        {section === 'general' && (
          <div className="p-section-anim">
            <div className="p-card">
              <div className="p-card-head">
                <div>
                  <div className="p-card-title"><span className="p-card-title-icon">{Icons.general}</span>Informations boutique</div>
                  <div className="p-card-desc">Ces informations seront visibles par vos clients</div>
                </div>
              </div>
              <form onSubmit={saveGeneral}>
                <div className="p-stack">
                  <div className="p-field">
                    <label className="p-lbl">Nom de la boutique</label>
                    <input className="p-inp" value={params.general.nom} onChange={e => up('general.nom', e.target.value)} placeholder="Ma Boutique" />
                  </div>
                  <div className="p-field">
                    <label className="p-lbl">Description</label>
                    <textarea className="p-ta" value={params.general.description} onChange={e => up('general.description', e.target.value)} placeholder="Décrivez votre boutique en quelques mots…" />
                  </div>
                  <div className="p-grid">
                    <div className="p-field">
                      <label className="p-lbl">Email de contact</label>
                      <input className="p-inp" type="email" value={params.general.email} onChange={e => up('general.email', e.target.value)} placeholder="contact@boutique.com" />
                    </div>
                    <div className="p-field">
                      <label className="p-lbl">Téléphone</label>
                      <input className="p-inp" type="tel" value={params.general.telephone} onChange={e => up('general.telephone', e.target.value)} placeholder="+237 6XX XX XX XX" />
                    </div>
                  </div>
                  <div className="p-field">
                    <label className="p-lbl">Adresse</label>
                    <input className="p-inp" value={params.general.adresse} onChange={e => up('general.adresse', e.target.value)} placeholder="Douala, Cameroun" />
                  </div>
                  <div>
                    <button type="submit" className="p-btn p-btn-primary" disabled={saving}>
                      {saving ? 'Enregistrement…' : <>{Icons.check} Enregistrer</>}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ════ IDENTIFIANT ════ */}
        {section === 'slug' && (
          <div className="p-section-anim">
            <div className="p-card">
              <div className="p-card-head">
                <div>
                  <div className="p-card-title"><span className="p-card-title-icon">{Icons.link}</span>URL de votre boutique</div>
                  <div className="p-card-desc">Votre lien public unique pour partager votre boutique</div>
                </div>
              </div>

              {params.identifiant?.slug && !showSlug && (
                <div className="p-slug-box">
                  <div style={{ fontSize:'.75rem', fontWeight:700, color:'var(--green)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 }}>
                    ● Identifiant actif
                  </div>
                  <div className="p-slug-handle"><span>@</span>{params.identifiant.slug}</div>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:12 }}>
                    <input className="p-inp" readOnly value={linkUrl} style={{ fontFamily:'monospace', fontSize:'.8rem' }} />
                    <button type="button" className="p-btn p-btn-ghost p-btn-sm" onClick={copyLink}>Copier</button>
                  </div>
                  <button type="button" className="p-btn p-btn-ghost p-btn-sm" onClick={() => setShowSlug(true)}>Modifier l'identifiant</button>
                </div>
              )}

              {(!params.identifiant?.slug || showSlug) && (
                <form onSubmit={submitSlug}>
                  <div className="p-stack">
                    <div className="p-field">
                      <label className="p-lbl">Identifiant unique</label>
                      <input
                        className="p-inp"
                        value={slugIn}
                        onChange={e => {
                          const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'');
                          setSlugIn(v); setSlugSt(null);
                          if (v.length >= 3) checkSlug(v);
                        }}
                        placeholder="ma-boutique-oda"
                        style={{ fontFamily:'monospace' }}
                      />
                      {slugSt && <div className={`p-slug-status ${slugSt.ok?'ok':'fail'}`}>{slugSt.msg}</div>}
                      <div className="p-hint">Uniquement des lettres minuscules, chiffres et tirets</div>
                    </div>
                    <div className="p-btn-group">
                      <button type="submit" className="p-btn p-btn-primary">Définir l'identifiant</button>
                      {showSlug && <button type="button" className="p-btn p-btn-ghost" onClick={() => setShowSlug(false)}>Annuler</button>}
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ════ PAIEMENT ════ */}
        {section === 'payment' && (
          <div className="p-section-anim">

            {/* Carte bancaire */}
            <div className="p-card">
              <div className="p-card-head">
                <div>
                  <div className="p-card-title"><span className="p-card-title-icon">{Icons.card}</span>Carte bancaire</div>
                  <div className="p-card-desc">Visa, Mastercard via Stripe</div>
                </div>
                <Toggle id="payCard" checked={params.paiement.carte.actif} onChange={v => up('paiement.carte.actif', v)} />
              </div>
              {params.paiement.carte.actif && (
                <div className="p-stack">
                  <div className="p-field">
                    <label className="p-lbl">Clé API Stripe</label>
                    <input className="p-inp" placeholder="sk_live_..." value={params.paiement.carte.cle} onChange={e => up('paiement.carte.cle', e.target.value)} style={{ fontFamily:'monospace' }} />
                  </div>
                  <div>
                    <button type="button" className="p-btn p-btn-success p-btn-sm" onClick={() => confirmerPaiement('carte')}>{Icons.check} Confirmer l'intégration</button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Money */}
            <div className="p-card">
              <div className="p-card-head">
                <div>
                  <div className="p-card-title"><span className="p-card-title-icon">{Icons.mobile}</span>Mobile Money</div>
                  <div className="p-card-desc">MTN & Orange Money Cameroun</div>
                </div>
                <Toggle id="payMM" checked={params.paiement.mobile.actif} onChange={v => up('paiement.mobile.actif', v)} />
              </div>
              {params.paiement.mobile.actif && (
                <div className="p-stack">
                  {/* MTN */}
                  <div className="p-provider-block">
                    <div className="p-provider-head">
                      <div className="p-provider-label">
                        <span className="p-provider-badge p-badge-mtn">MTN</span>
                        MTN Mobile Money
                      </div>
                      <Toggle id="mtnOn" checked={params.paiement.mobile.mtn?.actif ?? false} onChange={v => up('paiement.mobile.mtn.actif', v)} />
                    </div>
                    {params.paiement.mobile.mtn?.actif && (
                      <div className="p-grid">
                        <div className="p-field">
                          <label className="p-lbl">Nom du compte</label>
                          <input className="p-inp" placeholder="Jean Dupont" value={params.paiement.mobile.mtn?.nomCompte ?? ''} onChange={e => up('paiement.mobile.mtn.nomCompte', e.target.value)} />
                        </div>
                        <div className="p-field">
                          <label className="p-lbl">Numéro</label>
                          <input className="p-inp" type="tel" placeholder="+237 6XX XX XX" value={params.paiement.mobile.mtn?.numero ?? ''} onChange={e => up('paiement.mobile.mtn.numero', e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Orange */}
                  <div className="p-provider-block">
                    <div className="p-provider-head">
                      <div className="p-provider-label">
                        <span className="p-provider-badge p-badge-orange">Orange</span>
                        Orange Money
                      </div>
                      <Toggle id="omOn" checked={params.paiement.mobile.orange?.actif ?? false} onChange={v => up('paiement.mobile.orange.actif', v)} />
                    </div>
                    {params.paiement.mobile.orange?.actif && (
                      <div className="p-grid">
                        <div className="p-field">
                          <label className="p-lbl">Nom du compte</label>
                          <input className="p-inp" placeholder="Jean Dupont" value={params.paiement.mobile.orange?.nomCompte ?? ''} onChange={e => up('paiement.mobile.orange.nomCompte', e.target.value)} />
                        </div>
                        <div className="p-field">
                          <label className="p-lbl">Numéro</label>
                          <input className="p-inp" type="tel" placeholder="+237 6XX XX XX" value={params.paiement.mobile.orange?.numero ?? ''} onChange={e => up('paiement.mobile.orange.numero', e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <button type="button" className="p-btn p-btn-success p-btn-sm" onClick={confirmerMM}>{Icons.check} Confirmer Mobile Money</button>
                  </div>
                </div>
              )}
            </div>

            {/* Cash */}
            <div className="p-card">
              <div className="p-card-head">
                <div>
                  <div className="p-card-title"><span className="p-card-title-icon">{Icons.cash}</span>Paiement à la livraison</div>
                  <div className="p-card-desc">Le client paie en espèces à la réception</div>
                </div>
                <Toggle id="payCash" checked={params.paiement.cash?.actif ?? false} onChange={v => up('paiement.cash.actif', v)} />
              </div>
              {params.paiement.cash?.actif && (
                <div style={{ marginTop:4 }}>
                  <button type="button" className="p-btn p-btn-success p-btn-sm" onClick={() => { up('paiement.cash.confirme', true); toast('Paiement cash activé', 'success'); }}>{Icons.check} Confirmer</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ LIVRAISON ════ */}
        {section === 'shipping' && (
          <div className="p-section-anim">
            <div className="p-card">
              <div className="p-card-head">
                <div>
                  <div className="p-card-title"><span className="p-card-title-icon">{Icons.shipping}</span>Tarifs de livraison</div>
                  <div className="p-card-desc">Configurez vos zones et frais de livraison</div>
                </div>
              </div>
              <form onSubmit={saveShipping}>
                <div className="p-stack">
                  <div className="p-grid">
                    <div className="p-field">
                      <label className="p-lbl">Frais Douala (FCFA)</label>
                      <input className="p-inp" type="number" value={params.livraison.fraisDouala} onChange={e => up('livraison.fraisDouala', Number(e.target.value))} />
                    </div>
                    <div className="p-field">
                      <label className="p-lbl">Autres villes (FCFA)</label>
                      <input className="p-inp" type="number" value={params.livraison.fraisAutres} onChange={e => up('livraison.fraisAutres', Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="p-grid">
                    <div className="p-field">
                      <label className="p-lbl">Délai estimé</label>
                      <input className="p-inp" value={params.livraison.delai} onChange={e => up('livraison.delai', e.target.value)} placeholder="2-5 jours ouvrables" />
                    </div>
                    <div className="p-field">
                      <label className="p-lbl">Montant min. livraison gratuite (FCFA)</label>
                      <input className="p-inp" type="number" value={params.livraison.montantMin} onChange={e => up('livraison.montantMin', Number(e.target.value))} />
                    </div>
                  </div>

                  <div className="p-divider" />

                  <div className="p-row" style={{ paddingTop:0 }}>
                    <div className="p-row-info">
                      <div className="p-row-title">Livraison gratuite</div>
                      <div className="p-row-desc">Offrir la livraison au-dessus du montant minimum</div>
                    </div>
                    <Toggle id="freeShip" checked={params.livraison.gratuit} onChange={v => up('livraison.gratuit', v)} />
                  </div>

                  <div className="p-divider" />

                  <div>
                    <div style={{ fontSize:'.875rem', fontWeight:600, color:'var(--text-1)', marginBottom:12 }}>Zones personnalisées</div>
                    {(params.livraison.zonesPersonnalisees||[]).map((z,i) => (
                      <div key={i} className="p-zone">
                        <input className="p-inp" placeholder="Nom de la zone" value={z.nom} onChange={e => upZone(i,'nom',e.target.value)} />
                        <input className="p-inp" type="number" placeholder="Frais" value={z.frais} onChange={e => upZone(i,'frais',Number(e.target.value))} />
                        <button type="button" className="p-zone-del" onClick={() => rmZone(i)} title="Supprimer la zone">
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    ))}
                    <button type="button" className="p-btn p-btn-ghost p-btn-sm" onClick={addZone} style={{ marginTop:4 }}>+ Ajouter une zone</button>
                  </div>

                  <div>
                    <button type="submit" className="p-btn p-btn-primary">{Icons.check} Enregistrer la livraison</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ════ NOTIFICATIONS ════ */}
        {section === 'notifs' && (
          <div className="p-section-anim">
            <div className="p-card">
              <div className="p-card-head">
                <div>
                  <div className="p-card-title"><span className="p-card-title-icon">{Icons.bell}</span>Alertes & notifications</div>
                  <div className="p-card-desc">Choisissez ce que vous souhaitez recevoir par email</div>
                </div>
              </div>

              {[
                { key:'commandes', title:'Nouvelles commandes', desc:'Recevez une notification à chaque nouvelle commande' },
                { key:'stock',     title:'Stock faible',        desc:'Alertes en cas de rupture de stock imminente' },
                { key:'clients',   title:'Nouveaux clients',    desc:'Notification lors de l\'inscription d\'un client' },
                { key:'rapports',  title:'Rapports quotidiens', desc:'Résumé de performance envoyé chaque matin' },
              ].map(n => (
                <div key={n.key} className="p-row">
                  <div className="p-row-info">
                    <div className="p-row-title">{n.title}</div>
                    <div className="p-row-desc">{n.desc}</div>
                  </div>
                  <Toggle id={`n-${n.key}`} checked={params.notifications[n.key]} onChange={v => up(`notifications.${n.key}`, v)} />
                </div>
              ))}

              <div style={{ paddingTop:16 }}>
                <button type="button" className="p-btn p-btn-primary" onClick={saveNotifs}>{Icons.check} Enregistrer les préférences</button>
              </div>
            </div>
          </div>
        )}

        {/* ════ SÉCURITÉ ════ */}
        {section === 'security' && (
          <div className="p-section-anim">
            <div className="p-card">
              <div className="p-card-head">
                <div>
                  <div className="p-card-title"><span className="p-card-title-icon">{Icons.lock}</span>Mot de passe</div>
                  <div className="p-card-desc">Mettez à jour votre mot de passe de connexion</div>
                </div>
              </div>
              <form onSubmit={submitPw}>
                <div className="p-stack">
                  <div className="p-field">
                    <label className="p-lbl">Nouveau mot de passe</label>
                    <input className="p-inp" type="password" value={pw.new} onChange={e => setPw(p => ({...p, new:e.target.value}))} placeholder="Minimum 6 caractères" />
                  </div>
                  <div className="p-field">
                    <label className="p-lbl">Confirmer le mot de passe</label>
                    <input className="p-inp" type="password" value={pw.confirm} onChange={e => setPw(p => ({...p, confirm:e.target.value}))} placeholder="Retapez le mot de passe" />
                  </div>
                  <div>
                    <button type="submit" className="p-btn p-btn-primary" disabled={pwBusy}>
                      {pwBusy ? 'Modification…' : <>{Icons.check} Modifier le mot de passe</>}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Danger zone */}
            <div className="p-card" style={{ borderColor:'rgba(242,69,61,.15)' }}>
              <div className="p-card-head" style={{ marginBottom:12 }}>
                <div>
                  <div className="p-card-title" style={{ color:'var(--red)' }}><span className="p-card-title-icon">{Icons.warn}</span>Zone de danger</div>
                  <div className="p-card-desc">Ces actions sont irréversibles — procédez avec précaution</div>
                </div>
              </div>
              <div className="p-btn-group">
                <button type="button" className="p-btn p-btn-ghost p-btn-sm" style={{ color:'var(--text-2)' }} onClick={() => toast('Contactez le support pour exporter vos données', 'warning')}>{Icons.download} Exporter mes données</button>
                <button type="button" className="p-btn p-btn-danger p-btn-sm" onClick={() => { if(confirm('Supprimer définitivement votre compte ?')) toast('Contactez le support pour finaliser la suppression', 'warning'); }}>{Icons.trash} Supprimer le compte</button>
              </div>
            </div>
          </div>
        )}

        {/* ════ APPARENCE ════ */}
        {section === 'app' && (
          <div className="p-section-anim">

            {/* Palettes */}
            <div className="p-card">
              <div className="p-card-head">
                <div>
                  <div className="p-card-title"><span className="p-card-title-icon">{Icons.palette}</span>Palette de couleurs</div>
                  <div className="p-card-desc">Thèmes prédéfinis pour votre boutique</div>
                </div>
              </div>

              {/* ── Dropdown palette ── */}
              {(() => {
                const activePal = PALETTES.find(p => p.primary === params.apparence.couleurPrimaire) || null;
                return (
                  <div className={`p-palette-dropdown${paletteOpen ? ' open' : ''}`} style={{ marginBottom: 20 }}>
                    <button ref={palTriggerRef} type="button" className="p-palette-trigger" onClick={() => { setPaletteOpen(o => !o); setFontOpen(false); }}>
                      <div className="p-pt-swatches">
                        {activePal
                          ? <>
                              <div className="p-pt-swatch" style={{ background: activePal.primary }} />
                              <div className="p-pt-swatch" style={{ background: activePal.secondary }} />
                              <div className="p-pt-swatch" style={{ background: activePal.accent }} />
                            </>
                          : <>
                              <div className="p-pt-swatch" style={{ background: params.apparence.couleurPrimaire }} />
                              <div className="p-pt-swatch" style={{ background: params.apparence.couleurSecondaire }} />
                              <div className="p-pt-swatch" style={{ background: params.apparence.accent }} />
                            </>
                        }
                      </div>
                      <span className="p-pt-name">{activePal ? activePal.name : 'Personnalisé'}</span>
                      <span className="p-pt-arrow">▼</span>
                    </button>
                    <DropdownPortal triggerRef={palTriggerRef} open={paletteOpen} onClose={() => setPaletteOpen(false)}>
                      {PALETTES.map(p => (
                        <div key={p.name}
                          className={`p-palette-option${params.apparence.couleurPrimaire === p.primary ? ' active' : ''}`}
                          onClick={() => { applyPalette(p); setPaletteOpen(false); }}>
                          <div className="p-po-swatches">
                            <div className="p-po-swatch" style={{ background: p.primary }} />
                            <div className="p-po-swatch" style={{ background: p.secondary }} />
                            <div className="p-po-swatch" style={{ background: p.accent }} />
                          </div>
                          <span>{p.name}</span>
                          {params.apparence.couleurPrimaire === p.primary && <span className="p-po-check">{Icons.check}</span>}
                        </div>
                      ))}
                    </DropdownPortal>
                  </div>
                );
              })()}

              <div className="p-divider" />

              <div style={{ fontSize:'.875rem', fontWeight:600, color:'var(--text-1)', marginBottom:14 }}>Couleurs personnalisées</div>
              <div className="p-grid">
                <div className="p-field">
                  <label className="p-lbl">Couleur primaire</label>
                  <div className="p-color-row">
                    <div className="p-color-swatch">
                      <input type="color" value={params.apparence.couleurPrimaire} onChange={e => up('apparence.couleurPrimaire', e.target.value)} />
                    </div>
                    <input className="p-inp" value={params.apparence.couleurPrimaire} onChange={e => up('apparence.couleurPrimaire', e.target.value)} style={{ fontFamily:'monospace', fontSize:'.85rem' }} />
                  </div>
                </div>
                <div className="p-field">
                  <label className="p-lbl">Couleur secondaire</label>
                  <div className="p-color-row">
                    <div className="p-color-swatch">
                      <input type="color" value={params.apparence.couleurSecondaire} onChange={e => up('apparence.couleurSecondaire', e.target.value)} />
                    </div>
                    <input className="p-inp" value={params.apparence.couleurSecondaire} onChange={e => up('apparence.couleurSecondaire', e.target.value)} style={{ fontFamily:'monospace', fontSize:'.85rem' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Polices */}
            <div className="p-card">
              <div className="p-card-head">
                <div>
                  <div className="p-card-title"><span className="p-card-title-icon">{Icons.type}</span>Police d'écriture</div>
                  <div className="p-card-desc">Choisissez la typographie de votre boutique</div>
                </div>
              </div>

              {/* ── Dropdown police ── */}
              {(() => {
                const activeFont = FONTS.find(f => f.value === params.apparence.police) || FONTS[0];
                return (
                  <div className={`p-font-dropdown${fontOpen ? ' open' : ''}`}>
                    <button ref={fontTriggerRef} type="button" className="p-font-trigger" onClick={() => { setFontOpen(o => !o); setPaletteOpen(false); }}>
                      <span className="p-ft-preview" style={{ fontFamily: activeFont.value }}>Aa — Bb — Cc</span>
                      <span className="p-ft-name">{activeFont.label}</span>
                      <span className="p-ft-arrow">▼</span>
                    </button>
                    <DropdownPortal triggerRef={fontTriggerRef} open={fontOpen} onClose={() => setFontOpen(false)}>
                      {FONTS.map(f => (
                        <div key={f.value}
                          className={`p-font-option${params.apparence.police === f.value ? ' active' : ''}`}
                          onClick={() => { up('apparence.police', f.value); setFontOpen(false); }}>
                          <span className="p-fo-preview" style={{ fontFamily: f.value }}>Aa — Bb — Cc</span>
                          <span className="p-fo-name">{f.label}</span>
                          {params.apparence.police === f.value && <span className="p-fo-check">{Icons.check}</span>}
                        </div>
                      ))}
                    </DropdownPortal>
                  </div>
                );
              })()}
            </div>{/* end p-card police */}

            {/* Logo & Favicon */}
            <div className="p-card">
              <div className="p-card-head">
                <div>
                  <div className="p-card-title"><span className="p-card-title-icon">{Icons.image}</span>Images de la boutique</div>
                  <div className="p-card-desc">Logo et favicon affichés dans votre boutique</div>
                </div>
              </div>
              <div className="p-upload-grid">
                <UpZone value={params.apparence.logo} onFile={b => upImg('logo', b)} icon={Icons.image} label="Logo principal" />
                <UpZone value={params.apparence.favicon} onFile={b => upImg('favicon', b)} icon={Icons.type} label="Favicon" />
              </div>
            </div>

            {/* Actions */}
            <div className="p-btn-group">
              <button type="button" className="p-btn p-btn-primary" onClick={saveApp} disabled={saving}>
                {saving ? 'Enregistrement…' : <>{Icons.check} Sauvegarder l'apparence</>}
              </button>
              <button type="button" className="p-btn p-btn-ghost" onClick={openPreview}>{Icons.eye} Aperçu</button>
              <button type="button" className="p-btn p-btn-ghost" style={{ color:'var(--red)' }} onClick={resetApp}>Réinitialiser</button>
            </div>
          </div>
        )}
      </main>

      {/* ════ MOBILE BAR ════ */}
      <nav className="p-mob">
        {NAV.map(n => (
          <button key={n.id} className={`p-mob-btn${section===n.id?' active':''}`} onClick={() => changeSection(n.id)}>
            <span className="p-mob-ico">{n.ico}</span>
            <span>{n.label}</span>
          </button>
        ))}
      </nav>

      {/* ════ PREVIEW MODAL ════ */}
      <div className={`p-modal-bg${prevOpen?' open':''}`} onClick={e => { if(e.target===e.currentTarget) setPrevOpen(false); }}>
        <div className="p-modal-box">
          <div className="p-modal-bar">
            <div className="p-modal-dots">
              <i style={{ background:'#FF5F56' }} />
              <i style={{ background:'#FFBD2E' }} />
              <i style={{ background:'#27C93F' }} />
            </div>
            <div className="p-modal-url">{prevUrl}</div>
            <button className="p-btn p-btn-ghost p-btn-sm" onClick={() => setPrevOpen(false)}>{Icons.close}</button>
          </div>
          <iframe className="p-modal-iframe" ref={iframeRef} title="Aperçu boutique" />
        </div>
      </div>
    </div>
  );
}