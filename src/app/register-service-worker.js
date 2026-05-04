'use client'

import { useEffect, useState, useCallback } from 'react'

const DAILY_SCHEDULE = [
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

export default function RegisterServiceWorker() {
  const [swReady, setSwReady] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  const registerSW = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      setSwReady(true)

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            window.dispatchEvent(new CustomEvent('pwa-update-available'))
          }
        })
      })

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    } catch (error) {
      console.error('[SW] Registration failed:', error)
    }
  }, [])

  useEffect(() => {
    registerSW()

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [registerSW])

  useEffect(() => {
    window.installPWA = async () => {
      if (!deferredPrompt) return false
      try {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        setDeferredPrompt(null)
        return outcome === 'accepted'
      } catch (error) {
        console.error('[PWA] Install error:', error)
        return false
      }
    }
  }, [deferredPrompt])

  useEffect(() => {
    window.updatePWA = async () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.ready
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
      }
    }
  }, [])

  const showNotification = useCallback((hour, tag, messages) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    const today = new Date().toDateString()
    const storageKey = `oda-notif-${tag}`
    const lastSent = localStorage.getItem(storageKey)

    if (lastSent === today) return

    const msg = messages[Math.floor(Math.random() * messages.length)]
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(msg.title, {
        body: msg.body,
        icon: '/icons/oda-192.png',
        badge: '/icons/oda-192.png',
        tag: tag,
        renotify: true,
        vibrate: [200, 100, 200],
        data: { url: '/dashboard' },
      }).then(() => {
        localStorage.setItem(storageKey, today)
      }).catch(() => {})
    })
  }, [])

  const scheduleNotification = useCallback((hour, tag, messages) => {
    const now = new Date()
    const scheduled = new Date()
    scheduled.setHours(hour, Math.floor(Math.random() * 30), 0, 0)

    if (scheduled <= now) {
      scheduled.setDate(scheduled.getDate() + 1)
    }

    const delay = scheduled.getTime() - now.getTime()

    const timer = setTimeout(() => {
      showNotification(hour, tag, messages)
      scheduleNotification(hour, tag, messages)
    }, delay)

    return () => clearTimeout(timer)
  }, [showNotification])

  useEffect(() => {
    if (!swReady) return
    if ('Notification' in window && Notification.permission === 'granted') {
      DAILY_SCHEDULE.forEach(({ hour, tag, messages }) => {
        showNotification(hour, tag, messages)
      })
    }
  }, [swReady, showNotification])

  useEffect(() => {
    if (!swReady) return

    const cleanupFunctions = DAILY_SCHEDULE.map(({ hour, tag, messages }) => {
      return scheduleNotification(hour, tag, messages)
    })

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup?.())
    }
  }, [swReady, scheduleNotification])

  if (!swReady) return null
  return null
}
