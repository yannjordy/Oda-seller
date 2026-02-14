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
      padding: 13px 16px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 14px;
      font-family: 'Sora', 'Poppins', sans-serif;
      font-size: .875rem; color: #fff;
      outline: none;
      transition: border-color .2s, background .2s, box-shadow .2s;
    }
    #sm-modal .sm-input::placeholder,
    #sm-modal .sm-textarea::placeholder {
      color: rgba(255,255,255,.28);
    }
    #sm-modal .sm-select option { background: #1c1c2e; color: #fff; }
    #sm-modal .sm-input:focus,
    #sm-modal .sm-textarea:focus,
    #sm-modal .sm-select:focus {
      border-color: rgba(0,122,255,.7);
      background: rgba(0,122,255,.08);
      box-shadow: 0 0 0 3px rgba(0,122,255,.18);
    }
    #sm-modal .sm-textarea { resize: vertical; min-height: 78px; }
    #sm-modal .sm-hint {
      display: block; margin-top: 5px;
      font-size: .72rem; color: rgba(255,255,255,.32);
    }
    #sm-modal .sm-grid2 {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    }
    @media (max-width: 450px) {
      #sm-modal .sm-grid2 { grid-template-columns: 1fr; }
    }

    /* ── Cards de paiement (obligatoire) ── */
    #sm-modal .sm-pay-warning {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px;
      background: rgba(255,149,0,.12);
      border: 1px solid rgba(255,149,0,.25);
      border-radius: 12px;
      font-size: .75rem; color: #FFAA38; font-weight: 600;
      margin-bottom: 16px;
    }

    #sm-modal .sm-pay-cards {
      display: flex; flex-direction: column; gap: 10px;
      margin-bottom: 14px;
    }
    #sm-modal .sm-pay-card {
      display: flex; align-items: center; gap: 14px;
      padding: 15px 16px;
      background: rgba(255,255,255,.06);
      border: 1.5px solid rgba(255,255,255,.1);
      border-radius: 16px;
      cursor: pointer;
      transition: all .25s cubic-bezier(.4,0,.2,1);
      user-select: none;
      position: relative;
      overflow: hidden;
    }
    #sm-modal .sm-pay-card::before {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(0,122,255,.08) 0%, transparent 60%);
      opacity: 0; transition: opacity .3s;
    }
    #sm-modal .sm-pay-card:hover::before { opacity: 1; }
    #sm-modal .sm-pay-card:hover {
      border-color: rgba(0,122,255,.35);
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(0,0,0,.2);
    }
    #sm-modal .sm-pay-card.sm-selected {
      border-color: rgba(0,122,255,.7);
      background: rgba(0,122,255,.12);
      box-shadow: 0 0 0 3px rgba(0,122,255,.15), 0 8px 24px rgba(0,0,0,.2);
    }
    #sm-modal .sm-pay-card.sm-selected::before { opacity: 1; }

    /* Icône de paiement */
    #sm-modal .sm-pay-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem; flex-shrink: 0;
      transition: transform .25s cubic-bezier(.34,1.56,.64,1);
    }
    #sm-modal .sm-pay-card.sm-selected .sm-pay-icon { transform: scale(1.1); }
    .sm-pi-mobile { background: linear-gradient(135deg,#FF9500,#FF6B00); box-shadow: 0 4px 12px rgba(255,149,0,.35); }
    .sm-pi-cash   { background: linear-gradient(135deg,#34C759,#2aab4a); box-shadow: 0 4px 12px rgba(52,199,89,.35); }
    .sm-pi-carte  { background: linear-gradient(135deg,#007AFF,#5856D6); box-shadow: 0 4px 12px rgba(0,122,255,.35); }

    #sm-modal .sm-pay-info { flex: 1; }
    #sm-modal .sm-pay-name {
      font-size: .9rem; font-weight: 700; color: #fff; margin-bottom: 2px;
    }
    #sm-modal .sm-pay-desc {
      font-size: .72rem; color: rgba(255,255,255,.45);
    }

    /* Checkbox visuel */
    #sm-modal .sm-pay-check {
      width: 22px; height: 22px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,.2);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; font-size: .75rem; font-weight: 700;
      transition: all .25s cubic-bezier(.34,1.56,.64,1);
      color: transparent;
    }
    #sm-modal .sm-pay-card.sm-selected .sm-pay-check {
      background: linear-gradient(135deg,#007AFF,#5856D6);
      border-color: transparent; color: #fff;
      box-shadow: 0 0 10px rgba(0,122,255,.5);
    }

    /* ── Sous-champs Mobile Money ── */
    #sm-modal .sm-sub-panel {
      margin-top: 10px; padding: 16px;
      background: rgba(255,255,255,.04);
      border: 1px dashed rgba(255,149,0,.25);
      border-radius: 14px;
      display: none;
      animation: smExpandIn .3s ease;
    }
    #sm-modal .sm-sub-panel.sm-open { display: block; }

    #sm-modal .sm-sub-title {
      font-size: .72rem; font-weight: 700; letter-spacing: .06em;
      text-transform: uppercase; margin-bottom: 10px;
    }
    #sm-modal .sm-sub-mtn { color: #FF9500; }
    #sm-modal .sm-sub-orange { color: #FF6B00; margin-top: 12px; }

    /* ── Devise ── */
    #sm-modal .sm-devise-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 14px;
      margin-top: 4px;
    }
    #sm-modal .sm-devise-label {
      font-size: .8rem; font-weight: 600; color: rgba(255,255,255,.6);
      flex-shrink: 0;
    }

    /* ── Livraison ── */
    #sm-modal .sm-delai-chips {
      display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px;
    }
    #sm-modal .sm-chip {
      padding: 7px 14px; border-radius: 20px; cursor: pointer;
      font-size: .75rem; font-weight: 600;
      background: rgba(255,255,255,.07);
      border: 1.5px solid rgba(255,255,255,.12);
      color: rgba(255,255,255,.6);
      transition: all .2s;
      user-select: none;
    }
    #sm-modal .sm-chip:hover {
      border-color: rgba(0,122,255,.4); color: rgba(255,255,255,.85);
    }
    #sm-modal .sm-chip.sm-chip-on {
      background: rgba(0,122,255,.15);
      border-color: rgba(0,122,255,.6);
      color: #fff;
      box-shadow: 0 0 10px rgba(0,122,255,.2);
    }

    /* ── Apparence — couleurs ── */
    #sm-modal .sm-color-row {
      display: flex; gap: 10px;
    }
    #sm-modal .sm-color-card {
      flex: 1; display: flex; align-items: center; gap: 10px;
      padding: 12px 14px;
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 14px;
      transition: border-color .2s;
    }
    #sm-modal .sm-color-card:hover { border-color: rgba(255,255,255,.25); }
    #sm-modal .sm-swatch-wrap {
      width: 34px; height: 34px; border-radius: 10px;
      cursor: pointer; flex-shrink: 0; position: relative;
      border: 2px solid rgba(255,255,255,.15);
      overflow: hidden;
      transition: transform .2s;
    }
    #sm-modal .sm-swatch-wrap:hover { transform: scale(1.08); }
    #sm-modal .sm-swatch-fill {
      position: absolute; inset: 0; pointer-events: none;
      border-radius: 8px;
    }
    #sm-modal .sm-swatch-wrap input[type="color"] {
      position: absolute; inset: -4px; width: 150%; height: 150%;
      opacity: 0; cursor: pointer;
    }
    #sm-modal .sm-color-info .sm-cc-name {
      font-size: .75rem; font-weight: 600; color: rgba(255,255,255,.7);
    }
    #sm-modal .sm-color-info .sm-cc-val {
      font-size: .68rem; color: rgba(255,255,255,.35); font-family: monospace;
    }

    /* ── Upload cards ── */
    #sm-modal .sm-upload-row { display: flex; gap: 10px; }
    #sm-modal .sm-upload-card {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 6px;
      padding: 18px 10px;
      background: rgba(255,255,255,.05);
      border: 1.5px dashed rgba(255,255,255,.14);
      border-radius: 16px; cursor: pointer;
      transition: all .25s; position: relative; overflow: hidden;
    }
    #sm-modal .sm-upload-card:hover {
      border-color: rgba(0,122,255,.4); background: rgba(0,122,255,.06);
      transform: translateY(-2px);
    }
    #sm-modal .sm-upload-card input[type="file"] {
      position: absolute; inset: 0; opacity: 0; cursor: pointer;
    }
    #sm-modal .sm-upload-card .sm-uc-icon { font-size: 1.6rem; }
    #sm-modal .sm-upload-card .sm-uc-name {
      font-size: .78rem; font-weight: 700; color: rgba(255,255,255,.7);
    }
    #sm-modal .sm-upload-card .sm-uc-hint {
      font-size: .68rem; color: rgba(255,255,255,.3); text-align: center;
    }
    #sm-modal .sm-upload-card .sm-uc-preview {
      width: 54px; height: 54px; border-radius: 10px; object-fit: contain;
      display: none;
    }
    #sm-modal .sm-upload-card.sm-has-img .sm-uc-icon { display: none; }
    #sm-modal .sm-upload-card.sm-has-img .sm-uc-preview { display: block; }

    /* ── Slug ── */
    #sm-modal .sm-slug-row {
      display: flex; align-items: stretch; gap: 0;
      border-radius: 14px; overflow: hidden;
      border: 1px solid rgba(255,255,255,.14);
      background: rgba(255,255,255,.06);
    }
    #sm-modal .sm-slug-prefix {
      padding: 13px 12px; font-size: .75rem;
      color: rgba(255,255,255,.35); border-right: 1px solid rgba(255,255,255,.08);
      white-space: nowrap; display: flex; align-items: center;
      background: rgba(255,255,255,.04);
    }
    #sm-modal .sm-slug-input {
      flex: 1; padding: 13px 14px; background: transparent;
      border: none; outline: none; color: #fff;
      font-family: 'Sora', monospace; font-size: .875rem;
    }
    #sm-modal .sm-slug-input::placeholder { color: rgba(255,255,255,.2); }
    #sm-modal .sm-slug-status {
      font-size: .72rem; margin-top: 5px; display: none;
    }

    /* ── Erreur inline ── */
    #sm-modal .sm-error-box {
      display: none;
      padding: 10px 14px; border-radius: 12px; margin-bottom: 14px;
      background: rgba(255,59,48,.12);
      border: 1px solid rgba(255,59,48,.25);
      font-size: .78rem; color: #FF6B63; font-weight: 600;
      animation: smShake .4s ease;
    }

    /* ── Footer ── */
    #sm-modal .sm-footer {
      padding: 16px 28px 22px;
      display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0; gap: 10px;
      border-top: 1px solid rgba(255,255,255,.07);
      background: rgba(0,0,0,.1);
    }
    #sm-modal .sm-btn {
      padding: 12px 22px; border-radius: 14px; border: none;
      cursor: pointer; font-family: 'Sora','Poppins',sans-serif;
      font-size: .84rem; font-weight: 700;
      transition: all .2s; display: flex; align-items: center; gap: 6px;
      letter-spacing: .01em;
    }
    #sm-modal .sm-btn:disabled { opacity: .45; cursor: not-allowed; }
    #sm-modal .sm-btn-ghost {
      background: rgba(255,255,255,.07);
      color: rgba(255,255,255,.45);
      border: 1px solid rgba(255,255,255,.1);
    }
    #sm-modal .sm-btn-ghost:hover:not(:disabled) {
      background: rgba(255,255,255,.12); color: rgba(255,255,255,.7);
    }
    #sm-modal .sm-btn-primary {
      background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
      color: #fff;
      box-shadow: 0 6px 20px rgba(0,122,255,.35);
      position: relative; overflow: hidden;
    }
    #sm-modal .sm-btn-primary::before {
      content: '';
      position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent);
      transform: skewX(-20deg);
      transition: left .5s ease;
    }
    #sm-modal .sm-btn-primary:hover:not(:disabled)::before { left: 150%; }
    #sm-modal .sm-btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(0,122,255,.45);
    }
    #sm-modal .sm-btn-success {
      background: linear-gradient(135deg,#34C759,#2aab4a);
      color: #fff;
      box-shadow: 0 6px 20px rgba(52,199,89,.35);
    }
    #sm-modal .sm-btn-success:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(52,199,89,.45);
    }
    #sm-modal .sm-skip-btn {
      font-size: .72rem; color: rgba(255,255,255,.3);
      background: none; border: none; cursor: pointer;
      font-family: 'Sora','Poppins',sans-serif;
      text-decoration: underline dotted; transition: color .2s;
    }
    #sm-modal .sm-skip-btn:hover { color: rgba(255,255,255,.55); }

    /* ── Écran de succès ── */
    #sm-modal .sm-success-screen {
      padding: 36px 28px 28px; text-align: center;
      display: none;
    }
    #sm-modal .sm-success-screen.sm-visible { display: block; }
    #sm-modal .sm-success-ball {
      width: 80px; height: 80px; border-radius: 50%;
      background: linear-gradient(135deg,#34C759,#2aab4a);
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem; margin: 0 auto 20px;
      box-shadow: 0 10px 40px rgba(52,199,89,.45), 0 0 0 16px rgba(52,199,89,.08);
      animation: smSuccessPop .6s cubic-bezier(.34,1.56,.64,1);
    }
    #sm-modal .sm-success-title {
      font-size: 1.6rem; font-weight: 800; color: #fff; margin-bottom: 10px;
    }
    #sm-modal .sm-success-sub {
      font-size: .875rem; color: rgba(255,255,255,.5); line-height: 1.65;
      margin-bottom: 28px; max-width: 340px; margin-left: auto; margin-right: auto;
    }
    #sm-modal .sm-success-sub strong { color: rgba(255,255,255,.8); }

    /* ── Boutons d'action succès ── */
    #sm-modal .sm-success-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 340px;
      margin: 0 auto;
    }
    #sm-modal .sm-btn-view-shop {
      background: linear-gradient(135deg, #34C759 0%, #2aab4a 100%);
      color: #fff;
      box-shadow: 0 6px 20px rgba(52,199,89,.4);
      width: 100%;
      justify-content: center;
      font-size: .9rem;
      padding: 14px 22px;
    }
    #sm-modal .sm-btn-view-shop:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(52,199,89,.5);
    }
    #sm-modal .sm-success-actions-row {
      display: flex;
      gap: 10px;
    }
    #sm-modal .sm-btn-share {
      flex: 1;
      background: rgba(0,122,255,.18);
      border: 1.5px solid rgba(0,122,255,.45);
      color: #60B4FF;
      justify-content: center;
      font-size: .82rem;
      padding: 12px 16px;
    }
    #sm-modal .sm-btn-share:hover {
      background: rgba(0,122,255,.28);
      border-color: rgba(0,122,255,.7);
      color: #fff;
      transform: translateY(-2px);
    }
    #sm-modal .sm-btn-param {
      flex: 1;
      background: rgba(255,255,255,.07);
      border: 1.5px solid rgba(255,255,255,.14);
      color: rgba(255,255,255,.55);
      justify-content: center;
      font-size: .82rem;
      padding: 12px 16px;
    }
    #sm-modal .sm-btn-param:hover {
      background: rgba(255,255,255,.12);
      border-color: rgba(255,255,255,.28);
      color: rgba(255,255,255,.85);
      transform: translateY(-2px);
    }

    /* Toast de copie lien */
    #sm-copy-toast {
      position: fixed;
      bottom: 32px; left: 50%; transform: translateX(-50%) translateY(20px);
      background: rgba(30,30,50,.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(52,199,89,.35);
      color: #34C759;
      font-family: 'Sora','Poppins',sans-serif;
      font-size: .8rem; font-weight: 600;
      padding: 10px 20px; border-radius: 20px;
      z-index: 999999;
      opacity: 0;
      pointer-events: none;
      transition: opacity .3s, transform .3s;
      white-space: nowrap;
    }
    #sm-copy-toast.sm-toast-show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    /* ── Keyframes ── */
    @keyframes smOverlayIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes smModalIn {
      from { opacity: 0; transform: translateY(50px) scale(.93); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes smSlideIn {
      from { opacity: 0; transform: translateX(24px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes smSlideOut {
      from { opacity: 1; transform: translateX(0); }
      to   { opacity: 0; transform: translateX(-24px); }
    }
    @keyframes smExpandIn {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes smProgressShimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes smPulse {
      0%,100% { transform: translate(-50%,-50%) scale(1);   opacity: .7; }
      50%      { transform: translate(-50%,-50%) scale(1.15); opacity: 1; }
    }
    @keyframes smFloat {
      0%,100% { transform: translate(0,0); }
      50%      { transform: translate(20px,30px); }
    }
    @keyframes smSuccessPop {
      from { transform: scale(.2); opacity: 0; }
      to   { transform: scale(1); opacity: 1; }
    }
    @keyframes smShake {
      0%,100% { transform: translateX(0); }
      20%,60% { transform: translateX(-6px); }
      40%,80% { transform: translateX(6px); }
    }

    /* ── Responsive ── */
    @media (max-width: 520px) {
      #sm-modal { border-radius: 22px; max-height: 95vh; }
      #sm-modal .sm-header, #sm-modal .sm-footer { padding-left: 18px; padding-right: 18px; }
      #sm-modal .sm-body { padding: 0 18px; }
      #sm-modal .sm-upload-row { flex-direction: column; }
      #sm-modal .sm-color-row { flex-direction: column; }
      #sm-modal .sm-slide-title { font-size: 1.25rem; }
      #sm-modal .sm-success-actions-row { flex-direction: column; }
    }
  `;

  /* ═══════════════════════════════════════════════════════
     HTML
  ═══════════════════════════════════════════════════════ */
  function buildHTML() {
    return `
    <div id="sm-overlay">
      <div id="sm-orb-1"></div>
      <div id="sm-orb-2"></div>

      <div id="sm-modal" role="dialog" aria-modal="true">

        <!-- HEADER -->
        <div class="sm-header">
          <div class="sm-brand-row">
            <div class="sm-brand">
              <div class="sm-logo-badge">🏪</div>
              <span class="sm-app-name">ODA · Setup</span>
            </div>
            <span class="sm-step-info" id="sm-step-counter">Étape 1 sur 4</span>
          </div>

          <!-- Indicateurs -->
          <div class="sm-step-dots" id="sm-step-dots">
            <div class="sm-dot active" data-step="0">
              <div class="sm-dot-circle">1</div>
              <span class="sm-dot-label">Boutique</span>
            </div>
            <div class="sm-dot" data-step="1">
              <div class="sm-dot-circle">2</div>
              <span class="sm-dot-label">Paiement</span>
            </div>
            <div class="sm-dot" data-step="2">
              <div class="sm-dot-circle">3</div>
              <span class="sm-dot-label">Livraison</span>
            </div>
            <div class="sm-dot" data-step="3">
              <div class="sm-dot-circle">4</div>
              <span class="sm-dot-label">Apparence</span>
            </div>
          </div>

          <!-- Barre de progression -->
          <div class="sm-progress-track">
            <div class="sm-progress-fill" id="sm-progress" style="width:25%"></div>
          </div>
        </div>

        <!-- BODY -->
        <div class="sm-body" id="sm-body">

          <!-- ═══ SLIDE 0 — Informations boutique ═══ -->
          <div class="sm-slide sm-visible" id="sm-slide-0">
            <p class="sm-slide-title">🏪 Votre boutique</p>
            <p class="sm-slide-sub">Ces informations sont affichées à vos clients sur votre page publique.</p>

            <div class="sm-error-box" id="sm-err-0"></div>

            <div class="sm-field">
              <label class="sm-label">Nom de la boutique <span class="sm-req">Requis</span></label>
              <input id="sm-name" class="sm-input" type="text" placeholder="Ex: Boutique Élégance" maxlength="80" autocomplete="off">
            </div>

            <div class="sm-grid2">
              <div class="sm-field">
                <label class="sm-label">E-mail <span class="sm-req">Requis</span></label>
                <input id="sm-email" class="sm-input" type="email" placeholder="contact@maboutique.com" autocomplete="off">
              </div>
              <div class="sm-field">
                <label class="sm-label">Téléphone <span class="sm-req">Requis</span></label>
                <input id="sm-phone" class="sm-input" type="tel" placeholder="+237 6XX XXX XXX" autocomplete="off">
              </div>
            </div>

            <div class="sm-field">
              <label class="sm-label">Adresse / Ville <span class="sm-req">Requis</span></label>
              <input id="sm-address" class="sm-input" type="text" placeholder="Douala, Cameroun" autocomplete="off">
            </div>

            <div class="sm-field">
              <label class="sm-label">Description <span class="sm-opt">Facultatif</span></label>
              <textarea id="sm-desc" class="sm-textarea" placeholder="Présentez votre boutique en quelques phrases..."></textarea>
            </div>
          </div>

          <!-- ═══ SLIDE 1 — Paiement (OBLIGATOIRE) ═══ -->
          <div class="sm-slide" id="sm-slide-1">
            <p class="sm-slide-title">💳 Modes de paiement</p>
            <p class="sm-slide-sub">Choisissez comment vos clients règlent leurs commandes.</p>

            <div class="sm-error-box" id="sm-err-1"></div>

            <div class="sm-pay-warning">
              ⚡ Au moins un mode de paiement est requis pour activer votre boutique.
            </div>

            <div class="sm-pay-cards">

              <!-- Mobile Money -->
              <div class="sm-pay-card" id="sm-pc-mobile" data-key="mobile">
                <div class="sm-pay-icon sm-pi-mobile">📱</div>
                <div class="sm-pay-info">
                  <p class="sm-pay-name">Mobile Money</p>
                  <p class="sm-pay-desc">MTN MoMo &amp; Orange Money</p>
                </div>
                <div class="sm-pay-check" id="sm-chk-mobile">✓</div>
              </div>

              <!-- Sous-panel Mobile Money -->
              <div class="sm-sub-panel" id="sm-mobile-panel">
                <!-- MTN -->
                <p class="sm-sub-title sm-sub-mtn">🟡 MTN MoMo</p>
                <div class="sm-grid2">
                  <div class="sm-field" style="margin-bottom:10px;">
                    <label class="sm-label" style="font-size:.72rem;">Numéro</label>
                    <input id="sm-mtn-num" class="sm-input" type="tel" placeholder="6XX XXX XXX" style="padding:10px 14px;">
                  </div>
                  <div class="sm-field" style="margin-bottom:10px;">
                    <label class="sm-label" style="font-size:.72rem;">Nom du compte</label>
                    <input id="sm-mtn-nom" class="sm-input" type="text" placeholder="Jean Dupont" style="padding:10px 14px;">
                  </div>
                </div>
                <!-- Orange -->
                <p class="sm-sub-title sm-sub-orange">🟠 Orange Money</p>
                <div class="sm-grid2">
                  <div class="sm-field" style="margin-bottom:4px;">
                    <label class="sm-label" style="font-size:.72rem;">Numéro</label>
                    <input id="sm-orange-num" class="sm-input" type="tel" placeholder="6XX XXX XXX" style="padding:10px 14px;">
                  </div>
                  <div class="sm-field" style="margin-bottom:4px;">
                    <label class="sm-label" style="font-size:.72rem;">Nom du compte</label>
                    <input id="sm-orange-nom" class="sm-input" type="text" placeholder="Jean Dupont" style="padding:10px 14px;">
                  </div>
                </div>
              </div>

              <!-- Cash -->
              <div class="sm-pay-card" id="sm-pc-cash" data-key="cash">
                <div class="sm-pay-icon sm-pi-cash">💵</div>
                <div class="sm-pay-info">
                  <p class="sm-pay-name">Paiement à la livraison</p>
                  <p class="sm-pay-desc">Le client paie en espèces à la réception</p>
                </div>
                <div class="sm-pay-check" id="sm-chk-cash">✓</div>
              </div>

              <!-- Carte -->
              <div class="sm-pay-card" id="sm-pc-carte" data-key="carte">
                <div class="sm-pay-icon sm-pi-carte">💳</div>
                <div class="sm-pay-info">
                  <p class="sm-pay-name">Carte bancaire</p>
                  <p class="sm-pay-desc">Visa, Mastercard (configuration avancée)</p>
                </div>
                <div class="sm-pay-check" id="sm-chk-carte">✓</div>
              </div>

            </div><!-- /sm-pay-cards -->

            <!-- Devise -->
            <div class="sm-devise-row">
              <span class="sm-devise-label">Devise :</span>
              <select id="sm-devise" class="sm-select" style="flex:1;padding:9px 12px;border:none;background:transparent;">
                <option value="FCFA">FCFA — Franc CFA</option>
                <option value="EUR">EUR — Euro</option>
                <option value="USD">USD — Dollar US</option>
                <option value="XAF">XAF — Franc CFA (CEMAC)</option>
                <option value="GHS">GHS — Cedi Ghanéen</option>
                <option value="NGN">NGN — Naira Nigérian</option>
                <option value="KES">KES — Shilling Kenyan</option>
              </select>
            </div>
          </div>

          <!-- ═══ SLIDE 2 — Livraison ═══ -->
          <div class="sm-slide" id="sm-slide-2">
            <p class="sm-slide-title">🚚 Livraison</p>
            <p class="sm-slide-sub">Frais et délais affichés lors du paiement client.</p>

            <div class="sm-error-box" id="sm-err-2"></div>

            <div class="sm-grid2">
              <div class="sm-field">
                <label class="sm-label">Frais Douala <span class="sm-req">Requis</span></label>
                <input id="sm-frais-dla" class="sm-input" type="number" min="0" value="1000">
                <span class="sm-hint">En FCFA</span>
              </div>
              <div class="sm-field">
                <label class="sm-label">Autres villes <span class="sm-req">Requis</span></label>
                <input id="sm-frais-autres" class="sm-input" type="number" min="0" value="2500">
                <span class="sm-hint">En FCFA</span>
              </div>
            </div>

            <div class="sm-field">
              <label class="sm-label">Délai de livraison <span class="sm-req">Requis</span></label>
              <div class="sm-delai-chips" id="sm-delai-chips">
                <span class="sm-chip" data-val="24h">24h</span>
                <span class="sm-chip sm-chip-on" data-val="2-5 jours ouvrables">2-5 jours</span>
                <span class="sm-chip" data-val="1-2 semaines">1-2 semaines</span>
                <span class="sm-chip" data-val="Sur commande">Sur commande</span>
              </div>
              <input id="sm-delai" class="sm-input" type="text" value="2-5 jours ouvrables" placeholder="Ex: 3-7 jours ouvrables">
            </div>

            <div class="sm-field">
              <label class="sm-label">Livraison gratuite dès <span class="sm-opt">Facultatif</span></label>
              <input id="sm-gratuit-montant" class="sm-input" type="number" min="0" value="50000" placeholder="0 = désactivé">
              <span class="sm-hint">Mettez 0 pour désactiver. Au-dessus de ce montant, la livraison est offerte.</span>
            </div>
          </div>

          <!-- ═══ SLIDE 3 — Apparence ═══ -->
          <div class="sm-slide" id="sm-slide-3">
            <p class="sm-slide-title">🎨 Apparence</p>
            <p class="sm-slide-sub">L'identité visuelle de votre boutique. Tout est facultatif.</p>

            <!-- Couleurs -->
            <div class="sm-field">
              <label class="sm-label">Couleurs <span class="sm-opt">Facultatif</span></label>
              <div class="sm-color-row">
                <div class="sm-color-card">
                  <div class="sm-swatch-wrap" id="sm-sw-primary">
                    <div class="sm-swatch-fill" id="sm-sf-primary" style="background:#007AFF;"></div>
                    <input type="color" id="sm-col-primary" value="#007AFF">
                  </div>
                  <div class="sm-color-info">
                    <p class="sm-cc-name">Principale</p>
                    <p class="sm-cc-val" id="sm-cv-primary">#007AFF</p>
                  </div>
                </div>
                <div class="sm-color-card">
                  <div class="sm-swatch-wrap" id="sm-sw-secondary">
                    <div class="sm-swatch-fill" id="sm-sf-secondary" style="background:#1A1A1A;"></div>
                    <input type="color" id="sm-col-secondary" value="#1A1A1A">
                  </div>
                  <div class="sm-color-info">
                    <p class="sm-cc-name">Secondaire</p>
                    <p class="sm-cc-val" id="sm-cv-secondary">#1A1A1A</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Police -->
            <div class="sm-field">
              <label class="sm-label">Police <span class="sm-opt">Facultatif</span></label>
              <select id="sm-police" class="sm-select">
                <option value="Poppins">Poppins</option>
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Raleway">Raleway</option>
                <option value="Playfair Display">Playfair Display</option>
              </select>
            </div>

            <!-- Logo & Favicon -->
            <div class="sm-field">
              <label class="sm-label">Logo &amp; Favicon <span class="sm-opt">Facultatif</span></label>
              <div class="sm-upload-row">
                <div class="sm-upload-card" id="sm-card-logo">
                  <span class="sm-uc-icon">🖼️</span>
                  <img class="sm-uc-preview" id="sm-prev-logo" alt="">
                  <p class="sm-uc-name">Logo</p>
                  <p class="sm-uc-hint">PNG, JPG · max 2 MB</p>
                  <input type="file" id="sm-file-logo" accept="image/*">
                </div>
                <div class="sm-upload-card" id="sm-card-favicon">
                  <span class="sm-uc-icon">🔖</span>
                  <img class="sm-uc-preview" id="sm-prev-favicon" alt="">
                  <p class="sm-uc-name">Favicon</p>
                  <p class="sm-uc-hint">PNG · 32×32 px</p>
                  <input type="file" id="sm-file-favicon" accept="image/*">
                </div>
              </div>
            </div>

            <!-- Identifiant -->
            <div class="sm-field">
              <label class="sm-label">Identifiant boutique <span class="sm-opt">Facultatif</span></label>
              <div class="sm-slug-row">
                <span class="sm-slug-prefix">oda.shop/</span>
                <input id="sm-slug" class="sm-slug-input" type="text" placeholder="ma-boutique" maxlength="50">
              </div>
              <span class="sm-slug-status" id="sm-slug-status"></span>
              <span class="sm-hint">Lettres minuscules, chiffres et tirets. Laissez vide pour garder l'ID automatique.</span>
            </div>
          </div>

          <!-- ═══ SUCCÈS ═══ -->
          <div class="sm-success-screen" id="sm-success">
            <div class="sm-success-ball">✅</div>
            <h2 class="sm-success-title">Boutique prête !</h2>
            <p class="sm-success-sub">
              Votre boutique est configurée et <strong>prête à recevoir des clients</strong>.
              Partagez-la, visitez-la ou affinez vos réglages depuis <strong>Paramètres</strong>.
            </p>

            <!-- ── Boutons d'action ── -->
            <div class="sm-success-actions">

              <!-- Bouton principal : Voir ma boutique -->
              <button class="sm-btn sm-btn-view-shop" id="sm-goto-boutique">
                🏪 Voir ma boutique
              </button>

              <!-- Ligne secondaire : Partager + Paramètres -->
              <div class="sm-success-actions-row">
                <button class="sm-btn sm-btn-share" id="sm-btn-share-link">
                  🔗 Partager le lien
                </button>
                <button class="sm-btn sm-btn-param" id="sm-goto-param">
                  ⚙️ Paramètres
                </button>
              </div>

            </div>
          </div>

        </div><!-- /sm-body -->

        <!-- FOOTER -->
        <div class="sm-footer" id="sm-footer">
          <button class="sm-skip-btn" id="sm-btn-skip">Configurer plus tard</button>
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="sm-btn sm-btn-ghost" id="sm-btn-prev" style="display:none;">← Retour</button>
            <button class="sm-btn sm-btn-primary" id="sm-btn-next">Suivant →</button>
          </div>
        </div>

      </div>
    </div>

    <!-- Toast copie lien -->
    <div id="sm-copy-toast">✅ Lien copié dans le presse-papier !</div>
    `;
  }

  /* ═══════════════════════════════════════════════════════
     LOGIQUE
  ═══════════════════════════════════════════════════════ */
  const TOTAL = 4;
  let step = 0;
  let paySelected = new Set(); // modes de paiement sélectionnés
  let uploads = { logo: null, favicon: null };
  let currentUser = null;
  let sb = null;
  let existingCfg = null;

  /* ── Progression ── */
  function setProgress(s) {
    const pct = Math.round(((s + 1) / TOTAL) * 100);
    const fill = document.getElementById('sm-progress');
    if (fill) fill.style.width = pct + '%';
    document.getElementById('sm-step-counter').textContent = `Étape ${s + 1} sur ${TOTAL}`;

    document.querySelectorAll('#sm-step-dots .sm-dot').forEach((dot, i) => {
      dot.classList.remove('active', 'done');
      if (i < s) dot.classList.add('done');
      else if (i === s) dot.classList.add('active');
    });
  }

  /* ── Navigation ── */
  function goTo(newStep) {
    const current = document.getElementById('sm-slide-' + step);
    if (current) {
      current.classList.add('sm-out');
      setTimeout(() => {
        current.classList.remove('sm-visible', 'sm-out');
        step = newStep;
        const next = document.getElementById('sm-slide-' + step);
        if (next) next.classList.add('sm-visible');
        setProgress(step);
        document.getElementById('sm-btn-prev').style.display = step === 0 ? 'none' : 'inline-flex';
        document.getElementById('sm-btn-next').innerHTML = step === TOTAL - 1 ? '<span>✓ Terminer</span>' : 'Suivant →';
        document.getElementById('sm-body').scrollTo({ top: 0, behavior: 'smooth' });
      }, 250);
    }
  }

  /* ── Erreur inline ── */
  function showErr(slideIdx, msg) {
    const box = document.getElementById('sm-err-' + slideIdx);
    if (!box) return;
    box.textContent = '⚠️ ' + msg;
    box.style.display = 'block';
    setTimeout(() => { box.style.display = 'none'; }, 4500);
  }

  /* ── Validation ── */
  function validate(s) {
    const v = id => (document.getElementById(id)?.value || '').trim();
    if (s === 0) {
      if (!v('sm-name')) return { ok: false, msg: 'Le nom de la boutique est requis.' };
      if (!v('sm-email') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('sm-email')))
        return { ok: false, msg: 'Un e-mail valide est requis.' };
      if (!v('sm-phone')) return { ok: false, msg: 'Le numéro de téléphone est requis.' };
      if (!v('sm-address')) return { ok: false, msg: "L'adresse est requise." };
    }
    if (s === 1) {
      if (paySelected.size === 0)
        return { ok: false, msg: 'Sélectionnez au moins un mode de paiement.' };
    }
    if (s === 2) {
      if (isNaN(parseInt(v('sm-frais-dla'))) || parseInt(v('sm-frais-dla')) < 0)
        return { ok: false, msg: 'Les frais de livraison Douala sont invalides.' };
      if (!v('sm-delai'))
        return { ok: false, msg: 'Indiquez un délai de livraison.' };
    }
    return { ok: true };
  }

  /* ── Pré-remplissage ── */
  function prefill(cfg) {
    if (!cfg) return;
    const set = (id, val) => { const el = document.getElementById(id); if (el && val != null) el.value = val; };
    const g = cfg.general || {};
    set('sm-name', g.nom); set('sm-email', g.email);
    set('sm-phone', g.telephone); set('sm-address', g.adresse);
    set('sm-desc', g.description);

    const p = cfg.paiement || {};
    if ((p.mobile || {}).actif) togglePay('mobile');
    if ((p.cash || {}).actif)   togglePay('cash');
    if ((p.carte || {}).actif)  togglePay('carte');
    set('sm-devise', p.devise || 'FCFA');
    set('sm-mtn-num',    ((p.mobile || {}).mtn || {}).numero);
    set('sm-mtn-nom',    ((p.mobile || {}).mtn || {}).nomCompte);
    set('sm-orange-num', ((p.mobile || {}).orange || {}).numero);
    set('sm-orange-nom', ((p.mobile || {}).orange || {}).nomCompte);

    const l = cfg.livraison || {};
    set('sm-frais-dla',        l.fraisDouala || 1000);
    set('sm-frais-autres',     l.fraisAutres || 2500);
    set('sm-delai',            l.delai || '2-5 jours ouvrables');
    set('sm-gratuit-montant',  l.montantMin || 50000);

    const a = cfg.apparence || {};
    if (a.couleurPrimaire) {
      set('sm-col-primary', a.couleurPrimaire);
      const sf = document.getElementById('sm-sf-primary');
      if (sf) sf.style.background = a.couleurPrimaire;
      const cv = document.getElementById('sm-cv-primary');
      if (cv) cv.textContent = a.couleurPrimaire;
    }
    if (a.couleurSecondaire) {
      set('sm-col-secondary', a.couleurSecondaire);
      const sf = document.getElementById('sm-sf-secondary');
      if (sf) sf.style.background = a.couleurSecondaire;
      const cv = document.getElementById('sm-cv-secondary');
      if (cv) cv.textContent = a.couleurSecondaire;
    }
    set('sm-police', a.police);
    const ident = cfg.identifiant || {};
    if (ident.slug && !ident.auto) set('sm-slug', ident.slug);
  }

  /* ── Toggle paiement ── */
  function togglePay(key) {
    const card = document.getElementById('sm-pc-' + key);
    if (!card) return;
    if (paySelected.has(key)) {
      paySelected.delete(key);
      card.classList.remove('sm-selected');
      if (key === 'mobile') document.getElementById('sm-mobile-panel')?.classList.remove('sm-open');
    } else {
      paySelected.add(key);
      card.classList.add('sm-selected');
      if (key === 'mobile') document.getElementById('sm-mobile-panel')?.classList.add('sm-open');
    }
  }

  /* ── Collecte des données ── */
  function collectData() {
    const v = id => (document.getElementById(id)?.value || '').trim();
    const cfg = { ...(existingCfg || {}) };

    cfg.general = {
      nom: v('sm-name'), email: v('sm-email'),
      telephone: v('sm-phone'), adresse: v('sm-address'),
      description: v('sm-desc')
    };

    const mobileOn = paySelected.has('mobile');
    cfg.paiement = {
      carte: { actif: paySelected.has('carte') },
      cash:  { actif: paySelected.has('cash') },
      mobile: {
        actif: mobileOn,
        mtn: {
          actif: mobileOn && v('sm-mtn-num') !== '',
          numero: v('sm-mtn-num'), nomCompte: v('sm-mtn-nom')
        },
        orange: {
          actif: mobileOn && v('sm-orange-num') !== '',
          numero: v('sm-orange-num'), nomCompte: v('sm-orange-nom')
        }
      },
      devise: v('sm-devise') || 'FCFA'
    };

    const montant = parseInt(v('sm-gratuit-montant')) || 0;
    cfg.livraison = {
      fraisDouala: parseInt(v('sm-frais-dla')) || 1000,
      fraisAutres: parseInt(v('sm-frais-autres')) || 2500,
      delai: v('sm-delai') || '2-5 jours ouvrables',
      gratuit: montant > 0, montantMin: montant,
      zonesPersonnalisees: (cfg.livraison || {}).zonesPersonnalisees || []
    };

    cfg.apparence = {
      couleurPrimaire:   document.getElementById('sm-col-primary')?.value  || '#007AFF',
      couleurSecondaire: document.getElementById('sm-col-secondary')?.value || '#1A1A1A',
      police: v('sm-police') || 'Poppins',
      logo:    uploads.logo    || (cfg.apparence || {}).logo    || '',
      favicon: uploads.favicon || (cfg.apparence || {}).favicon || ''
    };

    const slug = v('sm-slug').toLowerCase().replace(/[^a-z0-9\-]/g, '');
    if (slug.length >= 4) {
      cfg.identifiant = { ...(cfg.identifiant || {}), slug, auto: false, disponible: true };
      cfg.slug = slug;
    }

    return cfg;
  }

  /* ── Sauvegarde ── */
  async function save() {
    const cfg = collectData();
    try {
      await sb.from('parametres_boutique').upsert(
        { user_id: currentUser.id, config: cfg, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    } catch (e) { console.warn('⚠️ Supabase save error:', e); }
    try {
      localStorage.setItem(`parametres_${currentUser.id}`, JSON.stringify(cfg));
      localStorage.setItem('parametres_boutique', JSON.stringify(cfg));
    } catch (e) { /* ignore */ }
    return cfg;
  }

  /* ── Upload image ── */
  function bindUpload(inputId, previewId, cardId, key) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) { alert('Image trop lourde (max 2 MB).'); return; }
      const reader = new FileReader();
      reader.onload = ev => {
        uploads[key] = ev.target.result;
        const prev = document.getElementById(previewId);
        if (prev) prev.src = ev.target.result;
        document.getElementById(cardId)?.classList.add('sm-has-img');
      };
      reader.readAsDataURL(file);
    });
  }

  /* ── Obtenir l'URL de la boutique ── */
  function getShopUrl(cfg) {
    const slug = cfg?.slug || cfg?.identifiant?.slug || currentUser?.id || '';
    return `https://oda.shop/${slug}`;
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
