// ==================== SYSTÈME DE NOTIFICATIONS TABLEAU DE BORD ====================
// Notifications globales pour activité, performances et alertes

class DashboardNotificationSystem {
    constructor() {
        this.notificationSound = null;
        this.permissionGranted = false;
        this.lastStats = null;
        this.alertThresholds = {
            lowStock: 5,           // Alerte si stock < 5
            highPendingOrders: 10, // Alerte si > 10 commandes en attente
            dailyTarget: 50000     // Objectif quotidien en FCFA
        };
        
        this.init();
    }
    
    // ==================== INITIALISATION ====================
    async init() {
        console.log('🔔 Initialisation du système de notifications tableau de bord');
        
        await this.requestNotificationPermission();
        this.initSound();
        this.initBadge();
        this.startMonitoring();
        this.scheduleWelcomeNotification();
    }
    
    // ==================== PERMISSION ====================
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
    
    // ==================== SON ====================
    initSound() {
        this.notificationSound = {
            play: (type = 'default') => {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    
                    if (type === 'alert') {
                        // Son d'alerte (plus urgent)
                        [650, 650, 650].forEach((freq, index) => {
                            setTimeout(() => {
                                const oscillator = audioContext.createOscillator();
                                const gainNode = audioContext.createGain();
                                
                                oscillator.connect(gainNode);
                                gainNode.connect(audioContext.destination);
                                
                                oscillator.frequency.value = freq;
                                oscillator.type = 'square';
                                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                                
                                oscillator.start(audioContext.currentTime);
                                oscillator.stop(audioContext.currentTime + 0.15);
                            }, index * 120);
                        });
                    } else {
                        // Son normal
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.value = 800;
                        oscillator.type = 'sine';
                        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.2);
                    }
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
        if ('setAppBadge' in navigator) {
            if (count > 0) {
                navigator.setAppBadge(count);
            } else {
                navigator.clearAppBadge();
            }
        }
    }
    
    // ==================== MONITORING ====================
    startMonitoring() {
        console.log('👂 Monitoring du tableau de bord activé');
        
        // Vérifier toutes les 10 secondes
        setInterval(() => {
            this.checkStats();
        }, 10000);
        
        // Vérifier immédiatement
        setTimeout(() => this.checkStats(), 3000);
    }
    
    // ==================== VÉRIFIER STATISTIQUES ====================
    async checkStats() {
        // Récupérer les stats depuis les variables globales
        const stats = {
            totalOrders: typeof nombreCommandes !== 'undefined' ? nombreCommandes : 0,
            pendingOrders: typeof commandesEnAttente !== 'undefined' ? commandesEnAttente : 0,
            todayRevenue: typeof chiffreAffairesJour !== 'undefined' ? chiffreAffairesJour : 0,
            lowStockProducts: this.getLowStockCount()
        };
        
        if (!this.lastStats) {
            this.lastStats = stats;
            return;
        }
        
        // Détecter les changements importants
        this.detectChanges(stats);
        
        this.lastStats = stats;
    }
    
    // ==================== DÉTECTER CHANGEMENTS ====================
    detectChanges(currentStats) {
        // Nouvelle commande
        if (currentStats.totalOrders > this.lastStats.totalOrders) {
            const newOrdersCount = currentStats.totalOrders - this.lastStats.totalOrders;
            this.notifyNewOrders(newOrdersCount);
        }
        
        // Commandes en attente élevées
        if (currentStats.pendingOrders >= this.alertThresholds.highPendingOrders && 
            this.lastStats.pendingOrders < this.alertThresholds.highPendingOrders) {
            this.notifyHighPendingOrders(currentStats.pendingOrders);
        }
        
        // Stock faible
        if (currentStats.lowStockProducts > 0 && 
            currentStats.lowStockProducts !== this.lastStats.lowStockProducts) {
            this.notifyLowStock(currentStats.lowStockProducts);
        }
        
        // Objectif quotidien atteint
        if (currentStats.todayRevenue >= this.alertThresholds.dailyTarget && 
            this.lastStats.todayRevenue < this.alertThresholds.dailyTarget) {
            this.notifyDailyTargetReached(currentStats.todayRevenue);
        }
    }
    
    // ==================== NOTIFICATIONS SPÉCIFIQUES ====================
    
    notifyNewOrders(count) {
        this.notificationSound.play('default');
        
        this.showVisualNotification(
            '🛒 Nouvelle(s) commande(s)',
            `${count} commande(s) reçue(s)`,
            'Vérifiez la page des commandes',
            '#4CAF50',
            'success'
        );
        
        if (this.permissionGranted && document.hidden) {
            this.showSystemNotification(
                '🛒 Nouvelle(s) commande(s)',
                `${count} commande(s) reçue(s)`,
                'new-orders'
            );
        }
    }
    
    notifyHighPendingOrders(count) {
        this.notificationSound.play('alert');
        
        this.showVisualNotification(
            '⚠️ Commandes en attente',
            `${count} commandes à traiter`,
            'Pensez à confirmer les commandes en attente',
            '#FF9800',
            'warning'
        );
    }
    
    notifyLowStock(count) {
        this.notificationSound.play('alert');
        
        this.showVisualNotification(
            '📦 Stock faible',
            `${count} produit(s) en rupture`,
            'Certains produits ont un stock inférieur à 5',
            '#F44336',
            'error'
        );
    }
    
    notifyDailyTargetReached(revenue) {
        this.notificationSound.play('default');
        
        this.showVisualNotification(
            '🎉 Objectif atteint !',
            `${this.formatPrice(revenue)}`,
            'Félicitations ! Vous avez atteint votre objectif quotidien',
            '#4CAF50',
            'success'
        );
        
        if (this.permissionGranted) {
            this.showSystemNotification(
                '🎉 Objectif quotidien atteint !',
                `Félicitations ! Vous avez généré ${this.formatPrice(revenue)} aujourd'hui`,
                'daily-target'
            );
        }
    }
    
    // ==================== NOTIFICATION BIENVENUE ====================
    scheduleWelcomeNotification() {
        setTimeout(() => {
            const hour = new Date().getHours();
            let greeting = '👋 Bonjour';
            
            if (hour < 12) greeting = '🌅 Bonjour';
            else if (hour < 18) greeting = '☀️ Bon après-midi';
            else greeting = '🌙 Bonsoir';
            
            this.showVisualNotification(
                greeting,
                'Bienvenue sur votre tableau de bord',
                'Consultez vos statistiques en temps réel',
                '#007AFF',
                'info'
            );
        }, 2000);
    }
    
    // ==================== NOTIFICATION SYSTÈME ====================
    showSystemNotification(title, body, tag) {
        if (!this.permissionGranted || !document.hidden) {
            return;
        }
        
        const options = {
            body: body,
            icon: '/oda-icon-192.png',
            badge: '/oda-icon-192.png',
            tag: tag,
            requireInteraction: false,
            vibrate: [200, 100, 200],
            data: {
                url: window.location.href
            }
        };
        
        const notification = new Notification(title, options);
        
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        
        setTimeout(() => notification.close(), 10000);
    }
    
    // ==================== NOTIFICATION VISUELLE ====================
    showVisualNotification(title, subtitle, description, color, type) {
        let container = document.getElementById('dashboard-notification-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'dashboard-notification-container';
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
        
        const iconMap = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };
        
        const notif = document.createElement('div');
        notif.className = 'dashboard-visual-notification';
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
                    ${iconMap[type] || '📊'}
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
                ">×</button>
            </div>
        `;
        
        notif.addEventListener('mouseenter', () => {
            notif.style.transform = 'translateX(-5px)';
            notif.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)';
        });
        
        notif.addEventListener('mouseleave', () => {
            notif.style.transform = 'translateX(0)';
            notif.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
        });
        
        const closeBtn = notif.querySelector('button');
        closeBtn.addEventListener('click', () => {
            notif.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        });
        
        container.appendChild(notif);
        
        setTimeout(() => {
            if (notif.parentElement) {
                notif.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notif.remove(), 300);
            }
        }, type === 'error' || type === 'warning' ? 15000 : 8000);
    }
    
    // ==================== UTILITAIRES ====================
    
    getLowStockCount() {
        try {
            if (typeof produits !== 'undefined' && Array.isArray(produits)) {
                return produits.filter(p => 
                    p.stock !== null && 
                    p.stock !== undefined && 
                    p.stock < this.alertThresholds.lowStock
                ).length;
            }
        } catch (error) {
            console.warn('Erreur calcul stock faible:', error);
        }
        return 0;
    }
    
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
    
    // ==================== API PUBLIQUE ====================
    
    // Permettre aux développeurs de déclencher des notifications personnalisées
    notify(title, message, type = 'info') {
        const colorMap = {
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#F44336',
            info: '#007AFF'
        };
        
        this.notificationSound.play(type === 'error' || type === 'warning' ? 'alert' : 'default');
        
        this.showVisualNotification(
            title,
            title,
            message,
            colorMap[type] || colorMap.info,
            type
        );
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
        #dashboard-notification-container {
            left: 10px;
            right: 10px;
            max-width: none;
        }
    }
`;
document.head.appendChild(style);

// ==================== INITIALISATION ====================
let dashboardNotificationSystem = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        dashboardNotificationSystem = new DashboardNotificationSystem();
        console.log('✅ Système de notifications tableau de bord initialisé');
    });
} else {
    dashboardNotificationSystem = new DashboardNotificationSystem();
    console.log('✅ Système de notifications tableau de bord initialisé');
}

// Exposer globalement
window.dashboardNotificationSystem = dashboardNotificationSystem;

// API pour notifications personnalisées
window.notify = (title, message, type) => {
    if (dashboardNotificationSystem) {
        dashboardNotificationSystem.notify(title, message, type);
    }
};