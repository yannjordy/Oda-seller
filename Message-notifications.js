// ==================== MESSAGE NOTIFICATIONS SYSTEM ====================
// Système de notifications push et alarmes pour les nouveaux messages
// Version: 1.0.0

class MessageNotificationSystem {
    constructor() {
        // Configuration
        this.isEnabled = true;
        this.soundEnabled = true;
        this.desktopNotificationEnabled = true;
        
        // Suivi des messages
        this.lastMessageCount = 0;
        this.lastUnreadCount = 0;
        this.processedMessageIds = new Set();
        
        // Sons d'alerte
        this.sounds = {
            newMessage: null,
            urgentMessage: null
        };
        
        // État des permissions
        this.notificationPermission = 'default';
        
        console.log('🔔 Système de notifications initialisé');
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
            
            console.log('✅ Système de notifications prêt');
            return true;
        } catch (error) {
            console.error('❌ Erreur initialisation notifications:', error);
            return false;
        }
    }

    // ==================== CRÉATION DES SONS ====================
    createSoundAlerts() {
        // Son de notification principal (fréquence agréable)
        this.sounds.newMessage = this.createBeepSound(800, 0.3, 200);
        
        // Son de notification urgente (plus aigu et répétitif)
        this.sounds.urgentMessage = this.createBeepSound(1000, 0.4, 150);
        
        console.log('🔊 Sons d\'alerte créés');
    }

    // Créer un son de bip personnalisé
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

    // ==================== DÉTECTION NOUVEAUX MESSAGES ====================
    checkForNewMessages(conversations, currentUser) {
        if (!this.isEnabled || !conversations || !currentUser) return;

        try {
            let totalMessages = 0;
            let totalUnread = 0;
            let newMessages = [];

            // Parcourir toutes les conversations
            conversations.forEach((messages, clientName) => {
                messages.forEach(msg => {
                    totalMessages++;
                    
                    // Compter les messages non lus
                    if (msg.sender === 'client' && !msg.read) {
                        totalUnread++;
                    }
                    
                    // Détecter les nouveaux messages (non traités)
                    if (!this.processedMessageIds.has(msg.id)) {
                        this.processedMessageIds.add(msg.id);
                        
                        // Si c'est un message du client (pas de nous)
                        if (msg.sender === 'client') {
                            newMessages.push({
                                id: msg.id,
                                client: clientName,
                                message: msg.message,
                                created_at: msg.created_at,
                                has_product: msg.product_data && Object.keys(msg.product_data).length > 0
                            });
                        }
                    }
                });
            });

            // Si on a de nouveaux messages
            if (newMessages.length > 0) {
                console.log(`🆕 ${newMessages.length} nouveau(x) message(s) détecté(s)`);
                
                // Notifier chaque nouveau message
                newMessages.forEach(msg => {
                    this.notifyNewMessage(msg);
                });
            }

            // Mettre à jour les compteurs
            this.lastMessageCount = totalMessages;
            this.lastUnreadCount = totalUnread;

        } catch (error) {
            console.error('❌ Erreur vérification nouveaux messages:', error);
        }
    }

    // ==================== NOTIFICATION NOUVEAU MESSAGE ====================
    notifyNewMessage(messageData) {
        try {
            console.log('🔔 Notification nouveau message:', messageData.client);

            // Jouer le son d'alerte
            if (this.soundEnabled) {
                this.playNotificationSound(messageData.has_product);
            }

            // Afficher notification desktop
            if (this.desktopNotificationEnabled) {
                this.showDesktopNotification(messageData);
            }

            // Afficher notification visuelle dans la page
            this.showInPageNotification(messageData);

            // Faire vibrer si supporté (mobile)
            this.vibrate();

        } catch (error) {
            console.error('❌ Erreur notification:', error);
        }
    }

    // ==================== SON D'ALERTE ====================
    playNotificationSound(isUrgent = false) {
        if (!this.soundEnabled) return;

        try {
            if (isUrgent) {
                // Son urgent (pour messages avec produit)
                this.sounds.urgentMessage.play();
                setTimeout(() => this.sounds.urgentMessage.play(), 200);
            } else {
                // Son normal
                this.sounds.newMessage.play();
            }
        } catch (error) {
            console.error('❌ Erreur lecture son:', error);
        }
    }

    // ==================== NOTIFICATION DESKTOP ====================
    showDesktopNotification(messageData) {
        if (!this.desktopNotificationEnabled) return;
        if (Notification.permission !== 'granted') return;

        try {
            const title = `💬 Nouveau message de ${messageData.client}`;
            const body = messageData.has_product 
                ? '📦 Produit partagé dans le message'
                : messageData.message.substring(0, 100);

            const notification = new Notification(title, {
                body: body,
                icon: 'oda.jpg', // Votre logo
                badge: 'oda.jpg',
                tag: `message-${messageData.id}`,
                requireInteraction: false,
                silent: true, // On gère le son nous-mêmes
                timestamp: new Date(messageData.created_at).getTime(),
                data: {
                    messageId: messageData.id,
                    client: messageData.client
                }
            });

            // Clic sur la notification -> ouvrir la conversation
            notification.onclick = () => {
                window.focus();
                notification.close();
                
                // Ouvrir la conversation du client
                if (typeof ouvrirConversation === 'function') {
                    ouvrirConversation(messageData.client);
                }
            };

            // Fermer automatiquement après 5 secondes
            setTimeout(() => notification.close(), 5000);

        } catch (error) {
            console.error('❌ Erreur notification desktop:', error);
        }
    }

    // ==================== NOTIFICATION DANS LA PAGE ====================
    showInPageNotification(messageData) {
        try {
            // Créer l'élément de notification
            const notification = document.createElement('div');
            notification.className = 'in-page-notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <div class="notification-icon">💬</div>
                    <div class="notification-text">
                        <div class="notification-title">Nouveau message de ${this.escapeHtml(messageData.client)}</div>
                        <div class="notification-body">
                            ${messageData.has_product ? '📦 Produit partagé' : this.escapeHtml(messageData.message.substring(0, 50))}
                        </div>
                    </div>
                    <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;

            // Ajouter au DOM
            document.body.appendChild(notification);

            // Animation d'entrée
            setTimeout(() => notification.classList.add('show'), 10);

            // Retirer automatiquement après 5 secondes
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 5000);

            // Clic sur la notification
            notification.addEventListener('click', (e) => {
                if (!e.target.classList.contains('notification-close')) {
                    if (typeof ouvrirConversation === 'function') {
                        ouvrirConversation(messageData.client);
                    }
                    notification.remove();
                }
            });

        } catch (error) {
            console.error('❌ Erreur notification in-page:', error);
        }
    }

    // ==================== VIBRATION ====================
    vibrate() {
        if ('vibrate' in navigator) {
            try {
                // Pattern: vibrer 200ms, pause 100ms, vibrer 200ms
                navigator.vibrate([200, 100, 200]);
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

            // Créer le panneau de contrôle (optionnel, peut être ajouté au menu hamburger)
            const controlsHTML = `
                <div class="notification-controls" style="display: none;">
                    <div class="control-item">
                        <label class="control-label">
                            <input type="checkbox" id="toggleNotifications" ${this.isEnabled ? 'checked' : ''}>
                            <span>Activer les notifications</span>
                        </label>
                    </div>
                    <div class="control-item">
                        <label class="control-label">
                            <input type="checkbox" id="toggleSound" ${this.soundEnabled ? 'checked' : ''}>
                            <span>Son d'alerte</span>
                        </label>
                    </div>
                    <div class="control-item">
                        <label class="control-label">
                            <input type="checkbox" id="toggleDesktop" ${this.desktopNotificationEnabled ? 'checked' : ''}>
                            <span>Notifications bureau</span>
                        </label>
                    </div>
                </div>
            `;

            // Ajouter les événements
            setTimeout(() => {
                const toggleNotifications = document.getElementById('toggleNotifications');
                const toggleSound = document.getElementById('toggleSound');
                const toggleDesktop = document.getElementById('toggleDesktop');

                if (toggleNotifications) {
                    toggleNotifications.addEventListener('change', (e) => {
                        this.isEnabled = e.target.checked;
                        this.saveUserPreferences();
                    });
                }

                if (toggleSound) {
                    toggleSound.addEventListener('change', (e) => {
                        this.soundEnabled = e.target.checked;
                        this.saveUserPreferences();
                        if (e.target.checked) {
                            this.sounds.newMessage.play();
                        }
                    });
                }

                if (toggleDesktop) {
                    toggleDesktop.addEventListener('change', async (e) => {
                        if (e.target.checked) {
                            await this.requestNotificationPermission();
                            e.target.checked = this.notificationPermission === 'granted';
                        }
                        this.desktopNotificationEnabled = e.target.checked;
                        this.saveUserPreferences();
                    });
                }
            }, 500);

        } catch (error) {
            console.error('❌ Erreur ajout contrôles:', error);
        }
    }

    // ==================== STYLES CSS ====================
    injectStyles() {
        if (document.getElementById('notification-system-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'notification-system-styles';
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
                font-size: 2rem;
                flex-shrink: 0;
            }

            .notification-text {
                flex: 1;
                min-width: 0;
            }

            .notification-title {
                font-weight: 600;
                font-size: 0.95rem;
                color: #1D1D1F;
                margin-bottom: 4px;
            }

            .notification-body {
                font-size: 0.85rem;
                color: #86868B;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
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
            }

            .notification-close:hover {
                background: rgba(255, 59, 48, 0.1);
                color: #FF3B30;
                transform: scale(1.1);
            }

            /* Contrôles de notification */
            .notification-controls {
                padding: 16px;
                background: white;
                border-radius: 12px;
                margin: 16px 0;
            }

            .control-item {
                padding: 12px 0;
                border-bottom: 1px solid #f0f0f0;
            }

            .control-item:last-child {
                border-bottom: none;
            }

            .control-label {
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                font-size: 0.95rem;
                color: #1D1D1F;
            }

            .control-label input[type="checkbox"] {
                width: 20px;
                height: 20px;
                cursor: pointer;
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
            localStorage.setItem('messageNotificationPreferences', JSON.stringify(preferences));
            console.log('💾 Préférences sauvegardées');
        } catch (error) {
            console.error('❌ Erreur sauvegarde préférences:', error);
        }
    }

    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('messageNotificationPreferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                this.isEnabled = preferences.isEnabled !== false;
                this.soundEnabled = preferences.soundEnabled !== false;
                this.desktopNotificationEnabled = preferences.desktopNotificationEnabled !== false;
                console.log('✅ Préférences chargées');
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

    // Réinitialiser le système (pour debug)
    reset() {
        this.processedMessageIds.clear();
        this.lastMessageCount = 0;
        this.lastUnreadCount = 0;
        console.log('🔄 Système de notifications réinitialisé');
    }

    // Tester les notifications
    test() {
        console.log('🧪 Test du système de notifications...');
        
        const testMessage = {
            id: 'test-' + Date.now(),
            client: 'Client Test',
            message: 'Ceci est un message de test pour vérifier les notifications',
            created_at: new Date().toISOString(),
            has_product: false
        };

        this.notifyNewMessage(testMessage);
        console.log('✅ Test envoyé');
    }
}

// ==================== EXPORT ====================
// Créer l'instance globale
window.messageNotificationSystem = new MessageNotificationSystem();

// Fonction d'intégration facile
window.initMessageNotifications = async function(supabaseClient, currentUser) {
    try {
        console.log('🚀 Initialisation système de notifications...');
        
        // Initialiser le système
        await window.messageNotificationSystem.init();
        
        // Retourner une fonction à appeler dans le polling
        return {
            checkNewMessages: (conversations) => {
                window.messageNotificationSystem.checkForNewMessages(conversations, currentUser);
            },
            test: () => window.messageNotificationSystem.test(),
            reset: () => window.messageNotificationSystem.reset()
        };
    } catch (error) {
        console.error('❌ Erreur initialisation notifications:', error);
        return null;
    }
};

console.log('✅ Module message-notifications.js chargé');
