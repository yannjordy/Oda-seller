const CACHE_NAME = 'OdaMarket-v2.0.0';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/icons/oda-192.png',
    '/icons/oda-512.png',
    '/icons/oda-maskable-192.png',
    '/icons/oda-maskable-512.png',
    '/images/logo.png',
];

self.addEventListener('install', (event) => {
    console.log('[SW] Installing OdaMarket Seller...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (url.hostname.includes('supabase.co')) return;

    if (url.pathname.startsWith('/_next/') ||
        url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/)) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) {
                    const fetchPromise = fetch(event.request).then((response) => {
                        if (response.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
                        }
                        return response;
                    }).catch(() => cached);
                    return cached;
                }
                return fetch(event.request).then((response) => {
                    if (response.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
                    }
                    return response;
                });
            })
        );
    } else {
        event.respondWith(
            fetch(event.request).then((response) => {
                if (response && response.status === 200) {
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
                }
                return response;
            }).catch(() => caches.match(event.request))
        );
    }
});

self.addEventListener('push', (event) => {
    let data = {
        title: 'OdaMarket',
        body: 'Nouvelle notification vendeur',
        icon: '/icons/oda-192.png',
        data: { url: '/dashboard' }
    };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (err) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body || 'Vous avez une nouvelle notification',
        icon: data.icon || '/icons/oda-192.png',
        badge: data.badge || '/icons/oda-192.png',
        image: data.image || null,
        vibrate: data.vibrate || [200, 100, 200],
        tag: data.tag || 'oda-seller-notification',
        renotify: data.renotify !== undefined ? data.renotify : true,
        data: data.data || { url: '/dashboard' },
        actions: data.actions || [
            { action: 'open', title: 'Ouvrir' },
            { action: 'close', title: 'Fermer' }
        ]
    };

    event.waitUntil(self.registration.showNotification(data.title || 'OdaMarket', options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow(event.notification.data?.url || '/dashboard')
        );
    }
});

self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
    if (event.data?.type === 'CACHE_URLS') {
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(event.data.urls)));
    }
    if (event.data?.type === 'SCHEDULE_DAILY_NOTIFICATION') {
        scheduleDailyNotification(event.data.hour || 10);
    }
});

function scheduleDailyNotification(hour = 10) {
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(hour, 0, 0, 0);
    if (scheduled <= now) scheduled.setDate(scheduled.getDate() + 1);

    const delay = scheduled.getTime() - now.getTime();
    setTimeout(() => {
        self.registration.showNotification('OdaMarket - Motivation !', {
            body: '💪 Votre boutique vous attend ! Consultez vos performances et continuez à booster vos ventes.',
            icon: '/icons/oda-192.png',
            badge: '/icons/oda-192.png',
            tag: 'daily-motivation',
            renotify: true,
            vibrate: [200, 100, 200],
            data: { url: '/dashboard' },
            actions: [
                { action: 'open', title: 'Voir mon dashboard' },
                { action: 'close', title: 'Plus tard' }
            ]
        });
        scheduleDailyNotification(hour);
    }, delay);
}
