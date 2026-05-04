const CACHE_NAME = 'OdaMarket-v3.0.0';
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
    console.log('[SW] Installing OdaMarket Seller v3...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating v3...');
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
                    fetch(event.request).then((response) => {
                        if (response.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
                        }
                    }).catch(() => {});
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
    if (event.data?.type === 'SCHEDULE_ALL_NOTIFICATIONS') {
        scheduleAllNotifications();
    }
});

const DAILY_NOTIFICATIONS = [
    {
        hour: 7,
        tag: 'morning-motivation',
        messages: [
            { title: '☀️ Bonjour vendeur !', body: 'Nouvelle journée, nouvelles opportunités ! Connectez-vous pour booster vos ventes.' },
            { title: '🌅 Bonne journée !', body: 'Votre boutique OdaMarket vous attend. C\'est le moment de performer !' },
            { title: '💪 Motivation matinale', body: 'Les meilleurs vendeurs commencent tôt ! Votre dashboard vous attend.' },
            { title: '☕ Café & Ventes', body: 'Prenez un café et venez vérifier vos performances du jour !' },
            { title: '🚀 Nouveau jour', body: 'Chaque jour est une chance de dépasser vos objectifs. Commencez maintenant !' },
        ]
    },
    {
        hour: 10,
        tag: 'tip-conseil',
        messages: [
            { title: '📈 Conseil du jour', body: 'Les boutiques qui mettent à jour leurs produits chaque jour voient leurs ventes +30% !' },
            { title: '💡 Astuce vendeur', body: 'Ajoutez de belles photos à vos produits : les annonces avec images reçoivent 5x plus de clics !' },
            { title: '🎯 Stratégie', body: 'Répondez rapidement aux messages clients : une réponse en 5 min augmente les ventes de 40%.' },
            { title: '📦 Produit du jour', body: 'Mettez un produit en avant aujourd\'hui pour attirer l\'attention des acheteurs !' },
            { title: '⭐ Avis clients', body: 'Encouragez vos clients satisfaits à laisser un avis : ça booste votre visibilité !' },
        ]
    },
    {
        hour: 13,
        tag: 'afternoon-engagement',
        messages: [
            { title: '🍽️ Pause déjeuner ?', body: 'Pendant votre pause, jetez un œil à vos messages clients en attente !' },
            { title: '💬 Messages clients', body: 'Vous avez des clients qui attendent une réponse ! Ne laissez pas passer vos ventes.' },
            { title: '🔥 Activité en cours', body: 'C\'est le pic d\'activité ! Connectez-vous maintenant pour capter un maximum de clients.' },
            { title: '👥 Vos clients', body: 'Des acheteurs parcourent vos produits. Soyez disponible pour convertir !' },
            { title: '⚡ Action rapide', body: '10 minutes sur votre dashboard = plus de ventes cet après-midi. Connectez-vous !' },
        ]
    },
    {
        hour: 16,
        tag: 'stats-performance',
        messages: [
            { title: '📊 Point stats', body: 'Consultez vos statistiques de la journée. Voyez ce qui marche et optimisez !' },
            { title: '🏆 Votre performance', body: 'Vous êtes un vendeur actif ! Voyez vos chiffres et visez encore plus haut.' },
            { title: '📈 Tendances du jour', body: 'Vérifiez quels produits sont les plus consultés aujourd\'hui et ajustez !' },
            { title: '💰 Suivi des ventes', body: 'Faites le point sur vos ventes de la journée. Il est encore temps d\'en conclure !' },
            { title: '🎯 Objectifs', body: 'Où en êtes-vous de vos objectifs ? Consultez vos stats et ajustez votre stratégie.' },
        ]
    },
    {
        hour: 19,
        tag: 'evening-recap',
        messages: [
            { title: '🌙 Bilan de la journée', body: 'Merci pour votre engagement ! Faites un dernier tour sur votre dashboard.' },
            { title: '🏅 Journée terminée', body: 'Bravo pour votre travail ! Préparez-vous pour demain avec une dernière vérification.' },
            { title: '✨ Dernier check', body: 'Vérifiez vos commandes en cours avant de finir la journée. Bonne soirée !' },
            { title: '💪 Belle journée', body: 'Chaque jour compte. Consultez vos résultats et reposez-vous bien !' },
            { title: '📋 Récap du soir', body: 'Faites votre récap avant de dormir. Vos clients vous retrouveront demain !' },
        ]
    },
];

function getTodayKey() {
    return new Date().toDateString();
}

function getSentNotifications() {
    try {
        const data = self.clients ? null : null;
        return {};
    } catch {
        return {};
    }
}

function scheduleNotification(hour, tag, messages) {
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(hour, Math.floor(Math.random() * 30), 0, 0);

    if (scheduled <= now) {
        scheduled.setDate(scheduled.getDate() + 1);
    }

    const delay = scheduled.getTime() - now.getTime();

    setTimeout(() => {
        const msg = messages[Math.floor(Math.random() * messages.length)];
        self.registration.showNotification(msg.title, {
            body: msg.body,
            icon: '/icons/oda-192.png',
            badge: '/icons/oda-192.png',
            tag: tag,
            renotify: true,
            vibrate: [200, 100, 200],
            data: { url: '/dashboard' },
            actions: [
                { action: 'open', title: 'Ouvrir OdaMarket' },
                { action: 'close', title: 'Plus tard' }
            ]
        }).catch(err => console.log('[SW] Notification error:', err));

        scheduleNotification(hour, tag, messages);
    }, delay);
}

function scheduleAllNotifications() {
    console.log('[SW] Scheduling 5 daily notifications...');
    DAILY_NOTIFICATIONS.forEach(({ hour, tag, messages }) => {
        scheduleNotification(hour, tag, messages);
    });
}

self.addEventListener('activate', () => {
    scheduleAllNotifications();
});
