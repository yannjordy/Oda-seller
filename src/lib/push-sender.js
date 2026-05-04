import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:contact@odamarket.cm',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

const SELLER_NOTIFICATIONS = [
  { hour: 7, tag: 'morning-motivation', messages: [
    { title: '☀️ Bonjour vendeur !', body: 'Nouvelle journée, nouvelles opportunités ! Connectez-vous pour booster vos ventes.' },
    { title: '🌅 Bonne journée !', body: 'Votre boutique OdaMarket vous attend. C\'est le moment de performer !' },
    { title: '💪 Motivation matinale', body: 'Les meilleurs vendeurs commencent tôt ! Votre dashboard vous attend.' },
    { title: '☕ Café & Ventes', body: 'Prenez un café et venez vérifier vos performances du jour !' },
    { title: '🚀 Nouveau jour', body: 'Chaque jour est une chance de dépasser vos objectifs. Commencez maintenant !' },
  ]},
  { hour: 10, tag: 'tip-conseil', messages: [
    { title: '📈 Conseil du jour', body: 'Les boutiques qui mettent à jour leurs produits chaque jour voient leurs ventes +30% !' },
    { title: '💡 Astuce vendeur', body: 'Ajoutez de belles photos à vos produits : les annonces avec images reçoivent 5x plus de clics !' },
    { title: '🎯 Stratégie', body: 'Répondez rapidement aux messages clients : une réponse en 5 min augmente les ventes de 40%.' },
    { title: '📦 Produit du jour', body: 'Mettez un produit en avant aujourd\'hui pour attirer l\'attention des acheteurs !' },
    { title: '⭐ Avis clients', body: 'Encouragez vos clients satisfaits à laisser un avis : ça booste votre visibilité !' },
  ]},
  { hour: 13, tag: 'afternoon-engagement', messages: [
    { title: '🍽️ Pause déjeuner ?', body: 'Pendant votre pause, jetez un œil à vos messages clients en attente !' },
    { title: '💬 Messages clients', body: 'Vous avez des clients qui attendent une réponse ! Ne laissez pas passer vos ventes.' },
    { title: '🔥 Activité en cours', body: 'C\'est le pic d\'activité ! Connectez-vous maintenant pour capter un maximum de clients.' },
    { title: '👥 Vos clients', body: 'Des acheteurs parcourent vos produits. Soyez disponible pour convertir !' },
    { title: '⚡ Action rapide', body: '10 minutes sur votre dashboard = plus de ventes cet après-midi. Connectez-vous !' },
  ]},
  { hour: 16, tag: 'stats-performance', messages: [
    { title: '📊 Point stats', body: 'Consultez vos statistiques de la journée. Voyez ce qui marche et optimisez !' },
    { title: '🏆 Votre performance', body: 'Vous êtes un vendeur actif ! Voyez vos chiffres et visez encore plus haut.' },
    { title: '📈 Tendances du jour', body: 'Vérifiez quels produits sont les plus consultés aujourd\'hui et ajustez !' },
    { title: '💰 Suivi des ventes', body: 'Faites le point sur vos ventes de la journée. Il est encore temps d\'en conclure !' },
    { title: '🎯 Objectifs', body: 'Où en êtes-vous de vos objectifs ? Consultez vos stats et ajustez votre stratégie.' },
  ]},
  { hour: 19, tag: 'evening-recap', messages: [
    { title: '🌙 Bilan de la journée', body: 'Merci pour votre engagement ! Faites un dernier tour sur votre dashboard.' },
    { title: '🏅 Journée terminée', body: 'Bravo pour votre travail ! Préparez-vous pour demain avec une dernière vérification.' },
    { title: '✨ Dernier check', body: 'Vérifiez vos commandes en cours avant de finir la journée. Bonne soirée !' },
    { title: '💪 Belle journée', body: 'Chaque jour compte. Consultez vos résultats et reposez-vous bien !' },
    { title: '📋 Récap du soir', body: 'Faites votre récap avant de dormir. Vos clients vous retrouveront demain !' },
  ]},
]

export async function sendScheduledNotifications(subscriptions) {
  const results = []

  for (const notification of SELLER_NOTIFICATIONS) {
    const msg = notification.messages[Math.floor(Math.random() * notification.messages.length)]

    const batchResults = await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub, JSON.stringify({
            title: msg.title,
            body: msg.body,
            icon: '/icons/oda-192.png',
            badge: '/icons/oda-192.png',
            tag: notification.tag,
            data: { url: '/dashboard' },
            actions: [
              { action: 'open', title: 'Ouvrir OdaMarket' },
              { action: 'close', title: 'Plus tard' }
            ]
          }))
          return { success: true, endpoint: sub.endpoint, tag: notification.tag }
        } catch (error) {
          if (error.statusCode === 410) {
            return { success: false, expired: true, endpoint: sub.endpoint, tag: notification.tag }
          }
          return { success: false, error: error.message, endpoint: sub.endpoint, tag: notification.tag }
        }
      })
    )

    results.push({ hour: notification.hour, notifications: batchResults })
  }

  return results
}
