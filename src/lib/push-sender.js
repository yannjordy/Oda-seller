import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:contact@odamarket.cm',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export async function sendDailySellerNotification(subscriptions) {
  const messages = [
    { title: 'OdaMarket - Motivation !', body: '💪 Votre boutique vous attend ! Consultez vos performances et continuez à booster vos ventes.' },
    { title: 'OdaMarket - Conseil du jour', body: '📈 Astuce : Les boutiques qui mettent à jour leurs produits chaque jour voient leurs ventes augmenter de 30% !' },
    { title: 'OdaMarket - Rappel', body: '🎯 N\'oubliez pas de répondre à vos messages clients. Une réponse rapide = plus de ventes !' },
    { title: 'OdaMarket - Succès', body: '🏆 Vous faites partie des vendeurs les plus actifs ! Continuez comme ça !' },
    { title: 'OdaMarket - Opportunité', body: '📦 Ajoutez de nouveaux produits pour attirer plus de clients cette semaine !' },
  ]

  const msg = messages[Math.floor(Math.random() * messages.length)]

  const results = await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, JSON.stringify({
          title: msg.title,
          body: msg.body,
          icon: '/icons/oda-192.png',
          badge: '/icons/oda-192.png',
          tag: 'daily-motivation',
          data: { url: '/dashboard' },
        }))
        return { success: true, endpoint: sub.endpoint }
      } catch (error) {
        if (error.statusCode === 410) {
          return { success: false, expired: true, endpoint: sub.endpoint }
        }
        return { success: false, error: error.message, endpoint: sub.endpoint }
      }
    })
  )

  return results
}
