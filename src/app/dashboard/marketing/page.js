'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/lib/supabase';

// ─── Config Supabase ─────────────────────────────────────────

// ─── 🔑 Config plateformes publicitaires (Meta, TikTok, YouTube…)
// ─── Pour changer une API plateforme, modifiez UNIQUEMENT platformsConfig.js
import {
  META_APP_ID,
  META_API_VERSION,
  PLATFORM_PRICES,
  COMMISSION_ODA_RATE,
  SMARTBOOST_FEE_RATE,
} from './platformsConfig';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@/lib/config';

function sb() {
  return getSupabase();
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
  { key:'storie',      icon:'⭕',  label:'Stories 24h',   color:'rgba(255,107,0,.12)', accent:'#FF9500' },
  { key:'services',    icon:'🛎️', label:'Services',      color:'rgba(52,199,89,.12)',  accent:'#34C759' },
];

// ─── SVG Icon helper ────────────────────────────────────────────
const iconSvg = (emoji, size = 20) => {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { verticalAlign: 'middle' } };
  switch (emoji) {
    case '🌱': return <svg {...p}><path d="M12 22V12"/><path d="M12 12c0-4 4-6 8-6 0 4-2 6-8 6z"/><path d="M12 12c0-4-4-6-8-6 0 4 2 6 8 6z"/></svg>;
    case '✅': return <svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
    case '❌': return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case '👑': return <svg {...p}><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M12 22v-6"/></svg>;
    case '📡': return <svg {...p}><path d="M12 2v4"/><path d="M8 12a4 4 0 018 0"/><path d="M4 8a8 8 0 0116 0"/><path d="M12 22v-6"/><path d="M8 22h8"/></svg>;
    case '⚡': return <svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>;
    case '📈': return <svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 3.5 15.5"/><polyline points="17 6 23 6 23 12"/></svg>;
    case '⚙️': return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
    case '🏪': return <svg {...p}><path d="M3 9l2-7h14l2 7"/><path d="M5 9v10a2 2 0 002 2h10a2 2 0 002-2V9"/><path d="M9 21V13h6v8"/></svg>;
    case '🇨🇲': return <svg {...p}><rect x="1" y="4" width="22" height="16" rx="2" fill="currentColor" opacity=".15"/><line x1="12" y1="4" x2="12" y2="20"/><circle cx="12" cy="12" r="3" fill="currentColor" opacity=".3"/></svg>;
    case '📱': return <svg {...p}><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
    case '🔗': return <svg {...p}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
    case '👆': return <svg {...p}><path d="M14 15V5a2 2 0 00-4 0v10"/><path d="M8 11V3a2 2 0 00-4 0v12"/><path d="M14 8V5a2 2 0 014 0v10l-1.83 2.56A4 4 0 0010.5 21H9a4 4 0 01-4-4v-3"/></svg>;
    case '💡': return <svg {...p}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"/></svg>;
    case '📦': return <svg {...p}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
    case '💰': return <svg {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
    case '💸': return <svg {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/><line x1="18" y1="19" x2="21" y2="22"/><line x1="21" y1="16" x2="18" y2="19"/></svg>;
    case '📍': return <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
    case '📅': return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case '🤖': return <svg {...p}><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><circle cx="15" cy="10" r="2"/><path d="M9 16a3 3 0 006 0"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/></svg>;
    case '🕐': return <svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case '📉': return <svg {...p}><polyline points="23 18 13.5 8.5 8.5 13.5 3.5 8.5"/><polyline points="17 18 23 18 23 12"/></svg>;
    case '🔄': return <svg {...p}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>;
    case '📊': return <svg {...p}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
    case '👁️': return <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    case '👁': return <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    case '💵': return <svg {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
    case '🏆': return <svg {...p}><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 22v-5.17A7 7 0 007 11"/><path d="M12 11a4 4 0 00-4-4H6v3a4 4 0 004 4h4a4 4 0 004-4V7h-2a4 4 0 00-4 4z"/></svg>;
    case '🔒': return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
    case '🗑️': return <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>;
    case '🎯': return <svg {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
    case '🏠': return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case '🔍': return <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case '🔥': return <svg {...p}><path d="M12 23c-4 0-7-2.5-7-8 0-3.5 2.5-6 4-7 0 2 1.5 3 3 3s3-1 3-3c1.5 1 4 3.5 4 7 0 5.5-3 8-7 8z"/></svg>;
    case '✏️': return <svg {...p}><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
    case '💳': return <svg {...p}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
    case '🚀': return <svg {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
    case '🎵': return <svg {...p}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
    case '💬': return <svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
    case '📘': return <svg {...p}><rect x="3" y="2" width="18" height="20" rx="2"/><path d="M12 16h4"/><path d="M12 12h4"/><path d="M12 8h4"/><line x1="8" y1="8" x2="8.01" y2="8"/><line x1="8" y1="12" x2="8.01" y2="12"/><line x1="8" y1="16" x2="8.01" y2="16"/></svg>;
    case '▶️': return <svg {...p}><polygon points="5 3 19 12 5 21 5 3"/></svg>;
    case '🏁': return <svg {...p}><path d="M4 21V3h14l-2 5 2 5H4"/></svg>;
    case '⚠️': return <svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
    case '⏸': return <svg {...p}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
    case '🔔': return <svg {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
    default: return <span style={{fontSize:size > 16 ? undefined : '.85rem'}}>{emoji}</span>;
  }
};

// ─── CSS Global ────────────────────────────────────────────────


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
                {iconSvg(current.icon, 40)}
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
                    <div className="mkt-help-tip-icon">{iconSvg(tip.icon, 18)}</div>
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
                {isLast ? <>{iconSvg('✅', 16)} Compris, allons-y !</> : 'Suivant →'}
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

/* ══════════════════════════════════════════════════════════════
   ServiceCarousel — Bannière professionnelle défilante
══════════════════════════════════════════════════════════════ */
function ServiceCarousel() {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);

  const categories = [
    { label:'Coiffure & Beauté',       desc:'Coupe, tresses, tresses, soins esthétiques', gradient:'linear-gradient(135deg,#f093fb,#f5576c)',
      img:'https://images.unsplash.com/photo-C__JUIT_76E?w=400&h=300&fit=crop&q=80' },
    { label:'Menuiserie & Ébénisterie', desc:'Meubles sur mesure, rénovation bois, agencement', gradient:'linear-gradient(135deg,#ffecd2,#fcb69f)',
      img:'https://images.unsplash.com/photo-qj2pWULDYnE?w=400&h=300&fit=crop&q=80' },
    { label:'Restauration & Traiteur',  desc:'Plats cuisinés, pâtisserie, services traiteur', gradient:'linear-gradient(135deg,#fa709a,#fee140)',
      img:'https://images.unsplash.com/photo-gmQfS47FBOM?w=400&h=300&fit=crop&q=80' },
    { label:'Services de Commission',   desc:'Courses, livraison, paiement de factures', gradient:'linear-gradient(135deg,#4facfe,#00f2fe)',
      img:'https://images.unsplash.com/photo-WOsNSHiHV3k?w=400&h=300&fit=crop&q=80' },
    { label:'Photographie & Vidéo',     desc:'Shooting, mariage, clips publicitaires', gradient:'linear-gradient(135deg,#667eea,#764ba2)',
      img:'https://images.unsplash.com/photo-152brjBa5WA?w=400&h=300&fit=crop&q=80' },
    { label:'Nettoyage & Entretien',    desc:'Ménage, désinfection, jardinage', gradient:'linear-gradient(135deg,#43e97b,#38f9d7)',
      img:'https://images.unsplash.com/photo-o8Lyc1is43k?w=400&h=300&fit=crop&q=80' },
    { label:'Santé & Bien-être',        desc:'Massage, spa, coaching sportif, nutrition', gradient:'linear-gradient(135deg,#a18cd1,#fbc2eb)',
      img:'https://images.unsplash.com/photo-IYpn3d9O2y4?w=400&h=300&fit=crop&q=80' },
    { label:'Réparation & Dépannage',   desc:'Électricité, plomberie, serrurerie', gradient:'linear-gradient(135deg,#fccb90,#d57eeb)',
      img:'https://images.unsplash.com/photo-JCFzMlPNb9w?w=400&h=300&fit=crop&q=80' },
    { label:'Transport & Livraison',    desc:'Courses, colis, déménagement', gradient:'linear-gradient(135deg,#89f7fe,#66a6ff)',
      img:'https://images.unsplash.com/photo-NgH0WKgVR0A?w=400&h=300&fit=crop&q=80' },
    { label:'Événementiel & Fêtes',     desc:'Mariage, anniversaire, cérémonies', gradient:'linear-gradient(135deg,#f5576c,#f093fb)',
      img:'https://images.unsplash.com/photo-5zL2N_E_tkQ?w=400&h=300&fit=crop&q=80' },
    { label:'Formation & Coaching',     desc:'Cours, mentorat, développement pro', gradient:'linear-gradient(135deg,#764ba2,#667eea)',
      img:'https://images.unsplash.com/photo-KUzlAah2dog?w=400&h=300&fit=crop&q=80' },
    { label:'Couture & Retouches',      desc:'Confection, réparation, styling', gradient:'linear-gradient(135deg,#e0c3fc,#8ec5fc)',
      img:'https://images.unsplash.com/photo-pHFgs0oihAc?w=400&h=300&fit=crop&q=80' },
    { label:'Agriculture & Élevage',    desc:'Produits frais, plants, animaux', gradient:'linear-gradient(135deg,#43e97b,#30B068)',
      img:'https://images.unsplash.com/photo-9FdQND8pGDE?w=400&h=300&fit=crop&q=80' },
    { label:'Informatique & Digital',   desc:'Dev web, maintenance, cybersécurité', gradient:'linear-gradient(135deg,#4facfe,#00f2fe)',
      img:'https://images.unsplash.com/photo-APJkBRQJuj0?w=400&h=300&fit=crop&q=80' },
    { label:'Immobilier & Logement',    desc:'Location, vente, gestion locative', gradient:'linear-gradient(135deg,#fa709a,#f5576c)',
      img:'https://images.unsplash.com/photo-uByFsA048s0?w=400&h=300&fit=crop&q=80' },
    { label:'Design & Création',        desc:'Logo, branding, motions graphiques', gradient:'linear-gradient(135deg,#a18cd1,#f093fb)',
      img:'https://images.unsplash.com/photo-j60zrJOTn_o?w=400&h=300&fit=crop&q=80' },
    { label:'Mécanique & Garage',       desc:'Réparation auto-moto, vidange, pneus', gradient:'linear-gradient(135deg,#fccb90,#fcb69f)',
      img:'https://images.unsplash.com/photo-XP8o9_Arwqg?w=400&h=300&fit=crop&q=80' },
  ];

  useEffect(() => {
    timer.current = setInterval(() => setIdx(prev => (prev + 1) % categories.length), 3200);
    return () => clearInterval(timer.current);
  }, []);

  if (categories.length === 0) return null;

  const current = categories[idx];

  return (
    <div style={{ borderRadius:16, overflow:'hidden', marginBottom:16, position:'relative', boxShadow:'0 8px 24px rgba(0,0,0,.12)' }}>
      <div style={{ position:'relative', width:'100%', aspectRatio:'21/9', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden',
        background: current?.gradient, transition:'background .6s ease' }}>
        {/* Cercles décoratifs */}
        <div style={{ position:'absolute', top:'-20%', right:'-10%', width:'50%', aspectRatio:1, borderRadius:'50%', background:'rgba(255,255,255,.08)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-30%', left:'-15%', width:'60%', aspectRatio:1, borderRadius:'50%', background:'rgba(255,255,255,.06)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, textAlign:'center', color:'white', padding:'20px', width:'100%', boxSizing:'border-box' }}>
          <div style={{ width:80, height:60, borderRadius:10, overflow:'hidden', margin:'0 auto 10px', boxShadow:'0 4px 12px rgba(0,0,0,.2)' }}>
            <img src={current.img} alt={current.label} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
              onError={e => { e.target.style.display = 'none'; }} />
          </div>
          <div style={{ fontSize:'1.2rem', fontWeight:800, marginBottom:4, textShadow:'0 2px 8px rgba(0,0,0,.15)' }}>{current.label}</div>
          <div style={{ fontSize:'.78rem', opacity:.85, fontWeight:500 }}>{current.desc}</div>
        </div>
      </div>
      {/* Dots */}
      <div style={{ position:'absolute', bottom:10, left:'50%', transform:'translateX(-50%)', display:'flex', gap:5, zIndex:2, maxWidth:'80%', flexWrap:'wrap', justifyContent:'center' }}>
        {categories.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            style={{ width: i === idx ? 20 : 6, height:6, borderRadius:3, border:'none', cursor:'pointer',
              background: i === idx ? 'white' : 'rgba(255,255,255,.45)', transition:'all .3s', padding:0 }} />
        ))}
      </div>
      {/* Flèches */}
      {categories.length > 1 && (
        <>
          <button onClick={() => setIdx(prev => (prev - 1 + categories.length) % categories.length)}
            style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,.2)', backdropFilter:'blur(6px)', border:'none', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', zIndex:2, transition:'background .15s', lineHeight:1 }}>
            ‹
          </button>
          <button onClick={() => setIdx(prev => (prev + 1) % categories.length)}
            style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,.2)', backdropFilter:'blur(6px)', border:'none', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', zIndex:2, transition:'background .15s', lineHeight:1 }}>
            ›
          </button>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ServiceQuotaWarning — Indicateur de quota discret
══════════════════════════════════════════════════════════════ */
function ServiceQuotaWarning({ user, services, router }) {
  const [quota, setQuota] = useState(null);
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const sb = getSupabase();
        const { data: abo } = await sb.from('abonnements').select('*').eq('user_id', user.id).single();
        let limite = 10;
        if (abo && new Date(abo.date_expiration) > new Date()) limite = abo.limite_produits;
        const { data: produits } = await sb.from('produits').select('id').eq('user_id', user.id).eq('statut', 'published');
        const nbProduits = produits?.length || 0;
        const nbServices = services?.length || 0;
        const total = nbProduits + nbServices;
        if (!cancelled) setQuota({ total, limite, restant: limite - total, nbProduits, nbServices });
      } catch (e) { console.error(e); }
    })();
    return () => { cancelled = true; };
  }, [user, services]);
  if (!quota || quota.restant > 5 || quota.restant < 0) return null;
  const pct = (quota.total / quota.limite) * 100;
  return (
    <div style={{ marginBottom:14, padding:'10px 14px', borderRadius:10, background:'rgba(255,149,0,.08)', border:'1px solid rgba(255,149,0,.2)', display:'flex', alignItems:'center', gap:10, fontSize:'.78rem' }}>
      <span style={{ fontSize:'1.1rem', flexShrink:0 }}>{quota.restant === 0 ? '🔴' : '🟠'}</span>
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
          <span style={{ fontWeight:600, color:'#8B5E00' }}>
            {quota.restant === 0 ? 'Quota atteint' : `Plus que ${quota.restant} emplacement${quota.restant > 1 ? 's' : ''}`}
          </span>
          <span style={{ fontWeight:700, color:'#8B5E00' }}>{quota.total}/{quota.limite}</span>
        </div>
        <div style={{ height:4, borderRadius:4, background:'rgba(255,149,0,.15)', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, background: quota.restant === 0 ? '#FF3B30' : '#FF9500', borderRadius:4, transition:'width .4s' }} />
        </div>
      </div>
      {quota.restant === 0 && (
        <button onClick={() => router.push('/abonnement')} style={{ padding:'6px 12px', background:'#FF9500', color:'white', border:'none', borderRadius:8, fontWeight:600, fontSize:'.72rem', cursor:'pointer', whiteSpace:'nowrap', fontFamily:'Poppins,sans-serif' }}>
          Abonnement
        </button>
      )}
    </div>
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

  // ─── State Status (Stories)
  const [myStatuses, setMyStatuses] = useState([]);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [showCreateStatus, setShowCreateStatus] = useState(false);
  const [statusFile, setStatusFile] = useState(null);
  const [selectedStatusForView, setSelectedStatusForView] = useState(null);
  const [statusPreview, setStatusPreview] = useState(null);
  const [statusCaption, setStatusCaption] = useState('');
  const [statusUploading, setStatusUploading] = useState(false);
  const [statusType, setStatusType] = useState('image'); // 'image' | 'video'
  const [showVideoTrimmer, setShowVideoTrimmer] = useState(false);
  const [videoTrimStart, setVideoTrimStart] = useState(0);
  const [videoTrimEnd, setVideoTrimEnd] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [originalFile, setOriginalFile] = useState(null);
  const [trimmingVideo, setTrimmingVideo] = useState(false);
  const [viewingStatus, setViewingStatus] = useState(null);
  const [statusComments, setStatusComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  // ─── Services
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showCreateService, setShowCreateService] = useState(false);
  const [serviceForm, setServiceForm] = useState({ nom:'', description:'', whatsapp:'', lieu:'' });
  const [serviceImages, setServiceImages] = useState([]);
  const [serviceVideoUrl, setServiceVideoUrl] = useState('');
  const [serviceUploading, setServiceUploading] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceStep, setServiceStep] = useState(1);
  const [servicePrix, setServicePrix] = useState('');
  const trimmerRef = useRef(null);
  const framesCache = useRef(null);

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

  // ─── Status / Stories
  useEffect(() => {
    if (!user) return;
    chargerStatus();
    const interval = setInterval(chargerStatus, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function chargerStatus() {
    try {
      const { data, error } = await sb()
        .from('shop_statuses')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMyStatuses(data || []);
    } catch (err) {
      console.error('Erreur chargement status:', err);
    } finally {
      setLoadingStatuses(false);
    }
  }

  // ─── Charger commentaires du status sélectionné
  useEffect(() => {
    if (!selectedStatusForView) { setStatusComments([]); return; }
    let cancelled = false;
    setLoadingComments(true);
    sb()
      .from('shop_status_comments')
      .select('*')
      .eq('status_id', selectedStatusForView.id)
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (!cancelled) setStatusComments(data || []);
      })
      .catch(() => { if (!cancelled) setStatusComments([]); })
      .finally(() => { if (!cancelled) setLoadingComments(false); });
    return () => { cancelled = true; };
  }, [selectedStatusForView]);

  // ─── Charger les services
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoadingServices(true);
    sb()
      .from('services')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) setServices(data || []);
      })
      .catch(() => { if (!cancelled) setServices([]); })
      .finally(() => { if (!cancelled) setLoadingServices(false); });
    return () => { cancelled = true; };
  }, [user]);

  // ─── Vérification quota avant création service ──
  async function verifierQuotaAvantService() {
    try {
      const { data: abo } = await sb().from('abonnements').select('*').eq('user_id', user.id).single();
      let limite = 10;
      if (abo && new Date(abo.date_expiration) > new Date()) limite = abo.limite_produits;
      const [produits, servs] = await Promise.all([
        sb().from('produits').select('id').eq('user_id', user.id).eq('statut', 'published'),
        sb().from('services').select('id').eq('user_id', user.id).eq('statut', 'actif'),
      ]);
      const total = (produits.data?.length || 0) + (servs.data?.length || 0);
      const restant = limite - total;
      if (total >= limite) {
        toast(`⚠️ Quota atteint : ${total}/${limite} (produits + services). Abonnez-vous pour ajouter plus.`, 'warning');
        setTimeout(() => router.push('/abonnement'), 1500);
        return false;
      }
      if (restant <= 2) toast(`💡 Plus que ${restant} emplacement${restant > 1 ? 's' : ''} disponible${restant > 1 ? 's' : ''} sur ${limite}`, 'info');
      return true;
    } catch (e) {
      console.error('Erreur quota service:', e);
      return true;
    }
  }

  async function handleCreateService() {
    if (serviceUploading) return;
    if (!serviceForm.nom.trim()) { toast('⚠️ Le nom du service est requis', 'warning'); return; }
    if (serviceImages.filter(Boolean).length === 0 && !editingService) { toast('⚠️ Ajoutez au moins une image', 'warning'); return; }
    // Vérifier quota pour les nouveaux services
    if (!editingService) {
      const ok = await verifierQuotaAvantService();
      if (!ok) { setServiceUploading(false); return; }
    }
    try {
      let uploadedImages = editingService ? [...(editingService.images || [])] : [];
      // Uploader les nouvelles images (filtrer les null des cases vidées)
      for (const file of serviceImages.filter(Boolean)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        fd.append('folder', `services/${user.id}`);
        fd.append('quality', 'auto:good');
        const resp = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
        if (!resp.ok) { const errData = await resp.json().catch(() => ({})); throw new Error(errData?.error?.message || `Cloudinary erreur ${resp.status}`); }
        const result = await resp.json();
        uploadedImages.push(result.secure_url);
        // Limiter à 4 images
        if (uploadedImages.length >= 4) break;
      }

      const payload = {
        nom: serviceForm.nom.trim(),
        description: serviceForm.description.trim(),
        whatsapp: serviceForm.whatsapp.trim(),
        lieu: serviceForm.lieu.trim(),
        images: uploadedImages,
        video_url: serviceVideoUrl.trim(),
        prix: servicePrix ? Number(servicePrix) : null,
      };

      if (editingService) {
        const { error } = await sb().from('services').update(payload).eq('id', editingService.id);
        if (error) throw error;
        toast('✅ Service modifié avec succès !', 'success');
      } else {
        payload.user_id = user.id;
        const { error } = await sb().from('services').insert(payload);
        if (error) throw error;
        toast('✅ Service créé avec succès !', 'success');
      }

      setShowCreateService(false);
      resetServiceForm();
      // Recharger les services
      const { data, error } = await sb().from('services').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (!error) setServices(data || []);
    } catch (err) {
      toast('❌ Erreur: ' + err.message, 'error');
    } finally {
      setServiceUploading(false);
    }
  }

  function resetServiceForm() {
    setServiceForm({ nom:'', description:'', whatsapp:'', lieu:'' });
    setServiceImages([]);
    setServiceVideoUrl('');
    setEditingService(null);
    setServiceStep(1);
    setServicePrix('');
  }

  async function handleDeleteService(id) {
    try {
      const { error } = await sb().from('services').delete().eq('id', id);
      if (error) throw error;
      toast('🗑️ Service supprimé', 'info');
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      toast('❌ Erreur: ' + err.message, 'error');
    }
  }

  function openEditService(svc) {
    setEditingService(svc);
    setServiceForm({
      nom: svc.nom || '',
      description: svc.description || '',
      whatsapp: svc.whatsapp || '',
      lieu: svc.lieu || '',
    });
    setServiceVideoUrl(svc.video_url || '');
    setServicePrix(svc.prix || '');
    setServiceStep(1);
    setShowCreateService(true);
  }

  function stepLabel(step) { return ['','Nommez et décrivez votre service','Ajoutez photos et vidéo','WhatsApp, lieu et prix','Vérifiez avant publication'][step] || ''; }

  async function handleCreateStatus() {
    if (!statusFile || statusUploading) return;
    setStatusUploading(true);
    try {
      const isVideo = statusType === 'video';
      const fd = new FormData();
      fd.append('file', statusFile);
      fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      fd.append('folder', `status/${user.id}`);
      if (!isVideo) fd.append('quality', 'auto:good');
      const endpoint = isVideo ? 'video' : 'image';
      const resp = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${endpoint}/upload`, { method: 'POST', body: fd });
      if (!resp.ok) throw new Error('Upload échoué');
      const result = await resp.json();
      const { error } = await sb().from('shop_statuses').insert({
        user_id: user.id,
        media_url: result.secure_url,
        caption: statusCaption.trim(),
        type: statusType,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      if (error) throw error;
      toast('✅ Status publié avec succès !', 'success');
      setShowCreateStatus(false);
      setStatusFile(null);
      setStatusPreview(null);
      setStatusCaption('');
      setStatusType('image');
      chargerStatus();
    } catch (err) {
      toast('❌ Erreur: ' + err.message, 'error');
    } finally {
      setStatusUploading(false);
    }
  }

  async function handleDeleteStatus(id) {
    try {
      const { error } = await sb().from('shop_statuses').delete().eq('id', id);
      if (error) throw error;
      toast('🗑️ Status supprimé', 'info');
      chargerStatus();
    } catch (err) {
      toast('❌ Erreur: ' + err.message, 'error');
    }
  }

  function handleClearStatusFile() {
    setStatusFile(null);
    setStatusPreview(null);
    setStatusType('image');
    setOriginalFile(null);
    setShowVideoTrimmer(false);
    framesCache.current = null;
    const input = document.getElementById('statusFileInput');
    if (input) input.value = '';
  }

  function handleStatusFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    if (!file.type.startsWith('image/') && !isVideo) { toast('Veuillez sélectionner une image ou une vidéo', 'error'); return; }
    if (isVideo) {
      if (file.size > 50 * 1024 * 1024) { toast('La vidéo ne doit pas dépasser 50 MB', 'error'); return; }
      const videoEl = document.createElement('video');
      videoEl.preload = 'metadata';
      videoEl.onloadedmetadata = () => {
        setVideoDuration(videoEl.duration);
        setOriginalFile(file);
        const maxEnd = Math.min(videoEl.duration, 80);
        setVideoTrimStart(0);
        setVideoTrimEnd(maxEnd);
        setShowVideoTrimmer(true);
        URL.revokeObjectURL(videoEl.src);
      };
      videoEl.onerror = () => { toast('Impossible de lire cette vidéo', 'error'); };
      videoEl.src = URL.createObjectURL(file);
    } else {
      if (file.size > 10 * 1024 * 1024) { toast("L'image ne doit pas dépasser 10 MB", 'error'); return; }
      setStatusFile(file);
      setStatusType('image');
      const reader = new FileReader();
      reader.onload = ev => setStatusPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  }

  async function handleTrimVideo() {
    if (!originalFile) return;
    const start = videoTrimStart;
    const end = Math.min(videoTrimEnd, start + 80);
    if (end - start < 1) { toast('La durée minimale est de 1 seconde', 'error'); return; }
    setTrimmingVideo(true);
    try {
      const isFullVideo = start <= 0.5 && end >= Math.min(videoDuration - 0.5, 79.5);
      if (isFullVideo) {
        setStatusFile(originalFile);
        setStatusType('video');
        setStatusPreview(URL.createObjectURL(originalFile));
        setShowVideoTrimmer(false);
        setOriginalFile(null);
        framesCache.current = null;
        toast('✅ Vidéo prête', 'success');
        setTrimmingVideo(false);
        return;
      }
      const blob = await trimVideoFile(originalFile, start, end);
      if (blob.size === 0) throw new Error('La coupe a produit un fichier vide');
      const trimmedFile = new File([blob], originalFile.name.replace(/\.[^.]+$/, '_trimmed.webm'), { type: 'video/webm' });
      setStatusFile(trimmedFile);
      setStatusType('video');
      setStatusPreview(URL.createObjectURL(trimmedFile));
      setShowVideoTrimmer(false);
      setOriginalFile(null);
      framesCache.current = null;
      toast('✅ Vidéo coupée avec succès', 'success');
    } catch (err) {
      toast('❌ Erreur lors de la coupe: ' + err.message, 'error');
    } finally {
      setTrimmingVideo(false);
    }
  }

  /* ── Extraire les frames pour la filmstrip ── */
  function extractFrames(videoUrl, duration, maxFrames = 50) {
    return new Promise(resolve => {
      if (framesCache.current) { resolve(framesCache.current); return; }
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      const interval = Math.max(0.5, duration / maxFrames);
      const total = Math.min(maxFrames, Math.ceil(duration / interval));
      const frames = [];
      let captured = 0;
      const canvas = document.createElement('canvas');
      canvas.width = 80;
      canvas.height = 142;
      const ctx = canvas.getContext('2d');
      video.onloadeddata = () => {
        const grab = (t) => {
          if (captured >= total) { video.pause(); URL.revokeObjectURL(videoUrl); framesCache.current = frames; resolve(frames); return; }
          video.currentTime = t;
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, 80, 142);
            frames.push(canvas.toDataURL('image/jpeg', 0.5));
            captured++;
            grab(t + interval);
          };
        };
        grab(0);
      };
      video.onerror = () => resolve([]);
      video.src = videoUrl;
    });
  }

  /* ── Initialiser le trimmer WhatsApp-style ── */
  useEffect(() => {
    if (!showVideoTrimmer || !originalFile) return;
    const url = URL.createObjectURL(originalFile);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.onloadedmetadata = async () => {
      const dur = video.duration;
      setVideoDuration(dur);
      setVideoTrimStart(0);
      setVideoTrimEnd(Math.min(80, dur));
      const frames = await extractFrames(url, dur);
      renderFilmstrip(frames, dur);
    };
    video.src = url;
    return () => { URL.revokeObjectURL(url); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showVideoTrimmer]);

  /* ── Rendu de la filmstrip + handles ── */
  function renderFilmstrip(frames, dur) {
    const container = document.getElementById('trimmerStrip');
    if (!container || !frames.length) return;
    container.innerHTML = frames.map(f => `<div class="mkt-trim-frame" style="background-image:url('${f}')"></div>`).join('');
    initHandles(dur);
  }

  function initHandles(dur) {
    const wrap = document.getElementById('trimmerWrap');
    if (!wrap) return;
    const region = document.getElementById('trimRegion');
    const hLeft = document.getElementById('trimHandleLeft');
    const hRight = document.getElementById('trimHandleRight');
    const timeL = document.getElementById('trimTimeLeft');
    const timeR = document.getElementById('trimTimeRight');
    const info = document.getElementById('trimInfo');
    const maxDur = Math.min(80, dur);
    let dragging = null;

    function fmt(t) {
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      return `${m}:${s.toString().padStart(2,'0')}`;
    }

    function px(val) { return (val / dur) * 100; }

    function updateUI() {
      const pl = px(videoTrimStart);
      const pr = px(videoTrimEnd);
      region.style.left = pl + '%';
      region.style.width = (pr - pl) + '%';
      hLeft.style.left = pl + '%';
      hRight.style.left = pr + '%';
      timeL.textContent = fmt(videoTrimStart);
      timeR.textContent = fmt(videoTrimEnd);
      if (info) info.innerHTML = `✂️ <b>${(videoTrimEnd - videoTrimStart).toFixed(1)}s</b> sélectionnées sur ${fmt(dur)}`;
    }

    function posFromEvent(e) {
      const rect = wrap.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      return Math.max(0, Math.min(1, x / rect.width)) * dur;
    }

    function onStart(e, side) { e.preventDefault(); dragging = side; updateUI(); }
    function onMove(e) {
      if (!dragging) return;
      const t = posFromEvent(e);
      if (dragging === 'left') {
        const max = Math.min(videoTrimEnd - 0.5, videoTrimStart + maxDur);
        setVideoTrimStart(Math.max(0, Math.min(t, max)));
      } else {
        const min = Math.max(videoTrimStart + 0.5, videoTrimEnd - maxDur);
        setVideoTrimEnd(Math.min(dur, Math.max(t, min)));
      }
    }
    function onEnd() { dragging = null; }

    const opts = { passive: false };
    hLeft.addEventListener('touchstart', e => onStart(e, 'left'), opts);
    hRight.addEventListener('touchstart', e => onStart(e, 'right'), opts);
    hLeft.addEventListener('mousedown', e => onStart(e, 'left'), opts);
    hRight.addEventListener('mousedown', e => onStart(e, 'right'), opts);
    document.addEventListener('touchmove', onMove, opts);
    document.addEventListener('touchend', onEnd);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    updateUI();
  }

  /* ── Mise à jour UI quand les state trim changent ── */
  useEffect(() => {
    if (!showVideoTrimmer) return;
    const region = document.getElementById('trimRegion');
    const hLeft = document.getElementById('trimHandleLeft');
    const hRight = document.getElementById('trimHandleRight');
    const timeL = document.getElementById('trimTimeLeft');
    const timeR = document.getElementById('trimTimeRight');
    if (!region) return;
    const dur = videoDuration || 1;
    const pl = (videoTrimStart / dur) * 100;
    const pr = (videoTrimEnd / dur) * 100;
    region.style.left = pl + '%';
    region.style.width = (pr - pl) + '%';
    if (hLeft) hLeft.style.left = pl + '%';
    if (hRight) hRight.style.left = pr + '%';
    if (timeL) {
      const m = Math.floor(videoTrimStart / 60);
      const s = Math.floor(videoTrimStart % 60);
      timeL.textContent = `${m}:${s.toString().padStart(2,'0')}`;
    }
    if (timeR) {
      const m = Math.floor(videoTrimEnd / 60);
      const s = Math.floor(videoTrimEnd % 60);
      timeR.textContent = `${m}:${s.toString().padStart(2,'0')}`;
    }
    const info = document.getElementById('trimInfo');
    if (info) {
      const durFmt = (() => { const m = Math.floor(videoDuration / 60); const s = Math.floor(videoDuration % 60); return `${m}:${s.toString().padStart(2,'0')}`; })();
      info.innerHTML = `✂️ <b>${(videoTrimEnd - videoTrimStart).toFixed(1)}s</b> sélectionnées sur ${durFmt}`;
    }
  }, [videoTrimStart, videoTrimEnd, showVideoTrimmer, videoDuration]);

  /* ── La preview ne joue que la zone délimitée ── */
  useEffect(() => {
    if (!showVideoTrimmer) return;
    const video = document.getElementById('trimmerVideo');
    if (!video) return;
    const onPlay = () => { video.currentTime = videoTrimStart; };
    const onTimeUpdate = () => { if (video.currentTime >= videoTrimEnd) video.pause(); };
    video.addEventListener('play', onPlay);
    video.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [showVideoTrimmer, videoTrimStart, videoTrimEnd]);

  function trimVideoFile(file, startSec, endSec) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.onloadedmetadata = () => {
        if (!video.captureStream) { reject(new Error('La coupe vidéo n\'est pas supportée par ce navigateur')); return; }
        const stream = video.captureStream(30);
        const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
        const mimeType = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || '';
        if (!mimeType) { reject(new Error('Aucun format de capture supporté')); return; }
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
        const chunks = [];
        recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
        recorder.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          resolve(new Blob(chunks, { type: mimeType || 'video/webm' }));
        };
        recorder.onerror = () => { reject(new Error('Erreur d\'enregistrement')); };
        video.currentTime = startSec;
        video.play().catch(reject);
        recorder.start();
        const checkEnd = () => {
          if (video.currentTime >= endSec || video.ended) {
            video.pause();
            recorder.stop();
          } else {
            requestAnimationFrame(checkEnd);
          }
        };
        checkEnd();
      };
      video.onerror = reject;
      video.src = URL.createObjectURL(file);
    });
  }

  function getTimeRemaining(expiresAt) {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expiré';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}h` : `${m}min`;
  }

  // ────────────────────────────────────────────────────────────
  // CHARGEMENT / SAUVEGARDE connexions plateformes (DB)
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    chargerConnexions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function chargerConnexions() {
    try {
      const { data, error } = await sb()
        .from('meta_connexions')
        .select('platform_status, fb_user_id, fb_user_name')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data?.platform_status) {
        setMetaStatus(prev => ({ ...prev, ...data.platform_status }));
      }
      if (data?.fb_user_id && data?.fb_user_name) {
        setMetaAccessToken(data.fb_user_id);
      }
    } catch (e) {
      console.error('Erreur chargement connexions:', e);
    }
  }

  async function sauvegarderConnexions(status) {
    try {
      await sb().from('meta_connexions').upsert({
        user_id:         user.id,
        platform_status: status,
        updated_at:      new Date().toISOString(),
      }, { onConflict: 'user_id' });
    } catch (e) {
      console.error('Erreur sauvegarde connexions:', e);
    }
  }

  // Sauvegarder à chaque changement de metaStatus (debounce)
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => sauvegarderConnexions(metaStatus), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaStatus]);

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
        user_id:         user.id,
        fb_user_id:      fbId,
        fb_user_name:    fbName,
        access_token:    token,
        platform_status: metaStatus,
        connected_at:    new Date().toISOString(),
        updated_at:      new Date().toISOString(),
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
            {/* Boules floues animées */}
            <div className="mkt-hero-blur" style={{ width:220, height:220, background:'rgba(24,119,242,.45)', top:'-15%', right:'5%', animation:'mktFloat 8s ease-in-out infinite' }} />
            <div className="mkt-hero-blur" style={{ width:160, height:160, background:'rgba(255,107,0,.4)', bottom:'-10%', left:'8%', animation:'mktFloat2 10s ease-in-out infinite' }} />
            <div className="mkt-hero-blur" style={{ width:130, height:130, background:'rgba(52,199,89,.35)', top:'25%', left:'45%', animation:'mktFloat3 7s ease-in-out infinite' }} />
            <div className="mkt-hero-blur" style={{ width:180, height:180, background:'rgba(156,39,176,.35)', top:'-20%', left:'25%', animation:'mktFloat2 12s ease-in-out infinite 1s' }} />
            <div className="mkt-hero-blur" style={{ width:110, height:110, background:'rgba(255,193,7,.3)', bottom:'15%', right:'22%', animation:'mktFloat 9s ease-in-out infinite 2s' }} />
            <div className="mkt-hero-grid">
              <div>
                <h1 className="mkt-hero-title">ODA Marketing Center {iconSvg('🚀', 22)}</h1>
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
                    {iconSvg('⚡', 16)} Booster un produit
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
                    <div className="mkt-kpi-label">{iconSvg(k.icon, 18)} {k.label}</div>
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
                  {iconSvg(section.icon, 24)}
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
                <span style={{ background:'rgba(24,119,242,.1)', borderRadius:8, padding:'4px 8px' }}>{iconSvg('📡', 18)}</span>
                Connexions Plateformes
              </div>
              <button className="mkt-section-link">Tout gérer →</button>
            </div>
            {/* Bandeau info Meta */}
            <div style={{ background:'rgba(24,119,242,.06)', border:'1px solid rgba(24,119,242,.15)', borderRadius:12, padding:'12px 16px', marginBottom:14, fontSize:'.8rem', color:'#1877F2', fontWeight:500 }}>
              {iconSvg('💡', 16)} Connecter Facebook active automatiquement : Instagram, Business Manager, Ad Account et Meta Pixel en un seul clic.
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
                <span style={{ background:'rgba(255,107,0,.1)', borderRadius:8, padding:'4px 8px' }}>{iconSvg('⚡', 18)}</span>
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
                <span style={{ background:'rgba(88,86,214,.1)', borderRadius:8, padding:'4px 8px' }}>{iconSvg('👑', 18)}</span>
                Packs Publicitaires
              </div>
              <span style={{ fontSize:'.72rem', color:'var(--text-2)' }}>Paiement Mobile Money · CB</span>
            </div>
            <div className="mkt-packs-grid">
              {PACKS.map(pack => (
                <div key={pack.id} className={`mkt-pack${pack.popular ? ' popular' : ''}`}
                  style={pack.dark ? { background:'linear-gradient(135deg,#0a1628,#1a1035)', color:'white', border:'2px solid rgba(255,255,255,.1)' } : {}}
                >
                  {pack.popular && <div className="mkt-pack-badge">{iconSvg('⚡', 14)} LE PLUS POPULAIRE</div>}
                  <div className="mkt-pack-icon">{iconSvg(pack.icon, 28)}</div>
                  <div className="mkt-pack-name" style={pack.dark ? { color:'white' } : {}}>{pack.name}</div>
                  <div className="mkt-pack-price" style={{ color:pack.color }}>{pack.price.toLocaleString('fr-FR')} F</div>
                  <div className="mkt-pack-period" style={pack.dark ? { color:'rgba(255,255,255,.5)' } : {}}>{pack.period}</div>
                  {pack.features.map(([icon,txt], i) => (
                    <div className="mkt-pack-feature" key={i} style={pack.dark ? { color:'rgba(255,255,255,.85)' } : {}}>
                      {iconSvg(icon, 16)}
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
                <span style={{ background:'rgba(52,199,89,.1)', borderRadius:8, padding:'4px 8px' }}>{iconSvg('📈', 18)}</span>
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
            <div className="mkt-card" style={{ marginTop:14 }}>
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
                    <div className="mkt-pref-label">{iconSvg('💸', 16)} Budget quotidien max</div>
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
                    <div className="mkt-pref-label">{iconSvg('📅', 16)} Budget mensuel max</div>
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
                    <div className="mkt-pref-label">{iconSvg('🤖', 16)} Auto-Boost</div>
                    <div className="mkt-pref-sub">Booster auto vos top produits</div>
                  </div>
                  <Toggle on={prefs.autoBoost} onToggle={() => handlePrefToggle('autoBoost')} />
                </div>
                <div className="mkt-pref-item" style={{ cursor:'pointer' }} onClick={() => handlePrefToggle('smartBoostAuto')}>
                  <div>
                    <div className="mkt-pref-label">{iconSvg('⚡', 16)} SmartBoost™ Auto</div>
                    <div className="mkt-pref-sub">Optimisation IA continue (+5%)</div>
                  </div>
                  <Toggle on={prefs.smartBoostAuto} onToggle={() => handlePrefToggle('smartBoostAuto')} />
                </div>
                <div className="mkt-pref-item" style={{ cursor:'pointer' }} onClick={() => handlePrefToggle('notifs')}>
                  <div>
                    <div className="mkt-pref-label">{iconSvg('🔔', 16)} Notifications</div>
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
            STORIE — Status 24h
        ══════════════════════════════════════ */}
        {showSection('storie') && (
          <div className="mkt-section mkt-status-section">
            <div className="mkt-section-head">
              <div className="mkt-section-title">
                <span style={{ background:'linear-gradient(135deg,#FF6B00,#FF9500)', borderRadius:8, padding:'4px 8px', color:'white' }}>⭕</span>
                Mes Status — Stories 24h
              </div>
              <button className="mkt-section-link" onClick={() => setShowCreateStatus(true)}>
                + Nouveau status
              </button>
            </div>
            <div className="mkt-card">
              {loadingStatuses ? (
                <div style={{ display:'flex', gap:12, padding:'8px 0' }}>
                  {[1,2,3].map(i => <div key={i} className="mkt-skeleton" style={{ width:100, aspectRatio:'9/16', borderRadius:16 }} />)}
                </div>
              ) : myStatuses.length === 0 ? (
                <div className="mkt-status-empty">
                  <div className="mkt-status-empty-icon">📸</div>
                  <div className="mkt-status-empty-txt">Aucun status actif</div>
                  <div className="mkt-status-empty-sub">Publiez une photo qui restera visible 24h sur ODA Marketplace</div>
                  <button
                    onClick={() => setShowCreateStatus(true)}
                    style={{ marginTop:14, padding:'10px 24px', background:'linear-gradient(135deg,var(--sb-orange),#FF9500)', color:'white', border:'none', borderRadius:12, fontWeight:700, fontSize:'0.85rem', cursor:'pointer', fontFamily:'Poppins,sans-serif' }}
                  >
                    + Créer un status
                  </button>
                </div>
              ) : (
                <div className="mkt-status-grid">
                  <div className="mkt-status-card mkt-status-add" onClick={() => setShowCreateStatus(true)}>
                    <div className="mkt-status-add-icon">+</div>
                    <div className="mkt-status-add-label">Nouveau</div>
                  </div>
                  {myStatuses.map(s => (
                    <div
                      key={s.id}
                      className="mkt-status-card"
                      style={{ backgroundImage: `url(${s.media_url})` }}
                      onClick={() => setSelectedStatusForView(s)}
                    >
                      <div className="mkt-status-overlay" />
                      {s.type === 'video' && <div className="mkt-status-video-badge">▶</div>}
                      <div className="mkt-status-views">👁 {s.views ?? 0}</div>
                      <button
                        className="mkt-status-delete"
                        onClick={e => { e.stopPropagation(); handleDeleteStatus(s.id); }}
                        title="Supprimer"
                      >
                        ✕
                      </button>
                      <span className="mkt-status-time">{getTimeRemaining(s.expires_at)}</span>
                      {s.caption && <span className="mkt-status-caption">{s.caption}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Views Status Modal ─── */}
        {selectedStatusForView && (
          <div className="mkt-status-views-modal" onClick={() => setSelectedStatusForView(null)}>
            <div className="mkt-status-views-card" onClick={e => e.stopPropagation()}>
              <button className="mkt-status-views-close" onClick={() => setSelectedStatusForView(null)}>✕</button>
              <div className={`mkt-status-views-media${selectedStatusForView.type === 'video' ? ' has-video' : ''}`}>
                {selectedStatusForView.type === 'video' ? (
                  <video src={selectedStatusForView.media_url} controls autoPlay playsInline style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:14 }} />
                ) : (
                  <img src={selectedStatusForView.media_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:14 }} />
                )}
              </div>
              <div className="mkt-status-views-stats">
                <div className="mkt-status-views-stat">
                  <span className="mkt-status-views-stat-icon">👁</span>
                  <span className="mkt-status-views-stat-num">{selectedStatusForView.views ?? 0}</span>
                  <span className="mkt-status-views-stat-label">vues</span>
                </div>
                <div className="mkt-status-views-stat">
                  <span className="mkt-status-views-stat-icon">⏱</span>
                  <span className="mkt-status-views-stat-num">{getTimeRemaining(selectedStatusForView.expires_at)}</span>
                  <span className="mkt-status-views-stat-label">restant</span>
                </div>
                <div className="mkt-status-views-stat">
                  <span className="mkt-status-views-stat-icon">{selectedStatusForView.type === 'video' ? '🎬' : '📷'}</span>
                  <span className="mkt-status-views-stat-num">{selectedStatusForView.type}</span>
                  <span className="mkt-status-views-stat-label">type</span>
                </div>
              </div>
              {selectedStatusForView.caption && (
                <div className="mkt-status-views-caption">{selectedStatusForView.caption}</div>
              )}
              <div className="mkt-status-views-date">
                Publié le {new Date(selectedStatusForView.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
              </div>
              <div className="mkt-status-comments-section">
                <div className="mkt-status-comments-head">
                  💬 Commentaires ({loadingComments ? '...' : statusComments.length})
                </div>
                {loadingComments ? (
                  <div className="mkt-status-comments-loading">Chargement...</div>
                ) : statusComments.length === 0 ? (
                  <div className="mkt-status-comments-empty">Aucun commentaire</div>
                ) : (
                  <div className="mkt-status-comments-list">
                    {statusComments.filter(c => !c.reply_to).map(c => (
                      <div key={c.id} className="mkt-status-comment">
                        <div className="mkt-status-comment-avatar">{(c.author_name || 'A')[0].toUpperCase()}</div>
                        <div className="mkt-status-comment-body">
                          <div className="mkt-status-comment-author">
                            {c.author_name || 'Anonyme'}
                            <span className="mkt-status-comment-date">· {new Date(c.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'short' })}</span>
                          </div>
                          <div className="mkt-status-comment-text">{c.content}</div>
                        </div>
                        {statusComments.filter(r => r.reply_to === c.id).length > 0 && (
                          <div className="mkt-status-comment-replies">
                            {statusComments.filter(r => r.reply_to === c.id).map(r => (
                              <div key={r.id} className="mkt-status-comment is-reply">
                                <div className="mkt-status-comment-avatar">{(r.author_name || 'A')[0].toUpperCase()}</div>
                                <div className="mkt-status-comment-body">
                                  <div className="mkt-status-comment-author">
                                    {r.author_name || 'Anonyme'}
                                    <span className="mkt-status-comment-date">· {new Date(r.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'short' })}</span>
                                  </div>
                                  <div className="mkt-status-comment-text">{r.content}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            SERVICES
        ══════════════════════════════════════ */}
        {showSection('services') && (
          <div className="mkt-section mkt-services-section">
            <div className="mkt-section-head">
              <div className="mkt-section-title">
                <span style={{ background:'linear-gradient(135deg,#34C759,#30B068)', borderRadius:8, padding:'4px 8px', color:'white' }}>🛎️</span>
                Vos Services
              </div>
              <button className="mkt-section-link" onClick={() => { setShowCreateService(true); setEditingService(null); }}>
                + Ajouter un service
              </button>
            </div>
            <ServiceCarousel />
            <ServiceQuotaWarning user={user} services={services} router={router} />
            <div className="mkt-card">
              {loadingServices ? (
                <div style={{ display:'flex', gap:12, padding:'16px 0', flexWrap:'wrap' }}>
                  {[1,2,3,4,5,6].map(i => <div key={i} className="mkt-skeleton" style={{ width:'calc(50% - 6px)', aspectRatio:'16/10', borderRadius:16 }} />)}
                </div>
              ) : services.length === 0 ? (
                <div className="mkt-status-empty">
                  <div className="mkt-status-empty-icon">🛎️</div>
                  <div className="mkt-status-empty-txt">Aucun service</div>
                  <div className="mkt-status-empty-sub">Créez votre premier service pour attirer des clients sur ODA Marketplace</div>
                  <button
                    onClick={() => { setShowCreateService(true); setEditingService(null); }}
                    style={{ marginTop:14, padding:'10px 24px', background:'linear-gradient(135deg,#34C759,#30B068)', color:'white', border:'none', borderRadius:12, fontWeight:700, fontSize:'0.85rem', cursor:'pointer', fontFamily:'Poppins,sans-serif' }}
                  >
                    + Créer un service
                  </button>
                </div>
              ) : (
                <div className="mkt-services-grid">
                  {services.map(svc => (
                    <div key={svc.id} className="mkt-service-card">
                      <div className="mkt-service-image-wrap">
                        {svc.images && svc.images.length > 0 ? (
                          <img src={svc.images[0]} alt={svc.nom} className="mkt-service-img"
                            onError={e => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect fill="%23F2F2F7" width="300" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-size="14">Aucune image</text></svg>'; }} />
                        ) : (
                          <div className="mkt-service-img-placeholder">📸</div>
                        )}
                        {svc.images && svc.images.length > 1 && (
                          <div className="mkt-service-multi-badge">+{svc.images.length}</div>
                        )}
                      </div>
                      <div className="mkt-service-body">
                        <div className="mkt-service-title">{svc.nom}</div>
                        {svc.prix && <div className="mkt-service-price">{Number(svc.prix).toLocaleString('fr-FR')} FCFA</div>}
                        {svc.description && <div className="mkt-service-desc">{svc.description}</div>}
                        <div className="mkt-service-meta-row">
                          {svc.whatsapp && (
                            <a href={`https://wa.me/${svc.whatsapp.replace(/\s/g,'')}`} target="_blank" rel="noopener noreferrer" className="mkt-service-whatsapp">
                              📱 {svc.whatsapp}
                            </a>
                          )}
                          {svc.lieu && (
                            <span className="mkt-service-lieu">📍 {svc.lieu}</span>
                          )}
                        </div>
                        {svc.images && svc.images.length > 0 && (
                          <div className="mkt-service-thumbs">
                            {svc.images.slice(0,4).map((img, i) => (
                              <img key={i} src={img} alt="" className="mkt-service-thumb"
                                onError={e => { e.target.style.display = 'none'; }}
                              />
                            ))}
                            {svc.images.length > 4 && <span className="mkt-service-thumb-more">+{svc.images.length - 4}</span>}
                          </div>
                        )}
                      </div>
                      <div className="mkt-service-actions">
                        <button className="mkt-service-btn mkt-service-edit" onClick={() => openEditService(svc)} title="Modifier">
                          ✏️
                        </button>
                        <button className="mkt-service-btn mkt-service-delete" onClick={() => { if(window.confirm('Supprimer ce service ?')) handleDeleteService(svc.id); }} title="Supprimer">
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                <span style={{ background:'rgba(255,107,0,.1)', borderRadius:8, padding:'4px 8px' }}>{iconSvg('🏪', 18)}</span>
                Publicité Interne ODA Marketplace
              </div>
              <button className="mkt-section-link">Gérer mes emplacements →</button>
            </div>
            <div className="mkt-card" style={{ marginBottom:14 }}>
              <div style={{ fontSize:'.9rem', fontWeight:700, marginBottom:14 }}>{iconSvg('📍', 16)} Emplacements disponibles</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(1,1fr)', gap:10 }}>
                {[
                  { icon:'🏠', name:"Page d'accueil ODA",    desc:'Bannière principale — 2 000+ visiteurs/jour', prix:'15 000 FCFA/sem', active:true,  badge:'🔥 TOP' },
                  { icon:'🔍', name:'Résultats de recherche', desc:'Apparaître en haut des recherches',           prix:'8 000 FCFA/sem',  active:false, badge:null },
                  { icon:'📦', name:'Pages catégorie',        desc:'Mise en avant par catégorie produit',         prix:'6 000 FCFA/sem',  active:true,  badge:null },
                  { icon:'📱', name:'Notifications push ODA', desc:'Notification directe aux acheteurs',          prix:'12 000 FCFA/sem', active:false, badge:'⚡ NOUVEAU' },
                ].map(slot => (
                  <div key={slot.name} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px', borderRadius:12, border:`1.5px solid ${slot.active ? 'rgba(255,107,0,.35)' : 'var(--border)'}`, background:slot.active ? 'rgba(255,107,0,.04)' : '#FAFAFA' }}>
                    {iconSvg(slot.icon, 28)}
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
              <div style={{ fontSize:'.9rem', fontWeight:700, marginBottom:14 }}>{iconSvg('👁', 18)} Aperçu — Produits Sponsorisés dans ODA</div>
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
                <div className="mkt-modal-title">{iconSvg('⚡', 20)} SmartBoost™</div>
                <div className="mkt-modal-sub">{boostProduct.nom} — {boostProduct.prix.toLocaleString('fr-FR')} FCFA</div>
              </div>
            </div>

            {/* ── Sélection des plateformes ── */}
            <div className="mkt-form-group">
              <label className="mkt-form-label">{iconSvg('📡', 16)} Plateformes de diffusion</label>

              {nbConnectees === 0 && (
                <div className="mkt-no-platform-alert">
                  {iconSvg('⚠️', 16)} Aucune plateforme connectée. Connectez au moins une plateforme dans la section "Connexions" pour booster votre produit.
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
                      <div className="mkt-platform-check-icon">{iconSvg(pf.emoji, 22)}</div>
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
              <label className="mkt-form-label">{iconSvg('📅', 16)} Durée de la campagne</label>
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
              <label className="mkt-form-label">{iconSvg('🎯', 16)} Audience cible</label>
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
              <label className="mkt-form-label">{iconSvg('🏁', 16)} Objectif de campagne</label>
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
              <div style={{ fontSize:'1.5rem' }}>{iconSvg('⚡', 28)}</div>
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
                      <span className="mkt-total-label">{plat?.emoji ? iconSvg(plat.emoji, 16) : null} {plat?.label} × {dureeJours}j</span>
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
                    <span className="mkt-total-label">{iconSvg('⚡', 14)} SmartBoost™ IA (+5%)</span>
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
              {iconSvg('💳', 16)} Payer {totalAPayer > 0 ? `${totalAPayer.toLocaleString('fr-FR')} FCFA` : '—'} et lancer le boost
            </button>
            <button className="mkt-modal-cancel" onClick={() => setBoostProduct(null)}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          MODAL CRÉATION STATUS
      ══════════════════════════════════════ */}
      {showCreateStatus && (
        <div className="mkt-status-create-modal" onClick={e => { if (e.target === e.currentTarget) setShowCreateStatus(false); }}>
          <div className="mkt-status-create-sheet">
            <div className="mkt-status-create-title">
              {statusType === 'video' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:6}}>
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:6}}>
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              )}
              Nouveau status
            </div>
            <div className="mkt-status-create-sub">Votre {statusType === 'video' ? 'vidéo' : 'photo'} sera visible 24h sur ODA Marketplace</div>

            {statusPreview && statusType === 'video' ? (
              <div className="mkt-status-preview has-video">
                <video src={statusPreview} autoPlay loop playsInline style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'inherit' }} />
                <button className="mkt-preview-remove" onClick={handleClearStatusFile} title="Retirer la vidéo">✕</button>
              </div>
            ) : (
              <div
                className={`mkt-status-preview ${statusPreview ? 'has-image' : ''}`}
                style={statusPreview ? { backgroundImage: `url(${statusPreview})` } : {}}
              >
                {!statusPreview ? (
                  <label htmlFor="statusFileInput" className="mkt-status-preview-placeholder" style={{ cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                    Ajoutez une photo ou vidéo
                  </label>
                ) : (
                  <>
                    <button className="mkt-preview-remove" onClick={handleClearStatusFile} title="Retirer la photo">✕</button>
                    <label htmlFor="statusFileInput" className="mkt-preview-change" style={{ position:'absolute', inset:0, cursor:'pointer', zIndex:1 }} />
                  </>
                )}
              </div>
            )}

            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleStatusFile}
              style={{ display: 'none' }}
              id="statusFileInput"
            />
            <label htmlFor="statusFileInput" className="mkt-status-upload-btn" style={{ display:'inline-flex', marginBottom:16 }}>
              {statusPreview ? (statusType === 'video' ? (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:5}}>
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg> Changer la vidéo</>
              ) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:5}}>
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
                </svg> Changer la photo</>
              )) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:5}}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg> Choisir une photo/vidéo</>
              )}
            </label>

            {/* ── VIDEO TRIMMER ─ STYLE WHATSAPP ── */}
            {showVideoTrimmer && originalFile && (
              <div className="mkt-trimmer">
                <div className="mkt-trimmer-bar">
                  <div className="mkt-trimmer-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:4}}>
                      <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                      <line x1="20" y1="4" x2="8.12" y2="15.88"/>
                      <line x1="14.47" y1="14.48" x2="20" y2="20"/>
                      <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                    </svg>
                    Ajuster la sélection
                  </div>
                  <div className="mkt-trimmer-dur">
                    {(() => { const m = Math.floor(videoDuration / 60); const s = Math.floor(videoDuration % 60); return `${m}:${s.toString().padStart(2,'0')}`; })()}
                  </div>
                </div>
                <div className="mkt-trimmer-preview">
                  <video
                    src={URL.createObjectURL(originalFile)}
                    controls
                    preload="auto"
                    style={{ width:'100%', borderRadius:10, maxHeight:200 }}
                    id="trimmerVideo"
                  />
                </div>
                <div className="mkt-trimmer-strip-wrap" id="trimmerWrap">
                  <div className="mkt-trimmer-strip" id="trimmerStrip" ref={trimmerRef} />
                  <div className="mkt-trimmer-shade left" id="trimShadeLeft" />
                  <div className="mkt-trimmer-shade right" id="trimShadeRight" />
                  <div className="mkt-trimmer-region" id="trimRegion" />
                  <div className="mkt-trimmer-handle left" id="trimHandleLeft">
                    <span className="mkt-trimmer-handle-line" />
                    <span className="mkt-trimmer-time" id="trimTimeLeft">0:00</span>
                  </div>
                  <div className="mkt-trimmer-handle right" id="trimHandleRight">
                    <span className="mkt-trimmer-handle-line" />
                    <span className="mkt-trimmer-time" id="trimTimeRight">0:00</span>
                  </div>
                </div>
                <div className="mkt-trimmer-info" id="trimInfo">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:4}}>
                    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
                    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
                    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                  </svg>
                  <b>0.0s</b> sélectionnées
                </div>
                <div className="mkt-trimmer-actions">
                  <button
                    className="mkt-status-submit"
                    onClick={handleTrimVideo}
                    disabled={trimmingVideo || (videoTrimEnd - videoTrimStart) > 80}
                    style={{ flex:1 }}
                  >
                    {trimmingVideo ? (
                      <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:5}} className="mkt-spinner">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg> Coupe en cours...</>
                    ) : (
                      <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:5}}>
                        <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                        <line x1="20" y1="4" x2="8.12" y2="15.88"/>
                        <line x1="14.47" y1="14.48" x2="20" y2="20"/>
                        <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                      </svg> Appliquer la coupe</>
                    )}
                  </button>
                  <button
                    className="mkt-status-cancel"
                    onClick={() => { setShowVideoTrimmer(false); setOriginalFile(null); framesCache.current = null; document.getElementById('statusFileInput').value = ''; }}
                    style={{ flex:1 }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {!showVideoTrimmer && (<>
            <textarea
              className="mkt-status-caption-input"
              placeholder="Ajouter une légende (optionnel)..."
              value={statusCaption}
              onChange={e => setStatusCaption(e.target.value)}
              maxLength={150}
            />
            <div style={{ textAlign:'right', fontSize:'0.68rem', color:'var(--text-3)', marginTop:4 }}>
              {statusCaption.length}/150
            </div>

            <button
              className="mkt-status-submit"
              onClick={handleCreateStatus}
              disabled={!statusFile || statusUploading}
            >
              {statusUploading ? (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:5}} className="mkt-spinner">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg> Publication...</>
              ) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:5}}>
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg> Publier mon status</>
              )}
            </button>
            <button className="mkt-status-cancel" onClick={() => { setShowCreateStatus(false); handleClearStatusFile(); setStatusCaption(''); }}>
              Annuler
            </button>
            </>)}
          </div>
        </div>
      )}

      {/* ─── MODAL CRÉATION SERVICE — Wizard multi-étapes ─── */}
      {showCreateService && (
        <div className="mkt-service-create-modal" onClick={e => { if (e.target === e.currentTarget) { setShowCreateService(false); resetServiceForm(); } }}>
          <div className="mkt-service-create-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div className="mkt-service-create-title" style={{ margin:0 }}>
                {editingService ? '✏️ Modifier' : '🛎️ Nouveau service'}
              </div>
              {!editingService && (
                <div style={{ fontSize:'.7rem', color:'var(--text-3)', fontWeight:600 }}>
                  {serviceStep}/4
                </div>
              )}
            </div>
            <div className="mkt-service-create-sub" style={{ marginBottom:14 }}>
              {editingService ? 'Modifiez les informations ci-dessous' : stepLabel(serviceStep)}
            </div>

            {/* ── Progression ── */}
            {!editingService && (
              <div className="mkt-wizard-progress">
                {[1,2,3,4].map((s, i) => (
                  <div key={s} className="mkt-wizard-prog-track" style={{ flex: i < 3 ? 1 : undefined }}>
                    <div className={`mkt-wizard-prog-circle${serviceStep > s ? ' done' : ''}${serviceStep === s ? ' active' : ''}`}
                      onClick={() => s < serviceStep && setServiceStep(s)}>
                      {serviceStep > s ? '✓' : s}
                    </div>
                    {i < 3 && <div className={`mkt-wizard-prog-line${serviceStep > s ? ' done' : ''}`} />}
                  </div>
                ))}
                <div className="mkt-wizard-prog-labels">
                  {['Service','Visuels','Coords','Confirmer'].map((l, i) => (
                    <span key={l} className={`mkt-wizard-prog-label${serviceStep === i+1 ? ' active' : ''}`}>{l}</span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Slides ── */}
            <div className="mkt-wizard-track-wrap">
              <div className="mkt-wizard-track" style={{ transform: `translateX(-${(serviceStep - 1) * 100}%)` }}>
                {/* Slide 1 : Nom + Description */}
                <div className="mkt-wizard-slide">
                  <div className="mkt-wizard-slide-icon">📋</div>
                  <div className="mkt-wizard-slide-title">Quel est votre service ?</div>
                  <div className="mkt-wizard-slide-desc">Donnez un nom clair et une description détaillée</div>
                  <input className="mkt-wizard-input" placeholder="Nom du service *" value={serviceForm.nom}
                    onChange={e => setServiceForm(p => ({...p, nom: e.target.value}))}
                    onKeyDown={e => e.key === 'Enter' && serviceForm.nom.trim() && setServiceStep(2)} />
                  <textarea className="mkt-wizard-textarea" placeholder="Description (optionnelle)" value={serviceForm.description}
                    onChange={e => setServiceForm(p => ({...p, description: e.target.value}))} rows={3} />
                </div>

                {/* Slide 2 : Visuels */}
                <div className="mkt-wizard-slide">
                  <div className="mkt-wizard-slide-icon">📸</div>
                  <div className="mkt-wizard-slide-title">Ajoutez des visuels</div>
                  <div className="mkt-wizard-slide-desc">Importez jusqu'à 4 photos. Vidéo par lien uniquement.</div>
                  <div className="mkt-wizard-images">
                    {[0,1,2,3].map(i => {
                      const imgFile = serviceImages[i] || null;
                      const existingImg = editingService?.images?.[i] && !imgFile ? editingService.images[i] : null;
                      const hasImg = !!imgFile || !!existingImg;
                      return (
                        <div key={i} className={`mkt-wizard-img-box${hasImg ? ' has' : ''}`} onClick={() => {
                          if (!imgFile && !existingImg) {
                            const inp = document.createElement('input');
                            inp.type = 'file'; inp.accept = 'image/*';
                            inp.onchange = e => { const f = e.target.files?.[0]; if (f) { setServiceImages(prev => { const a = [...prev]; a[i] = f; return a; }); } };
                            inp.click();
                          }
                        }}>
                          {imgFile ? (
                            <><img src={URL.createObjectURL(imgFile)} alt="" />
                              <button className="mkt-wizard-img-remove" onClick={e => { e.stopPropagation(); const a = [...serviceImages]; a[i] = null; setServiceImages(a); }}>✕</button></>
                          ) : existingImg ? (
                            <><img src={existingImg} alt="" />
                              <button className="mkt-wizard-img-remove" onClick={e => { e.stopPropagation(); const imgs = [...(editingService.images || [])]; imgs.splice(i,1); setEditingService({...editingService, images:imgs}); }}>✕</button></>
                          ) : <span style={{ fontSize:'1.6rem', color:'#ccc' }}>+</span>}
                        </div>
                      );
                    })}
                  </div>
                  <input className="mkt-wizard-input" placeholder="Lien vidéo (optionnel)" value={serviceVideoUrl}
                    onChange={e => setServiceVideoUrl(e.target.value)} style={{ marginTop:12 }} />
                </div>

                {/* Slide 3 : WhatsApp + Lieu + Prix */}
                <div className="mkt-wizard-slide">
                  <div className="mkt-wizard-slide-icon">📍</div>
                  <div className="mkt-wizard-slide-title">Où vous trouver ?</div>
                  <div className="mkt-wizard-slide-desc">Laissez vos coordonnées pour que les clients vous contactent</div>
                  <input className="mkt-wizard-input" placeholder="WhatsApp *" value={serviceForm.whatsapp}
                    onChange={e => setServiceForm(p => ({...p, whatsapp: e.target.value}))}
                    onKeyDown={e => e.key === 'Enter' && setServiceStep(4)} />
                  <input className="mkt-wizard-input" placeholder="Lieu (ex: Yaoundé)" value={serviceForm.lieu}
                    onChange={e => setServiceForm(p => ({...p, lieu: e.target.value}))} style={{ marginTop:10 }} />
                  <div className="mkt-wizard-prix-wrap">
                    <input className="mkt-wizard-input mkt-wizard-prix-input" type="number" placeholder="Prix (optionnel)" value={servicePrix}
                      onChange={e => setServicePrix(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && setServiceStep(4)} />
                    <span className="mkt-wizard-prix-suffix">FCFA</span>
                  </div>
                </div>

                {/* Slide 4 : Confirmation */}
                <div className="mkt-wizard-slide">
                  <div className="mkt-wizard-slide-icon">✅</div>
                  <div className="mkt-wizard-slide-title">Confirmation</div>
                  <div className="mkt-wizard-slide-desc">Vérifiez les informations avant de publier</div>
                  <div className="mkt-wizard-summary">
                    <div className="mkt-wizard-summary-item">
                      <span className="mkt-wizard-summary-label">Nom</span>
                      <span className="mkt-wizard-summary-value">{serviceForm.nom || '—'}</span>
                    </div>
                    {serviceForm.description && (
                      <div className="mkt-wizard-summary-item">
                        <span className="mkt-wizard-summary-label">Description</span>
                        <span className="mkt-wizard-summary-value">{serviceForm.description}</span>
                      </div>
                    )}
                    <div className="mkt-wizard-summary-item">
                      <span className="mkt-wizard-summary-label">Images</span>
                      <span className="mkt-wizard-summary-value">{serviceImages.filter(Boolean).length + (editingService?.images?.length || 0)} uploadée(s)</span>
                    </div>
                    <div className="mkt-wizard-summary-item">
                      <span className="mkt-wizard-summary-label">WhatsApp</span>
                      <span className="mkt-wizard-summary-value">{serviceForm.whatsapp || '—'}</span>
                    </div>
                    <div className="mkt-wizard-summary-item">
                      <span className="mkt-wizard-summary-label">Lieu</span>
                      <span className="mkt-wizard-summary-value">{serviceForm.lieu || '—'}</span>
                    </div>
                    {servicePrix && (
                      <div className="mkt-wizard-summary-item">
                        <span className="mkt-wizard-summary-label">Prix</span>
                        <span className="mkt-wizard-summary-value">{Number(servicePrix).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Navigation ── */}
            <div className="mkt-wizard-nav">
              {editingService ? (
                <>
                  <button className="mkt-modal-cancel" onClick={() => { setShowCreateService(false); resetServiceForm(); }}>Annuler</button>
                  <button className="mkt-modal-cta" onClick={handleCreateService} disabled={serviceUploading}>
                    {serviceUploading ? 'Modification...' : '💾 Enregistrer'}
                  </button>
                </>
              ) : serviceStep > 1 ? (
                <button className="mkt-wizard-btn mkt-wizard-prev" onClick={() => setServiceStep(s => s - 1)}>
                  ← Retour
                </button>
              ) : (
                <div />
              )}
              {!editingService && (
                serviceStep < 4 ? (
                  <button className="mkt-wizard-btn mkt-wizard-next"
                    onClick={() => { const next = serviceStep + 1; if (next <= 4) setServiceStep(next); }}
                    disabled={serviceStep === 1 && !serviceForm.nom.trim()}>
                    Suivant →
                  </button>
                ) : (
                  <button className="mkt-wizard-btn mkt-wizard-submit" onClick={handleCreateService} disabled={serviceUploading}>
                    {serviceUploading ? (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mkt-spinner" style={{verticalAlign:'middle',marginRight:4}}>
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg> Publication...</>
                    ) : editingService ? '💾 Enregistrer' : '✅ Publier le service'}
                  </button>
                )
              )}
            </div>
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