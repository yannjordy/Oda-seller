'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

/* ═══════════════════════════════════════════════════════════════
   CSS PROFESSIONNEL — PALETTE ODA + INSPIRATION SHOPIFY/STRIPE
   ═══════════════════════════════════════════════════════════════ */
const PAGE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

  @keyframes fadeIn     { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
  @keyframes slideIn    { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideOut   { from{opacity:1} to{opacity:0;transform:translateX(24px)} }
  @keyframes scaleIn    { 0%{opacity:0;transform:scale(.92)} 100%{opacity:1;transform:scale(1)} }
  @keyframes progressBar { from{width:0} to{width:100%} }

  :root {
    --oda-orange:    #FF6B00;
    --oda-orange-light: #FFF1EB;
    --oda-blue:      #007AFF;
    --oda-blue-light: #EBF5FF;
    --oda-green:     #34C759;
    --oda-green-light:#E8F9ED;
    --oda-red:       #FF3B30;
    --oda-red-light:  #FFEBEE;
    --oda-gray-50:   #F9FAFB;
    --oda-gray-100:  #F0F2F5;
    --oda-gray-200:  #E5E7EB;
    --oda-gray-300:  #D2D4D7;
    --oda-gray-400:  #9E9EA3;
    --oda-gray-500:  #6E6E73;
    --oda-gray-600:  #4A4A4F;
    --oda-gray-700:  #2D2D31;
    --oda-gray-800:  #1D1D1F;
    --shadow-xs:  0 1px 2px rgba(0,0,0,.04);
    --shadow-sm:  0 2px 8px rgba(0,0,0,.06);
    --shadow-md:  0 8px 24px rgba(0,0,0,.08);
    --shadow-lg:  0 20px 60px rgba(0,0,0,.12);
    --radius-sm:  8px;
    --radius-md:  12px;
    --radius-lg:  16px;
    --radius-xl:  20px;
    --font:      'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:var(--font); color:var(--oda-gray-800); background:var(--oda-gray-50); -webkit-font-smoothing:antialiased; }

  /* ── Container ── */
  .prm-container {
    max-width:1440px; margin:0 auto; padding:32px 40px;
    display:grid; grid-template-columns:280px 1fr; gap:40px;
    animation:fadeIn .5s ease;
  }
  @media(max-width:1100px){ .prm-container { grid-template-columns:1fr; padding:24px 20px; gap:24px; } }

  /* ── Sidebar ── */
  .prm-sidebar {
    background:white; border-radius:var(--radius-lg); padding:28px 20px;
    box-shadow:var(--shadow-sm); height:fit-content; position:sticky; top:calc(24px + env(safe-area-inset-top));
    border:1px solid var(--oda-gray-200);
  }
  @media(max-width:1100px){ .prm-sidebar { display:none; } }

  .prm-sidebar-title {
    font-size:.82rem; font-weight:600; color:var(--oda-gray-400);
    text-transform:uppercase; letter-spacing:1.2px; margin-bottom:20px; padding:0 12px;
  }

  .prm-nav-item {
    display:flex; align-items:center; gap:12px; padding:11px 16px; border-radius:var(--radius-md);
    color:var(--oda-gray-600); text-decoration:none; transition:all .25s ease;
    font-weight:500; font-size:.92rem; margin-bottom:4px; border:none; background:none;
    width:100%; cursor:pointer; text-align:left; font-family:var(--font);
  }
  .prm-nav-item:hover { background:var(--oda-gray-50); color:var(--oda-gray-800); }
  .prm-nav-item.active {
    background:linear-gradient(135deg, var(--oda-blue), #5856D6); color:white;
    box-shadow:0 4px 12px rgba(0,122,255,.25);
  }
  .prm-nav-icon { font-size:1.15rem; flex-shrink:0; width:24px; text-align:center; }

  /* ── Main Content ── */
  .prm-main { display:flex; flex-direction:column; gap:28px; }

  .prm-section {
    background:white; border-radius:var(--radius-lg); padding:32px 36px;
    box-shadow:var(--shadow-sm); border:1px solid var(--oda-gray-200);
    animation:fadeIn .5s ease;
  }
  @media(max-width:768px){ .prm-section { padding:24px 20px; } }

  .prm-section-header { margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid var(--oda-gray-100); }
  .prm-section-title { font-size:1.35rem; font-weight:700; color:var(--oda-gray-800); margin-bottom:6px; }
  .prm-section-desc { font-size:.88rem; color:var(--oda-gray-500); line-height:1.6; }

  /* ── Form Grid ── */
  .prm-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
  @media(max-width:768px){ .prm-form-grid { grid-template-columns:1fr; } }

  .prm-field { margin-bottom:20px; }
  .prm-label {
    display:block; font-weight:600; font-size:.88rem; color:var(--oda-gray-700);
    margin-bottom:8px;
  }
  .prm-input, .prm-textarea, .prm-select {
    width:100%; padding:11px 16px; border:1.5px solid var(--oda-gray-200);
    border-radius:var(--radius-sm); font-family:var(--font); font-size:.92rem;
    color:var(--oda-gray-800); background:white; transition:all .25s ease; outline:none;
  }
  .prm-input:focus, .prm-textarea:focus, .prm-select:focus {
    border-color:var(--oda-blue); box-shadow:0 0 0 3px rgba(0,122,255,.15);
  }
  .prm-textarea { resize:vertical; min-height:100px; }
  .prm-hint { font-size:.78rem; color:var(--oda-gray-400); margin-top:6px; display:block; }

  /* ── Toggle ── */
  .prm-toggle { position:relative; display:inline-block; width:48px; height:26px; flex-shrink:0; }
  .prm-toggle input { opacity:0; width:0; height:0; position:absolute; }
  .prm-toggle-slider {
    position:absolute; cursor:pointer; inset:0; background:var(--oda-gray-300);
    transition:.3s ease; border-radius:26px;
  }
  .prm-toggle-slider::before {
    position:absolute; content:""; height:20px; width:20px; left:3px; bottom:3px;
    background:white; transition:.3s ease; border-radius:50%;
    box-shadow:var(--shadow-xs);
  }
  input:checked + .prm-toggle-slider { background:linear-gradient(135deg, var(--oda-blue), #5856D6); }
  input:checked + .prm-toggle-slider::before { transform:translateX(22px); }

  /* ── Setting Item ── */
  .prm-setting-item {
    display:flex; justify-content:space-between; align-items:center;
    padding:18px 20px; background:var(--oda-gray-50); border-radius:var(--radius-md);
    margin-bottom:12px; border:1px solid var(--oda-gray-100);
    transition:all .25s ease;
  }
  .prm-setting-item:hover { border-color:var(--oda-gray-200); box-shadow:var(--shadow-xs); }
  @media(max-width:768px){ .prm-setting-item { flex-direction:column; gap:12px; align-items:flex-start; } }

  .prm-setting-info { flex:1; }
  .prm-setting-title { font-weight:600; font-size:.92rem; color:var(--oda-gray-800); margin-bottom:3px; }
  .prm-setting-desc { font-size:.82rem; color:var(--oda-gray-500); line-height:1.5; }

  /* ── Buttons ── */
  .prm-btn {
    padding:11px 24px; border-radius:var(--radius-sm); font-family:var(--font);
    font-size:.9rem; font-weight:600; cursor:pointer; transition:all .25s ease;
    display:inline-flex; align-items:center; gap:8px; border:none;
  }
  .prm-btn-primary {
    background:linear-gradient(135deg, var(--oda-blue), #5856D6); color:white;
    box-shadow:0 4px 12px rgba(0,122,255,.2);
  }
  .prm-btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(0,122,255,.3); }
  .prm-btn-primary:disabled { opacity:.6; cursor:not-allowed; transform:none; }

  .prm-btn-secondary {
    background:white; color:var(--oda-blue); border:1.5px solid var(--oda-blue);
  }
  .prm-btn-secondary:hover { background:var(--oda-blue-light); }

  .prm-btn-danger { background:var(--oda-red); color:white; }
  .prm-btn-danger:hover { background:#d32f2f; }

  .prm-btn-success { background:var(--oda-green); color:white; }
  .prm-btn-success:hover { background:#2da94e; }

  /* ── Alert ── */
  .prm-alert {
    display:flex; gap:12px; padding:16px 20px; border-radius:var(--radius-md);
    margin-bottom:24px; font-size:.9rem; line-height:1.6;
  }
  .prm-alert-info { background:var(--oda-blue-light); border-left:4px solid var(--oda-blue); color:var(--oda-gray-700); }
  .prm-alert-success { background:var(--oda-green-light); border-left:4px solid var(--oda-green); }
  .prm-alert-warning { background:#FFF9EB; border-left:4px solid #FF9500; }

  /* ── Slug Status ── */
  .prm-slug-status { margin-top:10px; padding:10px 14px; border-radius:var(--radius-sm); font-size:.85rem; font-weight:500; }
  .prm-slug-status.available { background:var(--oda-green-light); color:var(--oda-green); }
  .prm-slug-status.unavailable { background:var(--oda-red-light); color:var(--oda-red); }

  /* ── Input Prefix ── */
  .prm-input-prefix { display:flex; border:1.5px solid var(--oda-gray-200); border-radius:var(--radius-sm); overflow:hidden; transition:all .25s ease; }
  .prm-input-prefix:focus-within { border-color:var(--oda-blue); box-shadow:0 0 0 3px rgba(0,122,255,.15); }
  .prm-prefix {
    background:var(--oda-gray-50); padding:11px 16px; font-weight:600;
    color:var(--oda-gray-500); flex-shrink:0; border-right:1.5px solid var(--oda-gray-200);
    font-size:.9rem;
  }
  .prm-input-prefix .prm-input { border:none; box-shadow:none; border-radius:0; }

  /* ── Payment Cards ── */
  .prm-payment-card {
    border:1.5px solid var(--oda-gray-200); border-radius:var(--radius-md);
    padding:24px; transition:all .3s ease; margin-bottom:16px;
  }
  .prm-payment-card:hover { border-color:var(--oda-blue); box-shadow:var(--shadow-sm); }

  .prm-payment-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
  .prm-payment-icon {
    width:44px; height:44px; border-radius:var(--radius-sm); display:flex;
    align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0;
  }
  .prm-payment-title { font-weight:600; font-size:1rem; color:var(--oda-gray-800); }
  .prm-payment-desc { font-size:.82rem; color:var(--oda-gray-500); margin-top:2px; }

  /* ── Mobile Money Section ── */
  .prm-mm-section {
    margin-top:16px; padding:18px; background:var(--oda-gray-50);
    border-radius:var(--radius-md); border:1px solid var(--oda-gray-100);
  }
  .prm-mm-header { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
  .prm-mm-icon {
    width:40px; height:40px; border-radius:var(--radius-sm); display:flex;
    align-items:center; justify-content:center; font-size:1.3rem;
  }

  /* ── Shipping Zones ── */
  .prm-zone-row {
    display:grid; grid-template-columns:1fr 120px auto; gap:12px;
    padding:16px; background:var(--oda-gray-50); border-radius:var(--radius-md);
    margin-bottom:10px; align-items:center; border:1px solid var(--oda-gray-100);
  }
  @media(max-width:600px){ .prm-zone-row { grid-template-columns:1fr; } }

  /* ── Danger Zone ── */
  .prm-danger-zone { margin-top:40px; padding-top:32px; border-top:2px solid var(--oda-gray-100); }

  /* ── Preview Modal ── */
  .prm-modal-overlay {
    display:none; position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,.55);
    backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
    align-items:center; justify-content:center; padding:20px;
  }
  .prm-modal-overlay.active { display:flex; animation:fadeIn .3s ease; }

  .prm-modal-box {
    background:white; border-radius:var(--radius-xl); width:100%; max-width:440px;
    height:85vh; max-height:820px; display:flex; flex-direction:column;
    overflow:hidden; box-shadow:var(--shadow-lg);
    animation:scaleIn .35s cubic-bezier(.34,1.56,.64,1);
  }

  .prm-modal-bar {
    display:flex; align-items:center; justify-content:space-between;
    padding:16px 20px; border-bottom:1px solid var(--oda-gray-100);
    background:var(--oda-gray-50); flex-shrink:0; gap:10px;
  }
  .prm-modal-dots { display:flex; gap:5px; }
  .prm-modal-dots span { width:10px; height:10px; border-radius:50%; }
  .prm-modal-dots span:nth-child(1){background:#FF5F56}
  .prm-modal-dots span:nth-child(2){background:#FFBD2E}
  .prm-modal-dots span:nth-child(3){background:#27C93F}

  .prm-modal-url {
    flex:1; min-width:0; background:white; border:1px solid var(--oda-gray-200);
    border-radius:var(--radius-sm); padding:6px 12px; font-size:.78rem;
    color:var(--oda-blue); font-family:monospace; overflow:hidden; text-overflow:ellipsis;
    white-space:nowrap;
  }

  .prm-modal-iframe { flex:1; border:none; width:100%; background:white; }

  .prm-modal-footer {
    padding:12px 20px; border-top:1px solid var(--oda-gray-100);
    background:var(--oda-gray-50); display:flex; align-items:center;
    justify-content:space-between; gap:8px; flex-shrink:0;
  }

  /* ── Link Row ── */
  .prm-link-row { display:flex; gap:10px; align-items:center; margin-top:10px; min-width:0; }
  .prm-link-row .prm-input { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; }
  @media(max-width:480px){
    .prm-link-row { flex-direction:column; align-items:stretch; }
    .prm-link-row button { align-self:flex-end; }
  }

  /* ── Notification Toast ── */
  .prm-notif {
    position:fixed; top:calc(24px + env(safe-area-inset-top)); right:24px; z-index:10000;
    background:white; padding:14px 22px; border-radius:var(--radius-md);
    box-shadow:var(--shadow-md); animation:slideIn .4s cubic-bezier(.34,1.56,.64,1);
    max-width:360px; font-family:var(--font); font-weight:500;
    color:var(--oda-gray-800); cursor:pointer; font-size:.9rem;
    border-left:4px solid var(--oda-blue);
  }

  /* ── Upload Zone ── */
  .prm-upload-zone {
    position:relative; border:2px dashed var(--oda-gray-200); border-radius:var(--radius-lg);
    padding:40px 24px; text-align:center; cursor:pointer;
    transition:all .3s cubic-bezier(.34,1.56,.64,1);
    background:linear-gradient(135deg, #fafafa 0%, var(--oda-gray-50) 100%);
    min-height:170px; display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:10px;
  }
  .prm-upload-zone:hover { border-color:var(--oda-blue); transform:translateY(-3px); box-shadow:var(--shadow-sm); }
  .prm-upload-zone.drag-over { border-color:var(--oda-blue); background:rgba(0,122,255,.04); transform:scale(1.02); box-shadow:var(--shadow-md); }
  .prm-upload-zone.has-image { border-color:var(--oda-green); background:var(--oda-green-light); border-style:solid; }

  .prm-upload-badge {
    position:absolute; top:12px; right:12px; background:var(--oda-green); color:white;
    font-size:.7rem; font-weight:700; padding:4px 10px; border-radius:20px;
    opacity:0; transform:scale(.8); transition:all .3s ease; pointer-events:none;
  }
  .prm-upload-zone.has-image .prm-upload-badge { opacity:1; transform:scale(1); }

  .prm-upload-icon { font-size:2.8rem; line-height:1; transition:transform .3s ease; }
  .prm-upload-zone:hover .prm-upload-icon { transform:scale(1.1) rotate(-5deg); }

  .prm-upload-preview-img { max-width:100%; max-height:130px; object-fit:contain; border-radius:var(--radius-sm); box-shadow:var(--shadow-xs); }

  .prm-upload-overlay {
    position:absolute; inset:0; background:rgba(0,0,0,.5); border-radius:calc(var(--radius-lg) - 2px);
    display:flex; align-items:center; justify-content:center;
    opacity:0; transition:opacity .3s ease; font-size:.85rem; font-weight:600;
    color:white; gap:6px; pointer-events:none;
  }
  .prm-upload-zone:hover .prm-upload-overlay { opacity:1; }

  /* ── Mobile Menu ── */
  .prm-mobile-menu {
    position:fixed; bottom:0; left:0; right:0; background:var(--oda-gray-800);
    display:none; justify-content:flex-start; align-items:center;
    padding:10px 0 calc(10px + env(safe-area-inset-bottom));
    box-shadow:0 -4px 20px rgba(0,0,0,.25); z-index:9999;
    border-radius:var(--radius-xl) var(--radius-xl) 0 0; overflow-x:auto; -webkit-overflow-scrolling:touch; gap:4px;
  }
  .prm-mobile-menu::-webkit-scrollbar { display:none; }
  .prm-mobile-menu { -ms-overflow-style:none; scrollbar-width:none; }

  .prm-mob-btn {
    display:flex; flex-direction:column; align-items:center; gap:3px;
    background:none; border:none; color:var(--oda-gray-400); cursor:pointer;
    padding:8px 10px; border-radius:var(--radius-md); transition:all .3s ease;
    position:relative; min-width:68px; flex-shrink:0; font-family:var(--font);
  }
  .prm-mob-btn .prm-mob-icon { font-size:22px; transition:transform .3s ease; display:block; }
  .prm-mob-btn .prm-mob-label { font-size:9px; font-weight:500; white-space:nowrap; text-align:center; display:block; }
  .prm-mob-btn.active { color:var(--oda-blue); }
  .prm-mob-btn.active .prm-mob-label { font-weight:600; }
  .prm-mob-btn .prm-mob-dot {
    position:absolute; bottom:3px; left:50%; transform:translateX(-50%);
    width:4px; height:4px; background:var(--oda-blue); border-radius:2px;
  }
  .prm-mob-btn:active { transform:scale(.95); }
  @media(hover:hover){ .prm-mob-btn:hover { background:rgba(0,122,255,.12); } }

  @media(max-width:1100px){ .prm-mobile-menu { display:flex; } body { padding-bottom:90px; } }
  @media(min-width:1101px){ .prm-mobile-menu { display:none !important; } }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width:6px; }
  ::-webkit-scrollbar-thumb { background:rgba(0,0,0,.12); border-radius:10px; }
`;

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('prm-page-style')) return;
  const el = document.createElement('style');
  el.id = 'prm-page-style';
  el.textContent = PAGE_CSS;
  document.head.appendChild(el);
}

function showNotif(msg, type = 'info') {
  if (typeof document === 'undefined') return;
  const colors = { success:'#34C759', error:'#FF3B30', info:'#007AFF', warning:'#FF9500' };
  let c = document.getElementById('prm-notif-c');
  if (!c) {
    c = document.createElement('div');
    c.id = 'prm-notif-c';
    Object.assign(c.style, { position:'fixed', top:'100px', right:'20px', zIndex:'10000', display:'flex', flexDirection:'column', gap:'12px', pointerEvents:'none' });
    document.body.appendChild(c);
  }
  const n = document.createElement('div');
  n.className = 'prm-notif';
  n.style.borderLeftColor = colors[type] || colors.info;
  n.style.pointerEvents = 'all';
  n.textContent = msg;
  n.addEventListener('click', () => n.remove());
  c.appendChild(n);
  setTimeout(() => {
    n.style.animation = 'slideOut .4s ease forwards';
    setTimeout(() => n.remove(), 400);
  }, 3500);
}

/* ═══════════════════════════════════════════════════════════════
   TOGGLE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
function Toggle({ id, checked, onChange }) {
  return (
    <label className="prm-toggle">
      <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="prm-toggle-slider" />
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════════
   UPLOAD ZONE COMPONENT (Logo & Favicon)
   ═══════════════════════════════════════════════════════════════ */
function UploadZone({ type, value, onUpload, icon, title, hint, accept }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const hasImage = !!value;

  function handleFile(file) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showNotif('❌ Fichier trop lourd (max 2 MB)', 'error'); return; }
    if (!file.type.startsWith('image/')) { showNotif('❌ Fichier invalide (image uniquement)', 'error'); return; }
    const reader = new FileReader();
    reader.onload = e => onUpload(type, e.target.result);
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <div
        className={`prm-upload-zone${hasImage ? ' has-image' : ''}${dragOver ? ' drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
      >
        <div className="prm-upload-badge">✓ Chargé</div>

        {hasImage ? (
          <>
            <img className="prm-upload-preview-img" src={value} alt={type} />
            <div className="prm-upload-overlay">✏️ Changer</div>
          </>
        ) : (
          <>
            <div className="prm-upload-icon">{icon}</div>
            <p style={{ fontWeight:600, fontSize:'.92rem', color:'var(--oda-gray-700)', position:'relative' }}>{title}</p>
            <p style={{ fontSize:'.82rem', color:'var(--oda-gray-400)', position:'relative' }}>
              {type === 'favicon' ? 'PNG, ICO — max 2 MB' : 'PNG, JPG, SVG — max 2 MB'}
            </p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept || 'image/*'}
        style={{ display:'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />
      <small style={{ display:'block', marginTop:'8px', fontSize:'.82rem', color:'var(--oda-gray-400)' }}>{hint}</small>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DEFAULT PARAMS
   ═══════════════════════════════════════════════════════════════ */
const DEFAULT_PARAMS = {
  general:      { nom:'', description:'', email:'', telephone:'', adresse:'' },
  identifiant:  { slug:'', disponible:false, auto:false },
  paiement: {
    carte:  { actif:false, cle:'', confirme:false },
    mobile: { actif:false, confirme:false, mtn:{actif:false,nomCompte:'',numero:'',confirme:false}, orange:{actif:false,nomCompte:'',numero:'',confirme:false} },
    cash:   { actif:false, confirme:false },
    devise: 'FCFA'
  },
  livraison: { fraisDouala:1000, fraisAutres:2500, delai:'2-5 jours ouvrables', gratuit:false, montantMin:50000, zonesPersonnalisees:[] },
  apparence: { couleurPrimaire:'#FF6B00', couleurSecondaire:'#1A1A1A', logo:'', favicon:'', police:'Inter' },
  notifications: { commandes:true, stock:true, clients:false, rapports:true }
};

/* ═══════════════════════════════════════════════════════════════
   DEEP MERGE HELPER
   ═══════════════════════════════════════════════════════════════ */
function deepMerge(defaults, incoming) {
  if (!incoming || typeof incoming !== 'object') return defaults;
  const result = { ...defaults };
  for (const key of Object.keys(defaults)) {
    const def = defaults[key];
    const inc = incoming[key];
    if (inc === undefined || inc === null) {
      result[key] = def;
    } else if (typeof def === 'object' && !Array.isArray(def)) {
      result[key] = deepMerge(def, inc);
    } else {
      result[key] = inc;
    }
  }
  return result;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function ParametresPage() {
  const supabase = getSupabase();
  const { user }  = useAuth();
  const router    = useRouter();

  const [activeSection, setActiveSection] = useState('general');
  const [params,  setParams]  = useState(DEFAULT_PARAMS);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  /* Slug */
  const [slugInput,    setSlugInput]    = useState('');
  const [slugStatus,   setSlugStatus]   = useState(null);
  const [showSlugForm, setShowSlugForm] = useState(false);

  /* Sécurité */
  const [passwords, setPasswords] = useState({ current:'', new:'', confirm:'' });
  const [pwdChanging, setPwdChanging] = useState(false);

  /* Preview boutique */
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl,  setPreviewUrl]  = useState('');
  const iframeRef = useRef(null);

  useEffect(() => { injectStyles(); }, []);
  useEffect(() => { if (user) loadParams(); }, [user]);

  /* ═─ Injection meta OG pour partage du lien boutique ═─ */
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const slug    = params.identifiant?.slug;
    const favicon = params.apparence?.favicon;
    const logo    = params.apparence?.logo;
    const nom     = params.general?.nom  || 'Ma Boutique';
    const desc    = params.general?.description || 'Boutique en ligne';

    function setMeta(attr, attrVal, content) {
      let el = document.querySelector(`meta[${attr}="${attrVal}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, attrVal); document.head.appendChild(el); }
      el.setAttribute('content', content);
    }

    if (slug) {
      const shopUrl = `${window.location.origin}/dashboard/boutique?shop=${slug}`;
      const imgUrl  = logo || favicon || '';
      setMeta('property', 'og:type',        'website');
      setMeta('property', 'og:url',         shopUrl);
      setMeta('property', 'og:title',       nom);
      setMeta('property', 'og:description', desc);
      if (imgUrl) {
        setMeta('property', 'og:image',       imgUrl);
        setMeta('property', 'og:image:width',  '512');
        setMeta('property', 'og:image:height', '512');
        setMeta('name',     'twitter:card',    'summary');
        setMeta('name',     'twitter:image',   imgUrl);
        setMeta('name',     'twitter:title',   nom);
        setMeta('name',     'twitter:description', desc);
      }
    }

    /* Met aussi à jour le favicon visible dans l'onglet navigateur */
    if (favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
      link.href = favicon;
    }
  }, [params.identifiant?.slug, params.apparence?.favicon, params.apparence?.logo,
      params.general?.nom, params.general?.description]);

  /* ═─ Génération slug auto ═─ */
  function genSlug() { return `oda-${Date.now().toString(36)}-${Math.random().toString(36).substring(2,6)}`; }

  /* ═─ Chargement ═─ */
  async function loadParams() {
    try {
      const { data } = await supabase.from('parametres_boutique').select('*').eq('user_id', user.id).single();
      if (data?.config) {
        const merged = deepMerge(DEFAULT_PARAMS, data.config);
        setParams(merged);
        setSlugInput(merged.identifiant?.slug || '');
        if (!merged.identifiant?.slug) await initSlug(merged);
      } else {
        const local = localStorage.getItem(`parametres_${user.id}`);
        if (local) {
          try {
            const parsed = deepMerge(DEFAULT_PARAMS, JSON.parse(local));
            setParams(parsed);
            setSlugInput(parsed.identifiant?.slug || '');
            if (!parsed.identifiant?.slug) await initSlug(parsed);
          } catch { await initSlug(DEFAULT_PARAMS); }
        } else {
          await initSlug(DEFAULT_PARAMS);
        }
      }
    } catch { await initSlug(DEFAULT_PARAMS); }
      finally { setLoading(false); }
  }

  async function initSlug(base) {
    const slug = genSlug();
    const next = deepMerge(DEFAULT_PARAMS, { ...base, identifiant:{ slug, disponible:true, auto:true, dateCreation:new Date().toISOString() }, slug });
    setParams(next);
    setSlugInput(slug);
    await saveParams(next);
    showNotif('🔖 Identifiant unique généré automatiquement', 'success');
  }

  /* ═─ Sauvegarde ═─ */
  async function saveParams(p = params) {
    if (!user?.id) return false;
    const json = JSON.stringify(p);
    localStorage.setItem(`parametres_${user.id}`, json);
    localStorage.setItem('parametres_boutique', json);
    if (p.identifiant?.slug) localStorage.removeItem(`boutique_cache_${p.identifiant.slug}`);
    try {
      const { error } = await supabase.from('parametres_boutique').upsert(
        { user_id:user.id, config:p, updated_at:new Date().toISOString() },
        { onConflict:'user_id' }
      );
      if (error) throw error;
      return true;
    } catch { return false; }
  }

  function updateParam(path, value) {
    setParams(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      keys.forEach((k, i) => { if (i === keys.length-1) obj[k] = value; else obj = obj[k]; });
      return next;
    });
  }

  /* ═─ Vérifier slug ═─ */
  async function checkSlug(slug) {
    if (slug === params.identifiant?.slug) { setSlugStatus({ cls:'available', txt:"✓ C'est votre identifiant actuel" }); return true; }
    if (slug.length < 3) { setSlugStatus({ cls:'unavailable', txt:'✗ Minimum 3 caractères' }); return false; }
    try {
      const { data } = await supabase.from('parametres_boutique').select('user_id').eq('config->identifiant->>slug', slug).neq('user_id', user.id).single();
      const ok = !data;
      setSlugStatus({ cls: ok?'available':'unavailable', txt: ok?'✓ Identifiant disponible':'✗ Identifiant déjà utilisé' });
      return ok;
    } catch { return false; }
  }

  /* ═─ Soumettre slug ═─ */
  async function handleSlugSubmit(e) {
    e.preventDefault();
    const slug = slugInput.toLowerCase().replace(/[^a-z0-9-]/g,'');
    if (slug.length < 3) { showNotif('❌ Minimum 3 caractères', 'error'); return; }
    const ok = await checkSlug(slug);
    if (!ok) { showNotif('❌ Identifiant non disponible', 'error'); return; }
    const next = { ...params, identifiant:{ slug, disponible:true, auto:false, dateCreation:params.identifiant?.dateCreation || new Date().toISOString() }, slug };
    setParams(next);
    setShowSlugForm(false);
    const saved = await saveParams(next);
    showNotif(saved ? '✅ Identifiant sauvegardé !' : '⚠️ Sauvegardé localement', saved?'success':'warning');
  }

  /* ═─ Save général ═─ */
  async function handleGeneralSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const ok = await saveParams();
    setSaving(false);
    showNotif(ok ? '✅ Modifications enregistrées !' : '⚠️ Sauvegardé localement', ok?'success':'warning');
  }

  /* ═─ Paiement ═─ */
  async function confirmerPaiement(type) {
    updateParam(`paiement.${type}.confirme`, true);
    await saveParams();
    showNotif(`✅ Paiement ${type} confirmé !`, 'success');
  }

  async function confirmerMobileMoney() {
    updateParam('paiement.mobile.confirme', true);
    updateParam('paiement.mobile.mtn.confirme', true);
    updateParam('paiement.mobile.orange.confirme', true);
    await saveParams();
    showNotif('✅ Mobile Money confirmé !', 'success');
  }

  /* ═─ Livraison ═─ */
  async function handleShippingSubmit(e) {
    e.preventDefault();
    const ok = await saveParams();
    showNotif(ok ? '✅ Livraison sauvegardée !' : '⚠️ Sauvegardé localement', ok?'success':'warning');
  }

  function addZone() {
    const zones = [...(params.livraison.zonesPersonnalisees || []), { nom:'', frais:0 }];
    updateParam('livraison.zonesPersonnalisees', zones);
  }

  function updateZone(i, key, val) {
    const zones = [...(params.livraison.zonesPersonnalisees || [])];
    zones[i] = { ...zones[i], [key]: val };
    updateParam('livraison.zonesPersonnalisees', zones);
  }

  function removeZone(i) {
    const zones = (params.livraison.zonesPersonnalisees || []).filter((_, idx) => idx !== i);
    updateParam('livraison.zonesPersonnalisees', zones);
  }

  /* ═─ Notifications ═─ */
  async function saveNotifs() {
    const ok = await saveParams();
    showNotif(ok ? '✅ Notifications sauvegardées !' : '⚠️ Sauvegardé localement', ok?'success':'warning');
  }

  /* ═─ Sécurité ═─ */
  async function handlePasswordSubmit(e) {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) { showNotif('❌ Les mots de passe ne correspondent pas', 'error'); return; }
    if (passwords.new.length < 6) { showNotif('❌ Mot de passe trop court (min 6 caractères)', 'error'); return; }
    setPwdChanging(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      showNotif('✅ Mot de passe modifié avec succès !', 'success');
      setPasswords({ current:'', new:'', confirm:'' });
    } catch(err) { showNotif(`❌ Erreur : ${err.message}`, 'error'); }
    finally { setPwdChanging(false); }
  }

  async function exporterDonnees() {
    try {
      const [prods, cmds, clients] = await Promise.all([
        supabase.from('produits').select('*').eq('user_id', user.id),
        supabase.from('commandes').select('*').eq('user_id', user.id),
        supabase.from('clients').select('*').eq('user_id', user.id),
      ]);
      const blob = new Blob([JSON.stringify({ produits:prods.data, commandes:cmds.data, clients:clients.data, parametres:params }, null, 2)], { type:'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `oda-export-${new Date().toISOString().split('T')[0]}.json`; a.click();
      URL.revokeObjectURL(url);
      showNotif('📥 Données exportées !', 'success');
    } catch { showNotif('❌ Erreur export', 'error'); }
  }

  async function supprimerCompte() {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return;
    const code = prompt('Tapez "SUPPRIMER" pour confirmer :');
    if (code !== 'SUPPRIMER') { showNotif('❌ Suppression annulée', 'info'); return; }
    showNotif('🗑️ Contacter le support pour supprimer le compte.', 'warning');
  }

  /* ═─ Apparence : sauvegarde & reset ═─ */
  async function saveAppearance() {
    setSaving(true);
    const ok = await saveParams();
    setSaving(false);
    showNotif(ok ? '✅ Apparence sauvegardée — boutique mise à jour !' : '⚠️ Sauvegardé localement', ok?'success':'warning');
  }

  async function resetAppearance() {
    if (!confirm("Voulez-vous vraiment réinitialiser l'apparence par défaut ?")) return;
    const next = { ...params, apparence:{ couleurPrimaire:'#FF6B00', couleurSecondaire:'#1A1A1A', logo:'', favicon:'', police:'Inter' } };
    setParams(next);
    await saveParams(next);
    showNotif('✅ Apparence réinitialisée', 'success');
  }

  /* ═─ Upload image (logo / favicon) ═─ */
  async function handleImageUpload(type, base64) {
    const next = JSON.parse(JSON.stringify(params));
    next.apparence[type] = base64;
    setParams(next);
    const ok = await saveParams(next);
    if (type === 'favicon' && base64) {
      showNotif('🔖 Favicon chargé — sera appliqué sur la boutique', 'info');
    }
    showNotif(
      type === 'logo'
        ? (ok ? '✅ Logo mis à jour !' : '⚠️ Logo sauvegardé localement')
        : (ok ? '✅ Favicon sauvegardé !'  : '⚠️ Favicon sauvegardé localement'),
      ok ? 'success' : 'warning'
    );
  }

  /* ═─ Copier lien boutique ═─ */
  function copierLienBoutique() {
    const url = `${window.location.origin}/dashboard/boutique?shop=${params.identifiant?.slug}`;
    navigator.clipboard.writeText(url).then(() => showNotif('✅ Lien copié !', 'success'));
  }

  /* ═─ Preview boutique ═─ */
  function openPreview() {
    const slug = params.identifiant?.slug;
    const url  = slug ? `${window.location.origin}/dashboard/boutique?shop=${slug}` : `${window.location.origin}/dashboard/boutique`;
    setPreviewUrl(url);
    setPreviewOpen(true);
    if (iframeRef.current) iframeRef.current.src = url;
  }

  /* ═─ Nav items ═─ */
  const NAV = [
    { id:'general',       icon:'🏪', label:'Général' },
    { id:'identifiant',   icon:'🔖', label:'Identifiant' },
    { id:'payment',       icon:'💳', label:'Paiement' },
    { id:'shipping',      icon:'📦', label:'Livraison' },
    { id:'notifications', icon:'🔔', label:'Notifications' },
    { id:'security',      icon:'🔒', label:'Sécurité' },
    { id:'apparence',     icon:'🎨', label:'Apparence' },
  ];

  const boutiqueLien = params.identifiant?.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/boutique?shop=${params.identifiant.slug}`
    : '';

  if (loading) {
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'400px', fontFamily:'var(--font)' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'2rem', marginBottom:'12px' }}>⏳️</div>
          <p style={{ color:'var(--oda-gray-500)' }}>Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div style={{ fontFamily:"'Poppins',-apple-system,sans-serif", background:'var(--oda-gray-50)', minHeight:'100vh' }}>
      <div className="prm-container">

        {/* ── SIDEBAR ── */}
        <aside className="prm-sidebar">
          <div className="prm-sidebar-title">PARAMÈTRES</div>
          <nav>
            {NAV.map(n => (
              <button
                key={n.id}
                className={`prm-nav-item${activeSection===n.id?' active':''}`}
                onClick={() => setActiveSection(n.id)}
              >
                <span className="prm-nav-icon">{n.icon}</span>
                <span>{n.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="prm-main">

          {/* ══ GÉNÉRAL ═ */}
          {activeSection === 'general' && (
            <section id="general" className="prm-section">
              <div className="prm-section-header">
                <h2 className="prm-section-title">Informations générales</h2>
                <p className="prm-section-desc">Configurez les informations de base de votre boutique</p>
              </div>
              <form id="generalForm" onSubmit={handleGeneralSubmit}>
                <div className="prm-field">
                  <label className="prm-label">Nom de la boutique</label>
                  <input id="shopName" className="prm-input" type="text" placeholder="Ma Boutique Élégante" value={params.general.nom} onChange={e => updateParam('general.nom', e.target.value)} />
                </div>
                <div className="prm-field">
                  <label className="prm-label">Description</label>
                  <textarea id="shopDescription" className="prm-textarea prm-input" placeholder="Décrivez votre boutique..." value={params.general.description} onChange={e => updateParam('general.description', e.target.value)} />
                </div>
                <div className="prm-form-grid">
                  <div className="prm-field">
                    <label className="prm-label">Email de contact</label>
                    <input id="shopEmail" className="prm-input" type="email" placeholder="contact@boutique.com" value={params.general.email} onChange={e => updateParam('general.email', e.target.value)} />
                  </div>
                  <div className="prm-field">
                    <label className="prm-label">Téléphone (WhatsApp)</label>
                    <input id="shopPhone" className="prm-input" type="tel" placeholder="+237 6 XX XX XX" value={params.general.telephone} onChange={e => updateParam('general.telephone', e.target.value)} />
                  </div>
                </div>
                <div className="prm-field">
                  <label className="prm-label">Adresse</label>
                  <input id="shopAddress" className="prm-input" type="text" placeholder="Douala, Cameroun" value={params.general.adresse} onChange={e => updateParam('general.adresse', e.target.value)} />
                </div>
                <button type="submit" className="prm-btn prm-btn-primary" disabled={saving}>
                  {saving ? '⏳ Enregistrement...' : '💾 Enregistrer les modifications'}
                </button>
              </form>
            </section>
          )}

          {/* ══ IDENTIFIANT ═ */}
          {activeSection === 'identifiant' && (
            <section id="identifiant" className="prm-section">
              <div className="prm-section-header">
                <h2 className="prm-section-title">Identifiant unique de la boutique</h2>
                <p className="prm-section-desc">Créez un nom unique pour votre boutique (URL personnalisée)</p>
              </div>

              <div className="prm-alert prm-alert-info">
                <span style={{ fontSize:'1.5rem' }}>ℹ️</span>
                <div>
                  <strong>À quoi sert l'identifiant unique ?</strong>
                  <p style={{ marginTop:'4px', color:'var(--oda-gray-500)', fontSize:'.9rem' }}>Cet identifiant sera utilisé dans l'URL de votre boutique et permettra à vos clients d'y accéder directement.</p>
                </div>
              </div>

              {/* Identifiant actif */}
              {params.identifiant?.slug && !showSlugForm && (
                <div id="identifiantActuel" style={{ marginBottom:'24px', padding:'20px', background:'linear-gradient(135deg,rgba(52,199,89,.1),rgba(52,199,89,.05))', borderRadius:'var(--radius-md)', borderLeft:'4px solid var(--oda-green)' }}>
                  <h4 style={{ marginBottom:'12px', color:'var(--oda-green)', fontWeight:600 }}>✅ Identifiant actif</h4>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
                    <span style={{ fontFamily:'monospace', fontSize:'1.1rem', fontWeight:600 }}>@</span>
                    <span id="identifiantActif" style={{ fontFamily:'monospace', fontSize:'1.1rem', fontWeight:600, color:'var(--oda-blue)' }}>{params.identifiant.slug}</span>
                  </div>
                  <div style={{ marginBottom:'16px' }}>
                    <strong>Lien de votre boutique :</strong>
                    <div className="prm-link-row">
                      <input id="lienBoutique" type="text" readOnly value={boutiqueLien} style={{ padding:'10px', border:'1.5px solid var(--oda-gray-200)', borderRadius:'var(--radius-sm)', fontFamily:'monospace', background:'white', outline:'none' }} />
                      <button type="button" className="prm-btn prm-btn-secondary" style={{ padding:'10px 20px', whiteSpace:'nowrap', flexShrink:0 }} onClick={copierLienBoutique}>📋 Copier</button>
                    </div>
                  </div>
                  <button type="button" className="prm-btn prm-btn-secondary" style={{ background:'transparent', color:'var(--oda-blue)', border:'1.5px solid var(--oda-blue)' }} onClick={() => setShowSlugForm(true)}>
                    ✏️ Modifier l'identifiant
                  </button>
                </div>
              )}

              {/* Formulaire slug */}
              {(!params.identifiant?.slug || showSlugForm) && (
                <form id="identifiantForm" onSubmit={handleSlugSubmit}>
                  <div className="prm-field">
                    <label className="prm-label">Identifiant unique (slug)</label>
                    <div className="prm-input-prefix">
                      <span className="prm-prefix">@</span>
                      <input
                        id="shopSlug"
                        className="prm-input"
                        type="text"
                        placeholder="ma-boutique-elegante"
                        pattern="[a-z0-9-]+"
                        maxLength={50}
                        value={slugInput}
                        onChange={e => {
                          const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'');
                          setSlugInput(v);
                          setSlugStatus(null);
                          if (v.length >= 3) checkSlug(v);
                        }}
                      />
                    </div>
                    <small className="prm-hint">Uniquement des lettres minuscules, chiffres et tirets (minimum 3 caractères)</small>
                    {slugStatus && <div id="slugAvailability" className={`prm-slug-status ${slugStatus.cls}`}>{slugStatus.txt}</div>}
                  </div>

                  <div style={{ marginTop:'16px', background:'var(--oda-gray-50)', padding:'16px', borderRadius:'var(--radius-md)' }}>
                    <strong>Aperçu de votre URL :</strong>
                    <div style={{ fontFamily:'monospace', marginTop:'8px', fontSize:'.9rem', color:'var(--oda-blue)' }}>
                      <span>{typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/boutique</span>
                      <span>?shop=</span>
                      <span>{slugInput || 'votre-identifiant'}</span>
                    </div>
                  </div>

                  <div style={{ display:'flex', gap:'12px', marginTop:'20px' }}>
                    <button type="submit" className="prm-btn prm-btn-primary">🔖 Définir l'identifiant</button>
                    {showSlugForm && <button type="button" className="prm-btn prm-btn-secondary" onClick={() => setShowSlugForm(false)}>Annuler</button>}
                  </div>
                </form>
              )}
            </section>
          )}

          {/* ══ PAIEMENT ═ */}
          {activeSection === 'payment' && (
            <section id="payment" className="prm-section">
              <div className="prm-section-header">
                <h2 className="prm-section-title">Méthodes de paiement</h2>
                <p className="prm-section-desc">Configurez vos options de paiement</p>
              </div>

              {/* Carte bancaire */}
              <div className="prm-payment-card">
                <div className="prm-payment-header">
                  <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                    <div className="prm-payment-icon" style={{ background:'var(--oda-blue-light)' }}>💳</div>
                    <div>
                      <h4 className="prm-payment-title">Carte bancaire</h4>
                      <p className="prm-payment-desc">Visa, Mastercard, American Express</p>
                    </div>
                  </div>
                  <Toggle id="paymentCard" checked={params.paiement.carte.actif} onChange={v => updateParam('paiement.carte.actif', v)} />
                </div>
                {params.paiement.carte.actif && (
                  <div id="cardDetails" style={{ marginTop:'16px', paddingTop:'16px', borderTop:'1px solid var(--oda-gray-200)' }}>
                    <input id="stripeKey" className="prm-input" type="text" placeholder="Clé API Stripe" value={params.paiement.carte.cle} onChange={e => updateParam('paiement.carte.cle', e.target.value)} />
                    <button type="button" className="prm-btn prm-btn-success" style={{ marginTop:'12px' }} onClick={() => confirmerPaiement('carte')}>✓ Confirmer</button>
                  </div>
                )}
              </div>

              {/* Mobile Money */}
              <div className="prm-payment-card">
                <div className="prm-payment-header">
                  <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                    <div className="prm-payment-icon" style={{ background:'#FFF9EB' }}>📱</div>
                    <div>
                      <h4 className="prm-payment-title">Mobile Money</h4>
                      <p className="prm-payment-desc">MTN Money & Orange Money</p>
                    </div>
                  </div>
                  <Toggle id="paymentMobile" checked={params.paiement.mobile.actif} onChange={v => updateParam('paiement.mobile.actif', v)} />
                </div>
                {params.paiement.mobile.actif && (
                  <div id="mobileDetails" style={{ marginTop:'16px', paddingTop:'16px', borderTop:'1px solid var(--oda-gray-200)' }}>
                    {/* MTN */}
                    <div className="prm-mm-section" style={{ borderLeft:'3px solid #FFCC00' }}>
                      <div className="prm-mm-header">
                        <div className="prm-mm-icon" style={{ background:'#FFCC00', color:'#000' }}>📞</div>
                        <h5 style={{ flex:1, fontWeight:600, fontSize:'1rem', margin:0 }}>MTN Money</h5>
                        <Toggle id="mtnActive" checked={params.paiement.mobile.mtn?.actif ?? false} onChange={v => updateParam('paiement.mobile.mtn.actif', v)} />
                      </div>
                      {params.paiement.mobile.mtn?.actif && (
                        <div id="mtnInputs">
                          <div className="prm-field">
                            <label className="prm-label">Nom du compte MTN</label>
                            <input id="mtnNomCompte" className="prm-input" type="text" placeholder="Ex: KAMGA Jean" value={params.paiement.mobile.mtn?.nomCompte ?? ''} onChange={e => updateParam('paiement.mobile.mtn.nomCompte', e.target.value)} />
                          </div>
                          <div className="prm-field">
                            <label className="prm-label">Numéro MTN Money</label>
                            <input id="mtnNumero" className="prm-input" type="tel" placeholder="+237 6 XX XX XX" value={params.paiement.mobile.mtn?.numero ?? ''} onChange={e => updateParam('paiement.mobile.mtn.numero', e.target.value)} />
                            <small className="prm-hint">Format: +237 6XX XX XX</small>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ height:'1px', background:'linear-gradient(to right,transparent,var(--oda-gray-200) 20%,var(--oda-gray-200) 80%,transparent)', margin:'20px 0' }} />

                    {/* Orange */}
                    <div className="prm-mm-section" style={{ borderLeft:'3px solid #FF7900' }}>
                      <div className="prm-mm-header">
                        <div className="prm-mm-icon" style={{ background:'#FF7900', color:'#fff' }}>🍊</div>
                        <h5 style={{ flex:1, fontWeight:600, fontSize:'1rem', margin:0 }}>Orange Money</h5>
                        <Toggle id="orangeActive" checked={params.paiement.mobile.orange?.actif ?? false} onChange={v => updateParam('paiement.mobile.orange.actif', v)} />
                      </div>
                      {params.paiement.mobile.orange?.actif && (
                        <div id="orangeInputs">
                          <div className="prm-field">
                            <label className="prm-label">Nom du compte Orange</label>
                            <input id="orangeNomCompte" className="prm-input" type="text" placeholder="Ex: KAMGA Jean" value={params.paiement.mobile.orange?.nomCompte ?? ''} onChange={e => updateParam('paiement.mobile.orange.nomCompte', e.target.value)} />
                          </div>
                          <div className="prm-field">
                            <label className="prm-label">Numéro Orange Money</label>
                            <input id="orangeNumero" className="prm-input" type="tel" placeholder="+237 6 XX XX XX" value={params.paiement.mobile.orange?.numero ?? ''} onChange={e => updateParam('paiement.mobile.orange.numero', e.target.value)} />
                            <small className="prm-hint">Format: +237 6XX XX XX</small>
                          </div>
                        </div>
                      )}
                    </div>

                    <button type="button" id="confirmerMobileMoney" className="prm-btn prm-btn-success" onClick={confirmerMobileMoney} style={{ marginTop:'12px' }}>
                      ✓ Confirmer les paramètres Mobile Money
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ══ LIVRAISON ═ */}
          {activeSection === 'shipping' && (
            <section id="shipping" className="prm-section">
              <div className="prm-section-header">
                <h2 className="prm-section-title">Options de livraison</h2>
                <p className="prm-section-desc">Configurez les frais et délais de livraison</p>
              </div>
              <form onSubmit={handleShippingSubmit}>
                <div className="prm-form-grid">
                  <div className="prm-field">
                    <label className="prm-label">Frais Douala (FCFA)</label>
                    <input className="prm-input" type="number" value={params.livraison.fraisDouala} onChange={e => updateParam('livraison.fraisDouala', Number(e.target.value))} />
                  </div>
                  <div className="prm-field">
                    <label className="prm-label">Frais autres villes (FCFA)</label>
                    <input className="prm-input" type="number" value={params.livraison.fraisAutres} onChange={e => updateParam('livraison.fraisAutres', Number(e.target.value))} />
                  </div>
                </div>
                <div className="prm-form-grid">
                  <div className="prm-field">
                    <label className="prm-label">Délai de livraison</label>
                    <input className="prm-input" type="text" value={params.livraison.delai} onChange={e => updateParam('livraison.delai', e.target.value)} />
                  </div>
                  <div className="prm-field">
                    <label className="prm-label">Montant min. pour livraison gratuite (FCFA)</label>
                    <input className="prm-input" type="number" value={params.livraison.montantMin} onChange={e => updateParam('livraison.montantMin', Number(e.target.value))} />
                  </div>
                </div>
                <div className="prm-setting-item" style={{ marginTop:'20px' }}>
                  <div className="prm-setting-info">
                    <div className="prm-setting-title">Livraison gratuite</div>
                    <div className="prm-setting-desc">Activer la livraison gratuite au-dessus du montant minimum</div>
                  </div>
                  <Toggle id="freeShipping" checked={params.livraison.gratuit} onChange={v => updateParam('livraison.gratuit', v)} />
                </div>

                {/* Zones personnalisées */}
                <div style={{ marginTop:'32px' }}>
                  <h3 style={{ fontSize:'1.1rem', fontWeight:600, marginBottom:'16px' }}>Zones personnalisées</h3>
                  {(params.livraison.zonesPersonnalisees || []).map((z, i) => (
                    <div key={i} className="prm-zone-row">
                      <input className="prm-input" type="text" placeholder="Nom de la zone" value={z.nom} onChange={e => updateZone(i, 'nom', e.target.value)} />
                      <input className="prm-input" type="number" placeholder="Frais" value={z.frais} onChange={e => updateZone(i, 'frais', Number(e.target.value))} />
                      <button type="button" className="prm-btn prm-btn-danger" style={{ padding:'8px 16px' }} onClick={() => removeZone(i)}>Supprimer</button>
                    </div>
                  ))}
                  <button type="button" className="prm-btn prm-btn-secondary" onClick={addZone}>➕ Ajouter une zone</button>
                </div>

                <button type="submit" className="prm-btn prm-btn-primary" style={{ marginTop:'24px' }}>
                  📦 Enregistrer la livraison
                </button>
              </form>
            </section>
          )}

          {/* ══ NOTIFICATIONS ═ */}
          {activeSection === 'notifications' && (
            <section id="notifications" className="prm-section">
              <div className="prm-section-header">
                <h2 className="prm-section-title">Préférences de notifications</h2>
                <p className="prm-section-desc">Gérez les alertes et notifications de votre boutique</p>
              </div>
              <div className="prm-setting-item">
                <div className="prm-setting-info">
                  <div className="prm-setting-title">Nouvelles commandes</div>
                  <div className="prm-setting-desc">Recevoir une notification à chaque nouvelle commande</div>
                </div>
                <Toggle id="notifCommandes" checked={params.notifications.commandes} onChange={v => updateParam('notifications.commandes', v)} />
              </div>
              <div className="prm-setting-item">
                <div className="prm-setting-info">
                  <div className="prm-setting-title">Alerte stock faible</div>
                  <div className="prm-setting-desc">Être alerté quand un produit est presque en rupture</div>
                </div>
                <Toggle id="notifStock" checked={params.notifications.stock} onChange={v => updateParam('notifications.stock', v)} />
              </div>
              <div className="prm-setting-item">
                <div className="prm-setting-info">
                  <div className="prm-setting-title">Nouveaux clients</div>
                  <div className="prm-setting-desc">Notification quand un nouveau client s'inscrit</div>
                </div>
                <Toggle id="notifClients" checked={params.notifications.clients} onChange={v => updateParam('notifications.clients', v)} />
              </div>
              <div className="prm-setting-item">
                <div className="prm-setting-info">
                  <div className="prm-setting-title">Rapports quotidiens</div>
                  <div className="prm-setting-desc">Recevoir un résumé quotidien par email</div>
                </div>
                <Toggle id="notifRapports" checked={params.notifications.rapports} onChange={v => updateParam('notifications.rapports', v)} />
              </div>
              <button type="button" className="prm-btn prm-btn-primary" onClick={saveNotifs} style={{ marginTop:'20px' }}>
                🔔 Enregistrer les notifications
              </button>
            </section>
          )}

          {/* ══ SÉCURITÉ ═ */}
          {activeSection === 'security' && (
            <section id="security" className="prm-section">
              <div className="prm-section-header">
                <h2 className="prm-section-title">Sécurité du compte</h2>
                <p className="prm-section-desc">Gérez votre mot de passe et la sécurité de votre boutique</p>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <div className="prm-field">
                  <label className="prm-label">Nouveau mot de passe</label>
                  <input id="newPassword" className="prm-input" type="password" placeholder="Minimum 6 caractères" value={passwords.new} onChange={e => setPasswords(p => ({...p, new:e.target.value}))} />
                </div>
                <div className="prm-field">
                  <label className="prm-label">Confirmer le mot de passe</label>
                  <input id="confirmPassword" className="prm-input" type="password" placeholder="Retapez le mot de passe" value={passwords.confirm} onChange={e => setPasswords(p => ({...p, confirm:e.target.value}))} />
                </div>
                <button type="submit" className="prm-btn prm-btn-primary" disabled={pwdChanging}>
                  {pwdChanging ? '⏳ Modification...' : '🔒 Modifier le mot de passe'}
                </button>
              </form>

              <div className="prm-danger-zone">
                <h3 style={{ fontSize:'1.1rem', fontWeight:600, color:'var(--oda-red)', marginBottom:'16px' }}>Zone de danger</h3>
                <button type="button" className="prm-btn prm-btn-danger" onClick={exporterDonnees}>📥 Exporter mes données</button>
                <button type="button" className="prm-btn prm-btn-danger" style={{ marginLeft:'12px', background:'transparent', border:'1.5px solid var(--oda-red)', color:'var(--oda-red)' }} onClick={supprimerCompte}>🗑️ Supprimer mon compte</button>
              </div>
            </section>
          )}

          {/* ══ APPARENCE ═ */}
          {activeSection === 'apparence' && (
            <section id="apparence" className="prm-section">
              <div className="prm-section-header">
                <h2 className="prm-section-title">Apparence de la boutique</h2>
                <p className="prm-section-desc">Personnalisez les couleurs et images de votre boutique</p>
              </div>

              <div className="prm-form-grid">
                <div className="prm-field">
                  <label className="prm-label">Couleur primaire</label>
                  <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                    <input type="color" value={params.apparence.couleurPrimaire} onChange={e => updateParam('apparence.couleurPrimaire', e.target.value)} style={{ width:'50px', height:'40px', border:'1.5px solid var(--oda-gray-200)', borderRadius:'var(--radius-sm)', cursor:'pointer', padding:'2px' }} />
                    <input className="prm-input" type="text" value={params.apparence.couleurPrimaire} onChange={e => updateParam('apparence.couleurPrimaire', e.target.value)} />
                  </div>
                </div>
                <div className="prm-field">
                  <label className="prm-label">Couleur secondaire</label>
                  <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                    <input type="color" value={params.apparence.couleurSecondaire} onChange={e => updateParam('apparence.couleurSecondaire', e.target.value)} style={{ width:'50px', height:'40px', border:'1.5px solid var(--oda-gray-200)', borderRadius:'var(--radius-sm)', cursor:'pointer', padding:'2px' }} />
                    <input className="prm-input" type="text" value={params.apparence.couleurSecondaire} onChange={e => updateParam('apparence.couleurSecondaire', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="prm-form-grid" style={{ marginTop:'24px' }}>
                <div className="prm-field">
                  <label className="prm-label">Logo de la boutique</label>
                  <UploadZone
                    type="logo"
                    value={params.apparence.logo}
                    onUpload={handleImageUpload}
                    icon="🖼️"
                    title="Logo de la boutique"
                    hint="Affiché en haut de votre boutique"
                    accept="image/png,image/jpeg,image/svg+xml"
                  />
                </div>
                <div className="prm-field">
                  <label className="prm-label">Favicon (icône onglet)</label>
                  <UploadZone
                    type="favicon"
                    value={params.apparence.favicon}
                    onUpload={handleImageUpload}
                    icon="🔖"
                    title="Favicon"
                    hint="Petite icône affichée dans l'onglet"
                    accept="image/png,image/x-icon"
                  />
                </div>
              </div>

              <div style={{ marginTop:'32px', display:'flex', gap:'12px' }}>
                <button type="button" className="prm-btn prm-btn-primary" onClick={saveAppearance} disabled={saving}>
                  {saving ? '⏳ Enregistrement...' : '🎨 Sauvegarder l’apparence'}
                </button>
                <button type="button" className="prm-btn prm-btn-secondary" onClick={resetAppearance}>
                  ↩️ Réinitialiser
                </button>
                <button type="button" className="prm-btn prm-btn-secondary" onClick={openPreview}>
                  👁️ Aperçu de la boutique
                </button>
              </div>
            </section>
          )}

        </main>
      </div>

      {/* ── MOBILE MENU ── */}
      <nav id="prm-mobile-menu" className="prm-mobile-menu">
        {NAV.map(n => (
          <button
            key={n.id}
            className={`prm-mob-btn${activeSection===n.id?' active':''}`}
            onClick={() => setActiveSection(n.id)}
          >
            <span className="prm-mob-icon">{n.icon}</span>
            <span className="prm-mob-label">{n.label}</span>
            {activeSection===n.id && <span className="prm-mob-dot" />}
          </button>
        ))}
      </nav>

      {/* ── PREVIEW MODAL ── */}
      <div className={`prm-modal-overlay${previewOpen?' active':''}`} onClick={e => { if(e.target === e.currentTarget) setPreviewOpen(false); }}>
        <div className="prm-modal-box">
          <div className="prm-modal-bar">
            <div className="prm-modal-dots">
              <span></span><span></span><span></span>
            </div>
            <div className="prm-modal-url">{previewUrl}</div>
            <button className="prm-btn prm-btn-secondary" style={{ padding:'6px 14px', fontSize:'.82rem' }} onClick={() => setPreviewOpen(false)}>✕</button>
          </div>
          <iframe className="prm-modal-iframe" ref={iframeRef} title="Aperçu boutique" />
          <div className="prm-modal-footer">
            <span style={{ fontSize:'.82rem', color:'var(--oda-gray-500)' }}>Aperçu de votre boutique</span>
            <a href={previewUrl} target="_blank" rel="noopener" className="prm-btn prm-btn-primary" style={{ padding:'8px 16px', fontSize:'.82rem' }}>🔗 Ouvrir dans un nouvel onglet</a>
          </div>
        </div>
      </div>

    </div>
  );
}
