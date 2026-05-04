'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

/* ══════════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════════ */
const PAGE_CSS = `
  @keyframes prm-fadeIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  @keyframes prm-slideIn { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
  @keyframes prm-fadeOut { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(30px)} }
  @keyframes prm-slideDown{ from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:none} }
  @keyframes prm-spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes prm-popIn   { 0%{opacity:0;transform:scale(.85)} 70%{transform:scale(1.05)} 100%{opacity:1;transform:scale(1)} }
  @keyframes prm-slideUpPreview{ from{opacity:0;transform:translateY(40px) scale(.97)} to{opacity:1;transform:none} }
  @keyframes prm-slideUpMenu { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }

  /* layout */
  .prm-container { max-width:1400px; margin:0 auto; padding:32px 24px; display:grid; grid-template-columns:280px 1fr; gap:32px; }
  @media(max-width:1024px) { .prm-container { grid-template-columns:1fr; } }
  @media(max-width:768px)  { .prm-container { padding:20px 16px; } }

  /* sidebar */
  .prm-sidebar { background:white; padding:24px; border-radius:16px; box-shadow:0 2px 8px rgba(0,0,0,.08); height:fit-content; position:sticky; top:24px; }
  @media(max-width:768px) { .prm-sidebar { display:none; } }

  .prm-menu-link {
    display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:10px;
    color:#6E6E73; text-decoration:none; transition:.3s ease; font-weight:500; font-size:.95rem;
    background:none; border:none; width:100%; cursor:pointer; font-family:Poppins,sans-serif;
    margin-bottom:4px;
  }
  .prm-menu-link:hover { background:#F5F5F7; color:#007AFF; }
  .prm-menu-link.active { background:linear-gradient(135deg,#007AFF,#5856D6); color:white; }

  /* section */
  .prm-section { background:white; padding:32px; border-radius:16px; box-shadow:0 2px 8px rgba(0,0,0,.08); animation:prm-fadeIn .4s ease; }
  @media(max-width:768px) { .prm-section { padding:20px; } }

  /* forms */
  .prm-input, .prm-textarea, .prm-select {
    width:100%; padding:12px 16px; border:2px solid #D2D2D7;
    border-radius:10px; font-family:Poppins,sans-serif; font-size:.95rem;
    color:#1D1D1F; background:white; transition:.3s ease; outline:none;
  }
  .prm-input:focus, .prm-textarea:focus, .prm-select:focus {
    border-color:#007AFF; box-shadow:0 0 0 3px rgba(0,122,255,.10);
  }
  .prm-textarea { resize:vertical; min-height:100px; }
  .prm-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media(max-width:768px) { .prm-form-grid { grid-template-columns:1fr; } }

  /* toggle */
  .prm-toggle { position:relative; display:inline-block; width:52px; height:28px; flex-shrink:0; }
  .prm-toggle input { opacity:0; width:0; height:0; position:absolute; }
  .prm-slider {
    position:absolute; cursor:pointer; inset:0;
    background:#D2D2D7; transition:.3s; border-radius:28px;
  }
  .prm-slider::before {
    position:absolute; content:""; height:20px; width:20px;
    left:4px; bottom:4px; background:white; transition:.3s; border-radius:50%;
  }
  input:checked + .prm-slider { background:linear-gradient(135deg,#007AFF,#5856D6); }
  input:checked + .prm-slider::before { transform:translateX(24px); }

  /* toggle small */
  .prm-toggle-sm { position:relative; display:inline-block; width:44px; height:24px; flex-shrink:0; }
  .prm-toggle-sm input { opacity:0; width:0; height:0; position:absolute; }
  .prm-slider-sm {
    position:absolute; cursor:pointer; inset:0;
    background:#D2D2D7; transition:.3s; border-radius:24px;
  }
  .prm-slider-sm::before {
    position:absolute; content:""; height:18px; width:18px;
    left:3px; bottom:3px; background:white; transition:.3s; border-radius:50%;
    box-shadow:0 1px 3px rgba(0,0,0,.2);
  }
  input:checked + .prm-slider-sm { background:linear-gradient(135deg,#007AFF,#5856D6); }
  input:checked + .prm-slider-sm::before { transform:translateX(20px); }

  /* setting-item */
  .prm-setting-item { display:flex; justify-content:space-between; align-items:center; padding:16px; background:#F5F5F7; border-radius:12px; margin-bottom:12px; }
  @media(max-width:768px) { .prm-setting-item { flex-direction:column; gap:12px; text-align:center; } }

  /* payment */
  .prm-payment-card { border:2px solid #D2D2D7; border-radius:12px; padding:20px; transition:.3s ease; margin-bottom:16px; }
  .prm-payment-card:hover { border-color:#007AFF; box-shadow:0 2px 8px rgba(0,0,0,.08); }

  /* input-prefix */
  .prm-input-prefix { display:flex; align-items:center; border:2px solid #D2D2D7; border-radius:10px; overflow:hidden; transition:.3s ease; }
  .prm-input-prefix:focus-within { border-color:#007AFF; box-shadow:0 0 0 3px rgba(0,122,255,.10); }
  .prm-prefix { background:#F5F5F7; padding:12px 16px; font-weight:600; color:#6E6E73; flex-shrink:0; }
  .prm-input-prefix .prm-input { border:none; box-shadow:none; border-radius:0; }

  /* slug status */
  .prm-slug-status { margin-top:8px; padding:8px 12px; border-radius:8px; font-size:.85rem; font-weight:500; }
  .prm-slug-status.available   { background:rgba(52,199,89,.10); color:#34C759; }
  .prm-slug-status.unavailable { background:rgba(255,59,48,.10);  color:#FF3B30; }

  /* buttons */
  .prm-btn-primary {
    padding:12px 24px; background:linear-gradient(135deg,#007AFF,#5856D6);
    color:white; border:none; border-radius:10px; font-family:Poppins,sans-serif;
    font-size:.95rem; font-weight:600; cursor:pointer; transition:.3s ease; box-shadow:0 2px 8px rgba(0,0,0,.08);
  }
  .prm-btn-primary:hover { transform:translateY(-2px); box-shadow:0 4px 16px rgba(0,0,0,.10); }
  .prm-btn-primary:disabled { opacity:.6; cursor:not-allowed; transform:none; }

  .prm-btn-secondary {
    padding:12px 24px; background:white; color:#007AFF;
    border:2px solid #007AFF; border-radius:10px; font-family:Poppins,sans-serif;
    font-size:.95rem; font-weight:600; cursor:pointer; transition:.3s ease;
  }
  .prm-btn-secondary:hover { background:rgba(0,122,255,.07); }

  .prm-btn-danger {
    padding:12px 24px; background:#FF3B30; color:white;
    border:none; border-radius:10px; font-family:Poppins,sans-serif;
    font-size:.95rem; font-weight:600; cursor:pointer; transition:.3s ease;
  }
  .prm-btn-danger:hover { background:#d32f2f; }

  .prm-btn-confirm {
    width:100%; padding:12px 24px; background:#34C759; color:white;
    border:none; border-radius:10px; font-family:Poppins,sans-serif;
    font-size:.95rem; font-weight:600; cursor:pointer; transition:.3s ease; margin-top:8px;
  }
  .prm-btn-confirm:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(52,199,89,.3); }

  /* alert-info */
  .prm-alert-info { display:flex; gap:12px; padding:16px; background:rgba(0,122,255,.10); border-left:4px solid #007AFF; border-radius:10px; margin-bottom:24px; }

  /* color picker */
  .prm-color-picker { width:60px; height:40px; border:2px solid #D2D2D7; border-radius:8px; cursor:pointer; }

  /* mobile-money */
  .prm-mm-section { margin-bottom:20px; padding:16px; background:#F5F5F7; border-radius:12px; transition:.3s ease; }
  .prm-mm-section:hover { background:#F0F0F2; }
  .prm-mm-header { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
  .prm-mm-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; box-shadow:0 2px 8px rgba(0,0,0,.10); flex-shrink:0; }
  .prm-mm-inputs { margin-top:16px; animation:prm-slideDown .3s ease; }

  /* danger-zone */
  .prm-danger-zone { margin-top:32px; padding-top:32px; border-top:2px solid #F5F5F7; }

  /* preview modal */
  .prm-preview-modal { display:none; position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,.6); backdrop-filter:blur(6px); align-items:center; justify-content:center; padding:16px; }
  .prm-preview-modal.active { display:flex; animation:prm-fadeIn .25s ease; }
  .prm-preview-box { background:white; border-radius:20px; width:100%; max-width:420px; height:85vh; max-height:800px; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 24px 60px rgba(0,0,0,.3); animation:prm-slideUpPreview .35s cubic-bezier(.25,.46,.45,.94); }
  .prm-preview-bar { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-bottom:1px solid #E5E7EB; background:#F8F9FA; flex-shrink:0; gap:10px; }
  .prm-preview-dots { display:flex; gap:5px; }
  .prm-preview-dots span { width:10px; height:10px; border-radius:50%; }
  .prm-preview-dots span:nth-child(1){background:#FF5F56}
  .prm-preview-dots span:nth-child(2){background:#FFBD2E}
  .prm-preview-dots span:nth-child(3){background:#27C93F}
  .prm-preview-url-bar { flex:1; min-width:0; background:white; border:1px solid #E5E7EB; border-radius:8px; padding:5px 10px; font-size:.75rem; color:#6B7280; font-family:monospace; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .prm-preview-iframe { flex:1; border:none; width:100%; background:white; }
  .prm-preview-footer { padding:10px 18px; border-top:1px solid #E5E7EB; background:#F8F9FA; display:flex; align-items:center; justify-content:space-between; gap:8px; flex-shrink:0; }
  /* modal mobile overrides */
  @media(max-width:480px) {
    .prm-preview-modal { padding:6px; }
    .prm-preview-box { border-radius:14px; height:92vh; max-height:none; }
    .prm-preview-bar { padding:10px 12px; gap:6px; }
    .prm-preview-footer { padding:8px 12px; }
  }

  /* lien boutique row — empêche le débordement mobile */
  .prm-lien-row { display:flex; gap:8px; align-items:center; margin-top:8px; min-width:0; }
  .prm-lien-row input { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; }
  @media(max-width:480px) {
    .prm-lien-row { flex-direction:column; align-items:stretch; }
    .prm-lien-row input { font-size:.78rem; }
    .prm-lien-row button { align-self:flex-end; }
  }

  /* notification toast */
  .prm-notif { background:white; padding:14px 20px; border-radius:12px; box-shadow:0 8px 25px rgba(0,0,0,.15); animation:prm-slideIn .4s cubic-bezier(.34,1.56,.64,1); max-width:340px; font-family:Poppins,sans-serif; font-weight:500; color:#1D1D1F; cursor:pointer; }

  /* section-header */
  .prm-section-header { margin-bottom:32px; padding-bottom:16px; border-bottom:2px solid #F5F5F7; }
  .prm-section-title { font-size:1.5rem; font-weight:600; color:#1D1D1F; margin-bottom:8px; }
  .prm-section-desc  { color:#6E6E73; font-size:.9rem; }

  /* zone de livraison personnalisée */
  .prm-zone-row { display:grid; grid-template-columns:1fr 120px auto; gap:10px; padding:14px; background:#F5F5F7; border-radius:12px; margin-bottom:10px; align-items:center; }
  @media(max-width:600px) { .prm-zone-row { grid-template-columns:1fr 90px auto; } }

  /* URL-preview */
  .prm-url-preview { margin-top:16px; padding:16px; background:#F5F5F7; border-radius:10px; overflow:hidden; }
  .prm-url-text { margin-top:8px; font-family:'Courier New',monospace; font-size:.9rem; color:#007AFF; word-break:break-all; overflow-wrap:anywhere; }

  /* scrollbar */
  ::-webkit-scrollbar { width:6px; }
  ::-webkit-scrollbar-thumb { background:rgba(0,0,0,.15); border-radius:10px; }

  /* ══ UPLOAD ZONE ══ */
  .prm-upload-zone {
    position:relative; border:2px dashed #D2D2D7; border-radius:16px;
    padding:32px 20px; text-align:center; cursor:pointer;
    transition:all .3s cubic-bezier(.34,1.56,.64,1);
    background:linear-gradient(135deg,#fafafa 0%,#f5f5f7 100%);
    min-height:160px; display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:8px; overflow:hidden;
  }
  .prm-upload-zone::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,#007AFF,#5856D6);
    opacity:0; transition:opacity .3s ease; border-radius:14px; pointer-events:none;
  }
  .prm-upload-zone:hover { border-color:#007AFF; transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,122,255,.12); }
  .prm-upload-zone:hover::before { opacity:.04; }
  .prm-upload-zone.drag-over { border-color:#007AFF; background:rgba(0,122,255,.06); transform:scale(1.02); box-shadow:0 12px 32px rgba(0,122,255,.15); }
  .prm-upload-zone.has-image { border-color:#34C759; background:rgba(52,199,89,.04); border-style:solid; }
  .prm-upload-zone-badge {
    position:absolute; top:10px; right:10px;
    background:#34C759; color:white; font-size:.7rem; font-weight:700;
    padding:3px 8px; border-radius:20px; opacity:0; transform:scale(.8); transition:all .3s ease;
    pointer-events:none;
  }
  .prm-upload-zone.has-image .prm-upload-zone-badge { opacity:1; transform:scale(1); }
  .prm-upload-icon { font-size:2.5rem; line-height:1; transition:transform .3s ease; }
  .prm-upload-zone:hover .prm-upload-icon { transform:scale(1.1) rotate(-5deg); }
  .prm-upload-preview-img { max-width:100%; max-height:120px; object-fit:contain; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,.1); }
  .prm-upload-overlay {
    position:absolute; inset:0; background:rgba(0,0,0,.55); border-radius:14px;
    display:flex; align-items:center; justify-content:center;
    opacity:0; transition:opacity .3s ease; font-size:.85rem; font-weight:600; color:white; gap:6px;
    pointer-events:none;
  }
  .prm-upload-zone:hover .prm-upload-overlay { opacity:1; }

  /* ── MENU MOBILE ANDROID (bottom nav) ── */
  #prm-menu-mobile {
    position:fixed; bottom:0; left:0; right:0;
    background:#1A1A1A; display:none; justify-content:flex-start; align-items:center;
    padding:8px 0 calc(8px + env(safe-area-inset-bottom));
    box-shadow:0 -4px 20px rgba(0,0,0,.3); z-index:9999;
    border-radius:24px 24px 0 0;
    overflow-x:auto; overflow-y:hidden;
    -webkit-overflow-scrolling:touch; gap:4px;
    animation:prm-slideUpMenu .3s ease;
  }
  #prm-menu-mobile::-webkit-scrollbar { display:none; }
  #prm-menu-mobile { -ms-overflow-style:none; scrollbar-width:none; }

  .prm-mob-btn {
    display:flex; flex-direction:column; align-items:center; gap:2px;
    background:none; border:none; color:#8E8E93; cursor:pointer;
    padding:6px 8px; border-radius:12px; transition:all .3s ease;
    position:relative; min-width:65px; flex-shrink:0;
    font-family:Poppins,sans-serif;
  }
  .prm-mob-btn .prm-mob-icon { font-size:22px; transition:transform .3s ease; display:block; }
  .prm-mob-btn .prm-mob-label { font-size:9px; font-weight:500; white-space:nowrap; text-align:center; display:block; }
  .prm-mob-btn.active { color:#007AFF; }
  .prm-mob-btn.active .prm-mob-label { font-weight:600; }
  .prm-mob-btn .prm-mob-dot {
    position:absolute; bottom:2px; left:50%; transform:translateX(-50%);
    width:4px; height:4px; background:#007AFF; border-radius:2px;
  }
  .prm-mob-btn:active { transform:scale(.95); }
  @media(hover:hover) { .prm-mob-btn:hover { background:rgba(0,122,255,.12); } }

  @media(max-width:768px) {
    #prm-menu-mobile { display:flex; }
    body { padding-bottom:85px; }
  }
  @media(min-width:769px) { #prm-menu-mobile { display:none !important; } }
`;

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('prm-page-style')) return;
  const el = document.createElement('style');
  el.id = 'prm-page-style';
  el.textContent = PAGE_CSS;
  document.head.appendChild(el);
}

/* ── Notification helper ── */
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
  n.style.borderLeft = `4px solid ${colors[type]}`;
  n.style.pointerEvents = 'all';
  n.textContent = msg;
  n.addEventListener('click', () => n.remove());
  c.appendChild(n);
  setTimeout(() => {
    n.style.animation = 'prm-fadeOut .4s ease forwards';
    setTimeout(() => n.remove(), 400);
  }, 3500);
}

/* ── Toggle component ── */
function Toggle({ id, checked, onChange }) {
  return (
    <label className="prm-toggle">
      <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="prm-slider" />
    </label>
  );
}

function ToggleSm({ id, checked, onChange }) {
  return (
    <label className="prm-toggle-sm">
      <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="prm-slider-sm" />
    </label>
  );
}

/* ══════════════════════════════════════════════════════════
   COMPOSANT UPLOAD ZONE (logo & favicon)
══════════════════════════════════════════════════════════ */
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
        <div className="prm-upload-zone-badge">✓ Chargé</div>

        {hasImage ? (
          <>
            <img className="prm-upload-preview-img" src={value} alt={type} />
            <div className="prm-upload-overlay">✏️ Changer</div>
          </>
        ) : (
          <>
            <div className="prm-upload-icon">{icon}</div>
            <p style={{ fontWeight:600, fontSize:'.95rem', color:'#1D1D1F', position:'relative' }}>{title}</p>
            <p style={{ fontSize:'.8rem', color:'#6E6E73', position:'relative' }}>
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
      <small style={{ display:'block', marginTop:'6px', fontSize:'.82rem', color:'#6E6E73' }}>{hint}</small>
    </div>
  );
}

/* ── Default params ── */
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

/* ── Deep merge : garde les valeurs par défaut si la clé est manquante ── */
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

/* ══════════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════════ */
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
  const [slugStatus,   setSlugStatus]   = useState(null); // {cls, txt}
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

  /* ── Injection meta OG pour partage du lien boutique ── */
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

  /* ── Génération slug auto ── */
  function genSlug() { return `oda-${Date.now().toString(36)}-${Math.random().toString(36).substring(2,6)}`; }

  /* ── Chargement ── */
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

  /* ── Sauvegarde ── */
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

  /* ── Vérifier slug ── */
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

  /* ── Soumettre slug ── */
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

  /* ── Save général ── */
  async function handleGeneralSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const ok = await saveParams();
    setSaving(false);
    showNotif(ok ? '✅ Modifications enregistrées !' : '⚠️ Sauvegardé localement', ok?'success':'warning');
  }

  /* ── Paiement ── */
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

  /* ── Livraison ── */
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

  /* ── Notifications ── */
  async function saveNotifs() {
    const ok = await saveParams();
    showNotif(ok ? '✅ Notifications sauvegardées !' : '⚠️ Sauvegardé localement', ok?'success':'warning');
  }

  /* ── Sécurité ── */
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

  /* ── Apparence : sauvegarde & reset ── */
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

  /* ── Upload image (logo / favicon) ── */
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

  /* ── Copier lien boutique ── */
  function copierLienBoutique() {
    const url = `${window.location.origin}/dashboard/boutique?shop=${params.identifiant?.slug}`;
    navigator.clipboard.writeText(url).then(() => showNotif('✅ Lien copié !', 'success'));
  }

  /* ── Preview boutique ── */
  function openPreview() {
    const slug = params.identifiant?.slug;
    const url  = slug ? `${window.location.origin}/dashboard/boutique?shop=${slug}` : `${window.location.origin}/dashboard/boutique`;
    setPreviewUrl(url);
    setPreviewOpen(true);
    if (iframeRef.current) iframeRef.current.src = url;
  }

  /* ── Nav items ── */
  const NAV = [
    { id:'general',       icon:'🏪', label:'Général' },
    { id:'identifiant',   icon:'🔖', label:'Identifiant unique' },
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
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'400px', fontFamily:'Poppins,sans-serif' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'2rem', marginBottom:'12px' }}>⚙️</div>
          <p style={{ color:'#6E6E73' }}>Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  /* ══ RENDER ══ */
  return (
    <div style={{ fontFamily:"'Poppins',-apple-system,sans-serif", background:'#F5F5F7', minHeight:'100vh' }}>
      <div className="prm-container">

        {/* ─ SIDEBAR ─ */}
        <aside className="prm-sidebar">
          <ul style={{ listStyle:'none', margin:0, padding:0 }}>
            {NAV.map(n => (
              <li key={n.id}>
                <button
                  className={`prm-menu-link${activeSection===n.id?' active':''}`}
                  onClick={() => setActiveSection(n.id)}
                >
                  <span style={{ fontSize:'1.2rem' }}>{n.icon}</span>
                  <span>{n.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* ─ CONTENU ─ */}
        <main>

          {/* ═ GÉNÉRAL ═ */}
          {activeSection === 'general' && (
            <section id="general" className="prm-section">
              <div className="prm-section-header">
                <h3 className="prm-section-title">Informations générales</h3>
                <p className="prm-section-desc">Configurez les informations de base de votre boutique</p>
              </div>
              <form id="generalForm" onSubmit={handleGeneralSubmit}>
                <div style={{ marginBottom:'24px' }}>
                  <label style={{ display:'block', fontWeight:500, marginBottom:'8px' }}>Nom de la boutique</label>
                  <input id="shopName" className="prm-input" type="text" placeholder="Ma Boutique Élégante" value={params.general.nom} onChange={e => updateParam('general.nom', e.target.value)} />
                </div>
                <div style={{ marginBottom:'24px' }}>
                  <label style={{ display:'block', fontWeight:500, marginBottom:'8px' }}>Description</label>
                  <textarea id="shopDescription" className="prm-textarea prm-input" placeholder="Décrivez votre boutique..." value={params.general.description} onChange={e => updateParam('general.description', e.target.value)} />
                </div>
                <div className="prm-form-grid" style={{ marginBottom:'24px' }}>
                  <div>
                    <label style={{ display:'block', fontWeight:500, marginBottom:'8px' }}>Email de contact</label>
                    <input id="shopEmail" className="prm-input" type="email" placeholder="contact@boutique.com" value={params.general.email} onChange={e => updateParam('general.email', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontWeight:500, marginBottom:'8px' }}>Téléphone (WhatsApp)</label>
                    <input id="shopPhone" className="prm-input" type="tel" placeholder="+237 6 XX XX XX XX" value={params.general.telephone} onChange={e => updateParam('general.telephone', e.target.value)} />
                  </div>
                </div>
                <div style={{ marginBottom:'24px' }}>
                  <label style={{ display:'block', fontWeight:500, marginBottom:'8px' }}>Adresse</label>
                  <input id="shopAddress" className="prm-input" type="text" placeholder="Douala, Cameroun" value={params.general.adresse} onChange={e => updateParam('general.adresse', e.target.value)} />
                </div>
                <button type="submit" className="prm-btn-primary" disabled={saving}>
                  {saving ? '⏳ Enregistrement...' : '💾 Enregistrer les modifications'}
                </button>
              </form>
            </section>
          )}

          {/* ═ IDENTIFIANT ═ */}
          {activeSection === 'identifiant' && (
            <section id="identifiant" className="prm-section">
              <div className="prm-section-header">
                <h3 className="prm-section-title">Identifiant unique de la boutique</h3>
                <p className="prm-section-desc">Créez un nom unique pour votre boutique (URL personnalisée)</p>
              </div>

              <div className="prm-alert-info">
                <span style={{ fontSize:'1.5rem' }}>ℹ️</span>
                <div>
                  <strong>À quoi sert l&apos;identifiant unique ?</strong>
                  <p style={{ marginTop:'4px', color:'#6E6E73', fontSize:'.9rem' }}>Cet identifiant sera utilisé dans l&apos;URL de votre boutique et permettra à vos clients d&apos;y accéder directement.</p>
                </div>
              </div>

              {/* Identifiant actif */}
              {params.identifiant?.slug && !showSlugForm && (
                <div id="identifiantActuel" style={{ marginBottom:'24px', padding:'20px', background:'linear-gradient(135deg,rgba(52,199,89,.10),rgba(52,199,89,.05))', borderRadius:'12px', borderLeft:'4px solid #34C759' }}>
                  <h4 style={{ marginBottom:'12px', color:'#34C759', fontWeight:600 }}>✅ Identifiant actif</h4>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
                    <span style={{ fontFamily:'monospace', fontSize:'1.1rem', fontWeight:600 }}>@</span>
                    <span id="identifiantActif" style={{ fontFamily:'monospace', fontSize:'1.1rem', fontWeight:600, color:'#007AFF' }}>{params.identifiant.slug}</span>
                  </div>
                  <div style={{ marginBottom:'16px' }}>
                    <strong>Lien de votre boutique :</strong>
                    <div className="prm-lien-row">
                      <input id="lienBoutique" type="text" readOnly value={boutiqueLien} style={{ padding:'10px', border:'2px solid #E5E7EB', borderRadius:'8px', fontFamily:'monospace', background:'white', outline:'none' }} />
                      <button type="button" className="prm-btn-secondary" style={{ padding:'10px 20px', whiteSpace:'nowrap', flexShrink:0 }} onClick={copierLienBoutique}>📋 Copier</button>
                    </div>
                  </div>
                  <button type="button" className="prm-btn-secondary" style={{ background:'transparent', color:'#007AFF', border:'2px solid #007AFF' }} onClick={() => setShowSlugForm(true)}>
                    ✏️ Modifier l&apos;identifiant
                  </button>
                </div>
              )}

              {/* Formulaire slug */}
              {(!params.identifiant?.slug || showSlugForm) && (
                <form id="identifiantForm" onSubmit={handleSlugSubmit}>
                  <div style={{ marginBottom:'24px' }}>
                    <label style={{ display:'block', fontWeight:500, marginBottom:'8px' }}>Identifiant unique (slug)</label>
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
                    <small style={{ display:'block', marginTop:'4px', fontSize:'.85rem', color:'#6E6E73' }}>Uniquement des lettres minuscules, chiffres et tirets (minimum 3 caractères)</small>
                    {slugStatus && <div id="slugAvailability" className={`prm-slug-status ${slugStatus.cls}`}>{slugStatus.txt}</div>}
                  </div>

                  <div className="prm-url-preview">
                    <strong>Aperçu de votre URL :</strong>
                    <div className="prm-url-text">
                      <span id="urlBase">{typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/boutique</span>
                      <span>?shop=</span>
                      <span id="slugPreview">{slugInput || 'votre-identifiant'}</span>
                    </div>
                  </div>

                  <div style={{ display:'flex', gap:'12px', marginTop:'20px' }}>
                    <button type="submit" className="prm-btn-primary">🔖 Définir l&apos;identifiant</button>
                    {showSlugForm && <button type="button" className="prm-btn-secondary" onClick={() => setShowSlugForm(false)}>Annuler</button>}
                  </div>
                </form>
              )}
            </section>
          )}

          {/* ═ PAIEMENT ═ */}
          {activeSection === 'payment' && (
            <section id="payment" className="prm-section">
              <div className="prm-section-header">
                <h3 className="prm-section-title">Méthodes de paiement</h3>
                <p className="prm-section-desc">Configurez vos options de paiement</p>
              </div>

              {/* Carte bancaire */}
              <div className="prm-payment-card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                    <span style={{ fontSize:'2rem' }}>💳</span>
                    <div>
                      <h4 style={{ fontWeight:600 }}>Carte bancaire</h4>
                      <p style={{ fontSize:'.85rem', color:'#6E6E73' }}>Visa, Mastercard, American Express</p>
                    </div>
                  </div>
                  <Toggle id="paymentCard" checked={params.paiement.carte.actif} onChange={v => updateParam('paiement.carte.actif', v)} />
                </div>
                {params.paiement.carte.actif && (
                  <div id="cardDetails" style={{ marginTop:'16px', paddingTop:'16px', borderTop:'1px solid #D2D2D7' }}>
                    <input id="stripeKey" className="prm-input" type="text" placeholder="Clé API Stripe" value={params.paiement.carte.cle} onChange={e => updateParam('paiement.carte.cle', e.target.value)} />
                    <button type="button" className="prm-btn-confirm" onClick={() => confirmerPaiement('carte')}>✓ Confirmer</button>
                  </div>
                )}
              </div>

              {/* Mobile Money */}
              <div className="prm-payment-card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                    <span style={{ fontSize:'2rem' }}>📱</span>
                    <div>
                      <h4 style={{ fontWeight:600 }}>Mobile Money</h4>
                      <p style={{ fontSize:'.85rem', color:'#6E6E73' }}>MTN Money &amp; Orange Money</p>
                    </div>
                  </div>
                  <Toggle id="paymentMobile" checked={params.paiement.mobile.actif} onChange={v => updateParam('paiement.mobile.actif', v)} />
                </div>
                {params.paiement.mobile.actif && (
                  <div id="mobileDetails" style={{ marginTop:'16px', paddingTop:'16px', borderTop:'1px solid #D2D2D7' }}>
                    {/* MTN */}
                    <div className="prm-mm-section">
                      <div className="prm-mm-header">
                        <span className="prm-mm-icon" style={{ background:'#FFCC00', color:'#000' }}>📞</span>
                        <h5 style={{ flex:1, fontWeight:600, fontSize:'1rem', margin:0 }}>MTN Money</h5>
                        <ToggleSm id="mtnActive" checked={params.paiement.mobile.mtn?.actif ?? false} onChange={v => updateParam('paiement.mobile.mtn.actif', v)} />
                      </div>
                      {params.paiement.mobile.mtn?.actif && (
                        <div id="mtnInputs" className="prm-mm-inputs">
                          <div style={{ marginBottom:'16px' }}>
                            <label style={{ display:'block', fontWeight:500, marginBottom:'8px', fontSize:'.95rem' }}>Nom du compte MTN</label>
                            <input id="mtnNomCompte" className="prm-input" type="text" placeholder="Ex: KAMGA Jean" value={params.paiement.mobile.mtn?.nomCompte ?? ''} onChange={e => updateParam('paiement.mobile.mtn.nomCompte', e.target.value)} />
                          </div>
                          <div>
                            <label style={{ display:'block', fontWeight:500, marginBottom:'8px', fontSize:'.95rem' }}>Numéro MTN Money</label>
                            <input id="mtnNumero" className="prm-input" type="tel" placeholder="+237 6 XX XX XX XX" value={params.paiement.mobile.mtn?.numero ?? ''} onChange={e => updateParam('paiement.mobile.mtn.numero', e.target.value)} />
                            <small style={{ display:'block', marginTop:'4px', fontSize:'.85rem', color:'#6E6E73' }}>Format: +237 6XX XX XX XX</small>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ height:'1px', background:'linear-gradient(to right,transparent,#D2D2D7 20%,#D2D2D7 80%,transparent)', margin:'20px 0' }} />

                    {/* Orange */}
                    <div className="prm-mm-section">
                      <div className="prm-mm-header">
                        <span className="prm-mm-icon" style={{ background:'#FF7900', color:'#fff' }}>🍊</span>
                        <h5 style={{ flex:1, fontWeight:600, fontSize:'1rem', margin:0 }}>Orange Money</h5>
                        <ToggleSm id="orangeActive" checked={params.paiement.mobile.orange?.actif ?? false} onChange={v => updateParam('paiement.mobile.orange.actif', v)} />
                      </div>
                      {params.paiement.mobile.orange?.actif && (
                        <div id="orangeInputs" className="prm-mm-inputs">
                          <div style={{ marginBottom:'16px' }}>
                            <label style={{ display:'block', fontWeight:500, marginBottom:'8px', fontSize:'.95rem' }}>Nom du compte Orange</label>
                            <input id="orangeNomCompte" className="prm-input" type="text" placeholder="Ex: KAMGA Jean" value={params.paiement.mobile.orange?.nomCompte ?? ''} onChange={e => updateParam('paiement.mobile.orange.nomCompte', e.target.value)} />
                          </div>
                          <div>
                            <label style={{ display:'block', fontWeight:500, marginBottom:'8px', fontSize:'.95rem' }}>Numéro Orange Money</label>
                            <input id="orangeNumero" className="prm-input" type="tel" placeholder="+237 6 XX XX XX XX" value={params.paiement.mobile.orange?.numero ?? ''} onChange={e => updateParam('paiement.mobile.orange.numero', e.target.value)} />
                            <small style={{ display:'block', marginTop:'4px', fontSize:'.85rem', color:'#6E6E73' }}>Format: +237 6XX XX XX XX</small>
                          </div>
                        </div>
                      )}
                    </div>

                    <button type="button" id="confirmerMobileMoney" className="prm-btn-confirm" onClick={confirmerMobileMoney}>
                      ✓ Confirmer les paramètres Mobile Money
                    </button>
                  </div>
                )}
              </div>

              {/* Paiement à la livraison */}
              <div className="prm-payment-card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                    <span style={{ fontSize:'2rem' }}>💵</span>
                    <div>
                      <h4 style={{ fontWeight:600 }}>Paiement à la livraison</h4>
                      <p style={{ fontSize:'.85rem', color:'#6E6E73' }}>Espèces à la réception</p>
                    </div>
                  </div>
                  <Toggle id="paymentCash" checked={params.paiement.cash.actif} onChange={v => updateParam('paiement.cash.actif', v)} />
                </div>
                {params.paiement.cash.actif && (
                  <div id="cashDetails" style={{ marginTop:'16px', paddingTop:'16px', borderTop:'1px solid #D2D2D7' }}>
                    <p style={{ color:'#34C759', fontWeight:500 }}>✓ Aucune configuration requise</p>
                    <button type="button" className="prm-btn-confirm" onClick={() => confirmerPaiement('cash')}>✓ Confirmer</button>
                  </div>
                )}
              </div>

              {/* Devise */}
              <div style={{ marginTop:'32px' }}>
                <label style={{ display:'block', fontWeight:500, marginBottom:'8px' }}>Devise</label>
                <select id="currency" className="prm-select prm-input" value={params.paiement.devise} onChange={e => updateParam('paiement.devise', e.target.value)}>
                  <option value="FCFA">FCFA (Franc CFA)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="USD">USD (Dollar)</option>
                </select>
              </div>

              <div style={{ marginTop:'24px' }}>
                <button className="prm-btn-primary" onClick={async () => { const ok = await saveParams(); showNotif(ok?'✅ Paiement sauvegardé !':'⚠️ Sauvegardé localement', ok?'success':'warning'); }}>
                  💾 Sauvegarder les paiements
                </button>
              </div>
            </section>
          )}

          {/* ═ LIVRAISON ═ */}
          {activeSection === 'shipping' && (
            <section id="shipping" className="prm-section">
              <div className="prm-section-header">
                <h3 className="prm-section-title">Options de livraison</h3>
                <p className="prm-section-desc">Configurez vos zones et frais de livraison</p>
              </div>

              <form id="shippingForm" onSubmit={handleShippingSubmit}>
                {/* Zones principales */}
                <div style={{ background:'linear-gradient(135deg,#E8F4FF,#F5F5F7)', padding:'24px', borderRadius:'16px', marginBottom:'24px' }}>
                  <h4 style={{ color:'#007AFF', marginBottom:'16px', fontWeight:600 }}>📍 Zones principales</h4>
                  <div className="prm-form-grid">
                    <div>
                      <label style={{ display:'block', fontWeight:500, marginBottom:'8px' }}>Frais de livraison (Douala)</label>
                      <input id="fraisDouala" className="prm-input" type="number" value={params.livraison.fraisDouala} min="0" onChange={e => updateParam('livraison.fraisDouala', parseInt(e.target.value))} />
                      <small style={{ display:'block', marginTop:'4px', color:'#6E6E73', fontSize:'.85rem' }}>FCFA</small>
                    </div>
                    <div>
                      <label style={{ display:'block', fontWeight:500, marginBottom:'8px' }}>Frais de livraison (Autres villes)</label>
                      <input id="fraisAutres" className="prm-input" type="number" value={params.livraison.fraisAutres} min="0" onChange={e => updateParam('livraison.fraisAutres', parseInt(e.target.value))} />
                      <small style={{ display:'block', marginTop:'4px', color:'#6E6E73', fontSize:'.85rem' }}>FCFA</small>
                    </div>
                  </div>
                </div>

                {/* Zones personnalisées */}
                <div style={{ marginBottom:'24px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                    <h4 style={{ color:'#007AFF', fontWeight:600 }}>🗺️ Zones personnalisées</h4>
                    <button type="button" id="ajouterZone" className="prm-btn-secondary" style={{ padding:'8px 16px', fontSize:'.9rem' }} onClick={addZone}>
                      ➕ Ajouter une zone
                    </button>
                  </div>

                  <div id="zonesContainer">
                    {(params.livraison.zonesPersonnalisees || []).map((z, i) => (
                      <div key={i} className="prm-zone-row">
                        <input className="prm-input" type="text" placeholder="Nom de la ville" value={z.nom} onChange={e => updateZone(i, 'nom', e.target.value)} />
                        <input className="prm-input" type="number" placeholder="Frais" value={z.frais} min="0" onChange={e => updateZone(i, 'frais', parseInt(e.target.value))} />
                        <button type="button" onClick={() => removeZone(i)} style={{ padding:'8px 12px', background:'rgba(255,59,48,.10)', color:'#FF3B30', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:700 }}>🗑️</button>
                      </div>
                    ))}
                  </div>

                  {!(params.livraison.zonesPersonnalisees || []).length && (
                    <div id="emptyZonesMessage" style={{ textAlign:'center', padding:'32px', color:'#6E6E73', background:'linear-gradient(135deg,#E8F4FF,#F5F5F7)', borderRadius:'16px', border:'2px dashed rgba(0,122,255,.2)' }}>
                      <p style={{ fontSize:'1.1rem', marginBottom:'4px' }}>📦</p>
                      <p>Aucune zone personnalisée ajoutée</p>
                      <small style={{ fontSize:'.85rem' }}>Cliquez sur {'"'}Ajouter une zone{'"'} pour commencer</small>
                    </div>
                  )}
                </div>

                {/* Délai livraison */}
                <div style={{ marginBottom:'16px' }}>
                  <label style={{ display:'block', fontWeight:500, marginBottom:'8px' }}>Délai de livraison estimé</label>
                  <input id="delaiLivraison" className="prm-input" type="text" placeholder="Ex: 2-5 jours" value={params.livraison.delai} onChange={e => updateParam('livraison.delai', e.target.value)} />
                </div>

                {/* Livraison gratuite */}
                <div className="prm-setting-item">
                  <div>
                    <h4 style={{ fontWeight:600 }}>🎁 Livraison gratuite</h4>
                    <p style={{ fontSize:'.85rem', color:'#6E6E73' }}>Activer la livraison gratuite au-delà d&apos;un montant</p>
                  </div>
                  <Toggle id="freeShipping" checked={params.livraison.gratuit} onChange={v => updateParam('livraison.gratuit', v)} />
                </div>

                <div style={{ marginBottom:'24px' }}>
                  <label style={{ display:'block', fontWeight:500, marginBottom:'8px' }}>Montant minimum pour livraison gratuite (FCFA)</label>
                  <input id="montantMinimum" className="prm-input" type="number" value={params.livraison.montantMin} min="0" onChange={e => updateParam('livraison.montantMin', parseInt(e.target.value))} />
                </div>

                <button type="submit" className="prm-btn-primary">📦 Sauvegarder</button>
              </form>
            </section>
          )}

          {/* ═ NOTIFICATIONS ═ */}
          {activeSection === 'notifications' && (
            <section id="notifications" className="prm-section">
              <div className="prm-section-header">
                <h3 className="prm-section-title">Préférences de notifications</h3>
                <p className="prm-section-desc">Gérez vos notifications et alertes</p>
              </div>

              {[
                { id:'notifOrders',  key:'commandes', label:'Nouvelles commandes',   desc:'Recevoir une notification pour chaque nouvelle commande' },
                { id:'notifStock',   key:'stock',     label:'Stock faible',           desc:"Alerte quand un produit atteint le stock minimum" },
                { id:'notifClients', key:'clients',   label:'Nouveaux clients',       desc:"Notification lors de l'inscription d'un nouveau client" },
                { id:'notifReports', key:'rapports',  label:'Rapports hebdomadaires', desc:'Recevoir un résumé des ventes chaque semaine' },
              ].map(n => (
                <div key={n.id} className="prm-setting-item">
                  <div>
                    <h4 style={{ fontWeight:600 }}>{n.label}</h4>
                    <p style={{ fontSize:'.85rem', color:'#6E6E73' }}>{n.desc}</p>
                  </div>
                  <Toggle id={n.id} checked={params.notifications[n.key]} onChange={v => updateParam(`notifications.${n.key}`, v)} />
                </div>
              ))}

              <div style={{ marginTop:'20px' }}>
                <button className="prm-btn-primary" onClick={saveNotifs}>💾 Sauvegarder les notifications</button>
              </div>
            </section>
          )}

          {/* ═ SÉCURITÉ ═ */}
          {activeSection === 'security' && (
            <section id="security" className="prm-section">
              <div className="prm-section-header">
                <h3 className="prm-section-title">Sécurité et confidentialité</h3>
                <p className="prm-section-desc">Protégez votre compte et vos données</p>
              </div>

              <form id="securityForm" onSubmit={handlePasswordSubmit}>
                {[
                  { id:'currentPassword', label:'Mot de passe actuel',      key:'current', placeholder:'••••••••' },
                  { id:'newPassword',     label:'Nouveau mot de passe',      key:'new',     placeholder:'••••••••' },
                  { id:'confirmPassword', label:'Confirmer le mot de passe', key:'confirm', placeholder:'••••••••' },
                ].map(f => (
                  <div key={f.id} style={{ marginBottom:'24px' }}>
                    <label style={{ display:'block', fontWeight:500, marginBottom:'8px' }}>{f.label}</label>
                    <input id={f.id} className="prm-input" type="password" placeholder={f.placeholder} value={passwords[f.key]} onChange={e => setPasswords(p => ({...p, [f.key]: e.target.value}))} />
                  </div>
                ))}
                <button type="submit" className="prm-btn-primary" disabled={pwdChanging}>
                  {pwdChanging ? '⏳ Modification...' : '🔒 Changer le mot de passe'}
                </button>
              </form>

              <div className="prm-danger-zone">
                <h4 style={{ color:'#FF3B30', marginBottom:'8px', fontWeight:600 }}>Zone de danger</h4>
                <p style={{ color:'#6E6E73', marginBottom:'16px', fontSize:'.9rem' }}>Ces actions sont irréversibles. Procédez avec prudence.</p>
                <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                  <button type="button" className="prm-btn-danger" onClick={exporterDonnees}>📥 Exporter mes données</button>
                  <button type="button" className="prm-btn-danger" onClick={supprimerCompte}>🗑️ Supprimer mon compte</button>
                </div>
              </div>
            </section>
          )}

          {/* ═ APPARENCE ═ */}
          {activeSection === 'apparence' && (
            <section id="apparence" className="prm-section">
              <div className="prm-section-header">
                <h3 className="prm-section-title">Personnalisation de l&apos;apparence</h3>
                <p className="prm-section-desc">Personnalisez les couleurs, la police et l&apos;identité visuelle de votre boutique en ligne</p>
              </div>

              <div className="prm-alert-info">
                <span style={{ fontSize:'1.5rem' }}>ℹ️</span>
                <div>
                  <strong>Information importante</strong>
                  <p style={{ marginTop:'4px', color:'#6E6E73', fontSize:'.9rem' }}>Les modifications d&apos;apparence seront appliquées à votre boutique après sauvegarde.</p>
                </div>
              </div>

              {/* ── Identité visuelle : Logo + Favicon ── */}
              <div style={{ marginBottom:'32px' }}>
                <h4 style={{ fontSize:'1.1rem', fontWeight:600, marginBottom:'16px', color:'#1D1D1F' }}>🖼️ Identité visuelle</h4>
                <div className="prm-form-grid">

                  {/* Logo */}
                  <div>
                    <label style={{ display:'block', fontWeight:500, marginBottom:'8px' }}>Logo de la boutique</label>
                    <UploadZone
                      type="logo"
                      value={params.apparence.logo}
                      onUpload={handleImageUpload}
                      icon="🖼️"
                      title="Glissez-déposez ou cliquez"
                      hint="Dimensions recommandées : 200×80 px"
                      accept="image/*"
                    />
                  </div>

                  {/* Favicon */}
                  <div>
                    <label style={{ display:'block', fontWeight:500, marginBottom:'8px' }}>Favicon (icône de l&apos;onglet)</label>
                    <UploadZone
                      type="favicon"
                      value={params.apparence.favicon}
                      onUpload={handleImageUpload}
                      icon="🔖"
                      title="Glissez-déposez ou cliquez"
                      hint="Dimensions recommandées : 32×32 px"
                      accept="image/png,image/x-icon,image/*"
                    />
                  </div>

                </div>

                {/* Aperçu logo actuel */}
                {params.apparence.logo && (
                  <div style={{ marginTop:'16px', padding:'16px 20px', background:'#F5F5F7', borderRadius:'12px', display:'flex', alignItems:'center', gap:'14px' }}>
                    <div style={{ width:'48px', height:'48px', borderRadius:'10px', overflow:'hidden', background:'white', boxShadow:'0 2px 8px rgba(0,0,0,.1)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <img src={params.apparence.logo} alt="Logo boutique" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:600, marginBottom:'2px', fontSize:'.9rem' }}>Logo actuel</p>
                      <p style={{ fontSize:'.82rem', color:'#6E6E73' }}>Affiché dans le header de votre boutique</p>
                    </div>
                    <button type="button" onClick={() => handleImageUpload('logo', '')} style={{ background:'none', border:'none', color:'#FF3B30', cursor:'pointer', fontWeight:600, fontSize:'.85rem', flexShrink:0 }}>
                      🗑️ Supprimer
                    </button>
                  </div>
                )}

                {/* Aperçu favicon actuel */}
                {params.apparence.favicon && (
                  <div style={{ marginTop:'12px', padding:'16px 20px', background:'#F5F5F7', borderRadius:'12px', display:'flex', alignItems:'center', gap:'14px' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'8px', overflow:'hidden', background:'white', boxShadow:'0 2px 8px rgba(0,0,0,.1)', flexShrink:0 }}>
                      <img src={params.apparence.favicon} alt="Favicon" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:600, marginBottom:'2px', fontSize:'.9rem' }}>Favicon actuel</p>
                      <p style={{ fontSize:'.82rem', color:'#6E6E73' }}>Affiché dans l&apos;onglet du navigateur de la boutique</p>
                    </div>
                    <button type="button" onClick={() => handleImageUpload('favicon', '')} style={{ background:'none', border:'none', color:'#FF3B30', cursor:'pointer', fontWeight:600, fontSize:'.85rem', flexShrink:0 }}>
                      🗑️ Supprimer
                    </button>
                  </div>
                )}
              </div>

              <hr style={{ border:'none', borderTop:'2px solid #F5F5F7', margin:'0 0 32px' }} />

              {/* Couleurs */}
              <div style={{ marginBottom:'32px' }}>
                <h4 style={{ fontSize:'1.1rem', fontWeight:600, marginBottom:'16px', color:'#1D1D1F' }}>🎨 Couleurs du site</h4>
                <div className="prm-form-grid">
                  {[
                    { id:'primaryColor',   key:'couleurPrimaire',   label:'Couleur primaire',  hint:"Couleur principale de votre boutique (boutons, liens, etc.)" },
                    { id:'secondaryColor', key:'couleurSecondaire', label:'Couleur secondaire', hint:"Couleur d'accentuation et de contraste" },
                  ].map(c => (
                    <div key={c.id}>
                      <label style={{ display:'block', fontWeight:500, marginBottom:'8px' }}>{c.label}</label>
                      <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                        <input
                          id={c.id}
                          type="color"
                          className="prm-color-picker"
                          value={params.apparence[c.key]}
                          onChange={e => updateParam(`apparence.${c.key}`, e.target.value)}
                        />
                        <div style={{ width:'60px', height:'40px', borderRadius:'8px', border:'2px solid #D2D2D7', background:params.apparence[c.key] }} />
                        <input
                          type="text"
                          className="prm-input"
                          value={params.apparence[c.key]}
                          readOnly
                          style={{ maxWidth:'110px', fontFamily:'monospace' }}
                        />
                      </div>
                      <small style={{ display:'block', marginTop:'4px', fontSize:'.85rem', color:'#6E6E73' }}>{c.hint}</small>
                    </div>
                  ))}
                </div>
              </div>

              {/* Police */}
              <div style={{ marginBottom:'32px' }}>
                <h4 style={{ fontSize:'1.1rem', fontWeight:600, marginBottom:'16px', color:'#1D1D1F' }}>✏️ Police de caractères</h4>
                <select id="fontSelect" className="prm-select prm-input" value={params.apparence.police} onChange={e => updateParam('apparence.police', e.target.value)}>
                  {['Inter','Poppins','Nunito','DM Sans','Plus Jakarta Sans','Outfit','Montserrat','Raleway','Josefin Sans','Lato','Open Sans','Roboto','Playfair Display','Cormorant Garamond','Libre Baskerville','DM Serif Display','Pacifico','Righteous','Bebas Neue','Abril Fatface'].map(f => (
                    <option key={f} value={f} style={{ fontFamily:f }}>{f}</option>
                  ))}
                </select>
                <p style={{ marginTop:'12px', fontFamily:params.apparence.police, fontSize:'1rem', color:'#6E6E73' }}>
                  Aperçu : Bienvenue dans votre boutique élégante !
                </p>
              </div>

              {/* Prévisualisation couleurs */}
              <div style={{ marginBottom:'32px', padding:'24px', background:'#F5F5F7', borderRadius:'16px' }}>
                <h4 style={{ fontSize:'1rem', fontWeight:600, marginBottom:'16px' }}>👁️ Aperçu</h4>
                <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'center' }}>
                  <button style={{ padding:'10px 20px', background:params.apparence.couleurPrimaire, color:'white', border:'none', borderRadius:'10px', fontWeight:600, cursor:'default' }}>
                    Bouton principal
                  </button>
                  <button style={{ padding:'10px 20px', background:'white', color:params.apparence.couleurPrimaire, border:`2px solid ${params.apparence.couleurPrimaire}`, borderRadius:'10px', fontWeight:600, cursor:'default' }}>
                    Bouton secondaire
                  </button>
                  <span style={{ padding:'4px 12px', background:params.apparence.couleurSecondaire, color:'white', borderRadius:'20px', fontSize:'.85rem', fontWeight:600 }}>
                    Badge
                  </span>
                </div>
              </div>

              {/* Boutons d'action */}
              <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                <button type="button" id="saveAppearance" className="prm-btn-primary" onClick={saveAppearance} disabled={saving}>
                  {saving ? '⏳ Sauvegarde...' : '💾 Sauvegarder l\'apparence'}
                </button>
                <button type="button" id="resetAppearance" className="prm-btn-secondary" style={{ background:'transparent', color:'#1D1D1F', border:'2px solid #D2D2D7' }} onClick={resetAppearance}>
                  ♻️ Réinitialiser par défaut
                </button>
                <button type="button" id="previewEcommerce" className="prm-btn-secondary" style={{ background:'#007AFF', color:'white', border:'none' }} onClick={openPreview}>
                  👁️ Prévisualiser sur la boutique
                </button>
              </div>
            </section>
          )}

        </main>
      </div>

      {/* ═ MODAL PREVIEW ═ */}
      <div id="previewModal" className={`prm-preview-modal${previewOpen?' active':''}`} onClick={e => e.target === e.currentTarget && setPreviewOpen(false)}>
        <div className="prm-preview-box">
          <div className="prm-preview-bar">
            <div className="prm-preview-dots"><span /><span /><span /></div>
            <div id="previewModalUrl" className="prm-preview-url-bar">{previewUrl}</div>
            <button id="previewModalClose" onClick={() => setPreviewOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.3rem', color:'#6B7280', lineHeight:1, padding:'2px 6px', borderRadius:'6px' }}>✕</button>
          </div>
          <iframe
            ref={iframeRef}
            id="previewIframe"
            className="prm-preview-iframe"
            src={previewOpen ? previewUrl : ''}
            title="Aperçu boutique"
          />
          <div className="prm-preview-footer">
            <button id="previewReloadBtn" onClick={() => { if (iframeRef.current) iframeRef.current.src = previewUrl; }} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', background:'#007AFF', color:'white', border:'none', borderRadius:'8px', fontSize:'.8rem', fontWeight:600, cursor:'pointer' }}>
              🔄 Recharger
            </button>
            <a id="previewOpenBtn" href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', background:'transparent', color:'#007AFF', border:'2px solid #007AFF', borderRadius:'8px', fontSize:'.8rem', fontWeight:600, textDecoration:'none' }}>
              🔗 Ouvrir dans un onglet
            </a>
          </div>
        </div>
      </div>

      {/* ═ MENU MOBILE ANDROID — barre fixe en bas ═ */}
      <nav id="prm-menu-mobile" aria-label="Navigation mobile">
        {NAV.map(n => (
          <button
            key={n.id}
            className={`prm-mob-btn${activeSection === n.id ? ' active' : ''}`}
            onClick={() => { setActiveSection(n.id); if (typeof window !== 'undefined') window.scrollTo({ top:0, behavior:'smooth' }); }}
            data-section={n.id}
          >
            <span className="prm-mob-icon">{n.icon}</span>
            <span className="prm-mob-label">{n.label}</span>
            {activeSection === n.id && <div className="prm-mob-dot" />}
          </button>
        ))}
      </nav>
    </div>
  );
}