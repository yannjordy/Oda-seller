'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const autoTranslations = {
  'Tableau de bord': { en: 'Dashboard' },
  'Produits': { en: 'Products' },
  'Commandes': { en: 'Orders' },
  'Clients': { en: 'Customers' },
  'Messages': { en: 'Messages' },
  'Statistiques': { en: 'Statistics' },
  'Paramètres': { en: 'Settings' },
  'Boutique': { en: 'Shop' },
  'Abonnement': { en: 'Subscription' },
  'Paiement': { en: 'Payment' },
  'Accueil': { en: 'Home' },
  'Connexion': { en: 'Login' },
  'Inscription': { en: 'Register' },
  'Déconnexion': { en: 'Logout' },
  'Ajouter': { en: 'Add' },
  'Modifier': { en: 'Edit' },
  'Supprimer': { en: 'Delete' },
  'Enregistrer': { en: 'Save' },
  'Annuler': { en: 'Cancel' },
  'Rechercher': { en: 'Search' },
  'Chargement...': { en: 'Loading...' },
  'Erreur': { en: 'Error' },
  'Succès': { en: 'Success' },
  "Aujourd'hui": { en: 'Today' },
  'Bienvenue': { en: 'Welcome' },
  'Chiffre d\'affaires': { en: 'Revenue' },
  'Voir ma boutique': { en: 'View my shop' },
  'Rejoindre notre chaîne': { en: 'Join our channel' },
  'Rejoindre notre groupe Telegram': { en: 'Join our Telegram group' },
  'Nouveau produit': { en: 'New product' },
  'Nom du produit': { en: 'Product name' },
  'Prix': { en: 'Price' },
  'Stock': { en: 'Stock' },
  'Catégorie': { en: 'Category' },
  'Description': { en: 'Description' },
  'Image': { en: 'Image' },
  'Statut': { en: 'Status' },
  'Actions': { en: 'Actions' },
  'Filtrer': { en: 'Filter' },
  'Trier': { en: 'Sort' },
  'Exporter': { en: 'Export' },
  'Importer': { en: 'Import' },
  'Télécharger': { en: 'Download' },
  'Partager': { en: 'Share' },
  'Copier': { en: 'Copy' },
  'Coller': { en: 'Paste' },
  'Couper': { en: 'Cut' },
  'Coller': { en: 'Paste' },
  'Ventes': { en: 'Sales' },
  'Revenus': { en: 'Revenue' },
  'Dépenses': { en: 'Expenses' },
  'Bénéfice': { en: 'Profit' },
  'Mois': { en: 'Month' },
  'Semaine': { en: 'Week' },
  'Jour': { en: 'Day' },
  'Année': { en: 'Year' },
};

const TranslationContext = createContext(null);

export function TranslationProvider({ children }) {
  const [lang, setLang] = useState('fr');

  useEffect(() => {
    const saved = localStorage.getItem('oda_language');
    if (saved) setLang(saved);
  }, []);

  const t = useCallback((text) => {
    if (!text || lang === 'fr') return text;
    const entry = autoTranslations[text?.trim()];
    return entry?.[lang] ?? text;
  }, [lang]);

  const changeLang = useCallback((newLang) => {
    setLang(newLang);
    localStorage.setItem('oda_language', newLang);
  }, []);

  return (
    <TranslationContext.Provider value={{ lang, t, changeLang }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error('useTranslation must be used within TranslationProvider');
  return ctx;
}
