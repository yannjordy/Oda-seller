'use client'

import { useEffect, useState, useCallback } from 'react'

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

  useEffect(() => {
    if (!swReady || !navigator.serviceWorker.controller) return

    const setupDailyNotification = async () => {
      const lastNotification = localStorage.getItem('oda-last-daily-notif')
      const now = new Date()
      const today = now.toDateString()

      if (lastNotification !== today) {
        const registration = await navigator.serviceWorker.ready
        if ('Notification' in window && Notification.permission === 'granted') {
          registration.showNotification('OdaMarket - Motivation !', {
            body: '💪 Votre boutique vous attend ! Consultez vos performances et continuez à booster vos ventes.',
            icon: '/icons/oda-192.png',
            badge: '/icons/oda-192.png',
            tag: 'daily-motivation',
            renotify: true,
            vibrate: [200, 100, 200],
            data: { url: '/dashboard' },
          })
          localStorage.setItem('oda-last-daily-notif', today)
        }
      }
    }

    const scheduleDaily = () => {
      const now = new Date()
      const scheduled = new Date()
      scheduled.setHours(10, 0, 0, 0)
      if (scheduled <= now) scheduled.setDate(scheduled.getDate() + 1)
      const delay = scheduled.getTime() - now.getTime()
      setTimeout(() => {
        setupDailyNotification()
        scheduleDaily()
      }, delay)
    }

    scheduleDaily()
  }, [swReady])

  if (!swReady) return null
  return null
}
