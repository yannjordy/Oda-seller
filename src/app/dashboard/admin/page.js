'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const CSS = `
  @keyframes admFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
  @keyframes admPulse { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes admSpin { to{transform:rotate(360deg)} }

  .adm-wrap { min-height:100vh; background:#f5f5f7; font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; padding:24px; max-width:1400px; margin:0 auto; }
  @media(max-width:768px){ .adm-wrap{ padding:12px; } }

  .adm-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
  .adm-header h1 { font-size:1.5rem; font-weight:700; color:#1a1a1a; display:flex; align-items:center; gap:10px; margin:0; }
  .adm-header-sub { font-size:.82rem; color:#8e8e93; }
  .adm-badge { display:inline-flex; align-items:center; gap:4px; padding:4px 12px; border-radius:20px; font-size:.72rem; font-weight:600; }
  .adm-badge.super_admin { background:#1a1a2e; color:white; }
  .adm-badge.admin { background:#007AFF; color:white; }
  .adm-badge.moderator { background:#FF9500; color:white; }
  .adm-badge.support { background:#34C759; color:white; }

  .adm-tabs { display:flex; gap:6px; margin-bottom:20px; overflow-x:auto; scrollbar-width:none; }
  .adm-tabs::-webkit-scrollbar { display:none; }
  .adm-tab { padding:9px 18px; border-radius:10px; border:none; font-size:.82rem; font-weight:600; cursor:pointer; white-space:nowrap; transition:all .18s; font-family:inherit; background:white; color:#666; box-shadow:0 1px 3px rgba(0,0,0,.06); }
  .adm-tab:hover { background:#f0f0f0; }
  .adm-tab.active { background:#1a1a2e; color:white; box-shadow:0 4px 12px rgba(26,26,46,.25); }

  .adm-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:12px; margin-bottom:24px; }
  .adm-card { background:white; border-radius:14px; padding:18px 20px; box-shadow:0 2px 8px rgba(0,0,0,.06); animation:admFadeIn .3s ease both; border:1px solid #f0f0f0; }
  .adm-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.1); }
  .adm-card-label { font-size:.72rem; font-weight:600; color:#8e8e93; text-transform:uppercase; letter-spacing:.06em; margin-bottom:4px; }
  .adm-card-value { font-size:1.6rem; font-weight:800; color:#1a1a1a; line-height:1.2; }
  .adm-card-sub { font-size:.72rem; color:#34C759; font-weight:600; margin-top:2px; }
  .adm-card-icon { float:right; font-size:1.4rem; opacity:.15; }
  .adm-card.red .adm-card-value { color:#FF3B30; }
  .adm-card.green .adm-card-value { color:#34C759; }

  .adm-section { margin-bottom:20px; }
  .adm-section-title { font-size:1rem; font-weight:700; color:#1a1a1a; margin:0 0 4px; }
  .adm-section-desc { font-size:.78rem; color:#8e8e93; margin-bottom:12px; }

  .adm-table-wrap { overflow-x:auto; background:white; border-radius:14px; box-shadow:0 2px 8px rgba(0,0,0,.06); border:1px solid #f0f0f0; }
  .adm-table { width:100%; border-collapse:collapse; font-size:.82rem; }
  .adm-table th { text-align:left; padding:12px 14px; font-weight:600; color:#8e8e93; font-size:.72rem; text-transform:uppercase; letter-spacing:.05em; border-bottom:1px solid #f0f0f0; background:#fafafa; white-space:nowrap; }
  .adm-table td { padding:10px 14px; border-bottom:1px solid #f5f5f5; color:#333; vertical-align:middle; }
  .adm-table tr:hover td { background:#f8f9fd; }
  .adm-table tr:last-child td { border-bottom:none; }

  .adm-avatar { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#007AFF,#5856D6); display:flex; align-items:center; justify-content:center; color:white; font-size:.7rem; font-weight:700; flex-shrink:0; }
  .adm-avatar img { width:100%; height:100%; border-radius:50%; object-fit:cover; }

  .adm-btn { display:inline-flex; align-items:center; gap:5px; padding:6px 12px; border-radius:8px; border:none; font-size:.75rem; font-weight:600; cursor:pointer; transition:all .15s; font-family:inherit; }
  .adm-btn:active { transform:scale(.95); }
  .adm-btn-sm { padding:4px 8px; font-size:.68rem; }
  .adm-btn-danger { background:#FF3B30; color:white; }
  .adm-btn-danger:hover { background:#dc3545; }
  .adm-btn-warning { background:#FF9500; color:white; }
  .adm-btn-success { background:#34C759; color:white; }
  .adm-btn-primary { background:#007AFF; color:white; }
  .adm-btn-ghost { background:transparent; color:#666; border:1px solid #e0e0e0; }
  .adm-btn-ghost:hover { background:#f5f5f5; }

  .adm-pill { display:inline-flex; padding:2px 10px; border-radius:12px; font-size:.68rem; font-weight:600; }
  .adm-pill.actif { background:#34C759; color:white; }
  .adm-pill.inactif { background:#8e8e93; color:white; }
  .adm-pill.en_attente { background:#FF9500; color:white; }
  .adm-pill.resolu { background:#34C759; color:white; }
  .adm-pill.rejete { background:#8e8e93; color:white; }
  .adm-pill.published { background:#007AFF; color:white; }
  .adm-pill.draft { background:#FF9500; color:white; }
  .adm-pill.banned { background:#FF3B30; color:white; }

  .adm-search { width:100%; max-width:320px; padding:9px 14px; border-radius:10px; border:1.5px solid #e0e0e0; font-size:.82rem; outline:none; transition:border-color .2s; font-family:inherit; background:white; box-sizing:border-box; }
  .adm-search:focus { border-color:#007AFF; box-shadow:0 0 0 3px rgba(0,122,255,.1); }

  .adm-modal-bg { position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,.5); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:20px; animation:admFadeIn .15s ease; }
  .adm-modal { background:white; border-radius:16px; width:100%; max-width:480px; max-height:80vh; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 20px 60px rgba(0,0,0,.2); }
  .adm-modal-head { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid #f0f0f0; }
  .adm-modal-title { font-size:.95rem; font-weight:700; color:#1a1a1a; }
  .adm-modal-close { width:28px; height:28px; border:none; border-radius:50%; background:#f0f0f0; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#666; transition:all .15s; }
  .adm-modal-close:hover { background:#e0e0e0; }
  .adm-modal-body { padding:16px 20px; overflow-y:auto; flex:1; }
  .adm-modal-actions { display:flex; gap:8px; justify-content:flex-end; padding:12px 20px; border-top:1px solid #f0f0f0; }

  .adm-chart-bar { display:flex; align-items:flex-end; gap:3px; height:100px; }
  .adm-chart-col { flex:1; border-radius:4px 4px 0 0; min-height:2px; transition:height .6s ease; position:relative; }
  .adm-chart-col:hover { opacity:.8; }
  .adm-chart-label { font-size:.6rem; color:#8e8e93; text-align:center; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

  .adm-loading { display:flex; align-items:center; justify-content:center; min-height:60vh; flex-direction:column; gap:12px; color:#8e8e93; }
  .adm-spin { width:28px; height:28px; border:2.5px solid #e0e0e0; border-top-color:#007AFF; border-radius:50%; animation:admSpin .7s linear infinite; }

  .adm-empty { text-align:center; padding:40px 20px; color:#8e8e93; }
  .adm-empty-icon { font-size:2.5rem; margin-bottom:8px; }
  .adm-empty-title { font-size:1rem; font-weight:600; color:#333; margin:0 0 4px; }
  .adm-empty-desc { font-size:.82rem; color:#8e8e93; margin:0; }

  .adm-pagination { display:flex; align-items:center; justify-content:center; gap:8px; padding:12px 0; }
  .adm-page-btn { padding:6px 12px; border-radius:8px; border:1px solid #e0e0e0; background:white; font-size:.78rem; font-weight:500; cursor:pointer; color:#333; transition:all .15s; font-family:inherit; }
  .adm-page-btn:hover { background:#f5f5f5; }
  .adm-page-btn:disabled { opacity:.4; cursor:not-allowed; }
  .adm-page-btn.active { background:#1a1a2e; color:white; border-color:#1a1a2e; }
  .adm-page-info { font-size:.78rem; color:#8e8e93; }

  .adm-toast { position:fixed; bottom:24px; right:24px; z-index:99999; padding:12px 20px; border-radius:12px; font-size:.82rem; font-weight:600; color:white; box-shadow:0 8px 24px rgba(0,0,0,.15); animation:admFadeIn .2s ease; cursor:pointer; }
  .adm-toast.success { background:#34C759; }
  .adm-toast.error { background:#FF3B30; }
  .adm-toast.info { background:#007AFF; }
`;

export default function AdminPage() {
  const supabase = getSupabase();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    injectCSS();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/connexion'); return; }
    checkAdmin();
  }, [user, authLoading]);

  useEffect(() => { if (role) fetchData(); }, [tab, role, page]);

  async function checkAdmin() {
    try {
      const { data, error } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single();
      if (error || !data) {
        setRole(false);
        setChecking(false);
        return;
      }
      setRole(data.role);
    } catch {
      setRole(false);
    }
    setChecking(false);
  }

  async function api(method, body = {}, params = {}) {
    const qs = new URLSearchParams({ ...params, _t: Date.now() }).toString();
    const url = `/api/admin?${qs}`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-id': user.id },
      body: method === 'POST' ? JSON.stringify(body) : undefined,
    });
    return res.json();
  }

  async function fetchData() {
    setLoading(true);
    try {
      if (tab === 'dashboard') {
        const stats = await api('GET', {}, { action: 'stats' });
        setData(prev => ({ ...prev, stats }));
      } else if (tab === 'users') {
        const users = await api('GET', {}, { action: 'users', page: String(page) });
        setData(prev => ({ ...prev, users }));
      } else if (tab === 'produits') {
        const produits = await api('GET', {}, { action: 'produits', page: String(page) });
        setData(prev => ({ ...prev, produits }));
      } else if (tab === 'services') {
        const services = await api('GET', {}, { action: 'services', page: String(page) });
        setData(prev => ({ ...prev, services }));
      } else if (tab === 'signalements') {
        const signalements = await api('GET', {}, { action: 'signalements', page: String(page) });
        setData(prev => ({ ...prev, signalements }));
      } else if (tab === 'traffic') {
        const visiteurs = await api('GET', {}, { action: 'visiteurs', periode: data.periode || '7d' });
        setData(prev => ({ ...prev, visiteurs }));
      }
    } catch (err) {
      showToast('Erreur de chargement', 'error');
    }
    setLoading(false);
  }

  async function exec(action, payload) {
    try {
      const res = await api('POST', { action, ...payload });
      if (res.success) {
        showToast('Action effectuée');
        setModal(null);
        fetchData();
      } else {
        showToast(res.error || 'Erreur', 'error');
      }
    } catch {
      showToast('Erreur réseau', 'error');
    }
  }

  if (checking) return (
    <div className="adm-loading">
      <div className="adm-spin" />
      <span>Vérification des accès…</span>
    </div>
  );

  if (role === false) return (
    <div className="adm-loading">
      <div style={{ fontSize:'3rem' }}>🔒</div>
      <h2 style={{ fontSize:'1.2rem', fontWeight:700, color:'#333', margin:0 }}>Accès restreint</h2>
      <p style={{ color:'#8e8e93', fontSize:'.85rem', maxWidth:400, textAlign:'center' }}>
        Vous n&apos;avez pas les droits d&apos;administration nécessaires pour accéder à cette page.
      </p>
      <button className="adm-btn adm-btn-primary" onClick={() => router.push('/dashboard')}>
        Retour au tableau de bord
      </button>
    </div>
  );

  const TABS = [
    { id:'dashboard',   label:'📊', text:'Vue d\'ensemble' },
    { id:'users',       label:'👥', text:'Utilisateurs' },
    { id:'produits',    label:'📦', text:'Produits' },
    { id:'services',    label:'🛎️', text:'Services' },
    { id:'signalements', label:'🚩', text:'Signalements' },
    { id:'traffic',     label:'📈', text:'Trafic' },
  ];

  const ADM_ROLES = ['super_admin', 'admin', 'moderator', 'support'];
  const ADM_LABELS = { super_admin:'Super Admin', admin:'Admin', moderator:'Modérateur', support:'Support' };

  return (
    <div className="adm-wrap">
      <style>{CSS}</style>

      {/* Header */}
      <div className="adm-header">
        <div>
          <h1>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Tour de contrôle
            <span className={`adm-badge ${role}`}>{ADM_LABELS[role] || role}</span>
          </h1>
          <div className="adm-header-sub">Panneau d&apos;administration ODA</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="adm-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`adm-tab${tab === t.id ? ' active' : ''}`} onClick={() => { setTab(t.id); setPage(1); }}>
            {t.label} {t.text}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {tab === 'dashboard' && (
        <>
          {loading ? <div className="adm-loading"><div className="adm-spin" /><span>Chargement…</span></div> : (
            <>
              <div className="adm-grid">
                <div className="adm-card"><div className="adm-card-icon">👥</div><div className="adm-card-label">Utilisateurs</div><div className="adm-card-value">{data.stats?.users || 0}</div></div>
                <div className="adm-card"><div className="adm-card-icon">📦</div><div className="adm-card-label">Produits</div><div className="adm-card-value">{data.stats?.produits?.total || 0}</div><div className="adm-card-sub">{data.stats?.produits?.publies || 0} publiés</div></div>
                <div className="adm-card"><div className="adm-card-icon">🛎️</div><div className="adm-card-label">Services</div><div className="adm-card-value">{data.stats?.services?.total || 0}</div><div className="adm-card-sub">{data.stats?.services?.actifs || 0} actifs</div></div>
                <div className="adm-card"><div className="adm-card-icon">📋</div><div className="adm-card-label">Commandes</div><div className="adm-card-value">{data.stats?.commandes?.total || 0}</div></div>
                <div className="adm-card"><div className="adm-card-icon">💰</div><div className="adm-card-label">CA total</div><div className="adm-card-value">{(data.stats?.commandes?.ca || 0).toLocaleString('fr-FR')} F</div><div className="adm-card-sub">+{(data.stats?.commandes?.caMois || 0).toLocaleString('fr-FR')} F / 30j</div></div>
                <div className={`adm-card${(data.stats?.signalements || 0) > 0 ? ' red' : ''}`}><div className="adm-card-icon">🚩</div><div className="adm-card-label">Signalements</div><div className="adm-card-value">{data.stats?.signalements || 0}</div><div className="adm-card-sub">en attente</div></div>
                <div className="adm-card"><div className="adm-card-icon">📢</div><div className="adm-card-label">Boosts</div><div className="adm-card-value">{data.stats?.boosts?.total || 0}</div><div className="adm-card-sub">{data.stats?.boosts?.payes || 0} payés</div></div>
              </div>

              {(data.stats?.signalements || 0) > 0 && (
                <div className="adm-card" style={{ background:'#fff5f5', border:'1px solid #FF3B30', padding:'14px 18px', display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                  <span style={{ fontSize:'1.5rem' }}>🚩</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'.85rem', color:'#FF3B30' }}>{data.stats?.signalements} signalement(s) en attente</div>
                    <div style={{ fontSize:'.78rem', color:'#8e8e93' }}>Consultez l&apos;onglet Signalements pour traiter</div>
                  </div>
                  <button className="adm-btn adm-btn-danger adm-btn-sm" style={{ marginLeft:'auto' }} onClick={() => setTab('signalements')}>Voir</button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* USERS */}
      {tab === 'users' && (
        <div className="adm-section">
          <h3 className="adm-section-title">Gestion des utilisateurs</h3>
          <p className="adm-section-desc">Liste de tous les comptes. Actions : bloquer, supprimer, attribuer un rôle admin, modifier l&apos;abonnement.</p>
          <div style={{ marginBottom:12, display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            <input className="adm-search" placeholder="Rechercher par email ou nom…" value={search} onChange={e => setSearch(e.target.value)} />
            <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => fetchData()}>Actualiser</button>
          </div>
          {loading ? <div className="adm-loading"><div className="adm-spin" /></div> : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th><th>Email</th><th>Rôle</th><th>Abonnement</th><th>Produits</th><th>Inscrit</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users?.users?.filter(u => !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.nom?.toLowerCase().includes(search.toLowerCase())).map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div className="adm-avatar">{u.photo ? <img src={u.photo} alt="" /> : u.nom?.charAt(0)?.toUpperCase() || '?'}</div>
                          <span style={{ fontWeight:600 }}>{u.nom}</span>
                          {u.banned && <span className="adm-pill banned">Bloqué</span>}
                        </div>
                      </td>
                      <td style={{ fontSize:'.78rem', color:'#666' }}>{u.email}</td>
                      <td>{u.role ? <span className={`adm-badge ${u.role}`}>{ADM_LABELS[u.role]}</span> : <span style={{ color:'#aaa', fontSize:'.75rem' }}>—</span>}</td>
                      <td><span className={`adm-pill ${u.abonnementStatut === 'actif' ? 'actif' : 'inactif'}`}>{u.abonnement}</span></td>
                      <td style={{ textAlign:'center' }}>{u.produitsCount}</td>
                      <td style={{ fontSize:'.72rem', color:'#8e8e93' }}>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                          {!u.banned && role === 'super_admin' && (
                            <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => setModal({ type:'block', user: u })}>Bloquer</button>
                          )}
                          {u.banned && (
                            <button className="adm-btn adm-btn-success adm-btn-sm" onClick={() => exec('unblock_user', { userId: u.id })}>Débloquer</button>
                          )}
                          {role === 'super_admin' && (
                            <button className="adm-btn adm-btn-warning adm-btn-sm" onClick={() => setModal({ type:'admin_role', user: u })}>Rôle</button>
                          )}
                          {role === 'super_admin' && (
                            <button className="adm-btn adm-btn-warning adm-btn-sm" onClick={() => setModal({ type:'abonnement', user: u })}>Abonnement</button>
                          )}
                          {role === 'super_admin' && (
                            <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => setModal({ type:'delete', user: u })}>Suppr.</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="adm-pagination">
                <button className="adm-page-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p-1))}>←</button>
                <span className="adm-page-info">Page {page} / {data.users?.totalPages || 1}</span>
                <button className="adm-page-btn" disabled={page >= (data.users?.totalPages || 1)} onClick={() => setPage(p => p+1)}>→</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PRODUITS */}
      {tab === 'produits' && (
        <div className="adm-section">
          <h3 className="adm-section-title">Modération des produits</h3>
          <p className="adm-section-desc">Liste des produits publiés. Supprimez les contenus inappropriés.</p>
          {loading ? <div className="adm-loading"><div className="adm-spin" /></div> : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead><tr><th>Nom</th><th>Vendeur</th><th>Prix</th><th>Catégorie</th><th>Stock</th><th>Statut</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                  {(data.produits?.produits || []).map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight:600, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.nom}</td>
                      <td style={{ fontSize:'.78rem', color:'#666' }}>{p.user_id?.slice(0,8)}…</td>
                      <td>{Number(p.prix||0).toLocaleString('fr-FR')} F</td>
                      <td style={{ fontSize:'.75rem', color:'#666' }}>{p.categorie}</td>
                      <td style={{ textAlign:'center' }}>{p.stock}</td>
                      <td><span className={`adm-pill ${p.statut}`}>{p.statut}</span></td>
                      <td style={{ fontSize:'.72rem', color:'#8e8e93' }}>{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => setModal({ type:'delete_produit', produit: p })}>Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!data.produits?.produits || data.produits.produits.length === 0) && <div className="adm-empty"><div className="adm-empty-icon">📦</div><h4 className="adm-empty-title">Aucun produit</h4></div>}
            </div>
          )}
        </div>
      )}

      {/* SERVICES */}
      {tab === 'services' && (
        <div className="adm-section">
          <h3 className="adm-section-title">Modération des services</h3>
          <p className="adm-section-desc">Liste des services actifs. Supprimez les contenus inappropriés.</p>
          {loading ? <div className="adm-loading"><div className="adm-spin" /></div> : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead><tr><th>Nom</th><th>Vendeur</th><th>Prix</th><th>Lieu</th><th>Statut</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                  {(data.services?.services || []).map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight:600, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.nom}</td>
                      <td style={{ fontSize:'.78rem', color:'#666' }}>{s.user_id?.slice(0,8)}…</td>
                      <td>{s.prix ? `${Number(s.prix).toLocaleString('fr-FR')} F` : '—'}</td>
                      <td style={{ fontSize:'.75rem', color:'#666' }}>{s.lieu || '—'}</td>
                      <td><span className={`adm-pill ${s.statut}`}>{s.statut}</span></td>
                      <td style={{ fontSize:'.72rem', color:'#8e8e93' }}>{new Date(s.created_at).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => setModal({ type:'delete_service', service: s })}>Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!data.services?.services || data.services.services.length === 0) && <div className="adm-empty"><div className="adm-empty-icon">🛎️</div><h4 className="adm-empty-title">Aucun service</h4></div>}
            </div>
          )}
        </div>
      )}

      {/* SIGNALEMENTS */}
      {tab === 'signalements' && (
        <div className="adm-section">
          <h3 className="adm-section-title">Gestion des signalements</h3>
          <p className="adm-section-desc">Contenus signalés par les utilisateurs. Examinez et décidez de l&apos;action à prendre.</p>
          {loading ? <div className="adm-loading"><div className="adm-spin" /></div> : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead><tr><th>Type</th><th>Cible</th><th>Raison</th><th>Description</th><th>Statut</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                  {(data.signalements?.signalements || []).map(s => (
                    <tr key={s.id}>
                      <td><span className={`adm-pill ${s.type}`}>{s.type}</span></td>
                      <td style={{ fontSize:'.78rem', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.target_id}</td>
                      <td style={{ maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.raison}</td>
                      <td style={{ maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'#666', fontSize:'.78rem' }}>{s.description || '—'}</td>
                      <td><span className={`adm-pill ${s.statut}`}>{s.statut}</span></td>
                      <td style={{ fontSize:'.72rem', color:'#8e8e93' }}>{new Date(s.created_at).toLocaleDateString('fr-FR')}</td>
                      <td>
                        {s.statut === 'en_attente' && (
                          <div style={{ display:'flex', gap:4 }}>
                            <button className="adm-btn adm-btn-success adm-btn-sm" onClick={() => exec('traiter_signalement', { signalementId: s.id, statut: 'resolu', actionPrise: 'Aucune action nécessaire' })}>Approuver</button>
                            <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => exec('traiter_signalement', { signalementId: s.id, statut: 'rejete', actionPrise: 'Signalement rejeté' })}>Rejeter</button>
                          </div>
                        )}
                        {s.statut !== 'en_attente' && <span style={{ fontSize:'.72rem', color:'#8e8e93' }}>Traité</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!data.signalements?.signalements || data.signalements.signalements.length === 0) && (
                <div className="adm-empty"><div className="adm-empty-icon">✅</div><h4 className="adm-empty-title">Aucun signalement</h4><p className="adm-empty-desc">Tout est calme pour le moment</p></div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TRAFFIC */}
      {tab === 'traffic' && (
        <div className="adm-section">
          <h3 className="adm-section-title">Analyse du trafic</h3>
          <p className="adm-section-desc">Visites sur les boutiques et pages du marketplace.</p>
          <div style={{ display:'flex', gap:8, marginBottom:14 }}>
            {['7d','30d','90d'].map(p => (
              <button key={p} className={`adm-btn adm-btn-sm ${(data.periode||'7d') === p ? 'adm-btn-primary' : 'adm-btn-ghost'}`}
                onClick={() => { setData(prev => ({...prev, periode: p})); setTimeout(fetchData, 100); }}>
                {p === '7d' ? '7 jours' : p === '30d' ? '30 jours' : '90 jours'}
              </button>
            ))}
          </div>
          {loading ? <div className="adm-loading"><div className="adm-spin" /></div> : (
            <>
              <div className="adm-grid" style={{ gridTemplateColumns:'1fr 1fr' }}>
                <div className="adm-card">
                  <div className="adm-card-label">Visites totales</div>
                  <div className="adm-card-value">{data.visiteurs?.total || 0}</div>
                </div>
                <div className="adm-card">
                  <div className="adm-card-label">Période</div>
                  <div className="adm-card-value" style={{ fontSize:'1rem' }}>
                    {data.visiteurs?.periode === '7d' ? '7 jours' : data.visiteurs?.periode === '30d' ? '30 jours' : '90 jours'}
                  </div>
                </div>
              </div>

              <div className="adm-card" style={{ marginBottom:16 }}>
                <div className="adm-card-label" style={{ marginBottom:12 }}>Visites par jour</div>
                {data.visiteurs?.visitsParJour?.length > 0 ? (
                  <>
                    <div className="adm-chart-bar">
                      {(() => {
                        const max = Math.max(...data.visiteurs.visitsParJour.map(v => v.count), 1);
                        return data.visiteurs.visitsParJour.map((v, i) => (
                          <div key={i} className="adm-chart-col" style={{
                            height: `${Math.max((v.count/max)*100, 2)}%`,
                            background: 'linear-gradient(180deg,#007AFF,#5856D6)',
                          }} title={`${v.date}: ${v.count} visites`}>
                            <div className="adm-chart-label">{v.date?.slice(5)}</div>
                          </div>
                        ));
                      })()}
                    </div>
                  </>
                ) : (
                  <div className="adm-empty" style={{ padding:20 }}><div className="adm-empty-title" style={{ fontSize:'.85rem' }}>Aucune donnée de visite</div></div>
                )}
              </div>

              <div className="adm-card">
                <div className="adm-card-label" style={{ marginBottom:8 }}>Pages les plus visitées</div>
                {data.visiteurs?.topPages?.length > 0 ? (
                  <div className="adm-table-wrap" style={{ boxShadow:'none', border:'none' }}>
                    <table className="adm-table">
                      <thead><tr><th>Page</th><th>Visites</th></tr></thead>
                      <tbody>
                        {data.visiteurs.topPages.map((p, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight:500 }}>{p.page}</td>
                            <td><strong>{p.count}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="adm-empty" style={{ padding:20 }}><div className="adm-empty-title" style={{ fontSize:'.85rem' }}>Aucune donnée</div></div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* MODALS */}
      {modal?.type === 'block' && (
        <div className="adm-modal-bg" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="adm-modal">
            <div className="adm-modal-head">
              <span className="adm-modal-title">Bloquer l&apos;utilisateur</span>
              <button className="adm-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <p style={{ fontSize:'.85rem', color:'#666', lineHeight:1.6 }}>
                Êtes-vous sûr de vouloir bloquer <strong>{modal.user.nom}</strong> ({modal.user.email}) ?
                L&apos;utilisateur ne pourra plus se connecter pendant 2 ans.
              </p>
            </div>
            <div className="adm-modal-actions">
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(null)}>Annuler</button>
              <button className="adm-btn adm-btn-danger" onClick={() => exec('block_user', { userId: modal.user.id })}>Bloquer</button>
            </div>
          </div>
        </div>
      )}

      {modal?.type === 'delete' && (
        <div className="adm-modal-bg" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="adm-modal">
            <div className="adm-modal-head">
              <span className="adm-modal-title">Supprimer l&apos;utilisateur</span>
              <button className="adm-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <p style={{ fontSize:'.85rem', color:'#FF3B30', lineHeight:1.6, fontWeight:600 }}>
                ⚠️ Action irréversible !
              </p>
              <p style={{ fontSize:'.85rem', color:'#666', lineHeight:1.6 }}>
                Toutes les données de <strong>{modal.user.nom}</strong> seront définitivement supprimées.
              </p>
            </div>
            <div className="adm-modal-actions">
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(null)}>Annuler</button>
              <button className="adm-btn adm-btn-danger" onClick={() => exec('delete_user', { userId: modal.user.id })}>Supprimer définitivement</button>
            </div>
          </div>
        </div>
      )}

      {modal?.type === 'admin_role' && (
        <div className="adm-modal-bg" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="adm-modal">
            <div className="adm-modal-head">
              <span className="adm-modal-title">Attribuer un rôle admin</span>
              <button className="adm-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <p style={{ fontSize:'.82rem', color:'#666', marginBottom:12 }}>Utilisateur : <strong>{modal.user.nom}</strong></p>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {ADM_ROLES.map(r => (
                  <button key={r} className="adm-btn adm-btn-ghost" style={{ justifyContent:'flex-start', padding:'10px 14px', fontSize:'.82rem' }}
                    onClick={() => exec('set_admin', { userId: modal.user.id, newRole: r })}>
                    <span className={`adm-badge ${r}`} style={{ marginRight:8, minWidth:60, justifyContent:'center' }}>{ADM_LABELS[r]}</span>
                    {r === 'super_admin' ? 'Accès complet à toutes les fonctionnalités' :
                     r === 'admin' ? 'Gestion des utilisateurs et modération' :
                     r === 'moderator' ? 'Modération des contenus uniquement' :
                     'Support technique et assistance'}
                  </button>
                ))}
                {modal.user.role && (
                  <button className="adm-btn adm-btn-danger adm-btn-sm" style={{ marginTop:8, justifyContent:'center' }}
                    onClick={() => exec('remove_admin', { userId: modal.user.id })}>
                    Retirer les droits admin
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {modal?.type === 'abonnement' && (
        <div className="adm-modal-bg" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="adm-modal">
            <div className="adm-modal-head">
              <span className="adm-modal-title">Modifier l&apos;abonnement</span>
              <button className="adm-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <p style={{ fontSize:'.82rem', color:'#666', marginBottom:12 }}>Utilisateur : <strong>{modal.user.nom}</strong></p>
              <p style={{ fontSize:'.78rem', color:'#8e8e93', marginBottom:16 }}>Abonnement actuel : <strong>{modal.user.abonnement}</strong> (limite: {modal.user.abonnement === 'gratuit' ? '10' : '100'})</p>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {[
                  { plan:'gratuit', limiteProduits:10, label:'Gratuit — 10 produits' },
                  { plan:'basique', limiteProduits:50, label:'Basique — 50 produits' },
                  { plan:'pro', limiteProduits:200, label:'Pro — 200 produits' },
                  { plan:'illimité', limiteProduits:9999, label:'Illimité' },
                ].map(o => (
                  <button key={o.plan} className="adm-btn adm-btn-ghost" style={{ justifyContent:'flex-start', padding:'10px 14px', fontSize:'.82rem' }}
                    onClick={() => exec('update_abonnement', { userId: modal.user.id, plan: o.plan, limiteProduits: o.limiteProduits })}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {modal?.type === 'delete_produit' && (
        <div className="adm-modal-bg" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="adm-modal">
            <div className="adm-modal-head">
              <span className="adm-modal-title">Supprimer le produit</span>
              <button className="adm-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <p style={{ fontSize:'.85rem', color:'#666', lineHeight:1.6 }}>
                Supprimer définitivement <strong>{modal.produit.nom}</strong> ?
              </p>
            </div>
            <div className="adm-modal-actions">
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(null)}>Annuler</button>
              <button className="adm-btn adm-btn-danger" onClick={() => exec('delete_produit', { produitId: modal.produit.id })}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {modal?.type === 'delete_service' && (
        <div className="adm-modal-bg" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="adm-modal">
            <div className="adm-modal-head">
              <span className="adm-modal-title">Supprimer le service</span>
              <button className="adm-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <p style={{ fontSize:'.85rem', color:'#666', lineHeight:1.6 }}>
                Supprimer définitivement <strong>{modal.service.nom}</strong> ?
              </p>
            </div>
            <div className="adm-modal-actions">
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(null)}>Annuler</button>
              <button className="adm-btn adm-btn-danger" onClick={() => exec('delete_service', { serviceId: modal.service.id })}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`adm-toast ${toast.type}`} onClick={() => setToast(null)}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function injectCSS() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('adm-css')) return;
  const s = document.createElement('style'); s.id = 'adm-css'; s.textContent = CSS;
  document.head.appendChild(s);
}
