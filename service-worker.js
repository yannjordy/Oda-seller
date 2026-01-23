const CACHE_NAME = 'Oda-v1.1.0';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/connexion.html',
    '/tableau.html',
    '/styles.css',
    '/parametres.html',
    '/clients.html',
    '/commandes.html',
    '/boutique.html',
    '/oda.html',
    '/produits.html',
    '/messages.html',
    '/statitique.html',
    '/abonnement.html',
    '/payement.html',
    '/app.js',
    '/manifest.json',
    '/oda.jpg',
    '/oda.png',
    '/kwelly.png',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap'
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

// Interception des requêtes (Stratégie: Cache First avec Network Fallback)
self.addEventListener('fetch', (event) => {
    // Ignorer les requêtes non-GET
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Ignorer les requêtes vers Supabase
    if (event.request.url.includes('supabase.co')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Si on trouve dans le cache, on le retourne
                if (cachedResponse) {
                    // Mettre à jour le cache en arrière-plan (stale-while-revalidate)
                    fetch(event.request)
                        .then((networkResponse) => {
                            if (networkResponse && networkResponse.status === 200) {
                                caches.open(CACHE_NAME).then((cache) => {
                                    cache.put(event.request, networkResponse.clone());
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

// Gestion des notifications push (optionnel)
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'OdaMarket';
    const options = {
        body: data.body || 'Nouvelle notification',
        icon: '/oda.png',
        badge: '/oda.png',
        vibrate: [200, 100, 200],
        data: data.url || '/',
        actions: [
            {
                action: 'open',
                title: 'Ouvrir'
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

// Synchronisation en arrière-plan (optionnel)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    console.log('[Service Worker] Synchronisation des données...');
    // Implémenter votre logique de synchronisation ici
}
