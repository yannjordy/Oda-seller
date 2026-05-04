'use client'

import { useState, useEffect } from 'react'

export default function PWAInstallModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const checkStandalone = () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true

    if (checkStandalone()) {
      setIsInstalled(true)
      return
    }

    if (localStorage.getItem('oda-seller-modal-never')) return

    const timer = setTimeout(() => {
      if (!checkStandalone() && !sessionStorage.getItem('oda-seller-modal-shown')) {
        setIsOpen(true)
        sessionStorage.setItem('oda-seller-modal-shown', '1')
      }
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsOpen(false)
      setShowSuccess(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 4000)
      setTimeout(() => setShowSuccess(false), 6000)
    }
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => window.removeEventListener('appinstalled', handleAppInstalled)
  }, [])

  const handleInstall = async () => {
    if (window.installPWA) {
      await window.installPWA()
      setIsOpen(false)
    }
  }

  const handleClose = () => setIsOpen(false)
  const handleNeverShow = () => {
    localStorage.setItem('oda-seller-modal-never', '1')
    setIsOpen(false)
  }

  if (isInstalled) return null
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center" onClick={handleClose}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
        <div className="relative w-full sm:max-w-md mx-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#7C3AED]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#5856D6]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative mx-4 sm:mx-0 bg-white/80 backdrop-blur-xl rounded-t-3xl sm:rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#7C3AED] via-[#5856D6] to-[#007AFF]" />

            <button onClick={handleClose} className="absolute top-5 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors z-10">
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 sm:p-7">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-[#7C3AED]/30 rounded-2xl blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-[#7C3AED] to-[#5856D6] rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-black text-xl">ODA</span>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1.5">Installer OdaMarket Seller</h2>
                <p className="text-sm text-gray-500 max-w-xs">Gérez votre boutique depuis votre écran d'accueil</p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-100">⚡ Accès instantané</span>
                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">🔔 Notifications ventes</span>
                <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">📊 Stats en temps réel</span>
              </div>

              <button
                onClick={handleInstall}
                className="w-full bg-gradient-to-r from-[#7C3AED] to-[#5856D6] hover:from-[#6D28D9] hover:to-[#4F46E5] text-white font-bold py-3.5 px-6 rounded-xl mb-3 transition-all duration-300 shadow-lg shadow-[#7C3AED]/25 hover:shadow-xl hover:shadow-[#7C3AED]/30 active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m0 0v8m0-8v-4m0 4l-4-4m0 0l4 4m0 0l4-4" />
                </svg>
                Installer l'application
              </button>

              <div className="flex items-center justify-between gap-3">
                <button onClick={handleNeverShow} className="text-gray-400 hover:text-gray-600 text-xs transition-colors">Ne plus afficher</button>
                <button onClick={handleClose} className="text-[#7C3AED] hover:text-[#6D28D9] text-xs font-semibold transition-colors">Plus tard →</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed top-4 left-4 right-4 z-[10000] mx-auto max-w-md animate-slide-down">
          <div className="relative overflow-hidden bg-green-500/90 backdrop-blur-xl rounded-2xl border border-green-400/30 shadow-2xl shadow-green-500/20">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20" />
            <div className="relative p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">OdaMarket Seller installé !</p>
                <p className="text-green-100 text-xs">Votre boutique est maintenant à portée de main</p>
              </div>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🎉</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfetti && (
        <div className="fixed inset-0 z-[10001] pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                backgroundColor: ['#7C3AED', '#5856D6', '#007AFF', '#22C55E', '#FF9500'][Math.floor(Math.random() * 5)],
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animation: `confetti-fall ${2 + Math.random() * 3}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(100%) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes slide-down { from { transform: translateY(-100%) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes confetti-fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-down { animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </>
  )
}
