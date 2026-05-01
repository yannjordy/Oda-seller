'use client';

import { useEffect, useState, useRef } from 'react';

export default function PWAInstallButton() {
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const installButtonRef = useRef(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Empêcher l'affichage automatique du prompt d'installation du navigateur
      e.preventDefault();
      // Stocker l'événement pour pouvoir l'utiliser plus tard
      setDeferredPrompt(e);
      // Mettre à jour l'interface pour montrer le bouton d'installation
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      // Masquer le bouton d'installation lorsque l'app est installée
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    // Écouter les événements
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Vérifier si l'app est déjà installée au démarrage
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    // Nettoyage
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    // Masquer le bouton d'installation
    setShowInstallButton(false);
    
    // Afficher le prompt d'installation
    if (deferredPrompt) {
      deferredPrompt.prompt();
      
      // Attendre la réponse de l'utilisateur
      const choiceResult = await deferredPrompt.userChoice;
      
      // Réinitialiser le deferredPrompt
      setDeferredPrompt(null);
      
      // Si l'utilisateur a accepté l'installation
      if (choiceResult.outcome === 'accepted') {
        console.log('Utilisateur a accepté l\'installation de la PWA');
      } else {
        console.log('Utilisateur a refusé l\'installation de la PWA');
      }
    }
  };

  // Ne pas afficher le bouton si l'app est déjà installée ou si on est en développement
  if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
    return null;
  }

  return (
    showInstallButton && (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          ref={installButtonRef}
          onClick={handleInstall}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-lg shadow-2xl shadow-red-600/30 hover:scale-105 transition-all flex items-center justify-center gap-3 transform transition-transform duration-300"
          aria-label="Installer l'application"
        >
          <span className="animate-bounce inline-block">📲</span>
          <span>
            {"fr" === (typeof window !== 'undefined' ? localStorage.getItem('oda_language') || 'fr' : 'fr') 
              ? "INSTALLER L'APP" 
              : 'INSTALL THE APP'}
          </span>
        </button>
      </div>
    )
  );
}