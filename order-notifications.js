// ==================== SYSTÈME DE NOTIFICATIONS COMMANDES ====================
// Notifications en temps réel pour nouvelles commandes et changements de statut

class OrderNotificationSystem {
    constructor() {
        this.lastCheckedOrders = new Map(); // Map<orderId, status>
        this.notificationSound = null;
        this.permissionGranted = false;
        this.badgeCount = 0;
        this.lastOrderCount = 0;
        
        this.init();
    }
    
    // ==================== INITIALISATION ====================
    async init() {
        console.log('🔔 Initialisation du système de notifications commandes');
        
        // Demander la permission pour les notifications
        await this.requestNotificationPermission();
        
        // Initialiser le son de notification
        this.initSound();
        
        // Initialiser le badge
        this.initBadge();
        
        // Écouter les nouvelles commandes
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
    
    // ==================== SON DE NOTIFICATION ====================
    initSound() {
        this.notificationSound = {
            play: () => {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    
                    // Triple bip pour commande (plus distinctif)
                    const frequencies = [600, 750, 900];
                    frequencies.forEach((freq, index) => {
                        setTimeout(() => {
                            const oscillator = audioContext.createOscillator();
                            const gainNode = audioContext.createGain();
                            
                            oscillator.connect(gainNode);
                            gainNode.connect(audioContext.destination);
                            
                            oscillator.frequency.value = freq;
                            oscillator.type = 'sine';
                            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                            
                            oscillator.start(audioContext.currentTime);
                            oscillator.stop(audioContext.currentTime + 0.15);
                        }, index * 100);
                    });
                    
                    console.log('🔊 Son de notification commande joué');
                } catch (error) {
                    console.warn('⚠️ Impossible de jouer le son:', error);
                }
            }
        };
    }
    
    // ==================== BADGE ====================
    initBadge() {
        if ('setAppBadge' in navigator) {
            console.log('✅ Badge navigateur supporté');
        }
    }
    
    updateBadge(count) {
        this.badgeCount = count;
        
        // Badge PWA
        if ('setAppBadge' in navigator) {
            if (count > 0) {
                navigator.setAppBadge(count);
            } else {
                navigator.clearAppBadge();
            }
        }
        
        // Badge header
        const headerBadge = document.querySelector('.notification-btn .badge');
        if (headerBadge) {
            if (count > 0) {
                headerBadge.textContent = count > 99 ? '99+' : count;
                headerBadge.style.display = 'block';
            } else {
                headerBadge.style.display = 'none';
            }
        }
        
        // Titre de la page
        const baseTitle = 'Commandes - Ma Boutique Élégante';
        if (count > 0) {
            document.title = `(${count}) ${baseTitle}`;
        } else {
            document.title = baseTitle;
        }
    }
    
    // ==================== ÉCOUTER LES COMMANDES ====================
    startListening() {
        console.log('👂 Écoute des nouvelles commandes activée');
        
        // Vérifier périodiquement
        setInterval(() => {
            this.checkNewOrders();
        }, 4000); // Vérifier toutes les 4 secondes
    }
    
    // ==================== VÉRIFIER NOUVELLES COMMANDES ====================
    async checkNewOrders() {
        // Récupérer les commandes depuis la variable globale
        if (typeof commandes === 'undefined' || !Array.isArray(commandes)) {
            return;
        }
        
        const currentOrderCount = commandes.length;
        const newOrders = [];
        const statusChanged = [];
        
        // Vérifier nouvelles commandes
        if (this.lastOrderCount > 0 && currentOrderCount > this.lastOrderCount) {
            const newOrdersCount = currentOrderCount - this.lastOrderCount;
            console.log(`🆕 ${newOrdersCount} nouvelle(s) commande(s) détectée(s)`);
            
            // Récupérer les nouvelles commandes (les plus récentes)
            for (let i = 0; i < newOrdersCount; i++) {
                newOrders.push(commandes[i]);
            }
        }
        
        // Vérifier changements de statut
        commandes.forEach(order => {
            if (!order || !order.id) return;
            
            if (this.lastCheckedOrders.has(order.id)) {
                const previousStatus = this.lastCheckedOrders.get(order.id);
                if (previousStatus !== order.statut) {
                    console.log(`🔄 Changement de statut: commande ${order.numero_commande} → ${order.statut}`);
                    statusChanged.push(order);
                }
            }
            
            this.lastCheckedOrders.set(order.id, order.statut);
        });
        
        this.lastOrderCount = currentOrderCount;
        
        // Gérer les nouvelles commandes
        if (newOrders.length > 0) {
            this.handleNewOrders(newOrders);
        }
        
        // Gérer les changements de statut
        if (statusChanged.length > 0) {
            this.handleStatusChanged(statusChanged);
        }
        
        // Mettre à jour le badge avec les commandes en attente
        const pendingOrders = commandes.filter(c => c.statut === 'en_attente').length;
        this.updateBadge(pendingOrders);
    }
    
    // ==================== GÉRER NOUVELLES COMMANDES ====================
    handleNewOrders(orders) {
        orders.forEach(order => {
            // Jouer le son
            this.notificationSound.play();
            
            // Notification système
            this.showSystemNotification(
                '🛒 Nouvelle commande !',
                `Commande ${order.numero_commande} de ${order.client_nom || 'Client'}\nMontant: ${this.formatPrice(order.montant_total)}`,
                'new-order',
                order
            );
            
            // Notification visuelle
            this.showVisualNotification(
                '🛒 Nouvelle commande !',
                `Commande ${order.numero_commande}`,
                `${order.client_nom || 'Client'} • ${this.formatPrice(order.montant_total)}`,
                '#4CAF50',
                order
            );
        });
    }
    
    // ==================== GÉRER CHANGEMENTS DE STATUT ====================
    handleStatusChanged(orders) {
        orders.forEach(order => {
            const statusInfo = this.getStatusInfo(order.statut);
            
            // Son plus doux pour changement de statut
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 700;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
            } catch (error) {
                console.warn('⚠️ Impossible de jouer le son:', error);
            }
            
            // Notification système
            this.showSystemNotification(
                `${statusInfo.emoji} Statut mis à jour`,
                `Commande ${order.numero_commande} → ${statusInfo.label}`,
                'status-change',
                order
            );
            
            // Notification visuelle
            this.showVisualNotification(
                `${statusInfo.emoji} Statut mis à jour`,
                `Commande ${order.numero_commande}`,
                `${statusInfo.label}`,
                statusInfo.color,
                order
            );
        });
    }
    
    // ==================== NOTIFICATION SYSTÈME ====================
    showSystemNotification(title, body, tag, order) {
        if (!this.permissionGranted) {
            return;
        }
        
        // Ne pas afficher si la page est visible
        if (!document.hidden) {
            return;
        }
        
        const options = {
            body: body,
            icon: '/oda-icon-192.png',
            badge: '/oda-icon-192.png',
            tag: tag,
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 200],
            data: {
                orderId: order.id,
                url: window.location.href
            }
        };
        
        const notification = new Notification(title, options);
        
        notification.onclick = () => {
            window.focus();
            
            // Ouvrir le détail de la commande
            if (typeof afficherDetailsCommande === 'function') {
                afficherDetailsCommande(order);
            }
            
            notification.close();
        };
        
        // Fermer après 15 secondes
        setTimeout(() => notification.close(), 15000);
    }
    
    // ==================== NOTIFICATION VISUELLE ====================
    showVisualNotification(title, subtitle, description, color, order) {
        let container = document.getElementById('order-notification-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'order-notification-container';
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
        
        const notif = document.createElement('div');
        notif.className = 'order-visual-notification';
        notif.style.cssText = `
            background: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.5s ease;
            cursor: pointer;
            transition: all 0.2s ease;
            border-left: 4px solid ${color};
        `;
        
        notif.innerHTML = `
            <div style="display: flex; align-items: start; gap: 12px;">
                <div style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: ${color}20;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    flex-shrink: 0;
                ">
                    ${title.split(' ')[0]}
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: 15px; color: #1D1D1F; margin-bottom: 4px;">
                        ${this.escapeHtml(subtitle)}
                    </div>
                    <div style="font-size: 13px; color: #6E6E73; line-height: 1.4;">
                        ${this.escapeHtml(description)}
                    </div>
                </div>
                <button style="
                    background: #F5F5F7;
                    border: none;
                    color: #6E6E73;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    font-size: 18px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: all 0.2s ease;
                ">×</button>
            </div>
        `;
        
        // Hover
        notif.addEventListener('mouseenter', () => {
            notif.style.transform = 'translateX(-5px)';
            notif.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)';
        });
        
        notif.addEventListener('mouseleave', () => {
            notif.style.transform = 'translateX(0)';
            notif.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
        });
        
        // Clic
        notif.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                if (typeof afficherDetailsCommande === 'function') {
                    afficherDetailsCommande(order);
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
        
        // Auto-supprimer après 10 secondes
        setTimeout(() => {
            if (notif.parentElement) {
                notif.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notif.remove(), 300);
            }
        }, 10000);
    }
    
    // ==================== INFOS STATUT ====================
    getStatusInfo(statut) {
        const statusMap = {
            'en_attente': { label: 'En attente', emoji: '⏳', color: '#FF9800' },
            'confirmee': { label: 'Confirmée', emoji: '✅', color: '#4CAF50' },
            'en_preparation': { label: 'En préparation', emoji: '📦', color: '#2196F3' },
            'en_livraison': { label: 'En livraison', emoji: '🚚', color: '#9C27B0' },
            'livree': { label: 'Livrée', emoji: '🎉', color: '#4CAF50' },
            'annulee': { label: 'Annulée', emoji: '❌', color: '#F44336' }
        };
        
        return statusMap[statut] || { label: statut, emoji: '📋', color: '#757575' };
    }
    
    // ==================== UTILITAIRES ====================
    formatPrice(price) {
        if (!price && price !== 0) return '0 FCFA';
        return `${price.toLocaleString('fr-FR')} FCFA`;
    }
    
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
    
    @media (max-width: 480px) {
        #order-notification-container {
            left: 10px;
            right: 10px;
            max-width: none;
        }
    }
`;
document.head.appendChild(style);

// ==================== INITIALISATION ====================
let orderNotificationSystem = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        orderNotificationSystem = new OrderNotificationSystem();
        console.log('✅ Système de notifications commandes initialisé');
    });
} else {
    orderNotificationSystem = new OrderNotificationSystem();
    console.log('✅ Système de notifications commandes initialisé');
}

// Exposer globalement
window.orderNotificationSystem = orderNotificationSystem;