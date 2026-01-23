// ==================== SYSTÈME KEEP-ALIVE BACKEND ====================
// Fichier: render-keepalive.js
// Usage: <script src="render-keepalive.js"></script>

/**
 * Système de maintien du backend Render actif
 * Envoie un ping toutes les 14 minutes pour éviter l'endormissement
 */

class BackendKeepAlive {
    constructor(backendUrl, intervalMinutes = 14) {
        this.backendUrl = backendUrl;
        this.intervalMinutes = intervalMinutes;
        this.intervalId = null;
        this.isActive = false;
        this.lastPingTime = null;
        this.pingCount = 0;
        this.failureCount = 0;
        this.maxFailures = 3;
    }

    /**
     * Démarre le système de keep-alive
     */
    start() {
        if (this.isActive) {
            console.log('⚠️ Keep-Alive déjà actif');
            return;
        }

        console.log(`🔄 Keep-Alive démarré (ping toutes les ${this.intervalMinutes} min)`);
        
        // Premier ping immédiat
        this.ping();

        // Pings réguliers
        this.intervalId = setInterval(() => {
            this.ping();
        }, this.intervalMinutes * 60 * 1000);

        this.isActive = true;
    }

    /**
     * Arrête le système de keep-alive
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.isActive = false;
            console.log('🛑 Keep-Alive arrêté');
        }
    }

    /**
     * Envoie un ping au backend
     */
    async ping() {
        const startTime = Date.now();
        
        try {
            console.log(`🏓 Ping #${this.pingCount + 1} → ${this.backendUrl}/health`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(`${this.backendUrl}/health`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Keep-Alive': 'true'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const responseTime = Date.now() - startTime;

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            this.lastPingTime = new Date();
            this.pingCount++;
            this.failureCount = 0; // Reset failures sur succès

            console.log(`✅ Ping réussi (${responseTime}ms) - Total: ${this.pingCount}`);

            // Mettre à jour le statut global si disponible
            if (typeof window.backendHealthy !== 'undefined') {
                window.backendHealthy = true;
            }

            return true;

        } catch (error) {
            this.failureCount++;
            const responseTime = Date.now() - startTime;

            console.error(`❌ Ping échoué (${responseTime}ms):`, error.message);

            // Backend indisponible après plusieurs échecs
            if (this.failureCount >= this.maxFailures) {
                console.error(`🚨 Backend injoignable après ${this.failureCount} tentatives`);
                
                if (typeof window.backendHealthy !== 'undefined') {
                    window.backendHealthy = false;
                }
            }

            return false;
        }
    }

    /**
     * Récupère les statistiques du keep-alive
     */
    getStats() {
        return {
            isActive: this.isActive,
            pingCount: this.pingCount,
            failureCount: this.failureCount,
            lastPingTime: this.lastPingTime,
            intervalMinutes: this.intervalMinutes,
            nextPingIn: this.isActive && this.lastPingTime ? 
                Math.max(0, this.intervalMinutes * 60 - Math.floor((Date.now() - this.lastPingTime.getTime()) / 1000)) : null
        };
    }

    /**
     * Affiche les statistiques dans la console
     */
    logStats() {
        const stats = this.getStats();
        console.table(stats);
    }
}

// ==================== AUTO-INITIALISATION ====================

/**
 * Fonction d'initialisation automatique
 * Détecte l'URL du backend et démarre le keep-alive
 */
function initRenderKeepAlive() {
    // Détecter l'URL du backend
    let backendUrl;
    
    // Option 1: Utiliser BACKEND_URL si déjà défini
    if (typeof window.BACKEND_URL !== 'undefined') {
        backendUrl = window.BACKEND_URL;
    }
    // Option 2: Utiliser une variable globale personnalisée
    else if (typeof window.RENDER_BACKEND_URL !== 'undefined') {
        backendUrl = window.RENDER_BACKEND_URL;
    }
    // Option 3: Détection automatique (localhost vs production)
    else {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            backendUrl = 'http://localhost:3000';
        } else {
            backendUrl = 'https://back-kwelly-3.onrender.com';
        }
    }

    console.log('🎯 Backend détecté:', backendUrl);

    // Créer l'instance
    const keepAlive = new BackendKeepAlive(backendUrl, 14);
    
    // Exposer globalement
    window.renderKeepAlive = keepAlive;

    // Démarrer
    keepAlive.start();

    // Arrêter proprement avant de quitter la page
    window.addEventListener('beforeunload', () => {
        keepAlive.stop();
    });

    // Gérer la visibilité de la page
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            // Ping immédiat au retour sur la page
            keepAlive.ping();
        }
    });

    console.log('✅ Render Keep-Alive System initialized');
    console.log('📊 Stats: window.renderKeepAlive.getStats()');

    return keepAlive;
}

// ==================== LANCEMENT AUTOMATIQUE ====================

// Démarrage automatique quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRenderKeepAlive);
} else {
    // DOM déjà chargé
    initRenderKeepAlive();
}

