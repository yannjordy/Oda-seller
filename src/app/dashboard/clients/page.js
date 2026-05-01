'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

/* ══════════════════════════════════════════════════════════
   CSS RESPONSIVE OPTIMISÉ
══════════════════════════════════════════════════════════ */
const PAGE_CSS = `
  @keyframes cli-fadeIn  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes cli-slideIn { from{transform:translateX(400px);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes cli-fadeOut { to{opacity:0;transform:translateY(-10px)} }
  @keyframes cli-shimmer { 0%{left:-100%} 100%{left:100%} }

  /* ═══════════════════════════════════════════════════════════ */
  /* STATS CARDS */
  /* ═══════════════════════════════════════════════════════════ */
  .cli-stat-card {
    background:white; padding:24px; border-radius:16px;
    box-shadow:0 2px 8px rgba(0,0,0,.08); text-align:center;
    transition:.3s ease; animation:cli-fadeIn .6s ease;
  }
  .cli-stat-card:hover { transform:translateY(-5px); box-shadow:0 4px 16px rgba(0,0,0,.12); }

  /* MOBILE STAT CARDS */
  @media (max-width: 640px) {
    .cli-stat-card {
      padding:16px;
    }
  }

  /* ═══════════════════════════════════════════════════════════ */
  /* CLIENT CARDS */
  /* ═══════════════════════════════════════════════════════════ */
  .cli-card {
    background:white; border-radius:12px; padding:16px;
    box-shadow:0 2px 8px rgba(0,0,0,.08); transition:.3s ease;
    cursor:pointer; border:1px solid #D2D2D7;
    position:relative; overflow:hidden; animation:cli-fadeIn .6s ease;
  }
  .cli-card::before {
    content:''; position:absolute; top:0; left:-100%; width:100%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(0,122,255,.10),transparent);
    transition:left .5s ease;
  }
  .cli-card:hover::before { left:100%; }
  .cli-card:hover { transform:translateY(-4px); box-shadow:0 4px 16px rgba(0,0,0,.12); }

  /* MOBILE CARD ADJUSTMENTS */
  @media (max-width: 768px) {
    .cli-card {
      padding:14px;
    }
  }

  @media (max-width: 480px) {
    .cli-card {
      padding:12px;
    }
  }

  /* ═══════════════════════════════════════════════════════════ */
  /* TABLE */
  /* ═══════════════════════════════════════════════════════════ */
  .cli-table { width:100%; border-collapse:collapse; }
  .cli-table thead { background:linear-gradient(135deg,#007AFF 0%,#5AC8FA 100%); color:white; }
  .cli-table th { padding:14px 16px; text-align:left; font-weight:600; font-size:.9rem; }
  .cli-table td { padding:14px 16px; border-bottom:1px solid #E5E5EA; }
  .cli-table tbody tr { transition:.3s ease; cursor:pointer; }
  .cli-table tbody tr:hover { background:linear-gradient(135deg,#E8F4FF 0%,#F5F5F7 100%); }

  /* MOBILE TABLE ADJUSTMENTS */
  @media (max-width: 768px) {
    .cli-table th, .cli-table td {
      padding:10px 12px;
      font-size:.85rem;
    }
  }

  /* ═══════════════════════════════════════════════════════════ */
  /* AVATAR GRADIENT BACKGROUNDS */
  /* ═══════════════════════════════════════════════════════════ */
  .av-0 { background:linear-gradient(135deg,#667eea,#764ba2) }
  .av-1 { background:linear-gradient(135deg,#f093fb,#f5576c) }
  .av-2 { background:linear-gradient(135deg,#4facfe,#00f2fe) }
  .av-3 { background:linear-gradient(135deg,#43e97b,#38f9d7) }
  .av-4 { background:linear-gradient(135deg,#fa709a,#fee140) }
  .av-5 { background:linear-gradient(135deg,#a18cd1,#fbc2eb) }
  .av-6 { background:linear-gradient(135deg,#fda085,#f6d365) }
  .av-7 { background:linear-gradient(135deg,#84fab0,#8fd3f4) }

  /* ═══════════════════════════════════════════════════════════ */
  /* SEARCH INPUT */
  /* ═══════════════════════════════════════════════════════════ */
  .cli-search {
    width:100%; padding:14px 16px; border:2px solid #D2D2D7;
    border-radius:16px; font-family:Poppins,sans-serif; font-size:1rem;
    transition:.3s ease; outline:none; background:white;
  }
  .cli-search:focus { border-color:#007AFF; box-shadow:0 0 0 3px rgba(0,122,255,.15); }

  @media (max-width: 480px) {
    .cli-search {
      font-size:.95rem;
      padding:12px 14px;
    }
  }

  /* ═══════════════════════════════════════════════════════════ */
  /* FILTER SELECT */
  /* ═══════════════════════════════════════════════════════════ */
  .cli-select {
    padding:14px 16px; border:2px solid #D2D2D7; border-radius:16px;
    font-family:Poppins,sans-serif; font-size:1rem; background:white;
    cursor:pointer; outline:none; transition:.3s ease;
  }
  .cli-select:focus { border-color:#007AFF; }

  /* HEADER CONTAINER RESPONSIVE */
  .cli-header-container {
    display:flex;
    gap:12px;
    flex-wrap:wrap;
    align-items:center;
  }

  @media (max-width: 768px) {
    .cli-header-container {
      gap:8px;
    }
  }

  @media (max-width: 640px) {
    .cli-header-container {
      gap:6px;
      flex-wrap:wrap;
    }
    .cli-search {
      min-width:100% !important;
      flex-basis:100%;
    }
    .cli-select {
      flex:1;
      min-width:120px;
      font-size:.9rem;
      padding:10px 12px;
    }
  }

  @media (max-width: 480px) {
    .cli-header-container {
      flex-direction:column;
      gap:8px;
    }
    .cli-search {
      width:100%;
      min-width:unset;
    }
    .cli-select {
      width:100%;
      min-width:unset;
      font-size:.85rem;
      padding:9px 10px;
    }
  }

  /* ═══════════════════════════════════════════════════════════ */
  /* VIEW TOGGLE */
  /* ═══════════════════════════════════════════════════════════ */
  .cli-view-btn { 
    padding:8px 16px; border:none; border-radius:8px; background:none; 
    cursor:pointer; transition:.3s ease; font-size:1.2rem; 
  }
  .cli-view-btn.active { background:linear-gradient(135deg,#007AFF,#5AC8FA); color:white; }

  @media (max-width: 480px) {
    .cli-view-btn {
      padding:6px 12px;
      font-size:1rem;
    }
  }

  /* ═══════════════════════════════════════════════════════════ */
  /* ACTION BTN */
  /* ═══════════════════════════════════════════════════════════ */
  .cli-btn-action {
    padding:10px 16px; border:2px solid #007AFF; background:white;
    color:#007AFF; border-radius:12px; font-family:Poppins,sans-serif;
    font-weight:600; cursor:pointer; transition:.3s ease; white-space:nowrap;
    font-size:.85rem;
  }
  .cli-btn-action:hover { background:#007AFF; color:white; transform:translateY(-2px); }

  @media (max-width: 640px) {
    .cli-btn-action {
      padding:8px 12px;
      font-size:.8rem;
    }
  }

  /* ═══════════════════════════════════════════════════════════ */
  /* CLIENT ACTION BUTTONS */
  /* ═══════════════════════════════════════════════════════════ */
  .cli-btn-view { 
    background:linear-gradient(135deg,#007AFF,#5AC8FA); color:white; border:none; 
    border-radius:8px; padding:8px 4px; font-family:Poppins,sans-serif; font-weight:600; 
    cursor:pointer; transition:.3s ease; font-size:.8rem; width:100%; 
  }
  .cli-btn-contact { 
    background:white; color:#007AFF; border:2px solid #007AFF; border-radius:8px; 
    padding:8px 4px; font-family:Poppins,sans-serif; font-weight:600; cursor:pointer; 
    transition:.3s ease; font-size:.8rem; width:100%; 
  }
  .cli-btn-view:hover, .cli-btn-contact:hover { transform:translateY(-1px); box-shadow:0 2px 8px rgba(0,0,0,.08); }

  /* ═══════════════════════════════════════════════════════════ */
  /* FORM INPUTS */
  /* ═══════════════════════════════════════════════════════════ */
  .cli-form-input {
    width:100%; padding:12px 16px; border:2px solid #D2D2D7;
    border-radius:12px; font-family:Poppins,sans-serif; font-size:.95rem;
    transition:.3s ease; outline:none; background:white; color:#1D1D1F;
  }
  .cli-form-input:focus { border-color:#007AFF; box-shadow:0 0 0 3px rgba(0,122,255,.15); }

  /* ═══════════════════════════════════════════════════════════ */
  /* MODAL CLOSE */
  /* ═══════════════════════════════════════════════════════════ */
  .cli-modal-close {
    width:40px; height:40px; border-radius:50%; border:none;
    background:rgba(255,59,48,.1); color:#FF3B30; font-size:1.5rem;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    transition:.3s ease; flex-shrink:0;
  }
  .cli-modal-close:hover { background:#FF3B30; color:white; transform:rotate(90deg); }

  @media (max-width: 480px) {
    .cli-modal-close {
      width:36px;
      height:36px;
      font-size:1.3rem;
    }
  }

  /* ═══════════════════════════════════════════════════════════ */
  /* BADGES */
  /* ═══════════════════════════════════════════════════════════ */
  .cli-badge { display:inline-block; padding:3px 10px; border-radius:12px; font-size:.7rem; font-weight:600; }
  .cli-badge-vip     { background:rgba(255,215,0,.2); color:#DAA520; }
  .cli-badge-regular { background:rgba(52,199,89,.2); color:#34C759; }
  .cli-badge-new     { background:rgba(0,122,255,.2); color:#007AFF; }

  @media (max-width: 480px) {
    .cli-badge {
      font-size:.65rem;
      padding:2px 8px;
    }
  }

  /* ═══════════════════════════════════════════════════════════ */
  /* STAT BOXES INSIDE CARD */
  /* ═══════════════════════════════════════════════════════════ */
  .cli-stat-box { 
    background:linear-gradient(135deg,#E8F4FF,#F5F5F7); padding:8px; 
    border-radius:8px; text-align:center; 
  }

  @media (max-width: 480px) {
    .cli-stat-box {
      padding:6px;
    }
  }

  /* ═══════════════════════════════════════════════════════════ */
  /* NOTIFICATION */
  /* ═══════════════════════════════════════════════════════════ */
  .cli-notif { 
    background:white; padding:16px 24px; border-radius:12px; 
    box-shadow:0 8px 25px rgba(0,122,255,.20); animation:cli-slideIn .5s ease; 
    max-width:350px; font-family:Poppins,sans-serif; font-weight:500; color:#333; 
  }

  @media (max-width: 640px) {
    .cli-notif {
      max-width:280px;
      padding:14px 16px;
      font-size:.9rem;
    }
  }

  /* ═══════════════════════════════════════════════════════════ */
  /* PRIMARY/DANGER BUTTONS */
  /* ═══════════════════════════════════════════════════════════ */
  .cli-btn-primary { 
    padding:12px 24px; background:linear-gradient(135deg,#007AFF,#0051D5); 
    color:white; border:none; border-radius:12px; font-family:Poppins,sans-serif; 
    font-weight:600; cursor:pointer; transition:.3s ease; 
  }
  .cli-btn-primary:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,122,255,.3); }
  .cli-btn-primary:disabled { opacity:.6; cursor:not-allowed; transform:none; }
  
  .cli-btn-secondary { 
    padding:12px 24px; background:white; color:#007AFF; border:2px solid #007AFF; 
    border-radius:12px; font-family:Poppins,sans-serif; font-weight:600; 
    cursor:pointer; transition:.3s ease; 
  }
  
  .cli-btn-danger { 
    padding:12px 24px; background:white; color:#FF3B30; border:2px solid #FF3B30; 
    border-radius:12px; font-family:Poppins,sans-serif; font-weight:600; 
    cursor:pointer; transition:.3s ease; 
  }
  .cli-btn-danger:hover { background:#FF3B30; color:white; }

  @media (max-width: 640px) {
    .cli-btn-primary, .cli-btn-secondary, .cli-btn-danger {
      padding:10px 18px;
      font-size:.9rem;
    }
  }

  @media (max-width: 480px) {
    .cli-btn-primary, .cli-btn-secondary, .cli-btn-danger {
      padding:10px 16px;
      font-size:.85rem;
      width:100%;
    }
  }

  /* ═══════════════════════════════════════════════════════════ */
  /* DESKTOP: 3+ COLONNES */
  /* ═══════════════════════════════════════════════════════════ */
  @media (min-width: 1024px) {
    .cli-grid-container {
      display:grid;
      gridTemplateColumns:repeat(auto-fill,minmax(320px,1fr));
      gap:16px;
      marginBottom:32px;
    }
  }

  /* TABLET: 2 COLONNES */
  @media (min-width: 768px) and (max-width: 1023px) {
    .cli-grid-container {
      display:grid;
      gridTemplateColumns:repeat(2,1fr);
      gap:14px;
      marginBottom:24px;
    }
  }

  /* MOBILE: 2 COLONNES OPTIMISÉES */
  @media (max-width: 767px) {
    .cli-grid-container {
      display:grid;
      gridTemplateColumns:repeat(2,1fr);
      gap:12px;
      marginBottom:16px;
    }
  }

  /* MOBILE XS: 1 COLONNE SI NÉCESSAIRE */
  @media (max-width: 480px) {
    .cli-grid-container {
      gridTemplateColumns:repeat(2,1fr);
      gap:10px;
    }
  }

  /* ═══════════════════════════════════════════════════════════ */
  /* HEADER RESPONSIVE */
  /* ═══════════════════════════════════════════════════════════ */
  .cli-header-container {
    display:flex;
    flexDirection:row;
    gap:12px;
    flexWrap:wrap;
    alignItems:center;
  }

  @media (max-width: 768px) {
    .cli-header-container {
      gap:10px;
    }
  }

  @media (max-width: 480px) {
    .cli-header-container {
      gap:8px;
      flexWrap:wrap;
    }
  }

  /* ═══════════════════════════════════════════════════════════ */
  /* TOOLBAR RESPONSIVE */
  /* ═══════════════════════════════════════════════════════════ */
  .cli-toolbar {
    display:flex;
    gap:8px;
    flexWrap:wrap;
    marginTop:12px;
  }

  @media (max-width: 640px) {
    .cli-toolbar {
      gap:6px;
    }
  }

  @media (max-width: 480px) {
    .cli-toolbar {
      gap:6px;
    }
  }

  /* ═══════════════════════════════════════════════════════════ */
  /* MODAL RESPONSIVE */
  /* ═══════════════════════════════════════════════════════════ */
  .cli-modal {
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.7);
    zIndex:2000;
    display:flex;
    alignItems:center;
    justifyContent:center;
    padding:16px;
    backdropFilter:blur(5px);
  }

  .cli-modal-content {
    background:white;
    borderRadius:20px;
    maxWidth:800px;
    width:100%;
    maxHeight:90vh;
    overflowY:auto;
    position:relative;
    animation:cli-fadeIn .3s ease;
  }

  @media (max-width: 640px) {
    .cli-modal-content {
      maxWidth:100%;
      borderRadius:16px;
    }
  }

  /* ═══════════════════════════════════════════════════════════ */
  /* CARD CONTENT TEXT SIZES */
  /* ═══════════════════════════════════════════════════════════ */
  .cli-card-title {
    fontSize:1.05rem;
    fontWeight:600;
    marginBottom:4px;
  }

  .cli-card-subtitle {
    fontSize:.75rem;
    color:#86868B;
    marginBottom:4px;
  }

  .cli-card-info {
    fontSize:.85rem;
    color:#86868B;
    marginBottom:4px;
  }

  @media (max-width: 640px) {
    .cli-card-title {
      fontSize:.95rem;
    }
    .cli-card-subtitle {
      fontSize:.7rem;
    }
    .cli-card-info {
      fontSize:.8rem;
    }
  }

  @media (max-width: 480px) {
    .cli-card-title {
      fontSize:.9rem;
    }
    .cli-card-subtitle {
      fontSize:.65rem;
    }
    .cli-card-info {
      fontSize:.75rem;
    }
  }
`;

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('cli-page-style')) return;
  const el = document.createElement('style');
  el.id = 'cli-page-style';
  el.textContent = PAGE_CSS;
  document.head.appendChild(el);
}

/* ── Helpers ── */
function getInitials(nom) {
  const parts = (nom || '?').trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

function getStatusBadge(statut) {
  const map = {
    vip:     <span className="cli-badge cli-badge-vip">⭐ VIP</span>,
    new:     <span className="cli-badge cli-badge-new">🆕 Nouveau</span>,
    regular: <span className="cli-badge cli-badge-regular">✓ Régulier</span>,
  };
  return map[statut] || map.regular;
}

function contacterWhatsApp(telephone) {
  if (!telephone) return;
  let num = telephone.replace(/[\s+\-()]/g, '');
  if (!num.startsWith('237')) {
    if (num.startsWith('6')) num = '237' + num;
    else if (num.startsWith('0')) num = '237' + num.substring(1);
  }
  window.open(`https://wa.me/${num}?text=${encodeURIComponent('Bonjour, je vous contacte depuis ma boutique.')}`, '_blank');
}

function showNotif(msg, type = 'info') {
  if (typeof document === 'undefined') return;
  const colors = { success:'#34C759', error:'#FF3B30', info:'#007AFF', warning:'#FF9500' };
  let c = document.getElementById('cli-notif-c');
  if (!c) {
    c = document.createElement('div');
    c.id = 'cli-notif-c';
    Object.assign(c.style, { 
      position:'fixed', 
      top:'100px', 
      right:'20px', 
      zIndex:'10000', 
      display:'flex', 
      flexDirection:'column', 
      gap:'12px',
      maxWidth:'90vw'
    });
    document.body.appendChild(c);
  }
  const n = document.createElement('div');
  n.className = 'cli-notif';
  n.style.borderLeft = `4px solid ${colors[type]}`;
  n.textContent = msg;
  c.appendChild(n);
  setTimeout(() => { n.style.animation = 'cli-fadeOut .5s ease'; setTimeout(() => n.remove(), 500); }, 3000);
}

/* ══════════════════════════════════════════════════════════
   COMPOSANTS RESTENT INCHANGÉS
══════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════════
   MODAL: FORMULAIRE CLIENT
══════════════════════════════════════════════════════════ */
function ClientFormModal({ editClient, onClose, onSaved }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(editClient || { 
    nom: '', 
    email: '', 
    telephone: '', 
    ville: '', 
    statut: 'regular',
    nombreCommandes: 0,
    totalDepense: 0
  });

  const handleSave = async () => {
    if (!formData.nom || !formData.email || !formData.telephone) {
      showNotif('⚠️ Remplissez les champs obligatoires', 'warning');
      return;
    }
    try {
      setLoading(true);
      const supabase = getSupabase();
      
      // Ne pas envoyer created_at (auto-généré par Supabase)
      const { created_at, ...dataToSave } = formData;
      const payload = { 
        ...dataToSave, 
        user_id: user.id
      };
      
      if (editClient?.id) {
        const { error } = await supabase.from('clients').update(payload).eq('id', editClient.id);
        if (error) throw error;
        showNotif('✅ Client modifié', 'success');
      } else {
        const { error } = await supabase.from('clients').insert([payload]);
        if (error) throw error;
        showNotif('✅ Client ajouté', 'success');
      }
      onSaved();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      showNotif('❌ Erreur sauvegarde: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000 }}>
      <div style={{ background:'white', borderRadius:'20px', padding:'24px', maxWidth:'500px', width:'95%', boxShadow:'0 10px 40px rgba(0,0,0,.2)', maxHeight:'90vh', overflowY:'auto' }}>
        <h2 style={{ marginBottom:'20px', fontSize:'1.3rem', fontWeight:700 }}>{editClient ? '✏️ Modifier' : '➕ Ajouter'} client</h2>
        
        <div style={{ marginBottom:'12px' }}>
          <input type="text" placeholder="Nom *" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} style={{ width:'100%', padding:'10px', border:'2px solid #D2D2D7', borderRadius:'12px', fontFamily:'Poppins,sans-serif', fontSize:'.95rem', boxSizing:'border-box' }} />
        </div>
        <div style={{ marginBottom:'12px' }}>
          <input type="email" placeholder="Email *" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width:'100%', padding:'10px', border:'2px solid #D2D2D7', borderRadius:'12px', fontFamily:'Poppins,sans-serif', fontSize:'.95rem', boxSizing:'border-box' }} />
        </div>
        <div style={{ marginBottom:'12px' }}>
          <input type="tel" placeholder="Téléphone *" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} style={{ width:'100%', padding:'10px', border:'2px solid #D2D2D7', borderRadius:'12px', fontFamily:'Poppins,sans-serif', fontSize:'.95rem', boxSizing:'border-box' }} />
        </div>
        <div style={{ marginBottom:'12px' }}>
          <input type="text" placeholder="Ville" value={formData.ville} onChange={e => setFormData({...formData, ville: e.target.value})} style={{ width:'100%', padding:'10px', border:'2px solid #D2D2D7', borderRadius:'12px', fontFamily:'Poppins,sans-serif', fontSize:'.95rem', boxSizing:'border-box' }} />
        </div>
        <div style={{ marginBottom:'20px' }}>
          <select value={formData.statut} onChange={e => setFormData({...formData, statut: e.target.value})} style={{ width:'100%', padding:'10px', border:'2px solid #D2D2D7', borderRadius:'12px', fontFamily:'Poppins,sans-serif', fontSize:'.95rem', boxSizing:'border-box' }}>
            <option value="regular">Régulier</option>
            <option value="vip">VIP</option>
            <option value="new">Nouveau</option>
          </select>
        </div>

        <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end', flexWrap:'wrap' }}>
          <button onClick={onClose} style={{ padding:'10px 20px', background:'#E5E5EA', border:'none', borderRadius:'12px', cursor:'pointer', fontWeight:600, fontFamily:'Poppins,sans-serif', fontSize:'.9rem' }} disabled={loading}>Annuler</button>
          <button onClick={handleSave} style={{ padding:'10px 20px', background:'#007AFF', color:'white', border:'none', borderRadius:'12px', cursor:'pointer', fontWeight:600, fontFamily:'Poppins,sans-serif', fontSize:'.9rem' }} disabled={loading}>{loading ? '⏳...' : 'Sauvegarder'}</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MODAL: DÉTAILS CLIENT
══════════════════════════════════════════════════════════ */
function ClientDetailModal({ client, onClose, onDelete }) {
  if (!client) return null;
  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000 }}>
      <div style={{ background:'white', borderRadius:'20px', padding:'24px', maxWidth:'500px', width:'95%', boxShadow:'0 10px 40px rgba(0,0,0,.2)' }}>
        <h2 style={{ marginBottom:'20px', fontSize:'1.3rem', fontWeight:700 }}>👥 {client.nom}</h2>
        
        <div style={{ marginBottom:'15px', fontSize:'.95rem' }}><strong>📧 Email:</strong> {client.email}</div>
        <div style={{ marginBottom:'15px', fontSize:'.95rem' }}><strong>📱 Téléphone:</strong> {client.telephone}</div>
        <div style={{ marginBottom:'15px', fontSize:'.95rem' }}><strong>📍 Ville:</strong> {client.ville || 'N/A'}</div>
        <div style={{ marginBottom:'15px', fontSize:'.95rem' }}><strong>🏷️ Statut:</strong> {client.statut}</div>
        <div style={{ marginBottom:'20px', fontSize:'.95rem' }}><strong>📅 Inscrit:</strong> {new Date(client.created_at).toLocaleDateString('fr-FR')}</div>

        <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end', flexWrap:'wrap' }}>
          <button onClick={onClose} style={{ padding:'10px 20px', background:'#E5E5EA', border:'none', borderRadius:'12px', cursor:'pointer', fontWeight:600, fontFamily:'Poppins,sans-serif', fontSize:'.9rem' }}>Fermer</button>
          <button onClick={() => onDelete(client.id)} style={{ padding:'10px 20px', background:'#FF3B30', color:'white', border:'none', borderRadius:'12px', cursor:'pointer', fontWeight:600, fontFamily:'Poppins,sans-serif', fontSize:'.9rem' }}>🗑️ Supprimer</button>
        </div>
      </div>
    </div>
  );
}

export default function ClientManager() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [view, setView] = useState('grid');
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [detailClient, setDetailClient] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');

  useEffect(() => {
    injectStyles();
    if (user?.id) loadClients();
  }, [user]);

  useEffect(() => {
    let result = clients;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.nom.toLowerCase().includes(term) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.telephone && c.telephone.includes(term))
      );
    }
    if (filterStatus !== 'all') {
      result = result.filter(c => c.statut === filterStatus);
    }
    result.sort((a, b) => {
      switch(sortBy) {
        case 'nom': return a.nom.localeCompare(b.nom);
        case 'totalDepense': return b.totalDepense - a.totalDepense;
        default: return new Date(b[sortBy]) - new Date(a[sortBy]);
      }
    });
    setFiltered(result);
  }, [clients, searchTerm, filterStatus, sortBy]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error(err);
      showNotif('❌ Erreur chargement clients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id) => {
    if (!confirm('Êtes-vous sûr ?')) return;
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      loadClients();
      showNotif('✅ Client supprimé', 'success');
    } catch (err) {
      console.error(err);
      showNotif('❌ Erreur suppression', 'error');
    }
  };

  const openForm = (client = null) => {
    setEditClient(client);
    setShowForm(true);
  };

  return (
    <div style={{ background:'#F5F5F7', minHeight:'100vh', padding:'16px' }}>
      {/* HEADER */}
      <div style={{ maxWidth:'1200px', margin:'0 auto', marginBottom:'24px' }}>
        <h1 style={{ fontSize:'2rem', fontWeight:700, marginBottom:'12px', color:'#1D1D1F' }}>👥 Mes Clients</h1>
        <p style={{ color:'#86868B', marginBottom:'24px' }}>Gérez et suivez tous vos clients</p>

        {/* CONTRÔLES */}
        <div style={{ background:'white', borderRadius:'16px', padding:'16px', boxShadow:'0 2px 8px rgba(0,0,0,.08)' }}>
          <div className="cli-header-container">
            <input
              type="text"
              placeholder="🔍 Rechercher un client..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="cli-search"
              style={{ flex:'1', minWidth:'200px' }}
            />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="cli-select">
              <option value="all">Tous</option>
              <option value="new">Nouveau</option>
              <option value="vip">VIP</option>
              <option value="regular">Régulier</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="cli-select">
              <option value="created_at">Récents</option>
              <option value="nom">Nom A→Z</option>
              <option value="totalDepense">Dépense ↓</option>
            </select>
          </div>

          <div className="cli-toolbar">
            <div>
              <button className={`cli-view-btn${view==='grid'?' active':''}`} onClick={() => setView('grid')}>⊞ Grille</button>
              <button className={`cli-view-btn${view==='table'?' active':''}`} onClick={() => setView('table')}>☰ Liste</button>
            </div>
            <button className="cli-btn-primary" onClick={() => openForm()} style={{ padding:'10px 16px' }}>➕ Nouveau</button>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'#86868B' }}>⏳ Chargement des clients...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background:'white', borderRadius:'20px', padding:'60px', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,.08)' }}>
          <div style={{ fontSize:'4rem', marginBottom:'16px' }}>👥</div>
          <h3 style={{ fontSize:'1.5rem', fontWeight:600, marginBottom:'8px' }}>Aucun client trouvé</h3>
          <p style={{ color:'#86868B', marginBottom:'24px' }}>Les clients apparaîtront ici après leur ajout</p>
          <button className="cli-btn-primary" onClick={() => openForm()}>➕ Ajouter le premier client</button>
        </div>
      ) : view === 'grid' ? (

        /* ── VUE GRILLE OPTIMISÉE ── */
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <div className="cli-grid-container">
            {filtered.map((c, i) => (
              <div key={c.id} className="cli-card" onClick={() => setDetailClient(c)}>
                {/* Header */}
                <div style={{ display:'flex', gap:'12px', alignItems:'flex-start', marginBottom:'12px' }}>
                  <div className={`av-${i % 8}`} style={{ width:'45px', height:'45px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'1.2rem', fontWeight:700, flexShrink:0 }}>
                    {c.avatar || getInitials(c.nom)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="cli-card-title">{c.nom}</div>
                    <div className="cli-card-subtitle">{c.email || 'Pas d\'email'}</div>
                    {getStatusBadge(c.statut)}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'10px' }}>
                  <div className="cli-stat-box">
                    <div style={{ fontSize:'1.1rem', fontWeight:700, color:'#007AFF', marginBottom:'1px' }}>{c.nombreCommandes}</div>
                    <div style={{ fontSize:'.65rem', color:'#86868B' }}>Cdes</div>
                  </div>
                  <div className="cli-stat-box">
                    <div style={{ fontSize:'1.1rem', fontWeight:700, color:'#007AFF', marginBottom:'1px' }}>{(c.totalDepense/1000).toFixed(0)}k</div>
                    <div style={{ fontSize:'.65rem', color:'#86868B' }}>FCFA</div>
                  </div>
                </div>

                {/* Infos */}
                {c.telephone && <div className="cli-card-info">📞 {c.telephone}</div>}
                {c.ville     && <div className="cli-card-info">📍 {c.ville}</div>}

                {/* Actions */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px', marginTop:'10px' }}>
                  <button className="cli-btn-view" onClick={e => { e.stopPropagation(); setDetailClient(c); }}>
                    👁️ Voir
                  </button>
                  <button className="cli-btn-contact" onClick={e => { e.stopPropagation(); contacterWhatsApp(c.telephone); }}>
                    📱 Chat
                  </button>
                </div>

                {/* Modifier / Supprimer */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px', marginTop:'5px' }}>
                  <button onClick={e => { e.stopPropagation(); openForm(c); }} style={{ padding:'6px', background:'#dbeafe', color:'#1d4ed8', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:600, fontSize:'.75rem', fontFamily:'Poppins,sans-serif' }}>
                    ✏️ Éd
                  </button>
                  <button onClick={e => { e.stopPropagation(); deleteClient(c.id); }} style={{ padding:'6px', background:'rgba(255,59,48,.1)', color:'#FF3B30', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:600, fontSize:'.75rem', fontFamily:'Poppins,sans-serif' }}>
                    🗑️ Sup
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      ) : (

        /* ── VUE TABLEAU RESPONSIVE ── */
        <div style={{ background:'white', borderRadius:'20px', boxShadow:'0 2px 8px rgba(0,0,0,.08)', overflow:'hidden', marginBottom:'32px', overflowX:'auto' }}>
          <table className="cli-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Statut</th>
                <th>Cdes</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} onClick={() => setDetailClient(c)}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <div className={`av-${i % 8}`} style={{ width:'36px', height:'36px', borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:600, fontSize:'.9rem', flexShrink:0 }}>
                        {c.avatar || getInitials(c.nom)}
                      </div>
                      <strong style={{ fontSize:'.95rem' }}>{c.nom}</strong>
                    </div>
                  </td>
                  <td style={{ color:'#86868B', fontSize:'.9rem' }}>{c.email || '—'}</td>
                  <td>{getStatusBadge(c.statut)}</td>
                  <td style={{ fontWeight:600, fontSize:'.95rem' }}>{c.nombreCommandes}</td>
                  <td style={{ fontWeight:600, color:'#007AFF', fontSize:'.9rem' }}>{(c.totalDepense/1000).toFixed(0)}k</td>
                  <td>
                    <div style={{ display:'flex', gap:'4px' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => openForm(c)} style={{ padding:'4px 8px', background:'#dbeafe', color:'#1d4ed8', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:600, fontSize:'.7rem', fontFamily:'Poppins,sans-serif' }}>✏️</button>
                      <button onClick={() => deleteClient(c.id)} style={{ padding:'4px 8px', background:'rgba(255,59,48,.1)', color:'#FF3B30', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:600, fontSize:'.7rem', fontFamily:'Poppins,sans-serif' }}>🗑️</button>
                      <button onClick={() => contacterWhatsApp(c.telephone)} style={{ padding:'4px 8px', background:'rgba(37,211,102,.1)', color:'#25D366', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:600, fontSize:'.7rem', fontFamily:'Poppins,sans-serif' }}>📱</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODALS */}
      {detailClient && (
        <ClientDetailModal
          client={detailClient}
          onClose={() => setDetailClient(null)}
          onDelete={id => { deleteClient(id); setDetailClient(null); }}
        />
      )}

      {showForm && (
        <ClientFormModal
          editClient={editClient}
          onClose={() => { setShowForm(false); setEditClient(null); }}
          onSaved={() => { setShowForm(false); setEditClient(null); loadClients(); }}
        />
      )}
    </div>
  );
}