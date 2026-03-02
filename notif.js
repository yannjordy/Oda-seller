

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
     INJECTION DU DOM (bannière + badge)
  ───────────────────────────────────────── */
  function _injectDOM() {
    if (document.getElementById('oda-notif-root')) return;

    const style = document.createElement('style');
    style.textContent = `
      /* ── Root banner ── */
      #oda-notif-root {
        position: fixed; top: 0; left: 0; right: 0; z-index: 99999;
        pointer-events: none;
      }

      /* ── Bannière principale ── */
      #oda-notif-banner {
        display: flex; align-items: center; gap: 12px;
        padding: 14px 20px;
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 0.9rem; font-weight: 500;
        color: white; line-height: 1.4;
        transform: translateY(-110%);
        transition: transform 0.45s cubic-bezier(.25,.8,.25,1);
        pointer-events: all;
        box-shadow: 0 4px 30px rgba(0,0,0,0.35);
      }
      #oda-notif-banner.visible {
        transform: translateY(0);
      }
      #oda-notif-banner.type-info    { background: linear-gradient(135deg,#0e7490,#0891b2); }
      #oda-notif-banner.type-warning { background: linear-gradient(135deg,#b45309,#d97706); }
      #oda-notif-banner.type-success { background: linear-gradient(135deg,#065f46,#059669); }
      #oda-notif-banner.type-urgent  { background: linear-gradient(135deg,#991b1b,#dc2626);
                                       animation: oda-pulse-bg 1.5s infinite alternate; }
      @keyframes oda-pulse-bg {
        from { filter: brightness(1); }
        to   { filter: brightness(1.15); }
      }

      /* ── Icône ── */
      #oda-notif-icon {
        font-size: 1.5rem; flex-shrink: 0;
        animation: oda-bounce 0.6s ease both;
      }
      @keyframes oda-bounce {
        0%   { transform: scale(0.3) rotate(-20deg); opacity: 0; }
        60%  { transform: scale(1.15) rotate(5deg); }
        100% { transform: scale(1) rotate(0); opacity: 1; }
      }

      /* ── Texte ── */
      #oda-notif-text { flex: 1; }
      #oda-notif-title {
        font-weight: 700; font-size: 0.95rem;
        display: block; margin-bottom: 2px;
      }
      #oda-notif-msg {
        font-size: 0.85rem; opacity: 0.88;
        display: block;
      }

      /* ── Actions ── */
      .oda-notif-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }

      #oda-notif-history-btn {
        background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3);
        border-radius: 8px; color: white; padding: 5px 12px; cursor: pointer;
        font-size: 0.78rem; font-weight: 600; transition: background 0.2s;
        font-family: inherit;
      }
      #oda-notif-history-btn:hover { background: rgba(255,255,255,0.3); }

      #oda-notif-close {
        background: rgba(255,255,255,0.15); border: none;
        border-radius: 50%; width: 28px; height: 28px;
        cursor: pointer; color: white; font-size: 14px; line-height: 1;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.2s; font-family: inherit;
      }
      #oda-notif-close:hover { background: rgba(255,255,255,0.35); }

      /* ── Badge flottant (hors bannière) ── */
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
        background: #111130; border: 1px solid rgba(255,255,255,0.14);
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
        position: sticky; top: 0; background: #111130;
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
      .oda-hist-msg   { font-size: 0.78rem; color: rgba(240,238,249,0.55);
                        margin-top: 2px; }
      .oda-hist-time  { font-size: 0.7rem; color: rgba(240,238,249,0.3);
                        margin-top: 3px; }
      .oda-hist-badge {
        flex-shrink: 0; font-size: 0.65rem; font-weight: 700;
        padding: 2px 7px; border-radius: 99px;
        align-self: flex-start;
      }
      .oda-badge-info    { background:rgba(6,182,212,0.2);  color:#67E8F9; border:1px solid rgba(6,182,212,0.3); }
      .oda-badge-warning { background:rgba(245,158,11,0.2); color:#FDE68A; border:1px solid rgba(245,158,11,0.3); }
      .oda-badge-success { background:rgba(16,185,129,0.2); color:#34D399; border:1px solid rgba(16,185,129,0.3); }
      .oda-badge-urgent  { background:rgba(239,68,68,0.2);  color:#FCA5A5; border:1px solid rgba(239,68,68,0.3); }

      /* ── Bouton activation notifications OS ── */
      #oda-notif-permission-bar {
        display: none; align-items: center; justify-content: space-between;
        padding: 10px 16px;
        background: rgba(124,58,237,0.12);
        border-bottom: 1px solid rgba(124,58,237,0.25);
        font-size: 0.82rem; color: rgba(240,238,249,0.75);
        font-family: 'DM Sans', system-ui, sans-serif;
      }
      #oda-notif-permission-bar.visible { display: flex; }
      #oda-notif-permission-bar button {
        background: linear-gradient(135deg,#7C3AED,#06B6D4);
        border: none; border-radius: 8px; color: white;
        padding: 5px 14px; cursor: pointer; font-size: 0.8rem;
        font-weight: 600; font-family: inherit;
      }
    `;
    document.head.appendChild(style);

    // Root container
    const root = document.createElement('div');
    root.id = 'oda-notif-root';
    root.innerHTML = `
      <!-- Barre de demande permission -->
      <div id="oda-notif-permission-bar">
        <span>🔔 Activez les notifications pour recevoir les annonces admin en temps réel</span>
        <button onclick="window.odaNotifications.requestPermission()">Activer</button>
      </div>

      <!-- Bannière principale -->
      <div id="oda-notif-banner" class="type-info">
        <span id="oda-notif-icon">📢</span>
        <div id="oda-notif-text">
          <span id="oda-notif-title">Annonce</span>
          <span id="oda-notif-msg"></span>
        </div>
        <div class="oda-notif-actions">
          <button id="oda-notif-history-btn" onclick="window.odaNotifications.toggleHistory()">
            📋 Historique
          </button>
          <button id="oda-notif-close" onclick="window.odaNotifications.dismissBanner()">✕</button>
        </div>
      </div>
    `;
    document.body.insertBefore(root, document.body.firstChild);

    // FAB flottant
    const fab = document.createElement('button');
    fab.id = 'oda-notif-fab';
    fab.title = 'Annonces admin';
    fab.innerHTML = `📢 <span id="oda-notif-fab-badge"></span>`;
    fab.onclick = () => _api.toggleHistory();
    document.body.appendChild(fab);

    // Panneau historique
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

    // Fermer le panel au clic extérieur
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('oda-notif-history-panel');
      const fab   = document.getElementById('oda-notif-fab');
      if (panel && panel.style.display === 'block') {
        if (!panel.contains(e.target) && e.target !== fab) {
          panel.style.display = 'none';
        }
      }
    });
  }

  /* ─────────────────────────────────────────
     AFFICHER UNE ANNONCE
  ───────────────────────────────────────── */
  function _showBanner(ann) {
    const icons = { info:'ℹ️', warning:'⚠️', success:'✅', urgent:'🚨' };
    const icon  = ann.icon || icons[ann.type] || '📢';

    // Mettre à jour la bannière
    const banner = document.getElementById('oda-notif-banner');
    if (!banner) return;

    banner.className = `type-${ann.type || 'info'}`;
    document.getElementById('oda-notif-icon').textContent  = icon;
    document.getElementById('oda-notif-title').textContent = ann.title || 'Annonce';
    document.getElementById('oda-notif-msg').textContent   = ann.message || '';

    // Animation d'entrée
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        banner.classList.add('visible');
      });
    });

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
      fab.style.display    = 'flex';
      badge.style.display  = 'flex';
      badge.textContent    = _unreadCount > 9 ? '9+' : _unreadCount;
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
      // Fermer auto sauf si urgent
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
            // Vérifier expiration
            if (ann.expiry && new Date(ann.expiry) < new Date()) return;
            // Éviter les doublons
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
        // Éviter les doublons avec Realtime/BC
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
    const bar = document.getElementById('oda-notif-permission-bar');
    if (bar) bar.classList.remove('visible');
  }

  function _showPermissionBarIfNeeded() {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      const bar = document.getElementById('oda-notif-permission-bar');
      if (bar) bar.classList.add('visible');
    }
  }

  /* ─────────────────────────────────────────
     UTILITAIRES
  ───────────────────────────────────────── */
  function _esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
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

      // Créer ou réutiliser le client Supabase
      if (supabaseClient) {
        _supabase = supabaseClient;
      } else if (global.supabase) {
        try {
          _supabase = global.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch(e) {}
      }

      // Lancer les 3 canaux
      _initBroadcastChannel();
      _initRealtime(_supabase);
      _initPolling();

      // Demander la permission OS après 2 sec (non intrusif)
      setTimeout(_showPermissionBarIfNeeded, 2000);

      // Vérifier une annonce déjà active au chargement
      setTimeout(_checkExistingAnnouncement, 500);

      console.log('[ODA Notif] Système initialisé 🚀');
    },

    /** Demander la permission de notification OS */
    async requestPermission() {
      return await _requestPermission();
    },

    /** Masquer la bannière courante */
    dismissBanner() {
      const banner = document.getElementById('oda-notif-banner');
      if (banner) banner.classList.remove('visible');
    },

    /** Afficher/masquer le panneau historique */
    toggleHistory() {
      const panel = document.getElementById('oda-notif-history-panel');
      if (!panel) return;
      const isOpen = panel.style.display === 'block';
      panel.style.display = isOpen ? 'none' : 'block';
      if (!isOpen) {
        // Remettre le compteur à zéro
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
     * Afficher manuellement une notification (utilisé par tableau.html)
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

    /**
     * Compatibilité tableau.html — notifySubscriptionAlert
     * Appelé quand un abonnement est activé/expiré
     */
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
  };

  /* ─────────────────────────────────────────
     VÉRIFIER ANNONCE DÉJÀ ACTIVE (au chargement)
  ───────────────────────────────────────── */
  async function _checkExistingAnnouncement() {
    // 1. Vérifier localStorage d'abord
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

    // 2. Vérifier Supabase
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
        // Vérifier si déjà vu
        if (_lastSeenId && String(data.id) === _lastSeenId) return;
        _showBanner(data);
      }
    } catch(e) {}
  }

  /* ─────────────────────────────────────────
     EXPOSITION GLOBALE
  ───────────────────────────────────────── */
  global.odaNotifications      = _api;     // pour tableau.html (utilise window.odaNotifications.init())
  global.notificationManager   = _api;     // compat tableau.html (window.notificationManager)
  global.ODANotifications      = _api;     // alias alternatif

  /* ─────────────────────────────────────────
     AUTO-INIT si supabase est déjà disponible
  ───────────────────────────────────────── */
  function _tryAutoInit() {
    if (_initialized) return;
    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _tryAutoInit);
      return;
    }
    // Attendre que supabase soit disponible (max 3 sec)
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      const sb = global.supabase || (global.window && global.window.supabase);
      if (sb) {
        clearInterval(timer);
        // Utiliser le client déjà créé s'il existe
        const existingClient = global._supabaseClient || null;
        _api.init(existingClient);
      } else if (attempts > 30) {
        clearInterval(timer);
        // Initialiser sans Supabase (localStorage + BroadcastChannel seulement)
        _api.init(null);
      }
    }, 100);
  }

  _tryAutoInit();

})(typeof window !== 'undefined' ? window : this);

