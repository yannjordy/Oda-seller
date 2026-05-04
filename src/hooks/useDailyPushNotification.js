'use client'

import { useState, useEffect, useCallback } from 'react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)))
}

const SELLER_MESSAGES = [
  { title: 'OdaMarket - Motivation !', body: '💪 Votre boutique vous attend ! Consultez vos performances et continuez à booster vos ventes.' },
  { title: 'OdaMarket - Conseil du jour', body: '📈 Astuce : Les boutiques qui mettent à jour leurs produits chaque jour voient leurs ventes augmenter de 30% !' },
  { title: 'OdaMarket - Rappel', body: '🎯 N\'oubliez pas de répondre à vos messages clients. Une réponse rapide = plus de ventes !' },
  { title: 'OdaMarket - Succès', body: '🏆 Vous faites partie des vendeurs les plus actifs ! Continuez comme ça !' },
  { title: 'OdaMarket - Opportunité', body: '📦 Ajoutez de nouveaux produits pour attirer plus de clients cette semaine !' },
  { title: 'OdaMarket - Stats', body: '📊 Consultez vos statistiques pour voir comment vos ventes évoluent !' },
  { title: 'OdaMarket - Engagement', body: '💬 Connectez-vous maintenant pour voir les messages de vos clients !' },
]

export function useDailyPushNotification() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permission, setPermission] = useState(Notification?.permission || 'default')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkSubscription = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      }
    }
    checkSubscription()
  }, [])

  const subscribe = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setError('Notifications non supportées')
        return false
      }

      const permissionResult = await Notification.requestPermission()
      if (permissionResult !== 'granted') {
        setError('Permission refusée')
        return false
      }
      setPermission('granted')

      const registration = await navigator.serviceWorker.ready

      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: VAPID_PUBLIC_KEY ? urlBase64ToUint8Array(VAPID_PUBLIC_KEY) : undefined,
        })
      }

      await fetch('/api/subscribe-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      })

      const today = new Date().toDateString()
      localStorage.setItem('oda-last-daily-notif', today)

      setIsSubscribed(true)
      setLoading(false)
      return true
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return false
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        await fetch('/api/unsubscribe-push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
        setIsSubscribed(false)
      }
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }, [])

  const sendTestNotification = useCallback(() => {
    const msg = SELLER_MESSAGES[Math.floor(Math.random() * SELLER_MESSAGES.length)]
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(msg.title, {
        body: msg.body,
        icon: '/icons/oda-192.png',
        badge: '/icons/oda-192.png',
        tag: 'test-notification',
        renotify: true,
        vibrate: [200, 100, 200],
        data: { url: '/dashboard' },
      })
    })
  }, [])

  return {
    isSubscribed,
    permission,
    loading,
    error,
    subscribe,
    unsubscribe,
    sendTestNotification,
  }
}
