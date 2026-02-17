


class ODANotificationSystem {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
        this.supabase = null;
        
        // Compteurs
        this.counters = {
            messages: 0,
            commandes: 0,
            total: 0
        };
        
        // Préférences utilisateur
        this.preferences = {
            enabled: true,
            soundEnabled: true,
            desktopEnabled: true,
            vibrationEnabled: true,
            messageSound: true,
            commandeSound: true,
            abonnementSound: true
        };
        
        // État
        this.notificationPermission = 'default';
        this.lastMessageId = null;
        this.lastCommandeId = null;
        this.realtimeChannels = [];
        
        // Sons
        this.sounds = null;
        
        console.log('🔔 ODA Notification System - Initialisation...');
    }
    
    /**
     * 🚀 Initialisation principale
     */
    async init(supabase, currentUser) {
        if (this.isInitialized) {
            console.log('⚠️ Système déjà initialisé');
            return;
        }
        
        this.supabase = supabase;
        this.currentUser = currentUser;
        
        if (!currentUser) {
            console.error('❌ Aucun utilisateur connecté');
            return;
        }
        
        console.log('👤 Utilisateur:', currentUser.username || currentUser.email);
        
        // Charger les préférences
        this.loadPreferences();
        
        // Initialiser les sons
        await this.initSounds();
        
        // Demander les permissions
        await this.requestNotificationPermission();
        
        // Charger les compteurs initiaux
        await this.loadInitialCounters();
        
        // Démarrer la surveillance en temps réel
        this.startRealtimeMonitoring();
        
        // Polling de secours (toutes les 10 secondes)
        this.startPolling();
        
        // Surveillance de l'abonnement
        this.startSubscriptionMonitoring();
        
        // Créer le panneau de notification
        this.createNotificationPanel();
        
        this.isInitialized = true;
        console.log('✅ Système de notifications activé !');
        
        // Notification de bienvenue
        this.showWelcomeNotification();
    }
    
    /**
     * 🎵 Initialisation des sons
     */
    async initSounds() {
        this.sounds = {
            newMessage: this.createSound('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3', 0.5),
            newCommande: this.createSound('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', 0.6),
            alert: this.createSound('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', 0.4),
            success: this.createSound('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', 0.5)
        };
        
        console.log('🎵 Sons initialisés');
    }
    
    createSound(url, volume = 0.5) {
        const audio = new Audio(url);
        audio.volume = volume;
        audio.preload = 'auto';
        return audio;
    }
    
    /**
     * 🔊 Jouer un son
     */
    playSound(soundType) {
        if (!this.preferences.soundEnabled) return;
        
        const sound = this.sounds[soundType];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Son bloqué:', e));
        }
    }
    
    /**
     * 📳 Vibration (mobile)
     */
    vibrate(pattern = [200]) {
        if (!this.preferences.vibrationEnabled) return;
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }
    
    /**
     * 🔔 Demander les permissions
     */
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('❌ Notifications non supportées');
            return false;
        }
        
        if (Notification.permission === 'granted') {
            this.notificationPermission = 'granted';
            return true;
        }
        
        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission;
            
            if (permission === 'granted') {
                console.log('✅ Permissions accordées !');
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 📊 Charger les compteurs initiaux
     */
    async loadInitialCounters() {
        try {
            // Messages non lus
            const { data: messages, error: msgError } = await this.supabase
                .from('messages')
                .select('id, created_at')
                .eq('sender', 'client')
                .eq('read', false)
                .order('created_at', { ascending: false });
            
            if (!msgError && messages) {
                this.counters.messages = messages.length;
                if (messages.length > 0) {
                    this.lastMessageId = messages[0].id;
                }
            }
            
            // Commandes en attente (pending)
            const { data: commandes, error: cmdError } = await this.supabase
                .from('commandes')
                .select('id, created_at')
                .eq('user_id', this.currentUser.id)
                .eq('statut', 'pending')
                .order('created_at', { ascending: false });
            
            if (!cmdError && commandes) {
                this.counters.commandes = commandes.length;
                if (commandes.length > 0) {
                    this.lastCommandeId = commandes[0].id;
                }
            }
            
            this.updateTotalCounter();
            this.updateBadges();
            
            console.log('📊 Compteurs:', this.counters);
            
        } catch (error) {
            console.error('❌ Erreur chargement compteurs:', error);
        }
    }
    
    /**
     * 📡 Surveillance en temps réel Supabase
     */
    startRealtimeMonitoring() {
        console.log('📡 Démarrage surveillance temps réel...');
        
        // Canal Messages
        const messagesChannel = this.supabase
            .channel('messages-realtime')
            .on('postgres_changes', 
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'messages',
                    filter: `sender=eq.client`
                }, 
                (payload) => this.handleNewMessage(payload.new)
            )
            .on('postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender=eq.client`
                },
                (payload) => this.handleMessageUpdate(payload.new)
            )
            .subscribe();
        
        // Canal Commandes
        const commandesChannel = this.supabase
            .channel('commandes-realtime')
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'commandes',
                    filter: `user_id=eq.${this.currentUser.id}`
                },
                (payload) => this.handleNewCommande(payload.new)
            )
            .on('postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'commandes',
                    filter: `user_id=eq.${this.currentUser.id}`
                },
                (payload) => this.handleCommandeUpdate(payload.new)
            )
            .subscribe();
        
        this.realtimeChannels.push(messagesChannel, commandesChannel);
        
        console.log('✅ Surveillance temps réel active');
    }
    
    /**
     * 💬 Nouveau message reçu
     */
    handleNewMessage(message) {
        console.log('💬 Nouveau message:', message);
        
        // Ignorer si c'est le même message
        if (message.id === this.lastMessageId) return;
        
        this.lastMessageId = message.id;
        this.counters.messages++;
        this.updateTotalCounter();
        this.updateBadges();
        
        // Son
        if (this.preferences.messageSound) {
            this.playSound('newMessage');
        }
        
        // Vibration
        this.vibrate([100, 50, 100]);
        
        // Notification desktop
        this.showDesktopNotification({
            title: '💬 Nouveau message',
            body: `De: ${message.client_name || 'Client'}`,
            icon: '💬',
            tag: 'message-' + message.id,
            url: '/messages.html'
        });
        
        // Notification toast
        this.showToastNotification('💬 Nouveau message reçu !', 'info');
    }
    
    /**
     * 📦 Nouvelle commande reçue
     */
    handleNewCommande(commande) {
        console.log('📦 Nouvelle commande:', commande);
        
        // Ignorer si c'est la même commande
        if (commande.id === this.lastCommandeId) return;
        
        this.lastCommandeId = commande.id;
        this.counters.commandes++;
        this.updateTotalCounter();
        this.updateBadges();
        
        // Son
        if (this.preferences.commandeSound) {
            this.playSound('newCommande');
        }
        
        // Vibration forte
        this.vibrate([200, 100, 200, 100, 200]);
        
        // Notification desktop
        this.showDesktopNotification({
            title: '📦 Nouvelle commande !',
            body: `${commande.numero} - ${commande.client_nom}\nMontant: ${this.formatPrice(commande.montant_total)}`,
            icon: '📦',
            tag: 'commande-' + commande.id,
            url: '/commandes.html'
        });
        
        // Notification toast
        this.showToastNotification(`📦 Nouvelle commande de ${commande.client_nom}`, 'success');
    }
    
    /**
     * 🔄 Update message
     */
    handleMessageUpdate(message) {
        // Si le message est marqué comme lu, décrémenter
        if (message.read && message.sender === 'client') {
            this.counters.messages = Math.max(0, this.counters.messages - 1);
            this.updateTotalCounter();
            this.updateBadges();
        }
    }
    
    /**
     * 🔄 Update commande
     */
    handleCommandeUpdate(commande) {
        // Si le statut change de pending, décrémenter
        if (commande.statut !== 'pending') {
            this.counters.commandes = Math.max(0, this.counters.commandes - 1);
            this.updateTotalCounter();
            this.updateBadges();
        }
    }
    
    /**
     * ⏱️ Polling de secours (toutes les 10 secondes)
     */
    startPolling() {
        setInterval(async () => {
            if (!this.preferences.enabled) return;
            
            try {
                // Vérifier nouveaux messages
                const { data: newMessages } = await this.supabase
                    .from('messages')
                    .select('id, created_at')
                    .eq('sender', 'client')
                    .eq('read', false)
                    .order('created_at', { ascending: false })
                    .limit(1);
                
                if (newMessages && newMessages.length > 0) {
                    const latestMsg = newMessages[0];
                    if (this.lastMessageId && latestMsg.id !== this.lastMessageId) {
                        // Nouveau message détecté
                        const { data: fullMessage } = await this.supabase
                            .from('messages')
                            .select('*')
                            .eq('id', latestMsg.id)
                            .single();
                        
                        if (fullMessage) {
                            this.handleNewMessage(fullMessage);
                        }
                    }
                }
                
                // Vérifier nouvelles commandes
                const { data: newCommandes } = await this.supabase
                    .from('commandes')
                    .select('id, created_at')
                    .eq('user_id', this.currentUser.id)
                    .eq('statut', 'pending')
                    .order('created_at', { ascending: false })
                    .limit(1);
                
                if (newCommandes && newCommandes.length > 0) {
                    const latestCmd = newCommandes[0];
                    if (this.lastCommandeId && latestCmd.id !== this.lastCommandeId) {
                        // Nouvelle commande détectée
                        const { data: fullCommande } = await this.supabase
                            .from('commandes')
                            .select('*')
                            .eq('id', latestCmd.id)
                            .single();
                        
                        if (fullCommande) {
                            this.handleNewCommande(fullCommande);
                        }
                    }
                }
                
            } catch (error) {
                console.error('❌ Erreur polling:', error);
            }
        }, 10000); // 10 secondes
        
        console.log('⏱️ Polling activé (10s)');
    }
    
    /**
     * 💳 Surveillance de l'abonnement
     */
    startSubscriptionMonitoring() {
        // Vérifier chaque heure
        setInterval(async () => {
            await this.checkSubscriptionStatus();
        }, 3600000); // 1 heure
        
        // Vérification initiale après 5 secondes
        setTimeout(() => this.checkSubscriptionStatus(), 5000);
    }
    
    async checkSubscriptionStatus() {
        try {
            const { data: user } = await this.supabase
                .from('users')
                .select('subscription_type, subscription_expires_at, product_count')
                .eq('id', this.currentUser.id)
                .single();
            
            if (!user) return;
            
            // Vérifier expiration imminente (7 jours)
            if (user.subscription_expires_at) {
                const expiresAt = new Date(user.subscription_expires_at);
                const daysLeft = Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24));
                
                if (daysLeft <= 7 && daysLeft > 0) {
                    this.showSubscriptionAlert(
                        `⚠️ Abonnement expire dans ${daysLeft} jour(s)`,
                        'warning'
                    );
                }
            }
            
            // Vérifier limite produits (plan gratuit)
            if (user.subscription_type === 'free' && user.product_count >= 10) {
                this.showSubscriptionAlert(
                    '⚠️ Limite de 10 produits atteinte (Plan gratuit)',
                    'warning'
                );
            }
            
        } catch (error) {
            console.error('❌ Erreur vérification abonnement:', error);
        }
    }
    
    showSubscriptionAlert(message, type = 'info') {
        this.showToastNotification(message, type);
        
        if (this.preferences.abonnementSound) {
            this.playSound('alert');
        }
    }
    
    /**
     * 🖥️ Notification desktop
     */
    showDesktopNotification({ title, body, icon, tag, url }) {
        if (!this.preferences.desktopEnabled) return;
        if (this.notificationPermission !== 'granted') return;
        
        const notification = new Notification(title, {
            body: body,
            icon: icon || '/oda.jpg',
            tag: tag,
            badge: '/oda.jpg',
            requireInteraction: false,
            silent: !this.preferences.soundEnabled
        });
        
        notification.onclick = () => {
            window.focus();
            if (url) {
                window.location.href = url;
            }
            notification.close();
        };
        
        // Auto-fermer après 5 secondes
        setTimeout(() => notification.close(), 5000);
    }
    
    /**
     * 🎨 Notification toast (dans la page)
     */
    showToastNotification(message, type = 'info') {
        let container = document.getElementById('oda-notification-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'oda-notification-container';
            container.style.cssText = `
                position: fixed;
                top: 90px;
                right: 20px;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            info: '#007AFF',
            warning: '#FF9800'
        };
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            background: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 122, 255, 0.2);
            border-left: 4px solid ${colors[type] || colors.info};
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            color: #333;
            max-width: 350px;
            pointer-events: auto;
            cursor: pointer;
            animation: slideInFromRight 0.4s ease;
        `;
        toast.textContent = message;
        
        toast.onclick = () => {
            toast.style.animation = 'slideOutToRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        };
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutToRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
    
    /**
     * 🏷️ Mettre à jour les badges
     */
    updateBadges() {
        // Badge total
        this.updateBadge('oda-notification-badge', this.counters.total);
        
        // Badge messages
        this.updateBadge('messages-badge', this.counters.messages);
        
        // Badge commandes
        this.updateBadge('commandes-badge', this.counters.commandes);
        
        // Titre de la page
        this.updatePageTitle();
    }
    
    updateBadge(id, count) {
        let badge = document.getElementById(id);
        
        if (count > 0) {
            if (!badge) {
                // Créer le badge s'il n'existe pas
                badge = document.createElement('span');
                badge.id = id;
                badge.className = 'notification-badge';
                badge.style.cssText = `
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #FF3B30;
                    color: white;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 2px 6px;
                    border-radius: 10px;
                    min-width: 18px;
                    text-align: center;
                    box-shadow: 0 2px 8px rgba(255, 59, 48, 0.4);
                    z-index: 10;
                `;
                
                // Trouver le conteneur parent
                const parent = this.findBadgeParent(id);
                if (parent) {
                    parent.style.position = 'relative';
                    parent.appendChild(badge);
                }
            }
            
            if (badge) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'block';
            }
        } else {
            if (badge) {
                badge.style.display = 'none';
            }
        }
    }
    
    findBadgeParent(badgeId) {
        if (badgeId === 'oda-notification-badge') {
            // Rechercher dans le header
            return document.querySelector('.user-profile') || 
                   document.querySelector('.header-actions');
        } else if (badgeId === 'messages-badge') {
            return document.querySelector('a[href="messages.html"]');
        } else if (badgeId === 'commandes-badge') {
            return document.querySelector('a[href="commandes.html"]');
        }
        return null;
    }
    
    updatePageTitle() {
        const originalTitle = 'Tableau de Bord - Ma Boutique Élégante';
        
        if (this.counters.total > 0) {
            document.title = `(${this.counters.total}) ${originalTitle}`;
        } else {
            document.title = originalTitle;
        }
    }
    
    updateTotalCounter() {
        this.counters.total = this.counters.messages + this.counters.commandes;
    }
    
    /**
     * 🎛️ Panneau de contrôle des notifications
     */
    createNotificationPanel() {
        const panel = document.createElement('div');
        panel.id = 'oda-notification-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            padding: 20px;
            z-index: 9998;
            max-width: 320px;
            display: none;
            font-family: 'Poppins', sans-serif;
        `;
        
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 600;">🔔 Notifications</h3>
                <button id="close-notif-panel" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                    <span style="font-size: 14px;">Activer les notifications</span>
                    <input type="checkbox" id="toggle-notifications" ${this.preferences.enabled ? 'checked' : ''}>
                </label>
                
                <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                    <span style="font-size: 14px;">🔊 Sons</span>
                    <input type="checkbox" id="toggle-sound" ${this.preferences.soundEnabled ? 'checked' : ''}>
                </label>
                
                <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                    <span style="font-size: 14px;">🖥️ Notifications desktop</span>
                    <input type="checkbox" id="toggle-desktop" ${this.preferences.desktopEnabled ? 'checked' : ''}>
                </label>
                
                <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                    <span style="font-size: 14px;">📳 Vibrations</span>
                    <input type="checkbox" id="toggle-vibration" ${this.preferences.vibrationEnabled ? 'checked' : ''}>
                </label>
            </div>
            
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e0e0e0;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #666; margin-bottom: 8px;">
                    <span>💬 Messages:</span>
                    <strong>${this.counters.messages}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #666;">
                    <span>📦 Commandes:</span>
                    <strong>${this.counters.commandes}</strong>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Event listeners
        document.getElementById('close-notif-panel').onclick = () => {
            panel.style.display = 'none';
        };
        
        document.getElementById('toggle-notifications').onchange = (e) => {
            this.preferences.enabled = e.target.checked;
            this.savePreferences();
        };
        
        document.getElementById('toggle-sound').onchange = (e) => {
            this.preferences.soundEnabled = e.target.checked;
            this.savePreferences();
            if (e.target.checked) this.playSound('success');
        };
        
        document.getElementById('toggle-desktop').onchange = async (e) => {
            if (e.target.checked) {
                const granted = await this.requestNotificationPermission();
                e.target.checked = granted;
            }
            this.preferences.desktopEnabled = e.target.checked;
            this.savePreferences();
        };
        
        document.getElementById('toggle-vibration').onchange = (e) => {
            this.preferences.vibrationEnabled = e.target.checked;
            this.savePreferences();
            if (e.target.checked) this.vibrate([100, 50, 100]);
        };
        
        // Bouton pour ouvrir le panneau
        this.createNotificationButton(panel);
    }
    
    createNotificationButton(panel) {
        const btn = document.createElement('button');
        btn.id = 'oda-notification-btn';
        btn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: linear-gradient(135deg, #007AFF, #5AC8FA);
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(0, 122, 255, 0.4);
            z-index: 9997;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease;
        `;
        btn.innerHTML = '🔔';
        
        btn.onmouseenter = () => btn.style.transform = 'scale(1.1)';
        btn.onmouseleave = () => btn.style.transform = 'scale(1)';
        
        btn.onclick = () => {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        };
        
        document.body.appendChild(btn);
    }
    
    /**
     * 💾 Sauvegarder les préférences
     */
    savePreferences() {
        localStorage.setItem('oda_notification_preferences', JSON.stringify(this.preferences));
        console.log('💾 Préférences sauvegardées');
    }
    
    loadPreferences() {
        const saved = localStorage.getItem('oda_notification_preferences');
        if (saved) {
            try {
                this.preferences = { ...this.preferences, ...JSON.parse(saved) };
                console.log('✅ Préférences chargées');
            } catch (e) {
                console.error('❌ Erreur chargement préférences:', e);
            }
        }
    }
    
    /**
     * 👋 Notification de bienvenue
     */
    showWelcomeNotification() {
        setTimeout(() => {
            this.showToastNotification('✅ Système de notifications activé !', 'success');
            this.playSound('success');
        }, 1000);
    }
    
    /**
     * 🧹 Nettoyage
     */
    destroy() {
        // Désabonner des canaux
        this.realtimeChannels.forEach(channel => {
            this.supabase.removeChannel(channel);
        });
        
        this.realtimeChannels = [];
        this.isInitialized = false;
        
        console.log('🧹 Système de notifications arrêté');
    }
    
    /**
     * 💰 Formater le prix
     */
    formatPrice(price) {
        if (price == null) return 'Prix non disponible';
        return `${Number(price).toLocaleString('fr-FR')} FCFA`;
    }
}

// Styles CSS pour les animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInFromRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutToRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
    
    .notification-badge {
        animation: pulse 2s infinite;
    }
`;
document.head.appendChild(notificationStyles);

// Instance globale
window.odaNotificationSystem = new ODANotificationSystem();

console.log('%c🔔 ODA Notification System v2.0', 'color: #007AFF; font-size: 18px; font-weight: bold;');
console.log('%c✅ Prêt à être initialisé !', 'color: #4CAF50; font-weight: bold;');
console.log('%c📖 Usage: window.odaNotificationSystem.init(supabase, currentUser)', 'color: #666; font-size: 12px;');
