'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/globals.css';

/* ─── Supabase ─── */
const SUPABASE_URL      = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ─── Couleurs toast ─── */
const TOAST_COLORS = { success: '#34C759', error: '#FF3B30', info: '#007AFF', warning: '#FF9500' };


const PAGE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

  /* ── Variables ── */
  :root {
    --msg-primary:    #007AFF;
    --msg-gradient:   linear-gradient(135deg,#007AFF 0%,#5AC8FA 100%);
    --msg-bg:         #F2F2F7;
    --msg-card:       #FFFFFF;
    --msg-text1:      #1D1D1F;
    --msg-text2:      #86868B;
    --msg-border:     rgba(0,122,255,.12);
    --msg-header-h:   56px;
    --ease:           cubic-bezier(.4,0,.2,1);
  }

  /* ── Reset messages ── */
  .msg-root *, .msg-root *::before, .msg-root *::after { box-sizing: border-box; }

  /* ── Fond animé ODA ── */
  .msg-pattern-bg {
    position: fixed; inset: 0; z-index: -1;
    background-color: #f5f5f7;
    background-image:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg opacity='0.12'%3E%3Crect x='20' y='15' width='20' height='30' rx='3' fill='%23007AFF'/%3E%3Ccircle cx='30' cy='40' r='1.5' fill='%23fff'/%3E%3C/g%3E%3C/svg%3E"),
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70' viewBox='0 0 70 70'%3E%3Cg opacity='0.11'%3E%3Cpath fill='%23FF6B00' d='M35 20L30 25L25 20L20 25L20 35L25 35L25 50L45 50L45 35L50 35L50 25L45 20L40 25Z'/%3E%3C/g%3E%3C/svg%3E"),
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55' viewBox='0 0 55 55'%3E%3Cg opacity='0.14'%3E%3Ccircle cx='27.5' cy='27.5' r='10' fill='none' stroke='%23FFD700' stroke-width='2'/%3E%3C/g%3E%3C/svg%3E");
    background-position: 0 0, 60px 30px, 40px 120px;
    background-size: 60px 60px, 70px 70px, 55px 55px;
    opacity: .28;
    animation: msg-pattern 80s linear infinite;
  }
  @keyframes msg-pattern {
    0%   { background-position: 0 0,   60px 30px,  40px 120px; }
    100% { background-position: 60px 60px, 120px 90px, 100px 180px; }
  }

  /* ══ LAYOUT MESSAGES ══ */
  .msg-root {
    font-family: 'Poppins', -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .msg-container {
    position: fixed;
    top: var(--msg-header-h);
    left: 0; right: 0; bottom: 0;
    display: grid;
    grid-template-columns: 360px 1fr;
    height: calc(100dvh - var(--msg-header-h));
    overflow: hidden;
  }

  /* ══ SIDEBAR ══ */
  .msg-sidebar {
    background: rgba(255,255,255,.98);
    backdrop-filter: blur(12px);
    border-right: 1px solid var(--msg-border);
    display: flex; flex-direction: column;
    height: 100%; overflow: hidden;
  }
  .msg-sidebar-head {
    padding: 18px 20px;
    border-bottom: 2px solid #F2F2F7;
    background: rgba(232,244,255,.5);
    flex-shrink: 0;
  }
  .msg-sidebar-title {
    font-size: 1.25rem; font-weight: 700;
    color: var(--msg-primary); margin-bottom: 14px;
  }
  .msg-search {
    width: 100%; padding: 11px 15px;
    border: 2px solid rgba(0,122,255,.18);
    border-radius: 12px;
    font-family: 'Poppins', sans-serif; font-size: .9rem;
    background: white; color: var(--msg-text1);
    transition: border-color .25s, box-shadow .25s;
  }
  .msg-search:focus {
    outline: none;
    border-color: var(--msg-primary);
    box-shadow: 0 0 0 3px rgba(0,122,255,.14);
  }
  .msg-filters {
    display: flex; gap: 8px; margin: 11px 0 10px;
  }
  .msg-filter-btn {
    flex: 1; padding: 7px 10px;
    border: 1px solid rgba(0,122,255,.28);
    border-radius: 20px; background: white;
    color: var(--msg-text2); font-size: .82rem; font-weight: 500;
    cursor: pointer; transition: all .25s var(--ease);
    font-family: 'Poppins', sans-serif;
  }
  .msg-filter-btn.active {
    background: var(--msg-gradient); color: white; border-color: transparent;
  }
  .msg-count { font-size: .82rem; color: var(--msg-text2); font-weight: 500; }

  /* ══ LISTE CONVERSATIONS ══ */
  .msg-list { flex: 1; overflow-y: auto; overflow-x: hidden; }
  .msg-list::-webkit-scrollbar { width: 5px; }
  .msg-list::-webkit-scrollbar-track { background: transparent; }
  .msg-list::-webkit-scrollbar-thumb { background: rgba(0,122,255,.18); border-radius: 10px; }

  .msg-item {
    padding: 15px 18px;
    border-bottom: 1px solid rgba(0,122,255,.08);
    cursor: pointer; display: flex; gap: 12px; align-items: flex-start;
    transition: background .2s var(--ease);
    animation: msg-fadein-conv .35s var(--ease);
  }
  @keyframes msg-fadein-conv {
    from { opacity:0; transform:translateX(-16px); }
    to   { opacity:1; transform:translateX(0); }
  }
  .msg-item:hover    { background: rgba(0,122,255,.04); }
  .msg-item.unread   { background: rgba(0,122,255,.07); }
  .msg-item.active   {
    background: linear-gradient(135deg,rgba(0,122,255,.09),rgba(90,200,250,.07));
    border-left: 4px solid var(--msg-primary);
  }
  .msg-item.active .msg-item-avatar { box-shadow: 0 4px 14px rgba(0,122,255,.38); }
  .msg-item:hover .msg-item-avatar  { transform: scale(1.08); box-shadow: 0 4px 12px rgba(0,0,0,.22); }

  .msg-item-avatar {
    width: 46px; height: 46px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 1.45rem;
    box-shadow: 0 2px 8px rgba(0,0,0,.13);
    transition: transform .28s var(--ease), box-shadow .28s var(--ease);
  }
  .msg-item-body   { flex: 1; min-width: 0; }
  .msg-item-head   { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
  .msg-item-name   { font-weight: 600; color: var(--msg-text1); }
  .msg-item-time   { font-size: .73rem; color: var(--msg-text2); }
  .msg-item-preview {
    font-size: .88rem; color: var(--msg-text2);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .msg-unread-badge {
    display: inline-flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg,#FF3B30,#FF6B60);
    color: white; font-size: .7rem; font-weight: 700;
    padding: 2px 7px; border-radius: 12px;
    min-width: 20px; margin-left: 5px;
    box-shadow: 0 2px 5px rgba(255,59,48,.28);
  }

  /* ══ PANEL CONVERSATION ══ */
  .msg-panel {
    background: rgba(255,255,255,.98);
    backdrop-filter: blur(12px);
    display: flex; flex-direction: column;
    height: 100%; overflow: hidden;
  }

  /* Header conversation */
  .msg-conv-head {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 22px;
    border-bottom: 1px solid var(--msg-border);
    background: rgba(255,255,255,.98);
    min-height: 78px; flex-shrink: 0;
  }
  .msg-conv-avatar {
    width: 44px; height: 44px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem; flex-shrink: 0;
    box-shadow: 0 3px 10px rgba(0,0,0,.18);
  }
  .msg-conv-info   { flex: 1; min-width: 0; }
  .msg-conv-name   { font-size: 1.05rem; font-weight: 600; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .msg-conv-status { font-size: .78rem; color: var(--msg-text2); }
  .msg-del-btn {
    padding: 8px 14px; border: none; border-radius: 10px; cursor: pointer;
    background: rgba(255,59,48,.1); color: #FF3B30;
    font-weight: 500; font-family: 'Poppins', sans-serif; font-size: .88rem;
    transition: background .2s; flex-shrink: 0;
  }
  .msg-del-btn:hover { background: rgba(255,59,48,.2); }

  /* Messages zone */
  .msg-chat {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    padding: 14px 10px; background: #FAFAFA;
    display: flex; flex-direction: column;
  }
  .msg-chat::-webkit-scrollbar { width: 5px; }
  .msg-chat::-webkit-scrollbar-track { background: transparent; }
  .msg-chat::-webkit-scrollbar-thumb { background: rgba(0,122,255,.18); border-radius: 10px; }

  .msg-date-sep {
    text-align: center; font-size: .78rem; color: var(--msg-text2);
    padding: 10px 0 6px; font-weight: 500;
  }
  .msg-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .msg-group.sent     { align-items: flex-end; }
  .msg-group.received { align-items: flex-start; }

  .msg-bubble {
    max-width: 70%; padding: 11px 15px; border-radius: 16px;
    word-wrap: break-word; animation: msg-slide-in .28s var(--ease);
    line-height: 1.45;
  }
  @keyframes msg-slide-in {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .msg-bubble.sent     { background: var(--msg-gradient); color: white; border-bottom-right-radius: 4px; }
  .msg-bubble.received { background: white; color: var(--msg-text1); border-bottom-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,.07); }
  .msg-bubble-text { margin-bottom: 4px; }
  .msg-bubble-time { font-size: .68rem; opacity: .72; display: flex; align-items: center; gap: 3px; justify-content: flex-end; }

  /* Carte produit */
  .msg-product-card {
    max-width: 272px; background: white; border-radius: 14px;
    overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,.1);
    margin-bottom: 6px; border: 2px solid rgba(0,122,255,.1);
    animation: msg-fadein .4s var(--ease);
    transition: transform .2s var(--ease), box-shadow .2s var(--ease);
  }
  @keyframes msg-fadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .msg-product-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,.14); }
  .msg-product-card.sent  { border-color: rgba(0,122,255,.28); }
  .msg-product-img   { width: 100%; height: 176px; object-fit: cover; display: block; }
  .msg-product-info  { padding: 11px; }
  .msg-product-name  { font-weight: 600; font-size: .93rem; color: var(--msg-text1); margin-bottom: 7px; line-height: 1.3; }
  .msg-product-row   { display: flex; justify-content: space-between; align-items: center; }
  .msg-product-price { font-weight: 700; font-size: 1.05rem; color: var(--msg-primary); }
  .msg-product-stock { font-size: .78rem; color: var(--msg-text2); }
  .msg-product-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 9px; background: rgba(0,122,255,.09);
    border-radius: 11px; font-size: .72rem; color: var(--msg-primary);
    font-weight: 600; margin-top: 6px;
  }

  /* Input zone */
  .msg-input-wrap {
    padding: 14px 22px;
    border-top: 1px solid var(--msg-border);
    background: rgba(255,255,255,.98);
    flex-shrink: 0;
  }
  .msg-input-row { display: flex; gap: 10px; align-items: flex-end; }
  .msg-textarea {
    flex: 1; padding: 11px 15px;
    border: 2px solid rgba(0,122,255,.18); border-radius: 12px;
    font-family: 'Poppins', sans-serif; font-size: .9rem;
    resize: none; min-height: 46px; max-height: 120px;
    background: white; color: var(--msg-text1);
    transition: border-color .25s, box-shadow .25s; overflow-y: auto;
  }
  .msg-textarea:focus {
    outline: none; border-color: var(--msg-primary);
    box-shadow: 0 0 0 3px rgba(0,122,255,.12);
  }
  .msg-send-btn {
    padding: 11px 22px; background: var(--msg-gradient);
    color: white; border: none; border-radius: 12px;
    font-family: 'Poppins', sans-serif; font-weight: 600;
    font-size: .9rem; cursor: pointer; white-space: nowrap; flex-shrink: 0;
    transition: opacity .2s, transform .2s var(--ease);
  }
  .msg-send-btn:hover    { opacity: .9; transform: translateY(-1px); }
  .msg-send-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

  /* État vide */
  .msg-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; height: 100%;
    color: var(--msg-text2); text-align: center; gap: 10px;
  }
  .msg-empty-icon { font-size: 3.8rem; opacity: .38; }

  /* Bouton retour mobile */
  .msg-back-btn {
    display: none; padding: 7px 11px; border: none; background: none;
    cursor: pointer; font-size: .88rem; color: var(--msg-primary);
    font-family: 'Poppins', sans-serif; font-weight: 500;
    align-items: center; gap: 5px; flex-shrink: 0;
  }

  /* Status connexion */
  .msg-conn {
    display: flex; align-items: center; gap: 7px;
    font-size: .82rem; padding: 7px 14px; border-radius: 20px;
    background: rgba(52,199,89,.1); color: #34C759;
  }
  .msg-conn.off { background: rgba(255,59,48,.1); color: #FF3B30; }
  .msg-conn-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: currentColor; animation: msg-pulse 2s infinite;
  }
  @keyframes msg-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }

  /* Toast */
  .msg-toasts {
    position: fixed; top: 90px; right: 18px;
    z-index: 10000; display: flex; flex-direction: column; gap: 10px;
  }
  .msg-toast {
    background: white; padding: 14px 20px; border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,122,255,.18);
    font-family: 'Poppins', sans-serif; font-weight: 500;
    color: #1D1D1F; max-width: 340px; font-size: .9rem;
    animation: msg-toast-in .4s var(--ease);
  }
  .msg-toast.out { animation: msg-toast-out .4s var(--ease) forwards; }
  @keyframes msg-toast-in  { from{transform:translateX(360px);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes msg-toast-out { to  {transform:translateY(-10px);opacity:0} }

  /* ══ MOBILE ══ */
  @media (max-width: 768px) {
    .msg-container          { grid-template-columns: 1fr; }
    .msg-sidebar            { border-right: none; }
    .msg-sidebar.mob-hidden { display: none; }
    .msg-panel              { display: none; }
    .msg-panel.mob-show {
      display: flex;
      position: fixed;
      top: var(--msg-header-h); left: 0; right: 0; bottom: 0;
      height: calc(100dvh - var(--msg-header-h));
      flex-direction: column; z-index: 100;
    }
    .msg-back-btn    { display: flex; }
    .msg-input-wrap  { position: sticky; bottom: 0; z-index: 10; background: white; padding: 12px 14px; }
    .msg-conv-head   { padding: 12px 14px; min-height: 70px; }
    .msg-bubble      { max-width: 84%; }
  }
  @media (max-width: 480px) {
    .msg-sidebar-head { padding: 14px; }
    .msg-input-wrap   { padding: 10px 12px; }
  }
`;


const EMOJI_POOL = {
  personnes:  ['👨','👩','🧑','👴','👵','👶','🧒','👦','👧','🧔','👨‍💼','👩‍💼','🧑‍💼','👨‍🎓','👩‍🎓'],
  emotions:   ['😊','😎','🤗','😇','🥳','🤩','😺','🐱','🦁','🐯','🦊','🐻','🐨','🐼','🐸'],
  objets:     ['💼','🎯','🎨','🎪','🎭','🎬','🎸','🎹','🎺','🎻','🏆','🏅','⚽','🏀','🎮'],
  nature:     ['🌟','⭐','🌈','🌺','🌸','🌼','🌻','🌷','🌹','🍀','🌿','🌲','🌴','🌵','🪴'],
  nourriture: ['🍕','🍔','🍰','🎂','🍪','🍩','🧁','🍦','🍧','🍨','🥤','☕','🍓','🍇','🍉'],
  sports:     ['⚽','🏀','🏈','⚾','🎾','🏐','🏓','🏸','🥊','🎱','🏊','🚴','⛷️','🏄','🤸'],
};
const TOUS_LES_EMOJIS = Object.values(EMOJI_POOL).flat();

const COULEURS_AVATAR = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#30cfd0,#330867)',
  'linear-gradient(135deg,#a8edea,#fed6e3)',
  'linear-gradient(135deg,#ff9a56,#ff6a88)',
  'linear-gradient(135deg,#ffecd2,#fcb69f)',
  'linear-gradient(135deg,#ff6e7f,#bfe9ff)',
  'linear-gradient(135deg,#e0c3fc,#8ec5fc)',
  'linear-gradient(135deg,#f77062,#fe5196)',
  'linear-gradient(135deg,#fccb90,#d57eeb)',
  'linear-gradient(135deg,#e2b0ff,#9f44d3)',
  'linear-gradient(135deg,#ffeaa7,#fd79a8)',
  'linear-gradient(135deg,#74ebd5,#acb6e5)',
  'linear-gradient(135deg,#ffd89b,#19547b)',
  'linear-gradient(135deg,#84fab0,#8fd3f4)',
  'linear-gradient(135deg,#a1c4fd,#c2e9fb)',
  'linear-gradient(135deg,#fd79a8,#fdcbf1)',
];


function strHash(s) {
  if (!s) return 0;
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}
function avatarOf(name) {
  return {
    emoji:   TOUS_LES_EMOJIS[strHash(name) % TOUS_LES_EMOJIS.length],
    couleur: COULEURS_AVATAR[strHash(name)  % COULEURS_AVATAR.length],
  };
}
function tempsRelatif(dateStr) {
  const d = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (d < 1)  return "À l'instant";
  if (d < 60) return `Il y a ${d} min`;
  const h = Math.floor(d / 60);
  if (h < 24) return `Il y a ${h}h`;
  const j = Math.floor(h / 24);
  if (j < 7)  return `Il y a ${j}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day:'numeric', month:'short' });
}
function heure(date) {
  return date.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
}
function prixFCFA(p) {
  return p == null ? 'Prix non disponible' : `${Number(p).toLocaleString('fr-FR')} FCFA`;
}
function construireListe(conversations, filtre, recherche) {
  let liste = Array.from(conversations.entries()).map(([client, msgs]) => {
    const last     = msgs[msgs.length - 1];
    const nonLus   = msgs.filter(m => m.sender === 'client' && !m.read).length;
    const hasProd  = !!(last.product_data && Object.keys(last.product_data).length);
    return {
      client, msgs,
      preview:     last.message || (hasProd ? '📦 Produit partagé' : ''),
      date:        last.created_at,
      nonLu:       nonLus > 0,
      countNonLus: nonLus,
      hasProd,
    };
  });
  if (filtre === 'unread') liste = liste.filter(c => c.nonLu);
  if (recherche) {
    const q = recherche.toLowerCase();
    liste = liste.filter(c => c.client.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q));
  }
  return liste.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function ProductCard({ productData, sender }) {
  const img =
    productData.image      ||
    productData.mainImage  ||
    productData.main_image ||
    'https://via.placeholder.com/272x176?text=Produit';
  const isSent = sender === 'admin';
  return (
    <div className={`msg-product-card${isSent ? ' sent' : ''}`}>
      <img
        src={img}
        className="msg-product-img"
        alt={productData.nom || 'Produit'}
        onError={e => { e.target.src = 'https://via.placeholder.com/272x176?text=Image+indisponible'; }}
        loading="lazy"
      />
      <div className="msg-product-info">
        <div className="msg-product-name">{productData.nom || 'Produit'}</div>
        <div className="msg-product-row">
          <div className="msg-product-price">{prixFCFA(productData.prix)}</div>
          <div className="msg-product-stock">📦 Stock : {productData.stock ?? 0}</div>
        </div>
        <div className="msg-product-badge">🛍️ Produit partagé</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MESSAGES DU CHAT
══════════════════════════════════════════════════════════════════ */
function ChatMessages({ messages, chatRef }) {
  const nodes = [];
  let dateCourante = null;

  messages.forEach((msg, i) => {
    const d      = new Date(msg.created_at);
    const dLabel = d.toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    if (dLabel !== dateCourante) {
      nodes.push(
        <div key={`sep-${i}`} className="msg-date-sep" style={{ animation:`msg-fadein .4s ease ${i*.02}s backwards` }}>
          {dLabel}
        </div>
      );
      dateCourante = dLabel;
    }
    const sent = msg.sender === 'admin';
    nodes.push(
      <div
        key={msg.id ?? i}
        data-group="true"
        className={`msg-group ${sent ? 'sent' : 'received'}`}
        style={{ animation:`msg-fadein .4s ease ${i*.03}s backwards` }}
      >
        {/* Carte produit */}
        {msg.product_data && Object.keys(msg.product_data).length > 0 && (
          <ProductCard productData={msg.product_data} sender={msg.sender} />
        )}
        {/* Bulle texte */}
        {msg.message?.trim() && (
          <div className={`msg-bubble ${sent ? 'sent' : 'received'}`}>
            <div className="msg-bubble-text">{msg.message}</div>
            <div className="msg-bubble-time">
              {heure(d)}
              {sent && (
                <span style={{ color: msg.read ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.55)' }}>
                  {msg.read ? ' ✓✓' : ' ✓'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  });

  return (
    <div id="chatMessages" className="msg-chat" ref={chatRef}>
      {nodes}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PANEL CONVERSATION ACTIF
══════════════════════════════════════════════════════════════════ */
function ConversationPanel({ clientName, messages, onBack, onDelete, onSend, chatRef, inputRef, msgInput, setMsgInput, isSending }) {
  const { emoji, couleur } = avatarOf(clientName);

  function handleTextareaChange(e) {
    setMsgInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }
  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
  }

  return (
    <>
      {/* Header */}
      <div className="msg-conv-head">
        <button id="mobileBackBtn" className="msg-back-btn" onClick={onBack}>◀</button>
        <div className="msg-conv-avatar" style={{ background: couleur }}>
          {emoji}
        </div>
        <div className="msg-conv-info">
          <div className="msg-conv-name">{clientName}</div>
          <div className="msg-conv-status">{messages.length} message(s)</div>
        </div>
        <button id="deleteConvBtn" className="msg-del-btn" onClick={onDelete}>
          🗑️ Supprimer
        </button>
      </div>

      {/* Messages */}
      <ChatMessages messages={messages} chatRef={chatRef} />

      {/* Input */}
      <div className="msg-input-wrap">
        <div className="msg-input-row">
          <textarea
            id="messageInput"
            ref={inputRef}
            className="msg-textarea"
            placeholder="Tapez votre réponse..."
            rows={1}
            value={msgInput}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            disabled={isSending}
          />
          <button
            id="sendBtn"
            className="msg-send-btn"
            disabled={isSending}
            onClick={onSend}
          >
            {isSending ? '⏳ Envoi…' : 'Envoyer ➤'}
          </button>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SIDEBAR — LISTE DES CONVERSATIONS
══════════════════════════════════════════════════════════════════ */
function Sidebar({ liste, totalNonLus, filtre, setFiltre, recherche, setRecherche, activeClient, onSelect, mobHidden }) {
  return (
    <aside className={`msg-sidebar${mobHidden ? ' mob-hidden' : ''}`}>
      <div className="msg-sidebar-head">
        <h2 className="msg-sidebar-title">Conversations</h2>
        <input
          id="searchMessages"
          type="text"
          className="msg-search"
          placeholder="🔍 Rechercher…"
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
        />
        <div className="msg-filters">
          {['all','unread'].map(f => (
            <button
              key={f}
              className={`msg-filter-btn${filtre === f ? ' active' : ''}`}
              data-filter={f}
              onClick={() => setFiltre(f)}
            >
              {f === 'all' ? 'Tous' : 'Non lus'}
            </button>
          ))}
        </div>
        <div className="msg-count">
          <span id="unreadCount">{totalNonLus}</span> non lu(s)
        </div>
      </div>

      <div id="messagesListContent" className="msg-list">
        {liste.length === 0 ? (
          <div style={{ padding:'44px 22px', textAlign:'center', color:'var(--msg-text2)' }}>
            <div style={{ fontSize:'3.5rem', marginBottom:'14px', opacity:.42 }}>🔭</div>
            <h3 style={{ fontSize:'1rem', marginBottom:'6px', color:'var(--msg-text1)' }}>Aucune conversation</h3>
            <p style={{ fontSize:'.87rem', lineHeight:'1.55' }}>Les messages de vos clients apparaîtront ici.</p>
          </div>
        ) : (
          liste.map(conv => {
            const { emoji, couleur } = avatarOf(conv.client);
            const isActive = activeClient === conv.client;
            return (
              <div
                key={conv.client}
                className={`msg-item${conv.nonLu ? ' unread' : ''}${isActive ? ' active' : ''}`}
                data-client={conv.client}
                onClick={() => onSelect(conv.client)}
              >
                <div className="msg-item-avatar" style={{ background: couleur }}>{emoji}</div>
                <div className="msg-item-body">
                  <div className="msg-item-head">
                    <span className="msg-item-name">
                      {conv.client}
                      {conv.nonLu && <span className="msg-unread-badge">{conv.countNonLus}</span>}
                    </span>
                    <span className="msg-item-time">{tempsRelatif(conv.date)}</span>
                  </div>
                  <div className="msg-item-preview">
                    {conv.hasProd ? '📦 ' : ''}{conv.preview}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

// ╔══════════════════════════════════════════════════════════════════╗
// ║  page.js  —  /dashboard/messages                               ║
// ╚══════════════════════════════════════════════════════════════════╝

export default function MessagesPage() {
  /* ── Auth ── */
  const { user, loading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  /* ── Redirect si non authentifié ── */
  useEffect(() => {
    if (!loading && !user) router.replace('/connexion');
  }, [user, loading, router]);

  /* ════════════════════════ STATE ════════════════════════ */
  const [conversations,      setConversations]      = useState(new Map());
  const [activeClient,       setActiveClient]       = useState(null);
  // ✅ menuOpen SUPPRIMÉ — géré par layout.js
  const [connStatus,         setConnStatus]         = useState('connecting');
  const [statusText,         setStatusText]         = useState('Connexion…');
  const [filtre,             setFiltre]             = useState('all');
  const [recherche,          setRecherche]          = useState('');
  const [msgInput,           setMsgInput]           = useState('');
  const [isSending,          setIsSending]          = useState(false);
  const [mobSidebarHidden,   setMobSidebarHidden]   = useState(false);
  const [mobConvShow,        setMobConvShow]        = useState(false);
  const [toasts,             setToasts]             = useState([]);

  /* ── Refs ── */
  const pollingRef  = useRef(null);
  const chatRef     = useRef(null);
  const inputRef    = useRef(null);
  const convRef     = useRef(null);
  const convMapRef  = useRef(new Map());

  useEffect(() => { convRef.current    = activeClient;  }, [activeClient]);
  useEffect(() => { convMapRef.current = conversations; }, [conversations]);

  /* ════════════════════════ TOAST ════════════════════════ */
  const toast = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.map(t => t.id === id ? { ...t, out: true } : t)), 3000);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  /* ════════════════════════ CONNEXION SUPABASE ════════════════════════ */
  const verifierConnexion = useCallback(async () => {
    try {
      const { error } = await supabase.from('conversations').select('count').limit(1);
      if (error) throw error;
      setConnStatus('connected');
      setStatusText('Connecté');
    } catch {
      setConnStatus('disconnected');
      setStatusText('Déconnecté');
      toast('⚠️ Connexion limitée', 'warning');
    }
  }, [toast]);

  /* ════════════════════════ CHARGEMENT CONVERSATIONS ════════════════════════ */
  const chargerConversations = useCallback(async (uid) => {
    if (!uid) return;
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: true });
      if (error) throw error;

      const map = new Map();
      (data || []).forEach(m => {
        if (!map.has(m.client_name)) map.set(m.client_name, []);
        map.get(m.client_name).push(m);
      });
      setConversations(new Map(map));
      convMapRef.current = map;
    } catch (err) {
      console.error('❌ Erreur chargement:', err);
      toast('❌ Erreur de chargement', 'error');
    }
  }, [toast]);

  /* ════════════════════════ MARQUER COMME LU ════════════════════════ */
  const marquerCommeLu = useCallback(async (clientName, uid) => {
    const msgs   = convMapRef.current.get(clientName) || [];
    const nonLus = msgs.filter(m => m.sender === 'client' && !m.read);
    if (!nonLus.length) return;
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ read: true })
        .eq('client_name', clientName)
        .eq('user_id', uid)
        .eq('sender', 'client')
        .eq('read', false);
      if (error) throw error;
      nonLus.forEach(m => { m.read = true; });
    } catch (err) { console.error('❌ Marquage lu:', err); }
  }, []);

  /* ════════════════════════ OUVRIR CONVERSATION ════════════════════════ */
  const ouvrirConversation = useCallback(async (clientName) => {
    if (!clientName || !user) return;
    await marquerCommeLu(clientName, user.id);
    setActiveClient(clientName);
    if (window.innerWidth <= 768) {
      setMobSidebarHidden(true);
      setMobConvShow(true);
    }
    requestAnimationFrame(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    });
    setTimeout(() => inputRef.current?.focus(), 120);
  }, [user, marquerCommeLu]);

  /* ════════════════════════ ENVOYER RÉPONSE ════════════════════════ */
  const envoyerReponse = useCallback(async () => {
    if (!activeClient || !user) return;
    const texte = msgInput.trim();
    if (!texte) { toast('⚠️ Veuillez saisir un message', 'warning'); return; }

    setIsSending(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, client_name: activeClient, sender: 'admin', message: texte, read: true })
        .select().single();
      if (error) throw error;

      setConversations(prev => {
        const next = new Map(prev);
        if (!next.has(activeClient)) next.set(activeClient, []);
        next.get(activeClient).push(data);
        convMapRef.current = next;
        return next;
      });
      setMsgInput('');
      if (inputRef.current) inputRef.current.style.height = 'auto';
      toast('✅ Réponse envoyée !', 'success');
      requestAnimationFrame(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
      });
    } catch (err) {
      console.error('❌ Envoi:', err);
      toast("❌ Erreur d'envoi", 'error');
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }, [activeClient, user, msgInput, toast]);

  /* ════════════════════════ SUPPRIMER CONVERSATION ════════════════════════ */
  const supprimerConversation = useCallback(async () => {
    if (!activeClient || !user) return;
    if (!confirm(`Supprimer définitivement la conversation avec ${activeClient} ?`)) return;
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('client_name', activeClient)
        .eq('user_id', user.id);
      if (error) throw error;

      setConversations(prev => {
        const next = new Map(prev);
        next.delete(activeClient);
        convMapRef.current = next;
        return next;
      });
      setActiveClient(null);
      retourListeMobile();
      toast('🗑️ Conversation supprimée', 'success');
    } catch (err) {
      console.error('❌ Suppression:', err);
      toast('❌ Erreur de suppression', 'error');
    }
  }, [activeClient, user, toast]); // eslint-disable-line

  /* ════════════════════════ MOBILE RETOUR ════════════════════════ */
  const retourListeMobile = useCallback(() => {
    setMobSidebarHidden(false);
    setMobConvShow(false);
  }, []);

  /* ════════════════════════ CLAVIER MOBILE ════════════════════════ */
  useEffect(() => {
    if (!window.visualViewport) return;
    const onVP = () => {
      const panel = document.getElementById('conversationPanel');
      if (!panel || !mobConvShow) return;
      const vp = window.visualViewport;
      const kbH = Math.max(0, window.innerHeight - vp.height - vp.offsetTop);
      panel.style.bottom = kbH + 'px';
      panel.style.height = (vp.height - 56) + 'px';
      requestAnimationFrame(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; });
    };
    const resetVP = () => {
      const panel = document.getElementById('conversationPanel');
      if (panel) { panel.style.bottom = ''; panel.style.height = ''; }
    };
    window.visualViewport.addEventListener('resize', onVP);
    window.visualViewport.addEventListener('scroll', onVP);
    const onBlur = (e) => { if (e.target.id === 'messageInput') setTimeout(resetVP, 300); };
    document.addEventListener('focusout', onBlur);
    return () => {
      window.visualViewport.removeEventListener('resize', onVP);
      window.visualViewport.removeEventListener('scroll', onVP);
      document.removeEventListener('focusout', onBlur);
    };
  }, [mobConvShow]);

  /* Fallback scroll iOS 12 */
  useEffect(() => {
    const onFocus = (e) => {
      if (e.target.id !== 'messageInput') return;
      setTimeout(() => {
        e.target.scrollIntoView({ behavior:'smooth', block:'end' });
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }, 400);
    };
    document.addEventListener('focusin', onFocus);
    return () => document.removeEventListener('focusin', onFocus);
  }, []);

  /* ════════════════════════ RESIZE ════════════════════════ */
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) retourListeMobile(); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [retourListeMobile]);

  /* ════════════════════════ POLLING 5s ════════════════════════ */
  useEffect(() => {
    if (!user) return;
    const uid = user.id;

    const tick = async () => {
      await chargerConversations(uid);
      const active  = convRef.current;
      const map     = convMapRef.current;
      if (active && map.has(active)) {
        const total   = map.get(active).length;
        const shown   = chatRef.current?.querySelectorAll('[data-group="true"]').length ?? 0;
        if (total > shown) {
          setActiveClient(null);
          setTimeout(() => setActiveClient(active), 0);
        }
      }
    };

    pollingRef.current = setInterval(tick, 5000);
    return () => clearInterval(pollingRef.current);
  }, [user, chargerConversations]);

  /* ════════════════════════ INIT ════════════════════════ */
  useEffect(() => {
    if (!user) return;
    verifierConnexion();
    chargerConversations(user.id);
  }, [user]); // eslint-disable-line

  /* ── Scroll auto quand conv change ── */
  useEffect(() => {
    if (!activeClient) return;
    requestAnimationFrame(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    });
  }, [activeClient, conversations]);

  /* ════════════════════════ DONNÉES DÉRIVÉES ════════════════════════ */
  const liste       = construireListe(conversations, filtre, recherche);
  const nbNonLus    = liste.reduce((s, c) => s + c.countNonLus, 0);
  const activeConv  = activeClient ? (conversations.get(activeClient) || []) : [];

  // Update the badge icon with the unread count
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = nbNonLus > 0 ? `(${nbNonLus}) Messages - OdaMarket` : 'Messages - OdaMarket';
    }
  }, [nbNonLus]);

  /* ════════════════════════ ÉCRAN DE CHARGEMENT ════════════════════════ */
  if (loading) {
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#F2F2F7' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:'16px', animation:'spin 1s linear infinite' }}>⏳</div>
          <p style={{ color:'#8E8E93', fontFamily:'Poppins, sans-serif' }}>Chargement…</p>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }
  if (!user) return null;

  /* ════════════════════════ RENDER ════════════════════════ */
  return (
    <div className="msg-root">
      {/* Injection CSS spécifique à la page messages */}
      <style id="oda-messages-style" dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />

      {/* Fond animé */}
      <div className="msg-pattern-bg" />

      {/* ══ CONTAINER MESSAGES ══
          ✅ Le header, le hamburger et le menu overlay sont supprimés ici.
          Ils sont désormais fournis uniquement par layout.js. */}
      <div className="msg-container">

        {/* Sidebar */}
        <Sidebar
          liste={liste}
          totalNonLus={nbNonLus}
          filtre={filtre}
          setFiltre={setFiltre}
          recherche={recherche}
          setRecherche={setRecherche}
          activeClient={activeClient}
          onSelect={ouvrirConversation}
          mobHidden={mobSidebarHidden}
        />

        {/* Panel conversation */}
        <main
          id="conversationPanel"
          className={`msg-panel${mobConvShow ? ' mob-show' : ''}`}
        >
          {!activeClient ? (
            <div className="msg-empty">
              <div className="msg-empty-icon">💬</div>
              <h3>Sélectionnez une conversation</h3>
              <p>Choisissez un message dans la liste pour commencer</p>
            </div>
          ) : (
            <ConversationPanel
              clientName={activeClient}
              messages={activeConv}
              onBack={retourListeMobile}
              onDelete={supprimerConversation}
              onSend={envoyerReponse}
              chatRef={chatRef}
              inputRef={inputRef}
              msgInput={msgInput}
              setMsgInput={setMsgInput}
              isSending={isSending}
            />
          )}
        </main>
      </div>

      {/* ══ TOASTS ══ */}
      {toasts.length > 0 && (
        <div id="notification-container" className="msg-toasts">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`msg-toast${t.out ? ' out' : ''}`}
              style={{ borderLeft: `4px solid ${TOAST_COLORS[t.type] || TOAST_COLORS.info}` }}
            >
              {t.msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}