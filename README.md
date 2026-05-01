# OdaMarket — Next.js

Application de boutique mobile convertie en Next.js 14 (App Router).

## 🚀 Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Copier le fichier d'environnement
cp .env.local.example .env.local
# (Les clés Supabase sont déjà pré-remplies dans .env.local)

# 3. Lancer en développement
npm run dev

# 4. Ouvrir dans le navigateur
# http://localhost:3000
```

## 📁 Structure du projet

```
src/
├── app/                    # Pages (App Router Next.js 14)
│   ├── page.js             # Landing page (index.html)
│   ├── connexion/          # Login / Register (connexion.html)
│   ├── dashboard/          # Zone protégée (auth requise)
│   │   ├── layout.js       # Layout avec sidebar + header
│   │   ├── page.js         # Tableau de bord (tableau.html)
│   │   ├── produits/       # Gestion produits (produit.html)
│   │   ├── commandes/      # Commandes (commandes.html)
│   │   ├── clients/        # Clients (clients.html)
│   │   ├── messages/       # Messagerie (messages.html)
│   │   ├── parametres/     # Paramètres (parametres.html)
│   │   ├── statistiques/   # Stats (statitique.html)
│   │   ├── abonnement/     # Abonnements (abonnement.html)
│   │   └── boutique/       # Vue boutique (boutique.html)
│   └── paiement/           # Paiement (payement.html)
├── components/
│   ├── Header.js           # Header avec toggle langue
│   ├── Sidebar.js          # Sidebar navigation
│   └── PerformanceChart.js # Graphique Chart.js
├── contexts/
│   ├── AuthContext.js      # Authentification Supabase
│   └── TranslationContext.js # Système de traduction
├── lib/
│   ├── supabase.js         # Client Supabase
│   └── cache.js            # Gestionnaire de cache local
└── styles/
    └── globals.css         # Styles globaux
```

## 🔑 Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
```

## 📦 Technologies

- **Next.js 14** — App Router, Server Components
- **Supabase** — Auth, Base de données, Storage, Realtime
- **Tailwind CSS** — Styles utilitaires
- **Chart.js** — Graphiques statistiques
- **@supabase/ssr** — Auth côté serveur

## 🗺️ Routes

| Route | Description | Fichier original |
|-------|-------------|-----------------|
| `/` | Landing page | `index.html` |
| `/connexion` | Connexion/Inscription | `connexion.html` |
| `/dashboard` | Tableau de bord | `tableau.html` |
| `/dashboard/produits` | Produits | `produit.html` |
| `/dashboard/commandes` | Commandes | `commandes.html` |
| `/dashboard/clients` | Clients | `clients.html` |
| `/dashboard/messages` | Messages | `messages.html` |
| `/dashboard/parametres` | Paramètres | `parametres.html` |
| `/dashboard/statistiques` | Statistiques | `statitique.html` |
| `/dashboard/abonnement` | Abonnements | `abonnement.html` |
| `/dashboard/boutique` | Ma boutique | `boutique.html` |
| `/paiement` | Paiement | `payement.html` |

## 🔒 Authentification

L'authentification utilise Supabase Auth :
- Email/mot de passe
- OAuth Google
- Mot de passe oublié
- Toutes les routes `/dashboard/*` sont protégées

## 🌍 Traduction

Système de traduction intégré FR/EN via `TranslationContext`.
La langue est mémorisée dans `localStorage` sous `oda_language`.

## 💾 Cache

Le cache local (localStorage) est géré via `src/lib/cache.js` :
- Produits : TTL 5 minutes
- Commandes : TTL 5 minutes
- Stats : TTL 10 minutes
- Abonnement : TTL 1 heure
