'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ShopCreationModal from '@/components/ShopCreationModal';

// ==================== CONFIGURATION ====================
const SUPABASE_URL = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';

const CLOUDINARY_CLOUD_NAME    = 'dnpeuymo0';
const CLOUDINARY_UPLOAD_PRESET = 'oda_unsigned_upload';

const CATEGORIES = [
  'Vetements','Electroniques','Decoration','Electromenager','Beaute & soin',
  'Accessoires','Bebe','jeux & jouets','Bricolage','Alimentation','Boissons',
  'Livre','Hygiene & sante','fitness','Animaux','Luxe','Bureau','peruque',
  'chaussures','telephone','outils','enfants','bijoux','autre','site-web',
  'voiture','formation',
];

const COLORS = [
  'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)',
  'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
  'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
  'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  'linear-gradient(135deg, #1E293B 0%, #475569 100%)',
  'linear-gradient(135deg, #DC2626 0%, #F87171 100%)',
];

// ==================== SVG ICONS ====================
const Icon = {
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Camera: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  FileText: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Image: ({ size = 28 } = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  Zap: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  ShoppingBag: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  Package: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  Pencil: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Palette: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  ),
  X: ({ size = 20 } = {}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Upload: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Folder: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  RefreshCw: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  Eye: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
};

// ==================== SUPABASE (lazy singleton) ====================
let _supabase = null;
function getSupabase() {
  if (!_supabase) {
    const { createClient } = require('@supabase/supabase-js');
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabase;
}

// ==================== PAGE ====================
export default function TableauDeBord() {
  const { user } = useAuth();

  // Formulaire
  const [productName, setProductName]         = useState('');
  const [productDesc, setProductDesc]         = useState('');
  const [productPrice, setProductPrice]       = useState('');
  const [productPromoPrice, setProductPromoPrice] = useState('');
  const [productInitialPrice, setProductInitialPrice] = useState('');
  const [productStock, setProductStock]       = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productStatus, setProductStatus]     = useState('published');

  // Images
  const [mainImage, setMainImage]             = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [descImages, setDescImages]           = useState([]);
  const [descPreviews, setDescPreviews]       = useState([]);

  // Édition
  const [produitEnEdition, setProduitEnEdition] = useState(null);

  // Modal formulaire
  const [formModalOpen, setFormModalOpen]     = useState(false);

  // Soumission
  const [submitLabel, setSubmitLabel]         = useState('Enregistrer le produit');
  const [submitDisabled, setSubmitDisabled]   = useState(false);

  // Personnalisation carte bienvenue
  const [welcomeStyle, setWelcomeStyle]       = useState({ color: COLORS[0], logo: null });
  const [selectedColor, setSelectedColor]     = useState(COLORS[0]);
  const [selectedLogo, setSelectedLogo]       = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl]   = useState(null);
  const [customizeOpen, setCustomizeOpen]     = useState(false);

  // KPI
  const [kpi, setKpi]                         = useState({ ca: 0, commandes: 0, produits: 0 });

  // Notifications
  const [toasts, setToasts]                   = useState([]);
  const [notifPermission, setNotifPermission] = useState('default');

  // Bannières
  const [subBanner, setSubBanner]             = useState(null);
  const [warnBanner, setWarnBanner]           = useState(null);
  const [showSubBanner, setShowSubBanner]     = useState(true);
  const [showWarnBanner, setShowWarnBanner]   = useState(true);

  // Shop creation modal
  const [shopCreationOpen, setShopCreationOpen] = useState(false);
  const [hasShopConfig, setHasShopConfig]     = useState(false);
  const [shopSlug, setShopSlug]               = useState('');
  const [linkCopied, setLinkCopied]           = useState(false);
  const [linkAnimating, setLinkAnimating]     = useState(false);

  const logoFileRef   = useRef(null);
  const mainImageRef  = useRef(null);
  const descInputRef  = useRef(null);

  // ==================== INIT ====================
  useEffect(() => {
    if (typeof Notification !== 'undefined') setNotifPermission(Notification.permission);
    const saved = JSON.parse(localStorage.getItem('oda_welcome_style') || '{}');
    if (saved.color) { setWelcomeStyle(s => ({ ...s, color: saved.color })); setSelectedColor(saved.color); }
    if (saved.logo)  { setWelcomeStyle(s => ({ ...s, logo: saved.logo })); setSelectedLogo(saved.logo); setLogoPreviewUrl(saved.logo); }
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      await verifierConfiguration();
      await initialiserSystemeAbonnement();
      await chargerStatistiques();
      await verifierEditionDepuisLocalStorage();
      await afficherStatutAbonnement();
      await verifierShopConfig();
      setTimeout(() => verifierAlertesAbonnement(), 5000);
    })();
    const interval = setInterval(verifierAlertesAbonnement, 60 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ==================== VÉRIFICATION CONFIG ====================
  async function verifierConfiguration() {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('produits').select('count').limit(1);
      if (error) {
        if (error.code === 'PGRST116') afficherNotification('⚠️ La table "produits" n\'existe pas.', 'warning');
        else if (error.message.includes('JWT')) afficherNotification('Erreur d\'authentification.', 'warning');
      }
    } catch (err) { console.error('❌ Erreur vérification:', err); }
  }

  // ==================== SYSTÈME ABONNEMENT ====================
  async function verifierQuotaAvantPublication(produitId = null) {
    try {
      const supabase = getSupabase();
      const { data: abo } = await supabase
        .from('abonnements').select('*').eq('user_id', user.id).single();

      let limite = 10, planActif = false;
      if (abo && new Date(abo.date_expiration) > new Date()) {
        limite = abo.limite_produits; planActif = true;
      }

      const { data: produitsPublies, error: countError } = await supabase
        .from('produits').select('id').eq('user_id', user.id).eq('statut', 'published');
      if (countError) throw countError;

      let nombrePublies = produitsPublies?.length || 0;
      if (produitId && produitsPublies?.find(p => p.id === produitId)) nombrePublies--;

      return { peutPublier: nombrePublies < limite, nombrePublies, limite, restant: limite - nombrePublies, planActif };
    } catch (err) {
      console.error('❌ Erreur quota:', err);
      return { peutPublier: false, nombrePublies: 0, limite: 10, restant: 10, planActif: false };
    }
  }

  async function gererProduitsExpires() {
    try {
      const supabase = getSupabase();
      const { data: abo, error: aboError } = await supabase
        .from('abonnements').select('*').eq('user_id', user.id).single();
      if (aboError && aboError.code !== 'PGRST116') return;
      if (!abo || new Date(abo.date_expiration) <= new Date()) {
        const { data: produitsPublies, error } = await supabase
          .from('produits').select('id, created_at').eq('user_id', user.id)
          .eq('statut', 'published').order('created_at', { ascending: false });
        if (error || !produitsPublies || produitsPublies.length <= 10) return;
        const ids = produitsPublies.slice(10).map(p => p.id);
        await supabase.from('produits').update({ statut: 'draft', date_draft: new Date().toISOString() }).in('id', ids);
        console.log(`📦 ${ids.length} produit(s) mis en brouillon`);
      }
    } catch (err) { console.error('❌ Erreur gestion expirés:', err); }
  }

  async function supprimerProduitsAnciens() {
    try {
      const supabase = getSupabase();
      const dateLimite = new Date();
      dateLimite.setDate(dateLimite.getDate() - 14);
      const { data, error } = await supabase
        .from('produits').select('id').eq('user_id', user.id).eq('statut', 'draft')
        .not('date_draft', 'is', null).lt('date_draft', dateLimite.toISOString());
      if (error || !data?.length) return;
      await supabase.from('produits').delete().in('id', data.map(p => p.id));
      afficherNotification(`${data.length} brouillon(s) anciens supprimés`, 'info');
    } catch (err) { console.error('❌ Erreur suppression anciens:', err); }
  }

  async function afficherAvertissementProduitsEnDanger() {
    try {
      const supabase = getSupabase();
      const date7  = new Date(); date7.setDate(date7.getDate() - 7);
      const date14 = new Date(); date14.setDate(date14.getDate() - 14);
      const { data, error } = await supabase
        .from('produits').select('id, date_draft').eq('user_id', user.id).eq('statut', 'draft')
        .not('date_draft', 'is', null).lt('date_draft', date7.toISOString()).gte('date_draft', date14.toISOString());
      if (error || !data?.length) return;
      const jours = data.map(p => 14 - Math.floor((Date.now() - new Date(p.date_draft)) / 86400000));
      setWarnBanner({ count: data.length, minJours: Math.min(...jours) });
    } catch (err) { console.error('❌ Erreur avertissement danger:', err); }
  }

  async function afficherStatutAbonnement() {
    try {
      const supabase = getSupabase();
      const { data: abo } = await supabase.from('abonnements').select('*').eq('user_id', user.id).single();
      const quota = await verifierQuotaAvantPublication();
      if (!abo || new Date(abo.date_expiration) <= new Date()) {
        setSubBanner({ type: 'free', quota });
      } else {
        const joursRestants = Math.ceil((new Date(abo.date_expiration) - new Date()) / 86400000);
        setSubBanner({ type: 'active', plan: abo.plan, quota, joursRestants });
      }
    } catch (err) { console.error('❌ Erreur statut abonnement:', err); }
  }

  // ── VÉRIFICATION CONFIG BOUTIQUE ──
  async function verifierShopConfig() {
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('parametres_boutique')
        .select('config')
        .eq('user_id', user.id)
        .single();
      if (data?.config?.identifiant?.slug) {
        setHasShopConfig(true);
        setShopSlug(data.config.identifiant.slug);
      } else {
        setHasShopConfig(false);
        setShopSlug('');
      }
    } catch {
      setHasShopConfig(false);
    }
  }

  function handleShopCreationDone(data) {
    if (data?.slug) {
      setShopSlug(data.slug);
      setHasShopConfig(true);
    }
    afficherNotification('✅ Boutique créée avec succès !', 'success');
  }

  function copierLienBoutique() {
    const url = `${window.location.origin}/dashboard/boutique?shop=${shopSlug}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkAnimating(true);
      setLinkCopied(true);
      setTimeout(() => {
        setLinkAnimating(false);
        setLinkCopied(false);
      }, 1500);
      afficherNotification('✅ Lien copié !', 'success');
    });
  }

  async function initialiserSystemeAbonnement() {
    await gererProduitsExpires();
    await supprimerProduitsAnciens();
    await afficherAvertissementProduitsEnDanger();
  }

  async function verifierAlertesAbonnement() {
    if (!user) return;
    try {
      const supabase = getSupabase();
      const { data: abo, error } = await supabase.from('abonnements').select('*').eq('user_id', user.id).single();
      if (abo && !error) {
        const j = Math.ceil((new Date(abo.date_expiration) - new Date()) / 86400000);
        if (j > 0 && j <= 7 && window.notificationManager)
          window.notificationManager.notifySubscriptionAlert({ type: 'expiring_soon', plan: abo.plan, daysLeft: j });
        if (j <= 0 && window.notificationManager)
          window.notificationManager.notifySubscriptionAlert({ type: 'expired', plan: abo.plan });
      }
      const quota = await verifierQuotaAvantPublication();
      if (quota.restant === 0 && window.notificationManager)
        window.notificationManager.notifySubscriptionAlert({ type: 'quota_reached', count: quota.nombrePublies, limit: quota.limite });
    } catch (err) { console.error('❌ Erreur alertes:', err); }
  }

  // ==================== PRODUITS ====================
  async function chargerStatistiques() {
    try {
      const supabase = getSupabase();
      const { data: prods } = await supabase.from('produits').select('*').eq('user_id', user.id);
      const { data: cmds }  = await supabase.from('commandes').select('*').eq('user_id', user.id);
      setKpi({
        ca:        cmds?.reduce((t, c) => t + (c.montant || 0), 0) || 0,
        commandes: cmds?.length  || 0,
        produits:  prods?.length || 0,
      });
    } catch (err) { console.error('❌ Erreur statistiques:', err); }
  }

  async function sauvegarderProduit(data) {
    const supabase = getSupabase();
    const { data: row, error } = await supabase.from('produits').insert([{ ...data, user_id: user.id }]).select().single();
    if (error) throw error;
    return row;
  }

  async function mettreAJourProduit(id, data) {
    const supabase = getSupabase();
    if (data.statut === 'published') data.date_draft = null;
    else if (data.statut === 'draft' && !data.date_draft) data.date_draft = new Date().toISOString();
    const { data: row, error } = await supabase.from('produits').update(data).eq('id', id).eq('user_id', user.id).select().single();
    if (error) throw error;
    return row;
  }

  async function verifierEditionDepuisLocalStorage() {
    const idProduit = localStorage.getItem('produit_en_edition');
    if (idProduit) {
      await chargerProduitPourEdition(parseInt(idProduit));
      localStorage.removeItem('produit_en_edition');
    }
  }

  async function chargerProduitPourEdition(id) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('produits').select('*').eq('id', id).eq('user_id', user.id).single();
      if (error) throw error;
      setProduitEnEdition(data);
      setProductName(data.nom);
      setProductDesc(data.description);
      setProductPrice(String(data.prix));
      setProductPromoPrice(data.prix_promo ? String(data.prix_promo) : '');
      setProductInitialPrice(data.prix_initial ? String(data.prix_initial) : '');
      setProductStock(String(data.stock));
      setProductCategory(data.categorie);
      setProductStatus(data.statut);
      if (data.main_image) { setMainImage(data.main_image); setMainImagePreview(data.main_image); }
      if (Array.isArray(data.description_images)) {
        const urls = data.description_images.slice(0, 3);
        setDescImages(urls); setDescPreviews(urls);
      }
      afficherNotification('Produit chargé pour édition', 'info');
      setFormModalOpen(true);
    } catch (err) {
      console.error('❌ Erreur chargement édition:', err);
      afficherNotification('Erreur lors du chargement du produit', 'error');
    }
  }

  // ==================== CLOUDINARY ====================
  async function uploaderImageVersCloudinary(file, nom) {
    if (!file || !(file instanceof File)) throw new Error('Fichier invalide');
    if (!file.type.startsWith('image/'))  throw new Error('Le fichier doit être une image');
    if (file.size > 10 * 1024 * 1024)    throw new Error("L'image ne doit pas dépasser 10 MB");
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    fd.append('folder', `produits/${user.id}`);
    fd.append('quality', 'auto:good');
    fd.append('fetch_format', 'auto');
    const resp = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
    if (!resp.ok) {
      const txt = await resp.text();
      let msg = `Erreur ${resp.status}`;
      try { msg = JSON.parse(txt).error?.message || msg; } catch {}
      throw new Error(`Cloudinary: ${msg}`);
    }
    const result = await resp.json();
    return result.secure_url;
  }

  // ==================== IMAGES ====================
  function gererImagePrincipale(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { afficherNotification('Veuillez sélectionner une image', 'error'); return; }
    if (file.size > 5 * 1024 * 1024)    { afficherNotification("L'image ne doit pas dépasser 5MB", 'error'); return; }
    const reader = new FileReader();
    reader.onload = ev => { setMainImage(file); setMainImagePreview(ev.target.result); afficherNotification('Image principale ajoutée', 'success'); };
    reader.readAsDataURL(file);
  }

  function supprimerImagePrincipale() {
    setMainImage(null); setMainImagePreview(null);
    if (mainImageRef.current) mainImageRef.current.value = '';
    afficherNotification('Image principale supprimée', 'info');
  }

  function gererImageDescription(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { afficherNotification('Veuillez sélectionner une image', 'error'); return; }
    if (file.size > 5 * 1024 * 1024)    { afficherNotification("L'image ne doit pas dépasser 5MB", 'error'); return; }
    if (descImages.length >= 3)          { afficherNotification('Maximum 3 images de description', 'warning'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      setDescImages(p   => [...p, file]);
      setDescPreviews(p => [...p, ev.target.result]);
      afficherNotification('Image ajoutée', 'success');
    };
    reader.readAsDataURL(file);
    if (descInputRef.current) descInputRef.current.value = '';
  }

  function supprimerImageDescription(idx) {
    setDescImages(p   => p.filter((_, i) => i !== idx));
    setDescPreviews(p => p.filter((_, i) => i !== idx));
    afficherNotification('Image supprimée', 'info');
  }

  // ==================== SOUMISSION ====================
  async function gererSoumissionFormulaire(e) {
    e.preventDefault();
    setSubmitDisabled(true);
    setSubmitLabel('Enregistrement...');
    try {
      const nom         = productName.trim();
      const description = productDesc.trim();
      const prix        = parseFloat(productPrice);
      const stock       = parseInt(productStock);
      const categorie   = productCategory;

      if (!nom || !description || !prix || !stock || !categorie) {
        afficherNotification('Veuillez remplir tous les champs obligatoires', 'error'); return;
      }
      if (!mainImage) {
        afficherNotification('Veuillez ajouter une image principale', 'error'); return;
      }

      let statutFinal = productStatus;
      if (productStatus === 'published') {
        const quota = await verifierQuotaAvantPublication(produitEnEdition?.id);
        if (!quota.peutPublier) {
          afficherNotification(`Limite atteinte : ${quota.nombrePublies}/${quota.limite} produits.`, 'error');
          const ok = window.confirm(
            `⚠️ Limite de ${quota.limite} produits publiés atteinte.\n\n` +
            `Enregistrer en BROUILLON ?\n→ OUI : sauvegardé mais non visible\n→ NON : annuler`
          );
          if (ok) { statutFinal = 'draft'; setProductStatus('draft'); afficherNotification('Produit enregistré en brouillon', 'info'); }
          else return;
        }
      }

      setSubmitLabel('Upload image principale...');
      const mainImageUrl = typeof mainImage === 'string'
        ? mainImage
        : await uploaderImageVersCloudinary(mainImage, 'main').catch(() => {
            afficherNotification("Erreur upload image principale", 'error'); return null;
          });
      if (!mainImageUrl) return;

      setSubmitLabel('Upload images description...');
      const descUrls = [];
      for (let i = 0; i < descImages.length; i++) {
        const img = descImages[i];
        if (!img) continue;
        if (typeof img === 'string') { descUrls.push(img); continue; }
        try { descUrls.push(await uploaderImageVersCloudinary(img, `desc_${i + 1}`)); }
        catch (err) { console.error(`❌ desc image ${i + 1}:`, err); }
      }

       const produitData = {
         nom, description, prix, stock, categorie,
         prix_promo: productPromoPrice && Number(productPromoPrice) > 0 && Number(productPromoPrice) < prix ? Number(productPromoPrice) : null,
         prix_initial: productInitialPrice && Number(productInitialPrice) > 0 ? Number(productInitialPrice) : null,
         statut: statutFinal,
         main_image: mainImageUrl,
         description_images: descUrls,
         date_draft: statutFinal === 'draft' ? new Date().toISOString() : null,
       };

      setSubmitLabel('Sauvegarde...');
      if (produitEnEdition) {
        await mettreAJourProduit(produitEnEdition.id, produitData);
        afficherNotification('Produit mis à jour avec succès', 'success');
      } else {
        await sauvegarderProduit(produitData);
        afficherNotification('Produit créé avec succès', 'success');

        // Vérifier si c'est le premier produit → ouvrir le modal de création boutique
        const supabase = getSupabase();
        const { data: shopData } = await supabase
          .from('parametres_boutique')
          .select('config')
          .eq('user_id', user.id)
          .single();
        if (!shopData?.config?.identifiant?.slug) {
          setTimeout(() => setShopCreationOpen(true), 800);
        }
      }

      document.dispatchEvent(new CustomEvent('product:created'));
      await chargerStatistiques();
      await afficherStatutAbonnement();
      setFormModalOpen(false);
      reinitialiserFormulaire();
    } catch (err) {
      console.error('❌ Erreur soumission:', err);
      afficherNotification('Erreur : ' + err.message, 'error');
    } finally {
      setSubmitDisabled(false);
      setSubmitLabel('Enregistrer le produit');
    }
  }

  function reinitialiserFormulaire() {
    setProductName(''); setProductDesc(''); setProductPrice('');
    setProductPromoPrice(''); setProductInitialPrice('');
    setProductStock(''); setProductCategory(''); setProductStatus('published');
    setMainImage(null); setMainImagePreview(null);
    setDescImages([]); setDescPreviews([]);
    setProduitEnEdition(null);
    setFormModalOpen(false);
    if (mainImageRef.current) mainImageRef.current.value = '';
    if (descInputRef.current) descInputRef.current.value = '';
  }

  // ==================== PERSONNALISATION ====================
  function sauvegarderPersonnalisation() {
    const style = { color: selectedColor, logo: selectedLogo };
    localStorage.setItem('oda_welcome_style', JSON.stringify(style));
    setWelcomeStyle(style);
    setCustomizeOpen(false);
    afficherNotification('Personnalisation sauvegardée', 'success');
  }

  function gererLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { afficherNotification('Image trop lourde (max 2MB)', 'error'); return; }
    const reader = new FileReader();
    reader.onload = ev => { setSelectedLogo(ev.target.result); setLogoPreviewUrl(ev.target.result); };
    reader.readAsDataURL(file);
  }

  function reinitialiserLogo() {
    setSelectedLogo(null); setLogoPreviewUrl(null);
    if (logoFileRef.current) logoFileRef.current.value = '';
  }

  // ==================== NOTIFICATIONS ====================
  function afficherNotification(message, type = 'info') {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }

  async function gererNotificationPermission() {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      setNotifPermission(result);
      if (result === 'granted') afficherNotification('Notifications activées', 'success');
    } else if (Notification.permission === 'granted') {
      afficherNotification('Notifications déjà activées', 'success');
    } else {
      alert('Notifications bloquées. Autorisez-les dans les paramètres.');
    }
  }

  // ==================== DÉRIVÉS ====================
  const previewTitle = productName || 'Nom du produit';
  const previewDesc  = productDesc  || 'La description apparaîtra ici...';
  const hasPromoPreview = productPromoPrice && Number(productPromoPrice) > 0 && Number(productPromoPrice) < Number(productPrice);

  // Fill animation progress
  const fillSteps = [
    !!mainImage,
    productName.trim().length > 0,
    productDesc.trim().length > 0,
    parseFloat(productPrice) > 0,
    parseInt(productStock) > 0,
    productCategory !== '',
  ];
  const fillPercent = Math.round((fillSteps.filter(Boolean).length / fillSteps.length) * 100);

  const nomUtilisateur =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.name         ||
    user?.user_metadata?.full_name    ||
    user?.email?.split('@')[0]        ||
    'Admin';
  const initialeAvatar = nomUtilisateur.charAt(0).toUpperCase();

  const notifColor =
    notifPermission === 'granted' ? '#059669' :
    notifPermission === 'denied'  ? '#DC2626' : '#D97706';

  // ==================== RENDU ====================
  return (
    <>
      <style jsx global>{`
        /* ── DESIGN TOKENS ── */
        :root {
          --oda-indigo:    #4F46E5;
          --oda-indigo-dk: #3730A3;
          --oda-indigo-lt: #EEF2FF;
          --oda-slate:     #0F172A;
          --oda-slate-2:   #1E293B;
          --oda-muted:     #64748B;
          --oda-border:    #E2E8F0;
          --oda-surface:   #F8FAFC;
          --oda-white:     #FFFFFF;
          --oda-success:   #059669;
          --oda-error:     #DC2626;
          --oda-warning:   #D97706;
          --oda-amber:     #F59E0B;
          --oda-radius:    12px;
          --oda-radius-lg: 18px;
          --oda-shadow:    0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.05);
          --oda-shadow-md: 0 4px 12px rgba(0,0,0,.08), 0 8px 32px rgba(0,0,0,.06);
          --oda-shadow-lg: 0 8px 24px rgba(0,0,0,.1), 0 20px 48px rgba(0,0,0,.08);
          --oda-font:      'Poppins', sans-serif;
        }

        /* ── ABONNEMENT BTN ── */
        .oda-btn-abo {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 8px 16px;
          background: linear-gradient(135deg, var(--oda-amber) 0%, #F97316 100%);
          color: white; border: none; border-radius: 50px;
          font-family: var(--oda-font); font-weight: 600; font-size: .82rem;
          text-decoration: none; cursor: pointer;
          box-shadow: 0 2px 8px rgba(245,158,11,.3);
          transition: transform .2s, box-shadow .2s;
          letter-spacing: .01em;
        }
        .oda-btn-abo:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(245,158,11,.4); }

        /* ── NOTIFICATION BTN ── */
        .oda-notif-btn {
          width: 38px; height: 38px; border-radius: 10px; border: 1.5px solid var(--oda-border);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          background: var(--oda-white); transition: border-color .2s, background .2s;
          color: var(--oda-muted);
        }
        .oda-notif-btn:hover { border-color: var(--oda-indigo); color: var(--oda-indigo); }
        .oda-notif-btn.active { background: var(--oda-indigo); border-color: var(--oda-indigo); color: white; }

        /* ── SUB-HEADER ── */
        .oda-sub-header {
          display: flex; justify-content: flex-end; align-items: center;
          gap: 10px; padding: 10px 28px;
          background: var(--oda-white);
          border-bottom: 1px solid var(--oda-border);
        }

        /* ── BOUTIQUE LINK ICON ── */
        .oda-btn-shop-icon {
          width: 38px; height: 38px; border-radius: 10px; border: 1.5px solid var(--oda-border);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          background: var(--oda-white); transition: border-color .2s, background .2s;
          color: var(--oda-muted); position: relative;
        }
        .oda-btn-shop-icon:hover { border-color: var(--oda-indigo); color: var(--oda-indigo); }
        .oda-btn-shop-icon.copied { background: var(--oda-success); border-color: var(--oda-success); color: white; }
        @keyframes shopIconPop { 0%{transform:scale(1)} 50%{transform:scale(1.25)} 100%{transform:scale(1)} }
        .oda-btn-shop-icon.animate { animation: shopIconPop .35s ease; }

        /* ── DASHBOARD GRID ── */
        .oda-dash {
          display: grid;
          grid-template-columns: 272px 1fr 300px;
          gap: 20px;
          padding: 20px 24px;
          max-width: 1920px;
          margin: 0 auto;
        }

        /* ── SIDEBARS ── */
        .oda-sidebar-l, .oda-sidebar-r {
          background: var(--oda-white);
          padding: 18px;
          border-radius: var(--oda-radius-lg);
          box-shadow: var(--oda-shadow);
          border: 1px solid var(--oda-border);
          position: sticky; top: calc(64px + 49px + 20px);
          height: fit-content; max-height: calc(100vh - 155px);
          overflow-y: auto;
        }

        /* ── SECTION LABEL ── */
        .oda-section-label {
          color: var(--oda-muted); font-size: .72rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: .08em;
          margin: 18px 0 10px; display: flex; align-items: center; gap: 6px;
        }
        .oda-section-label::before {
          content: ''; display: block; width: 3px; height: 11px;
          background: var(--oda-indigo); border-radius: 2px;
        }

        /* ── KPI CARDS ── */
        .oda-kpi-card {
          display: flex; align-items: center; gap: 12px;
          padding: 13px 14px;
          border-radius: var(--oda-radius);
          border: 1px solid var(--oda-border);
          margin-bottom: 8px;
          transition: border-color .2s, transform .2s, box-shadow .2s;
          cursor: default;
        }
        .oda-kpi-card:hover {
          border-color: var(--oda-indigo);
          transform: translateX(3px);
          box-shadow: 0 2px 8px rgba(79,70,229,.08);
        }
        .oda-kpi-icon {
          width: 42px; height: 42px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .oda-kpi-icon.green  { background: #D1FAE5; color: var(--oda-success); }
        .oda-kpi-icon.indigo { background: var(--oda-indigo-lt); color: var(--oda-indigo); }
        .oda-kpi-icon.amber  { background: #FEF3C7; color: var(--oda-amber); }
        .oda-kpi-label { color: var(--oda-muted); font-size: .75rem; font-weight: 500; margin: 0 0 1px; }
        .oda-kpi-value { color: var(--oda-slate); font-size: 1.1rem; font-weight: 700; margin: 0; }

        /* ── WELCOME CARD ── */
        .oda-welcome-card {
          position: relative; display: flex; align-items: center; gap: 11px;
          border-radius: 14px; padding: 14px 15px; overflow: hidden;
          margin-bottom: 6px;
        }
        .oda-welcome-card::after {
          content: ''; position: absolute; right: -18px; top: -18px;
          width: 72px; height: 72px; border-radius: 50%;
          background: rgba(255,255,255,.1); pointer-events: none;
        }
        .oda-welcome-av {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255,255,255,.25);
          border: 2px solid rgba(255,255,255,.4);
          display: flex; align-items: center; justify-content: center;
          font-size: .95rem; font-weight: 700; color: white;
          flex-shrink: 0; overflow: hidden;
        }
        .oda-welcome-info { flex: 1; min-width: 0; }
        .oda-welcome-tag  { font-size: .65rem; color: rgba(255,255,255,.75); text-transform: uppercase; letter-spacing: .08em; }
        .oda-welcome-name { font-size: .88rem; font-weight: 700; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .oda-welcome-edit {
          background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.3);
          border-radius: 8px; width: 28px; height: 28px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: white; transition: background .2s; flex-shrink: 0; z-index: 1;
        }
        .oda-welcome-edit:hover { background: rgba(255,255,255,.32); }

        /* ── MODAL ── */
        .oda-modal-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(15,23,42,.5); z-index: 9999;
          align-items: center; justify-content: center;
          backdrop-filter: blur(6px);
        }
        .oda-modal-overlay.open { display: flex; }
        .oda-modal {
          background: var(--oda-white); border-radius: var(--oda-radius-lg);
          padding: 24px; width: 360px; max-width: 92vw;
          box-shadow: var(--oda-shadow-lg);
          border: 1px solid var(--oda-border);
          animation: odaModalPop .22s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes odaModalPop { from { transform: scale(.92) translateY(12px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        .oda-modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
        .oda-modal-head h3 { margin: 0; font-size: 1rem; font-weight: 700; color: var(--oda-slate); display: flex; align-items: center; gap: 8px; }
        .oda-modal-close {
          background: var(--oda-surface); border: 1px solid var(--oda-border);
          border-radius: 8px; width: 30px; height: 30px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: var(--oda-muted); transition: background .2s, color .2s;
        }
        .oda-modal-close:hover { background: #FEE2E2; color: var(--oda-error); border-color: #FECACA; }
        .oda-modal-section { margin-bottom: 20px; }
        .oda-modal-label { display: block; font-size: .78rem; font-weight: 600; color: var(--oda-muted); margin-bottom: 10px; text-transform: uppercase; letter-spacing: .05em; }
        .oda-logo-area { display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .oda-logo-prev {
          width: 64px; height: 64px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; border: 2px solid var(--oda-border);
          font-size: 1.6rem; background: var(--oda-indigo-lt); color: var(--oda-indigo);
        }
        .oda-logo-actions { display: flex; gap: 8px; }
        .oda-logo-upload-btn {
          padding: 6px 12px; background: var(--oda-indigo); color: white;
          border-radius: 8px; font-size: .76rem; font-weight: 600;
          cursor: pointer; display: inline-flex; align-items: center; gap: 5px;
          font-family: var(--oda-font); transition: background .2s;
        }
        .oda-logo-upload-btn:hover { background: var(--oda-indigo-dk); }
        .oda-logo-reset-btn {
          padding: 6px 12px; background: var(--oda-surface); color: var(--oda-muted);
          border: 1px solid var(--oda-border); border-radius: 8px;
          font-size: .76rem; font-weight: 600; cursor: pointer;
          font-family: var(--oda-font); display: inline-flex; align-items: center; gap: 5px;
          transition: background .2s;
        }
        .oda-logo-reset-btn:hover { background: var(--oda-border); }
        .oda-logo-hint { font-size: .7rem; color: var(--oda-muted); }
        .oda-color-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
        .oda-color-swatch {
          height: 38px; border-radius: 9px; cursor: pointer;
          border: 2.5px solid transparent;
          transition: transform .2s, border-color .2s;
          position: relative;
        }
        .oda-color-swatch:hover { transform: scale(1.07); }
        .oda-color-swatch.active { border-color: var(--oda-slate); transform: scale(1.07); }
        .oda-color-custom {
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg,#CBD5E1,#94A3B8);
          font-size: 1rem; color: white; overflow: hidden;
        }
        .oda-color-custom input[type="color"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
        .oda-modal-save {
          width: 100%; padding: 12px;
          background: linear-gradient(135deg,var(--oda-indigo),var(--oda-indigo-dk));
          color: white; border: none; border-radius: 10px;
          font-family: var(--oda-font); font-weight: 600; font-size: .9rem;
          cursor: pointer; transition: opacity .2s, transform .2s;
          box-shadow: 0 4px 12px rgba(79,70,229,.3);
        }
        .oda-modal-save:hover { opacity: .92; transform: translateY(-1px); }

        /* ── MAIN FORM AREA ── */
        .oda-main {
          background: var(--oda-white);
          padding: 28px;
          border-radius: var(--oda-radius-lg);
          box-shadow: var(--oda-shadow);
          border: 1px solid var(--oda-border);
        }
        .oda-page-header { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--oda-border); }
        .oda-page-eyebrow { font-size: .72rem; font-weight: 600; color: var(--oda-indigo); text-transform: uppercase; letter-spacing: .1em; margin-bottom: 4px; }
        .oda-page-title {
          font-size: 1.55rem; font-weight: 800;
          color: var(--oda-slate);
          margin: 0 0 4px; letter-spacing: -.02em;
        }
        .oda-page-sub { color: var(--oda-muted); font-size: .88rem; margin: 0; }

        /* Edit badge */
        .oda-edit-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #FFF7ED; color: #C2410C; border: 1px solid #FED7AA;
          border-radius: 50px; padding: 4px 12px; font-size: .76rem; font-weight: 600;
          margin-bottom: 14px;
        }

        /* ── FORM ── */
        .oda-form { display: flex; flex-direction: column; gap: 16px; }
        .oda-fsection {
          padding: 20px;
          background: var(--oda-surface);
          border-radius: var(--oda-radius);
          border: 1px solid var(--oda-border);
          transition: border-color .2s;
        }
        .oda-fsection:focus-within { border-color: rgba(79,70,229,.3); }
        .oda-fsection-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .oda-fsection-num {
          width: 26px; height: 26px; border-radius: 8px;
          background: var(--oda-indigo-lt); color: var(--oda-indigo);
          font-size: .76rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .oda-ftitle { font-size: .95rem; font-weight: 700; color: var(--oda-slate); margin: 0; }
        .oda-fdesc  { color: var(--oda-muted); font-size: .82rem; margin: 0 0 14px; }

        .oda-fgroup { margin-bottom: 14px; }
        .oda-fgroup:last-child { margin-bottom: 0; }
        .oda-flabel {
          display: block; font-weight: 600; color: var(--oda-slate-2);
          margin-bottom: 5px; font-size: .82rem;
        }
        .oda-req { color: var(--oda-error); font-weight: 700; }
        .oda-finput, .oda-ftextarea, .oda-fselect {
          width: 100%; padding: 11px 13px;
          border: 1.5px solid var(--oda-border); border-radius: 10px;
          font-family: var(--oda-font); font-size: .88rem;
          background: var(--oda-white); color: var(--oda-slate);
          transition: border-color .2s, box-shadow .2s; outline: none;
          box-sizing: border-box;
        }
        .oda-finput::placeholder, .oda-ftextarea::placeholder { color: #CBD5E1; }
        .oda-finput:focus, .oda-ftextarea:focus, .oda-fselect:focus {
          border-color: var(--oda-indigo);
          box-shadow: 0 0 0 3px rgba(79,70,229,.1);
        }
        .oda-ftextarea { min-height: 108px; resize: vertical; }
        .oda-fgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        /* ── UPLOAD ZONE ── */
        .oda-upload-zone {
          border: 2px dashed var(--oda-border); border-radius: var(--oda-radius);
          padding: 32px 20px; text-align: center; background: var(--oda-white);
          cursor: pointer; transition: border-color .25s, background .25s;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .oda-upload-zone:hover { border-color: var(--oda-indigo); background: var(--oda-indigo-lt); }
        .oda-upload-zone:hover .oda-upload-icon-wrap { background: white; }
        .oda-upload-icon-wrap {
          width: 60px; height: 60px; border-radius: 14px;
          background: var(--oda-surface);
          display: flex; align-items: center; justify-content: center;
          color: var(--oda-muted); margin-bottom: 4px;
          transition: background .25s;
        }
        .oda-upload-text { font-weight: 600; color: var(--oda-indigo); font-size: .88rem; margin: 0; }
        .oda-upload-hint { font-size: .78rem; color: var(--oda-muted); margin: 0; }

        .oda-img-preview { position: relative; border-radius: var(--oda-radius); overflow: hidden; max-width: 360px; margin: 12px auto 0; box-shadow: var(--oda-shadow-md); }
        .oda-img-preview img { width: 100%; height: 230px; object-fit: cover; display: block; }
        .oda-remove-btn {
          position: absolute; top: 10px; right: 10px;
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(15,23,42,.65); backdrop-filter: blur(4px);
          color: white; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background .2s;
        }
        .oda-remove-btn:hover { background: var(--oda-error); }

        /* ── DESC IMAGES ── */
        .oda-desc-images-wrap {
          margin-top: 16px; padding: 16px;
          background: var(--oda-white); border-radius: 10px;
          border: 1.5px dashed var(--oda-border);
        }
        .oda-desc-images-title { font-size: .88rem; font-weight: 700; color: var(--oda-slate); margin: 0 0 3px; }
        .oda-desc-images-hint  { font-size: .78rem; color: var(--oda-muted); margin: 0 0 12px; }
        .oda-desc-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-start; }
        .oda-desc-thumb {
          position: relative; width: 80px; height: 80px;
          border-radius: 10px; overflow: hidden;
          border: 1.5px solid var(--oda-indigo); flex-shrink: 0;
          animation: odaThumbIn .25s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes odaThumbIn { from { transform: scale(.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .oda-desc-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .oda-desc-thumb-num {
          position: absolute; bottom: 4px; left: 4px;
          width: 16px; height: 16px; border-radius: 4px;
          background: rgba(15,23,42,.55); color: white;
          font-size: .6rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          pointer-events: none;
        }
        .oda-desc-remove {
          position: absolute; top: 4px; right: 4px;
          width: 20px; height: 20px; border-radius: 5px;
          background: rgba(15,23,42,.65); backdrop-filter: blur(4px);
          color: white; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; z-index: 10;
          transition: background .2s;
        }
        .oda-desc-remove:hover { background: var(--oda-error); }
        .oda-desc-add-btn {
          width: 80px; height: 80px; border-radius: 10px;
          border: 1.5px dashed var(--oda-border); background: var(--oda-surface);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; gap: 4px; color: var(--oda-muted); flex-shrink: 0;
          transition: border-color .2s, background .2s, color .2s;
          font-family: var(--oda-font);
        }
        .oda-desc-add-btn:hover { border-color: var(--oda-indigo); background: var(--oda-indigo-lt); color: var(--oda-indigo); }
        .oda-desc-add-btn:disabled { opacity: .4; cursor: not-allowed; }
        .oda-desc-add-icon { font-size: 1.5rem; line-height: 1; font-weight: 300; }
        .oda-desc-add-label { font-size: .65rem; font-weight: 600; }

        /* ── RADIO ── */
        .oda-radio-group { display: flex; flex-direction: column; gap: 10px; }
        .oda-radio-item input[type="radio"] { display: none; }
        .oda-radio-label {
          display: flex; align-items: center; gap: 13px; padding: 14px 16px;
          background: var(--oda-white); border: 1.5px solid var(--oda-border);
          border-radius: var(--oda-radius); cursor: pointer;
          transition: border-color .2s, background .2s;
        }
        .oda-radio-item input[type="radio"]:checked + .oda-radio-label {
          border-color: var(--oda-indigo);
          background: var(--oda-indigo-lt);
        }
        .oda-radio-custom {
          width: 18px; height: 18px; border: 2px solid var(--oda-border);
          border-radius: 50%; position: relative; flex-shrink: 0;
          transition: border-color .2s;
        }
        .oda-radio-item input[type="radio"]:checked + .oda-radio-label .oda-radio-custom {
          border-color: var(--oda-indigo);
        }
        .oda-radio-item input[type="radio"]:checked + .oda-radio-label .oda-radio-custom::after {
          content: ''; position: absolute; top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: 8px; height: 8px; background: var(--oda-indigo); border-radius: 50%;
        }
        .oda-radio-badge {
          display: inline-block; padding: 2px 8px;
          border-radius: 50px; font-size: .68rem; font-weight: 600;
          margin-left: 6px;
        }
        .oda-radio-badge.published { background: #D1FAE5; color: #065F46; }
        .oda-radio-badge.draft     { background: #FEF3C7; color: #92400E; }
        .oda-radio-label p { font-size: .8rem; color: var(--oda-muted); margin: 2px 0 0; }
        .oda-radio-label strong { font-size: .88rem; color: var(--oda-slate); }

        /* ── FORM ACTIONS ── */
        .oda-form-actions {
          display: flex; gap: 12px; justify-content: flex-end;
          margin-top: 16px; padding-top: 18px; border-top: 1px solid var(--oda-border);
        }
        .oda-btn-primary, .oda-btn-secondary {
          padding: 11px 24px; border: none; border-radius: 10px;
          font-family: var(--oda-font); font-size: .88rem; font-weight: 600;
          cursor: pointer; transition: transform .2s, box-shadow .2s, opacity .2s;
          display: inline-flex; align-items: center; gap: 7px;
        }
        .oda-btn-primary {
          background: linear-gradient(135deg,var(--oda-indigo),var(--oda-indigo-dk));
          color: white; box-shadow: 0 4px 12px rgba(79,70,229,.3);
        }
        .oda-btn-primary:hover   { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(79,70,229,.4); }
        .oda-btn-primary:active  { transform: translateY(0); }
        .oda-btn-primary:disabled { opacity: .6; cursor: not-allowed; transform: none; }
        .oda-btn-secondary {
          background: var(--oda-white); color: var(--oda-muted);
          border: 1.5px solid var(--oda-border);
        }
        .oda-btn-secondary:hover { background: var(--oda-surface); border-color: #CBD5E1; }

        /* ── PREVIEW CARD ── */
        .oda-preview-card {
          background: var(--oda-surface); border-radius: var(--oda-radius);
          overflow: hidden; border: 1px solid var(--oda-border);
        }
        .oda-preview-img  { width: 100%; height: 178px; background: #E2E8F0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .oda-preview-img-ph { text-align: center; color: #94A3B8; }
        .oda-preview-img-ph svg { opacity: .5; }
        .oda-preview-img-ph p { font-size: .75rem; margin: 6px 0 0; }
        .oda-preview-body { padding: 13px; background: var(--oda-white); }
        .oda-preview-title { font-size: .95rem; font-weight: 700; margin-bottom: 4px; color: var(--oda-slate); }
        .oda-preview-text  { font-size: .78rem; color: var(--oda-muted); margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .oda-preview-desc-imgs { display: grid; grid-template-columns: repeat(3,1fr); gap: 5px; margin-bottom: 10px; }
        .oda-preview-desc-imgs div { border-radius: 6px; overflow: hidden; aspect-ratio: 1; }
        .oda-preview-desc-imgs img { width: 100%; height: 100%; object-fit: cover; }
        .oda-preview-price { font-size: 1.2rem; font-weight: 800; color: var(--oda-indigo); letter-spacing: -.01em; }

        /* ── SIDEBAR PREVIEW HEADER ── */
        .oda-preview-header {
          display: flex; align-items: center; gap: 6px; margin-bottom: 12px;
          padding-bottom: 12px; border-bottom: 1px solid var(--oda-border);
        }
        .oda-preview-header-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--oda-indigo); }
        .oda-preview-header span { font-size: .74rem; font-weight: 600; color: var(--oda-muted); text-transform: uppercase; letter-spacing: .06em; }

        /* ── TOASTS ── */
        @keyframes odaSlideIn      { from { transform: translateX(360px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes odaSlideDown    { from { transform: translate(-50%,-80px); opacity: 0; } to { transform: translate(-50%,0); opacity: 1; } }
        @keyframes odaSlideInRight { from { transform: translateX(360px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        .oda-toast {
          background: var(--oda-white); padding: 12px 16px; border-radius: 10px;
          box-shadow: var(--oda-shadow-md); border: 1px solid var(--oda-border);
          animation: odaSlideIn .3s cubic-bezier(.34,1.56,.64,1);
          max-width: 320px; font-family: var(--oda-font);
          font-weight: 500; font-size: .84rem; color: var(--oda-slate);
          display: flex; align-items: center; gap: 10px;
        }
        .oda-toast-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        /* ── PRODUCT DRAWER ── */
        .oda-drawer-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(15,23,42,.55); z-index: 9000;
          backdrop-filter: blur(4px);
        }
        .oda-drawer-overlay.open { display: block; }

        .oda-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 620px; max-width: 100vw;
          background: var(--oda-white);
          box-shadow: -8px 0 48px rgba(0,0,0,.15);
          display: flex; flex-direction: column;
          transform: translateX(110%);
          transition: transform .38s cubic-bezier(.32,1,.56,1);
          z-index: 9001; overflow: hidden;
        }
        .oda-drawer.open { transform: translateX(0); }

        .oda-drawer-fill-bar {
          height: 4px; background: var(--oda-border); flex-shrink: 0;
          position: relative; overflow: hidden;
        }
        .oda-drawer-fill-progress {
          position: absolute; inset: 0 auto 0 0;
          background: linear-gradient(90deg, #4F46E5, #818CF8, #A855F7);
          background-size: 200% 100%;
          border-radius: 0 3px 3px 0;
          transition: width .5s cubic-bezier(.34,1.56,.64,1);
          animation: odaFillShimmer 2.5s linear infinite;
        }
        @keyframes odaFillShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .oda-drawer-fill-badge {
          position: absolute; right: 14px; top: 12px;
          font-size: .72rem; font-weight: 700;
          padding: 3px 10px; border-radius: 50px;
          background: var(--oda-indigo-lt); color: var(--oda-indigo);
          border: 1px solid rgba(79,70,229,.2);
          transition: all .3s;
        }
        .oda-drawer-fill-badge.complete {
          background: #D1FAE5; color: #065F46; border-color: rgba(5,150,105,.2);
        }

        .oda-drawer-head {
          display: flex; align-items: center; gap: 14px;
          padding: 18px 22px 16px;
          border-bottom: 1px solid var(--oda-border);
          position: relative; flex-shrink: 0;
        }
        .oda-drawer-icon {
          width: 40px; height: 40px; border-radius: 11px;
          background: var(--oda-indigo-lt); color: var(--oda-indigo);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .oda-drawer-head h2 { margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--oda-slate); }
        .oda-drawer-head p  { margin: 2px 0 0; font-size: .78rem; color: var(--oda-muted); }
        .oda-drawer-close {
          margin-left: auto; background: var(--oda-surface); border: 1px solid var(--oda-border);
          border-radius: 9px; width: 32px; height: 32px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: var(--oda-muted); transition: background .2s, color .2s, border-color .2s;
          flex-shrink: 0;
        }
        .oda-drawer-close:hover { background: #FEE2E2; color: var(--oda-error); border-color: #FECACA; }

        .oda-drawer-body {
          flex: 1; overflow-y: auto; padding: 22px;
          scroll-behavior: smooth;
        }
        .oda-drawer-body::-webkit-scrollbar { width: 5px; }
        .oda-drawer-body::-webkit-scrollbar-track { background: transparent; }
        .oda-drawer-body::-webkit-scrollbar-thumb { background: var(--oda-border); border-radius: 4px; }

        .oda-drawer-footer {
          padding: 14px 22px; border-top: 1px solid var(--oda-border);
          display: flex; gap: 10px; justify-content: flex-end; flex-shrink: 0;
          background: var(--oda-surface);
        }

        /* Steps indicator inside drawer */
        .oda-fill-steps {
          display: flex; gap: 6px; align-items: center;
          padding: 0 22px 14px; flex-wrap: wrap;
        }
        .oda-fill-step {
          display: flex; align-items: center; gap: 5px;
          font-size: .7rem; font-weight: 600;
          padding: 3px 9px; border-radius: 50px;
          border: 1px solid var(--oda-border);
          color: var(--oda-muted); background: var(--oda-surface);
          transition: all .3s;
        }
        .oda-fill-step.done {
          border-color: rgba(5,150,105,.25); background: #D1FAE5; color: #065F46;
        }
        .oda-fill-step-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--oda-border); flex-shrink: 0; transition: background .3s;
        }
        .oda-fill-step.done .oda-fill-step-dot { background: #059669; }

        /* Slider */
        .oda-slider-wrap { margin-top: 6px; }
        .oda-slider-val  {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-bottom: 8px;
        }
        .oda-slider-val strong { font-size: 1.15rem; font-weight: 800; color: var(--oda-indigo); }
        .oda-slider-val span   { font-size: .72rem; color: var(--oda-muted); }
        input[type="range"].oda-slider {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 5px; border-radius: 3px; outline: none; cursor: pointer;
          background: linear-gradient(
            to right,
            var(--oda-indigo) 0%,
            var(--oda-indigo) var(--val,0%),
            var(--oda-border) var(--val,0%),
            var(--oda-border) 100%
          );
          transition: background .1s;
        }
        input[type="range"].oda-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 18px; height: 18px; border-radius: 50%;
          background: white; border: 2.5px solid var(--oda-indigo);
          box-shadow: 0 2px 6px rgba(79,70,229,.3);
          transition: transform .15s, box-shadow .15s;
        }
        input[type="range"].oda-slider::-webkit-slider-thumb:hover {
          transform: scale(1.25); box-shadow: 0 3px 12px rgba(79,70,229,.4);
        }
        input[type="range"].oda-slider::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: white; border: 2.5px solid var(--oda-indigo);
          box-shadow: 0 2px 6px rgba(79,70,229,.3); cursor: pointer;
        }

        /* Create button (main area) */
        .oda-create-btn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 28px; font-size: 1rem; font-weight: 700;
          background: linear-gradient(135deg, var(--oda-indigo), var(--oda-indigo-dk));
          color: white; border: none; border-radius: 14px; cursor: pointer;
          font-family: var(--oda-font); letter-spacing: .01em;
          box-shadow: 0 6px 24px rgba(79,70,229,.35);
          transition: transform .2s, box-shadow .2s;
        }
        .oda-create-btn:hover {
          transform: translateY(-3px); box-shadow: 0 10px 32px rgba(79,70,229,.45);
        }
        .oda-create-btn:active { transform: translateY(-1px); }
        .oda-create-btn-plus {
          width: 26px; height: 26px; border-radius: 7px;
          background: rgba(255,255,255,.22); display: flex; align-items: center;
          justify-content: center; font-size: 1.3rem; line-height: 1;
        }

        /* Main area empty state */
        .oda-main-hero {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          min-height: 420px; gap: 18px; text-align: center; padding: 32px;
        }
        .oda-main-hero-icon {
          width: 80px; height: 80px; border-radius: 22px;
          background: var(--oda-indigo-lt); color: var(--oda-indigo);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(79,70,229,.12);
        }
        .oda-main-hero h3 {
          font-size: 1.4rem; font-weight: 700; color: var(--oda-slate);
          margin: 0; letter-spacing: -.01em;
        }
        .oda-main-hero p {
          font-size: .9rem; color: var(--oda-muted); margin: 0; max-width: 340px; line-height: 1.6;
        }

        /* ── RESPONSIVE DRAWER ── */
        @media (max-width: 640px) {
          .oda-drawer { width: 100vw; }
          .oda-drawer-body { padding: 14px; }
          .oda-drawer-head { padding: 14px 14px 12px; }
          .oda-drawer-footer {
            padding: 10px 12px;
            gap: 7px;
            flex-wrap: nowrap;
          }
          .oda-drawer-footer .oda-btn-primary,
          .oda-drawer-footer .oda-btn-secondary {
            padding: 8px 10px;
            font-size: .75rem;
            gap: 4px;
            flex: 1;
            justify-content: center;
            min-width: 0;
            white-space: nowrap;
          }
        }
        @media (max-width: 380px) {
          .oda-drawer-footer .oda-btn-primary,
          .oda-drawer-footer .oda-btn-secondary {
            padding: 7px 7px;
            font-size: .7rem;
          }
          .oda-drawer-fill-badge { display: none; }
        }


        @media (max-width: 1200px) {
          .oda-dash { grid-template-columns: 1fr; }
          .oda-sidebar-l, .oda-sidebar-r { position: relative; top: 0; max-height: none; }
        }
        @media (max-width: 768px) {
          .oda-dash  { padding: 12px; gap: 12px; }
          .oda-main  { padding: 16px; }
          .oda-fgrid { grid-template-columns: 1fr; }
          .oda-desc-grid { grid-template-columns: 1fr; }
          .oda-desc-slot { aspect-ratio: 16/9; }
          .oda-form-actions { flex-direction: column; }
          .oda-btn-primary, .oda-btn-secondary { width: 100%; justify-content: center; }
          .oda-page-title { font-size: 1.25rem; }
          .oda-sub-header { padding: 8px 14px; }
        }
        @media (max-width: 480px) { .oda-page-title { font-size: 1.1rem; } }
        @media (hover: none) and (pointer: coarse) {
          .oda-finput, .oda-ftextarea, .oda-fselect { font-size: 16px; }
          .oda-btn-primary:not(.oda-drawer-footer .oda-btn-primary),
          .oda-btn-secondary:not(.oda-drawer-footer .oda-btn-secondary) { min-height: 44px; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
        }
        @media print {
          .oda-sidebar-l, .oda-sidebar-r, .oda-sub-header { display: none !important; }
          .oda-dash { grid-template-columns: 1fr; padding: 0; }
        }
      `}</style>

      {/* ── SOUS-HEADER ── */}
      <div className="oda-sub-header">
        <button
          className={`oda-notif-btn${notifPermission === 'granted' ? ' active' : ''}`}
          title="Gérer les notifications"
          onClick={gererNotificationPermission}
          style={notifPermission === 'granted' ? { background: notifColor, borderColor: notifColor } : notifPermission === 'denied' ? { borderColor: notifColor, color: notifColor } : {}}
        >
          <Icon.Bell />
        </button>
        {hasShopConfig && shopSlug && (
          <button
            className={`oda-btn-shop-icon${linkCopied ? ' copied' : ''}${linkAnimating ? ' animate' : ''}`}
            onClick={copierLienBoutique}
            title="Copier le lien de la boutique"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </button>
        )}
        <Link href="/abonnement" className="oda-btn-abo">
          <Icon.Calendar />
          Abonnements
        </Link>
      </div>

      {/* ── DASHBOARD GRID ── */}
      <div className="oda-dash">

        {/* ── SIDEBAR GAUCHE ── */}
        <aside className="oda-sidebar-l">

          {/* Carte bienvenue */}
          <div className="oda-welcome-card" style={{ background: welcomeStyle.color }}>
            <div className="oda-welcome-av">
              {welcomeStyle.logo
                ? <img src={welcomeStyle.logo} style={{ width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%' }} alt="avatar"/>
                : initialeAvatar
              }
            </div>
            <div className="oda-welcome-info">
              <div className="oda-welcome-tag">Bienvenue</div>
              <div className="oda-welcome-name">{nomUtilisateur}</div>
            </div>
            <button
              className="oda-welcome-edit"
              title="Personnaliser"
              onClick={e => { e.stopPropagation(); setCustomizeOpen(true); }}
            >
              <Icon.Pencil />
            </button>
          </div>

          {/* Modal personnalisation */}
          <div
            className={`oda-modal-overlay${customizeOpen ? ' open' : ''}`}
            onClick={e => { if (e.target === e.currentTarget) setCustomizeOpen(false); }}
          >
            <div className="oda-modal">
              <div className="oda-modal-head">
                <h3><Icon.Palette /> Personnaliser la carte</h3>
                <button className="oda-modal-close" onClick={() => setCustomizeOpen(false)}><Icon.X size={14} /></button>
              </div>

              <div className="oda-modal-section">
                <label className="oda-modal-label">Logo personnalisé</label>
                <div className="oda-logo-area">
                  <div className="oda-logo-prev">
                    {logoPreviewUrl
                      ? <img src={logoPreviewUrl} style={{ width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%' }} alt="logo"/>
                      : <Icon.Image size={28} />
                    }
                  </div>
                  <div className="oda-logo-actions">
                    <label htmlFor="odaLogoInput" className="oda-logo-upload-btn">
                      <Icon.Folder /> Choisir
                    </label>
                    <input type="file" id="odaLogoInput" accept="image/*" style={{ display:'none' }} ref={logoFileRef} onChange={gererLogoUpload}/>
                    <button className="oda-logo-reset-btn" onClick={reinitialiserLogo}>
                      <Icon.Trash /> Supprimer
                    </button>
                  </div>
                  <p className="oda-logo-hint">PNG, JPG jusqu&apos;à 2MB</p>
                </div>
              </div>

              <div className="oda-modal-section">
                <label className="oda-modal-label">Couleur de fond</label>
                <div className="oda-color-grid">
                  {COLORS.map((color, i) => (
                    <div
                      key={i}
                      className={`oda-color-swatch${selectedColor === color ? ' active' : ''}`}
                      style={{ background: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                  <div className="oda-color-swatch oda-color-custom" title="Personnalisée">
                    <input type="color" defaultValue="#4F46E5" onChange={e => {
                      const h = e.target.value;
                      setSelectedColor(`linear-gradient(135deg, ${h} 0%, ${h}BB 100%)`);
                    }}/>
                    <span style={{ pointerEvents:'none' }}>+</span>
                  </div>
                </div>
              </div>

              <button className="oda-modal-save" onClick={sauvegarderPersonnalisation}>Enregistrer les modifications</button>
            </div>
          </div>

          {/* KPI */}
          <p className="oda-section-label">Aperçu global</p>

          <div className="oda-kpi-card">
            <div className="oda-kpi-icon green"><Icon.TrendingUp /></div>
            <div>
              <p className="oda-kpi-label">Chiffre d&apos;affaires</p>
              <p className="oda-kpi-value">{kpi.ca.toLocaleString('fr-FR')} <span style={{ fontSize:'.7rem',fontWeight:500,color:'var(--oda-muted)' }}>FCFA</span></p>
            </div>
          </div>

          <div className="oda-kpi-card">
            <div className="oda-kpi-icon indigo"><Icon.ShoppingBag /></div>
            <div>
              <p className="oda-kpi-label">Commandes</p>
              <p className="oda-kpi-value">{kpi.commandes}</p>
            </div>
          </div>

          <div className="oda-kpi-card">
            <div className="oda-kpi-icon amber"><Icon.Package /></div>
            <div>
              <p className="oda-kpi-label">Produits</p>
              <p className="oda-kpi-value">{kpi.produits}</p>
            </div>
          </div>
        </aside>

        {/* ── FORMULAIRE PRINCIPAL ── */}
        <main className="oda-main">
          <div className="oda-page-header">
            {produitEnEdition && (
              <div className="oda-edit-badge">
                <Icon.Pencil /> Mode édition — #{produitEnEdition.id}
              </div>
            )}
            <div className="oda-page-eyebrow">ODA Studio · Vendeur</div>
            <h2 className="oda-page-title">Tableau de bord</h2>
            <p className="oda-page-sub">Gérez vos produits et suivez vos performances en temps réel</p>
          </div>

          {/* Hero zone */}
          <div className="oda-main-hero">
            <div className="oda-main-hero-icon">
              <Icon.Package />
            </div>
            <h3>Ajoutez votre premier produit</h3>
            <p>Créez votre catalogue en quelques étapes. Photos, prix, stock — tout se configure facilement.</p>
            <button
              type="button"
              className="oda-create-btn"
              onClick={() => setFormModalOpen(true)}
            >
              <span className="oda-create-btn-plus">+</span>
              Créer un produit
            </button>
            {!hasShopConfig && (
              <button
                type="button"
                style={{
                  padding: '10px 22px',
                  background: 'linear-gradient(135deg, #059669, #34D399)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontFamily: 'var(--oda-font)',
                  fontSize: '.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(5,150,105,.3)',
                  transition: 'transform .2s, box-shadow .2s',
                }}
                onClick={() => setShopCreationOpen(true)}
              >
                🏪 Configurer ma boutique
              </button>
            )}
          </div>
        </main>

        {/* ── DRAWER CRÉATION PRODUIT ── */}
        <div
          className={`oda-drawer-overlay${formModalOpen ? ' open' : ''}`}
          onClick={e => { if (e.target === e.currentTarget) setFormModalOpen(false); }}
        />
        <div className={`oda-drawer${formModalOpen ? ' open' : ''}`}>

          {/* Barre de remplissage */}
          <div className="oda-drawer-fill-bar">
            <div
              className="oda-drawer-fill-progress"
              style={{ width: `${fillPercent}%` }}
            />
          </div>

          {/* En-tête */}
          <div className="oda-drawer-head">
            <div className="oda-drawer-icon">
              <Icon.Package />
            </div>
            <div>
              <h2>{produitEnEdition ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <p>{produitEnEdition ? `Édition · #${produitEnEdition.id}` : 'Remplissez les informations ci-dessous'}</p>
            </div>
            <span
              className={`oda-drawer-fill-badge${fillPercent === 100 ? ' complete' : ''}`}
            >
              {fillPercent === 100 ? '✓ Complet' : `${fillPercent}%`}
            </span>
            <button className="oda-drawer-close" onClick={() => setFormModalOpen(false)}>
              <Icon.X size={14} />
            </button>
          </div>

          {/* Indicateur étapes */}
          <div className="oda-fill-steps">
            {[
              { label: 'Photo', done: fillSteps[0] },
              { label: 'Nom', done: fillSteps[1] },
              { label: 'Description', done: fillSteps[2] },
              { label: 'Prix', done: fillSteps[3] },
              { label: 'Stock', done: fillSteps[4] },
              { label: 'Catégorie', done: fillSteps[5] },
            ].map(s => (
              <div key={s.label} className={`oda-fill-step${s.done ? ' done' : ''}`}>
                <span className="oda-fill-step-dot"/>
                {s.label}
              </div>
            ))}
          </div>

          {/* Corps / Formulaire */}
          <div className="oda-drawer-body">
            <form id="odaProductForm" className="oda-form" onSubmit={gererSoumissionFormulaire}>

              {/* ── IMAGE PRINCIPALE ── */}
              <section className="oda-fsection">
                <div className="oda-fsection-header">
                  <div className="oda-fsection-num">1</div>
                  <h3 className="oda-ftitle">Image principale</h3>
                </div>
                <p className="oda-fdesc">Photo principale visible sur la boutique · PNG, JPG · max 5MB</p>

                {!mainImagePreview ? (
                  <label htmlFor="odaMainImg" style={{ cursor:'pointer', display:'block' }}>
                    <div className="oda-upload-zone">
                      <div className="oda-upload-icon-wrap"><Icon.Camera /></div>
                      <p className="oda-upload-text">Cliquez pour ajouter l&apos;image principale</p>
                      <p className="oda-upload-hint">Glissez-déposez ou parcourez vos fichiers</p>
                    </div>
                  </label>
                ) : (
                  <div className="oda-img-preview">
                    <img src={mainImagePreview} alt="Aperçu principal"/>
                    <button type="button" className="oda-remove-btn" onClick={supprimerImagePrincipale}>
                      <Icon.X size={14} />
                    </button>
                  </div>
                )}
                <input type="file" id="odaMainImg" accept="image/*" style={{ display:'none' }} ref={mainImageRef} onChange={gererImagePrincipale}/>
              </section>

              {/* ── INFORMATIONS ── */}
              <section className="oda-fsection">
                <div className="oda-fsection-header">
                  <div className="oda-fsection-num">2</div>
                  <h3 className="oda-ftitle">Informations du produit</h3>
                </div>

                <div className="oda-fgroup">
                  <label className="oda-flabel">Nom du produit <span className="oda-req">*</span></label>
                  <input type="text" className="oda-finput" placeholder="Ex: Robe élégante fleurie" required value={productName} onChange={e => setProductName(e.target.value)}/>
                </div>

                <div className="oda-fgroup">
                  <label className="oda-flabel">Description <span className="oda-req">*</span></label>
                  <textarea className="oda-ftextarea" placeholder="Décrivez votre produit en détail — matières, dimensions, utilisation..." required value={productDesc} onChange={e => setProductDesc(e.target.value)}/>
                </div>

                {/* Images description */}
                <div className="oda-desc-images-wrap">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 3 }}>
                    <h4 className="oda-desc-images-title">Images de description</h4>
                    <span style={{ fontSize:'.72rem', fontWeight:600, color: descPreviews.length >= 3 ? 'var(--oda-warning)' : 'var(--oda-muted)' }}>
                      {descPreviews.length}/3
                    </span>
                  </div>
                  <p className="oda-desc-images-hint">Ajoutez jusqu&apos;à 3 visuels complémentaires</p>
                  <div className="oda-desc-row">
                    {descPreviews.map((src, idx) => (
                      <div key={idx} className="oda-desc-thumb">
                        <img src={src} alt={`Desc ${idx + 1}`}/>
                        <span className="oda-desc-thumb-num">{idx + 1}</span>
                        <button
                          type="button"
                          className="oda-desc-remove"
                          onClick={() => supprimerImageDescription(idx)}
                        >
                          <Icon.X size={9} />
                        </button>
                      </div>
                    ))}
                    {descPreviews.length < 3 && (
                      <button
                        type="button"
                        className="oda-desc-add-btn"
                        onClick={() => descInputRef.current?.click()}
                      >
                        <span className="oda-desc-add-icon">+</span>
                        <span className="oda-desc-add-label">Ajouter</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display:'none' }}
                    ref={descInputRef}
                    onChange={gererImageDescription}
                  />
                </div>

                {/* ── SLIDERS PRIX & STOCK ── */}
                <div className="oda-fgrid" style={{ marginTop: 18 }}>
                  <div className="oda-fgroup">
                    <label className="oda-flabel">Prix (FCFA) <span className="oda-req">*</span></label>
                    <div className="oda-slider-wrap">
                      <div className="oda-slider-val">
                        <strong>{(parseInt(productPrice) || 0).toLocaleString('fr-FR')} <span style={{ fontSize:'.7rem', fontWeight:500 }}>FCFA</span></strong>
                        <span>max 500 000</span>
                      </div>
                      <input
                        type="range"
                        className="oda-slider"
                        min="0" max="500000" step="500"
                        value={productPrice || 0}
                        style={{ '--val': `${((parseInt(productPrice)||0)/500000)*100}%` }}
                        onChange={e => setProductPrice(e.target.value)}
                      />
                    </div>
                    <input
                      type="number"
                      className="oda-finput"
                      placeholder="ou saisissez ici"
                      value={productPrice}
                      style={{ marginTop: 10 }}
                      onChange={e => setProductPrice(e.target.value)}
                    />
                   </div>
                   <div className="oda-fgroup">
                     <label className="oda-flabel">Prix avant promo <span className="oda-req" style={{color:'var(--oda-muted)',fontWeight:400,fontSize:'.75rem'}}> (optionnel)</span></label>
                     <input
                       type="number"
                       className="oda-finput"
                       placeholder="Ex: 8000"
                       value={productInitialPrice}
                       onChange={e => setProductInitialPrice(e.target.value)}
                     />
                   </div>
                   <div className="oda-fgroup">
                     <label className="oda-flabel">Prix promotionnel <span className="oda-req" style={{color:'var(--oda-muted)',fontWeight:400,fontSize:'.75rem'}}> (optionnel)</span></label>
                     <input
                       type="number"
                       className="oda-finput"
                       placeholder="Ex: 4500"
                       value={productPromoPrice}
                       onChange={e => setProductPromoPrice(e.target.value)}
                       style={productPromoPrice && Number(productPromoPrice) > 0 && Number(productPromoPrice) < Number(productPrice) ? {borderColor:'var(--oda-success)'} : {}}
                     />
                     {productPromoPrice && Number(productPromoPrice) > 0 && Number(productPromoPrice) < Number(productPrice) && (
                       <p style={{margin:'6px 0 0',fontSize:'.78rem',color:'var(--oda-success)',fontWeight:500}}>
                         ✅ Promo: {Math.round((1 - Number(productPromoPrice)/Number(productPrice)) * 100)}% de réduction
                       </p>
                     )}
                     {productPromoPrice && Number(productPromoPrice) >= Number(productPrice) && productPrice && (
                       <p style={{margin:'6px 0 0',fontSize:'.78rem',color:'var(--oda-warning)',fontWeight:500}}>
                         ⚠️ Le prix promo doit être inférieur au prix actuel
                       </p>
                     )}
                   </div>
                   <div className="oda-fgroup">
                     <label className="oda-flabel">Stock <span className="oda-req">*</span></label>
                    <div className="oda-slider-wrap">
                      <div className="oda-slider-val">
                        <strong>{parseInt(productStock) || 0} <span style={{ fontSize:'.7rem', fontWeight:500 }}>unités</span></strong>
                        <span>max 500</span>
                      </div>
                      <input
                        type="range"
                        className="oda-slider"
                        min="0" max="500" step="1"
                        value={productStock || 0}
                        style={{ '--val': `${((parseInt(productStock)||0)/500)*100}%` }}
                        onChange={e => setProductStock(e.target.value)}
                      />
                    </div>
                    <input
                      type="number"
                      className="oda-finput"
                      placeholder="ou saisissez ici"
                      value={productStock}
                      style={{ marginTop: 10 }}
                      onChange={e => setProductStock(e.target.value)}
                    />
                  </div>
                </div>

                <div className="oda-fgroup">
                  <label className="oda-flabel">Catégorie <span className="oda-req">*</span></label>
                  <select className="oda-fselect" required value={productCategory} onChange={e => setProductCategory(e.target.value)}>
                    <option value="">Sélectionnez une catégorie</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </section>

              {/* ── STATUT ── */}
              <section className="oda-fsection">
                <div className="oda-fsection-header">
                  <div className="oda-fsection-num">3</div>
                  <h3 className="oda-ftitle">Statut de publication</h3>
                </div>
                <div className="oda-radio-group">
                  <div className="oda-radio-item">
                    <input type="radio" id="odaPublished" name="odaStatus" value="published" checked={productStatus === 'published'} onChange={() => setProductStatus('published')}/>
                    <label htmlFor="odaPublished" className="oda-radio-label">
                      <span className="oda-radio-custom"/>
                      <div>
                        <strong>Publié <span className="oda-radio-badge published">Visible</span></strong>
                        <p>Le produit sera immédiatement visible sur votre boutique</p>
                      </div>
                    </label>
                  </div>
                  <div className="oda-radio-item">
                    <input type="radio" id="odaDraft" name="odaStatus" value="draft" checked={productStatus === 'draft'} onChange={() => setProductStatus('draft')}/>
                    <label htmlFor="odaDraft" className="oda-radio-label">
                      <span className="oda-radio-custom"/>
                      <div>
                        <strong>Brouillon <span className="oda-radio-badge draft">Masqué</span></strong>
                        <p>Le produit ne sera pas visible publiquement</p>
                      </div>
                    </label>
                  </div>
                </div>
              </section>

            </form>
          </div>

          {/* Pied du drawer */}
          <div className="oda-drawer-footer">
            <button type="button" className="oda-btn-secondary" onClick={reinitialiserFormulaire}>
              <Icon.X size={14} /> Annuler
            </button>
             <button type="button" className="oda-btn-secondary" onClick={() => {
               setProductName(''); setProductDesc(''); setProductPrice('');
               setProductPromoPrice(''); setProductInitialPrice('');
               setProductStock(''); setProductCategory(''); setProductStatus('published');
               setMainImage(null); setMainImagePreview(null);
               setDescImages([]); setDescPreviews([]);
               setProduitEnEdition(null);
               if (mainImageRef.current) mainImageRef.current.value = '';
               if (descInputRef.current) descInputRef.current.value = '';
             }}>
              <Icon.RefreshCw /> Réinitialiser
            </button>
            <button
              type="submit"
              form="odaProductForm"
              className="oda-btn-primary"
              disabled={submitDisabled}
            >
              {submitDisabled
                ? <><span style={{ width:14,height:14,border:'2px solid rgba(255,255,255,.4)',borderTop:'2px solid white',borderRadius:'50%',animation:'odaSpin .7s linear infinite',display:'inline-block' }}/> {submitLabel}</>
                : <><Icon.FileText /> {submitLabel}</>
              }
            </button>
          </div>
        </div>

        {/* ── SIDEBAR DROITE ── */}
        <aside className="oda-sidebar-r">
          <div className="oda-preview-header">
            <div className="oda-preview-header-dot"/>
            <span><Icon.Eye /> Aperçu du produit</span>
          </div>
          <div className="oda-preview-card">
            <div className="oda-preview-img">
              {mainImagePreview
                ? <img src={mainImagePreview} style={{ width:'100%',height:'100%',objectFit:'cover' }} alt="Aperçu"/>
                : <div className="oda-preview-img-ph">
                    <Icon.Image size={40} />
                    <p>Image principale</p>
                  </div>
              }
            </div>
            <div className="oda-preview-body">
              <h4 className="oda-preview-title">{previewTitle}</h4>
              <p className="oda-preview-text">{previewDesc}</p>
              {descPreviews.some(Boolean) && (
                <div className="oda-preview-desc-imgs">
                  {descPreviews.filter(Boolean).map((src, i) => (
                    <div key={i}><img src={src} alt={`Desc ${i + 1}`}/></div>
                  ))}
                </div>
              )}
              <div className="oda-preview-price">
                {hasPromoPreview ? (
                  <>
                    <span style={{color:'var(--oda-primary)',fontWeight:700}}>
                      {(Number(productPromoPrice)).toLocaleString('fr-FR')} FCFA
                    </span>
                    {productInitialPrice && (
                      <span style={{textDecoration:'line-through',color:'var(--oda-muted)',fontSize:'.82rem',marginLeft:8}}>
                        {Number(productInitialPrice).toLocaleString('fr-FR')} FCFA
                      </span>
                    )}
                    {!productInitialPrice && productPrice && (
                      <span style={{textDecoration:'line-through',color:'var(--oda-muted)',fontSize:'.82rem',marginLeft:8}}>
                        {(Number(productPrice)).toLocaleString('fr-FR')} FCFA
                      </span>
                    )}
                    <span style={{background:'var(--oda-success)',color:'white',fontSize:'.65rem',padding:'2px 6px',borderRadius:10,marginLeft:8,fontWeight:600}}>
                      -{Math.round((1 - Number(productPromoPrice)/Number(productPrice)) * 100)}%
                    </span>
                  </>
                ) : (
                  <span>{((parseInt(productPrice) || 0).toLocaleString('fr-FR'))} FCFA</span>
                )}
              </div>
            </div>
          </div>

          {/* Quota hint */}
          {subBanner && (
            <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 10, background: 'var(--oda-surface)', border: '1px solid var(--oda-border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 6 }}>
                <span style={{ fontSize:'.75rem', fontWeight:600, color:'var(--oda-muted)' }}>Quota produits</span>
                <span style={{ fontSize:'.75rem', fontWeight:700, color:'var(--oda-slate)' }}>
                  {subBanner.quota?.nombrePublies}/{subBanner.quota?.limite}
                </span>
              </div>
              <div style={{ height: 5, borderRadius: 50, background: 'var(--oda-border)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${((subBanner.quota?.nombrePublies || 0) / (subBanner.quota?.limite || 10)) * 100}%`,
                  background: subBanner.quota?.nombrePublies >= subBanner.quota?.limite
                    ? 'var(--oda-error)'
                    : subBanner.type === 'active'
                    ? 'linear-gradient(90deg,var(--oda-indigo),#818CF8)'
                    : 'linear-gradient(90deg,var(--oda-amber),#F97316)',
                  transition: 'width .4s ease',
                  borderRadius: 50,
                }}/>
              </div>
              {subBanner.type === 'active' && (
                <p style={{ fontSize:'.7rem', color:'var(--oda-muted)', margin:'6px 0 0' }}>
                  Plan {subBanner.plan?.toUpperCase()} · expire dans {subBanner.joursRestants}j
                </p>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* ── BANNIÈRE PRODUITS EN DANGER ── */}
      {warnBanner && showWarnBanner && (
        <div style={{
          position:'fixed', top:76, left:'50%', transform:'translateX(-50%)',
          background:'var(--oda-white)',
          border:'1px solid #FED7AA',
          borderLeft:'4px solid var(--oda-warning)',
          color:'var(--oda-slate)',
          padding:'14px 18px', borderRadius:12,
          boxShadow:'var(--oda-shadow-md)',
          zIndex:1500, maxWidth:520, width:'90%',
          animation:'odaSlideDown .35s ease',
          fontFamily:'var(--oda-font)',
        }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
            <span style={{ color:'var(--oda-warning)', flexShrink:0, marginTop:1 }}><Icon.AlertTriangle /></span>
            <div style={{ flex:1 }}>
              <p style={{ margin:'0 0 3px', fontSize:'.88rem', fontWeight:700, color:'var(--oda-slate)' }}>
                Produits en danger
              </p>
              <p style={{ margin:'0 0 10px', fontSize:'.82rem', color:'var(--oda-muted)' }}>
                {warnBanner.count} produit(s) supprimé(s) dans {warnBanner.minJours} jour{warnBanner.minJours > 1 ? 's' : ''}.
              </p>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => window.location.href='/abonnement'} style={{
                  padding:'7px 14px', background:'var(--oda-warning)', color:'white',
                  border:'none', borderRadius:8, fontWeight:600, cursor:'pointer',
                  fontFamily:'var(--oda-font)', fontSize:'.8rem', display:'flex', alignItems:'center', gap:6,
                }}>
                  <Icon.RefreshCw /> Réactiver
                </button>
                <button onClick={() => setShowWarnBanner(false)} style={{
                  padding:'7px 14px', background:'var(--oda-surface)', color:'var(--oda-muted)',
                  border:'1px solid var(--oda-border)', borderRadius:8, fontWeight:600,
                  cursor:'pointer', fontFamily:'var(--oda-font)', fontSize:'.8rem',
                }}>Fermer</button>
              </div>
            </div>
            <button onClick={() => setShowWarnBanner(false)} style={{
              background:'none', border:'none', cursor:'pointer', color:'var(--oda-muted)',
              padding:0, flexShrink:0, marginTop:1,
            }}><Icon.X size={16} /></button>
          </div>
        </div>
      )}

      {/* ── BANNIÈRE STATUT ABONNEMENT ── */}
      {subBanner && showSubBanner && (
        <div style={{
          position:'fixed', bottom:20, right:20,
          background:'var(--oda-white)', padding:'16px 18px',
          borderRadius:14, boxShadow:'var(--oda-shadow-lg)',
          zIndex:1500, maxWidth:300,
          animation:'odaSlideInRight .35s cubic-bezier(.34,1.56,.64,1)',
          fontFamily:'var(--oda-font)',
          border:'1px solid var(--oda-border)',
          borderTop: subBanner.type === 'free'
            ? '3px solid var(--oda-amber)'
            : '3px solid var(--oda-success)',
        }}>
          {subBanner.type === 'free' ? (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div>
                  <p style={{ margin:0, fontSize:'.88rem', fontWeight:700, color:'var(--oda-slate)' }}>Plan gratuit actif</p>
                  <p style={{ margin:'2px 0 0', color:'var(--oda-muted)', fontSize:'.78rem' }}>
                    {subBanner.quota.nombrePublies}/{subBanner.quota.limite} produits publiés
                  </p>
                </div>
                <button onClick={() => setShowSubBanner(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--oda-muted)', padding:0 }}>
                  <Icon.X size={14} />
                </button>
              </div>
              <div style={{ background:'var(--oda-border)', height:5, borderRadius:50, marginBottom:12, overflow:'hidden' }}>
                <div style={{
                  background: subBanner.quota.nombrePublies >= subBanner.quota.limite ? 'var(--oda-error)' : 'var(--oda-amber)',
                  height:'100%',
                  width:`${(subBanner.quota.nombrePublies/subBanner.quota.limite)*100}%`,
                  transition:'width .3s', borderRadius:50,
                }}/>
              </div>
              <button onClick={() => window.location.href='/abonnement'} style={{
                width:'100%', padding:'9px 0',
                background:'linear-gradient(135deg,var(--oda-indigo),var(--oda-indigo-dk))',
                color:'white', border:'none', borderRadius:9, fontWeight:600,
                cursor:'pointer', fontFamily:'var(--oda-font)', fontSize:'.82rem',
                boxShadow:'0 2px 8px rgba(79,70,229,.3)',
              }}>Voir les offres</button>
            </div>
          ) : (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                    <Icon.CheckCircle />
                    <p style={{ margin:0, fontSize:'.88rem', fontWeight:700, color:'var(--oda-success)' }}>
                      Plan {subBanner.plan?.toUpperCase()}
                    </p>
                  </div>
                  <p style={{ margin:0, color:'var(--oda-muted)', fontSize:'.78rem' }}>
                    {subBanner.quota.nombrePublies}/{subBanner.quota.limite} produits · {subBanner.joursRestants}j restant{subBanner.joursRestants > 1 ? 's' : ''}
                  </p>
                </div>
                <button onClick={() => setShowSubBanner(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--oda-muted)', padding:0 }}>
                  <Icon.X size={14} />
                </button>
              </div>
              <div style={{ background:'var(--oda-border)', height:5, borderRadius:50, overflow:'hidden' }}>
                <div style={{
                  background:'linear-gradient(90deg,var(--oda-success),#34D399)',
                  height:'100%',
                  width:`${(subBanner.quota.nombrePublies/subBanner.quota.limite)*100}%`,
                  transition:'width .3s', borderRadius:50,
                }}/>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TOASTS ── */}
      <div style={{ position:'fixed', top:90, right:20, zIndex:10000, display:'flex', flexDirection:'column', gap:8 }}>
        {toasts.map(t => (
          <div key={t.id} className="oda-toast">
            <div className="oda-toast-dot" style={{
              background:
                t.type === 'success' ? 'var(--oda-success)' :
                t.type === 'error'   ? 'var(--oda-error)'   :
                t.type === 'warning' ? 'var(--oda-warning)'  : 'var(--oda-indigo)',
            }}/>
            {t.message}
          </div>
        ))}
      </div>

      {/* ── SHOP CREATION MODAL ── */}
      <ShopCreationModal
        open={shopCreationOpen}
        onClose={() => setShopCreationOpen(false)}
        userId={user?.id}
        onDone={handleShopCreationDone}
      />

      {/* ── SPINNER CSS ── */}
      <style>{`@keyframes odaSpin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}