(function (global) {
  'use strict';

  /* ─────────────────────────────────────────
     CONFIG
  ───────────────────────────────────────── */
  const SUPABASE_URL      = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';
  const LS_KEY            = 'oda_announcement';
  const LS_SEEN_KEY       = 'oda_notif_last_seen';
  const POLL_INTERVAL     = 10000; // 10 sec
  const BC_CHANNEL_NAME   = 'oda_admin_broadcast';

  /* ─────────────────────────────────────────
     ÉTAT INTERNE
  ───────────────────────────────────────── */
  let _supabase        = null;
  let _realtimeChannel = null;
  let _bc              = null;
  let _pollTimer       = null;
  let _lastSeenId      = localStorage.getItem(LS_SEEN_KEY) || null;
  let _unreadCount     = 0;
  let _history         = [];
  let _initialized     = false;

  /* ─────────────────────────────────────────
     INJECTION DU DOM (modal + badge)
  ───────────────────────────────────────── */
  function _injectDOM() {
    if (document.getElementById('oda-notif-root')) return;

    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

      /* ── Root ── */
      #oda-notif-root {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        z-index: 99999;
        pointer-events: none;
      }

      /* ── Overlay sombre (backdrop) ── */
      #oda-notif-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(3px);
        -webkit-backdrop-filter: blur(3px);
        z-index: 99999;
        pointer-events: all;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.35s ease, visibility 0.35s ease;
      }
      #oda-notif-overlay.visible {
        opacity: 1;
        visibility: visible;
      }

      /* ── Modal principal ── */
      #oda-notif-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.88);
        z-index: 100000;
        pointer-events: all;
        width: min(420px, calc(100vw - 32px));

        /* Glassmorphism */
        background: rgba(15, 15, 30, 0.72);
        backdrop-filter: blur(28px) saturate(160%);
        -webkit-backdrop-filter: blur(28px) saturate(160%);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 24px;
        box-shadow:
          0 32px 80px rgba(0, 0, 0, 0.55),
          0 0 0 1px rgba(255, 255, 255, 0.05) inset,
          0 2px 0 rgba(255, 255, 255, 0.08) inset;

        font-family: 'DM Sans', system-ui, sans-serif;
        overflow: hidden;
        opacity: 0;
        visibility: hidden;
        transition:
          opacity 0.4s cubic-bezier(.25,.8,.25,1),
          transform 0.4s cubic-bezier(.25,.8,.25,1),
          visibility 0.4s ease;
      }
      #oda-notif-modal.visible {
        opacity: 1;
        visibility: visible;
        transform: translate(-50%, -50%) scale(1);
      }

      /* ── Bande colorée en haut selon le type ── */
      #oda-notif-modal-stripe {
        height: 4px;
        width: 100%;
        transition: background 0.3s ease;
      }
      #oda-notif-modal.type-info    #oda-notif-modal-stripe { background: linear-gradient(90deg, #06B6D4, #3B82F6); }
      #oda-notif-modal.type-warning #oda-notif-modal-stripe { background: linear-gradient(90deg, #F59E0B, #EF4444); }
      #oda-notif-modal.type-success #oda-notif-modal-stripe { background: linear-gradient(90deg, #10B981, #06B6D4); }
      #oda-notif-modal.type-urgent  #oda-notif-modal-stripe {
        background: linear-gradient(90deg, #EF4444, #7C3AED);
        animation: oda-stripe-pulse 1.4s infinite alternate;
      }
      @keyframes oda-stripe-pulse {
        from { filter: brightness(1); }
        to   { filter: brightness(1.4); }
      }

      /* ── Corps du modal ── */
      #oda-notif-modal-body {
        padding: 24px 24px 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      /* ── En-tête : icône + titre + bouton fermer ── */
      .oda-modal-header {
        display: flex;
        align-items: flex-start;
        gap: 14px;
      }

      /* ── Icône dans un cercle lumineux ── */
      .oda-modal-icon-wrap {
        flex-shrink: 0;
        width: 48px; height: 48px;
        border-radius: 14px;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.55rem;
        animation: oda-icon-pop 0.5s cubic-bezier(.25,.8,.25,1) both;
      }
      @keyframes oda-icon-pop {
        0%   { transform: scale(0.3) rotate(-15deg); opacity: 0; }
        65%  { transform: scale(1.15) rotate(4deg); }
        100% { transform: scale(1) rotate(0); opacity: 1; }
      }
      #oda-notif-modal.type-info    .oda-modal-icon-wrap { background: rgba(6,182,212,0.18); }
      #oda-notif-modal.type-warning .oda-modal-icon-wrap { background: rgba(245,158,11,0.18); }
      #oda-notif-modal.type-success .oda-modal-icon-wrap { background: rgba(16,185,129,0.18); }
      #oda-notif-modal.type-urgent  .oda-modal-icon-wrap { background: rgba(239,68,68,0.18); }

      .oda-modal-title-area {
        flex: 1;
        min-width: 0;
      }
      #oda-modal-title {
        font-size: 1rem;
        font-weight: 700;
        color: #F0EEF9;
        line-height: 1.3;
        margin: 0 0 4px;
      }
      #oda-modal-type-badge {
        display: inline-block;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        padding: 2px 8px;
        border-radius: 99px;
      }
      #oda-notif-modal.type-info    #oda-modal-type-badge { background:rgba(6,182,212,0.2);  color:#67E8F9; border:1px solid rgba(6,182,212,0.3); }
      #oda-notif-modal.type-warning #oda-modal-type-badge { background:rgba(245,158,11,0.2); color:#FDE68A; border:1px solid rgba(245,158,11,0.3); }
      #oda-notif-modal.type-success #oda-modal-type-badge { background:rgba(16,185,129,0.2); color:#34D399; border:1px solid rgba(16,185,129,0.3); }
      #oda-notif-modal.type-urgent  #oda-modal-type-badge { background:rgba(239,68,68,0.2);  color:#FCA5A5; border:1px solid rgba(239,68,68,0.3); }

      /* ── Bouton fermer ── */
      #oda-modal-close {
        flex-shrink: 0;
        width: 32px; height: 32px;
        border-radius: 50%;
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.10);
        color: rgba(240,238,249,0.55);
        font-size: 14px;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.2s, color 0.2s, transform 0.2s;
        font-family: inherit;
        line-height: 1;
      }
      #oda-modal-close:hover {
        background: rgba(239,68,68,0.22);
        color: #FCA5A5;
        transform: rotate(90deg);
      }

      /* ── Message ── */
      #oda-modal-msg {
        font-size: 0.88rem;
        color: rgba(240,238,249,0.72);
        line-height: 1.6;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 12px;
        padding: 14px 16px;
        margin: 0;
      }

      /* ── Footer : heure + bouton historique ── */
      .oda-modal-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      #oda-modal-time {
        font-size: 0.73rem;
        color: rgba(240,238,249,0.28);
        letter-spacing: 0.2px;
      }
      #oda-modal-history-btn {
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 10px;
        color: rgba(240,238,249,0.65);
        padding: 6px 14px;
        cursor: pointer;
        font-size: 0.78rem;
        font-weight: 600;
        transition: background 0.2s, color 0.2s;
        font-family: inherit;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      #oda-modal-history-btn:hover {
        background: rgba(255,255,255,0.14);
        color: #F0EEF9;
      }

      /* ── Barre de progression auto-dismiss ── */
      #oda-modal-progress {
        height: 3px;
        background: rgba(255,255,255,0.08);
        border-radius: 0 0 24px 24px;
        overflow: hidden;
        display: none;
      }
      #oda-modal-progress-bar {
        height: 100%;
        width: 100%;
        transform-origin: left;
        transition: transform linear;
      }
      #oda-notif-modal.type-info    #oda-modal-progress-bar { background: linear-gradient(90deg,#06B6D4,#3B82F6); }
      #oda-notif-modal.type-warning #oda-modal-progress-bar { background: linear-gradient(90deg,#F59E0B,#EF4444); }
      #oda-notif-modal.type-success #oda-modal-progress-bar { background: linear-gradient(90deg,#10B981,#06B6D4); }
      #oda-notif-modal.type-urgent  #oda-modal-progress-bar { background: linear-gradient(90deg,#EF4444,#7C3AED); }

      /* ── FAB flottant ── */
      #oda-notif-fab {
        position: fixed; bottom: 24px; right: 24px; z-index: 99998;
        width: 52px; height: 52px; border-radius: 50%;
        background: linear-gradient(135deg,#7C3AED,#06B6D4);
        border: none; cursor: pointer; color: white; font-size: 1.3rem;
        display: none; align-items: center; justify-content: center;
        box-shadow: 0 6px 24px rgba(124,58,237,0.5);
        transition: transform 0.25s, box-shadow 0.25s;
        font-family: inherit;
        animation: oda-fab-in 0.4s cubic-bezier(.25,.8,.25,1) both;
      }
      #oda-notif-fab:hover { transform: scale(1.1); box-shadow: 0 10px 32px rgba(124,58,237,0.65); }
      @keyframes oda-fab-in {
        from { transform: scale(0); opacity: 0; }
        to   { transform: scale(1); opacity: 1; }
      }
      #oda-notif-fab-badge {
        position: absolute; top: -4px; right: -4px;
        background: #EF4444; color: white;
        font-size: 0.62rem; font-weight: 800;
        min-width: 18px; height: 18px; border-radius: 99px;
        display: none; align-items: center; justify-content: center;
        border: 2px solid white; padding: 0 4px;
      }

      /* ── Panneau historique ── */
      #oda-notif-history-panel {
        position: fixed; bottom: 84px; right: 24px; z-index: 99998;
        width: 340px; max-height: 420px; overflow-y: auto;
        background: rgba(15,15,30,0.85);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.10);
        border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        font-family: 'DM Sans', system-ui, sans-serif;
        display: none;
        animation: oda-panel-in 0.3s cubic-bezier(.25,.8,.25,1) both;
      }
      @keyframes oda-panel-in {
        from { opacity: 0; transform: translateY(16px) scale(0.97); }
        to   { opacity: 1; transform: none; }
      }
      .oda-panel-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.08);
        font-weight: 700; font-size: 0.88rem; color: #F0EEF9;
        position: sticky; top: 0;
        background: rgba(15,15,30,0.95);
        backdrop-filter: blur(10px);
      }
      .oda-panel-header button {
        background: none; border: none; color: rgba(240,238,249,0.4);
        cursor: pointer; font-size: 0.75rem; font-family: inherit;
      }
      .oda-panel-header button:hover { color: #FCA5A5; }
      .oda-panel-empty {
        padding: 32px; text-align: center;
        color: rgba(240,238,249,0.35); font-size: 0.85rem;
      }
      .oda-hist-item {
        display: flex; gap: 10px; padding: 12px 16px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        transition: background 0.2s;
      }
      .oda-hist-item:hover { background: rgba(255,255,255,0.04); }
      .oda-hist-item:last-child { border-bottom: none; }
      .oda-hist-icon { font-size: 1.2rem; flex-shrink: 0; }
      .oda-hist-body { flex: 1; min-width: 0; }
      .oda-hist-title { font-weight: 600; font-size: 0.85rem; color: #F0EEF9;
                        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .oda-hist-msg   { font-size: 0.78rem; color: rgba(240,238,249,0.55); margin-top: 2px; }
      .oda-hist-time  { font-size: 0.7rem; color: rgba(240,238,249,0.3); margin-top: 3px; }
      .oda-hist-badge {
        flex-shrink: 0; font-size: 0.65rem; font-weight: 700;
        padding: 2px 7px; border-radius: 99px; align-self: flex-start;
      }
      .oda-badge-info    { background:rgba(6,182,212,0.2);  color:#67E8F9; border:1px solid rgba(6,182,212,0.3); }
      .oda-badge-warning { background:rgba(245,158,11,0.2); color:#FDE68A; border:1px solid rgba(245,158,11,0.3); }
      .oda-badge-success { background:rgba(16,185,129,0.2); color:#34D399; border:1px solid rgba(16,185,129,0.3); }
      .oda-badge-urgent  { background:rgba(239,68,68,0.2);  color:#FCA5A5; border:1px solid rgba(239,68,68,0.3); }

      /* ── Bloc permission intégré dans le modal ── */
      #oda-modal-permission-row {
        display: none;
        align-items: center;
        gap: 12px;
        background: rgba(124, 58, 237, 0.10);
        border: 1px solid rgba(124, 58, 237, 0.22);
        border-radius: 12px;
        padding: 11px 14px;
      }
      #oda-modal-permission-row.visible { display: flex; }
      #oda-modal-permission-row .oda-perm-icon {
        font-size: 1.15rem; flex-shrink: 0;
      }
      #oda-modal-permission-row .oda-perm-text {
        flex: 1;
        font-size: 0.78rem;
        color: rgba(240,238,249,0.65);
        line-height: 1.4;
      }
      #oda-modal-permission-row .oda-perm-btn {
        flex-shrink: 0;
        background: linear-gradient(135deg, #7C3AED, #06B6D4);
        border: none; border-radius: 8px; color: white;
        padding: 6px 14px; cursor: pointer;
        font-size: 0.78rem; font-weight: 700;
        font-family: inherit;
        white-space: nowrap;
        transition: opacity 0.2s, transform 0.2s;
      }
      #oda-modal-permission-row .oda-perm-btn:hover {
        opacity: 0.88; transform: scale(1.03);
      }
      #oda-modal-permission-row .oda-perm-dismiss {
        flex-shrink: 0;
        background: none; border: none;
        color: rgba(240,238,249,0.3);
        cursor: pointer; font-size: 0.7rem;
        font-family: inherit; padding: 2px 4px;
        transition: color 0.2s;
      }
      #oda-modal-permission-row .oda-perm-dismiss:hover { color: #FCA5A5; }

      /* ── Responsive ── */
      @media (max-width: 480px) {
        #oda-notif-modal {
          width: calc(100vw - 24px);
          border-radius: 20px;
        }
      }
    `;
    document.head.appendChild(style);

    // ── Overlay
    const overlay = document.createElement('div');
    overlay.id = 'oda-notif-overlay';
    overlay.addEventListener('click', () => _api.dismissBanner());
    document.body.appendChild(overlay);

    // ── Modal
    const modal = document.createElement('div');
    modal.id = 'oda-notif-modal';
    modal.className = 'type-info';
    modal.innerHTML = `
      <div id="oda-notif-modal-stripe"></div>
      <div id="oda-notif-modal-body">

        <div class="oda-modal-header">
          <div class="oda-modal-icon-wrap">
            <span id="oda-modal-icon">📢</span>
          </div>
          <div class="oda-modal-title-area">
            <p id="oda-modal-title">Annonce</p>
            <span id="oda-modal-type-badge">Info</span>
          </div>
          <button id="oda-modal-close" title="Fermer" onclick="window.odaNotifications.dismissBanner()">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/>
            </svg>
          </button>
        </div>

        <p id="oda-modal-msg"></p>

        <div class="oda-modal-footer">
          <span id="oda-modal-time">À l'instant</span>
          <button id="oda-modal-history-btn" onclick="window.odaNotifications.toggleHistory()">
            📋 Historique
          </button>
        </div>

        <!-- Bouton activation notifications — intégré dans la fenêtre, jamais dans le header -->
        <div id="oda-modal-permission-row">
          <span class="oda-perm-icon">🔔</span>
          <span class="oda-perm-text">Activez les notifications pour recevoir les annonces en temps réel</span>
          <button class="oda-perm-btn" onclick="window.odaNotifications.requestPermission()">Activer</button>
          <button class="oda-perm-dismiss" title="Ignorer" onclick="window.odaNotifications.dismissPermissionRow()">✕</button>
        </div>

      </div>
      <div id="oda-modal-progress">
        <div id="oda-modal-progress-bar"></div>
      </div>
    `;
    document.body.appendChild(modal);

    // ── FAB flottant
    const fab = document.createElement('button');
    fab.id = 'oda-notif-fab';
    fab.title = 'Annonces admin';
    fab.innerHTML = `📢 <span id="oda-notif-fab-badge"></span>`;
    fab.onclick = () => _api.toggleHistory();
    document.body.appendChild(fab);

    // ── Panneau historique
    const panel = document.createElement('div');
    panel.id = 'oda-notif-history-panel';
    panel.innerHTML = `
      <div class="oda-panel-header">
        <span>📋 Annonces admin</span>
        <button onclick="window.odaNotifications.clearHistory()">Tout effacer</button>
      </div>
      <div id="oda-hist-list"><div class="oda-panel-empty">Aucune annonce reçue</div></div>
    `;
    document.body.appendChild(panel);

    // Fermer panneau historique au clic extérieur
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('oda-notif-history-panel');
      const fab   = document.getElementById('oda-notif-fab');
      if (panel && panel.style.display === 'block') {
        if (!panel.contains(e.target) && e.target !== fab) {
          panel.style.display = 'none';
        }
      }
    });

    // Fermer le modal avec Échap
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') _api.dismissBanner();
    });
  }

  /* ─────────────────────────────────────────
     TIMER auto-dismiss (non urgent)
  ───────────────────────────────────────── */
  let _autoDismissTimer   = null;
  let _progressAnimFrame  = null;
  const AUTO_DISMISS_DELAY = 8000; // 8 sec pour les non-urgents

  function _startAutoDismiss(type) {
    _clearAutoDismiss();
    if (type === 'urgent') return; // Les urgents restent jusqu'à fermeture manuelle

    const progress    = document.getElementById('oda-modal-progress');
    const progressBar = document.getElementById('oda-modal-progress-bar');
    if (progress && progressBar) {
      progress.style.display    = 'block';
      progressBar.style.transition = `transform ${AUTO_DISMISS_DELAY}ms linear`;
      progressBar.style.transform  = 'scaleX(1)';
      // Déclencher l'animation au prochain frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          progressBar.style.transform = 'scaleX(0)';
        });
      });
    }

    _autoDismissTimer = setTimeout(() => {
      _api.dismissBanner();
    }, AUTO_DISMISS_DELAY);
  }

  function _clearAutoDismiss() {
    if (_autoDismissTimer) { clearTimeout(_autoDismissTimer); _autoDismissTimer = null; }
    const progressBar = document.getElementById('oda-modal-progress-bar');
    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.transform  = 'scaleX(1)';
    }
    const progress = document.getElementById('oda-modal-progress');
    if (progress) progress.style.display = 'none';
  }

  /* ─────────────────────────────────────────
     AFFICHER UNE ANNONCE (modal)
  ───────────────────────────────────────── */
  function _showBanner(ann) {
    const icons      = { info:'ℹ️', warning:'⚠️', success:'✅', urgent:'🚨' };
    const typeLabels = { info:'Info', warning:'Attention', success:'Succès', urgent:'Urgent !' };
    const icon       = ann.icon || icons[ann.type] || '📢';
    const type       = ann.type || 'info';

    const modal  = document.getElementById('oda-notif-modal');
    const overlay = document.getElementById('oda-notif-overlay');
    if (!modal) return;

    // Appliquer le type
    modal.className = `type-${type}`;

    // Remplir le contenu
    document.getElementById('oda-modal-icon').textContent       = icon;
    document.getElementById('oda-modal-title').textContent      = ann.title   || 'Annonce';
    document.getElementById('oda-modal-msg').textContent        = ann.message || '';
    document.getElementById('oda-modal-type-badge').textContent = typeLabels[type] || 'Info';
    document.getElementById('oda-modal-time').textContent       = _timeAgo(ann.created_at);

    // Afficher
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        modal.classList.add('visible');
        if (overlay) overlay.classList.add('visible');
        // Afficher la ligne "Activer" si la permission n'a pas encore été traitée
        _showPermissionBarIfNeeded();
      });
    });

    // Auto-dismiss avec barre de progression
    _startAutoDismiss(type);

    // Ajouter à l'historique
    _addToHistory(ann);

    // Notification OS
    _sendOSNotification(ann);

    // Compteur non-lus
    _unreadCount++;
    _updateBadge();

    // Marquer comme vu
    if (ann.id) {
      _lastSeenId = String(ann.id);
      localStorage.setItem(LS_SEEN_KEY, _lastSeenId);
    }
  }

  /* ─────────────────────────────────────────
     HISTORIQUE
  ───────────────────────────────────────── */
  function _addToHistory(ann) {
    _history.unshift(ann);
    if (_history.length > 30) _history.pop();
    _renderHistory();
  }

  function _renderHistory() {
    const list = document.getElementById('oda-hist-list');
    if (!list) return;

    if (!_history.length) {
      list.innerHTML = '<div class="oda-panel-empty">Aucune annonce reçue</div>';
      return;
    }

    const typeLabels = { info:'Info', warning:'Attention', success:'Succès', urgent:'Urgent' };
    list.innerHTML = _history.map(ann => `
      <div class="oda-hist-item">
        <span class="oda-hist-icon">${ann.icon || '📢'}</span>
        <div class="oda-hist-body">
          <div class="oda-hist-title">${_esc(ann.title || 'Annonce')}</div>
          <div class="oda-hist-msg">${_esc(ann.message || '')}</div>
          <div class="oda-hist-time">${_timeAgo(ann.created_at)}</div>
        </div>
        <span class="oda-hist-badge oda-badge-${ann.type || 'info'}">${typeLabels[ann.type] || 'Info'}</span>
      </div>
    `).join('');
  }

  /* ─────────────────────────────────────────
     BADGE
  ───────────────────────────────────────── */
  function _updateBadge() {
    const fab   = document.getElementById('oda-notif-fab');
    const badge = document.getElementById('oda-notif-fab-badge');
    if (!fab || !badge) return;

    if (_unreadCount > 0) {
      fab.style.display   = 'flex';
      badge.style.display = 'flex';
      badge.textContent   = _unreadCount > 9 ? '9+' : _unreadCount;
    } else {
      badge.style.display = 'none';
    }
  }

  /* ─────────────────────────────────────────
     NOTIFICATION OS (Push API)
  ───────────────────────────────────────── */
  function _sendOSNotification(ann) {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    try {
      const n = new Notification(`📢 ${ann.title || 'Annonce ODA'}`, {
        body:    ann.message || '',
        icon:    '/favicon.ico',
        badge:   '/favicon.ico',
        tag:     'oda-admin-' + (ann.id || Date.now()),
        renotify: true,
        requireInteraction: ann.type === 'urgent',
      });
      n.onclick = () => {
        window.focus();
        _api.toggleHistory();
        n.close();
      };
      if (ann.type !== 'urgent') setTimeout(() => n.close(), 8000);
    } catch(e) {}
  }

  /* ─────────────────────────────────────────
     CANAL 1 — BroadcastChannel (même navigateur)
  ───────────────────────────────────────── */
  function _initBroadcastChannel() {
    if (typeof BroadcastChannel === 'undefined') return;
    try {
      _bc = new BroadcastChannel(BC_CHANNEL_NAME);
      _bc.onmessage = (event) => {
        const data = event.data;
        if (data && data.type === 'ODA_ANNOUNCEMENT') {
          _showBanner(data.payload);
        }
      };
      console.log('[ODA Notif] BroadcastChannel actif');
    } catch(e) {
      console.warn('[ODA Notif] BroadcastChannel non disponible:', e);
    }
  }

  /* ─────────────────────────────────────────
     CANAL 2 — Supabase Realtime
  ───────────────────────────────────────── */
  function _initRealtime(sb) {
    if (!sb) return;
    try {
      _realtimeChannel = sb
        .channel('oda_notifications_changes')
        .on(
          'postgres_changes',
          {
            event:  'INSERT',
            schema: 'public',
            table:  'oda_notifications',
            filter: 'active=eq.true',
          },
          (payload) => {
            const ann = payload.new;
            if (!ann) return;
            if (ann.expiry && new Date(ann.expiry) < new Date()) return;
            if (_lastSeenId && String(ann.id) === _lastSeenId) return;
            _showBanner(ann);
          }
        )
        .subscribe((status) => {
          console.log('[ODA Notif] Realtime:', status);
        });
    } catch(e) {
      console.warn('[ODA Notif] Realtime indisponible:', e);
    }
  }

  /* ─────────────────────────────────────────
     CANAL 3 — localStorage polling (fallback)
  ───────────────────────────────────────── */
  function _initPolling() {
    let lastRaw = localStorage.getItem(LS_KEY);

    _pollTimer = setInterval(() => {
      const currentRaw = localStorage.getItem(LS_KEY);
      if (!currentRaw || currentRaw === lastRaw) return;
      lastRaw = currentRaw;

      try {
        const ann = JSON.parse(currentRaw);
        if (!ann || !ann.active) return;
        if (ann.expiry && new Date(ann.expiry) < new Date()) return;
        if (_lastSeenId && String(ann.id) === _lastSeenId) return;
        _showBanner(ann);
      } catch(e) {}
    }, POLL_INTERVAL);

    console.log('[ODA Notif] Polling démarré (', POLL_INTERVAL, 'ms)');
  }

  /* ─────────────────────────────────────────
     DEMANDE DE PERMISSION OS
  ───────────────────────────────────────── */
  async function _requestPermission() {
    if (typeof Notification === 'undefined') {
      alert('Votre navigateur ne supporte pas les notifications push.');
      return false;
    }
    if (Notification.permission === 'granted') {
      _hidePermissionBar();
      return true;
    }
    if (Notification.permission === 'denied') {
      alert('❌ Notifications bloquées — autorisez-les dans les paramètres de votre navigateur.');
      return false;
    }
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      _hidePermissionBar();
      _sendOSNotification({
        title:   '✅ Notifications activées !',
        message: 'Vous recevrez les annonces admin ODA en temps réel.',
        type:    'success',
        icon:    '✅',
      });
      return true;
    }
    return false;
  }

  function _hidePermissionBar() {
    // Masque la ligne "Activer" dans le modal
    const row = document.getElementById('oda-modal-permission-row');
    if (row) row.classList.remove('visible');
  }

  function _showPermissionBarIfNeeded() {
    if (typeof Notification === 'undefined') return;
    // Ne pas afficher si déjà accordé, refusé, ou ignoré manuellement
    if (Notification.permission !== 'default') return;
    try { if (localStorage.getItem('oda_perm_dismissed') === '1') return; } catch(e) {}
    const row = document.getElementById('oda-modal-permission-row');
    if (row) row.classList.add('visible');
  }

  /* ─────────────────────────────────────────
     UTILITAIRES
  ───────────────────────────────────────── */
  function _esc(str) {
    return String(str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;');
  }

  function _timeAgo(d) {
    if (!d) return '';
    const diff = Date.now() - new Date(d).getTime();
    if (diff < 60000)    return 'À l\'instant';
    if (diff < 3600000)  return Math.floor(diff / 60000) + ' min';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h';
    return Math.floor(diff / 86400000) + 'j';
  }

  /* ─────────────────────────────────────────
     API PUBLIQUE
  ───────────────────────────────────────── */
  const _api = {

    /**
     * Initialiser le système
     * @param {object} supabaseClient  — instance supabase déjà créée (optionnel)
     * @param {object} currentUser     — utilisateur connecté (optionnel)
     */
    init(supabaseClient, currentUser) {
      if (_initialized) return;
      _initialized = true;

      _injectDOM();

      if (supabaseClient) {
        _supabase = supabaseClient;
      } else if (global.supabase) {
        try {
          _supabase = global.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch(e) {}
      }

      _initBroadcastChannel();
      _initRealtime(_supabase);
      _initPolling();

      setTimeout(_showPermissionBarIfNeeded, 2000);
      setTimeout(_checkExistingAnnouncement, 500);

      console.log('[ODA Notif] Système initialisé 🚀');
    },

    /** Demander la permission de notification OS */
    async requestPermission() {
      return await _requestPermission();
    },

    /** Fermer le modal */
    dismissBanner() {
      _clearAutoDismiss();
      const modal   = document.getElementById('oda-notif-modal');
      const overlay = document.getElementById('oda-notif-overlay');
      if (modal)   modal.classList.remove('visible');
      if (overlay) overlay.classList.remove('visible');
    },

    /** Afficher/masquer le panneau historique */
    toggleHistory() {
      const panel = document.getElementById('oda-notif-history-panel');
      if (!panel) return;
      const isOpen = panel.style.display === 'block';
      panel.style.display = isOpen ? 'none' : 'block';
      if (!isOpen) {
        _unreadCount = 0;
        _updateBadge();
      }
    },

    /** Vider l'historique */
    clearHistory() {
      _history = [];
      _renderHistory();
      _unreadCount = 0;
      _updateBadge();
      const fab = document.getElementById('oda-notif-fab');
      if (fab) fab.style.display = 'none';
    },

    /**
     * Afficher manuellement une notification
     * @param {object} options — { title, message, type, icon }
     */
    show(options) {
      _showBanner({
        id:         Date.now(),
        created_at: new Date().toISOString(),
        active:     true,
        ...options,
      });
    },

    /** Compatibilité tableau.html — notifySubscriptionAlert */
    notifySubscriptionAlert(options = {}) {
      const { title, message, type = 'info' } = options;
      _showBanner({
        id:         Date.now(),
        title:      title || '💎 Abonnement',
        message:    message || '',
        type:       type,
        icon:       type === 'warning' ? '⚠️' : '💎',
        created_at: new Date().toISOString(),
        active:     true,
      });
    },

    /** Masquer définitivement la ligne permission dans le modal */
    dismissPermissionRow() {
      _hidePermissionBar();
      // Mémoriser le refus pour ne plus afficher lors de la prochaine session
      try { localStorage.setItem('oda_perm_dismissed', '1'); } catch(e) {}
    },
  };

  /* ─────────────────────────────────────────
     VÉRIFIER ANNONCE DÉJÀ ACTIVE (au chargement)
  ───────────────────────────────────────── */
  async function _checkExistingAnnouncement() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const ann = JSON.parse(raw);
        if (ann && ann.active) {
          if (!ann.expiry || new Date(ann.expiry) > new Date()) {
            _showBanner(ann);
            return;
          }
        }
      }
    } catch(e) {}

    if (!_supabase) return;
    try {
      const { data } = await _supabase
        .from('oda_notifications')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        if (data.expiry && new Date(data.expiry) < new Date()) return;
        if (_lastSeenId && String(data.id) === _lastSeenId) return;
        _showBanner(data);
      }
    } catch(e) {}
  }

  /* ─────────────────────────────────────────
     EXPOSITION GLOBALE
  ───────────────────────────────────────── */
  global.odaNotifications    = _api;
  global.notificationManager = _api;
  global.ODANotifications    = _api;

  /* ─────────────────────────────────────────
     AUTO-INIT si supabase est déjà disponible
  ───────────────────────────────────────── */
  function _tryAutoInit() {
    if (_initialized) return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _tryAutoInit);
      return;
    }
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      const sb = global.supabase || (global.window && global.window.supabase);
      if (sb) {
        clearInterval(timer);
        const existingClient = global._supabaseClient || null;
        _api.init(existingClient);
      } else if (attempts > 30) {
        clearInterval(timer);
        _api.init(null);
      }
    }, 100);
  }

  _tryAutoInit();

})(typeof window !== 'undefined' ? window : this);
