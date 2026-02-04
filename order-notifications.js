// ==================== ORDER NOTIFICATIONS SYSTEM ====================
// Système de notifications push et alarmes pour les commandes
// Version: 1.0.0

class OrderNotificationSystem {
    constructor() {
        // Configuration
        this.isEnabled = true;
        this.soundEnabled = true;
        this.desktopNotificationEnabled = true;
        
        // Suivi des commandes
        this.lastOrderCount = 0;
        this.processedOrderIds = new Set();
        this.orderStatusHistory = new Map(); // Suivre les changements de statut
        
        // Sons d'alerte différenciés
        this.sounds = {
            newOrder: null,          // Nouvelle commande
            statusChange: null,      // Changement de statut
            urgentOrder: null,       // Commande urgente (montant élevé)
            completed: null          // Commande livrée
        };
        
        // Seuils
        this.URGENT_ORDER_AMOUNT = 50000; // FCFA
        
        // État des permissions
        this.notificationPermission = 'default';
        
        console.log('🛒 Système de notifications commandes initialisé');
    }

    // ==================== INITIALISATION ====================
    async init() {
        try {
            // Créer les sons d'alerte
            this.createSoundAlerts();
            
            // Demander les permissions pour les notifications
            await this.requestNotificationPermission();
            
            // Charger les préférences de l'utilisateur
            this.loadUserPreferences();
            
            // Ajouter les contrôles UI
            this.addNotificationControls();
            
            console.log('✅ Système de notifications commandes prêt');
            return true;
        } catch (error) {
            console.error('❌ Erreur initialisation notifications:', error);
            return false;
        }
    }

    // ==================== CRÉATION DES SONS ====================
    createSoundAlerts() {
        // Son nouvelle commande (joyeux et positif)
        this.sounds.newOrder = this.createMultiToneSound([
            { frequency: 800, duration: 0.15 },
            { frequency: 1000, duration: 0.15 },
            { frequency: 1200, duration: 0.2 }
        ], 0.4);
        
        // Son changement de statut (neutre)
        this.sounds.statusChange = this.createBeepSound(900, 0.2, 0.3);
        
        // Son commande urgente (alerte importante)
        this.sounds.urgentOrder = this.createMultiToneSound([
            { frequency: 1000, duration: 0.1 },
            { frequency: 1200, duration: 0.1 },
            { frequency: 1400, duration: 0.15 }
        ], 0.5);
        
        // Son commande livrée (célébration)
        this.sounds.completed = this.createMultiToneSound([
            { frequency: 600, duration: 0.1 },
            { frequency: 800, duration: 0.1 },
            { frequency: 1000, duration: 0.15 }
        ], 0.35);
        
        console.log('🔊 Sons d\'alerte commandes créés');
    }

    // Créer un son multi-tons
    createMultiToneSound(tones, volume = 0.4) {
        return {
            play: async () => {
                if (!this.soundEnabled) return;
                
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    let currentTime = audioContext.currentTime;
                    
                    for (const tone of tones) {
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.value = tone.frequency;
                        oscillator.type = 'sine';
                        
                        gainNode.gain.setValueAtTime(volume, currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + tone.duration);
                        
                        oscillator.start(currentTime);
                        oscillator.stop(currentTime + tone.duration);
                        
                        currentTime += tone.duration;
                    }
                } catch (error) {
                    console.error('❌ Erreur lecture son multi-tons:', error);
                }
            }
        };
    }

    // Créer un son de bip simple
    createBeepSound(frequency = 800, duration = 0.3, volume = 0.5) {
        return {
            play: () => {
                try {
                    if (!this.soundEnabled) return;
                    
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = frequency;
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + duration);
                } catch (error) {
                    console.error('❌ Erreur lecture son:', error);
                }
            }
        };
    }

    // ==================== PERMISSIONS NOTIFICATIONS ====================
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.warn('⚠️ Notifications non supportées par ce navigateur');
            this.desktopNotificationEnabled = false;
            return 'denied';
        }

        try {
            if (Notification.permission === 'default') {
                this.notificationPermission = await Notification.requestPermission();
            } else {
                this.notificationPermission = Notification.permission;
            }

            if (this.notificationPermission === 'granted') {
                console.log('✅ Permissions notifications accordées');
            } else if (this.notificationPermission === 'denied') {
                console.warn('⚠️ Permissions notifications refusées');
                this.desktopNotificationEnabled = false;
            }

            return this.notificationPermission;
        } catch (error) {
            console.error('❌ Erreur demande permissions:', error);
            return 'denied';
        }
    }

    // ==================== DÉTECTION NOUVELLES COMMANDES ====================
    checkForNewOrders(orders, currentUser) {
        if (!this.isEnabled || !orders || !currentUser) return;

        try {
            const currentOrderCount = orders.length;
            let newOrders = [];
            let statusChanges = [];

            // Détecter les nouvelles commandes
            orders.forEach(order => {
                // Si c'est une nouvelle commande non traitée
                if (!this.processedOrderIds.has(order.id)) {
                    this.processedOrderIds.add(order.id);
                    
                    // Si ce n'est pas le premier chargement
                    if (this.lastOrderCount > 0) {
                        newOrders.push(order);
                    }
                    
                    // Enregistrer le statut initial
                    this.orderStatusHistory.set(order.id, order.statut);
                } else {
                    // Vérifier les changements de statut
                    const previousStatus = this.orderStatusHistory.get(order.id);
                    if (previousStatus && previousStatus !== order.statut) {
                        statusChanges.push({
                            order: order,
                            oldStatus: previousStatus,
                            newStatus: order.statut
                        });
                        // Mettre à jour l'historique
                        this.orderStatusHistory.set(order.id, order.statut);
                    }
                }
            });

            // Notifier les nouvelles commandes
            if (newOrders.length > 0) {
                console.log(`🆕 ${newOrders.length} nouvelle(s) commande(s) détectée(s)`);
                newOrders.forEach(order => {
                    this.notifyNewOrder(order);
                });
            }

            // Notifier les changements de statut
            if (statusChanges.length > 0) {
                console.log(`🔄 ${statusChanges.length} changement(s) de statut détecté(s)`);
                statusChanges.forEach(change => {
                    this.notifyStatusChange(change);
                });
            }

            // Mettre à jour le compteur
            this.lastOrderCount = currentOrderCount;

        } catch (error) {
            console.error('❌ Erreur vérification nouvelles commandes:', error);
        }
    }

    // ==================== NOTIFICATION NOUVELLE COMMANDE ====================
    notifyNewOrder(order) {
        try {
            const isUrgent = order.montant_total >= this.URGENT_ORDER_AMOUNT;
            console.log(`🔔 Notification nouvelle commande: ${order.numero || order.id}`, isUrgent ? '⚠️ URGENTE' : '');

            // Jouer le son approprié
            if (this.soundEnabled) {
                if (isUrgent) {
                    this.sounds.urgentOrder.play();
                } else {
                    this.sounds.newOrder.play();
                }
            }

            // Afficher notification desktop
            if (this.desktopNotificationEnabled) {
                this.showDesktopNotification({
                    title: isUrgent ? '🚨 Nouvelle commande URGENTE !' : '🛒 Nouvelle commande',
                    body: `${order.client_nom || 'Client'} - ${this.formatPrice(order.montant_total)}`,
                    tag: `order-${order.id}`,
                    data: { orderId: order.id, type: 'new', isUrgent }
                });
            }

            // Afficher notification visuelle dans la page
            this.showInPageNotification({
                type: 'new',
                isUrgent: isUrgent,
                title: isUrgent ? '🚨 Commande urgente !' : '🛒 Nouvelle commande',
                message: `${order.client_nom || 'Client'}\n${this.formatPrice(order.montant_total)}`,
                orderId: order.id,
                orderNumber: order.numero || `#${order.id}`
            });

            // Faire vibrer si supporté (mobile)
            if (isUrgent) {
                this.vibrate([200, 100, 200, 100, 200]); // Pattern plus long pour urgence
            } else {
                this.vibrate();
            }

        } catch (error) {
            console.error('❌ Erreur notification nouvelle commande:', error);
        }
    }

    // ==================== NOTIFICATION CHANGEMENT STATUT ====================
    notifyStatusChange(change) {
        try {
            const { order, oldStatus, newStatus } = change;
            console.log(`🔄 Notification changement statut: ${oldStatus} → ${newStatus}`);

            // Jouer le son approprié
            if (this.soundEnabled) {
                if (newStatus === 'livree') {
                    this.sounds.completed.play();
                } else {
                    this.sounds.statusChange.play();
                }
            }

            // Afficher notification desktop
            if (this.desktopNotificationEnabled) {
                this.showDesktopNotification({
                    title: '🔄 Changement de statut',
                    body: `Commande ${order.numero || order.id}: ${this.getStatusText(newStatus)}`,
                    tag: `status-${order.id}`,
                    data: { orderId: order.id, type: 'status', newStatus }
                });
            }

            // Afficher notification visuelle dans la page
            this.showInPageNotification({
                type: 'status',
                isUrgent: false,
                title: '🔄 Statut mis à jour',
                message: `Commande ${order.numero || order.id}\n${this.getStatusEmoji(newStatus)} ${this.getStatusText(newStatus)}`,
                orderId: order.id,
                orderNumber: order.numero || `#${order.id}`
            });

            // Vibration courte
            if (newStatus === 'livree') {
                this.vibrate([100, 50, 100]); // Célébration courte
            }

        } catch (error) {
            console.error('❌ Erreur notification changement statut:', error);
        }
    }

    // ==================== NOTIFICATION DESKTOP ====================
    showDesktopNotification({ title, body, tag, data }) {
        if (!this.desktopNotificationEnabled) return;
        if (Notification.permission !== 'granted') return;

        try {
            const notification = new Notification(title, {
                body: body,
                icon: 'oda.jpg',
                badge: 'oda.jpg',
                tag: tag,
                requireInteraction: data?.isUrgent || false,
                silent: true,
                timestamp: Date.now(),
                data: data
            });

            // Clic sur la notification
            notification.onclick = () => {
                window.focus();
                notification.close();
                
                // Ouvrir les détails de la commande
                if (data?.orderId && typeof afficherDetailsCommande === 'function') {
                    afficherDetailsCommande(data.orderId);
                }
            };

            // Fermer automatiquement (sauf si urgente)
            if (!data?.isUrgent) {
                setTimeout(() => notification.close(), 6000);
            }

        } catch (error) {
            console.error('❌ Erreur notification desktop:', error);
        }
    }

    // ==================== NOTIFICATION DANS LA PAGE ====================
    showInPageNotification({ type, isUrgent, title, message, orderId, orderNumber }) {
        try {
            // Créer l'élément de notification
            const notification = document.createElement('div');
            notification.className = `in-page-notification ${isUrgent ? 'urgent' : ''}`;
            notification.dataset.orderId = orderId;
            
            const icon = type === 'new' ? (isUrgent ? '🚨' : '🛒') : '🔄';
            
            notification.innerHTML = `
                <div class="notification-content">
                    <div class="notification-icon">${icon}</div>
                    <div class="notification-text">
                        <div class="notification-title">${this.escapeHtml(title)}</div>
                        <div class="notification-body">${this.escapeHtml(message)}</div>
                        <div class="notification-order-ref">${this.escapeHtml(orderNumber)}</div>
                    </div>
                    <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="notification-progress"></div>
            `;

            // Ajouter au DOM
            document.body.appendChild(notification);

            // Animation d'entrée
            setTimeout(() => notification.classList.add('show'), 10);

            // Barre de progression
            const progressBar = notification.querySelector('.notification-progress');
            const duration = isUrgent ? 10000 : 6000;
            progressBar.style.animation = `notificationProgress ${duration}ms linear`;

            // Retirer automatiquement
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, duration);

            // Clic sur la notification
            notification.querySelector('.notification-content').addEventListener('click', (e) => {
                if (!e.target.classList.contains('notification-close')) {
                    if (typeof afficherDetailsCommande === 'function') {
                        afficherDetailsCommande(orderId);
                    }
                    notification.remove();
                }
            });

        } catch (error) {
            console.error('❌ Erreur notification in-page:', error);
        }
    }

    // ==================== VIBRATION ====================
    vibrate(pattern = [200, 100, 200]) {
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(pattern);
            } catch (error) {
                console.error('❌ Erreur vibration:', error);
            }
        }
    }

    // ==================== CONTRÔLES UI ====================
    addNotificationControls() {
        try {
            // Injecter les styles CSS
            this.injectStyles();

        } catch (error) {
            console.error('❌ Erreur ajout contrôles:', error);
        }
    }

    // ==================== STYLES CSS ====================
    injectStyles() {
        if (document.getElementById('order-notification-system-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'order-notification-system-styles';
        styles.textContent = `
            /* Notification dans la page */
            .in-page-notification {
                position: fixed;
                top: 80px;
                right: -400px;
                width: 350px;
                max-width: calc(100vw - 40px);
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
                border-left: 4px solid #007AFF;
            }

            .in-page-notification.urgent {
                border-left-color: #FF3B30;
                animation: urgentPulse 2s ease-in-out infinite;
            }

            @keyframes urgentPulse {
                0%, 100% { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15); }
                50% { box-shadow: 0 8px 32px rgba(255, 59, 48, 0.3); }
            }

            .in-page-notification.show {
                right: 20px;
            }

            .notification-content {
                display: flex;
                align-items: flex-start;
                padding: 16px;
                gap: 12px;
                cursor: pointer;
                position: relative;
            }

            .notification-content:hover {
                background: rgba(0, 122, 255, 0.05);
            }

            .notification-icon {
                font-size: 2.5rem;
                flex-shrink: 0;
                animation: iconBounce 0.5s ease;
            }

            @keyframes iconBounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }

            .notification-text {
                flex: 1;
                min-width: 0;
            }

            .notification-title {
                font-weight: 600;
                font-size: 0.95rem;
                color: #1D1D1F;
                margin-bottom: 6px;
            }

            .notification-body {
                font-size: 0.85rem;
                color: #86868B;
                line-height: 1.4;
                white-space: pre-line;
                margin-bottom: 4px;
            }

            .notification-order-ref {
                font-size: 0.75rem;
                color: #007AFF;
                font-weight: 600;
                margin-top: 4px;
            }

            .notification-close {
                position: absolute;
                top: 12px;
                right: 12px;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: none;
                background: rgba(0, 0, 0, 0.05);
                color: #86868B;
                font-size: 1.2rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                z-index: 1;
            }

            .notification-close:hover {
                background: rgba(255, 59, 48, 0.1);
                color: #FF3B30;
                transform: scale(1.1) rotate(90deg);
            }

            .notification-progress {
                height: 3px;
                background: linear-gradient(90deg, #007AFF 0%, #5AC8FA 100%);
                width: 0%;
                position: absolute;
                bottom: 0;
                left: 0;
            }

            .in-page-notification.urgent .notification-progress {
                background: linear-gradient(90deg, #FF3B30 0%, #FF9500 100%);
            }

            @keyframes notificationProgress {
                from { width: 100%; }
                to { width: 0%; }
            }

            /* Empiler les notifications */
            .in-page-notification:nth-child(n+2) {
                top: calc(80px + (90px * (var(--notification-index, 0))));
            }

            /* Mobile */
            @media (max-width: 768px) {
                .in-page-notification {
                    width: calc(100vw - 32px);
                    top: 70px;
                }

                .in-page-notification.show {
                    right: 16px;
                }

                .notification-icon {
                    font-size: 2rem;
                }
            }

            /* Animation d'entrée */
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    // ==================== PRÉFÉRENCES UTILISATEUR ====================
    saveUserPreferences() {
        try {
            const preferences = {
                isEnabled: this.isEnabled,
                soundEnabled: this.soundEnabled,
                desktopNotificationEnabled: this.desktopNotificationEnabled
            };
            localStorage.setItem('orderNotificationPreferences', JSON.stringify(preferences));
            console.log('💾 Préférences commandes sauvegardées');
        } catch (error) {
            console.error('❌ Erreur sauvegarde préférences:', error);
        }
    }

    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('orderNotificationPreferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                this.isEnabled = preferences.isEnabled !== false;
                this.soundEnabled = preferences.soundEnabled !== false;
                this.desktopNotificationEnabled = preferences.desktopNotificationEnabled !== false;
                console.log('✅ Préférences commandes chargées');
            }
        } catch (error) {
            console.error('❌ Erreur chargement préférences:', error);
        }
    }

    // ==================== UTILITAIRES ====================
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatPrice(amount) {
        return `${(amount || 0).toLocaleString('fr-FR')} FCFA`;
    }

    getStatusText(status) {
        const statusMap = {
            'en_attente': 'En attente',
            'confirmee': 'Confirmée',
            'en_preparation': 'En préparation',
            'en_livraison': 'En livraison',
            'livree': 'Livrée',
            'annulee': 'Annulée'
        };
        return statusMap[status] || status;
    }

    getStatusEmoji(status) {
        const emojiMap = {
            'en_attente': '⏳',
            'confirmee': '✅',
            'en_preparation': '📦',
            'en_livraison': '🚚',
            'livree': '🎉',
            'annulee': '❌'
        };
        return emojiMap[status] || '📋';
    }

    // Réinitialiser le système
    reset() {
        this.processedOrderIds.clear();
        this.orderStatusHistory.clear();
        this.lastOrderCount = 0;
        console.log('🔄 Système de notifications commandes réinitialisé');
    }

    // Tester les notifications
    test() {
        console.log('🧪 Test du système de notifications commandes...');
        
        // Test nouvelle commande normale
        const testOrder = {
            id: 'test-' + Date.now(),
            numero: 'CMD-TEST-001',
            client_nom: 'Client Test',
            montant_total: 25000,
            statut: 'en_attente',
            created_at: new Date().toISOString()
        };

        console.log('1️⃣ Test commande normale...');
        this.notifyNewOrder(testOrder);

        // Test commande urgente
        setTimeout(() => {
            console.log('2️⃣ Test commande urgente...');
            const urgentOrder = { ...testOrder, id: 'test-urgent-' + Date.now(), montant_total: 75000 };
            this.notifyNewOrder(urgentOrder);
        }, 2000);

        // Test changement de statut
        setTimeout(() => {
            console.log('3️⃣ Test changement de statut...');
            this.notifyStatusChange({
                order: { ...testOrder, statut: 'livree' },
                oldStatus: 'en_livraison',
                newStatus: 'livree'
            });
        }, 4000);

        console.log('✅ Tests programmés');
    }
}

// ==================== EXPORT ====================
// Créer l'instance globale
window.orderNotificationSystem = new OrderNotificationSystem();

// Fonction d'intégration facile
window.initOrderNotifications = async function(supabaseClient, currentUser) {
    try {
        console.log('🚀 Initialisation système de notifications commandes...');
        
        // Initialiser le système
        await window.orderNotificationSystem.init();
        
        // Retourner une fonction à appeler lors du chargement des commandes
        return {
            checkNewOrders: (orders) => {
                window.orderNotificationSystem.checkForNewOrders(orders, currentUser);
            },
            test: () => window.orderNotificationSystem.test(),
            reset: () => window.orderNotificationSystem.reset(),
            
            // Contrôles manuels
            toggleSound: (enabled) => {
                window.orderNotificationSystem.soundEnabled = enabled;
                window.orderNotificationSystem.saveUserPreferences();
            },
            toggleDesktop: (enabled) => {
                window.orderNotificationSystem.desktopNotificationEnabled = enabled;
                window.orderNotificationSystem.saveUserPreferences();
            },
            toggleAll: (enabled) => {
                window.orderNotificationSystem.isEnabled = enabled;
                window.orderNotificationSystem.saveUserPreferences();
            }
        };
    } catch (error) {
        console.error('❌ Erreur initialisation notifications commandes:', error);
        return null;
    }
};

console.log('✅ Module order-notifications.js chargé');
