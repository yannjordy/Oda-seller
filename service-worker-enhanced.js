// ==================== SERVICE WORKER OPTIMISÉ AVEC NOTIFICATIONS ====================
// Pour ODA Marketplace PWA avec support notifications push avancées

const CACHE_NAME = 'oda-marketplace-v3.0';
const RUNTIME_CACHE = 'oda-runtime-v3.0';

// Fichiers à mettre en cache lors de l'installation
const STATIC_ASSETS = [
    '/parametres.html',
    '/abonnements.html',
    '/payement.html',
    '/statitique.html',
    '/favorie.html',
    '/boutique.html',
    '/manifest.json',
    '/index.html',
    '/produit.html',
    '/messages.html',
    '/commandes.html',
    '/tableau.html',
    '/oda.png',
    '/oda-icon-192.png',
    '/oda-icon-512.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
];

// ==================== INSTALLATION ====================
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installation');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Mise en cache des ressources statiques');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('✅ Service Worker: Installé');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Erreur installation SW:', error);
            })
    );
});

// ==================== ACTIVATION ====================
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker: Activation');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                            console.log('🗑️ Suppression ancien cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activé');
                return self.clients.claim();
            })
    );
});

// ==================== STRATÉGIE DE CACHE ====================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Ne pas mettre en cache les requêtes externes (API, etc.)
    if (url.origin !== location.origin) {
        return;
    }
    
    // Stratégie Cache First pour les ressources statiques
    if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(request).then((response) => {
                        return caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, response.clone());
                            return response;
                        });
                    });
                })
        );
        return;
    }
    
    // Stratégie Network First pour le reste
    event.respondWith(
        fetch(request)
            .then((response) => {
                return caches.open(RUNTIME_CACHE).then((cache) => {
                    cache.put(request, response.clone());
                    return response;
                });
            })
            .catch(() => {
                return caches.match(request);
            })
    );
});

// ==================== NOTIFICATIONS PUSH ====================
self.addEventListener('push', (event) => {
    console.log('📬 Notification Push reçue');
    
    let notificationData = {
        title: '🔔 ODA Marketplace',
        body: 'Vous avez une nouvelle notification',
        icon: '/oda-icon-192.png',
        badge: '/oda-icon-192.png',
        vibrate: [200, 100, 200, 100, 200],
        tag: 'default',
        requireInteraction: false,
        renotify: true,
        actions: []
    };
    
    // Si les données sont fournies dans le push
    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                ...notificationData,
                ...data
            };
            
            // Ajouter des actions selon le type de notification
            if (data.type === 'new_message') {
                notificationData.actions = [
                    { action: 'open', title: '💬 Ouvrir', icon: '/oda-icon-192.png' },
                    { action: 'dismiss', title: 'Fermer', icon: '/oda-icon-192.png' }
                ];
                notificationData.tag = 'message';
            } else if (data.type === 'new_order') {
                notificationData.actions = [
                    { action: 'view_order', title: '👀 Voir', icon: '/oda-icon-192.png' },
                    { action: 'dismiss', title: 'Plus tard', icon: '/oda-icon-192.png' }
                ];
                notificationData.tag = 'order';
            } else if (data.type === 'status_change') {
                notificationData.actions = [
                    { action: 'view_details', title: '📋 Détails', icon: '/oda-icon-192.png' },
                    { action: 'dismiss', title: 'OK', icon: '/oda-icon-192.png' }
                ];
                notificationData.tag = 'status';
            }
        } catch (error) {
            console.error('Erreur parsing push data:', error);
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
            .then(() => {
                console.log('✅ Notification affichée');
                
                // Mettre à jour le badge
                if ('setAppBadge' in self.navigator) {
                    return self.navigator.setAppBadge(1);
                }
            })
    );
});

// ==================== CLIC SUR NOTIFICATION ====================
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Clic sur notification:', event.notification.tag, 'Action:', event.action);
    
    event.notification.close();
    
    // Gérer les actions
    if (event.action === 'dismiss') {
        console.log('❌ Notification ignorée');
        return;
    }
    
    // URL de destination selon le tag et l'action
    let urlToOpen = '/';
    
    if (event.notification.tag === 'message' || event.action === 'open') {
        urlToOpen = '/messages.html';
    } else if (event.notification.tag === 'order' || event.action === 'view_order') {
        urlToOpen = '/commandes.html';
    } else if (event.notification.tag === 'status' || event.action === 'view_details') {
        urlToOpen = '/commandes.html';
    } else if (event.notification.tag === 'new-products') {
        urlToOpen = '/oda-achats.html#nouveautes';
    } else if (event.notification.tag === 'flash-sale') {
        urlToOpen = '/oda-achats.html#promotions';
    } else if (event.notification.tag === 'dashboard') {
        urlToOpen = '/tableau.html';
    }
    
    event.waitUntil(
        clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
        })
            .then((clientList) => {
                // Chercher si une fenêtre appropriée est déjà ouverte
                for (const client of clientList) {
                    const clientUrl = new URL(client.url);
                    const targetUrl = new URL(urlToOpen, self.location.origin);
                    
                    // Si même page, juste la focaliser
                    if (clientUrl.pathname === targetUrl.pathname) {
                        return client.focus();
                    }
                }
                
                // Sinon, ouvrir une nouvelle fenêtre
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
            .then(() => {
                // Effacer le badge après ouverture
                if ('clearAppBadge' in self.navigator) {
                    return self.navigator.clearAppBadge();
                }
            })
    );
});

// ==================== FERMETURE DE NOTIFICATION ====================
self.addEventListener('notificationclose', (event) => {
    console.log('❌ Notification fermée:', event.notification.tag);
    
    // Analytics ou tracking ici si besoin
    // Possibilité de notifier le serveur que la notification a été fermée
});

// ==================== SYNCHRONISATION EN ARRIÈRE-PLAN ====================
self.addEventListener('sync', (event) => {
    console.log('🔄 Background Sync:', event.tag);
    
    if (event.tag === 'sync-messages') {
        event.waitUntil(
            syncMessages()
                .then(() => console.log('✅ Messages synchronisés'))
                .catch(err => console.error('❌ Erreur sync messages:', err))
        );
    }
    
    if (event.tag === 'sync-orders') {
        event.waitUntil(
            syncOrders()
                .then(() => console.log('✅ Commandes synchronisées'))
                .catch(err => console.error('❌ Erreur sync commandes:', err))
        );
    }
    
    if (event.tag === 'sync-dashboard') {
        event.waitUntil(
            syncDashboard()
                .then(() => console.log('✅ Dashboard synchronisé'))
                .catch(err => console.error('❌ Erreur sync dashboard:', err))
        );
    }
});

// ==================== FONCTIONS DE SYNCHRONISATION ====================

async function syncMessages() {
    try {
        // Notifier tous les clients connectés
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_MESSAGES',
                timestamp: Date.now()
            });
        });
        
        return true;
    } catch (error) {
        console.error('Erreur sync messages:', error);
        throw error;
    }
}

async function syncOrders() {
    try {
        // Notifier tous les clients connectés
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_ORDERS',
                timestamp: Date.now()
            });
        });
        
        return true;
    } catch (error) {
        console.error('Erreur sync commandes:', error);
        throw error;
    }
}

async function syncDashboard() {
    try {
        // Notifier tous les clients connectés
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_DASHBOARD',
                timestamp: Date.now()
            });
        });
        
        return true;
    } catch (error) {
        console.error('Erreur sync dashboard:', error);
        throw error;
    }
}

// ==================== MESSAGES DU CLIENT ====================
self.addEventListener('message', (event) => {
    console.log('💬 Message reçu:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, options } = event.data;
        self.registration.showNotification(title, options);
    }
    
    if (event.data && event.data.type === 'CLEAR_BADGE') {
        if ('clearAppBadge' in self.navigator) {
            self.navigator.clearAppBadge();
        }
    }
    
    if (event.data && event.data.type === 'SET_BADGE') {
        if ('setAppBadge' in self.navigator) {
            self.navigator.setAppBadge(event.data.count || 1);
        }
    }
});

// ==================== PÉRIODIC BACKGROUND SYNC (EXPERIMENTAL) ====================
// Vérifier périodiquement les nouvelles notifications
self.addEventListener('periodicsync', (event) => {
    console.log('⏰ Periodic Sync:', event.tag);
    
    if (event.tag === 'check-notifications') {
        event.waitUntil(
            checkForNewNotifications()
                .then((hasNew) => {
                    if (hasNew) {
                        return self.registration.showNotification('🔔 Nouvelles notifications', {
                            body: 'Vous avez de nouvelles notifications',
                            icon: '/oda-icon-192.png',
                            badge: '/oda-icon-192.png',
                            tag: 'periodic-check',
                            requireInteraction: false
                        });
                    }
                })
                .catch(err => console.error('Erreur periodic sync:', err))
        );
    }
});

async function checkForNewNotifications() {
    try {
        // Cette fonction pourrait interroger votre API
        // Pour vérifier s'il y a de nouvelles notifications
        return false;
    } catch (error) {
        console.error('Erreur vérification notifications:', error);
        return false;
    }
}

// ==================== GESTION DES ERREURS ====================
self.addEventListener('error', (event) => {
    console.error('❌ Erreur Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rejetée:', event.reason);
});

// ==================== NETTOYAGE PÉRIODIQUE DU CACHE ====================
// Nettoyer les vieux caches tous les 7 jours
const CACHE_LIFETIME = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes

async function cleanOldCaches() {
    const cacheNames = await caches.keys();
    const now = Date.now();
    
    for (const cacheName of cacheNames) {
        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            
            for (const request of keys) {
                const response = await cache.match(request);
                if (response) {
                    const dateHeader = response.headers.get('date');
                    if (dateHeader) {
                        const cacheDate = new Date(dateHeader).getTime();
                        if (now - cacheDate > CACHE_LIFETIME) {
                            await cache.delete(request);
                            console.log('🗑️ Cache expiré supprimé:', request.url);
                        }
                    }
                }
            }
        }
    }
}

// Nettoyer au démarrage
cleanOldCaches().catch(err => console.error('Erreur nettoyage cache:', err));

console.log('✅ Service Worker avec notifications chargé et prêt');