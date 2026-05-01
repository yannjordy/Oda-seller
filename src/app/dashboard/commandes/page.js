'use client';

import { useState, useEffect, useRef } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

/* ══════════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════════ */
const PAGE_CSS = `
  @keyframes cmd-fadeIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  @keyframes cmd-slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  @keyframes cmd-slideIn { from{transform:translateX(400px);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes cmd-fadeOut { to{opacity:0;transform:translateY(-10px)} }

  /* table */
  .cmd-table { width:100%; border-collapse:collapse; }
  .cmd-table thead { background:linear-gradient(135deg,#007AFF,#00C6FF); color:white; }
  .cmd-table th { padding:14px 16px; text-align:left; font-weight:600; font-size:.9rem; white-space:nowrap; }
  .cmd-table td { padding:14px 16px; border-bottom:1px solid rgba(0,122,255,.10); vertical-align:middle; }
  .cmd-table tbody tr { transition:.3s ease; cursor:pointer; }
  .cmd-table tbody tr:hover { background:rgba(0,122,255,.05); }

  /* Coloration des lignes du tableau selon le statut */
  .cmd-table tbody tr.row-en_attente,
  .cmd-table tbody tr.row-pending   { border-left:4px solid #FF9800; background:rgba(255,152,0,.03); }
  .cmd-table tbody tr.row-confirmee,
  .cmd-table tbody tr.row-processing { border-left:4px solid #2196F3; background:rgba(33,150,243,.03); }
  .cmd-table tbody tr.row-en_livraison,
  .cmd-table tbody tr.row-shipped   { border-left:4px solid #9C27B0; background:rgba(156,39,176,.03); }
  .cmd-table tbody tr.row-livree,
  .cmd-table tbody tr.row-delivered { border-left:4px solid #4CAF50; background:rgba(76,175,80,.03); }
  .cmd-table tbody tr.row-annulee,
  .cmd-table tbody tr.row-cancelled { border-left:4px solid #f44336; background:rgba(244,67,54,.03); }

  /* order card (mobile) */
  .cmd-card {
    background:white; border-radius:16px; padding:16px; margin-bottom:16px;
    box-shadow:0 2px 12px rgba(0,122,255,.08); border-left:4px solid #007AFF;
    animation:cmd-fadeIn .5s ease both;
  }

  /* Coloration des cartes selon le statut */
  .cmd-card.card-en_attente,
  .cmd-card.card-pending    { border-left-color:#FF9800; background:linear-gradient(135deg,#FFFDE7,white 40%); }
  .cmd-card.card-confirmee,
  .cmd-card.card-processing { border-left-color:#2196F3; background:linear-gradient(135deg,#E3F2FD,white 40%); }
  .cmd-card.card-en_livraison,
  .cmd-card.card-shipped    { border-left-color:#9C27B0; background:linear-gradient(135deg,#F3E5F5,white 40%); }
  .cmd-card.card-livree,
  .cmd-card.card-delivered  { border-left-color:#4CAF50; background:linear-gradient(135deg,#E8F5E9,white 40%); }
  .cmd-card.card-annulee,
  .cmd-card.card-cancelled  { border-left-color:#f44336; background:linear-gradient(135deg,#FFEBEE,white 40%); }

  /* status badges */
  .cmd-badge { display:inline-block; padding:4px 12px; border-radius:8px; font-size:.8rem; font-weight:600; }
  .cmd-pending     { background:rgba(255,152,0,.12); color:#FF9800; }
  .cmd-processing  { background:rgba(33,150,243,.12); color:#2196F3; }
  .cmd-shipped     { background:rgba(156,39,176,.12); color:#9C27B0; }
  .cmd-delivered   { background:rgba(76,175,80,.12);  color:#4CAF50; }
  .cmd-cancelled   { background:rgba(244,67,54,.12);  color:#f44336; }
  .cmd-en_attente  { background:rgba(255,152,0,.12);  color:#FF9800; }
  .cmd-confirmee   { background:rgba(33,150,243,.12); color:#2196F3; }
  .cmd-en_livraison{ background:rgba(156,39,176,.12); color:#9C27B0; }
  .cmd-livree      { background:rgba(76,175,80,.12);  color:#4CAF50; }
  .cmd-annulee     { background:rgba(244,67,54,.12);  color:#f44336; }

  /* sidebar stat card */
  .cmd-stat {
    background:rgba(255,255,255,.2); backdrop-filter:blur(10px);
    padding:16px; border-radius:12px; transition:.3s ease;
  }
  .cmd-stat:hover { background:rgba(255,255,255,.3); transform:scale(1.02); }

  /* filter buttons in sidebar */
  .cmd-filter-btn {
    width:100%; display:flex; align-items:center; justify-content:space-between;
    padding:10px 16px; background:rgba(255,255,255,.10); border:2px solid transparent;
    border-radius:12px; color:white; font-family:Poppins,sans-serif;
    font-weight:500; cursor:pointer; transition:.3s ease; margin-bottom:8px;
  }
  .cmd-filter-btn:hover { background:rgba(255,255,255,.20); }
  .cmd-filter-btn.active { background:white; color:#007AFF; border-color:white; }

  /* chip filters */
  .cmd-chip { padding:6px 14px; border-radius:20px; border:none; cursor:pointer; font-weight:600; font-size:.8rem; transition:.3s ease; }
  .cmd-chip.active { background:#007AFF; color:white; }
  .cmd-chip:not(.active) { background:#f3f4f6; color:#6E6E73; }

  /* form */
  .cmd-input {
    width:100%; padding:12px 14px; border:2px solid rgba(0,122,255,.20);
    border-radius:12px; font-family:Poppins,sans-serif; font-size:.95rem;
    outline:none; transition:.3s ease; background:white; color:#1D1D1F;
  }
  .cmd-input:focus { border-color:#007AFF; box-shadow:0 0 0 3px rgba(0,122,255,.15); }
  .cmd-textarea { min-height:80px; resize:vertical; }

  /* buttons */
  .cmd-btn-primary {
    padding:12px 24px; background:linear-gradient(135deg,#007AFF,#00C6FF);
    color:white; border:none; border-radius:12px; font-family:Poppins,sans-serif;
    font-weight:600; cursor:pointer; transition:.3s ease;
  }
  .cmd-btn-primary:hover { transform:translateY(-2px); box-shadow:0 4px 20px rgba(0,122,255,.3); }
  .cmd-btn-primary:disabled { opacity:.6; cursor:not-allowed; transform:none; }
  .cmd-btn-secondary {
    padding:12px 24px; background:white; color:#007AFF; border:2px solid #007AFF;
    border-radius:12px; font-family:Poppins,sans-serif; font-weight:600; cursor:pointer; transition:.3s ease;
  }
  .cmd-btn-secondary:hover { background:rgba(0,122,255,.10); }
  .cmd-btn-danger {
    padding:12px 24px; background:white; color:#FF3B30; border:2px solid #FF3B30;
    border-radius:12px; font-family:Poppins,sans-serif; font-weight:600; cursor:pointer; transition:.3s ease;
  }
  .cmd-btn-danger:hover { background:#FF3B30; color:white; }

  /* bouton WhatsApp */
  .cmd-btn-whatsapp {
    padding:12px 24px; background:linear-gradient(135deg,#25D366,#128C7E);
    color:white; border:none; border-radius:12px; font-family:Poppins,sans-serif;
    font-weight:600; cursor:pointer; transition:.3s ease; display:flex; align-items:center; gap:8px;
    text-decoration:none;
  }
  .cmd-btn-whatsapp:hover { transform:translateY(-2px); box-shadow:0 4px 20px rgba(37,211,102,.35); }

  /* bouton supprimer */
  .cmd-btn-delete {
    padding:6px 10px; background:rgba(255,59,48,.10); color:#FF3B30;
    border:none; border-radius:8px; cursor:pointer; font-size:.8rem;
    font-weight:600; font-family:Poppins,sans-serif; transition:.3s ease;
  }
  .cmd-btn-delete:hover { background:#FF3B30; color:white; }

  /* search input */
  .cmd-search {
    flex:1; min-width:200px; padding:10px 16px; border:2px solid rgba(0,122,255,.20);
    border-radius:12px; font-family:Poppins,sans-serif; font-size:1rem; outline:none; transition:.3s ease;
  }
  .cmd-search:focus { border-color:#007AFF; box-shadow:0 0 0 3px rgba(0,122,255,.15); }

  /* grid responsive */
  .cmd-layout {
    display:grid; grid-template-columns:260px 1fr 280px;
    gap:32px; max-width:1920px; margin:0 auto; padding:24px;
  }
  @media(max-width:1200px) {
    .cmd-layout { grid-template-columns:1fr; }
    .cmd-sidebar-left, .cmd-sidebar-right { display:none; }
    .cmd-sidebar-left.show, .cmd-sidebar-right.show { display:block; }
  }

  /* mobile cards vs table */
  .cmd-mobile-cards { display:none; }
  @media(max-width:768px) {
    .cmd-table-wrap { display:none; }
    .cmd-mobile-cards { display:block; }
  }

  /* notification */
  .cmd-notif {
    background:white; padding:16px 24px; border-radius:12px;
    box-shadow:0 8px 25px rgba(0,0,0,.15); animation:cmd-slideIn .5s ease;
    max-width:350px; font-family:Poppins,sans-serif; font-weight:500; color:#333;
  }

  /* activity item */
  .cmd-activity {
    padding:10px 10px 10px 16px; border-left:3px solid #007AFF;
    margin-bottom:10px; background:rgba(0,122,255,.05); border-radius:8px;
  }

  /* product line in form */
  .cmd-product-line {
    display:grid; grid-template-columns:2fr 1fr 1fr auto;
    gap:10px; padding:14px; background:rgba(0,122,255,.05); border-radius:12px; margin-bottom:10px;
  }
  @media(max-width:600px) { .cmd-product-line { grid-template-columns:1fr 1fr; } }

  /* select statut */
  .cmd-select-status {
    padding:6px 10px; border-radius:8px; border:1px solid #D2D2D7;
    font-family:Poppins,sans-serif; font-size:.8rem; cursor:pointer; background:white;
  }

  /* ── Mobile stats strip (visible only on mobile) ── */
  .cmd-mobile-stats { display:none; }
  @media(max-width:1200px) {
    .cmd-mobile-stats {
      display:grid; grid-template-columns:repeat(2,1fr);
      gap:10px; margin-bottom:16px;
    }
    .cmd-mobile-stat-card {
      background:linear-gradient(135deg,#007AFF,#00C6FF);
      border-radius:14px; padding:14px 16px;
      box-shadow:0 4px 16px rgba(0,122,255,.18);
    }
    .cmd-mobile-stat-card p { margin:0; }
  }
  @media(max-width:480px) {
    .cmd-mobile-stats { grid-template-columns:repeat(2,1fr); gap:8px; }
    .cmd-mobile-stat-card { padding:12px; }
  }

  /* Modale de confirmation suppression */
  .cmd-confirm-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.6); backdrop-filter:blur(4px);
    z-index:9000; display:flex; align-items:center; justify-content:center; padding:20px;
    animation:cmd-fadeIn .2s ease;
  }
  .cmd-confirm-box {
    background:white; border-radius:20px; padding:32px; max-width:420px; width:100%;
    box-shadow:0 20px 60px rgba(0,0,0,.25); animation:cmd-slideUp .3s ease; text-align:center;
  }
`;

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('cmd-page-style')) return;
  const el = document.createElement('style');
  el.id = 'cmd-page-style';
  el.textContent = PAGE_CSS;
  document.head.appendChild(el);
}

/* ── Statuts ── */
const STATUTS = {
  pending:      { label:'En attente',   cls:'cmd-pending',      next:'processing' },
  processing:   { label:'En traitement',cls:'cmd-processing',   next:'shipped' },
  shipped:      { label:'Expédiée',     cls:'cmd-shipped',      next:'delivered' },
  delivered:    { label:'Livrée',       cls:'cmd-delivered',    next:null },
  cancelled:    { label:'Annulée',      cls:'cmd-cancelled',    next:null },
  en_attente:   { label:'En attente',   cls:'cmd-en_attente',   next:'confirmee' },
  confirmee:    { label:'Confirmée',    cls:'cmd-confirmee',    next:'en_livraison' },
  en_livraison: { label:'En livraison', cls:'cmd-en_livraison', next:'livree' },
  livree:       { label:'Livrée',       cls:'cmd-livree',       next:null },
  annulee:      { label:'Annulée',      cls:'cmd-annulee',      next:null },
};

/* Statuts finaux = supprimables */
const STATUTS_SUPPRIMABLES = ['livree', 'delivered', 'annulee', 'cancelled'];

const CHIP_FILTERS = [
  { key:'all',          label:'Toutes' },
  { key:'en_attente',   label:'En attente' },
  { key:'confirmee',    label:'Confirmées' },
  { key:'en_livraison', label:'En livraison' },
  { key:'livree',       label:'Livrées' },
  { key:'annulee',      label:'Annulées' },
  { key:'pending',      label:'Pending' },
  { key:'delivered',    label:'Delivered' },
  { key:'cancelled',    label:'Cancelled' },
];

function getStatutLabel(s) { return STATUTS[s]?.label || s; }
function getStatutCls(s)   { return STATUTS[s]?.cls   || 'cmd-pending'; }

function getTempsEcoule(date) {
  const diff = Date.now() - new Date(date);
  const h = Math.floor(diff / 3.6e6);
  const j = Math.floor(h / 24);
  if (j > 0) return `Il y a ${j} jour${j > 1 ? 's' : ''}`;
  if (h > 0) return `Il y a ${h} heure${h > 1 ? 's' : ''}`;
  return "À l'instant";
}

function showNotif(msg, type = 'info') {
  if (typeof document === 'undefined') return;
  const colors = { success:'#34C759', error:'#FF3B30', info:'#007AFF', warning:'#FF9500' };
  let c = document.getElementById('cmd-notif-c');
  if (!c) {
    c = document.createElement('div');
    c.id = 'cmd-notif-c';
    Object.assign(c.style, { position:'fixed', top:'100px', right:'20px', zIndex:'10000', display:'flex', flexDirection:'column', gap:'12px' });
    document.body.appendChild(c);
  }
  const n = document.createElement('div');
  n.className = 'cmd-notif';
  n.style.borderLeft = `4px solid ${colors[type]}`;
  n.textContent = msg;
  c.appendChild(n);
  setTimeout(() => { n.style.animation = 'cmd-fadeOut .5s ease'; setTimeout(() => n.remove(), 500); }, 3000);
}

/* ══════════════════════════════════════════════════════════
   UTILITAIRE WHATSAPP
   — Normalise le numéro et pré-remplit le message avec les
     détails complets de la commande si fournie
══════════════════════════════════════════════════════════ */
function formatWhatsAppUrl(tel, commande = null) {
  if (!tel) return null;

  // Normalisation du numéro
  let num = tel.replace(/[\s\-().]/g, '');
  if (num.startsWith('00')) num = '+' + num.slice(2);
  if (!num.startsWith('+')) num = '+237' + num;
  const clean = num.replace(/^\+/, '');

  // Si pas de commande → lien simple
  if (!commande) return `https://wa.me/${clean}`;

  // Construction du message détaillé
  const produits = commande.produits_data || commande.produits || [];
  const lignesProduits = produits.length > 0
    ? produits.map(p =>
        `  • ${p.nom || 'Produit'} × ${p.quantite || 1} = ${((p.prix || 0) * (p.quantite || 1)).toLocaleString('fr-FR')} FCFA`
      ).join('\n')
    : '  • (aucun produit renseigné)';

  const dateCommande = new Date(commande.created_at).toLocaleString('fr-FR', {
    day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit'
  });

  const message = [
    `Bonjour ${commande.client_nom || 'cher(e) client(e)'} 👋`,
    ``,
    `📋 *RÉCAPITULATIF DE VOTRE COMMANDE*`,
    ``,
    `🔢 Numéro    : ${commande.numero || '#' + commande.id}`,
    `📅 Date      : ${dateCommande}`,
    `✅ Statut    : ${getStatutLabel(commande.statut)}`,
    ``,
    `👤 *CLIENT*`,
    `   Nom       : ${commande.client_nom || 'N/A'}`,
    `   Tél       : ${commande.client_telephone || 'N/A'}`,
    commande.client_email ? `   Email     : ${commande.client_email}` : null,
    ``,
    `📍 *LIVRAISON*`,
    `   Adresse   : ${commande.adresse_livraison || 'N/A'}`,
    commande.ville ? `   Ville     : ${commande.ville}` : null,
    ``,
    `📦 *ARTICLES COMMANDÉS*`,
    lignesProduits,
    ``,
    `💰 *TOTAL : ${(commande.montant_total || 0).toLocaleString('fr-FR')} FCFA*`,
    commande.commentaire ? `\n💬 Note : ${commande.commentaire}` : null,
    ``,
    `Merci pour votre confiance ! 🙏`,
  ]
    .filter(line => line !== null)
    .join('\n');

  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

/* ══════════════════════════════════════════════════════════
   ICÔNE WHATSAPP SVG
══════════════════════════════════════════════════════════ */
const WhatsAppIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 3C8.82 3 3 8.82 3 16c0 2.42.67 4.7 1.83 6.65L3 29l6.55-1.8A13 13 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm6.4 17.6c-.27.75-1.57 1.44-2.16 1.53-.55.08-1.26.11-2.03-.13a18.7 18.7 0 0 1-1.84-.68C13.88 20.1 11.8 17.7 11.6 17.44c-.2-.26-1.6-2.13-1.6-4.06 0-1.94 1.02-2.89 1.38-3.29.36-.4.79-.5 1.05-.5l.75.01c.24 0 .56-.09.88.67.33.77 1.12 2.74 1.22 2.94.1.2.16.43.03.69-.13.26-.2.42-.39.65-.2.22-.42.5-.6.67-.2.18-.4.38-.17.74.23.36 1.02 1.68 2.2 2.72 1.51 1.35 2.78 1.77 3.17 1.97.39.2.62.17.85-.1.23-.27.98-1.14 1.24-1.53.26-.39.52-.32.88-.19.36.13 2.28 1.07 2.67 1.27.39.2.65.3.75.46.1.17.1.97-.17 1.72z"/>
  </svg>
);

/* ══════════════════════════════════════════════════════════
   MODALE DE CONFIRMATION DE SUPPRESSION
══════════════════════════════════════════════════════════ */
function ConfirmDeleteModal({ commande, onConfirm, onCancel }) {
  if (!commande) return null;
  return (
    <div className="cmd-confirm-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="cmd-confirm-box">
        <div style={{ fontSize:'3rem', marginBottom:'12px' }}>🗑️</div>
        <h3 style={{ color:'#1D1D1F', fontWeight:700, marginBottom:'8px' }}>Supprimer la commande ?</h3>
        <p style={{ color:'#6E6E73', marginBottom:'4px' }}>
          <strong style={{ color:'#007AFF' }}>{commande.numero || '#' + commande.id}</strong> — {commande.client_nom || 'Client inconnu'}
        </p>
        <p style={{ color:'#FF3B30', fontSize:'.85rem', marginBottom:'24px' }}>
          ⚠️ Cette action est irréversible.
        </p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center' }}>
          <button
            className="cmd-btn-secondary"
            style={{ flex:1 }}
            onClick={onCancel}
          >
            Annuler
          </button>
          <button
            className="cmd-btn-danger"
            style={{ flex:1 }}
            onClick={() => onConfirm(commande.id)}
          >
            🗑️ Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MINI GRAPHIQUE BARRES (7 jours)
══════════════════════════════════════════════════════════ */
function SalesChart({ commandes }) {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const jours = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
    const ventes = Array(7).fill(0);
    commandes.forEach(cmd => {
      if (cmd.statut !== 'cancelled' && cmd.statut !== 'annulee') {
        const j = new Date(cmd.created_at).getDay();
        ventes[j === 0 ? 6 : j - 1] += cmd.montant_total || 0;
      }
    });

    const max = Math.max(...ventes, 1);
    const bw = (W - 40) / 7;
    const pad = 30;

    ventes.forEach((v, i) => {
      const bh = (v / max) * (H - pad - 20);
      const x = pad + i * bw + bw * 0.2;
      const y = H - pad - bh;
      const g = ctx.createLinearGradient(0, y, 0, H - pad);
      g.addColorStop(0, '#007AFF'); g.addColorStop(1, '#00C6FF');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, bw * 0.6, bh);
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.font = '9px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(jours[i], x + bw * 0.3, H - pad + 14);
    });
  }, [commandes]);

  return <canvas ref={canvasRef} width={240} height={120} style={{ width:'100%', height:'120px' }} />;
}

/* ══════════════════════════════════════════════════════════
   MODAL DÉTAIL COMMANDE
══════════════════════════════════════════════════════════ */
function OrderDetailModal({ commande, onClose, onStatusChange, onDelete }) {
  if (!commande) return null;
  const produits = commande.produits_data || commande.produits || [];
  const statut = STATUTS[commande.statut] || {};
  const canAdvance = statut.next !== null && statut.next !== undefined;
  const canCancel  = !['cancelled','annulee','delivered','livree'].includes(commande.statut);
  const canDelete  = STATUTS_SUPPRIMABLES.includes(commande.statut);

  const infoBoxStyle = { padding:'14px', background:'linear-gradient(135deg,#E3F2FD,#F5F5F7)', borderRadius:'12px' };
  const infoLabelStyle = { fontSize:'.85rem', color:'#6E6E73', marginBottom:'4px', margin:0 };
  const infoValStyle = { fontSize:'1.05rem', fontWeight:600, color:'#1D1D1F', margin:0, wordBreak:'break-word' };

  /* URL WhatsApp avec message pré-rempli contenant tous les détails */
  const whatsappUrl = formatWhatsAppUrl(commande.client_telephone, commande);

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', backdropFilter:'blur(3px)', zIndex:8000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', animation:'cmd-fadeIn .3s ease' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background:'white', borderRadius:'20px', maxWidth:'800px', width:'100%', maxHeight:'90vh', overflowY:'auto', padding:'32px', boxShadow:'0 10px 40px rgba(0,0,0,.15)', animation:'cmd-slideUp .5s ease' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', paddingBottom:'16px', borderBottom:'2px solid #E3F2FD' }}>
          <div>
            <h2 style={{ fontSize:'1.5rem', fontWeight:700, background:'linear-gradient(135deg,#007AFF,#00C6FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', margin:'0 0 6px' }}>
              Commande {commande.numero || `#${commande.id}`}
            </h2>
            <span className={`cmd-badge ${getStatutCls(commande.statut)}`} style={{ fontSize:'.9rem' }}>
              {getStatutLabel(commande.statut)}
            </span>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer', color:'#6E6E73', transition:'.3s', lineHeight:1 }}>×</button>
        </div>

        {/* Infos client */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'14px', marginBottom:'20px' }}>
          <div style={infoBoxStyle}><p style={infoLabelStyle}>Client</p><p style={infoValStyle}>{commande.client_nom || 'N/A'}</p></div>
          <div style={infoBoxStyle}><p style={infoLabelStyle}>Email</p><p style={infoValStyle}>{commande.client_email || 'N/A'}</p></div>

          {/* Téléphone + bouton WhatsApp inline */}
          <div style={{ ...infoBoxStyle, display:'flex', flexDirection:'column', gap:'8px' }}>
            <p style={infoLabelStyle}>Téléphone</p>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
              <p style={{ ...infoValStyle, margin:0 }}>{commande.client_telephone || 'N/A'}</p>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cmd-btn-whatsapp"
                  style={{ padding:'6px 14px', fontSize:'.82rem', borderRadius:'10px' }}
                  title="Envoyer les détails de la commande sur WhatsApp"
                >
                  <WhatsAppIcon size={16} />
                  Envoyer
                </a>
              )}
            </div>
          </div>

          <div style={infoBoxStyle}><p style={infoLabelStyle}>Date</p><p style={infoValStyle}>{new Date(commande.created_at).toLocaleString('fr-FR')}</p></div>
          <div style={{ ...infoBoxStyle, gridColumn:'1 / -1' }}><p style={infoLabelStyle}>Adresse de livraison</p><p style={infoValStyle}>{commande.adresse_livraison || 'N/A'}</p></div>
          {commande.ville && <div style={infoBoxStyle}><p style={infoLabelStyle}>Ville</p><p style={infoValStyle}>{commande.ville}</p></div>}
          {commande.commentaire && <div style={{ ...infoBoxStyle, gridColumn:'1 / -1' }}><p style={infoLabelStyle}>Commentaire</p><p style={infoValStyle}>{commande.commentaire}</p></div>}
        </div>

        {/* Produits */}
        <div style={{ marginBottom:'20px' }}>
          <h4 style={{ color:'#007AFF', marginBottom:'14px', fontSize:'1.05rem' }}>📦 Produits commandés</h4>
          {produits.length === 0
            ? <p style={{ color:'#6E6E73', textAlign:'center', padding:'16px' }}>Aucun produit renseigné</p>
            : produits.map((p, i) => (
              <div key={i} style={{ display:'flex', gap:'14px', padding:'14px', background:'rgba(0,122,255,.04)', borderRadius:'12px', marginBottom:'10px', alignItems:'center' }}>
                {(p.image || p.main_image) && (
                  <img src={p.image || p.main_image} alt={p.nom} style={{ width:'60px', height:'60px', borderRadius:'8px', objectFit:'cover', flexShrink:0 }} />
                )}
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:600, marginBottom:'4px' }}>{p.nom}</p>
                  <p style={{ color:'#007AFF', fontWeight:600 }}>{(p.prix || 0).toLocaleString('fr-FR')} FCFA × {p.quantite || 1}</p>
                </div>
                <strong style={{ color:'#007AFF', whiteSpace:'nowrap' }}>{((p.prix||0)*(p.quantite||1)).toLocaleString('fr-FR')} FCFA</strong>
              </div>
            ))
          }
          <div style={{ textAlign:'right', paddingTop:'14px', borderTop:'2px solid #E3F2FD', marginTop:'10px' }}>
            <span style={{ fontSize:'1.2rem' }}>Total : </span>
            <span style={{ color:'#007AFF', fontWeight:700, fontSize:'1.5rem' }}>{(commande.montant_total || 0).toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>

        {/* Actions statut + WhatsApp + Suppression */}
        <div style={{ display:'flex', gap:'12px', paddingTop:'16px', borderTop:'2px solid #E3F2FD', flexWrap:'wrap' }}>
          {canAdvance && (
            <button className="cmd-btn-primary" style={{ flex:1 }} onClick={() => { onStatusChange(commande.id, STATUTS[commande.statut].next); onClose(); }}>
              ✅ {getStatutLabel(STATUTS[commande.statut].next)}
            </button>
          )}
          {canCancel && (
            <button className="cmd-btn-danger" style={{ flex:1 }} onClick={() => {
              const nextCancel = (commande.statut.startsWith('en_') || commande.statut === 'confirmee' || commande.statut === 'livree') ? 'annulee' : 'cancelled';
              onStatusChange(commande.id, nextCancel);
              onClose();
            }}>
              ❌ Annuler
            </button>
          )}

          {/* ── Bouton WhatsApp avec message complet ── */}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cmd-btn-whatsapp"
              style={{ flex:1, justifyContent:'center' }}
              title={`Envoyer les détails de la commande à ${commande.client_nom || 'le client'}`}
            >
              <WhatsAppIcon size={18} />
              WhatsApp
            </a>
          )}

          {/* ── Bouton Supprimer (seulement pour livree / annulee) ── */}
          {canDelete && (
            <button
              style={{ flex:1, padding:'12px 24px', background:'white', color:'#FF3B30', border:'2px solid #FF3B30', borderRadius:'12px', fontFamily:'Poppins,sans-serif', fontWeight:600, cursor:'pointer', transition:'.3s ease', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}
              onClick={() => { onClose(); onDelete(commande); }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FF3B30'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#FF3B30'; }}
            >
              🗑️ Supprimer
            </button>
          )}

          {/* select rapide statut */}
          <select
            className="cmd-select-status"
            value={commande.statut}
            onChange={e => { onStatusChange(commande.id, e.target.value); onClose(); }}
          >
            {Object.entries(STATUTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MODAL NOUVELLE COMMANDE
══════════════════════════════════════════════════════════ */
function NewOrderModal({ produits, onClose, onCreated, commandesCount }) {
  const supabase = getSupabase();
  const { user } = useAuth();

  const [form, setForm] = useState({ nom:'', email:'', telephone:'', adresse:'' });
  const [lignes, setLignes] = useState([{ produitId:'', quantite:1, prix:0, nom:'' }]);
  const [submitting, setSubmitting] = useState(false);

  function setLigne(idx, key, val) {
    setLignes(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: val };
      if (key === 'produitId') {
        const p = produits.find(p => String(p.id) === String(val));
        next[idx].prix = p?.prix || 0;
        next[idx].nom  = p?.nom  || '';
      }
      return next;
    });
  }

  function addLigne() { setLignes(prev => [...prev, { produitId:'', quantite:1, prix:0, nom:'' }]); }
  function removeLigne(idx) {
    if (lignes.length <= 1) { showNotif('⚠️ Au moins un produit requis', 'warning'); return; }
    setLignes(prev => prev.filter((_, i) => i !== idx));
  }

  const total = lignes.reduce((s, l) => s + (l.prix * (parseInt(l.quantite) || 0)), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nom || !form.telephone || !form.adresse) { showNotif('❌ Remplissez tous les champs obligatoires', 'error'); return; }
    if (lignes.some(l => !l.produitId || !l.quantite)) { showNotif('❌ Vérifiez les produits', 'error'); return; }

    setSubmitting(true);
    try {
      const produitsData = lignes.map(l => ({ id:parseInt(l.produitId), nom:l.nom, prix:l.prix, quantite:parseInt(l.quantite) }));
      const { error } = await supabase.from('commandes').insert([{
        user_id:           user?.id,
        numero:            `#${1000 + commandesCount + 1}`,
        client_nom:        form.nom,
        client_email:      form.email,
        client_telephone:  form.telephone,
        adresse_livraison: form.adresse,
        produits_data:     produitsData,
        montant_total:     total,
        statut:            'en_attente',
      }]);
      if (error) throw error;
      showNotif('✨ Commande créée avec succès !', 'success');
      onCreated();
    } catch (err) { showNotif(`❌ Erreur : ${err.message}`, 'error'); }
    finally { setSubmitting(false); }
  }

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', backdropFilter:'blur(3px)', zIndex:8000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background:'white', borderRadius:'20px', maxWidth:'800px', width:'100%', maxHeight:'90vh', overflowY:'auto', padding:'32px', animation:'cmd-slideUp .5s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', paddingBottom:'16px', borderBottom:'2px solid #E3F2FD' }}>
          <h2 style={{ fontSize:'1.5rem', fontWeight:700, background:'linear-gradient(135deg,#007AFF,#00C6FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', margin:0 }}>
            ➕ Nouvelle commande
          </h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer', color:'#6E6E73' }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Infos client */}
          <div style={{ marginBottom:'24px' }}>
            <h4 style={{ color:'#007AFF', marginBottom:'14px' }}>👤 Informations client</h4>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
              {[
                { key:'nom',       label:'Nom complet *',       type:'text',  ph:'Jean Dupont' },
                { key:'telephone', label:'Téléphone *',          type:'tel',   ph:'+237 6XX XXX XXX' },
                { key:'email',     label:'Email',                type:'email', ph:'jean@email.com' },
                { key:'adresse',   label:'Adresse livraison *',  type:'text',  ph:'Quartier, ville...' },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.key === 'adresse' ? '1 / -1' : 'auto' }}>
                  <label style={{ display:'block', fontWeight:500, marginBottom:'6px', fontSize:'.9rem' }}>{f.label}</label>
                  <input className="cmd-input" type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]:e.target.value}))} />
                </div>
              ))}
            </div>
          </div>

          {/* Produits */}
          <div style={{ marginBottom:'24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
              <h4 style={{ color:'#007AFF', margin:0 }}>📦 Produits</h4>
              <button type="button" className="cmd-btn-secondary" style={{ padding:'8px 14px', fontSize:'.85rem' }} onClick={addLigne}>+ Ajouter</button>
            </div>
            {lignes.map((l, i) => (
              <div key={i} className="cmd-product-line">
                <select className="cmd-input" value={l.produitId} onChange={e => setLigne(i, 'produitId', e.target.value)} required>
                  <option value="">Sélectionner un produit</option>
                  {produits.map(p => <option key={p.id} value={p.id}>{p.nom} — {Number(p.prix).toLocaleString('fr-FR')} FCFA</option>)}
                </select>
                <input className="cmd-input" type="number" min="1" placeholder="Qté" value={l.quantite} onChange={e => setLigne(i, 'quantite', e.target.value)} required />
                <input className="cmd-input" value={l.prix ? `${Number(l.prix).toLocaleString('fr-FR')} FCFA` : ''} readOnly placeholder="Prix" />
                <button type="button" onClick={() => removeLigne(i)} style={{ padding:'8px 12px', background:'rgba(255,59,48,.10)', color:'#FF3B30', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:700 }}>🗑️</button>
              </div>
            ))}
            <div style={{ textAlign:'right', marginTop:'10px', fontWeight:700, color:'#007AFF', fontSize:'1.05rem' }}>
              Total estimé : {total.toLocaleString('fr-FR')} FCFA
            </div>
          </div>

          <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end', paddingTop:'16px', borderTop:'2px solid #E3F2FD', flexWrap:'wrap' }}>
            <button type="button" className="cmd-btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="cmd-btn-primary" disabled={submitting}>
              {submitting ? '⏳ Création...' : '✅ Créer la commande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════════ */
export default function CommandesPage() {
  const supabase = getSupabase();
  const { user } = useAuth();

  const [commandes,      setCommandes]      = useState([]);
  const [produits,       setProduits]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState('');
  const [filter,         setFilter]         = useState('all');
  const [selected,       setSelected]       = useState(null);
  const [showNew,        setShowNew]        = useState(false);
  const [toDelete,       setToDelete]       = useState(null); // commande à supprimer

  useEffect(() => { injectStyles(); }, []);
  useEffect(() => { if (user) { loadCommandes(); loadProduits(); } }, [user]);

  async function loadCommandes() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('commandes').select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending:false });
      if (error) throw error;
      setCommandes(data || []);
    } catch { showNotif('❌ Erreur de chargement', 'error'); }
    finally { setLoading(false); }
  }

  async function loadProduits() {
    try {
      const { data } = await supabase.from('produits').select('id,nom,prix,main_image').eq('user_id', user.id).order('created_at',{ascending:false});
      setProduits(data || []);
    } catch {}
  }

  async function updateStatus(id, status) {
    const { error } = await supabase.from('commandes').update({ statut:status }).eq('id', id).eq('user_id', user.id);
    if (error) { showNotif('❌ Erreur mise à jour statut', 'error'); return; }
    showNotif(`✅ Statut mis à jour : ${getStatutLabel(status)}`, 'success');
    setCommandes(prev => prev.map(c => c.id === id ? {...c, statut:status} : c));
    if (selected?.id === id) setSelected(prev => ({...prev, statut:status}));
  }

  /* ── Suppression d'une commande ── */
  async function deleteOrder(id) {
    const { error } = await supabase.from('commandes').delete().eq('id', id).eq('user_id', user.id);
    if (error) { showNotif('❌ Erreur lors de la suppression', 'error'); return; }
    showNotif('🗑️ Commande supprimée', 'success');
    setCommandes(prev => prev.filter(c => c.id !== id));
    setToDelete(null);
  }

  /* ── Filtrage ── */
  const filtered = commandes.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || (c.client_nom || '').toLowerCase().includes(q) || String(c.id).includes(q) || (c.numero || '').includes(q);
    const matchFilter = filter === 'all' || c.statut === filter;
    return matchSearch && matchFilter;
  });

  /* ── Stats ── */
  const stats = {
    total:   commandes.length,
    attente: commandes.filter(c => ['pending','en_attente'].includes(c.statut)).length,
    livrees: commandes.filter(c => ['delivered','livree'].includes(c.statut)).length,
    revenu:  commandes.filter(c => !['cancelled','annulee'].includes(c.statut)).reduce((s,c) => s + (c.montant_total||0), 0),
  };

  /* Activité récente */
  const recents = [...commandes].sort((a,b) => new Date(b.created_at)-new Date(a.created_at)).slice(0,5);

  /* Counts par filtre pour sidebar */
  const countFor = key => key === 'all' ? commandes.length : commandes.filter(c => c.statut === key).length;

  /* ══ RENDER ══ */
  return (
    <div style={{ fontFamily:"'Poppins',-apple-system,sans-serif", background:'#F5F5F7', minHeight:'100vh' }}>

      <div className="cmd-layout">

        {/* ── SIDEBAR GAUCHE — Stats + Filtres ── */}
        <aside className="cmd-sidebar-left" style={{ background:'linear-gradient(135deg,#007AFF,#00C6FF)', borderRadius:'20px', padding:'24px', height:'fit-content', position:'sticky', top:'24px' }}>
          <h2 style={{ color:'white', fontSize:'.9rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'1px', marginBottom:'16px', opacity:.9 }}>Statistiques</h2>

          <div style={{ display:'grid', gap:'10px', marginBottom:'24px' }}>
            {[
              { label:'Total',      value:stats.total },
              { label:'En attente', value:stats.attente },
              { label:'Livrées',    value:stats.livrees },
              { label:'Revenu',     value:`${(stats.revenu/1000).toFixed(0)}k FCFA` },
            ].map(s => (
              <div key={s.label} className="cmd-stat">
                <p style={{ color:'rgba(255,255,255,.9)', fontSize:'.85rem', margin:'0 0 2px' }}>{s.label}</p>
                <p style={{ color:'white', fontSize:'1.4rem', fontWeight:700, margin:0 }}>{s.value}</p>
              </div>
            ))}
          </div>

          <h3 style={{ color:'white', fontSize:'.85rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px', opacity:.9 }}>Filtres rapides</h3>
          {[
            { key:'all',          label:'Toutes' },
            { key:'en_attente',   label:'En attente' },
            { key:'confirmee',    label:'Confirmées' },
            { key:'en_livraison', label:'En livraison' },
            { key:'livree',       label:'Livrées' },
            { key:'annulee',      label:'Annulées' },
          ].map(f => (
            <button key={f.key} className={`cmd-filter-btn${filter===f.key?' active':''}`} onClick={() => setFilter(f.key)}>
              <span>{f.label}</span>
              <span style={{ background:'rgba(255,255,255,.25)', borderRadius:'12px', padding:'1px 8px', fontSize:'.75rem', minWidth:'24px', textAlign:'center' }}>
                {countFor(f.key)}
              </span>
            </button>
          ))}
        </aside>

        {/* ── CONTENU PRINCIPAL ── */}
        <main style={{ minWidth:0, overflow:'hidden' }}>
          {/* Stats strip — mobile uniquement */}
          <div className="cmd-mobile-stats">
            {[
              { label:'Total',      value:stats.total },
              { label:'En attente', value:stats.attente },
              { label:'Livrées',    value:stats.livrees },
              { label:'Revenu',     value:`${(stats.revenu/1000).toFixed(0)}k` },
            ].map(s => (
              <div key={s.label} className="cmd-mobile-stat-card">
                <p style={{ color:'rgba(255,255,255,.85)', fontSize:'.78rem', fontWeight:500 }}>{s.label}</p>
                <p style={{ color:'white', fontSize:'1.3rem', fontWeight:700 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* En-tête */}
          <div style={{ marginBottom:'24px' }}>
            <h1 style={{ fontSize:'2rem', fontWeight:700, background:'linear-gradient(135deg,#007AFF,#00C6FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:'4px' }}>
              📋 Commandes
            </h1>
            <p style={{ color:'#6E6E73', margin:0 }}>{commandes.length} commande{commandes.length !== 1 ? 's' : ''} au total</p>
          </div>

          {/* Légende des couleurs */}
          <div style={{ background:'white', padding:'12px 16px', borderRadius:'12px', boxShadow:'0 2px 8px rgba(0,122,255,.06)', marginBottom:'12px', display:'flex', gap:'14px', flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ fontSize:'.8rem', fontWeight:600, color:'#6E6E73' }}>Statut :</span>
            {[
              { label:'En attente',   color:'#FF9800' },
              { label:'Confirmée',    color:'#2196F3' },
              { label:'En livraison', color:'#9C27B0' },
              { label:'Livrée',       color:'#4CAF50' },
              { label:'Annulée',      color:'#f44336' },
            ].map(s => (
              <span key={s.label} style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'.78rem', fontWeight:600, color:s.color }}>
                <span style={{ width:'10px', height:'10px', borderRadius:'50%', background:s.color, display:'inline-block' }}></span>
                {s.label}
              </span>
            ))}
          </div>

          {/* Barre recherche + bouton */}
          <div style={{ background:'white', padding:'16px', borderRadius:'16px', boxShadow:'0 2px 12px rgba(0,122,255,.08)', marginBottom:'16px', display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'center' }}>
            <input className="cmd-search" type="text" placeholder="🔍 Rechercher par nom, numéro..." value={search} onChange={e => setSearch(e.target.value)} />
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {CHIP_FILTERS.slice(0, 6).map(f => (
                <button key={f.key} className={`cmd-chip${filter===f.key?' active':''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
              ))}
            </div>
            <button className="cmd-btn-primary" style={{ marginLeft:'auto', padding:'10px 18px' }} onClick={() => setShowNew(true)}>
              ➕ Nouvelle commande
            </button>
          </div>

          {/* Table (desktop) */}
          <div className="cmd-table-wrap" style={{ background:'white', borderRadius:'16px', boxShadow:'0 2px 12px rgba(0,122,255,.08)', overflow:'hidden' }}>
            {loading ? (
              <div style={{ padding:'48px', textAlign:'center', color:'#6E6E73' }}>⏳ Chargement...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding:'60px', textAlign:'center' }}>
                <div style={{ fontSize:'3rem', marginBottom:'12px' }}>📦</div>
                <p style={{ color:'#6E6E73', fontWeight:600 }}>Aucune commande trouvée</p>
              </div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table className="cmd-table">
                  <thead>
                    <tr>
                      <th>Numéro</th>
                      <th>Client</th>
                      <th>Articles</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c, i) => {
                      const prodData = c.produits_data || c.produits || [];
                      const canDel = STATUTS_SUPPRIMABLES.includes(c.statut);
                      return (
                        <tr
                          key={c.id}
                          className={`row-${c.statut}`}
                          onClick={() => setSelected(c)}
                          style={{ animation:`cmd-fadeIn .5s ease ${i * 0.04}s both` }}
                        >
                          <td><strong style={{ color:'#007AFF' }}>{c.numero || `#${c.id}`}</strong></td>
                          <td>
                            <div style={{ fontWeight:600 }}>{c.client_nom || 'Inconnu'}</div>
                            {c.client_telephone && <div style={{ fontSize:'.8rem', color:'#6E6E73' }}>{c.client_telephone}</div>}
                          </td>
                          <td>{Array.isArray(prodData) ? prodData.length : 0} article(s)</td>
                          <td style={{ fontWeight:700 }}>{(c.montant_total||0).toLocaleString('fr-FR')} FCFA</td>
                          <td><span className={`cmd-badge ${getStatutCls(c.statut)}`}>{getStatutLabel(c.statut)}</span></td>
                          <td style={{ color:'#6E6E73', fontSize:'.85rem' }}>{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                          <td onClick={e => e.stopPropagation()}>
                            <div style={{ display:'flex', gap:'6px', alignItems:'center', flexWrap:'wrap' }}>
                              <button onClick={() => setSelected(c)} style={{ padding:'6px 10px', background:'rgba(0,122,255,.10)', color:'#007AFF', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'.8rem', fontWeight:600, fontFamily:'Poppins,sans-serif' }}>
                                👁️ Voir
                              </button>
                              {/* Bouton WhatsApp rapide avec message pré-rempli */}
                              {c.client_telephone && (
                                <a
                                  href={formatWhatsAppUrl(c.client_telephone, c)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ padding:'6px 10px', background:'linear-gradient(135deg,#25D366,#128C7E)', color:'white', borderRadius:'8px', fontSize:'.8rem', fontWeight:600, fontFamily:'Poppins,sans-serif', textDecoration:'none', display:'flex', alignItems:'center', gap:'4px' }}
                                  title="Envoyer les détails sur WhatsApp"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <WhatsAppIcon size={13} /> WA
                                </a>
                              )}
                              {/* Bouton Supprimer (livree / annulee uniquement) */}
                              {canDel && (
                                <button
                                  className="cmd-btn-delete"
                                  onClick={e => { e.stopPropagation(); setToDelete(c); }}
                                  title="Supprimer cette commande"
                                >
                                  🗑️
                                </button>
                              )}
                              <select className="cmd-select-status" value={c.statut} onClick={e => e.stopPropagation()} onChange={e => { e.stopPropagation(); updateStatus(c.id, e.target.value); }}>
                                {Object.entries(STATUTS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Cards (mobile) */}
          <div className="cmd-mobile-cards">
            {loading ? (
              <div style={{ padding:'48px', textAlign:'center', color:'#6E6E73' }}>⏳ Chargement...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding:'48px', textAlign:'center' }}>
                <div style={{ fontSize:'3rem', marginBottom:'12px' }}>📦</div>
                <p style={{ color:'#6E6E73', fontWeight:600 }}>Aucune commande trouvée</p>
              </div>
            ) : filtered.map((c, i) => {
              const prodData = c.produits_data || c.produits || [];
              const canDel = STATUTS_SUPPRIMABLES.includes(c.statut);
              return (
                <div key={c.id} className={`cmd-card card-${c.statut}`} style={{ animationDelay:`${i*0.04}s` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                    <span style={{ fontWeight:700, fontSize:'1.05rem', color:'#007AFF' }}>{c.numero || `#${c.id}`}</span>
                    <span className={`cmd-badge ${getStatutCls(c.statut)}`}>{getStatutLabel(c.statut)}</span>
                  </div>
                  {[
                    { label:'Client',   value: c.client_nom || 'Inconnu' },
                    { label:'Produits', value: `${Array.isArray(prodData) ? prodData.length : 0} article(s)` },
                    { label:'Date',     value: new Date(c.created_at).toLocaleDateString('fr-FR') },
                  ].map(r => (
                    <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', color:'#6E6E73', fontSize:'.9rem' }}>
                      <span style={{ fontWeight:500 }}>{r.label} :</span>
                      <span style={{ fontWeight:600, color:'#1D1D1F' }}>{r.value}</span>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'12px', paddingTop:'12px', borderTop:'1px solid rgba(0,122,255,.10)', gap:'8px', flexWrap:'wrap' }}>
                    <span style={{ fontSize:'1.1rem', fontWeight:700, color:'#007AFF' }}>{(c.montant_total||0).toLocaleString('fr-FR')} FCFA</span>
                    <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                      <button onClick={() => setSelected(c)} style={{ padding:'8px 12px', background:'rgba(0,122,255,.10)', color:'#007AFF', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:600, fontSize:'.85rem', fontFamily:'Poppins,sans-serif' }}>
                        👁️ Voir
                      </button>
                      {c.client_telephone && (
                        <a
                          href={formatWhatsAppUrl(c.client_telephone, c)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ padding:'8px 12px', background:'linear-gradient(135deg,#25D366,#128C7E)', color:'white', borderRadius:'10px', fontSize:'.85rem', fontWeight:600, fontFamily:'Poppins,sans-serif', textDecoration:'none', display:'flex', alignItems:'center', gap:'4px' }}
                        >
                          <WhatsAppIcon size={14} /> WA
                        </a>
                      )}
                      {canDel && (
                        <button
                          className="cmd-btn-delete"
                          style={{ padding:'8px 12px' }}
                          onClick={() => setToDelete(c)}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* ── SIDEBAR DROITE — Graphique + Activité ── */}
        <aside className="cmd-sidebar-right" style={{ height:'fit-content', position:'sticky', top:'24px' }}>
          {/* Graphique */}
          <div style={{ background:'rgba(255,255,255,.7)', backdropFilter:'blur(10px)', padding:'20px', borderRadius:'20px', marginBottom:'16px', boxShadow:'0 2px 12px rgba(0,122,255,.08)', border:'1px solid rgba(0,122,255,.10)' }}>
            <h3 style={{ color:'#007AFF', fontSize:'1.05rem', fontWeight:600, marginBottom:'14px' }}>📊 Ventes de la semaine</h3>
            <div style={{ background:'linear-gradient(135deg,#007AFF,#00C6FF)', borderRadius:'12px', padding:'12px' }}>
              <SalesChart commandes={commandes} />
            </div>
          </div>

          {/* Activité récente */}
          <div style={{ background:'rgba(255,255,255,.7)', backdropFilter:'blur(10px)', padding:'20px', borderRadius:'20px', boxShadow:'0 2px 12px rgba(0,122,255,.08)', border:'1px solid rgba(0,122,255,.10)' }}>
            <h3 style={{ color:'#007AFF', fontSize:'1.05rem', fontWeight:600, marginBottom:'14px' }}>⚡ Activité récente</h3>
            {recents.length === 0
              ? <p style={{ color:'#6E6E73', textAlign:'center' }}>Aucune activité</p>
              : recents.map((c, i) => (
                <div key={i} className="cmd-activity">
                  <strong style={{ fontSize:'.9rem' }}>{c.client_nom || 'Client'}</strong>
                  <span style={{ color:'#6E6E73', fontSize:'.85rem' }}> — {getStatutLabel(c.statut)}</span>
                  <p style={{ fontSize:'.78rem', color:'#6E6E73', margin:'3px 0 0' }}>{getTempsEcoule(c.created_at)}</p>
                </div>
              ))
            }
          </div>
        </aside>
      </div>

      {/* ── MODALS ── */}
      {selected && (
        <OrderDetailModal
          commande={selected}
          onClose={() => setSelected(null)}
          onStatusChange={(id, status) => updateStatus(id, status)}
          onDelete={(commande) => { setSelected(null); setToDelete(commande); }}
        />
      )}

      {showNew && (
        <NewOrderModal
          produits={produits}
          commandesCount={commandes.length}
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); loadCommandes(); }}
        />
      )}

      {/* ── Modale de confirmation de suppression ── */}
      {toDelete && (
        <ConfirmDeleteModal
          commande={toDelete}
          onConfirm={(id) => deleteOrder(id)}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}