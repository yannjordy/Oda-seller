(function () {
  const SUPABASE_URL = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';
  function getSupabase() {
    return window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
  }

  /* ═══════════════════════════════════════════════════════
     CSS — GLASSMORPHISME PREMIUM
  ═══════════════════════════════════════════════════════ */
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');

    /* ── Overlay animé ── */
    #sm-overlay {
      position: fixed; inset: 0; z-index: 99999;
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
      overflow: hidden;
    }

    /* Fond flou + dégradé ambiant */
    #sm-overlay::before {
      content: '';
      position: absolute; inset: 0;
      background: rgba(8, 8, 20, 0.60);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      animation: smOverlayIn .4s ease forwards;
    }

    /* Orbes lumineux animés en arrière-plan */
    #sm-overlay::after {
      content: '';
      position: absolute;
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(0,122,255,0.18) 0%, transparent 70%);
      border-radius: 50%;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      animation: smPulse 4s ease-in-out infinite;
      pointer-events: none;
    }

    #sm-orb-1 {
      position: absolute;
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(88,86,214,0.15) 0%, transparent 70%);
      border-radius: 50%;
      top: 10%; left: 5%;
      animation: smFloat 6s ease-in-out infinite;
      pointer-events: none;
    }
    #sm-orb-2 {
      position: absolute;
      width: 300px; height: 300px;
      background: radial-gradient(circle, rgba(52,199,89,0.12) 0%, transparent 70%);
      border-radius: 50%;
      bottom: 10%; right: 5%;
      animation: smFloat 8s ease-in-out infinite reverse;
      pointer-events: none;
    }

    /* ── Modal principal ── */
    #sm-modal {
      position: relative; z-index: 1;
      width: 100%; max-width: 560px;
      max-height: 92vh;
      display: flex; flex-direction: column;
      background: rgba(255, 255, 255, 0.10);
      backdrop-filter: blur(40px) saturate(200%);
      -webkit-backdrop-filter: blur(40px) saturate(200%);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 28px;
      box-shadow:
        0 40px 100px rgba(0, 0, 0, 0.35),
        0 0 0 0.5px rgba(255,255,255,0.12) inset,
        0 1px 0 rgba(255,255,255,0.3) inset;
      animation: smModalIn .5s cubic-bezier(.34,1.56,.64,1) forwards;
      font-family: 'Sora', 'Poppins', -apple-system, sans-serif;
      overflow: hidden;
    }

    /* Ligne brillante en haut */
    #sm-modal::before {
      content: '';
      position: absolute; top: 0; left: 20%; right: 20%; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
      border-radius: 1px;
    }

    /* ── Header ── */
    #sm-modal .sm-header {
      padding: 26px 28px 0;
      flex-shrink: 0;
    }
    #sm-modal .sm-brand-row {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 20px;
    }
    #sm-modal .sm-brand {
      display: flex; align-items: center; gap: 10px;
    }
    #sm-modal .sm-logo-badge {
      width: 40px; height: 40px; border-radius: 12px;
      background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem;
      box-shadow: 0 6px 20px rgba(0,122,255,0.4), 0 0 0 1px rgba(255,255,255,0.2) inset;
    }
    #sm-modal .sm-app-name {
      font-size: .7rem; font-weight: 700; letter-spacing: .12em;
      text-transform: uppercase;
      background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,.7) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    #sm-modal .sm-step-info {
      font-size: .72rem; color: rgba(255,255,255,.45);
      font-weight: 500; letter-spacing: .03em;
    }

    /* ── Barre de progression ── */
    #sm-modal .sm-progress-track {
      height: 3px; background: rgba(255,255,255,.1);
      border-radius: 3px; overflow: hidden; margin-bottom: 24px;
    }
    #sm-modal .sm-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #007AFF, #5856D6, #34C759);
      background-size: 200% 100%;
      border-radius: 3px;
      transition: width .5s cubic-bezier(.4,0,.2,1);
      animation: smProgressShimmer 2s linear infinite;
    }

    /* ── Indicateurs d'étapes ── */
    #sm-modal .sm-step-dots {
      display: flex; gap: 8px; margin-bottom: 8px;
    }
    #sm-modal .sm-dot {
      display: flex; align-items: center; gap: 6px;
      font-size: .7rem; font-weight: 600; letter-spacing: .04em;
      color: rgba(255,255,255,.3);
      transition: color .3s, transform .3s;
    }
    #sm-modal .sm-dot .sm-dot-circle {
      width: 22px; height: 22px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 1.5px solid rgba(255,255,255,.15);
      font-size: .65rem; font-weight: 700;
      transition: all .35s cubic-bezier(.34,1.56,.64,1);
      background: rgba(255,255,255,.05);
    }
    #sm-modal .sm-dot.done .sm-dot-circle {
      background: #34C759;
      border-color: #34C759;
      color: #fff;
      box-shadow: 0 0 12px rgba(52,199,89,.5);
    }
    #sm-modal .sm-dot.active .sm-dot-circle {
      background: linear-gradient(135deg,#007AFF,#5856D6);
      border-color: transparent;
      color: #fff;
      box-shadow: 0 0 16px rgba(0,122,255,.55);
      transform: scale(1.15);
    }
    #sm-modal .sm-dot.active { color: rgba(255,255,255,.9); }
    #sm-modal .sm-dot-label { display: none; }
    @media (min-width: 440px) {
      #sm-modal .sm-dot-label { display: inline; }
    }

    /* ── Body scrollable ── */
    #sm-modal .sm-body {
      flex: 1; overflow-y: auto;
      padding: 0 28px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,.1) transparent;
    }
    #sm-modal .sm-body::-webkit-scrollbar { width: 4px; }
    #sm-modal .sm-body::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,.15); border-radius: 4px;
    }

    /* ── Slides ── */
    #sm-modal .sm-slide { display: none; }
    #sm-modal .sm-slide.sm-visible {
      display: block;
      animation: smSlideIn .35s cubic-bezier(.4,0,.2,1) forwards;
    }
    #sm-modal .sm-slide.sm-out {
      animation: smSlideOut .25s cubic-bezier(.4,0,.2,1) forwards;
    }

    /* ── Titre de slide ── */
    #sm-modal .sm-slide-title {
      font-size: 1.45rem; font-weight: 800;
      color: #fff; line-height: 1.25;
      margin-bottom: 6px; padding-top: 6px;
    }
    #sm-modal .sm-slide-sub {
      font-size: .83rem; color: rgba(255,255,255,.55);
      margin-bottom: 22px; line-height: 1.55;
      font-weight: 400;
    }

    /* ── Champs ── */
    #sm-modal .sm-field { margin-bottom: 16px; }
    #sm-modal .sm-label {
      display: flex; align-items: center; gap: 7px;
      font-size: .78rem; font-weight: 600;
      color: rgba(255,255,255,.75);
      margin-bottom: 7px; letter-spacing: .02em;
    }
    #sm-modal .sm-req {
      font-size: .62rem; font-weight: 700; padding: 2px 7px;
      border-radius: 20px; letter-spacing: .04em;
      background: rgba(255,59,48,.18); color: #FF6B63;
    }
    #sm-modal .sm-opt {
      font-size: .62rem; font-weight: 700; padding: 2px 7px;
      border-radius: 20px; letter-spacing: .04em;
      background: rgba(255,255,255,.08); color: rgba(255,255,255,.4);
    }

    #sm-modal .sm-input,
    #sm-modal .sm-textarea,
    #sm-modal .sm-select {
      width: 100%;
      background: rgba(255,255,255,.08);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1.5px solid rgba(255,255,255,.12);
      border-radius: 14px;
      color: #fff;
      font-size: .88rem; font-weight: 500;
      padding: 13px 16px;
      transition: all .3s ease;
      font-family: 'Sora', -apple-system, sans-serif;
    }
    #sm-modal .sm-input::placeholder,
    #sm-modal .sm-textarea::placeholder {
      color: rgba(255,255,255,.25);
    }
    #sm-modal .sm-input:focus,
    #sm-modal .sm-textarea:focus,
    #sm-modal .sm-select:focus {
      outline: none;
      background: rgba(255,255,255,.12);
      border-color: rgba(0,122,255,.8);
      box-shadow: 0 0 0 3px rgba(0,122,255,.15);
    }
    #sm-modal .sm-textarea {
      min-height: 90px; resize: vertical;
    }

    /* ── Chips délai ── */
    #sm-modal .sm-chip-group {
      display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;
    }
    #sm-modal .sm-chip {
      padding: 9px 16px;
      background: rgba(255,255,255,.08);
      border: 1.5px solid rgba(255,255,255,.12);
      border-radius: 20px;
      font-size: .77rem; font-weight: 600;
      color: rgba(255,255,255,.5);
      cursor: pointer;
      transition: all .3s ease;
      letter-spacing: .02em;
    }
    #sm-modal .sm-chip:hover {
      background: rgba(255,255,255,.12);
      border-color: rgba(255,255,255,.2);
      color: rgba(255,255,255,.7);
    }
    #sm-modal .sm-chip.sm-chip-on {
      background: linear-gradient(135deg,#007AFF,#5856D6);
      border-color: transparent;
      color: #fff;
      box-shadow: 0 4px 14px rgba(0,122,255,.3);
    }

    /* ── Cartes paiement ── */
    #sm-modal .sm-pay-cards {
      display: flex; flex-direction: column; gap: 12px; margin-bottom: 18px;
    }
    #sm-modal .sm-pay-card {
      position: relative;
      background: rgba(255,255,255,.08);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 2px solid rgba(255,255,255,.12);
      border-radius: 16px;
      padding: 16px 18px;
      cursor: pointer;
      transition: all .3s cubic-bezier(.4,0,.2,1);
    }
    #sm-modal .sm-pay-card:hover {
      background: rgba(255,255,255,.12);
      border-color: rgba(255,255,255,.22);
      transform: translateY(-3px);
      box-shadow: 0 8px 22px rgba(0,0,0,.2);
    }
    #sm-modal .sm-pay-card.sm-pay-on {
      background: linear-gradient(135deg, rgba(0,122,255,.15), rgba(88,86,214,.15));
      border-color: #007AFF;
      box-shadow: 0 6px 20px rgba(0,122,255,.25);
    }
    #sm-modal .sm-pay-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 8px;
    }
    #sm-modal .sm-pay-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem;
      background: rgba(255,255,255,.1);
      box-shadow: 0 2px 8px rgba(0,0,0,.1), 0 0 0 1px rgba(255,255,255,.15) inset;
    }
    #sm-modal .sm-pay-title {
      font-size: 1rem; font-weight: 700; color: #fff;
    }
    #sm-modal .sm-pay-desc {
      font-size: .75rem; color: rgba(255,255,255,.45); line-height: 1.45;
      padding-left: 56px;
    }
    #sm-modal .sm-pay-check {
      position: absolute;
      top: 18px; right: 18px;
      width: 24px; height: 24px;
      border: 2px solid rgba(255,255,255,.2);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      transition: all .3s ease;
    }
    #sm-modal .sm-pay-on .sm-pay-check {
      background: #007AFF;
      border-color: #007AFF;
      box-shadow: 0 0 10px rgba(0,122,255,.5);
    }
    #sm-modal .sm-pay-check::after {
      content: '';
      width: 6px; height: 10px;
      border: solid #fff;
      border-width: 0 2.5px 2.5px 0;
      transform: rotate(45deg) scale(0);
      transition: transform .2s cubic-bezier(.34,1.56,.64,1);
    }
    #sm-modal .sm-pay-on .sm-pay-check::after {
      transform: rotate(45deg) scale(1);
    }

    /* ── Upload images ── */
    #sm-modal .sm-upload-card {
      background: rgba(255,255,255,.08);
      backdrop-filter: blur(10px);
      border: 2px dashed rgba(255,255,255,.15);
      border-radius: 16px; padding: 16px;
      margin-bottom: 16px; cursor: pointer;
      transition: all .3s ease;
    }
    #sm-modal .sm-upload-card:hover {
      background: rgba(255,255,255,.12);
      border-color: rgba(255,255,255,.25);
    }
    #sm-modal .sm-upload-card.sm-has-img {
      border-style: solid;
      background: rgba(255,255,255,.1);
    }
    #sm-modal .sm-file-input { display: none; }
    #sm-modal .sm-upload-area {
      display: flex; align-items: center; gap: 14px;
    }
    #sm-modal .sm-upload-icon {
      width: 52px; height: 52px; border-radius: 12px;
      background: rgba(255,255,255,.1);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 0 0 1px rgba(255,255,255,.15) inset;
      flex-shrink: 0;
    }
    #sm-modal .sm-upload-info h5 {
      font-size: .88rem; font-weight: 600; color: #fff;
      margin-bottom: 3px;
    }
    #sm-modal .sm-upload-info p {
      font-size: .73rem; color: rgba(255,255,255,.4);
      line-height: 1.4;
    }
    #sm-modal .sm-preview-img {
      width: 52px; height: 52px; border-radius: 12px;
      object-fit: cover;
      box-shadow: 0 4px 12px rgba(0,0,0,.2);
    }

    /* ── Couleurs ── */
    #sm-modal .sm-color-field {
      display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
    }
    #sm-modal .sm-color-swatch {
      width: 52px; height: 52px; border-radius: 12px;
      cursor: pointer; flex-shrink: 0;
      box-shadow: 0 4px 14px rgba(0,0,0,.2), 0 0 0 3px rgba(255,255,255,.1) inset;
      transition: all .3s ease;
      position: relative;
    }
    #sm-modal .sm-color-swatch:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 20px rgba(0,0,0,.3), 0 0 0 3px rgba(255,255,255,.2) inset;
    }
    #sm-modal .sm-color-input { opacity: 0; position: absolute; pointer-events: none; }
    #sm-modal .sm-color-value {
      font-size: .78rem; font-weight: 600; letter-spacing: .05em;
      color: rgba(255,255,255,.6);
      text-transform: uppercase;
      background: rgba(255,255,255,.08);
      padding: 8px 14px; border-radius: 10px;
      border: 1.5px solid rgba(255,255,255,.12);
    }

    /* ── Slug et message d'erreur ── */
    #sm-modal .sm-slug-status {
      display: none; margin-top: 6px; font-size: .75rem;
      font-weight: 500; color: #FF9500;
      padding: 6px 12px; border-radius: 8px;
      background: rgba(255,149,0,.1);
    }
    #sm-modal .sm-error-msg {
      background: rgba(255,59,48,.12);
      border: 1.5px solid rgba(255,59,48,.3);
      border-radius: 12px;
      padding: 12px 14px;
      font-size: .8rem; color: #FF6B63; font-weight: 500;
      margin-bottom: 14px;
      display: none;
      animation: smShake .4s ease;
    }

    /* ── Footer boutons ── */
    #sm-modal .sm-footer {
      flex-shrink: 0;
      padding: 20px 28px 26px;
      border-top: 1px solid rgba(255,255,255,.08);
      background: linear-gradient(180deg, transparent, rgba(0,0,0,.08));
      display: flex; gap: 10px;
    }
    #sm-modal .sm-btn {
      flex: 1;
      padding: 13px 20px;
      border-radius: 14px;
      font-size: .88rem; font-weight: 600;
      cursor: pointer; border: none;
      transition: all .3s cubic-bezier(.4,0,.2,1);
      font-family: 'Sora', -apple-system, sans-serif;
      letter-spacing: .02em;
    }
    #sm-modal .sm-btn:disabled {
      opacity: .4; cursor: not-allowed;
      transform: none !important;
    }
    #sm-modal .sm-btn-secondary {
      background: rgba(255,255,255,.08);
      color: rgba(255,255,255,.7);
      border: 1.5px solid rgba(255,255,255,.12);
    }
    #sm-modal .sm-btn-secondary:hover:not(:disabled) {
      background: rgba(255,255,255,.12);
      border-color: rgba(255,255,255,.2);
      transform: translateY(-2px);
    }
    #sm-modal .sm-btn-primary {
      background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
      color: #fff;
      box-shadow: 0 6px 20px rgba(0,122,255,.35);
      border: none;
    }
    #sm-modal .sm-btn-primary:hover:not(:disabled) {
      box-shadow: 0 8px 26px rgba(0,122,255,.45);
      transform: translateY(-2px);
    }

    /* ── Écran succès ── */
    #sm-modal .sm-success {
      display: none; padding: 30px 0;
    }
    #sm-modal .sm-success.sm-visible {
      display: block;
      animation: smSlideIn .4s ease forwards;
    }
    #sm-modal .sm-success-icon {
      width: 100px; height: 100px; margin: 0 auto 20px;
      background: linear-gradient(135deg, #34C759, #30D158);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 3rem;
      box-shadow: 0 12px 36px rgba(52,199,89,.4), 0 0 0 6px rgba(52,199,89,.2) inset;
      animation: smPopIn .6s cubic-bezier(.34,1.56,.64,1) forwards;
    }
    #sm-modal .sm-success-title {
      font-size: 1.65rem; font-weight: 800; color: #fff;
      text-align: center; margin-bottom: 10px;
    }
    #sm-modal .sm-success-sub {
      font-size: .9rem; color: rgba(255,255,255,.55);
      text-align: center; margin-bottom: 28px; line-height: 1.6;
    }
    #sm-modal .sm-success-actions {
      display: flex; flex-direction: column; gap: 10px;
      padding: 0 28px;
    }
    #sm-modal .sm-success-btn {
      width: 100%;
      padding: 14px 20px;
      border-radius: 14px;
      font-size: .88rem; font-weight: 600;
      cursor: pointer; border: none;
      transition: all .3s cubic-bezier(.4,0,.2,1);
      font-family: 'Sora', -apple-system, sans-serif;
      letter-spacing: .02em;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    #sm-modal .sm-success-btn-primary {
      background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
      color: #fff;
      box-shadow: 0 6px 20px rgba(0,122,255,.35);
    }
    #sm-modal .sm-success-btn-primary:hover {
      box-shadow: 0 8px 26px rgba(0,122,255,.45);
      transform: translateY(-2px);
    }
    #sm-modal .sm-success-btn-secondary {
      background: rgba(255,255,255,.08);
      color: rgba(255,255,255,.8);
      border: 1.5px solid rgba(255,255,255,.12);
    }
    #sm-modal .sm-success-btn-secondary:hover {
      background: rgba(255,255,255,.12);
      border-color: rgba(255,255,255,.2);
      transform: translateY(-2px);
    }
    
    /* ── Bouton fermer modal ── */
    #sm-modal .sm-close-modal {
      margin-top: 12px;
      background: rgba(255,59,48,.15);
      color: #FF6B63;
      border: 1.5px solid rgba(255,59,48,.3);
    }
    #sm-modal .sm-close-modal:hover {
      background: rgba(255,59,48,.25);
      border-color: rgba(255,59,48,.4);
      transform: translateY(-2px);
    }

    /* ── Toast copie ── */
    #sm-copy-toast {
      position: fixed;
      bottom: -100px;
      left: 50%; transform: translateX(-50%);
      background: rgba(52,199,89,.95);
      backdrop-filter: blur(20px);
      color: #fff;
      padding: 14px 26px;
      border-radius: 14px;
      font-size: .85rem; font-weight: 600;
      box-shadow: 0 12px 32px rgba(0,0,0,.3);
      z-index: 100000;
      transition: bottom .4s cubic-bezier(.34,1.56,.64,1);
      display: flex; align-items: center; gap: 10px;
    }
    #sm-copy-toast.sm-toast-show { bottom: 30px; }

    /* ── Animations ── */
    @keyframes smOverlayIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes smModalIn {
      from {
        opacity: 0;
        transform: scale(.92) translateY(30px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    @keyframes smSlideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes smSlideOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(-20px);
      }
    }
    @keyframes smPulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: .15; }
      50% { transform: translate(-50%, -50%) scale(1.15); opacity: .25; }
    }
    @keyframes smFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-30px); }
    }
    @keyframes smProgressShimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes smPopIn {
      0% { transform: scale(0); }
      70% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    @keyframes smShake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-8px); }
      75% { transform: translateX(8px); }
    }
  `;

  let sb = null;
  let currentUser = null;
  let existingCfg = null;
  let step = 0;
  const TOTAL = 4;

  /* ═══════════════════════════════════════════════════════
     HTML DU MODAL
  ═══════════════════════════════════════════════════════ */
  function buildHTML() {
    return `
      <!-- Overlay + orbes -->
      <div id="sm-overlay">
        <div id="sm-orb-1"></div>
        <div id="sm-orb-2"></div>

        <!-- Modal -->
        <div id="sm-modal">
          <!-- Header -->
          <div class="sm-header">
            <div class="sm-brand-row">
              <div class="sm-brand">
                <div class="sm-logo-badge">🏪</div>
                <div class="sm-app-name">ODA SETUP</div>
              </div>
              <div class="sm-step-info" id="sm-step-counter">Étape 1 / ${TOTAL}</div>
            </div>

            <div class="sm-progress-track">
              <div class="sm-progress-fill" id="sm-progress" style="width: 25%;"></div>
            </div>

            <div class="sm-step-dots" id="sm-step-dots">
              ${[1,2,3,4].map(i => `
                <div class="sm-dot ${i === 1 ? 'active' : ''}">
                  <div class="sm-dot-circle">${i}</div>
                  <span class="sm-dot-label">${
                    i === 1 ? 'Infos' : i === 2 ? 'Paiement' : i === 3 ? 'Identité' : 'Livraison'
                  }</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Body (slides) -->
          <div class="sm-body">
            <!-- Slide 1 : Infos générales -->
            <div class="sm-slide sm-visible" id="sm-slide-0">
              <div class="sm-error-msg" id="sm-error-0"></div>
              <h2 class="sm-slide-title">Informations générales</h2>
              <p class="sm-slide-sub">Les coordonnées essentielles de votre boutique.</p>

              <div class="sm-field">
                <label class="sm-label">
                  Nom de la boutique
                  <span class="sm-req">REQUIS</span>
                </label>
                <input type="text" class="sm-input" id="sm-nom" placeholder="Ma Boutique Élégante" required />
              </div>

              <div class="sm-field">
                <label class="sm-label">
                  Email
                  <span class="sm-req">REQUIS</span>
                </label>
                <input type="email" class="sm-input" id="sm-email" placeholder="contact@maboutique.com" required />
              </div>

              <div class="sm-field">
                <label class="sm-label">
                  Téléphone
                  <span class="sm-req">REQUIS</span>
                </label>
                <input type="tel" class="sm-input" id="sm-tel" placeholder="+237 6XX XXX XXX" required />
              </div>

              <div class="sm-field">
                <label class="sm-label">
                  Adresse complète
                  <span class="sm-req">REQUIS</span>
                </label>
                <textarea class="sm-textarea" id="sm-adresse" placeholder="Ville, quartier, rue…" required></textarea>
              </div>

              <div class="sm-field">
                <label class="sm-label">
                  Description
                  <span class="sm-opt">OPTIONNEL</span>
                </label>
                <textarea class="sm-textarea" id="sm-desc" placeholder="Un texte d'introduction pour votre boutique…"></textarea>
              </div>
            </div>

            <!-- Slide 2 : Paiements -->
            <div class="sm-slide" id="sm-slide-1">
              <div class="sm-error-msg" id="sm-error-1"></div>
              <h2 class="sm-slide-title">Modes de paiement</h2>
              <p class="sm-slide-sub">Choisissez au moins un moyen de paiement.</p>

              <div class="sm-pay-cards">
                <!-- Mobile Money -->
                <div class="sm-pay-card" id="sm-pc-mobile">
                  <div class="sm-pay-header">
                    <div class="sm-pay-icon">📱</div>
                    <div class="sm-pay-title">Mobile Money</div>
                  </div>
                  <div class="sm-pay-desc">MTN / Orange Money</div>
                  <div class="sm-pay-check"></div>
                </div>

                <!-- Paiement à la livraison -->
                <div class="sm-pay-card" id="sm-pc-cash">
                  <div class="sm-pay-header">
                    <div class="sm-pay-icon">💵</div>
                    <div class="sm-pay-title">Paiement à la livraison</div>
                  </div>
                  <div class="sm-pay-desc">Espèces, chèque, virement…</div>
                  <div class="sm-pay-check"></div>
                </div>

                <!-- Carte bancaire -->
                <div class="sm-pay-card" id="sm-pc-carte">
                  <div class="sm-pay-header">
                    <div class="sm-pay-icon">💳</div>
                    <div class="sm-pay-title">Carte bancaire</div>
                  </div>
                  <div class="sm-pay-desc">Via passerelle de paiement</div>
                  <div class="sm-pay-check"></div>
                </div>
              </div>
            </div>

            <!-- Slide 3 : Identité visuelle -->
            <div class="sm-slide" id="sm-slide-2">
              <div class="sm-error-msg" id="sm-error-2"></div>
              <h2 class="sm-slide-title">Identité visuelle</h2>
              <p class="sm-slide-sub">Personnalisez l'apparence de votre boutique.</p>

              <!-- Identifiant unique (slug) -->
              <div class="sm-field">
                <label class="sm-label">
                  Identifiant unique (slug)
                  <span class="sm-req">REQUIS</span>
                </label>
                <input
                  type="text"
                  class="sm-input"
                  id="sm-slug"
                  placeholder="ma-boutique"
                  required
                />
                <div class="sm-slug-status" id="sm-slug-status"></div>
              </div>

              <!-- Logo -->
              <div class="sm-upload-card" id="sm-card-logo">
                <input type="file" class="sm-file-input" id="sm-file-logo" accept="image/*" />
                <div class="sm-upload-area">
                  <div class="sm-upload-icon" id="sm-prev-logo">🖼️</div>
                  <div class="sm-upload-info">
                    <h5>Logo de la boutique</h5>
                    <p>PNG, JPG · Max 2 Mo · Optionnel</p>
                  </div>
                </div>
              </div>

              <!-- Favicon -->
              <div class="sm-upload-card" id="sm-card-favicon">
                <input type="file" class="sm-file-input" id="sm-file-favicon" accept="image/*" />
                <div class="sm-upload-area">
                  <div class="sm-upload-icon" id="sm-prev-favicon">🌟</div>
                  <div class="sm-upload-info">
                    <h5>Favicon (icône)</h5>
                    <p>PNG, ICO · 64×64 · Optionnel</p>
                  </div>
                </div>
              </div>

              <!-- Couleur primaire -->
              <div class="sm-field">
                <label class="sm-label">Couleur primaire</label>
                <div class="sm-color-field">
                  <div class="sm-color-swatch" id="sm-sw-primary" style="background: #007AFF;">
                    <input type="color" class="sm-color-input" id="sm-col-primary" value="#007AFF" />
                    <div class="sm-color-fill" id="sm-sf-primary" style="width: 100%; height: 100%; border-radius: 12px; background: #007AFF;"></div>
                  </div>
                  <div class="sm-color-value" id="sm-cv-primary">#007AFF</div>
                </div>
              </div>

              <!-- Couleur secondaire -->
              <div class="sm-field">
                <label class="sm-label">Couleur secondaire</label>
                <div class="sm-color-field">
                  <div class="sm-color-swatch" id="sm-sw-secondary" style="background: #5856D6;">
                    <input type="color" class="sm-color-input" id="sm-col-secondary" value="#5856D6" />
                    <div class="sm-color-fill" id="sm-sf-secondary" style="width: 100%; height: 100%; border-radius: 12px; background: #5856D6;"></div>
                  </div>
                  <div class="sm-color-value" id="sm-cv-secondary">#5856D6</div>
                </div>
              </div>
            </div>

            <!-- Slide 4 : Livraison -->
            <div class="sm-slide" id="sm-slide-3">
              <div class="sm-error-msg" id="sm-error-3"></div>
              <h2 class="sm-slide-title">Paramètres de livraison</h2>
              <p class="sm-slide-sub">Définissez vos délais et zones de livraison.</p>

              <div class="sm-field">
                <label class="sm-label">
                  Délai moyen (en jours)
                  <span class="sm-opt">OPTIONNEL</span>
                </label>
                <input type="number" class="sm-input" id="sm-delai" placeholder="Ex: 2" min="0" />
                <div class="sm-chip-group" id="sm-delai-chips">
                  <div class="sm-chip" data-val="1">24h</div>
                  <div class="sm-chip" data-val="2">2 jours</div>
                  <div class="sm-chip" data-val="3">3 jours</div>
                  <div class="sm-chip" data-val="7">1 semaine</div>
                </div>
              </div>

              <div class="sm-field">
                <label class="sm-label">
                  Frais de livraison (Douala)
                  <span class="sm-opt">OPTIONNEL</span>
                </label>
                <input type="number" class="sm-input" id="sm-frais-douala" placeholder="Ex: 1000" min="0" />
              </div>

              <div class="sm-field">
                <label class="sm-label">
                  Frais de livraison (Autres villes)
                  <span class="sm-opt">OPTIONNEL</span>
                </label>
                <input type="number" class="sm-input" id="sm-frais-autres" placeholder="Ex: 2500" min="0" />
              </div>
            </div>

            <!-- Écran succès -->
            <div class="sm-success" id="sm-success">
              <div class="sm-success-icon">✓</div>
              <h2 class="sm-success-title">Configuration terminée !</h2>
              <p class="sm-success-sub">
                Votre boutique est prête à accueillir vos premiers clients.
              </p>
              <div class="sm-success-actions">
                <button class="sm-success-btn sm-success-btn-primary" id="sm-goto-boutique">
                  <span>🏪</span>
                  <span>Voir ma boutique</span>
                </button>
                <button class="sm-success-btn sm-success-btn-secondary" id="sm-btn-share-link">
                  <span>📤</span>
                  <span>Partager le lien</span>
                </button>
                <button class="sm-success-btn sm-success-btn-secondary" id="sm-goto-param">
                  <span>⚙️</span>
                  <span>Aller aux paramètres</span>
                </button>
                <button class="sm-success-btn sm-close-modal" id="sm-btn-close-modal">
                  <span>✕</span>
                  <span>Fermer</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Footer (boutons) -->
          <div class="sm-footer" id="sm-footer">
            <button class="sm-btn sm-btn-secondary" id="sm-btn-prev">← Retour</button>
            <button class="sm-btn sm-btn-primary" id="sm-btn-next">Suivant →</button>
            <button class="sm-btn sm-btn-secondary" id="sm-btn-skip" style="display: none;">Ignorer</button>
          </div>
        </div>
      </div>

      <!-- Toast de copie -->
      <div id="sm-copy-toast">
        ✓ Lien copié !
      </div>
    `;
  }

  /* ── Pré-remplir avec config existante ── */
  function prefill(cfg) {
    if (!cfg) return;
    const g = cfg.general || {};
    const p = cfg.paiement || {};
    const a = cfg.apparence || {};
    const i = cfg.identifiant || {};
    const l = cfg.livraison || {};

    if (g.nom) document.getElementById('sm-nom').value = g.nom;
    if (g.email) document.getElementById('sm-email').value = g.email;
    if (g.telephone) document.getElementById('sm-tel').value = g.telephone;
    if (g.adresse) document.getElementById('sm-adresse').value = g.adresse;
    if (g.description) document.getElementById('sm-desc').value = g.description;

    if (p.mobile?.actif) document.getElementById('sm-pc-mobile')?.classList.add('sm-pay-on');
    if (p.cash?.actif) document.getElementById('sm-pc-cash')?.classList.add('sm-pay-on');
    if (p.carte?.actif) document.getElementById('sm-pc-carte')?.classList.add('sm-pay-on');

    if (i.slug) document.getElementById('sm-slug').value = i.slug;

    if (a.couleurPrimaire) {
      const colP = a.couleurPrimaire;
      document.getElementById('sm-col-primary').value = colP;
      document.getElementById('sm-sf-primary').style.background = colP;
      document.getElementById('sm-cv-primary').textContent = colP;
    }
    if (a.couleurSecondaire) {
      const colS = a.couleurSecondaire;
      document.getElementById('sm-col-secondary').value = colS;
      document.getElementById('sm-sf-secondary').style.background = colS;
      document.getElementById('sm-cv-secondary').textContent = colS;
    }

    if (a.logo) showImagePreview('sm-prev-logo', a.logo, 'sm-card-logo');
    if (a.favicon) showImagePreview('sm-prev-favicon', a.favicon, 'sm-card-favicon');

    if (l.delai) document.getElementById('sm-delai').value = l.delai;
    if (l.fraisDouala != null) document.getElementById('sm-frais-douala').value = l.fraisDouala;
    if (l.fraisAutres != null) document.getElementById('sm-frais-autres').value = l.fraisAutres;
  }

  /* ── Afficher preview image ── */
  function showImagePreview(previewId, base64, cardId) {
    const prev = document.getElementById(previewId);
    if (!prev) return;
    prev.innerHTML = `<img class="sm-preview-img" src="${base64}" alt="Preview" />`;
    document.getElementById(cardId)?.classList.add('sm-has-img');
  }

  /* ── Upload image ── */
  function bindUpload(inputId, previewId, cardId, key) {
    const fileInput = document.getElementById(inputId);
    const card = document.getElementById(cardId);
    if (!fileInput || !card) return;

    card.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        alert('⚠️ Fichier trop lourd (max 2 Mo).');
        return;
      }
      const reader = new FileReader();
      reader.onload = evt => {
        const base64 = evt.target.result;
        showImagePreview(previewId, base64, cardId);
        // Stocker dans variable temporaire
        if (key === 'logo') existingCfg = { ...existingCfg, apparence: { ...(existingCfg?.apparence || {}), logo: base64 }};
        if (key === 'favicon') existingCfg = { ...existingCfg, apparence: { ...(existingCfg?.apparence || {}), favicon: base64 }};
      };
      reader.readAsDataURL(file);
    });
  }

  /* ── Toggle paiement ── */
  function togglePay(key) {
    const el = document.getElementById('sm-pc-' + key);
    if (!el) return;
    el.classList.toggle('sm-pay-on');
  }

  /* ── Changer de slide ── */
  function goTo(newStep) {
    const curr = document.getElementById('sm-slide-' + step);
    const next = document.getElementById('sm-slide-' + newStep);
    if (!curr || !next) return;

    curr.classList.remove('sm-visible');
    curr.classList.add('sm-out');
    setTimeout(() => {
      curr.classList.remove('sm-out');
      curr.style.display = 'none';
    }, 250);

    next.style.display = 'block';
    setTimeout(() => next.classList.add('sm-visible'), 10);

    step = newStep;
    updateUI();
  }

  /* ── MAJ UI (progression, dots, boutons) ── */
  function updateUI() {
    const percent = ((step + 1) / TOTAL) * 100;
    document.getElementById('sm-progress').style.width = percent + '%';
    document.getElementById('sm-step-counter').textContent = `Étape ${step + 1} / ${TOTAL}`;

    const dots = document.querySelectorAll('#sm-step-dots .sm-dot');
    dots.forEach((d, i) => {
      d.classList.remove('active', 'done');
      if (i < step) d.classList.add('done');
      else if (i === step) d.classList.add('active');
    });

    const btnPrev = document.getElementById('sm-btn-prev');
    const btnNext = document.getElementById('sm-btn-next');
    btnPrev.disabled = step === 0;
    btnNext.textContent = step < TOTAL - 1 ? 'Suivant →' : '✓ Terminer';
  }

  /* ── Afficher erreur ── */
  function showErr(s, msg) {
    const el = document.getElementById('sm-error-' + s);
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
  }

  /* ── Validation ── */
  function validate(s) {
    if (s === 0) {
      const nom = (document.getElementById('sm-nom')?.value || '').trim();
      const email = (document.getElementById('sm-email')?.value || '').trim();
      const tel = (document.getElementById('sm-tel')?.value || '').trim();
      const adr = (document.getElementById('sm-adresse')?.value || '').trim();
      if (!nom) return { ok: false, msg: '⚠️ Nom de boutique requis.' };
      if (!email || !/\S+@\S+\.\S+/.test(email)) return { ok: false, msg: '⚠️ Email invalide.' };
      if (!tel) return { ok: false, msg: '⚠️ Téléphone requis.' };
      if (!adr) return { ok: false, msg: '⚠️ Adresse requise.' };
    }
    if (s === 1) {
      const mobile = document.getElementById('sm-pc-mobile')?.classList.contains('sm-pay-on');
      const cash = document.getElementById('sm-pc-cash')?.classList.contains('sm-pay-on');
      const carte = document.getElementById('sm-pc-carte')?.classList.contains('sm-pay-on');
      if (!mobile && !cash && !carte) return { ok: false, msg: '⚠️ Sélectionnez au moins un mode de paiement.' };
    }
    if (s === 2) {
      const slug = (document.getElementById('sm-slug')?.value || '').trim();
      if (!slug) return { ok: false, msg: '⚠️ Identifiant unique requis.' };
      if (slug.length < 4) return { ok: false, msg: '⚠️ Au moins 4 caractères.' };
    }
    return { ok: true };
  }

  /* ── Sauvegarder config ── */
  async function save() {
    const nom = document.getElementById('sm-nom')?.value?.trim() || '';
    const email = document.getElementById('sm-email')?.value?.trim() || '';
    const tel = document.getElementById('sm-tel')?.value?.trim() || '';
    const adr = document.getElementById('sm-adresse')?.value?.trim() || '';
    const desc = document.getElementById('sm-desc')?.value?.trim() || '';

    const mobile = document.getElementById('sm-pc-mobile')?.classList.contains('sm-pay-on');
    const cash = document.getElementById('sm-pc-cash')?.classList.contains('sm-pay-on');
    const carte = document.getElementById('sm-pc-carte')?.classList.contains('sm-pay-on');

    const slug = document.getElementById('sm-slug')?.value?.trim() || '';
    const colP = document.getElementById('sm-col-primary')?.value || '#007AFF';
    const colS = document.getElementById('sm-col-secondary')?.value || '#5856D6';
    const logo = existingCfg?.apparence?.logo || '';
    const favicon = existingCfg?.apparence?.favicon || '';

    const delai = parseInt(document.getElementById('sm-delai')?.value || '0', 10);
    const fraisD = parseInt(document.getElementById('sm-frais-douala')?.value || '0', 10);
    const fraisA = parseInt(document.getElementById('sm-frais-autres')?.value || '0', 10);

    const cfg = {
      general: { nom, email, telephone: tel, adresse: adr, description: desc },
      paiement: {
        mobile: { actif: mobile },
        cash: { actif: cash },
        carte: { actif: carte },
        devise: 'FCFA'
      },
      identifiant: { slug },
      apparence: { couleurPrimaire: colP, couleurSecondaire: colS, logo, favicon },
      livraison: { delai, fraisDouala: fraisD, fraisAutres: fraisA }
    };

    const { data, error } = await sb.from('parametres_boutique').upsert({
      user_id: currentUser.id,
      config: cfg,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' }).select().single();

    if (error) throw error;
    return data.config;
  }

  /* ── Construire URL boutique ── */
  function getShopUrl(cfg) {
    const slug = cfg?.identifiant?.slug || '';
    if (!slug) return window.location.origin + '/boutique.html';
    // ✅ Utiliser l'identifiant unique (slug) pour construire l'URL
    return window.location.origin + '/boutique.html?shop=' + encodeURIComponent(slug);
  }

  /* ── Toast copie ── */
  function showCopyToast() {
    const toast = document.getElementById('sm-copy-toast');
    if (!toast) return;
    toast.classList.add('sm-toast-show');
    setTimeout(() => toast.classList.remove('sm-toast-show'), 2800);
  }

  /* ── Bind tous les events ── */
  function bindEvents() {
    // Paiement — click sur les cards
    ['mobile', 'cash', 'carte'].forEach(key => {
      document.getElementById('sm-pc-' + key)?.addEventListener('click', () => togglePay(key));
    });

    // Chips délai
    document.querySelectorAll('#sm-delai-chips .sm-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#sm-delai-chips .sm-chip').forEach(c => c.classList.remove('sm-chip-on'));
        chip.classList.add('sm-chip-on');
        const input = document.getElementById('sm-delai');
        if (input) input.value = chip.dataset.val;
      });
    });
    // Sync input → désélectionne les chips si modifié manuellement
    document.getElementById('sm-delai')?.addEventListener('input', () => {
      document.querySelectorAll('#sm-delai-chips .sm-chip').forEach(c => c.classList.remove('sm-chip-on'));
    });

    // Couleurs
    ['primary', 'secondary'].forEach(type => {
      const input = document.getElementById('sm-col-' + type);
      input?.addEventListener('input', () => {
        document.getElementById('sm-sf-' + type).style.background = input.value;
        document.getElementById('sm-cv-' + type).textContent = input.value;
      });
      document.getElementById('sm-sw-' + type)?.addEventListener('click', () => input?.click());
    });

    // Slug
    document.getElementById('sm-slug')?.addEventListener('input', e => {
      const clean = e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, '');
      e.target.value = clean;
      const st = document.getElementById('sm-slug-status');
      if (clean.length > 0 && clean.length < 4) {
        st.textContent = '⚠️ Minimum 4 caractères.';
        st.style.color = '#FF9500'; st.style.display = 'block';
      } else { st.style.display = 'none'; }
    });

    // Uploads
    bindUpload('sm-file-logo', 'sm-prev-logo', 'sm-card-logo', 'logo');
    bindUpload('sm-file-favicon', 'sm-prev-favicon', 'sm-card-favicon', 'favicon');

    // Next
    document.getElementById('sm-btn-next')?.addEventListener('click', async () => {
      const result = validate(step);
      if (!result.ok) { showErr(step, result.msg); return; }

      if (step < TOTAL - 1) {
        goTo(step + 1);
      } else {
        const btn = document.getElementById('sm-btn-next');
        btn.disabled = true;
        btn.innerHTML = '<span>⏳ Enregistrement…</span>';
        try {
          const savedCfg = await save();
          // Succès
          document.getElementById('sm-slide-' + step)?.classList.remove('sm-visible');
          document.getElementById('sm-success').classList.add('sm-visible');
          document.getElementById('sm-footer').style.display = 'none';
          // Tous les dots verts
          document.getElementById('sm-progress').style.width = '100%';
          document.querySelectorAll('#sm-step-dots .sm-dot').forEach(d => {
            d.classList.remove('active'); d.classList.add('done');
          });
          document.getElementById('sm-step-counter').textContent = 'Configuration terminée ✓';

          // Stocker la config sauvegardée pour les boutons d'action
          existingCfg = savedCfg;

        } catch {
          btn.disabled = false;
          btn.innerHTML = '✓ Terminer';
          showErr(step, 'Erreur de sauvegarde. Réessayez.');
        }
      }
    });

    // Prev
    document.getElementById('sm-btn-prev')?.addEventListener('click', () => {
      if (step > 0) goTo(step - 1);
    });

    // Skip
    document.getElementById('sm-btn-skip')?.addEventListener('click', () => {
      if (confirm('⚠️ Sans configuration, votre boutique ne sera pas accessible correctement.\nContinuer quand même ?')) {
        removeModal();
      }
    });

    // ── Bouton : Voir ma boutique ──
    document.getElementById('sm-goto-boutique')?.addEventListener('click', () => {
      const url = getShopUrl(existingCfg);
      removeModal();
      window.open(url, '_blank');
    });

    // ── Bouton : Partager le lien ──
    document.getElementById('sm-btn-share-link')?.addEventListener('click', async () => {
      const url = getShopUrl(existingCfg);
      const shopName = existingCfg?.general?.nom || 'Ma boutique';

      // Tentative Web Share API (mobile natif)
      if (navigator.share) {
        try {
          await navigator.share({
            title: shopName,
            text: `Découvrez ma boutique : ${shopName}`,
            url: url
          });
          return;
        } catch (e) {
          // L'utilisateur a annulé ou erreur → fallback copie
        }
      }

      // Fallback : copie dans le presse-papier
      try {
        await navigator.clipboard.writeText(url);
        showCopyToast();
      } catch (e) {
        // Dernier recours : prompt
        window.prompt('Copiez ce lien :', url);
      }
    });

    // ── Bouton : Paramètres ──
    document.getElementById('sm-goto-param')?.addEventListener('click', () => {
      removeModal();
      window.location.href = 'parametres.html';
    });

    // ── ✅ Bouton : Fermer le modal ──
    document.getElementById('sm-btn-close-modal')?.addEventListener('click', () => {
      removeModal();
    });
  }

  /* ── Nettoyage ── */
  function removeModal() {
    document.getElementById('sm-overlay')?.remove();
    document.getElementById('sm-copy-toast')?.remove();
    document.getElementById('sm-styles')?.remove();
  }

  /* ── Config déjà complète ? ── */
  function isConfigured(cfg) {
    if (!cfg) return false;
    const g = cfg.general || {};
    const reqFields = [g.nom, g.email, g.telephone, g.adresse];
    const hasInfo = reqFields.every(f => f && String(f).trim().length > 0);
    const p = cfg.paiement || {};
    const hasPay = (p.mobile?.actif) || (p.cash?.actif) || (p.carte?.actif);
    return hasInfo && hasPay;
  }

  /* ── Produits existants ── */
  async function hasProduits(userId) {
    try {
      const { data } = await sb.from('produits').select('id').eq('user_id', userId).limit(1);
      return data && data.length > 0;
    } catch { return false; }
  }

  /* ── Charger config ── */
  async function loadConfig(userId) {
    try {
      const { data } = await sb.from('parametres_boutique').select('config').eq('user_id', userId).single();
      return data?.config || null;
    } catch { return null; }
  }

  /* ── Injecter le modal ── */
  function inject(cfg) {
    // Styles
    if (!document.getElementById('sm-styles')) {
      const s = document.createElement('style');
      s.id = 'sm-styles'; s.textContent = CSS;
      document.head.appendChild(s);
    }
    // HTML
    const div = document.createElement('div');
    div.innerHTML = buildHTML();
    // Injecter tous les enfants (overlay + toast)
    while (div.firstElementChild) {
      document.body.appendChild(div.firstElementChild);
    }

    prefill(cfg);
    bindEvents();
    console.log('🏪 ODA Setup Modal → affiché');
  }

  /* ── Init ── */
  async function init() {
    let tries = 0;
    while (!window.supabase && tries++ < 25) await new Promise(r => setTimeout(r, 200));
    sb = getSupabase();
    if (!sb) return;

    try {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) return;
      currentUser = session.user;
    } catch { return; }

    existingCfg = await loadConfig(currentUser.id);
    if (isConfigured(existingCfg)) { console.log('✅ Boutique déjà configurée.'); return; }

    const hasProd = await hasProduits(currentUser.id);
    if (!hasProd) {
      // Écoute la création du premier produit
      document.addEventListener('product:created', () => inject(existingCfg), { once: true });
      return;
    }
    inject(existingCfg);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

 
})();
