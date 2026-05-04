'use client';

import { useState, useRef, useEffect } from 'react';

const SUPABASE_URL = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';

let _sb = null;
function getSupabase() {
  if (!_sb) {
    const { createClient } = require('@supabase/supabase-js');
    _sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _sb;
}

const COLORS = [
  { label: 'Orange', value: '#FF6B00' },
  { label: 'Bleu', value: '#007AFF' },
  { label: 'Violet', value: '#5856D6' },
  { label: 'Vert', value: '#34C759' },
  { label: 'Rouge', value: '#FF3B30' },
  { label: 'Noir', value: '#1D1D1F' },
];

const STEPS = [
  { id: 'general', icon: '🏪', label: 'Informations' },
  { id: 'identifiant', icon: '🔖', label: 'Identifiant' },
  { id: 'paiement', icon: '💳', label: 'Paiement' },
  { id: 'livraison', icon: '📦', label: 'Livraison' },
  { id: 'apparence', icon: '🎨', label: 'Apparence' },
  { id: 'termine', icon: '🎉', label: 'Terminé' },
];

export default function ShopCreationModal({ open, onClose, userId, onDone }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [shopLink, setShopLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});

  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');

  const [slug, setSlug] = useState('');
  const [slugAvail, setSlugAvail] = useState(null);

  const [carteActif, setCarteActif] = useState(false);
  const [mobileActif, setMobileActif] = useState(false);
  const [cashActif, setCashActif] = useState(true);

  const [mtnNom, setMtnNom] = useState('');
  const [mtnNum, setMtnNum] = useState('');
  const [orangeNom, setOrangeNom] = useState('');
  const [orangeNum, setOrangeNum] = useState('');

  const [fraisDouala, setFraisDouala] = useState(1000);
  const [fraisAutres, setFraisAutres] = useState(2500);
  const [montantGratuit, setMontantGratuit] = useState(50000);

  const [couleurPrimaire, setCouleurPrimaire] = useState('#FF6B00');
  const [couleurSecondaire, setCouleurSecondaire] = useState('#1D1D1F');
  const [logo, setLogo] = useState('');
  const [favicon, setFavicon] = useState('');

  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);
  const sliderRefs = useRef({});

  useEffect(() => {
    if (open) {
      setStep(0);
      setErrors({});
      setShopLink('');
      setCopied(false);
    }
  }, [open]);

  useEffect(() => {
    Object.keys(sliderRefs.current).forEach(key => {
      const el = sliderRefs.current[key];
      if (el) {
        const max = parseFloat(el.max);
        const val = parseFloat(el.value);
        el.style.setProperty('--val', `${(val / max) * 100}%`);
      }
    });
  }, [fraisDouala, fraisAutres, montantGratuit]);

  function genSlug() {
    return `oda-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  }

  async function checkSlugAvailability(s) {
    if (s.length < 3) return false;
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('parametres_boutique')
        .select('user_id')
        .eq('config->identifiant->>slug', s)
        .neq('user_id', userId)
        .single();
      return !data;
    } catch {
      return true;
    }
  }

  async function handleSlugChange(val) {
    const cleaned = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(cleaned);
    if (cleaned.length >= 3) {
      const avail = await checkSlugAvailability(cleaned);
      setSlugAvail(avail);
    } else {
      setSlugAvail(null);
    }
  }

  function handleFileUpload(type, file) {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = e => {
      if (type === 'logo') setLogo(e.target.result);
      else setFavicon(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  function validateStep() {
    const errs = {};
    switch (step) {
      case 0:
        if (!nom.trim()) errs.nom = 'Nom requis';
        if (!description.trim()) errs.description = 'Description requise';
        if (!email.trim()) errs.email = 'Email requis';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email invalide';
        if (!telephone.trim()) errs.telephone = 'Téléphone requis';
        if (!adresse.trim()) errs.adresse = 'Adresse requise';
        break;
      case 1:
        if (!slug.trim()) errs.slug = 'Identifiant requis';
        else if (slug.length < 3) errs.slug = 'Minimum 3 caractères';
        else if (slugAvail === false) errs.slug = 'Identifiant déjà utilisé';
        break;
      case 2:
        if (!carteActif && !mobileActif && !cashActif) {
          errs.paiement = 'Au moins une méthode de paiement requise';
        }
        if (mobileActif) {
          if (mtnNom && !mtnNum) errs.mtnNum = 'Numéro MTN requis';
          if (orangeNom && !orangeNum) errs.orangeNum = 'Numéro Orange requis';
        }
        break;
      case 3:
        if (fraisDouala < 0) errs.fraisDouala = 'Frais invalides';
        if (fraisAutres < 0) errs.fraisAutres = 'Frais invalides';
        break;
      default:
        break;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleNext() {
    if (step === 4) {
      await handleSave();
      return;
    }
    if (validateStep()) {
      setStep(s => s + 1);
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep(s => s - 1);
      setErrors({});
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = getSupabase();
      const config = {
        general: { nom, description, email, telephone, adresse },
        identifiant: { slug, disponible: slugAvail !== false, auto: false, dateCreation: new Date().toISOString() },
        paiement: {
          carte: { actif: carteActif, cle: '', confirme: false },
          mobile: {
            actif: mobileActif, confirme: false,
            mtn: { actif: !!mtnNum, nomCompte: mtnNom, numero: mtnNum, confirme: false },
            orange: { actif: !!orangeNum, nomCompte: orangeNom, numero: orangeNum, confirme: false },
          },
          cash: { actif: cashActif, confirme: false },
          devise: 'FCFA',
        },
        livraison: {
          fraisDouala, fraisAutres, delai: '2-5 jours ouvrables',
          gratuit: montantGratuit > 0, montantMin: montantGratuit,
          zonesPersonnalisees: [],
        },
        apparence: { couleurPrimaire, couleurSecondaire, logo, favicon, police: 'Inter' },
        notifications: { commandes: true, stock: true, clients: false, rapports: true },
      };

      const json = JSON.stringify(config);
      localStorage.setItem(`parametres_${userId}`, json);
      localStorage.setItem('parametres_boutique', json);

      const { error } = await supabase
        .from('parametres_boutique')
        .upsert(
          { user_id: userId, config, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const link = `${origin}/share/${slug}`;
      setShopLink(link);
      setStep(5);

      if (onDone) onDone({ slug, link });
    } catch (err) {
      console.error('Erreur sauvegarde boutique:', err);
    } finally {
      setSaving(false);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(shopLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function handleFinish() {
    if (onDone) onDone();
    onClose();
  }

  if (!open) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes scmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scmSlideUp { from { opacity: 0; transform: translateY(30px) scale(.97); } to { opacity: 1; transform: none; } }
        @keyframes scmSpin { to { transform: rotate(360deg); } }

        .scm-overlay {
          position: fixed; inset: 0; z-index: 99999;
          background: rgba(0,0,0,.55); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px; animation: scmFadeIn .25s ease;
          font-family: 'Poppins', -apple-system, sans-serif;
        }
        .scm-modal {
          background: white; border-radius: 20px;
          width: 100%; max-width: 560px; max-height: 90vh;
          display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,.3);
          animation: scmSlideUp .35s cubic-bezier(.25,.46,.45,.94);
        }
        @media (max-width: 600px) {
          .scm-overlay { padding: 8px; align-items: flex-end; }
          .scm-modal { max-height: 95vh; border-radius: 18px 18px 0 0; }
        }

        /* Header */
        .scm-header {
          padding: 20px 24px 16px;
          border-bottom: 1px solid #F0F0F2;
          flex-shrink: 0;
        }
        .scm-header-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .scm-header h2 {
          font-size: 1.15rem; font-weight: 700; color: #1D1D1F;
          display: flex; align-items: center; gap: 8px; margin: 0;
        }
        .scm-close {
          width: 34px; height: 34px; border-radius: 10px;
          background: #F5F5F7; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #6E6E73; font-size: 1.1rem; transition: .2s;
        }
        .scm-close:hover { background: #FEE2E2; color: #FF3B30; }

        /* Progress */
        .scm-progress { display: flex; gap: 6px; align-items: center; }
        .scm-progress-bar {
          flex: 1; height: 4px; border-radius: 2px; background: #F0F0F2; overflow: hidden;
        }
        .scm-progress-fill {
          height: 100%; background: linear-gradient(90deg, #007AFF, #5856D6);
          border-radius: 2px; transition: width .4s ease;
        }
        .scm-progress-label {
          font-size: .75rem; font-weight: 600; color: #6E6E73; white-space: nowrap;
        }

        /* Step indicators */
        .scm-steps {
          display: flex; gap: 4px; padding: 0 24px 12px; flex-shrink: 0;
        }
        .scm-step-dot {
          flex: 1; height: 3px; border-radius: 2px;
          background: #E5E5EA; transition: .3s;
        }
        .scm-step-dot.active { background: #007AFF; }
        .scm-step-dot.done { background: #34C759; }

        /* Body */
        .scm-body {
          flex: 1; overflow-y: auto; padding: 24px;
        }
        .scm-body::-webkit-scrollbar { width: 4px; }
        .scm-body::-webkit-scrollbar-thumb { background: #D2D2D7; border-radius: 2px; }

        .scm-section-title {
          font-size: 1rem; font-weight: 700; color: #1D1D1F;
          margin: 0 0 4px; display: flex; align-items: center; gap: 8px;
        }
        .scm-section-desc {
          font-size: .85rem; color: #6E6E73; margin: 0 0 20px;
        }

        /* Form */
        .scm-field { margin-bottom: 16px; }
        .scm-label {
          display: block; font-size: .82rem; font-weight: 600;
          color: #1D1D1F; margin-bottom: 6px;
        }
        .scm-label .req { color: #FF3B30; }
        .scm-input, .scm-textarea, .scm-select {
          width: 100%; padding: 11px 14px;
          border: 2px solid #D2D2D7; border-radius: 10px;
          font-family: 'Poppins', sans-serif; font-size: .9rem;
          color: #1D1D1F; outline: none; transition: .2s;
          box-sizing: border-box; background: white;
        }
        .scm-input:focus, .scm-textarea:focus, .scm-select:focus {
          border-color: #007AFF; box-shadow: 0 0 0 3px rgba(0,122,255,.1);
        }
        .scm-input.error, .scm-textarea.error, .scm-select.error {
          border-color: #FF3B30; box-shadow: 0 0 0 3px rgba(255,59,48,.1);
        }
        .scm-textarea { resize: vertical; min-height: 80px; }
        .scm-error-text { font-size: .75rem; color: #FF3B30; margin-top: 4px; }

        .scm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 480px) { .scm-grid { grid-template-columns: 1fr; } }

        /* Slider */
        .scm-slider-wrap { margin-bottom: 4px; }
        .scm-slider-info {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-bottom: 8px;
        }
        .scm-slider-info strong {
          font-size: 1.05rem; font-weight: 800; color: #007AFF;
        }
        .scm-slider-info span { font-size: .72rem; color: #6E6E73; }
        .scm-slider {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 5px; border-radius: 3px;
          outline: none; cursor: pointer;
          background: linear-gradient(to right, #007AFF 0%, #007AFF var(--val,0%), #D2D2D7 var(--val,0%), #D2D2D7 100%);
        }
        .scm-slider::-webkit-slider-thumb {
          -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%;
          background: white; border: 2.5px solid #007AFF;
          box-shadow: 0 2px 6px rgba(0,122,255,.25);
          transition: transform .15s, box-shadow .15s;
        }
        .scm-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2); box-shadow: 0 3px 12px rgba(0,122,255,.35);
        }
        .scm-slider::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%;
          background: white; border: 2.5px solid #007AFF;
          box-shadow: 0 2px 6px rgba(0,122,255,.25); cursor: pointer;
        }

        /* Toggle */
        .scm-toggle {
          position: relative; display: inline-block; width: 48px; height: 26px; flex-shrink: 0;
        }
        .scm-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
        .scm-toggle-slider {
          position: absolute; cursor: pointer; inset: 0;
          background: #D2D2D7; transition: .3s; border-radius: 26px;
        }
        .scm-toggle-slider::before {
          position: absolute; content: ""; height: 20px; width: 20px;
          left: 3px; bottom: 3px; background: white; transition: .3s; border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,.15);
        }
        .scm-toggle input:checked + .scm-toggle-slider {
          background: linear-gradient(135deg, #007AFF, #5856D6);
        }
        .scm-toggle input:checked + .scm-toggle-slider::before {
          transform: translateX(22px);
        }

        /* Payment card */
        .scm-pay-card {
          border: 2px solid #D2D2D7; border-radius: 12px; padding: 16px;
          margin-bottom: 12px; transition: .2s;
        }
        .scm-pay-card.active { border-color: #007AFF; background: rgba(0,122,255,.03); }
        .scm-pay-card-header {
          display: flex; justify-content: space-between; align-items: center;
        }
        .scm-pay-card-title {
          display: flex; align-items: center; gap: 10px;
        }
        .scm-pay-card-icon { font-size: 1.3rem; }
        .scm-pay-card-name { font-size: .9rem; font-weight: 600; color: #1D1D1F; }
        .scm-pay-card-sub { font-size: .75rem; color: #6E6E73; }

        /* Mobile money */
        .scm-mm-section {
          padding: 14px; background: #F5F5F7; border-radius: 10px; margin-top: 12px;
        }
        .scm-mm-header {
          display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
        }
        .scm-mm-badge {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem;
        }

        /* Color picker */
        .scm-color-grid { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
        .scm-color-swatch {
          width: 40px; height: 40px; border-radius: 10px; cursor: pointer;
          border: 3px solid transparent; transition: .2s;
        }
        .scm-color-swatch:hover { transform: scale(1.1); }
        .scm-color-swatch.active { border-color: #1D1D1F; transform: scale(1.1); }

        /* Upload zone */
        .scm-upload-zone {
          border: 2px dashed #D2D2D7; border-radius: 12px;
          padding: 20px; text-align: center; cursor: pointer;
          transition: .2s; background: #FAFAFA;
        }
        .scm-upload-zone:hover { border-color: #007AFF; background: rgba(0,122,255,.03); }
        .scm-upload-zone.has-image { border-color: #34C759; border-style: solid; background: rgba(52,199,89,.03); }
        .scm-upload-preview {
          max-width: 80px; max-height: 80px; border-radius: 8px;
          object-fit: contain;
        }
        .scm-upload-text { font-size: .82rem; color: #6E6E73; margin-top: 6px; }

        /* Slug status */
        .scm-slug-status {
          margin-top: 6px; padding: 6px 10px; border-radius: 8px;
          font-size: .8rem; font-weight: 500;
        }
        .scm-slug-status.available { background: rgba(52,199,89,.1); color: #34C759; }
        .scm-slug-status.unavailable { background: rgba(255,59,48,.1); color: #FF3B30; }

        /* URL preview */
        .scm-url-preview {
          margin-top: 12px; padding: 12px; background: #F5F5F7;
          border-radius: 10px; overflow: hidden;
        }
        .scm-url-text {
          margin-top: 4px; font-family: 'Courier New', monospace;
          font-size: .82rem; color: #007AFF; word-break: break-all;
        }

        /* Done page */
        .scm-done {
          text-align: center; padding: 20px 0;
        }
        .scm-done-icon {
          font-size: 3.5rem; margin-bottom: 12px;
          animation: scmSlideUp .5s ease;
        }
        .scm-done h3 {
          font-size: 1.3rem; font-weight: 700; color: #1D1D1F; margin: 0 0 8px;
        }
        .scm-done p { font-size: .9rem; color: #6E6E73; margin: 0 0 24px; }

        .scm-link-row {
          display: flex; gap: 8px; align-items: center;
          margin-bottom: 20px;
        }
        .scm-link-input {
          flex: 1; padding: 12px 14px;
          border: 2px solid #D2D2D7; border-radius: 10px;
          font-family: 'Courier New', monospace; font-size: .82rem;
          color: #007AFF; background: white; outline: none;
          overflow: hidden; text-overflow: ellipsis;
        }
        .scm-link-btn {
          padding: 12px 20px; border: none; border-radius: 10px;
          font-family: 'Poppins', sans-serif; font-size: .85rem; font-weight: 600;
          cursor: pointer; transition: .2s; white-space: nowrap;
        }
        .scm-link-btn-copy {
          background: linear-gradient(135deg, #007AFF, #5856D6);
          color: white;
        }
        .scm-link-btn-copy:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,122,255,.3); }
        .scm-link-btn-copy.copied {
          background: #34C759;
        }

        /* Footer */
        .scm-footer {
          padding: 16px 24px;
          border-top: 1px solid #F0F0F2;
          display: flex; gap: 10px; justify-content: flex-end;
          flex-shrink: 0; background: #FAFAFA;
        }
        .scm-btn {
          padding: 11px 22px; border-radius: 10px;
          font-family: 'Poppins', sans-serif; font-size: .88rem; font-weight: 600;
          cursor: pointer; transition: .2s; border: none;
          display: flex; align-items: center; gap: 6px;
        }
        .scm-btn-back {
          background: #F5F5F7; color: #6E6E73;
        }
        .scm-btn-back:hover { background: #E5E5EA; }
        .scm-btn-next {
          background: linear-gradient(135deg, #007AFF, #5856D6);
          color: white; box-shadow: 0 2px 8px rgba(0,122,255,.25);
        }
        .scm-btn-next:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,122,255,.35); }
        .scm-btn-next:disabled { opacity: .6; cursor: not-allowed; transform: none; }
        .scm-btn-done {
          background: linear-gradient(135deg, #34C759, #30D158);
          color: white; box-shadow: 0 2px 8px rgba(52,199,89,.25);
        }
        .scm-btn-done:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(52,199,89,.35); }
        .scm-spinner {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.4);
          border-top: 2px solid white; border-radius: 50%;
          animation: scmSpin .7s linear infinite; display: inline-block;
        }

        @media (max-width: 600px) {
          .scm-footer { padding: 12px 16px; flex-direction: column; }
          .scm-btn { width: 100%; justify-content: center; }
          .scm-link-row { flex-direction: column; }
        }
      `}</style>

      <div className="scm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="scm-modal">

          {/* Header */}
          <div className="scm-header">
            <div className="scm-header-top">
              <h2>{STEPS[step].icon} Créer votre boutique</h2>
              <button className="scm-close" onClick={onClose}>✕</button>
            </div>
            <div className="scm-progress">
              <div className="scm-progress-bar">
                <div className="scm-progress-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
              </div>
              <span className="scm-progress-label">{step + 1}/{STEPS.length}</span>
            </div>
          </div>

          {/* Step dots */}
          <div className="scm-steps">
            {STEPS.map((_, i) => (
              <div key={i} className={`scm-step-dot${i < step ? ' done' : ''}${i === step ? ' active' : ''}`} />
            ))}
          </div>

          {/* Body */}
          <div className="scm-body">

            {/* Step 0: Général */}
            {step === 0 && (
              <>
                <h3 className="scm-section-title">🏪 Informations générales</h3>
                <p className="scm-section-desc">Configurez les informations de base de votre boutique</p>

                <div className="scm-field">
                  <label className="scm-label">Nom de la boutique <span className="req">*</span></label>
                  <input className={`scm-input${errors.nom ? ' error' : ''}`} type="text" placeholder="Ma Boutique Élégante" value={nom} onChange={e => setNom(e.target.value)} />
                  {errors.nom && <div className="scm-error-text">{errors.nom}</div>}
                </div>

                <div className="scm-field">
                  <label className="scm-label">Description <span className="req">*</span></label>
                  <textarea className={`scm-textarea${errors.description ? ' error' : ''}`} placeholder="Décrivez votre boutique..." value={description} onChange={e => setDescription(e.target.value)} />
                  {errors.description && <div className="scm-error-text">{errors.description}</div>}
                </div>

                <div className="scm-grid">
                  <div className="scm-field">
                    <label className="scm-label">Email <span className="req">*</span></label>
                    <input className={`scm-input${errors.email ? ' error' : ''}`} type="email" placeholder="contact@boutique.com" value={email} onChange={e => setEmail(e.target.value)} />
                    {errors.email && <div className="scm-error-text">{errors.email}</div>}
                  </div>
                  <div className="scm-field">
                    <label className="scm-label">Téléphone <span className="req">*</span></label>
                    <input className={`scm-input${errors.telephone ? ' error' : ''}`} type="tel" placeholder="+237 6 XX XX XX XX" value={telephone} onChange={e => setTelephone(e.target.value)} />
                    {errors.telephone && <div className="scm-error-text">{errors.telephone}</div>}
                  </div>
                </div>

                <div className="scm-field">
                  <label className="scm-label">Adresse <span className="req">*</span></label>
                  <input className={`scm-input${errors.adresse ? ' error' : ''}`} type="text" placeholder="Douala, Cameroun" value={adresse} onChange={e => setAdresse(e.target.value)} />
                  {errors.adresse && <div className="scm-error-text">{errors.adresse}</div>}
                </div>
              </>
            )}

            {/* Step 1: Identifiant */}
            {step === 1 && (
              <>
                <h3 className="scm-section-title">🔖 Identifiant unique</h3>
                <p className="scm-section-desc">Créez un nom unique pour votre boutique (URL personnalisée)</p>

                <div className="scm-field">
                  <label className="scm-label">Identifiant <span className="req">*</span></label>
                  <input className={`scm-input${errors.slug ? ' error' : ''}`} type="text" placeholder="ma-boutique" value={slug} onChange={e => handleSlugChange(e.target.value)} />
                  {slugAvail !== null && (
                    <div className={`scm-slug-status ${slugAvail ? 'available' : 'unavailable'}`}>
                      {slugAvail ? '✓ Disponible' : '✗ Déjà utilisé'}
                    </div>
                  )}
                  {errors.slug && <div className="scm-error-text">{errors.slug}</div>}
                </div>

                <div className="scm-url-preview">
                  <strong>Aperçu URL :</strong>
                  <div className="scm-url-text">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/share/{slug || 'votre-identifiant'}
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Paiement */}
            {step === 2 && (
              <>
                <h3 className="scm-section-title">💳 Méthodes de paiement</h3>
                <p className="scm-section-desc">Choisissez au moins une méthode de paiement</p>

                {errors.paiement && <div className="scm-error-text" style={{ marginBottom: 12 }}>{errors.paiement}</div>}

                {/* Carte bancaire */}
                <div className={`scm-pay-card${carteActif ? ' active' : ''}`}>
                  <div className="scm-pay-card-header">
                    <div className="scm-pay-card-title">
                      <span className="scm-pay-card-icon">💳</span>
                      <div>
                        <div className="scm-pay-card-name">Carte bancaire</div>
                        <div className="scm-pay-card-sub">Visa, Mastercard</div>
                      </div>
                    </div>
                    <label className="scm-toggle">
                      <input type="checkbox" checked={carteActif} onChange={e => setCarteActif(e.target.checked)} />
                      <span className="scm-toggle-slider" />
                    </label>
                  </div>
                </div>

                {/* Mobile Money */}
                <div className={`scm-pay-card${mobileActif ? ' active' : ''}`}>
                  <div className="scm-pay-card-header">
                    <div className="scm-pay-card-title">
                      <span className="scm-pay-card-icon">📱</span>
                      <div>
                        <div className="scm-pay-card-name">Mobile Money</div>
                        <div className="scm-pay-card-sub">MTN & Orange</div>
                      </div>
                    </div>
                    <label className="scm-toggle">
                      <input type="checkbox" checked={mobileActif} onChange={e => setMobileActif(e.target.checked)} />
                      <span className="scm-toggle-slider" />
                    </label>
                  </div>

                  {mobileActif && (
                    <>
                      {/* MTN */}
                      <div className="scm-mm-section">
                        <div className="scm-mm-header">
                          <div className="scm-mm-badge" style={{ background: '#FFCC00' }}>📞</div>
                          <span style={{ fontWeight: 600, fontSize: '.9rem' }}>MTN Money</span>
                        </div>
                        <div className="scm-grid">
                          <div className="scm-field">
                            <label className="scm-label">Nom du compte</label>
                            <input className="scm-input" type="text" placeholder="KAMGA Jean" value={mtnNom} onChange={e => setMtnNom(e.target.value)} />
                          </div>
                          <div className="scm-field">
                            <label className="scm-label">Numéro</label>
                            <input className={`scm-input${errors.mtnNum ? ' error' : ''}`} type="tel" placeholder="+237 6XX XX XX XX" value={mtnNum} onChange={e => setMtnNum(e.target.value)} />
                            {errors.mtnNum && <div className="scm-error-text">{errors.mtnNum}</div>}
                          </div>
                        </div>
                      </div>

                      {/* Orange */}
                      <div className="scm-mm-section" style={{ marginTop: 10 }}>
                        <div className="scm-mm-header">
                          <div className="scm-mm-badge" style={{ background: '#FF7900', color: 'white' }}>🍊</div>
                          <span style={{ fontWeight: 600, fontSize: '.9rem' }}>Orange Money</span>
                        </div>
                        <div className="scm-grid">
                          <div className="scm-field">
                            <label className="scm-label">Nom du compte</label>
                            <input className="scm-input" type="text" placeholder="KAMGA Jean" value={orangeNom} onChange={e => setOrangeNom(e.target.value)} />
                          </div>
                          <div className="scm-field">
                            <label className="scm-label">Numéro</label>
                            <input className={`scm-input${errors.orangeNum ? ' error' : ''}`} type="tel" placeholder="+237 6XX XX XX XX" value={orangeNum} onChange={e => setOrangeNum(e.target.value)} />
                            {errors.orangeNum && <div className="scm-error-text">{errors.orangeNum}</div>}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Cash */}
                <div className={`scm-pay-card${cashActif ? ' active' : ''}`}>
                  <div className="scm-pay-card-header">
                    <div className="scm-pay-card-title">
                      <span className="scm-pay-card-icon">💵</span>
                      <div>
                        <div className="scm-pay-card-name">Paiement à la livraison</div>
                        <div className="scm-pay-card-sub">Cash on delivery</div>
                      </div>
                    </div>
                    <label className="scm-toggle">
                      <input type="checkbox" checked={cashActif} onChange={e => setCashActif(e.target.checked)} />
                      <span className="scm-toggle-slider" />
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Livraison */}
            {step === 3 && (
              <>
                <h3 className="scm-section-title">📦 Frais de livraison</h3>
                <p className="scm-section-desc">Définissez vos frais de livraison par zone</p>

                <div className="scm-field">
                  <label className="scm-label">Frais Douala (FCFA)</label>
                  <div className="scm-slider-wrap">
                    <div className="scm-slider-info">
                      <strong>{fraisDouala.toLocaleString('fr-FR')} FCFA</strong>
                      <span>max 10 000</span>
                    </div>
                    <input
                      ref={el => { sliderRefs.current.fraisDouala = el; }}
                      type="range" className="scm-slider"
                      min="0" max="10000" step="100"
                      value={fraisDouala}
                      style={{ '--val': `${(fraisDouala / 10000) * 100}%` }}
                      onChange={e => setFraisDouala(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="scm-field">
                  <label className="scm-label">Frais autres villes (FCFA)</label>
                  <div className="scm-slider-wrap">
                    <div className="scm-slider-info">
                      <strong>{fraisAutres.toLocaleString('fr-FR')} FCFA</strong>
                      <span>max 20 000</span>
                    </div>
                    <input
                      ref={el => { sliderRefs.current.fraisAutres = el; }}
                      type="range" className="scm-slider"
                      min="0" max="20000" step="100"
                      value={fraisAutres}
                      style={{ '--val': `${(fraisAutres / 20000) * 100}%` }}
                      onChange={e => setFraisAutres(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="scm-field">
                  <label className="scm-label">Livraison gratuite dès (FCFA)</label>
                  <div className="scm-slider-wrap">
                    <div className="scm-slider-info">
                      <strong>{montantGratuit.toLocaleString('fr-FR')} FCFA</strong>
                      <span>max 500 000</span>
                    </div>
                    <input
                      ref={el => { sliderRefs.current.montantGratuit = el; }}
                      type="range" className="scm-slider"
                      min="0" max="500000" step="1000"
                      value={montantGratuit}
                      style={{ '--val': `${(montantGratuit / 500000) * 100}%` }}
                      onChange={e => setMontantGratuit(parseInt(e.target.value))}
                    />
                  </div>
                  <small style={{ fontSize: '.78rem', color: '#6E6E73' }}>
                    {montantGratuit > 0 ? `Livraison gratuite pour les commandes ≥ ${montantGratuit.toLocaleString('fr-FR')} FCFA` : 'Pas de livraison gratuite'}
                  </small>
                </div>
              </>
            )}

            {/* Step 4: Apparence */}
            {step === 4 && (
              <>
                <h3 className="scm-section-title">🎨 Apparence</h3>
                <p className="scm-section-desc">Personnalisez le style de votre boutique</p>

                <div className="scm-field">
                  <label className="scm-label">Couleur principale</label>
                  <div className="scm-color-grid">
                    {COLORS.map(c => (
                      <div
                        key={c.value}
                        className={`scm-color-swatch${couleurPrimaire === c.value ? ' active' : ''}`}
                        style={{ background: c.value }}
                        onClick={() => setCouleurPrimaire(c.value)}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="scm-field">
                  <label className="scm-label">Couleur secondaire</label>
                  <div className="scm-color-grid">
                    {COLORS.map(c => (
                      <div
                        key={c.value + '-sec'}
                        className={`scm-color-swatch${couleurSecondaire === c.value ? ' active' : ''}`}
                        style={{ background: c.value }}
                        onClick={() => setCouleurSecondaire(c.value)}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="scm-grid">
                  <div className="scm-field">
                    <label className="scm-label">Logo</label>
                    <div className={`scm-upload-zone${logo ? ' has-image' : ''}`} onClick={() => logoInputRef.current?.click()}>
                      {logo ? (
                        <>
                          <img className="scm-upload-preview" src={logo} alt="Logo" />
                          <div className="scm-upload-text">✏️ Changer</div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: '1.5rem' }}>🖼️</div>
                          <div className="scm-upload-text">Cliquer pour ajouter</div>
                        </>
                      )}
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => handleFileUpload('logo', e.target.files[0])}
                    />
                  </div>
                  <div className="scm-field">
                    <label className="scm-label">Favicon</label>
                    <div className={`scm-upload-zone${favicon ? ' has-image' : ''}`} onClick={() => faviconInputRef.current?.click()}>
                      {favicon ? (
                        <>
                          <img className="scm-upload-preview" src={favicon} alt="Favicon" />
                          <div className="scm-upload-text">✏️ Changer</div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: '1.5rem' }}>🔖</div>
                          <div className="scm-upload-text">Cliquer pour ajouter</div>
                        </>
                      )}
                    </div>
                    <input
                      ref={faviconInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => handleFileUpload('favicon', e.target.files[0])}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 5: Terminé */}
            {step === 5 && (
              <>
                <div className="scm-done">
                  <div className="scm-done-icon">🎉</div>
                  <h3>Votre boutique est prête !</h3>
                  <p>
                    <strong>{nom}</strong> est maintenant configurée et accessible via le lien ci-dessous.
                  </p>

                  <div className="scm-link-row">
                    <input className="scm-link-input" type="text" readOnly value={shopLink} />
                    <button
                      className={`scm-link-btn scm-link-btn-copy${copied ? ' copied' : ''}`}
                      onClick={handleCopyLink}
                    >
                      {copied ? '✓ Copié !' : '📋 Copier'}
                    </button>
                  </div>

                  <p style={{ fontSize: '.82rem', color: '#6E6E73', marginBottom: 16 }}>
                    Partagez ce lien avec vos clients pour qu&apos;ils accèdent à votre boutique.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="scm-footer">
            {step < 5 && step > 0 && (
              <button className="scm-btn scm-btn-back" onClick={handleBack}>
                ← Retour
              </button>
            )}
            {step < 5 && (
              <button className="scm-btn scm-btn-next" onClick={handleNext}>
                {step === 4 ? (saving ? <><span className="scm-spinner" /> Sauvegarde...</> : '🚀 Créer la boutique') : 'Continuer →'}
              </button>
            )}
            {step === 5 && (
              <button className="scm-btn scm-btn-done" onClick={handleFinish}>
                ✓ Terminer
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
