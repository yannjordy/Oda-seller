const CACHE_NAME = 'OdaMarket-v1.0.0';

// Assets to cache for offline use
const ASSETS_TO_CACHE = [
    '/',
    '/index.html', // fallback
    '/manifest.json',
    '/icons/oda-192.png',
    '/icons/oda-512.png',
    '/icons/oda-maskable-192.png',
    '/icons/oda-maskable-512.png',
    '/screenshots/mobile-home.png',
    
    // Next.js static assets (will be updated during build)
    '/_next/static/',
    '/_next/image/',
    
    // External dependencies
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap',
    
    // App icons and images
    '/images/oda.jpg',
    '/oda.png',
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installation en cours...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Mise en cache des fichiers');
                // Utiliser addAll avec gestion d'erreur pour chaque fichier
                return Promise.allSettled(
                    ASSETS_TO_CACHE.map(url => 
                        cache.add(url).catch(err => {
                            console.warn(`[Service Worker] Impossible de mettre en cache: ${url}`, err);
                        })
                    )
                );
            })
            .then(() => {
                console.log('[Service Worker] Fichiers principaux mis en cache');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Erreur lors de la mise en cache:', error);
            })
    );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activation...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Suppression de l\'ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Activé avec succès');
            // Notifier les clients de la mise à jour
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_UPDATED',
                        version: CACHE_NAME
                    });
                });
            });
            return self.clients.claim();
        })
    );
});

// Interception des requêtes (Stratégie: Network First avec Cache Fallback pour les données, Cache First pour les assets statiques)
self.addEventListener('fetch', (event) => {
    // Ignorer les requêtes non-GET
    if (event.request.method !== 'GET') {
        return;
    }
    
    const url = new URL(event.request.url);
    
    // Ignorer les requêtes vers les API externes comme Supabase (à gérer en ligne)
    if (url.hostname.includes('supabase.co')) {
        return;
    }
    
    // Stratégie différente selon le type de ressource
    if (url.pathname.startsWith('/_next/') || 
        url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/)) {
        // Pour les assets statiques: Cache First avec mise à jour en arrière-plan
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    // Retourner la version cachée si disponible
                    if (cachedResponse) {
                        // Mettre à jour le cache en arrière-plan
                        fetch(event.request).then((networkResponse) => {
                            if (networkResponse && networkResponse.status === 200) {
                                caches.open(CACHE_NAME).then((cache) => {
                                    cache.put(event.request, networkResponse.clone());
                                });
                            }
                        });
                        return cachedResponse;
                    }
                    
                    // Sinon, aller sur le réseau et mettre en cache
                    return fetch(event.request)
                        .then((networkResponse) => {
                            if (!networkResponse || networkResponse.status !== 200) {
                                return networkResponse;
                            }
                            
                            // Cloner et mettre en cache la réponse
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                            
                            return networkResponse;
                        })
                        .catch(() => {
                            // En cas d'erreur réseau, retourner une réponse de secours si c'est une page
                            if (event.request.destination === 'document') {
                                return caches.match('/index.html');
                            }
                        });
                })
        );
    } else {
        // Pour les pages et données API: Network First avec fallback cache
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    // Mettre en cache la réponse réussie
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // En cas d'erreur réseau, essayer de récupérer depuis le cache
                    return caches.match(event.request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            
                            // Pour les pages HTML, retourner la page hors ligne
                            if (event.request.destination === 'document') {
                                return caches.match('/index.html');
                            }
                            
                            // Pour les autres ressources, ne rien retourner
                            return new Response('Hors ligne', { status: 503, statusText: 'Service Unavailable' });
                        });
                })
        );
    }
});
                            }
                        })
                        .catch(() => {
                            // Erreur réseau, mais on a le cache
                        });
                    
                    return cachedResponse;
                }
                
                // Sinon, on fait la requête réseau
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Vérifier si c'est une réponse valide
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // Cloner la réponse
                        const responseToCache = networkResponse.clone();
                        
                        // Mettre en cache la nouvelle réponse
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('[Service Worker] Erreur de récupération:', error);
                        
                        // Retourner une page hors ligne personnalisée si disponible
                        if (event.request.destination === 'document') {
                            return caches.match('/connexion.html').then(response => {
                                return response || new Response(
                                    '<h1>Mode Hors Ligne</h1><p>Vous êtes actuellement hors ligne. Veuillez vérifier votre connexion Internet.</p>',
                                    {
                                        headers: { 'Content-Type': 'text/html' }
                                    }
                                );
                            });
                        }
                    });
            })
    );
});

// Gestion des messages
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        // Permettre au client de demander la mise en cache de nouvelles URLs
        event.waitUntil(
            caches.open(CACHE_NAME).then(cache => {
                return cache.addAll(event.data.urls);
            })
        );
    }
});

// Notification de mise à jour disponible
self.addEventListener('controllerchange', () => {
    console.log('[Service Worker] Nouveau Service Worker activé');
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
    let data = { 
        title: 'OdaMarket', 
        body: 'Nouvelle notification', 
        icon: '/icons/oda-192.png',
        data: { url: '/' } 
    };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (err) {
            console.error('[Service Worker] Error parsing push data:', err);
        }
    }

    // Handle our notification data structure
    const title = data.title || 'OdaMarket';
    const options = {
        body: data.body || 'Vous avez une nouvelle notification',
        icon: data.icon || '/icons/oda-192.png',
        badge: data.badge || data.icon || '/icons/oda-192.png',
        image: data.image || null, // Add image to notification
        vibrate: data.vibrate || [200, 100, 200],
        tag: data.tag || 'oda-market-notification',
        renotify: data.renotify !== undefined ? data.renotify : true,
        data: data.data || { url: '/' }, // Preserve data for click handling
        actions: data.actions || [
            {
                action: 'open',
                title: 'Voir les détails'
            },
            {
                action: 'close',
                title: 'Fermer'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow(event.notification.data || '/')
        );
    }
});

// Synchronisation en arrière-plan pour les opérations critiques
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-orders') {
        event.waitUntil(syncOrders());
    }
    if (event.tag === 'sync-messages') {
        event.waitUntil(syncMessages());
    }
    if (event.tag === 'sync-products') {
        event.waitUntil(syncProducts());
    }
});

// Fonctions de synchronisation (à implémenter avec votre logique métier)
async function syncOrders() {
    console.log('[Service Worker] Synchronisation des commandes en attente...');
    // Ici vous appelleriez votre fonction de traitement de la file d'attente
    // Pour l'exemple, nous pouvons poster un message au client pour déclencher la synchronisation
    // Ou implémenter directement la logique si vous avez accès à la base de données
    try {
        // Dans une implémentation réelle, vous traiteriez la file d'attente ici
        // Puis vous notifieriez le client si nécessaire
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'SYNC_COMPLETE',
                    syncTag: 'sync-orders',
                    timestamp: Date.now()
                });
            });
        });
    } catch (error) {
        console.error('[Service Worker] Erreur lors de la synchronisation des commandes:', error);
    }
}

async function syncMessages() {
    console.log('[Service Worker] Synchronisation des messages en attente...');
    try {
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'SYNC_COMPLETE',
                    syncTag: 'sync-messages',
                    timestamp: Date.now()
                });
            });
        });
    } catch (error) {
        console.error('[Service Worker] Erreur lors de la synchronisation des messages:', error);
    }
}

async function syncProducts() {
    console.log('[Service Worker] Synchronisation des produits en attente...');
    try {
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'SYNC_COMPLETE',
                    syncTag: 'sync-products',
                    timestamp: Date.now()
                });
            });
        });
    } catch (error) {
        console.error('[Service Worker] Erreur lors de la synchronisation des produits:', error);
    }
}

// Écouter les événements en ligne pour déclencher la synchronisation
self.addEventListener('online', (event) => {
    console.log('[Service Worker] Application en ligne, déclenchement de la synchronisation...');
    // Enregistrer les synchronisations en attente
    self.registration.sync.register('sync-orders');
    self.registration.sync.register('sync-messages');
    self.registration.sync.register('sync-products');
});

// Garder la fonction de synchronisation générique pour la compatibilité
async function syncData() {
    console.log('[Service Worker] Synchronisation générique des données...');
    // Cette fonction est maintenue pour la compatibilité avec le code existant
}
