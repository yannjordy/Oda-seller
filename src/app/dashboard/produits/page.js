'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// ─── Config ───────────────────────────────────────────────
const SUPABASE_URL     = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';

const CATEGORIES = [
  'Vetements','Electroniques','Decoration','Electromenager','Beaute & soin',
  'Accessoires','Bebe','jeux & jouets','Bricolage','Alimentation','Boissons',
  'Livre','Hygiene & sante','fitness','Animaux','Luxe','Bureau','peruque',
  'chaussures','telephone','outils','enfants','bijoux','autre','site-web',
  'voiture','formation',
];

// ─── Supabase singleton ───────────────────────────────────
let _sb = null;
function sb() {
  if (!_sb) {
    const { createClient } = require('@supabase/supabase-js');
    _sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _sb;
}

// ─── Helpers ──────────────────────────────────────────────
function joursDepuis(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000);
}
function joursRestants(dateStr) {
  return 14 - joursDepuis(dateStr);
}

// ─── StatusBadge helper ───────────────────────────────────
function getBadgeInfo(produit) {
  if (produit.statut === 'published') return { label: '✓ Publié', color: 'rgba(52,199,89,.9)' };
  if (produit.dateDraft) {
    const jr = joursRestants(produit.dateDraft);
    if (jr <= 0)  return { label: '⚠️ À supprimer', color: 'rgba(255,59,48,.9)' };
    if (jr <= 7)  return { label: `📝 Brouillon (${jr}j)`, color: 'rgba(255,149,0,.9)' };
  }
  return { label: '📝 Brouillon', color: 'rgba(255,149,0,.9)' };
}

// ══════════════════════════════════════════════════════════
export default function ProduitsPage() {
  const { user }   = useAuth();
  const router     = useRouter();
  const searchRef  = useRef(null);
  const fabRef     = useRef(null); // ← ref pour fermeture FAB au clic extérieur

  // ─── State ─────────────────────────────────────────────
  const [produits,         setProduits]         = useState([]);
  const [filtered,         setFiltered]         = useState([]);
  const [loading,          setLoading]          = useState(true);

  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [statFilter, setStatFilter] = useState('');
  const [sort,       setSort]       = useState('recent');



  // FAB mobile ← NOUVEAU
  const [fabOpen, setFabOpen] = useState(false);

  // Détail produit
  const [detail, setDetail]       = useState(null); // produit | null
  const [detailImg, setDetailImg] = useState(0);    // index image active

  // Bannières
  const [subBanner,      setSubBanner]      = useState(null);  // {type, data}
  const [showSubBanner,  setShowSubBanner]  = useState(true);
  const [warnBanner,     setWarnBanner]     = useState(null);  // {count, minJ, maxJ}
  const [showWarnBanner, setShowWarnBanner] = useState(true);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // ─── Toast ─────────────────────────────────────────────
  const toast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  // ─── Init ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    (async () => {
      await gererProduitsExpires();
      await supprimerProduitsAnciens();
      await afficherAvertissementProduitsEnDanger();
      await chargerProduits();
      await verifierAbonnement();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ─── Keyboard shortcuts ────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') { setFabOpen(false); setDetail(null); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ─── Fermer FAB si clic en dehors ── NOUVEAU ──────────
  useEffect(() => {
    if (!fabOpen) return;
    const handler = (e) => {
      if (fabRef.current && !fabRef.current.contains(e.target)) {
        setFabOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [fabOpen]);

  // ─── Scroll lock when detail open ─────────────────────
  useEffect(() => {
    document.body.style.overflow = detail ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [detail]);

  // ─── Filtres réactifs ──────────────────────────────────
  useEffect(() => {
    let list = [...produits];
    if (search)     list = list.filter(p =>
      p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
    if (catFilter)  list = list.filter(p => p.categorie === catFilter);
    if (statFilter) list = list.filter(p => p.statut === statFilter);

    switch (sort) {
      case 'name':       list.sort((a, b) => a.nom.localeCompare(b.nom)); break;
      case 'price-asc':  list.sort((a, b) => a.prix - b.prix); break;
      case 'price-desc': list.sort((a, b) => b.prix - a.prix); break;
      case 'stock':      list.sort((a, b) => b.stock - a.stock); break;
      default:           list.sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
    }
    setFiltered(list);
  }, [produits, search, catFilter, statFilter, sort]);

  // ══════════════════════════════════════════════════════
  //  SUPABASE — Chargement
  // ══════════════════════════════════════════════════════
  async function chargerProduits() {
    try {
      setLoading(true);
      const { data, error } = await sb()
        .from('produits').select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map(p => ({
        id: p.id, nom: p.nom, description: p.description,
        prix: p.prix, stock: p.stock, categorie: p.categorie,
        statut: p.statut,
        mainImage: p.main_image,
        descriptionImages: p.description_images || [],
        dateCreation: p.created_at,
        dateDraft: p.date_draft,
      }));
      setProduits(mapped);
    } catch (err) {
      console.error(err);
      toast('❌ Erreur lors du chargement des produits', 'error');
    } finally {
      setLoading(false);
    }
  }

  // ══════════════════════════════════════════════════════
  //  SYSTÈME ABONNEMENT
  // ══════════════════════════════════════════════════════
  async function gererProduitsExpires() {
    try {
      const { data: abo } = await sb().from('abonnements').select('*').eq('user_id', user.id).single();
      let limite = 10;
      let abonnementExpire = false;
      if (abo) {
        if (new Date(abo.date_expiration) > new Date()) { limite = abo.limite_produits; }
        else { abonnementExpire = true; }
      }

      const { data: tous } = await sb().from('produits').select('id, statut, created_at, date_draft')
        .eq('user_id', user.id).order('created_at', { ascending: true });
      if (!tous?.length) return;

      const aGarder = tous.slice(0, limite);
      const exced   = tous.slice(limite);
      const maintenant = new Date().toISOString();

      // Publier les premiers si nécessaire
      const idsPublier = aGarder.filter(p => p.statut !== 'published').map(p => p.id);
      if (idsPublier.length) {
        await sb().from('produits').update({ statut: 'published', date_draft: null }).in('id', idsPublier);
      }

      // Mettre les excédentaires en brouillon
      const idsDraft = exced.filter(p => p.statut === 'published').map(p => p.id);
      if (idsDraft.length) {
        await sb().from('produits').update({ statut: 'draft', date_draft: maintenant }).in('id', idsDraft);
        if (abonnementExpire) toast(`⚠️ ${idsDraft.length} produit(s) mis en brouillon — abonnement expiré`, 'warning');
      }

      // Supprimer brouillons > 14j
      const date14 = new Date(); date14.setDate(date14.getDate() - 14);
      const idsSupp = exced
        .filter(p => p.date_draft && p.statut === 'draft' && new Date(p.date_draft) <= date14)
        .map(p => p.id);
      if (idsSupp.length) {
        await sb().from('produits').delete().in('id', idsSupp);
        toast(`🗑️ ${idsSupp.length} produit(s) supprimés (brouillon > 14 jours)`, 'error');
      }
    } catch (err) { console.error(err); }
  }

  async function supprimerProduitsAnciens() {
    try {
      const dateLimite = new Date(); dateLimite.setDate(dateLimite.getDate() - 14);
      const { data } = await sb().from('produits').select('id')
        .eq('user_id', user.id).eq('statut', 'draft')
        .not('date_draft', 'is', null).lt('date_draft', dateLimite.toISOString());
      if (!data?.length) return;
      await sb().from('produits').delete().in('id', data.map(p => p.id));
      toast(`🗑️ ${data.length} brouillon(s) anciens supprimés`, 'error');
    } catch (err) { console.error(err); }
  }

  async function afficherAvertissementProduitsEnDanger() {
    try {
      const date7  = new Date(); date7.setDate(date7.getDate() - 7);
      const date14 = new Date(); date14.setDate(date14.getDate() - 14);
      const { data } = await sb().from('produits').select('id, date_draft')
        .eq('user_id', user.id).eq('statut', 'draft')
        .not('date_draft', 'is', null)
        .lt('date_draft', date7.toISOString()).gte('date_draft', date14.toISOString());
      if (!data?.length) return;
      const jours = data.map(p => 14 - joursDepuis(p.date_draft));
      setWarnBanner({ count: data.length, minJ: Math.min(...jours), maxJ: Math.max(...jours) });
    } catch (err) { console.error(err); }
  }

  async function verifierAbonnement() {
    try {
      const { data, error } = await sb().from('abonnements').select('*').eq('user_id', user.id).single();
      if (error && error.code !== 'PGRST116') return;
      if (!data) { setSubBanner({ type: 'none' }); return; }
      const exp = new Date(data.date_expiration);
      if (exp <= new Date()) { setSubBanner({ type: 'expired' }); return; }
      const jr = Math.ceil((exp - new Date()) / 86400000);
      setSubBanner({ type: 'active', data, joursRestants: jr });
    } catch (err) { console.error(err); }
  }

  // ══════════════════════════════════════════════════════
  //  ACTIONS PRODUIT
  // ══════════════════════════════════════════════════════
  async function supprimerProduit(id) {
    const produit = produits.find(p => p.id === id);
    if (!produit) return;
    if (!confirm(`⚠️ Supprimer "${produit.nom}" ?\n\nCette action est irréversible.`)) return;
    try {
      const { error } = await sb().from('produits').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      setProduits(p => p.filter(x => x.id !== id));
      toast('✅ Produit supprimé avec succès', 'success');
    } catch (err) {
      console.error(err);
      toast('❌ Erreur lors de la suppression', 'error');
    }
  }

  function modifierProduit(id) {
    localStorage.setItem('produit_en_edition', id);
    router.push('/dashboard');
  }

  function exportToJSON() {
    if (!produits.length) { toast('⚠️ Aucun produit à exporter', 'warning'); return; }
    const blob = new Blob([JSON.stringify(produits, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `produits_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('📥 Produits exportés avec succès', 'success');
  }

  // ══════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════
  const nbPublies = produits.filter(p => p.statut === 'published').length;

  return (
    <>
      {/* ── CSS ── */}
      <style jsx global>{`
        /* Variables — harmonisées avec layout.js */
        .odap-container {
          padding: 24px;
          max-width: 1920px;
          margin: 0 auto;
        }

        /* ── PAGE HEADER ── */
        .odap-page-header { margin-bottom: 28px; text-align: center; }
        .odap-page-title  {
          font-size: 2.2rem; font-weight: 700;
          background: linear-gradient(135deg, var(--primary, #007AFF), var(--secondary, #5856D6));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; margin-bottom: 6px;
          animation: odapFadeIn .6s ease both;
        }
        .odap-page-sub { color: var(--text-2, #8E8E93); font-size: 1rem; animation: odapFadeIn .8s ease both; }

        /* ── FILTERS ── */
        .odap-filters {
          background: var(--card-bg, #fff); padding: 20px;
          border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,.08);
          margin-bottom: 28px; animation: odapFadeIn 1s ease both;
        }
        .odap-search-bar {
          display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;
        }
        .odap-search-input {
          flex: 1; min-width: 240px; padding: 12px 16px;
          border: 2px solid var(--border, #E5E5EA); border-radius: 12px;
          font-family: 'Poppins', sans-serif; font-size: .95rem;
          transition: border-color .2s, box-shadow .2s; outline: none;
        }
        .odap-search-input:focus { border-color: var(--primary, #007AFF); box-shadow: 0 0 0 3px rgba(0,122,255,.12); }
        .odap-filter-select {
          padding: 12px 14px; border: 2px solid var(--border, #E5E5EA); border-radius: 12px;
          font-family: 'Poppins', sans-serif; font-size: .92rem;
          background: var(--card-bg, #fff); cursor: pointer; transition: border-color .2s; outline: none;
        }
        .odap-filter-select:focus { border-color: var(--primary, #007AFF); }
        .odap-stats-row {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 12px; border-top: 1px solid var(--border, #E5E5EA); gap: 12px; flex-wrap: wrap;
        }
        .odap-count { font-weight: 600; color: var(--primary, #007AFF); font-size: .95rem; }
        .odap-action-btns { display: flex; gap: 10px; flex-wrap: wrap; }
        .odap-btn-action {
          padding: 10px 18px; border: 2px solid var(--primary, #007AFF);
          background: var(--card-bg, #fff); color: var(--primary, #007AFF);
          border-radius: 10px; font-family: 'Poppins', sans-serif; font-weight: 600;
          cursor: pointer; transition: all .2s; white-space: nowrap; font-size: .88rem;
          text-decoration: none; display: inline-flex; align-items: center;
        }
        .odap-btn-action:hover { background: var(--primary, #007AFF); color: white; transform: translateY(-2px); }

        /* ── GRID ── */
        .odap-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }

        /* ── CARD ── */
        .odap-card {
          background: var(--card-bg, #fff); border-radius: 14px; overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,.08); border: 1px solid var(--border, #E5E5EA);
          transition: transform .2s, box-shadow .2s;
          animation: odapFadeIn .6s ease both;
        }
        .odap-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,.14); }
        .odap-card-img-wrap { position: relative; width: 100%; height: 190px; overflow: hidden; background: #F2F2F7; }
        .odap-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; display: block; }
        .odap-card:hover .odap-card-img { transform: scale(1.05); }
        .odap-card-badges { position: absolute; top: 6px; right: 6px; display: flex; flex-direction: column; gap: 4px; max-width: 88%; }
        .odap-badge {
          padding: 3px 8px; border-radius: 10px; font-size: .62rem; font-weight: 600;
          backdrop-filter: blur(10px); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: white;
        }
        .odap-badge-cat { background: rgba(255,255,255,.95); color: #007AFF; }
        .odap-card-body { padding: 14px; }
        .odap-card-title {
          font-size: 1rem; font-weight: 600; margin-bottom: 5px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3;
        }
        .odap-card-desc {
          color: var(--text-2, #8E8E93); font-size: .8rem; margin-bottom: 8px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4;
        }
        .odap-mini-imgs { display: flex; gap: 4px; margin-bottom: 8px; flex-wrap: wrap; }
        .odap-mini-img { width: 38px; height: 38px; border-radius: 7px; object-fit: cover; border: 2px solid var(--border, #E5E5EA); transition: transform .2s, border-color .2s; }
        .odap-mini-img:hover { border-color: #007AFF; transform: scale(1.1); }
        .odap-card-info {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px; background: linear-gradient(135deg, #E8F4FF, #F5F5F7);
          border-radius: 10px; margin-bottom: 10px;
        }
        .odap-price { font-size: 1.15rem; font-weight: 700; color: #007AFF; }
        .odap-stock-lbl { font-size: .68rem; color: var(--text-2, #8E8E93); text-align: right; }
        .odap-stock-val { font-size: .92rem; font-weight: 600; text-align: right; }
        .odap-stock-ok  { color: #34C759; }
        .odap-stock-no  { color: #FF3B30; }
        .odap-card-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .odap-btn-card {
          padding: 8px 4px; border: none; border-radius: 8px;
          font-family: 'Poppins', sans-serif; font-weight: 600; cursor: pointer;
          transition: transform .15s, box-shadow .15s; font-size: .72rem;
        }
        .odap-btn-card:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,.1); }
        .odap-btn-view   { background: linear-gradient(135deg, #007AFF, #5AC8FA); color: white; }
        .odap-btn-edit   { background: white; color: #007AFF; border: 2px solid #007AFF; }
        .odap-btn-delete { background: white; color: #FF3B30; border: 2px solid #FF3B30; }

        /* ── ZOOM HINT sur l'image ── */
        .odap-card-zoom-hint {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0); color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: .82rem; font-weight: 600; font-family: 'Poppins',sans-serif;
          opacity: 0; transition: opacity .2s, background .2s;
          letter-spacing: .03em;
        }
        .odap-card-img-wrap:hover .odap-card-zoom-hint {
          opacity: 1; background: rgba(0,0,0,.32);
        }

        /* ══════════════════════════════════════════════════
           PANNEAU DÉTAIL PRODUIT
           ══════════════════════════════════════════════════ */
        .odap-detail-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,.55); z-index: 2000;
          backdrop-filter: blur(4px);
        }
        .odap-detail-overlay.open { display: block; }

        /* Panneau latéral sur desktop */
        .odap-detail-panel {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(520px, 92vw);
          background: var(--card-bg, #fff);
          overflow-y: auto; z-index: 2001;
          display: flex; flex-direction: column;
          transform: translateX(100%);
          transition: transform .35s cubic-bezier(.4,0,.2,1);
          font-family: 'Poppins', sans-serif;
        }
        .odap-detail-panel.open { transform: translateX(0); }

        /* Header panneau */
        .odap-detail-header {
          position: sticky; top: 0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px; z-index: 10;
          background: var(--card-bg, #fff);
          border-bottom: 1.5px solid var(--border, #E5E5EA);
        }
        .odap-detail-title { font-size: 1.15rem; font-weight: 700; margin: 0; flex: 1; padding-right: 12px; line-height: 1.3; }
        .odap-detail-close {
          width: 38px; height: 38px; flex-shrink: 0;
          border-radius: 50%; border: none;
          background: rgba(255,59,48,.1); color: #FF3B30;
          font-size: 1.3rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background .2s, transform .15s;
        }
        .odap-detail-close:hover { background: #FF3B30; color: white; transform: rotate(90deg); }

        /* Corps */
        .odap-detail-body { padding: 20px; flex: 1; }

        /* Image principale + galerie */
        .odap-detail-main-img {
          width: 100%; height: 300px; object-fit: cover;
          border-radius: 14px; display: block;
          box-shadow: 0 4px 20px rgba(0,0,0,.12);
          cursor: zoom-in;
          transition: transform .3s;
        }
        .odap-detail-main-img:active { transform: scale(.98); }

        .odap-detail-thumbs {
          display: flex; gap: 8px; margin-top: 12px;
          overflow-x: auto; padding-bottom: 4px;
          scrollbar-width: none;
        }
        .odap-detail-thumbs::-webkit-scrollbar { display: none; }
        .odap-detail-thumb {
          width: 64px; height: 64px; flex-shrink: 0;
          border-radius: 10px; object-fit: cover;
          border: 2.5px solid transparent;
          cursor: pointer; transition: border-color .2s, transform .2s;
        }
        .odap-detail-thumb:hover  { transform: scale(1.06); }
        .odap-detail-thumb.active { border-color: #007AFF; }

        /* Alerte brouillon */
        .odap-detail-draft-warn {
          margin-top: 14px; padding: 12px 14px;
          border-radius: 10px; font-size: .85rem;
        }

        /* Stats grid */
        .odap-detail-stats {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; margin-top: 16px;
        }
        .odap-detail-stat {
          padding: 12px 14px;
          background: linear-gradient(135deg, #E8F4FF, #F5F5F7);
          border-radius: 12px;
        }
        .odap-detail-stat-lbl { font-size: .72rem; color: var(--text-2, #8E8E93); margin: 0 0 3px; }
        .odap-detail-stat-val { font-size: 1.1rem; font-weight: 700; margin: 0; }

        /* Description */
        .odap-detail-desc-section { margin-top: 18px; }
        .odap-detail-desc-title { font-size: .92rem; font-weight: 700; color: #007AFF; margin-bottom: 8px; }
        .odap-detail-desc-text  { color: var(--text-2, #8E8E93); font-size: .88rem; line-height: 1.8; margin: 0; }

        /* Images de description */
        .odap-detail-desc-imgs {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; margin-top: 14px;
        }
        .odap-detail-desc-img {
          width: 100%; aspect-ratio: 4/3; object-fit: cover;
          border-radius: 10px; cursor: pointer;
          transition: transform .2s, box-shadow .2s;
        }
        .odap-detail-desc-img:hover { transform: scale(1.03); box-shadow: 0 6px 18px rgba(0,0,0,.14); }

        /* Footer actions */
        .odap-detail-footer {
          position: sticky; bottom: 0;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; padding: 14px 20px;
          background: var(--card-bg, #fff);
          border-top: 1.5px solid var(--border, #E5E5EA);
        }
        .odap-detail-btn {
          padding: 12px; border-radius: 12px;
          font-family: 'Poppins', sans-serif; font-weight: 600;
          font-size: .88rem; cursor: pointer; border: none;
          transition: transform .15s, box-shadow .15s;
        }
        .odap-detail-btn:active { transform: scale(.96); }
        .odap-detail-btn-edit   { background: linear-gradient(135deg,#007AFF,#5AC8FA); color: white; }
        .odap-detail-btn-delete { background: white; color: #FF3B30; border: 2px solid #FF3B30; }

        /* ── Sur mobile : panneau bottom-sheet ── */
        @media (max-width: 768px) {
          .odap-detail-panel {
            top: auto; right: 0; bottom: 0; left: 0; width: 100%;
            height: 92dvh; border-radius: 22px 22px 0 0;
            transform: translateY(100%);
          }
          .odap-detail-panel.open { transform: translateY(0); }
          .odap-detail-main-img { height: 220px; }
          .odap-detail-body { padding: 14px; }
          .odap-detail-header { padding: 14px 16px; }
          .odap-detail-footer { padding: 12px 14px; }
        }

        /* ── EMPTY STATE ── */
        .odap-empty {
          text-align: center; padding: 60px 24px; background: var(--card-bg, #fff);
          border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,.08); grid-column: 1 / -1;
        }
        .odap-empty-icon { font-size: 4rem; margin-bottom: 12px; }
        .odap-empty-title { font-size: 1.4rem; font-weight: 600; margin-bottom: 8px; }
        .odap-empty-text  { color: var(--text-2, #8E8E93); margin-bottom: 20px; }
        .odap-btn-empty {
          padding: 12px 28px; background: linear-gradient(135deg, #007AFF, #5AC8FA);
          color: white; border: none; border-radius: 12px; font-family: 'Poppins', sans-serif;
          font-size: .95rem; font-weight: 600; cursor: pointer; transition: transform .2s, box-shadow .2s;
        }
        .odap-btn-empty:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,122,255,.3); }

        /* ── LOADING ── */
        .odap-loading { text-align: center; padding: 80px 24px; }
        .odap-spinner { font-size: 3rem; animation: odapSpin 1s linear infinite; display: block; margin-bottom: 12px; }
        @keyframes odapSpin     { to { transform: rotate(360deg); } }
        @keyframes odapFadeIn   { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes odapSlideIn  { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes odapSlideDown{ from { transform: translate(-50%,-80px); opacity: 0; } to { transform: translate(-50%,0); opacity: 1; } }
        @keyframes odapSlideInR { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes odapFabPop   { from { opacity: 0; transform: translateY(-12px) scale(.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

        /* ══════════════════════════════════════════════════
           FAB MOBILE — visible uniquement sur téléphone
           ══════════════════════════════════════════════════ */

        /* Sur desktop : FAB caché, filtres visibles normalement */
        .odap-fab-wrapper { display: none; }

        /* Sur mobile (≤ 768px) : on active le FAB et on cache les filtres */
        @media (max-width: 768px) {
          /* Cacher les selects et les boutons d'action dans la barre de filtres */
          .odap-filter-select { display: none !important; }
          .odap-action-btns   { display: none !important; }

          /* ─── Wrapper FAB (ancre de positionnement) ─── */
          .odap-fab-wrapper {
            display: block;
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 1300;
          }

          /* ─── Bouton FAB principal ─── */
          .odap-fab-btn {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            background: linear-gradient(135deg, #1C1C1E, #2C2C2E);
            color: white;
            border: none;
            font-size: 1.4rem;
            box-shadow: 0 4px 16px rgba(0,0,0,.5);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform .2s, box-shadow .2s;
            font-family: 'Poppins', sans-serif;
          }
          .odap-fab-btn:active { transform: scale(.93); }
          .odap-fab-btn.open {
            background: linear-gradient(135deg, #2C2C2E, #1C1C1E);
            box-shadow: 0 4px 20px rgba(0,0,0,.6);
          }

          /* ─── Panneau déroulant du FAB ─── */
          .odap-fab-panel {
            position: absolute;
            top: 58px;
            right: 0;
            background: var(--card-bg, #fff);
            border-radius: 18px;
            padding: 18px 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,.2);
            border: 1px solid var(--border, #E5E5EA);
            display: flex;
            flex-direction: column;
            gap: 10px;
            min-width: 240px;
            animation: odapFabPop .22s ease;
          }

          /* Titre du panneau */
          .odap-fab-panel-title {
            font-family: 'Poppins', sans-serif;
            font-size: .78rem;
            font-weight: 700;
            color: var(--text-2, #8E8E93);
            text-transform: uppercase;
            letter-spacing: .06em;
            margin-bottom: 2px;
          }

          /* Selects dans le panneau FAB */
          .odap-fab-select {
            width: 100%;
            padding: 11px 14px;
            border: 2px solid var(--border, #E5E5EA);
            border-radius: 12px;
            font-family: 'Poppins', sans-serif;
            font-size: .9rem;
            background: var(--card-bg, #fff);
            cursor: pointer;
            outline: none;
            transition: border-color .2s;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23007AFF' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 14px center;
            padding-right: 36px;
          }
          .odap-fab-select:focus { border-color: #007AFF; box-shadow: 0 0 0 3px rgba(0,122,255,.12); }

          /* Séparateur */
          .odap-fab-divider {
            height: 1px;
            background: var(--border, #E5E5EA);
            margin: 2px 0;
          }

          /* Bouton + Ajouter dans le panneau */
          .odap-fab-add-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px;
            background: linear-gradient(135deg, #007AFF, #5AC8FA);
            color: white;
            border: none;
            border-radius: 12px;
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
            font-size: .92rem;
            cursor: pointer;
            text-decoration: none;
            transition: transform .15s, box-shadow .15s;
          }
          .odap-fab-add-btn:active { transform: scale(.97); }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          /* ── Espace pour le FAB fixe en haut ── */
          .odap-container { padding: 70px 12px 24px; }

          /* ── Header ── */
          .odap-page-header { text-align: left; margin-bottom: 18px; }
          .odap-page-title  { font-size: 1.45rem; padding-right: 56px; }
          .odap-page-sub    { font-size: .82rem; }

          /* ── Barre de recherche ── */
          .odap-filters { padding: 14px; margin-bottom: 16px; border-radius: 12px; }
          .odap-search-bar { flex-direction: column; gap: 8px; margin-bottom: 10px; }
          .odap-search-input { width: 100%; min-width: unset; padding: 11px 14px; font-size: .88rem; }
          .odap-stats-row { flex-direction: row; align-items: center; gap: 8px; padding-top: 10px; }
          .odap-count { font-size: .85rem; }

          /* ── Grille produits ── */
          .odap-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .odap-card-img-wrap { height: 110px; }
          .odap-card-body { padding: 8px; }
          .odap-card-title { font-size: .8rem; -webkit-line-clamp: 1; }
          .odap-card-desc  { font-size: .7rem; -webkit-line-clamp: 1; }
          .odap-price { font-size: .88rem; }
          .odap-card-info { padding: 6px; margin-bottom: 7px; }
          .odap-card-actions { grid-template-columns: 1fr 1fr; gap: 4px; }
          .odap-btn-card { font-size: .62rem; padding: 7px 2px; }
          .odap-mini-imgs { display: none; }
          .odap-stock-lbl { font-size: .6rem; }
          .odap-stock-val { font-size: .8rem; }

        }

        @media (max-width: 480px) {
          .odap-container { padding: 66px 10px 20px; }
          .odap-page-title { font-size: 1.25rem; }
          .odap-grid { grid-template-columns: repeat(2, 1fr); gap: 6px; }
          .odap-card-img-wrap { height: 95px; }
          .odap-badge { font-size: .5rem; padding: 2px 5px; }
          .odap-card-title { font-size: .75rem; }
          .odap-card-desc { display: none; }
          .odap-price { font-size: .8rem; }
          .odap-btn-card { font-size: .58rem; padding: 6px 2px; }
          .odap-card-info { padding: 5px; gap: 4px; }
        }

        @media (max-width: 360px) {
          .odap-grid { gap: 6px; }
          .odap-card-img-wrap { height: 100px; }
          .odap-container { padding: 64px 8px 16px; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
        }
      `}</style>

      <div className="odap-container">

        {/* ── PAGE HEADER ── */}
        <div className="odap-page-header">
          <h1 className="odap-page-title">Mes Produits</h1>
          <p className="odap-page-sub">Gérez tous vos produits en un seul endroit</p>
        </div>

        {/* ── FILTERS ── */}
        <div className="odap-filters">
          <div className="odap-search-bar">
            <input
              ref={searchRef}
              className="odap-search-input"
              placeholder="🔍 Rechercher un produit… (Ctrl+K)"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            {/* Ces 3 selects sont cachés sur mobile (remplacés par le FAB) */}
            <select className="odap-filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="">Toutes catégories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select className="odap-filter-select" value={statFilter} onChange={e => setStatFilter(e.target.value)}>
              <option value="">Tous statuts</option>
              <option value="published">Publié</option>
              <option value="draft">Brouillon</option>
            </select>

            <select className="odap-filter-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="recent">Plus récents</option>
              <option value="name">Nom A-Z</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="stock">Stock</option>
            </select>
          </div>

          <div className="odap-stats-row">
            <span className="odap-count">{filtered.length} produit(s) trouvé(s)</span>
            {/* Ces boutons sont cachés sur mobile (remplacés par le FAB) */}
            <div className="odap-action-btns">
              <button className="odap-btn-action" onClick={exportToJSON}>📥 Exporter</button>
              <Link href="/dashboard" className="odap-btn-action">+ Ajouter</Link>
            </div>
          </div>
        </div>

        {/* ── GRID PRODUITS ── */}
        <div>
          {loading ? (
              <div className="odap-loading">
                <span className="odap-spinner">⏳</span>
                <p style={{ color: '#8E8E93', fontFamily: 'Poppins,sans-serif' }}>Chargement des produits…</p>
              </div>
            ) : (
              <div className="odap-grid">
                {filtered.length === 0 ? (
                  <div className="odap-empty">
                    <div className="odap-empty-icon">🛍️</div>
                    <h3 className="odap-empty-title">Aucun produit trouvé</h3>
                    <p className="odap-empty-text">Commencez par ajouter votre premier produit</p>
                    <button className="odap-btn-empty" onClick={() => router.push('/dashboard')}>+ Ajouter un produit</button>
                  </div>
                ) : filtered.map((produit, idx) => {
                  const badge = getBadgeInfo(produit);
                  return (
                    <div key={produit.id} className="odap-card" style={{ animationDelay: `${idx * 0.06}s` }}>
                      <div className="odap-card-img-wrap" onClick={() => { setDetail(produit); setDetailImg(0); }} style={{ cursor: 'pointer' }}>
                        <img
                          src={produit.mainImage || 'https://via.placeholder.com/300x250'}
                          className="odap-card-img"
                          alt={produit.nom}
                          onError={e => { e.target.src = 'https://via.placeholder.com/300x250?text=No+image'; }}
                        />
                        <div className="odap-card-badges">
                          <span className="odap-badge" style={{ background: badge.color }}>{badge.label}</span>
                          <span className="odap-badge odap-badge-cat">{produit.categorie}</span>
                        </div>
                        <div className="odap-card-zoom-hint">👁 Voir</div>
                      </div>

                      <div className="odap-card-body">
                        <h3 className="odap-card-title" onClick={() => { setDetail(produit); setDetailImg(0); }} style={{ cursor: 'pointer' }}>{produit.nom}</h3>
                        <p className="odap-card-desc">{produit.description}</p>

                        {produit.descriptionImages?.filter(Boolean).length > 0 && (
                          <div className="odap-mini-imgs">
                            {produit.descriptionImages.filter(Boolean).slice(0, 4).map((img, i) => (
                              <img key={i} src={img} className="odap-mini-img" alt="desc"/>
                            ))}
                          </div>
                        )}

                        <div className="odap-card-info">
                          <div className="odap-price">{produit.prix.toLocaleString('fr-FR')} FCFA</div>
                          <div>
                            <p className="odap-stock-lbl">Stock</p>
                            <p className={`odap-stock-val ${produit.stock > 0 ? 'odap-stock-ok' : 'odap-stock-no'}`}>
                              {produit.stock}
                            </p>
                          </div>
                        </div>

                        <div className="odap-card-actions">
                          <button className="odap-btn-card odap-btn-edit"   onClick={() => modifierProduit(produit.id)}>✏️ Modifier</button>
                          <button className="odap-btn-card odap-btn-delete" onClick={() => supprimerProduit(produit.id)}>🗑️ Supprimer</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </div>

      {/* ══════════════ FAB MOBILE — filtres + ajouter ══════════════
          Visible uniquement sur téléphone (≤ 768px via CSS)
      ══════════════════════════════════════════════════════════════ */}
      <div className="odap-fab-wrapper" ref={fabRef}>

        {/* Panneau déroulant — rendu uniquement si ouvert */}
        {fabOpen && (
          <div className="odap-fab-panel">
            <p className="odap-fab-panel-title">Filtres &amp; Actions</p>

            {/* Sélect catégorie */}
            <select
              className="odap-fab-select"
              value={catFilter}
              onChange={e => { setCatFilter(e.target.value); }}
            >
              <option value="">🏷️ Toutes catégories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Sélect statut */}
            <select
              className="odap-fab-select"
              value={statFilter}
              onChange={e => { setStatFilter(e.target.value); }}
            >
              <option value="">📋 Tous statuts</option>
              <option value="published">✓ Publié</option>
              <option value="draft">📝 Brouillon</option>
            </select>

            {/* Sélect tri */}
            <select
              className="odap-fab-select"
              value={sort}
              onChange={e => { setSort(e.target.value); }}
            >
              <option value="recent">🕐 Plus récents</option>
              <option value="name">🔤 Nom A-Z</option>
              <option value="price-asc">💰 Prix croissant</option>
              <option value="price-desc">💰 Prix décroissant</option>
              <option value="stock">📦 Stock</option>
            </select>

            <div className="odap-fab-divider" />

            {/* Bouton + Ajouter */}
            <Link
              href="/dashboard"
              className="odap-fab-add-btn"
              onClick={() => setFabOpen(false)}
            >
              ➕ Ajouter un produit
            </Link>
          </div>
        )}

        {/* Bouton FAB principal */}
        <button
          className={`odap-fab-btn${fabOpen ? ' open' : ''}`}
          onClick={() => setFabOpen(prev => !prev)}
          aria-label="Filtres et actions"
          aria-expanded={fabOpen}
        >
          {fabOpen ? '✕' : '⚙️'}
        </button>
      </div>

      {/* ══════════════ PANNEAU DÉTAIL PRODUIT ══════════════ */}
      {/* Overlay sombre */}
      <div
        className={`odap-detail-overlay${detail ? ' open' : ''}`}
        onClick={() => setDetail(null)}
      />

      {/* Panneau latéral / bottom-sheet */}
      <div className={`odap-detail-panel${detail ? ' open' : ''}`}>
        {detail && (() => {
          const allImgs = [detail.mainImage, ...(detail.descriptionImages?.filter(Boolean) || [])].filter(Boolean);
          const activeImg = allImgs[detailImg] || allImgs[0];
          const badge = getBadgeInfo(detail);
          const jr = detail.dateDraft ? joursRestants(detail.dateDraft) : null;

          return (
            <>
              {/* Header */}
              <div className="odap-detail-header">
                <h2 className="odap-detail-title">{detail.nom}</h2>
                <button className="odap-detail-close" onClick={() => setDetail(null)}>×</button>
              </div>

              {/* Corps scrollable */}
              <div className="odap-detail-body">

                {/* Image principale */}
                <img
                  src={activeImg}
                  className="odap-detail-main-img"
                  alt={detail.nom}
                  onError={e => { e.target.src = 'https://via.placeholder.com/600x400?text=Image+non+disponible'; }}
                />

                {/* Miniatures (toutes les images) */}
                {allImgs.length > 1 && (
                  <div className="odap-detail-thumbs">
                    {allImgs.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        className={`odap-detail-thumb${i === detailImg ? ' active' : ''}`}
                        alt={`img ${i + 1}`}
                        onClick={() => setDetailImg(i)}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ))}
                  </div>
                )}

                {/* Alerte brouillon */}
                {detail.statut === 'draft' && detail.dateDraft && (
                  <div className="odap-detail-draft-warn" style={{
                    background: jr > 0 ? 'rgba(255,149,0,.1)' : 'rgba(255,59,48,.1)',
                    borderLeft: `4px solid ${jr > 0 ? '#FF9500' : '#FF3B30'}`,
                    color: jr > 0 ? '#FF9500' : '#FF3B30',
                  }}>
                    {jr > 0
                      ? `⚠️ Brouillon — supprimé dans ${jr} jour${jr > 1 ? 's' : ''} si non réactivé`
                      : '🚫 Ce produit sera bientôt supprimé automatiquement'}
                  </div>
                )}

                {/* Stats */}
                <div className="odap-detail-stats">
                  <div className="odap-detail-stat">
                    <p className="odap-detail-stat-lbl">Prix</p>
                    <p className="odap-detail-stat-val" style={{ color: '#007AFF' }}>{detail.prix.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                  <div className="odap-detail-stat">
                    <p className="odap-detail-stat-lbl">Stock</p>
                    <p className="odap-detail-stat-val" style={{ color: detail.stock > 0 ? '#34C759' : '#FF3B30' }}>{detail.stock}</p>
                  </div>
                  <div className="odap-detail-stat">
                    <p className="odap-detail-stat-lbl">Catégorie</p>
                    <p className="odap-detail-stat-val" style={{ fontSize: '.95rem' }}>{detail.categorie}</p>
                  </div>
                  <div className="odap-detail-stat">
                    <p className="odap-detail-stat-lbl">Statut</p>
                    <p className="odap-detail-stat-val" style={{ fontSize: '.95rem', color: detail.statut === 'published' ? '#34C759' : '#FF9500' }}>
                      <span className="odap-badge" style={{ background: badge.color, fontSize: '.7rem' }}>{badge.label}</span>
                    </p>
                  </div>
                </div>

                {/* Description */}
                {detail.description && (
                  <div className="odap-detail-desc-section">
                    <p className="odap-detail-desc-title">📝 Description</p>
                    <p className="odap-detail-desc-text">{detail.description}</p>
                  </div>
                )}

                {/* Images de description */}
                {detail.descriptionImages?.filter(Boolean).length > 0 && (
                  <div className="odap-detail-desc-section">
                    <p className="odap-detail-desc-title">🖼️ Images de description</p>
                    <div className="odap-detail-desc-imgs">
                      {detail.descriptionImages.filter(Boolean).map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          className="odap-detail-desc-img"
                          alt={`desc ${i + 1}`}
                          onClick={() => setDetailImg(allImgs.indexOf(img) !== -1 ? allImgs.indexOf(img) : 0)}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Date création */}
                <p style={{ marginTop: 18, fontSize: '.78rem', color: '#8E8E93' }}>
                  📅 Créé le {new Date(detail.dateCreation).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>

              {/* Footer actions */}
              <div className="odap-detail-footer">
                <button
                  className="odap-detail-btn odap-detail-btn-edit"
                  onClick={() => { modifierProduit(detail.id); setDetail(null); }}
                >✏️ Modifier</button>
                <button
                  className="odap-detail-btn odap-detail-btn-delete"
                  onClick={() => { supprimerProduit(detail.id); setDetail(null); }}
                >🗑️ Supprimer</button>
              </div>
            </>
          );
        })()}
      </div>

      {/* ══════════════ BANNIÈRE DANGER PRODUITS ══════════════ */}
      {warnBanner && showWarnBanner && (
        <div style={{
          position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg,#FF9500,#FF6B00)', color: 'white',
          padding: '14px 18px', borderRadius: 14,
          boxShadow: '0 8px 32px rgba(255,149,0,.4)',
          zIndex: 1500, maxWidth: 620, width: 'calc(100% - 24px)',
          animation: 'odapSlideDown .5s ease', fontFamily: 'Poppins,sans-serif',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '2.4rem' }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 700 }}>
                ⏰ Produits en danger de suppression !
              </h3>
              <p style={{ margin: '0 0 4px', fontSize: '.9rem', opacity: .95 }}>
                <strong>{warnBanner.count} produit(s)</strong> supprimés dans{' '}
                <strong>{warnBanner.minJ}{warnBanner.minJ !== warnBanner.maxJ ? `–${warnBanner.maxJ}` : ''} jour{warnBanner.maxJ > 1 ? 's' : ''}</strong>.
              </p>
              <p style={{ margin: '0 0 14px', fontSize: '.82rem', opacity: .9 }}>
                Renouvelez votre abonnement pour les récupérer.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => router.push('/abonnement')} style={{ padding: '10px 20px', background: 'white', color: '#FF9500', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: '.85rem' }}>
                  👑 Renouveler maintenant
                </button>
                <button onClick={() => setShowWarnBanner(false)} style={{ padding: '10px 20px', background: 'rgba(255,255,255,.2)', color: 'white', border: '2px solid white', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: '.85rem' }}>
                  Plus tard
                </button>
              </div>
            </div>
            <button onClick={() => setShowWarnBanner(false)} style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: 'white', fontSize: '1.6rem', cursor: 'pointer', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        </div>
      )}

      {/* ══════════════ BANNIÈRE ABONNEMENT ══════════════ */}
      {subBanner && showSubBanner && (
        <div style={{
          position: 'fixed', bottom: 20, right: 12, background: 'white',
          padding: '16px 18px', borderRadius: 14,
          boxShadow: '0 8px 24px rgba(0,0,0,.15)', zIndex: 1500,
          maxWidth: 360, width: 'calc(100vw - 24px)',
          animation: 'odapSlideInR .5s ease', fontFamily: 'Poppins,sans-serif',
          borderLeft: `4px solid ${
            subBanner.type === 'active' ? '#34C759' :
            subBanner.type === 'expired' ? '#FF3B30' : '#FF9500'
          }`,
        }}>
          {subBanner.type === 'none' && (
            <div style={{ display: 'flex', alignItems: 'start', gap: 10 }}>
              <span style={{ fontSize: '1.8rem' }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 600 }}>Plan gratuit actif</h3>
                <p style={{ margin: '0 0 14px', color: '#666', fontSize: '.85rem' }}>Limite : 10 produits publiés max</p>
                <button onClick={() => router.push('/abonnement')} style={{ width: '100%', padding: 10, background: 'linear-gradient(135deg,#007AFF,#5AC8FA)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins,sans-serif' }}>📋 Voir les offres</button>
              </div>
              <button onClick={() => setShowSubBanner(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#999', lineHeight: 1 }}>×</button>
            </div>
          )}

          {subBanner.type === 'expired' && (
            <div style={{ display: 'flex', alignItems: 'start', gap: 10 }}>
              <span style={{ fontSize: '1.8rem' }}>🚫</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 600, color: '#FF3B30' }}>Abonnement expiré</h3>
                <p style={{ margin: '0 0 14px', color: '#666', fontSize: '.85rem' }}>Produits excédentaires en brouillon. Renouvelez pour les réactiver.</p>
                <button onClick={() => router.push('/abonnement')} style={{ width: '100%', padding: 10, background: '#FF3B30', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins,sans-serif' }}>🔄 Renouveler maintenant</button>
              </div>
              <button onClick={() => setShowSubBanner(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#999', lineHeight: 1 }}>×</button>
            </div>
          )}

          {subBanner.type === 'active' && (() => {
            const pct = Math.min(100, (nbPublies / subBanner.data.limite_produits) * 100);
            return (
              <div style={{ display: 'flex', alignItems: 'start', gap: 10 }}>
                <span style={{ fontSize: '1.8rem' }}>✅</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 600, color: '#34C759' }}>
                    Plan {subBanner.data.plan?.toUpperCase()} actif
                  </h3>
                  <p style={{ margin: '0 0 8px', color: '#666', fontSize: '.82rem' }}>
                    {nbPublies}/{subBanner.data.limite_produits} produits utilisés
                  </p>
                  <div style={{ background: '#f0f0f0', height: 7, borderRadius: 4, marginBottom: 10, overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(90deg,#34C759,#4CAF50)', height: '100%', width: `${pct}%`, transition: 'width .3s' }} />
                  </div>
                  <p style={{ margin: 0, color: '#999', fontSize: '.78rem' }}>
                    Expire dans {subBanner.joursRestants} jour{subBanner.joursRestants > 1 ? 's' : ''}
                  </p>
                  {subBanner.joursRestants <= 7 && (
                    <button onClick={() => router.push('/abonnement')} style={{ width: '100%', padding: 10, marginTop: 10, background: '#FF9500', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: '.85rem' }}>
                      ⏰ Renouveler maintenant
                    </button>
                  )}
                </div>
                <button onClick={() => setShowSubBanner(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#999', lineHeight: 1 }}>×</button>
              </div>
            );
          })()}
        </div>
      )}

      {/* ══════════════ TOASTS ══════════════ */}
      <div style={{ position: 'fixed', top: 72, right: 12, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320, width: 'calc(100vw - 24px)' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: 'white', padding: '14px 20px', borderRadius: 11,
            boxShadow: '0 8px 25px rgba(0,0,0,.14)',
            borderLeft: `4px solid ${t.type === 'success' ? '#34C759' : t.type === 'error' ? '#FF3B30' : t.type === 'warning' ? '#FF9500' : '#007AFF'}`,
            animation: 'odapSlideIn .5s ease', maxWidth: 340,
            fontFamily: 'Poppins,sans-serif', fontWeight: 500, color: '#333', fontSize: '.88rem',
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}