
// ==================== SYSTÈME DE NOTIFICATIONS MESSAGES ====================
// Notifications en temps réel pour nouveaux messages avec son et badge

class MessageNotificationSystem {
    constructor() {
        this.lastCheckedMessages = new Map(); // Map<clientName, lastMessageId>
        this.notificationSound = null;
        this.permissionGranted = false;
        this.badgeCount = 0;
        
        this.init();
    }
    
    // ==================== INITIALISATION ====================
    async init() {
        console.log('🔔 Initialisation du système de notifications messages');
        
        // Demander la permission pour les notifications
        await this.requestNotificationPermission();
        
        // Initialiser le son de notification
        this.initSound();
        
        // Initialiser le badge du navigateur
        this.initBadge();
        
        // Écouter les nouveaux messages
        this.startListening();
    }
    
    // ==================== PERMISSION NOTIFICATIONS ====================
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.warn('⚠️ Les notifications ne sont pas supportées');
            return false;
        }
        
        if (Notification.permission === 'granted') {
            this.permissionGranted = true;
            console.log('✅ Permission notifications accordée');
            return true;
        }
        
        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.permissionGranted = (permission === 'granted');
            console.log(`🔔 Permission notifications: ${permission}`);
            return this.permissionGranted;
        }
        
        return false;
    }
    
    // ==================== INITIALISER LE SON ====================
    initSound() {
        // Son de notification (double bip)
        this.notificationSound = {
            play: () => {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    
                    // Premier bip
                    const oscillator1 = audioContext.createOscillator();
                    const gainNode1 = audioContext.createGain();
                    
                    oscillator1.connect(gainNode1);
                    gainNode1.connect(audioContext.destination);
                    
                    oscillator1.frequency.value = 800;
                    oscillator1.type = 'sine';
                    gainNode1.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    
                    oscillator1.start(audioContext.currentTime);
                    oscillator1.stop(audioContext.currentTime + 0.2);
                    
                    // Deuxième bip
                    setTimeout(() => {
                        const oscillator2 = audioContext.createOscillator();
                        const gainNode2 = audioContext.createGain();
                        
                        oscillator2.connect(gainNode2);
                        gainNode2.connect(audioContext.destination);
                        
                        oscillator2.frequency.value = 960;
                        oscillator2.type = 'sine';
                        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
                        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                        
                        oscillator2.start(audioContext.currentTime);
                        oscillator2.stop(audioContext.currentTime + 0.2);
                    }, 150);
                    
                    console.log('🔊 Son de notification joué');
                } catch (error) {
                    console.warn('⚠️ Impossible de jouer le son:', error);
                }
            }
        };
    }
    
    // ==================== BADGE NAVIGATEUR ====================
    initBadge() {
        // Support du badge pour PWA
        if ('setAppBadge' in navigator) {
            console.log('✅ Badge navigateur supporté');
        }
    }
    
    updateBadge(count) {
        this.badgeCount = count;
        
        // Mettre à jour le badge de la PWA
        if ('setAppBadge' in navigator) {
            if (count > 0) {
                navigator.setAppBadge(count);
            } else {
                navigator.clearAppBadge();
            }
        }
        
        // Mettre à jour le badge dans le header
        const headerBadge = document.querySelector('.notification-btn .badge');
        if (headerBadge) {
            if (count > 0) {
                headerBadge.textContent = count > 99 ? '99+' : count;
                headerBadge.style.display = 'block';
            } else {
                headerBadge.style.display = 'none';
            }
        }
        
        // Mettre à jour le titre de la page
        const baseTitle = 'Messages - Ma Boutique ODA';
        if (count > 0) {
            document.title = `(${count}) ${baseTitle}`;
        } else {
            document.title = baseTitle;
        }
    }
    
    // ==================== ÉCOUTER LES NOUVEAUX MESSAGES ====================
    startListening() {
        console.log('👂 Écoute des nouveaux messages activée');
        
        // Vérifier périodiquement les nouveaux messages
        setInterval(() => {
            this.checkNewMessages();
        }, 3000); // Vérifier toutes les 3 secondes
    }
    
    // ==================== VÉRIFIER NOUVEAUX MESSAGES ====================
    async checkNewMessages() {
        // Récupérer les conversations depuis la variable globale
        if (typeof conversations === 'undefined') {
            return;
        }
        
        let newMessagesCount = 0;
        const newMessages = [];
        
        conversations.forEach((messages, clientName) => {
            if (messages.length === 0) return;
            
            const lastMessage = messages[messages.length - 1];
            const lastMessageId = lastMessage.id;
            
            // Vérifier si c'est un nouveau message
            if (!this.lastCheckedMessages.has(clientName)) {
                this.lastCheckedMessages.set(clientName, lastMessageId);
                return;
            }
            
            const previousLastId = this.lastCheckedMessages.get(clientName);
            
            if (lastMessageId !== previousLastId) {
                // Nouveau message détecté
                if (lastMessage.type === 'client') {
                    newMessagesCount++;
                    newMessages.push({
                        clientName,
                        message: lastMessage
                    });
                }
                
                this.lastCheckedMessages.set(clientName, lastMessageId);
            }
        });
        
        // Si de nouveaux messages sont détectés
        if (newMessagesCount > 0) {
            this.handleNewMessages(newMessages);
        }
    }
    
    // ==================== GÉRER LES NOUVEAUX MESSAGES ====================
    handleNewMessages(newMessages) {
        console.log(`📬 ${newMessages.length} nouveau(x) message(s) détecté(s)`);
        
        // Compter les messages non lus
        let totalUnread = 0;
        if (typeof conversations !== 'undefined') {
            conversations.forEach((messages) => {
                const unreadCount = messages.filter(m => 
                    m.type === 'client' && !m.read
                ).length;
                totalUnread += unreadCount;
            });
        }
        
        // Mettre à jour le badge
        this.updateBadge(totalUnread);
        
        // Pour chaque nouveau message
        newMessages.forEach(({ clientName, message }) => {
            // Jouer le son
            this.notificationSound.play();
            
            // Afficher notification système
            this.showSystemNotification(clientName, message);
            
            // Afficher notification visuelle
            this.showVisualNotification(clientName, message);
        });
    }
    
    // ==================== NOTIFICATION SYSTÈME ====================
    showSystemNotification(clientName, message) {
        if (!this.permissionGranted) {
            return;
        }
        
        // Ne pas afficher si la page est visible et que la conversation est active
        if (!document.hidden && typeof conversationActive !== 'undefined' && conversationActive === clientName) {
            return;
        }
        
        const title = `💬 ${clientName}`;
        const body = message.text.length > 100 
            ? message.text.substring(0, 100) + '...' 
            : message.text;
        
        const options = {
            body: body,
            icon: '/oda-icon-192.png',
            badge: '/oda-icon-192.png',
            tag: `message-${clientName}`,
            requireInteraction: false,
            vibrate: [200, 100, 200],
            data: {
                clientName: clientName,
                url: window.location.href
            }
        };
        
        // Créer la notification
        const notification = new Notification(title, options);
        
        // Gérer le clic sur la notification
        notification.onclick = () => {
            window.focus();
            
            // Ouvrir la conversation si la fonction existe
            if (typeof ouvrirConversation === 'function') {
                ouvrirConversation(clientName);
            }
            
            notification.close();
        };
        
        // Fermer automatiquement après 10 secondes
        setTimeout(() => notification.close(), 10000);
    }
    
    // ==================== NOTIFICATION VISUELLE ====================
    showVisualNotification(clientName, message) {
        // Créer le conteneur si nécessaire
        let container = document.getElementById('message-notification-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'message-notification-container';
            container.style.cssText = `
                position: fixed;
                top: 90px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
        
        // Créer la notification
        const notif = document.createElement('div');
        notif.className = 'message-visual-notification';
        notif.style.cssText = `
            background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 122, 255, 0.4);
            animation: slideInRight 0.5s ease;
            cursor: pointer;
            transition: transform 0.2s ease;
            display: flex;
            align-items: start;
            gap: 12px;
        `;
        
        const messagePreview = message.text.length > 80 
            ? message.text.substring(0, 80) + '...' 
            : message.text;
        
        notif.innerHTML = `
            <div style="font-size: 24px;">💬</div>
            <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 600; font-size: 15px; margin-bottom: 4px;">
                    ${this.escapeHtml(clientName)}
                </div>
                <div style="font-size: 13px; opacity: 0.95; line-height: 1.4;">
                    ${this.escapeHtml(messagePreview)}
                </div>
            </div>
            <button style="
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                font-size: 18px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            ">×</button>
        `;
        
        // Hover effect
        notif.addEventListener('mouseenter', () => {
            notif.style.transform = 'translateX(-5px)';
        });
        
        notif.addEventListener('mouseleave', () => {
            notif.style.transform = 'translateX(0)';
        });
        
        // Clic sur la notification
        notif.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                if (typeof ouvrirConversation === 'function') {
                    ouvrirConversation(clientName);
                }
                notif.remove();
            }
        });
        
        // Bouton fermer
        const closeBtn = notif.querySelector('button');
        closeBtn.addEventListener('click', () => {
            notif.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        });
        
        container.appendChild(notif);
        
        // Supprimer automatiquement après 8 secondes
        setTimeout(() => {
            if (notif.parentElement) {
                notif.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notif.remove(), 300);
            }
        }, 8000);
    }
    
    // ==================== MARQUER COMME LU ====================
    markAsRead(clientName) {
        // Cette fonction sera appelée quand l'utilisateur ouvre une conversation
        console.log(`✅ Messages de ${clientName} marqués comme lus`);
        
        // Recalculer le badge
        let totalUnread = 0;
        if (typeof conversations !== 'undefined') {
            conversations.forEach((messages, name) => {
                if (name === clientName) return; // Ignorer la conversation actuelle
                
                const unreadCount = messages.filter(m => 
                    m.type === 'client' && !m.read
                ).length;
                totalUnread += unreadCount;
            });
        }
        
        this.updateBadge(totalUnread);
    }
    
    // ==================== UTILITAIRES ====================
    escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
}

// ==================== STYLES CSS ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .message-visual-notification:hover {
        box-shadow: 0 12px 40px rgba(0, 122, 255, 0.5);
    }
    
    @media (max-width: 480px) {
        #message-notification-container {
            left: 10px;
            right: 10px;
            max-width: none;
        }
    }
`;
document.head.appendChild(style);

// ==================== INITIALISATION ====================
let notificationChecker = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        notificationChecker = new MessageNotificationSystem();
        console.log('✅ Système de notifications messages initialisé');
    });
} else {
    notificationChecker = new MessageNotificationSystem();
    console.log('✅ Système de notifications messages initialisé');
}

// Exposer globalement pour utilisation dans messages.html
window.messageNotificationSystem = notificationChecker;