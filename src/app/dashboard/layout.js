'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import PageLoader from '@/components/PageLoader';


export const LanguageContext = createContext({ lang: 'fr', setLang: () => {}, t: (k) => k });

export function useLanguage() {
  return useContext(LanguageContext);
}

/* ─── Dictionnaire de traductions ─── */
const TRANSLATIONS = {
  fr: {
    loading:          'Chargement...',
    administrator:    'Administrateur',
    sectionMain:      'Principal',
    sectionOthers:    'Autres',
    sectionCommunity: 'Communauté',
    openMenu:         'Ouvrir le menu',
    closeMenu:        'Fermer le menu',
    joinChannel:      'Rejoindre notre chaîne',
    telegramGroup:    'Groupe Telegram',
    dashboard:        'Tableau de bord',
    products:         'Produits',
    orders:           'Commandes',
    clients:          'Clients',
    messages:         'Messages',
    statistics:       'Statistiques',
    settings:         'Paramètres',
    myShop:           'Voir ma boutique',
  },
  en: {
    loading:          'Loading...',
    administrator:    'Administrator',
    sectionMain:      'Main',
    sectionOthers:    'Others',
    sectionCommunity: 'Community',
    openMenu:         'Open menu',
    closeMenu:        'Close menu',
    joinChannel:      'Join our channel',
    telegramGroup:    'Telegram Group',
    dashboard:        'Dashboard',
    products:         'Products',
    orders:           'Orders',
    clients:          'Clients',
    messages:         'Messages',
    statistics:       'Statistics',
    settings:         'Settings',
    myShop:           'View my shop',
  },
};

/* ─── CSS global injecté une seule fois ─── */
const LAYOUT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

  :root {
    --primary:    #007AFF;
    --primary-dk: #0051D5;
    --secondary:  #5856D6;
    --accent:     #FF9500;
    --success:    #34C759;
    --danger:     #FF3B30;
    --bg:         #F2F2F7;
    --card-bg:    #FFFFFF;
    --text-1:     #000000;
    --text-2:     #8E8E93;
    --border:     #E5E5EA;
    --shadow-sm:  0 1px 3px rgba(0,0,0,.08);
    --shadow-md:  0 4px 12px rgba(0,0,0,.10);
    --shadow-lg:  0 8px 24px rgba(0,0,0,.12);
    --ease:       cubic-bezier(.4,0,.2,1);
    --spring:     cubic-bezier(.34,1.56,.64,1);
    --spring-out: cubic-bezier(.55,-.28,.1,1.3);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--bg);
    color: var(--text-1);
    line-height: 1.6;
    overflow-x: hidden;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* ══════════════════════════════════════
     HEADER
  ══════════════════════════════════════ */
  .oda-header {
    position: fixed; top: 0; left: 0; right: 0;
    padding-top: var(--sat, 0px);
    background: rgba(255,255,255,.88);
    backdrop-filter: saturate(180%) blur(24px);
    -webkit-backdrop-filter: saturate(180%) blur(24px);
    border-bottom: .5px solid rgba(0,0,0,.1);
    z-index: 1000;
  }
  .oda-header-inner {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0 16px;
    max-width: 1920px; margin: 0 auto;
    height: 52px;
  }

  @supports (top: max(0px, env(safe-area-inset-top))) {
    .oda-header { padding-top: env(safe-area-inset-top); }
  }

  @supports selector(:has(*)) {
    :root { --sat: env(safe-area-inset-top, 0px); }
  }

  /* ── Brand centrée ── */
  .oda-brand {
    font-size: 1.15rem; font-weight: 700; letter-spacing: -.3px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    position: absolute; left: 50%; transform: translateX(-50%);
    pointer-events: none; white-space: nowrap;
  }

  /* ── Contrôles droite ── */
  .oda-header-right {
    display: flex; align-items: center; gap: 8px;
    flex-shrink: 0; min-width: 0;
  }

  /* ── Bouton langue ── */
  .oda-lang-btn {
    display: flex; align-items: center;
    background: var(--bg);
    border: .5px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    height: 30px;
    flex-shrink: 0;
    box-shadow: var(--shadow-sm);
  }
  .oda-lang-option {
    padding: 0 9px;
    font-size: .72rem; font-weight: 600;
    font-family: 'Poppins', sans-serif;
    cursor: pointer; border: none; background: transparent;
    color: var(--text-2);
    height: 100%;
    transition: background .18s, color .18s;
    letter-spacing: .3px;
    -webkit-tap-highlight-color: transparent;
  }
  .oda-lang-option.active {
    background: var(--primary);
    color: white;
    border-radius: 20px;
  }
  .oda-lang-option:not(.active):hover { background: rgba(0,0,0,.04); color: var(--text-1); }

  /* ── User pill ── */
  .oda-user-pill {
    display: flex; align-items: center; gap: 7px;
    padding: 4px 10px 4px 4px;
    border-radius: 50px;
    background: var(--bg);
    cursor: pointer;
    transition: transform .15s var(--spring), background .15s;
    border: .5px solid var(--border);
    flex-shrink: 0; min-width: 0;
  }
  .oda-user-pill:active { transform: scale(.94); background: #E8E8ED; }
  .oda-user-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: .75rem; font-weight: 700; flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(0,122,255,.35);
  }
  /* Nom : visible ≥ 480px uniquement */
  .oda-user-name {
    font-size: .8rem; font-weight: 600; color: var(--text-1);
    max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  /* ══════════════════════════════════════
     HAMBURGER BUTTON — morphing animé
  ══════════════════════════════════════ */
  .oda-ham-btn {
    position: relative;
    width: 38px; height: 38px;
    background: var(--bg);
    border: .5px solid var(--border);
    border-radius: 11px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    transition: transform .15s var(--spring), background .15s, box-shadow .15s;
    flex-shrink: 0;
    overflow: hidden;
  }
  .oda-ham-btn:active { transform: scale(.88); background: #E8E8ED; box-shadow: none; }
  .oda-ham-btn.open { background: rgba(0,122,255,.1); border-color: rgba(0,122,255,.25); }

  .oda-ham-btn .bar {
    position: absolute;
    height: 2px; border-radius: 2px;
    background: var(--primary);
    transition: transform .38s var(--spring), opacity .25s var(--ease), width .3s var(--ease), top .38s var(--spring);
    transform-origin: center;
  }
  .oda-ham-btn .bar-1 { width: 16px; top: 13px; }
  .oda-ham-btn .bar-2 { width: 20px; top: 18px; }
  .oda-ham-btn .bar-3 { width: 12px; top: 23px; }

  .oda-ham-btn.open .bar-1 { width: 18px; top: 18px; transform: rotate(45deg); }
  .oda-ham-btn.open .bar-2 { opacity: 0; transform: scaleX(0); }
  .oda-ham-btn.open .bar-3 { width: 18px; top: 18px; transform: rotate(-45deg); }

  /* ══════════════════════════════════════
     OVERLAY
  ══════════════════════════════════════ */
  .oda-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.38);
    backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
    z-index: 1998; opacity: 0; visibility: hidden;
    transition: opacity .32s var(--ease), visibility .32s var(--ease);
    touch-action: none;
  }
  .oda-overlay.open { opacity: 1; visibility: visible; }

  /* ══════════════════════════════════════
     MENU PANEL — slide + spring
     FIX: largeur réduite et proportionnelle à l'écran
  ══════════════════════════════════════ */
  .oda-menu {
    position: fixed; top: 0; left: 0;
    /* Base : 72% de l'écran, jamais plus de 280px sur mobile */
    width: min(72vw, 280px);
    height: 100%;
    background: #FAFAFA;
    box-shadow: 4px 0 32px rgba(0,0,0,.15);
    z-index: 1999; display: flex; flex-direction: column;
    transform: translateX(-110%);
    transition: transform .42s cubic-bezier(.32,0,.67,0);
    overflow: hidden;
    -webkit-overflow-scrolling: touch;
    border-right: .5px solid rgba(0,0,0,.06);
  }
  .oda-menu.open {
    transform: translateX(0);
    transition: transform .46s cubic-bezier(.16,1,.3,1);
  }

  /* Safe area iOS */
  @supports (padding-top: env(safe-area-inset-top)) {
    .oda-menu-hero { padding-top: max(24px, calc(env(safe-area-inset-top) + 10px)) !important; }
    .oda-menu { padding-bottom: env(safe-area-inset-bottom); }
    .oda-header { padding-top: env(safe-area-inset-top); }
  }
  @supports (-webkit-touch-callout: none) {
    .oda-menu { height: -webkit-fill-available; }
    body.oda-noscroll { position: fixed; width: 100%; }
  }
  body.oda-noscroll { overflow: hidden; touch-action: none; }

  /* ── Hero section ── */
  .oda-menu-hero {
    background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    padding: 24px 16px 18px;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }
  .oda-menu-hero::before {
    content: '';
    position: absolute; top: -40px; right: -40px;
    width: 120px; height: 120px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,122,255,.32) 0%, transparent 70%);
  }
  .oda-menu-hero::after {
    content: '';
    position: absolute; bottom: -28px; left: -18px;
    width: 90px; height: 90px; border-radius: 50%;
    background: radial-gradient(circle, rgba(88,86,214,.22) 0%, transparent 70%);
  }
  .oda-hero-top {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 16px; position: relative; z-index: 1;
  }
  .oda-hero-logo {
    display: flex; align-items: center; gap: 8px;
  }
  .oda-hero-logo-icon {
    width: 34px; height: 34px; background: white; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; box-shadow: 0 4px 10px rgba(0,0,0,.2);
  }
  .oda-hero-logo-text {
    font-size: 1.2rem; font-weight: 700; color: white; letter-spacing: -.3px;
  }
  .oda-hero-close {
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(255,255,255,.12);
    border: .5px solid rgba(255,255,255,.2);
    color: rgba(255,255,255,.9);
    font-size: 16px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .2s var(--spring);
    -webkit-tap-highlight-color: transparent;
    min-width: 44px; min-height: 44px;
  }
  .oda-hero-close:active { transform: scale(.85) rotate(90deg); background: rgba(255,255,255,.22); }

  /* Profil dans le menu */
  .oda-hero-profile {
    display: flex; align-items: center; gap: 10px;
    position: relative; z-index: 1;
    background: rgba(255,255,255,.08);
    border: .5px solid rgba(255,255,255,.12);
    border-radius: 12px; padding: 9px 12px;
  }
  .oda-hero-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: linear-gradient(135deg, #007AFF, #5856D6);
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: .9rem; font-weight: 700;
    box-shadow: 0 0 0 2px rgba(255,255,255,.22), 0 4px 10px rgba(0,0,0,.2);
    flex-shrink: 0;
  }
  .oda-hero-info { flex: 1; min-width: 0; }
  .oda-hero-info-name {
    font-size: .85rem; font-weight: 600; color: white;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .oda-hero-info-role { font-size: .72rem; color: rgba(255,255,255,.52); margin-top: 1px; }
  .oda-hero-badge {
    width: 8px; height: 8px; border-radius: 50%;
    background: #34C759;
    box-shadow: 0 0 0 2px rgba(52,199,89,.3);
    flex-shrink: 0;
  }

  /* ── NAV ── */
  .oda-menu-nav {
    flex: 1; padding: 8px 10px;
    overflow-y: auto; overflow-x: hidden;
    -webkit-overflow-scrolling: touch; overscroll-behavior: contain;
  }

  .oda-nav-section-label {
    font-size: .68rem; font-weight: 600; color: var(--text-2);
    text-transform: uppercase; letter-spacing: .8px;
    padding: 8px 8px 5px;
  }

  .oda-nav-link {
    display: flex; align-items: center; gap: 11px;
    padding: 9px 11px;
    color: #1C1C1E; text-decoration: none;
    font-weight: 500; font-size: .88rem;
    border-radius: 11px;
    transition: background .18s, transform .18s var(--spring), color .18s;
    background: transparent;
    width: 100%; border: none; cursor: pointer;
    font-family: 'Poppins', -apple-system, sans-serif;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    min-height: 46px; margin-bottom: 2px;
    -webkit-tap-highlight-color: transparent;
    position: relative;
  }
  .oda-nav-link:active { transform: scale(.96); background: rgba(0,0,0,.05); }
  .oda-nav-link.active {
    background: rgba(0,122,255,.1);
    color: var(--primary); font-weight: 600;
  }
  .oda-nav-link.active .oda-nav-icon-wrap { background: var(--primary); box-shadow: 0 4px 10px rgba(0,122,255,.32); }
  .oda-nav-link.active .oda-nav-icon-wrap span { filter: brightness(10); }

  /* Icône dans bulle */
  .oda-nav-icon-wrap {
    width: 32px; height: 32px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; flex-shrink: 0;
    transition: transform .2s var(--spring), box-shadow .2s;
    background: #EFEFEF;
  }
  .oda-nav-link:active .oda-nav-icon-wrap { transform: scale(.9); }

  /* Couleurs des icônes */
  .oda-nav-link[data-color="blue"]   .oda-nav-icon-wrap { background: rgba(0,122,255,.12); }
  .oda-nav-link[data-color="orange"] .oda-nav-icon-wrap { background: rgba(255,149,0,.12); }
  .oda-nav-link[data-color="green"]  .oda-nav-icon-wrap { background: rgba(52,199,89,.12); }
  .oda-nav-link[data-color="purple"] .oda-nav-icon-wrap { background: rgba(88,86,214,.12); }
  .oda-nav-link[data-color="pink"]   .oda-nav-icon-wrap { background: rgba(255,45,85,.12); }
  .oda-nav-link[data-color="teal"]   .oda-nav-icon-wrap { background: rgba(90,200,250,.15); }
  .oda-nav-link[data-color="indigo"] .oda-nav-icon-wrap { background: rgba(88,86,214,.12); }
  .oda-nav-link[data-color="red"]    .oda-nav-icon-wrap { background: rgba(255,59,48,.1); }

  /* Chevron */
  .oda-nav-chevron {
    margin-left: auto; color: #C7C7CC; font-size: .72rem; flex-shrink: 0;
    transition: transform .2s var(--spring);
  }
  .oda-nav-link.active .oda-nav-chevron { color: var(--primary); transform: translateX(2px); }

  .oda-divider {
    height: .5px;
    background: var(--border);
    margin: 6px 4px;
  }

  /* Social links */
  .oda-social-link {
    display: flex; align-items: center; gap: 11px;
    padding: 9px 11px; text-decoration: none;
    font-weight: 500; font-size: .85rem;
    border-radius: 11px; min-height: 46px; margin-bottom: 2px;
    transition: background .15s, transform .15s var(--spring);
    -webkit-tap-highlight-color: transparent;
    width: 100%;
  }
  .oda-social-link:active { transform: scale(.96); }
  .oda-social-link.whatsapp { color: #25D366; }
  .oda-social-link.whatsapp:active { background: rgba(37,211,102,.08); }
  .oda-social-link.telegram { color: #0088cc; }
  .oda-social-link.telegram:active { background: rgba(0,136,204,.08); }

  /* ── Animation décalée des liens ── */
  @keyframes oda-pop-in {
    0%   { opacity: 0; transform: translateX(-12px) scale(.96); }
    60%  { opacity: 1; transform: translateX(2px) scale(1.01); }
    100% { opacity: 1; transform: translateX(0) scale(1); }
  }
  .oda-menu.open .oda-nav-link,
  .oda-menu.open .oda-social-link {
    animation: oda-pop-in .4s var(--ease) both;
  }
  .oda-menu.open .oda-nav-anim-1  { animation-delay: .06s; }
  .oda-menu.open .oda-nav-anim-2  { animation-delay: .09s; }
  .oda-menu.open .oda-nav-anim-3  { animation-delay: .12s; }
  .oda-menu.open .oda-nav-anim-4  { animation-delay: .15s; }
  .oda-menu.open .oda-nav-anim-5  { animation-delay: .18s; }
  .oda-menu.open .oda-nav-anim-6  { animation-delay: .21s; }
  .oda-menu.open .oda-nav-anim-7  { animation-delay: .24s; }
  .oda-menu.open .oda-nav-anim-8  { animation-delay: .27s; }
  .oda-menu.open .oda-nav-anim-9  { animation-delay: .30s; }
  .oda-menu.open .oda-nav-anim-10 { animation-delay: .33s; }

  /* Scrollbar */
  .oda-menu-nav::-webkit-scrollbar { width: 2px; }
  .oda-menu-nav::-webkit-scrollbar-track { background: transparent; }
  .oda-menu-nav::-webkit-scrollbar-thumb { background: rgba(0,0,0,.1); border-radius: 10px; }

  /* ── CONTENT AREA ── */
  .oda-layout { display: flex; flex-direction: column; min-height: 100vh; }
  .oda-content { padding-top: 52px; flex: 1; }

  /* ════════════════════════════════════════════════════
     RESPONSIVE — du plus large au plus étroit
     Logique : menu = min(vw%, px fixe) à chaque palier
  ════════════════════════════════════════════════════ */

  /* Desktop large */
  @media (min-width: 1025px) {
    .oda-menu { width: 280px; }
    .oda-header-inner { padding: 0 24px; }
    .oda-user-name { max-width: 110px; }
  }

  /* Tablette */
  @media (max-width: 1024px) and (min-width: 769px) {
    .oda-menu { width: min(60vw, 300px); }
  }

  /* Tablette portrait / grand téléphone */
  @media (max-width: 768px) {
    .oda-header-inner { padding: 0 14px; height: 50px; }
    .oda-content { padding-top: calc(50px + env(safe-area-inset-top, 0px)); }
    .oda-menu { width: min(70vw, 280px); }
    .oda-menu-hero { padding: 20px 14px 16px; padding-top: max(20px, calc(env(safe-area-inset-top) + 10px)); }
    .oda-hero-logo-icon { width: 32px; height: 32px; font-size: 1rem; }
    .oda-hero-logo-text { font-size: 1.1rem; }
    .oda-hero-profile { padding: 8px 11px; gap: 9px; }
    .oda-hero-avatar { width: 36px; height: 36px; }
  }

  /* Téléphone standard (≤ 480px) : masquer le nom dans le pill header */
  @media (max-width: 480px) {
    .oda-user-name { display: none; }
    .oda-user-pill { padding: 4px; border-radius: 50%; }
    .oda-menu { width: min(72vw, 268px); }
    .oda-header-inner { gap: 6px; }
    .oda-brand { font-size: 1.05rem; }
    .oda-menu-nav { padding: 6px 8px; }
    .oda-nav-link { font-size: .85rem; padding: 8px 10px; gap: 10px; min-height: 44px; }
    .oda-nav-icon-wrap { width: 30px; height: 30px; font-size: .95rem; }
    .oda-social-link { font-size: .82rem; padding: 8px 10px; min-height: 44px; }
  }

  /* Petit téléphone (≤ 390px) */
  @media (max-width: 390px) {
    .oda-menu { width: min(76vw, 258px); }
    .oda-menu-hero { padding: 18px 12px 14px; }
    .oda-hero-profile { padding: 7px 10px; }
    .oda-hero-info-name { font-size: .82rem; }
    .oda-nav-link { font-size: .83rem; min-height: 42px; }
    .oda-lang-btn { height: 28px; }
    .oda-lang-option { padding: 0 7px; font-size: .7rem; }
  }

  /* Très petit téléphone (≤ 360px) */
  @media (max-width: 360px) {
    .oda-menu { width: min(78vw, 248px); }
    .oda-ham-btn { width: 36px; height: 36px; }
    .oda-brand { font-size: .98rem; }
  }

  /* Très petit (≤ 320px) */
  @media (max-width: 320px) {
    .oda-menu { width: min(80vw, 240px); }
    .oda-header-inner { padding: 0 10px; }
    .oda-nav-section-label { font-size: .65rem; }
  }

  /* Paysage mobile */
  @media (max-width: 768px) and (orientation: landscape) {
    .oda-menu { width: min(50vw, 260px); }
    .oda-menu-hero { padding: 14px 14px 12px; }
    .oda-hero-top { margin-bottom: 10px; }
    .oda-nav-link { min-height: 40px; padding: 7px 10px; }
    .oda-header-inner { height: 46px; }
    .oda-content { padding-top: calc(46px + env(safe-area-inset-top, 0px)); }
  }

  /* Cibles tactiles minimales */
  @media (hover: none) and (pointer: coarse) {
    .oda-nav-link  { -webkit-tap-highlight-color: transparent; }
    .oda-ham-btn   { min-width: 44px; min-height: 44px; }
    .oda-hero-close { min-width: 44px; min-height: 44px; }
  }
`;

/* ══════════════════════════════════════════════════════════
   DASHBOARD LAYOUT — menu hamburger intégré et persistant
══════════════════════════════════════════════════════════ */
export default function DashboardLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLangState]   = useState('fr');
  const { user, loading }       = useAuth();
  const router                  = useRouter();
  const pathname                = usePathname();

  /* Charger la langue sauvegardée */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('oda-lang');
      if (saved === 'en' || saved === 'fr') setLangState(saved);
    } catch (_) {}
  }, []);

  function setLang(l) {
    setLangState(l);
    try { localStorage.setItem('oda-lang', l); } catch (_) {}
  }

  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['fr'][key] ?? key;

  const NAV_LINKS = [
    { href: '/dashboard',              icon: '📊', labelKey: 'dashboard',  color: 'blue'   },
    { href: '/dashboard/produits',     icon: '📦', labelKey: 'products',   color: 'orange' },
    { href: '/dashboard/commandes',    icon: '📋', labelKey: 'orders',     color: 'green'  },
    { href: '/dashboard/clients',      icon: '👥', labelKey: 'clients',    color: 'purple' },
    { href: '/dashboard/messages',     icon: '💬', labelKey: 'messages',   color: 'pink'   },
     { href: '/dashboard/marketing',     icon: '🌐', labelKey: 'oda-ADS',   color: 'red'   },
  ];

  const NAV_LINKS_SECONDARY = [
    { href: '/dashboard/statistiques', icon: '📈', labelKey: 'statistics', color: 'teal'   },
    { href: '/dashboard/parametres',   icon: '⚙️', labelKey: 'settings',   color: 'indigo' },
    { href: '/dashboard/boutique',     icon: '🏪', labelKey: 'myShop',     color: 'red'    },
  ];

  /* Redirect si non authentifié */
  useEffect(() => {
    if (!loading && !user) router.replace('/connexion');
  }, [user, loading, router]);

  /* Bloquer le scroll quand le menu est ouvert */
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('oda-noscroll');
    } else {
      document.body.classList.remove('oda-noscroll');
    }
    return () => document.body.classList.remove('oda-noscroll');
  }, [menuOpen]);

  /* Fermer le menu lors d'un changement de route */
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  /* Injection des styles globaux une seule fois */
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('oda-layout-style')) return;
    const el = document.createElement('style');
    el.id = 'oda-layout-style';
    el.textContent = LAYOUT_STYLES;
    document.head.appendChild(el);
  }, []);

  /* Chargement */
  if (loading) {
    return <PageLoader />;
  }

  if (!user) return null;

  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.name         ||
    user?.user_metadata?.full_name    ||
    user?.email?.split('@')[0]        ||
    'Admin';

  const initiale = displayName.charAt(0).toUpperCase();

  function closeMenu() { setMenuOpen(false); }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className="oda-layout">

        {/* ── OVERLAY ── */}
        <div
          className={`oda-overlay${menuOpen ? ' open' : ''}`}
          onClick={closeMenu}
          aria-hidden="true"
        />

        {/* ── MENU PANEL ── */}
        <nav className={`oda-menu${menuOpen ? ' open' : ''}`} aria-label="Navigation principale">

          {/* Hero : logo + profil */}
          <div className="oda-menu-hero">
            <div className="oda-hero-top">
              <div className="oda-hero-logo">
                <div className="oda-hero-logo-icon">📝</div>
                <span className="oda-hero-logo-text">ODA</span>
              </div>
              <button className="oda-hero-close" onClick={closeMenu} aria-label={t('closeMenu')}>
                ✕
              </button>
            </div>
            <div className="oda-hero-profile">
              <div className="oda-hero-avatar">{initiale}</div>
              <div className="oda-hero-info">
                <div className="oda-hero-info-name">{displayName}</div>
                <div className="oda-hero-info-role">{t('administrator')}</div>
              </div>
              <div className="oda-hero-badge" />
            </div>
          </div>

          {/* Navigation */}
          <div className="oda-menu-nav">

            <div className="oda-nav-section-label">{t('sectionMain')}</div>

            {NAV_LINKS.map(({ href, icon, labelKey, color }, i) => (
              <Link
                key={href}
                href={href}
                data-color={color}
                className={`oda-nav-link oda-nav-anim-${i + 1}${pathname === href || (href !== '/dashboard' && pathname?.startsWith(href)) ? ' active' : ''}`}
                onClick={closeMenu}
              >
                <div className="oda-nav-icon-wrap"><span>{icon}</span></div>
                <span>{t(labelKey)}</span>
                <span className="oda-nav-chevron">›</span>
              </Link>
            ))}

            <div className="oda-divider" />
            <div className="oda-nav-section-label">{t('sectionOthers')}</div>

            {NAV_LINKS_SECONDARY.map(({ href, icon, labelKey, color }, i) => (
              <Link
                key={href}
                href={href}
                data-color={color}
                className={`oda-nav-link oda-nav-anim-${NAV_LINKS.length + i + 1}${pathname?.startsWith(href) ? ' active' : ''}`}
                onClick={closeMenu}
              >
                <div className="oda-nav-icon-wrap"><span>{icon}</span></div>
                <span>{t(labelKey)}</span>
                <span className="oda-nav-chevron">›</span>
              </Link>
            ))}

            <div className="oda-divider" />
            <div className="oda-nav-section-label">{t('sectionCommunity')}</div>

            {/* WhatsApp */}
            <a
              href="https://whatsapp.com/channel/0029Vb6mcUm5q08htMMdVA2v"
              className={`oda-social-link whatsapp oda-nav-anim-${NAV_LINKS.length + NAV_LINKS_SECONDARY.length + 1}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
            >
              <div className="oda-nav-icon-wrap">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.48-8.4z"/>
                </svg>
              </div>
              <span>{t('joinChannel')}</span>
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/+hqymnTrseaU2OWRk"
              className={`oda-social-link telegram oda-nav-anim-${NAV_LINKS.length + NAV_LINKS_SECONDARY.length + 2}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
            >
              <div className="oda-nav-icon-wrap">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#0088cc">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
              </div>
              <span>{t('telegramGroup')}</span>
            </a>

          </div>
        </nav>

        {/* ── HEADER ── */}
        <header className="oda-header">
          <div className="oda-header-inner">

            {/* Bouton hamburger */}
            <button
              className={`oda-ham-btn${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
              aria-expanded={menuOpen}
            >
              <span className="bar bar-1" />
              <span className="bar bar-2" />
              <span className="bar bar-3" />
            </button>

            {/* Marque centrée */}
            <span className="oda-brand">ODA</span>

            {/* Côté droit */}
            <div className="oda-header-right">

              {/* FR / EN */}
              <div className="oda-lang-btn" role="group" aria-label="Langue / Language">
                <button
                  className={`oda-lang-option${lang === 'fr' ? ' active' : ''}`}
                  onClick={() => setLang('fr')}
                  aria-pressed={lang === 'fr'}
                >FR</button>
                <button
                  className={`oda-lang-option${lang === 'en' ? ' active' : ''}`}
                  onClick={() => setLang('en')}
                  aria-pressed={lang === 'en'}
                >EN</button>
              </div>

              {/* Profil utilisateur — nom masqué sur petit écran via CSS */}
              <div className="oda-user-pill">
                <div className="oda-user-avatar">{initiale}</div>
                <span className="oda-user-name">{displayName}</span>
              </div>

            </div>
          </div>
        </header>

        {/* ── CONTENU ── */}
        <main className="oda-content">
          {children}
        </main>

      </div>
    </LanguageContext.Provider>
  );
}