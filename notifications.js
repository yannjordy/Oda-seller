// ==================== SYSTÈME DE NOTIFICATIONS PUSH PHOENIX ODA ====================
// Avec surveillance en temps réel et alarme sonore

class NotificationSystemODA {
    constructor() {
        this.supabase = null;
        this.currentUserId = null;
        this.audioContext = null;
        this.subscriptions = [];
        this.notificationQueue = [];
        this.isInitialized = false;
        this.lastNotificationTime = {};
        
        // Configuration des sons d'alarme
        this.soundEnabled = true;
        this.soundVolume = 0.7;
        
        // Compteurs de notifications non lues
        this.unreadCounts = {
            commandes: 0,
            messages: 0,
            clients: 0
        };
    }

    // ==================== INITIALISATION ====================
    async init(supabaseClient, userId) {
        if (this.isInitialized) {
            console.log('🔔 Système de notifications déjà initialisé');
            return;
        }

        this.supabase = supabaseClient;
        this.currentUserId = userId;
        
        // Initialiser le contexte audio
        this.initAudioContext();
        
        // Demander la permission pour les notifications
        await this.requestNotificationPermission();
        
        // Créer le conteneur de notifications
        this.createNotificationContainer();
        
        // Démarrer l'écoute en temps réel
        this.startRealtimeListeners();
        
        // Afficher le badge de notification
        this.createNotificationBadge();
        
        this.isInitialized = true;
        
        console.log('🔔 Système de notifications Phoenix ODA initialisé avec succès');
        this.showNotification('✅ Notifications activées', 'success');
    }

    // ==================== CONTEXTE AUDIO ====================
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🔊 Contexte audio initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation audio:', error);
        }
    }

    // ==================== SON D'ALARME ====================
    playAlarmSound() {
        if (!this.soundEnabled || !this.audioContext) return;

        const duration = 0.3;
        const frequency1 = 800;
        const frequency2 = 1000;

        // Créer l'oscillateur principal
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        oscillator1.frequency.setValueAtTime(frequency1, this.audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(frequency2, this.audioContext.currentTime);

        // Configuration du gain (volume)
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.soundVolume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        // Connecter les oscillateurs
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Jouer le son
        oscillator1.start(this.audioContext.currentTime);
        oscillator2.start(this.audioContext.currentTime);
        oscillator1.stop(this.audioContext.currentTime + duration);
        oscillator2.stop(this.audioContext.currentTime + duration);

        // Répéter 2 fois
        setTimeout(() => {
            if (this.soundEnabled && this.audioContext) {
                const osc1 = this.audioContext.createOscillator();
                const osc2 = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc1.type = 'sine';
                osc2.type = 'sine';
                osc1.frequency.setValueAtTime(frequency1, this.audioContext.currentTime);
                osc2.frequency.setValueAtTime(frequency2, this.audioContext.currentTime);

                gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                gain.gain.linearRampToValueAtTime(this.soundVolume, this.audioContext.currentTime + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(this.audioContext.destination);

                osc1.start(this.audioContext.currentTime);
                osc2.start(this.audioContext.currentTime);
                osc1.stop(this.audioContext.currentTime + duration);
                osc2.stop(this.audioContext.currentTime + duration);
            }
        }, 400);
    }

    // ==================== PERMISSION NOTIFICATIONS ====================
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.warn('⚠️ Les notifications ne sont pas supportées par ce navigateur');
            return;
        }

        if (Notification.permission === 'granted') {
            console.log('✅ Permission notifications déjà accordée');
            return;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('✅ Permission notifications accordée');
            }
        }
    }

    // ==================== CONTENEUR NOTIFICATIONS ====================
    createNotificationContainer() {
        let container = document.getElementById('phoenix-notification-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'phoenix-notification-container';
            container.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-width: 400px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
    }

    // ==================== BADGE DE NOTIFICATION ====================
    createNotificationBadge() {
        let badge = document.getElementById('notification-badge');
        
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'notification-badge';
            badge.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #FF3B30 0%, #FF6B6B 100%);
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: none;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 14px;
                box-shadow: 0 4px 15px rgba(255, 59, 48, 0.4);
                z-index: 99998;
                animation: pulse 2s infinite;
                cursor: pointer;
                pointer-events: auto;
            `;
            
            // Ajouter l'animation pulse
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                @keyframes slideInRight {
                    from { transform: translateX(450px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
            
            badge.addEventListener('click', () => {
                this.clearAllNotifications();
            });
            
            document.body.appendChild(badge);
        }
        
        return badge;
    }

    // ==================== MISE À JOUR DU BADGE ====================
    updateBadge() {
        const badge = document.getElementById('notification-badge');
        const totalUnread = this.unreadCounts.commandes + 
                           this.unreadCounts.messages + 
                           this.unreadCounts.clients;
        
        if (totalUnread > 0) {
            badge.textContent = totalUnread > 99 ? '99+' : totalUnread;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    // ==================== ÉCOUTE TEMPS RÉEL ====================
    startRealtimeListeners() {
        console.log('🔄 Démarrage de l\'écoute en temps réel...');

        // Écouter les nouvelles commandes
        const commandesChannel = this.supabase
            .channel('commandes-changes')
            .on('postgres_changes', 
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'commandes',
                    filter: `user_id=eq.${this.currentUserId}`
                }, 
                (payload) => this.handleNewCommande(payload)
            )
            .subscribe();

        // Écouter les nouveaux messages
        const messagesChannel = this.supabase
            .channel('messages-changes')
            .on('postgres_changes', 
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'messages',
                    filter: `user_id=eq.${this.currentUserId}`
                }, 
                (payload) => this.handleNewMessage(payload)
            )
            .subscribe();

        // Écouter les nouveaux clients
        const clientsChannel = this.supabase
            .channel('clients-changes')
            .on('postgres_changes', 
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'clients',
                    filter: `user_id=eq.${this.currentUserId}`
                }, 
                (payload) => this.handleNewClient(payload)
            )
            .subscribe();

        this.subscriptions.push(commandesChannel, messagesChannel, clientsChannel);
        
        console.log('✅ Écoute temps réel activée pour: commandes, messages, clients');
    }

    // ==================== GESTIONNAIRES D'ÉVÉNEMENTS ====================
    handleNewCommande(payload) {
        const commande = payload.new;
        const now = Date.now();
        
        // Éviter les doublons (notifications < 2 secondes d'intervalle)
        if (this.lastNotificationTime.commande && (now - this.lastNotificationTime.commande) < 2000) {
            return;
        }
        this.lastNotificationTime.commande = now;

        console.log('🆕 Nouvelle commande détectée:', commande);

        // Jouer le son d'alarme
        this.playAlarmSound();

        // Afficher la notification
        this.showNotification(
            `🛍️ Nouvelle commande de ${commande.nom_client || 'Client'}`,
            'success',
            `Montant: ${commande.montant_total || 0} FCFA`,
            '/commandes.html'
        );

        // Notification navigateur
        this.showBrowserNotification(
            '🛍️ Nouvelle commande!',
            `${commande.nom_client || 'Client'} - ${commande.montant_total || 0} FCFA`
        );

        // Incrémenter le compteur
        this.unreadCounts.commandes++;
        this.updateBadge();
    }

    handleNewMessage(payload) {
        const message = payload.new;
        const now = Date.now();
        
        if (this.lastNotificationTime.message && (now - this.lastNotificationTime.message) < 2000) {
            return;
        }
        this.lastNotificationTime.message = now;

        console.log('💬 Nouveau message détecté:', message);

        // Jouer le son d'alarme
        this.playAlarmSound();

        // Afficher la notification
        this.showNotification(
            `💬 Nouveau message de ${message.nom || 'Client'}`,
            'info',
            message.message ? message.message.substring(0, 50) + '...' : '',
            '/messages.html'
        );

        // Notification navigateur
        this.showBrowserNotification(
            '💬 Nouveau message!',
            `${message.nom || 'Client'}: ${message.message || ''}`
        );

        // Incrémenter le compteur
        this.unreadCounts.messages++;
        this.updateBadge();
    }

    handleNewClient(payload) {
        const client = payload.new;
        const now = Date.now();
        
        if (this.lastNotificationTime.client && (now - this.lastNotificationTime.client) < 2000) {
            return;
        }
        this.lastNotificationTime.client = now;

        console.log('👤 Nouveau client détecté:', client);

        // Jouer le son d'alarme
        this.playAlarmSound();

        // Afficher la notification
        this.showNotification(
            `👤 Nouveau client: ${client.nom || 'Sans nom'}`,
            'success',
            `Téléphone: ${client.telephone || 'Non renseigné'}`,
            '/clients.html'
        );

        // Notification navigateur
        this.showBrowserNotification(
            '👤 Nouveau client!',
            `${client.nom || 'Sans nom'} - ${client.telephone || ''}`
        );

        // Incrémenter le compteur
        this.unreadCounts.clients++;
        this.updateBadge();
    }

    // ==================== AFFICHAGE NOTIFICATION ====================
    showNotification(message, type = 'info', subtitle = '', link = null) {
        const container = document.getElementById('phoenix-notification-container');
        if (!container) return;

        const colors = {
            success: { bg: '#34C759', border: '#28A745' },
            error: { bg: '#FF3B30', border: '#DC3545' },
            info: { bg: '#007AFF', border: '#0056B3' },
            warning: { bg: '#FF9500', border: '#E68A00' }
        };

        const color = colors[type] || colors.info;

        const notification = document.createElement('div');
        notification.style.cssText = `
            background: white;
            padding: 18px 24px;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            border-left: 5px solid ${color.border};
            min-width: 350px;
            animation: slideInRight 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            cursor: pointer;
            transition: all 0.3s ease;
            pointer-events: auto;
            position: relative;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: start; gap: 12px;">
                <div style="
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: ${color.bg};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    flex-shrink: 0;
                ">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="
                        font-weight: 600;
                        font-size: 15px;
                        color: #1D1D1F;
                        margin-bottom: 4px;
                        font-family: 'Poppins', sans-serif;
                    ">${message}</div>
                    ${subtitle ? `
                        <div style="
                            font-size: 13px;
                            color: #86868B;
                            font-family: 'Poppins', sans-serif;
                            margin-top: 4px;
                        ">${subtitle}</div>
                    ` : ''}
                    <div style="
                        font-size: 11px;
                        color: #C7C7CC;
                        margin-top: 6px;
                    ">${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <button style="
                    background: none;
                    border: none;
                    color: #86868B;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    transition: all 0.2s;
                " onmouseover="this.style.background='#F2F2F7'" onmouseout="this.style.background='none'">×</button>
            </div>
        `;

        // Événement de clic sur la notification
        if (link) {
            notification.addEventListener('click', (e) => {
                if (!e.target.matches('button')) {
                    window.location.href = link;
                }
            });
        }

        // Événement de fermeture
        const closeBtn = notification.querySelector('button');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideInRight 0.3s reverse';
            setTimeout(() => notification.remove(), 300);
        });

        // Hover effect
        notification.addEventListener('mouseenter', () => {
            notification.style.transform = 'translateY(-3px)';
            notification.style.boxShadow = '0 15px 50px rgba(0, 0, 0, 0.25)';
        });

        notification.addEventListener('mouseleave', () => {
            notification.style.transform = 'translateY(0)';
            notification.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.2)';
        });

        container.appendChild(notification);

        // Auto-suppression après 6 secondes
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.5s reverse';
            setTimeout(() => notification.remove(), 500);
        }, 6000);
    }

    // ==================== NOTIFICATION NAVIGATEUR ====================
    showBrowserNotification(title, body) {
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;

        try {
            const notification = new Notification(title, {
                body: body,
                icon: '/oda.jpg',
                badge: '/oda.jpg',
                tag: 'oda-notification',
                requireInteraction: false,
                silent: false
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            setTimeout(() => notification.close(), 5000);
        } catch (error) {
            console.error('❌ Erreur notification navigateur:', error);
        }
    }

    // ==================== GESTION ====================
    clearAllNotifications() {
        this.unreadCounts = {
            commandes: 0,
            messages: 0,
            clients: 0
        };
        this.updateBadge();
        
        const container = document.getElementById('phoenix-notification-container');
        if (container) {
            container.innerHTML = '';
        }
        
        this.showNotification('🧹 Toutes les notifications ont été effacées', 'info');
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.showNotification(
            this.soundEnabled ? '🔊 Son activé' : '🔇 Son désactivé',
            'info'
        );
    }

    setVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
    }

    destroy() {
        // Nettoyer les abonnements
        this.subscriptions.forEach(sub => {
            this.supabase.removeChannel(sub);
        });
        this.subscriptions = [];
        
        // Fermer le contexte audio
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        console.log('🔴 Système de notifications arrêté');
    }
}

// ==================== INSTANCE GLOBALE ====================
window.notificationSystem = new NotificationSystemODA();

// ==================== FONCTION D'INITIALISATION AUTOMATIQUE ====================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Tentative d\'initialisation automatique des notifications...');
    
    // Attendre que Supabase et l'utilisateur soient disponibles
    const checkAndInit = setInterval(async () => {
        if (window.supabase && window.currentUser) {
            clearInterval(checkAndInit);
            
            try {
                await window.notificationSystem.init(window.supabase, window.currentUser.id);
                console.log('✅ Notifications initialisées automatiquement');
            } catch (error) {
                console.error('❌ Erreur initialisation notifications:', error);
            }
        }
    }, 500);
    
    // Timeout après 10 secondes
    setTimeout(() => {
        clearInterval(checkAndInit);
    }, 10000);
});

console.log('📦 Module de notifications Phoenix ODA chargé');
