'use client'


import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

// ==================== SUPABASE CONFIG ====================
const SUPABASE_URL = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ==================== ÉTAT INITIAL DES PARAMÈTRES ====================
const PARAMS_DEFAUT = {
  general: { nom: '', description: '', telephone: '+237 6XX XX XX XX', email: '', adresse: '' },
  apparence: { couleurPrimaire: '#FF6B00', couleurSecondaire: '#1A1A1A', accent: '#FF9A3C', logo: 'oda.jpg', favicon: 'oda.jpg', police: 'Outfit' },
  paiement: {
    carte: { actif: false, cle: '', confirme: false },
    mobile: { actif: false, confirme: false, mtn: { actif: false, numero: '', nomCompte: '', confirme: false }, orange: { actif: false, numero: '', nomCompte: '', confirme: false } },
    cash: { actif: true, confirme: true }, devise: 'FCFA'
  },
  livraison: { fraisDouala: 1000, fraisAutres: 2500, zonesPersonnalisees: [], delai: '2-5 jours ouvrables', livraisonGratuite: false, montantMinimum: 50000 }
}

// ==================== COMPOSANT PRINCIPAL ====================
export default function BoutiquePage() {

  // --- ÉTATS PRINCIPAUX ---
  const [produits, setProduits] = useState([])
  const [filteredProduits, setFilteredProduits] = useState([])
  const [panier, setPanier] = useState([])
  const [parametres, setParametres] = useState(PARAMS_DEFAUT)
  const [currentFilter, setCurrentFilter] = useState('all')
  const [currentSort, setCurrentSort] = useState('recent')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [identifiantBoutique, setIdentifiantBoutique] = useState(null)

  // --- ÉTATS UI ---
  const [sideMenuOpen, setSideMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [overlayActive, setOverlayActive] = useState(false)
  const [showLoader, setShowLoader] = useState(true)
  const [loaderStatus, setLoaderStatus] = useState('Préparation de la boutique')

  // --- ÉTATS MODALS ---
  const [productModal, setProductModal] = useState({ open: false, produit: null })
  const [checkoutModal, setCheckoutModal] = useState(false)
  const [modalAPropos, setModalAPropos] = useState(false)
  const [modalContact, setModalContact] = useState(false)

  // --- ÉTATS CHECKOUT ---
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [deliveryCity, setDeliveryCity] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryComment, setDeliveryComment] = useState('')
  const [otherCityInput, setOtherCityInput] = useState('')
  const [showOtherCity, setShowOtherCity] = useState(false)
  const [fraisLivraison, setFraisLivraison] = useState(0)
  const [livCityLabel, setLivCityLabel] = useState('')
  const [livraisonGratuite, setLivraisonGratuite] = useState(false)

  // --- ÉTATS CHAT ---
  const [chatOpen, setChatOpen] = useState(false)
  const [chatScreen, setChatScreen] = useState('login') // 'login' | 'messages'
  const [chatUsername, setChatUsername] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [chatUserId, setChatUserId] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [usernameInput, setUsernameInput] = useState('')
  const [chatUnreadCount, setChatUnreadCount] = useState(0)
  const [produitMentionne, setProduitMentionne] = useState(null)

  // --- ÉTATS NOTIFICATIONS ---
  const [notifications, setNotifications] = useState([])

  // --- REFS ---
  const pollingRef = useRef(null)
  const commandesPollingRef = useRef(null)
  const lastMessageIdRef = useRef(null)
  const dernieresCommandesIdsRef = useRef(new Set())
  const chatUsernameRef = useRef('')
  const chatUserIdRef = useRef(null)
  const produitsMentionne = useRef(null)
  const produitsRef = useRef([])
  const panierRef = useRef([])
  const parametresRef = useRef(PARAMS_DEFAUT)
  const chatMessagesListRef = useRef(null)
  const visiteurActifRef = useRef(false)
  const dernierVisiteurRef = useRef(0)

  // ==================== UTILITAIRES ====================
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null
  }

  const formatPrice = useCallback((price) => {
    return `${Number(price).toLocaleString('fr-FR')} ${parametresRef.current.paiement?.devise || 'FCFA'}`
  }, [])

  const chargerGoogleFont = (police) => {
    // Polices synchronisées avec parametres.js (Outfit par défaut)
    const policesDisponibles = [
      'Outfit','Sora','Figtree','Nunito','DM Sans','Plus Jakarta Sans','Lexend','Manrope',
      'Inter','Poppins','Montserrat','Raleway','Josefin Sans','Lato','Open Sans','Roboto',
      'Playfair Display','Cormorant Garamond','Libre Baskerville','DM Serif Display',
      'Pacifico','Righteous','Bebas Neue','Abril Fatface'
    ]
    if (!policesDisponibles.includes(police)) return
    const linkId = 'google-font-' + police.replace(/\s/g, '-')
    if (document.getElementById(linkId)) return
    const link = document.createElement('link')
    link.id = linkId; link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(police)}:wght@300;400;500;600;700;800&display=swap`
    document.head.appendChild(link)
  }

  // ==================== LOADER ====================
  const mettreAJourStatusLoader = (message) => {
    setLoaderStatus(message)
  }

  // ==================== DÉTECTION IDENTIFIANT BOUTIQUE ====================
  const recupererIdentifiantBoutique = () => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('shop') || null
  }

  // ==================== AUTHENTIFICATION ====================
  const verifierAuthentification = async () => {
    try {
      mettreAJourStatusLoader('Vérification de la session...')
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) { console.warn('⚠️ Erreur session:', error); return }
      if (session) {
        setCurrentUser(session.user)
        console.log('✅ Utilisateur connecté:', session.user.email)
      } else {
        console.log('ℹ️ Mode visiteur')
      }
    } catch (error) {
      console.warn('⚠️ Impossible de vérifier l\'authentification:', error)
    }
  }

  // ==================== PAGE 404 ====================
  const [show404, setShow404] = useState(false)

  const afficherPageErreur404 = () => {
    setShow404(true)
  }

  // ==================== CHARGEMENT DES PARAMÈTRES ====================
  const chargerParametres = async (shopId, user) => {
    try {
      mettreAJourStatusLoader('Chargement des paramètres...')
      console.log('📦 Chargement des paramètres...')
      let params = { ...PARAMS_DEFAUT }
      let resolvedUser = user

      if (shopId) {
        console.log('👁️ Mode visiteur - Identifiant:', shopId)
        const cache = localStorage.getItem(`boutique_cache_${shopId}`)
        if (cache) {
          try {
            const cachedData = JSON.parse(cache)
            params = { ...params, ...cachedData.config }
            resolvedUser = { id: cachedData.user_id }
            console.log('⚡ Paramètres chargés depuis le cache')
            setParametres(params); parametresRef.current = params
            setCurrentUser(resolvedUser)
            return resolvedUser
          } catch (e) { console.warn('⚠️ Erreur cache:', e) }
        }

        const { data, error } = await supabase
          .from('parametres_boutique').select('*')
          .eq('config->identifiant->>slug', shopId).single()

        if (error || !data) {
          const localParams = localStorage.getItem('parametres_boutique')
          if (localParams) {
            try {
              const parsed = JSON.parse(localParams)
              if (parsed.identifiant?.slug === shopId) {
                params = { ...params, ...parsed }
                setParametres(params); parametresRef.current = params
                console.log('✅ Paramètres chargés depuis localStorage (fallback)')
                return resolvedUser
              }
            } catch (e) { console.warn('⚠️ Erreur fallback localStorage:', e) }
          }
          afficherPageErreur404()
          return resolvedUser
        }

        if (data) {
          params = { ...params, ...data.config }
          resolvedUser = { id: data.user_id }
          localStorage.setItem(`boutique_cache_${shopId}`, JSON.stringify({ config: data.config, user_id: data.user_id, timestamp: Date.now() }))
          console.log('✅ Boutique chargée depuis Supabase:', params.general?.nom)
        }
      } else {
        console.log('🏠 Mode propriétaire')
        const localParams = localStorage.getItem('parametres_boutique')
        if (localParams) {
          try {
            params = { ...params, ...JSON.parse(localParams) }
            console.log('✅ Paramètres chargés depuis localStorage')
          } catch (e) { console.warn('⚠️ Erreur parsing localStorage:', e) }
        }
        if (resolvedUser?.id) {
          const { data, error } = await supabase.from('parametres_boutique').select('*').eq('user_id', resolvedUser.id).single()
          if (data && !error) {
            params = { ...params, ...data.config }
            localStorage.setItem('parametres_boutique', JSON.stringify(data.config))
            console.log('✅ Paramètres synchronisés avec Supabase')
          }
        }
      }
      setParametres(params)
      parametresRef.current = params
      setCurrentUser(resolvedUser)
      return resolvedUser
    } catch (error) {
      console.error('❌ Erreur fatale chargement paramètres:', error)
    }
  }

  // ==================== PRODUITS DE DÉMONSTRATION ====================
  const creerProduitsDemonstration = () => [
    { id: 1, nom: 'Produit Exemple 1', description: 'Description du produit exemple', prix: 15000, prixPromotion: null, stock: 10, categorie: 'Électronique', statut: 'published', mainImage: 'https://via.placeholder.com/300x300?text=Produit+1', descriptionImages: [], dateCreation: new Date().toISOString() },
    { id: 2, nom: 'Produit Exemple 2', description: 'Un autre produit de démonstration', prix: 25000, prixPromotion: 18500, stock: 5, categorie: 'Mode', statut: 'published', mainImage: 'https://via.placeholder.com/300x300?text=Produit+2', descriptionImages: [], dateCreation: new Date().toISOString() },
    { id: 3, nom: 'Produit Exemple 3', description: 'Troisième produit exemple', prix: 35000, prixPromotion: 27000, stock: 8, categorie: 'Maison', statut: 'published', mainImage: 'https://via.placeholder.com/300x300?text=Produit+3', descriptionImages: [], dateCreation: new Date().toISOString() }
  ]

  // ==================== CHARGEMENT DES PRODUITS ====================
  const chargerProduits = async (shopId, user) => {
    try {
      mettreAJourStatusLoader('Chargement des produits...')
      console.log('📦 Chargement des produits...')
      let prods = []

      if (user?.id) {
        try {
          const { data, error } = await supabase.from('produits').select('*').eq('user_id', user.id).eq('statut', 'published').gt('stock', 0)
          if (data && !error && data.length > 0) {
            prods = data.map(p => ({ id: p.id, nom: p.nom, description: p.description, prix: p.prix, prixPromotion: p.prix_promotion || null, stock: p.stock, categorie: p.categorie, statut: p.statut, mainImage: p.main_image, descriptionImages: p.description_images || [], dateCreation: p.created_at }))
            if (shopId) localStorage.setItem(`produits_cache_${shopId}`, JSON.stringify(prods))
            console.log(`✅ ${prods.length} produits chargés depuis Supabase`)
            setProduits(prods); setFilteredProduits(prods); produitsRef.current = prods
            return
          }
        } catch (err) { console.error('❌ Erreur Supabase produits:', err) }
      }

      if (shopId) {
        const cache = localStorage.getItem(`produits_cache_${shopId}`)
        if (cache) {
          try { prods = JSON.parse(cache); console.log(`⚡ ${prods.length} produits depuis cache boutique`); setProduits(prods); setFilteredProduits(prods); produitsRef.current = prods; return } catch (e) {}
        }
      }

      const localProduits = localStorage.getItem('produits_ecommerce')
      if (localProduits) {
        try {
          const parsed = JSON.parse(localProduits)
          prods = parsed.filter(p => p.statut === 'published' && p.stock > 0)
          if (prods.length > 0) { setProduits(prods); setFilteredProduits(prods); produitsRef.current = prods; console.log(`✅ ${prods.length} produits depuis localStorage`); return }
        } catch (e) {}
      }

      console.log('ℹ️ Produits de démonstration')
      prods = creerProduitsDemonstration()
      setProduits(prods); setFilteredProduits(prods); produitsRef.current = prods
    } catch (error) {
      console.error('❌ Erreur fatale produits:', error)
      const prods = creerProduitsDemonstration()
      setProduits(prods); setFilteredProduits(prods); produitsRef.current = prods
    }
  }

  // ==================== APPLICATION DU THÈME ====================
  const appliquerTheme = (params) => {
    const root = document.documentElement
    try {
      const primaire  = params.apparence?.couleurPrimaire  || '#FF6B00'
      const secondaire = params.apparence?.couleurSecondaire || '#1A1A1A'
      const accent    = params.apparence?.accent            || '#FF9A3C'
      root.style.setProperty('--primary-color',   primaire)
      root.style.setProperty('--secondary-color', secondaire)
      root.style.setProperty('--accent-color',    accent)
      const rgbPrimaire  = hexToRgb(primaire)
      const rgbSecondaire = hexToRgb(secondaire)
      const rgbAccent    = hexToRgb(accent)
      if (rgbPrimaire) {
        const darker = `rgb(${Math.max(0, rgbPrimaire.r-20)}, ${Math.max(0, rgbPrimaire.g-20)}, ${Math.max(0, rgbPrimaire.b-20)})`
        root.style.setProperty('--primary-dark',  darker)
        root.style.setProperty('--primary-light', `rgba(${rgbPrimaire.r}, ${rgbPrimaire.g}, ${rgbPrimaire.b}, 0.1)`)
        root.style.setProperty('--primary-glow',  `rgba(${rgbPrimaire.r}, ${rgbPrimaire.g}, ${rgbPrimaire.b}, 0.22)`)
      }
      if (rgbSecondaire) root.style.setProperty('--secondary-light', `rgba(${rgbSecondaire.r}, ${rgbSecondaire.g}, ${rgbSecondaire.b}, 0.1)`)
      if (rgbAccent) {
        root.style.setProperty('--accent-light', `rgba(${rgbAccent.r}, ${rgbAccent.g}, ${rgbAccent.b}, 0.15)`)
        root.style.setProperty('--accent-glow',  `rgba(${rgbAccent.r}, ${rgbAccent.g}, ${rgbAccent.b}, 0.35)`)
      }

      const whatsappNum = params.general?.telephone?.replace(/\s/g, '')
      if (whatsappNum) {
        const btn = document.getElementById('whatsappBtn')
        if (btn) btn.href = `https://wa.me/${whatsappNum}?text=Bonjour,%20je%20viens%20de%20votre%20boutique%20en%20ligne`
      }

      if (params.apparence?.police) {
        chargerGoogleFont(params.apparence.police)
        document.fonts.ready.then(() => {
          root.style.setProperty('--font-family', `'${params.apparence.police}', -apple-system, BlinkMacSystemFont, sans-serif`)
        })
      }
      console.log('🎨 Thème appliqué — Primary:', primaire, '| Accent:', accent)
    } catch (error) { console.error('❌ Erreur thème:', error) }
  }

  // ==================== SEO ====================
  const ajouterMetadonneesSEO = (params) => {
    const shopName = params.general?.nom || 'Ma Boutique'
    const shopDesc = params.general?.description || 'Découvrez nos produits'
    document.title = `${shopName} - Boutique en ligne`
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.name = 'description'; document.head.appendChild(metaDesc) }
    metaDesc.content = shopDesc
  }

  // ==================== DÉTECTION VISITEUR ====================
  const detecterVisiteur = useCallback((user) => {
    const maintenant = Date.now()
    const delai = 5 * 60 * 1000
    if (maintenant - dernierVisiteurRef.current < delai) return
    if (!visiteurActifRef.current && user) {
      visiteurActifRef.current = true
      dernierVisiteurRef.current = maintenant
      supabase.from('visiteurs').insert({ user_id: user.id, timestamp: new Date().toISOString(), page: 'boutique' })
      console.log('👀 Visiteur détecté')
    }
  }, [])

  // ==================== VÉRIFICATION NOUVELLES COMMANDES ====================
  const verifierNouvellesCommandes = async (user) => {
    if (!user) return
    try {
      const { data: commandes, error } = await supabase.from('commandes').select('id, client_nom, montant_total, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
      if (error) throw error
      if (commandes && commandes.length > 0) {
        commandes.forEach(cmd => {
          if (!dernieresCommandesIdsRef.current.has(cmd.id)) {
            if (dernieresCommandesIdsRef.current.size > 0) {
              console.log('🛒 Nouvelle commande:', cmd)
              jouerSonNotification()
            }
            dernieresCommandesIdsRef.current.add(cmd.id)
          }
        })
      }
    } catch (error) { console.error('❌ Erreur vérification commandes:', error) }
  }

  const jouerSonNotification = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8ti=')
    audio.volume = 0.5
    audio.play().catch(() => {})
  }


  // ==================== PANIER ====================
  const chargerPanier = () => {
    try {
      const panierLocal = localStorage.getItem('panier_ecommerce')
      if (panierLocal) {
        const p = JSON.parse(panierLocal)
        setPanier(p); panierRef.current = p
        console.log(`🛒 ${p.length} article(s) dans le panier`)
      }
    } catch (error) { console.error('❌ Erreur chargement panier:', error); setPanier([]); panierRef.current = [] }
  }

  const sauvegarderPanier = (nouveauPanier) => {
    try {
      localStorage.setItem('panier_ecommerce', JSON.stringify(nouveauPanier))
      setPanier([...nouveauPanier])
      panierRef.current = nouveauPanier
    } catch (error) { console.error('❌ Erreur sauvegarde panier:', error) }
  }

  const ajouterAuPanier = useCallback((produitId) => {
    const produit = produitsRef.current.find(p => p.id === produitId)
    if (!produit) { afficherNotification('❌ Produit introuvable', 'error'); return }
    const panier = [...panierRef.current]
    const itemExistant = panier.find(item => item.id === produitId)
    if (itemExistant) {
      if (itemExistant.quantite < produit.stock) {
        itemExistant.quantite++
        afficherNotification('✅ Quantité mise à jour', 'success')
      } else { afficherNotification('⚠️ Stock insuffisant', 'warning'); return }
    } else {
      panier.push({ id: produit.id, nom: produit.nom, prix: produit.prixPromotion || produit.prix, prixOriginal: produit.prixPromotion ? produit.prix : null, image: produit.mainImage, quantite: 1, stock: produit.stock })
      afficherNotification('✅ Produit ajouté au panier', 'success')
    }
    sauvegarderPanier(panier)
    const cartBtn = document.getElementById('cartBtn')
    if (cartBtn) { cartBtn.style.transform = 'scale(1.2)'; setTimeout(() => { cartBtn.style.transform = 'scale(1)' }, 200) }
  }, [])

  const modifierQuantite = useCallback((produitId, delta) => {
    const panier = [...panierRef.current]
    const item = panier.find(i => i.id === produitId)
    if (!item) return
    const nouvelleQuantite = item.quantite + delta
    if (nouvelleQuantite <= 0) { retirerDuPanier(produitId); return }
    if (nouvelleQuantite > item.stock) { afficherNotification('⚠️ Stock insuffisant', 'warning'); return }
    item.quantite = nouvelleQuantite
    sauvegarderPanier(panier)
  }, [])

  const retirerDuPanier = useCallback((produitId) => {
    const panier = [...panierRef.current]
    const index = panier.findIndex(i => i.id === produitId)
    if (index !== -1) { panier.splice(index, 1); sauvegarderPanier(panier); afficherNotification('🗑️ Produit retiré', 'info') }
  }, [])

  const calculerTotal = useCallback((pan = null) => {
    const p = pan || panierRef.current
    return p.reduce((total, item) => total + (item.prix * item.quantite), 0)
  }, [])

  const cartBadgeCount = panier.reduce((sum, item) => sum + item.quantite, 0)

  // ==================== FILTRES & TRI ====================
  const appliquerFiltres = useCallback((prods, filter, sort, search) => {
    let filtered = prods.filter(produit => {
      const matchCategorie = filter === 'all' || produit.categorie === filter
      const matchRecherche = !search ||
        produit.nom.toLowerCase().includes(search.toLowerCase()) ||
        produit.description.toLowerCase().includes(search.toLowerCase()) ||
        produit.categorie.toLowerCase().includes(search.toLowerCase())
      return matchCategorie && matchRecherche
    })
    switch (sort) {
      case 'price-asc': filtered.sort((a, b) => a.prix - b.prix); break
      case 'price-desc': filtered.sort((a, b) => b.prix - a.prix); break
      case 'popular': filtered.sort((a, b) => a.stock - b.stock); break
      default: filtered.sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation)); break
    }
    setFilteredProduits(filtered)
  }, [])

  const filtrerParCategorie = useCallback((categorie) => {
    setCurrentFilter(categorie)
    setSideMenuOpen(false)
    setOverlayActive(false)
  }, [])

  // useEffect pour appliquer les filtres quand les états changent
  useEffect(() => {
    appliquerFiltres(produits, currentFilter, currentSort, searchTerm)
  }, [produits, currentFilter, currentSort, searchTerm, appliquerFiltres])

  const categories = [...new Set(produits.map(p => p.categorie))].filter(Boolean)

  // ==================== NOTIFICATIONS ====================
  const afficherNotification = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 3000)
  }, [])

  // ==================== MODALS ====================
  const fermerMenu = () => {
    setSideMenuOpen(false)
    if (!cartOpen) setOverlayActive(false)
  }

  const fermerTout = () => {
    setSideMenuOpen(false)
    setCartOpen(false)
    setOverlayActive(false)
  }

  const ouvrirPanier = () => {
    setCartOpen(true)
    setOverlayActive(true)
  }

  const fermerPanier = () => {
    setCartOpen(false)
    setOverlayActive(false)
  }

  const ouvrirMenu = () => {
    setSideMenuOpen(true)
    setOverlayActive(true)
  }

  // ==================== CHECKOUT ====================
  const construireFraisLivraisonParVille = useCallback(() => {
    const params = parametresRef.current
    const fraisMapping = {}
    fraisMapping['Douala'] = params.livraison?.fraisDouala || 1000
    ;['Yaoundé', 'Bafoussam', 'Bamenda', 'Garoua'].forEach(v => { fraisMapping[v] = params.livraison?.fraisAutres || 2500 })
    if (params.livraison?.zonesPersonnalisees && Array.isArray(params.livraison.zonesPersonnalisees)) {
      params.livraison.zonesPersonnalisees.forEach(zone => { if (zone.nom && zone.frais !== undefined) fraisMapping[zone.nom] = zone.frais })
    }
    fraisMapping['Autre'] = params.livraison?.fraisAutres || 3500
    return fraisMapping
  }, [])

  const calculerFraisLivraisonPourVille = useCallback((ville) => {
    const params = parametresRef.current
    const fraisMapping = construireFraisLivraisonParVille()
    const frais = fraisMapping[ville] || 0
    const subtotal = calculerTotal()
    const gratuit = params.livraison?.livraisonGratuite && subtotal >= (params.livraison?.montantMinimum || 50000)
    setFraisLivraison(gratuit ? 0 : frais)
    setLivCityLabel(ville)
    setLivraisonGratuite(gratuit)
  }, [calculerTotal, construireFraisLivraisonParVille])

  const handleDeliveryCityChange = (ville) => {
    setDeliveryCity(ville)
    setShowOtherCity(ville === 'Autre')
    calculerFraisLivraisonPourVille(ville)
  }

  const getVillesOptions = () => {
    const villesParDefaut = ['Douala', 'Yaoundé', 'Bafoussam', 'Bamenda', 'Garoua']
    const zonesPerso = parametres.livraison?.zonesPersonnalisees || []
    const extras = zonesPerso.filter(z => z.nom && !villesParDefaut.includes(z.nom)).map(z => z.nom)
    return [...villesParDefaut, ...extras]
  }

  const getTotalFinal = () => {
    const subtotal = calculerTotal()
    const params = parametresRef.current
    const fraisMapping = construireFraisLivraisonParVille()
    const villeActuelle = deliveryCity === 'Autre' ? otherCityInput : deliveryCity
    let frais = fraisMapping[villeActuelle] || 0
    const gratuit = params.livraison?.livraisonGratuite && subtotal >= (params.livraison?.montantMinimum || 50000)
    if (gratuit) frais = 0
    return { subtotal, fraisLivraison: frais, total: subtotal + frais }
  }

  const ouvrirCheckout = () => {
    if (panier.length === 0) { afficherNotification('⚠️ Votre panier est vide', 'warning'); return }
    setCartOpen(false)
    setCheckoutModal(true)
  }

  const soumettreCommande = async (e) => {
    e.preventDefault()
    if (!customerName || !customerPhone || !deliveryCity || !deliveryAddress) {
      afficherNotification('⚠️ Veuillez remplir tous les champs obligatoires', 'warning'); return
    }
    if (deliveryCity === 'Autre' && !otherCityInput) {
      afficherNotification('⚠️ Veuillez préciser votre ville', 'warning'); return
    }
    const ville = deliveryCity === 'Autre' ? otherCityInput : deliveryCity
    const { subtotal, fraisLivraison: fl, total } = getTotalFinal()
    const commandeData = {
      client: { nom: customerName, tel: customerPhone, email: customerEmail || null },
      ville, adresseLivraison: deliveryAddress, commentaire: deliveryComment || null,
      produits: panier.map(item => ({ id: item.id, nom: item.nom, prix: item.prix, quantite: item.quantite, image: item.image })),
      sousTotal: subtotal, fraisLivraison: fl, montantTotal: total,
      dateCreation: new Date().toISOString(), statut: 'en_attente'
    }
    sessionStorage.setItem('commande_en_cours', JSON.stringify(commandeData))
    setCheckoutModal(false)
    afficherNotification('✅ Commande enregistrée ! Redirection vers le paiement...', 'success')
    setTimeout(() => { window.location.href = '/paiement' }, 1000)
  }

  // ==================== CHAT WIDGET ====================
  const recupererIdProprietaire = async (shopId, user) => {
    try {
      if (user?.id) {
        setChatUserId(user.id); chatUserIdRef.current = user.id
        console.log('👤 Chat en mode propriétaire'); return user.id
      } else if (shopId) {
        const cache = localStorage.getItem(`boutique_cache_${shopId}`)
        if (cache) {
          const cachedData = JSON.parse(cache)
          setChatUserId(cachedData.user_id); chatUserIdRef.current = cachedData.user_id
          return cachedData.user_id
        }
        const { data, error } = await supabase.from('parametres_boutique').select('user_id').eq('config->identifiant->>slug', shopId).single()
        if (data && !error) {
          setChatUserId(data.user_id); chatUserIdRef.current = data.user_id
          return data.user_id
        }
      }
    } catch (error) { console.error('❌ Erreur récupération user_id:', error) }
    return null
  }

  const verifierSessionChat = (shopId) => {
    const identifiant = shopId || 'default'
    const sessionKey = `chat_session_${identifiant}`
    const savedSession = localStorage.getItem(sessionKey)
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        setChatUsername(session.username)
        chatUsernameRef.current = session.username
        setChatScreen('messages')
        return session.username
      } catch (e) { console.warn('⚠️ Erreur restauration session:', e) }
    }
    return null
  }

  const demarrerConversation = async () => {
    const name = usernameInput.trim()
    if (!name) { afficherNotification('⚠️ Veuillez entrer votre nom', 'warning'); return }
    if (!chatUserIdRef.current) { afficherNotification('❌ Erreur: Boutique non identifiée', 'error'); return }
    setChatUsername(name); chatUsernameRef.current = name
    const identifiant = identifiantBoutique || 'default'
    localStorage.setItem(`chat_session_${identifiant}`, JSON.stringify({ username: name, timestamp: new Date().toISOString() }))
    setChatScreen('messages')
    const msgs = await chargerMessagesExistants(name)
    if (msgs.length === 0) {
      setChatMessages([{ type: 'admin', message: `Bonjour ${name} ! Comment puis-je vous aider ?`, time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }])
    }
    verifierProduitEnAttente(name)
  }

  const chargerMessagesExistants = async (username = null) => {
    const uname = username || chatUsernameRef.current
    const userId = chatUserIdRef.current
    if (!userId || !uname) return []
    try {
      const { data, error } = await supabase.from('conversations').select('*').eq('user_id', userId).eq('client_name', uname).order('created_at', { ascending: true })
      if (error) throw error
      if (data && data.length > 0) {
        const msgs = data.map(msg => ({
          type: msg.sender === 'admin' ? 'admin' : 'client',
          message: msg.message, id: msg.id,
          produit: msg.product_data || null,
          time: new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }))
        setChatMessages(msgs)
        marquerMessagesLus(uname, userId)
        return msgs
      }
    } catch (error) { console.error('❌ Erreur chargement messages:', error) }
    return []
  }

  const marquerMessagesLus = async (username = null, userId = null) => {
    const uname = username || chatUsernameRef.current
    const uid = userId || chatUserIdRef.current
    if (!uid || !uname) return
    try {
      await supabase.from('conversations').update({ read: true }).eq('user_id', uid).eq('client_name', uname).eq('sender', 'admin').eq('read', false)
      setChatUnreadCount(0)
    } catch (error) { console.error('❌ Erreur marquage messages lus:', error) }
  }

  const demarrerPollingMessages = useCallback((shopId) => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    pollingRef.current = setInterval(async () => {
      const userId = chatUserIdRef.current
      const username = chatUsernameRef.current
      if (!userId || !username) return
      try {
        const { data, error } = await supabase.from('conversations').select('*').eq('user_id', userId).eq('client_name', username).eq('sender', 'admin').order('created_at', { ascending: false }).limit(10)
        if (error) throw error
        if (data && data.length > 0) {
          const latestMessage = data[0]
          if (lastMessageIdRef.current && latestMessage.id !== lastMessageIdRef.current) {
            const newMsg = { type: 'admin', message: latestMessage.message, id: latestMessage.id, produit: latestMessage.product_data || null, time: new Date(latestMessage.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
            setChatMessages(prev => [...prev, newMsg])
            setChatOpen(prev => {
              if (!prev) {
                afficherNotification('💬 Nouveau message reçu !', 'info')
                const count = data.filter(m => !m.read).length
                if (count > 0) setChatUnreadCount(count)
              } else {
                marquerMessagesLus()
              }
              return prev
            })
          }
          lastMessageIdRef.current = latestMessage.id
        }
      } catch (error) { console.error('❌ Erreur polling messages:', error) }
    }, 5000)
  }, [])

  const envoyerMessageChat = async () => {
    const message = chatInput.trim()
    if (!message) return
    if (!chatUserIdRef.current) { afficherNotification('❌ Erreur: Boutique non identifiée', 'error'); return }
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    const produit = produitsMentionne.current

    if (produit) {
      setChatMessages(prev => [...prev, { type: 'client', message, time, produit }])
      try {
        await supabase.from('conversations').insert({ user_id: chatUserIdRef.current, client_name: chatUsernameRef.current, sender: 'client', message, product_data: produit, read: false })
        console.log('✅ Message avec produit envoyé')
      } catch (error) { console.error('❌ Erreur envoi:', error); afficherNotification('❌ Erreur d\'envoi du message', 'error') }
      produitsMentionne.current = null
      setProduitMentionne(null)
    } else {
      setChatMessages(prev => [...prev, { type: 'client', message, time }])
      try {
        await supabase.from('conversations').insert({ user_id: chatUserIdRef.current, client_name: chatUsernameRef.current, sender: 'client', message, read: false })
        console.log('✅ Message envoyé')
      } catch (error) { console.error('❌ Erreur envoi:', error); afficherNotification('❌ Erreur d\'envoi du message', 'error') }
    }
    setChatInput('')
  }

  const mentionnerProduitDansChat = useCallback((produitId) => {
    const produit = produitsRef.current.find(p => p.id === produitId)
    if (!produit) return
    const pd = { id: produit.id, nom: produit.nom, prix: produit.prix, stock: produit.stock, image: produit.mainImage }
    produitsMentionne.current = pd
    setProduitMentionne(pd)
    setChatOpen(true)
    if (chatScreen === 'login') {
      afficherNotification('💬 Veuillez d\'abord entrer votre nom pour discuter', 'info')
      sessionStorage.setItem('produit_a_mentionner', JSON.stringify(pd))
      return
    }
    setChatInput('Bonjour, je suis intéressé(e) par ce produit. Pouvez-vous me donner plus d\'informations ?')
    afficherNotification('✅ Produit ajouté à votre message !', 'success')
  }, [chatScreen])

  const verifierProduitEnAttente = (username) => {
    const produitEnAttente = sessionStorage.getItem('produit_a_mentionner')
    if (produitEnAttente && username) {
      try {
        const produit = JSON.parse(produitEnAttente)
        produitsMentionne.current = produit
        setProduitMentionne(produit)
        setChatInput('Bonjour, je suis intéressé(e) par ce produit. Pouvez-vous me donner plus d\'informations ?')
        sessionStorage.removeItem('produit_a_mentionner')
        afficherNotification('✅ Produit ajouté à votre message !', 'success')
      } catch (e) { console.error('❌ Erreur chargement produit en attente:', e) }
    }
  }

  const supprimerDiscussion = async () => {
    if (!chatUserIdRef.current || !chatUsernameRef.current) { afficherNotification('⚠️ Aucune discussion à supprimer', 'warning'); return }
    const confirmer = window.confirm('🗑️ Supprimer toute la discussion ?\n\n⚠️ Cette action est irréversible.\nTous les messages seront supprimés définitivement.\n\nContinuer ?')
    if (!confirmer) return
    try {
      const { error } = await supabase.from('conversations').delete().eq('user_id', chatUserIdRef.current).eq('client_name', chatUsernameRef.current)
      if (error) throw error
      const identifiant = identifiantBoutique || 'default'
      localStorage.removeItem(`chat_session_${identifiant}`)
      setChatUsername(''); chatUsernameRef.current = ''
      setChatMessages([])
      produitsMentionne.current = null; setProduitMentionne(null)
      lastMessageIdRef.current = null
      setChatScreen('login')
      setUsernameInput('')
      setChatOpen(false)
      afficherNotification('✅ Discussion supprimée avec succès', 'success')
      console.log('🗑️ Discussion complètement supprimée')
    } catch (error) {
      console.error('❌ Erreur suppression discussion:', error)
      afficherNotification('❌ Erreur lors de la suppression', 'error')
      chargerMessagesExistants()
    }
  }

  const reinitialiserChat = () => {
    const identifiant = identifiantBoutique || 'default'
    if (window.confirm('Voulez-vous vraiment réinitialiser votre session chat ? Cela effacera votre nom enregistré.')) {
      localStorage.removeItem(`chat_session_${identifiant}`)
      setChatUsername(''); chatUsernameRef.current = ''
      setChatMessages([])
      produitsMentionne.current = null; setProduitMentionne(null)
      setChatScreen('login')
      setUsernameInput('')
      afficherNotification('✅ Session chat réinitialisée', 'success')
    }
  }

  // Scroll automatique des messages
  useEffect(() => {
    if (chatMessagesListRef.current) {
      chatMessagesListRef.current.scrollTop = chatMessagesListRef.current.scrollHeight
    }
  }, [chatMessages])



  // ==================== USEEFFECT PRINCIPAL ====================
  useEffect(() => {
    const init = async () => {
      console.log('🛍️ E-Commerce initialisé !')
      setShowLoader(true)
      try {
        // Animations
        ajouterStylesAnimation()

        // Auth
        mettreAJourStatusLoader('Vérification de la session...')
        const { data: { session } } = await supabase.auth.getSession()
        let user = session?.user || null
        if (user) setCurrentUser(user)
        await new Promise(r => setTimeout(r, 300))

        // Boutique ID
        const shopId = recupererIdentifiantBoutique()
        setIdentifiantBoutique(shopId)

        // Paramètres
        mettreAJourStatusLoader('Chargement des paramètres...')
        const resolvedUser = await chargerParametres(shopId, user)
        if (resolvedUser) user = resolvedUser
        await new Promise(r => setTimeout(r, 300))

        // Thème
        mettreAJourStatusLoader('Application du thème...')
        appliquerTheme(parametresRef.current)
        ajouterMetadonneesSEO(parametresRef.current)
        await new Promise(r => setTimeout(r, 200))

        // Produits
        mettreAJourStatusLoader('Chargement des produits...')
        await chargerProduits(shopId, user)
        await new Promise(r => setTimeout(r, 300))

        // Panier
        mettreAJourStatusLoader('Préparation du panier...')
        chargerPanier()
        await new Promise(r => setTimeout(r, 200))

        // Chat
        const chatUId = await recupererIdProprietaire(shopId, user)
        const savedChatUser = verifierSessionChat(shopId)
        if (savedChatUser) {
          chatUsernameRef.current = savedChatUser
          await chargerMessagesExistants(savedChatUser)
        }
        demarrerPollingMessages(shopId)

        // Polling commandes
        if (user) {
          await verifierNouvellesCommandes(user)
          commandesPollingRef.current = setInterval(() => verifierNouvellesCommandes(user), 10000)
        }

        // Visiteur
        setTimeout(() => detecterVisiteur(user), 3000)
        const handleActivity = () => detecterVisiteur(user)
        document.addEventListener('scroll', handleActivity, { once: true })
        document.addEventListener('click', handleActivity, { once: true })
        document.addEventListener('touchstart', handleActivity, { once: true })

        setShowLoader(false)
        console.log('✅ E-Commerce prêt !')
        setTimeout(afficherLogsDebug, 2000)

      } catch (error) {
        console.error('❌ Erreur initialisation:', error)
        setShowLoader(false)
        setTimeout(() => afficherNotification('⚠️ Chargement avec données locales', 'warning'), 500)
        try { chargerPanier() } catch (err) { console.error('❌ Erreur fatale:', err) }
      }
    }
    init()

    // Raccourcis clavier
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        fermerTout(); setProductModal({ open: false, produit: null }); setCheckoutModal(false); setChatOpen(false); setModalAPropos(false); setModalContact(false)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault(); document.getElementById('searchInput')?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    // Online/Offline
    const handleOnline = () => afficherNotification('🌐 Connexion rétablie', 'success')
    const handleOffline = () => afficherNotification('⚠️ Pas de connexion Internet', 'warning')
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Debug global
    window.forcerAffichageProduits = () => {
      const localProduits = localStorage.getItem('produits_ecommerce')
      if (!localProduits) { console.error('❌ Aucun produit dans localStorage !'); return }
      try {
        const parsed = JSON.parse(localProduits)
        const prods = parsed.filter(p => p.statut === 'published' && p.stock > 0)
        setProduits(prods); setFilteredProduits(prods); produitsRef.current = prods
        console.log(`✅ ${prods.length} produits forcés`)
      } catch (e) { console.error('❌ Erreur:', e) }
    }
    window.reinitialiserChat = reinitialiserChat

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (commandesPollingRef.current) clearInterval(commandesPollingRef.current)
    }
  }, [])

  // ==================== STYLES D'ANIMATION ====================
  const ajouterStylesAnimation = () => {
    if (document.getElementById('custom-animations')) return
    const style = document.createElement('style')
    style.id = 'custom-animations'
    style.textContent = `@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes fadeOut{from{opacity:1}to{opacity:0}}@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes slideIn{from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`
    document.head.appendChild(style)
  }

  // ==================== DEBUG ====================
  const afficherLogsDebug = () => {
    console.log('╔════════════════════════════════════════╗')
    console.log('📊 ÉTAT DE L\'APPLICATION')
    console.log('╚════════════════════════════════════════╝')
    console.log('🔗 URL complète:', window.location.href)
    console.log('🆔 Identifiant boutique:', identifiantBoutique || 'Aucun (mode propriétaire)')
    console.log('👤 Current user:', currentUser?.id || 'Non connecté')
    console.log('🏪 Nom boutique:', parametresRef.current.general?.nom || 'Non défini')
    console.log('📦 Produits chargés:', produitsRef.current.length)
    console.log('🛒 Articles panier:', panierRef.current.length)
  }

  // ==================== RENDER ====================
  const prixFormate = (prix) => `${Number(prix).toLocaleString('fr-FR')} ${parametresRef.current.paiement?.devise || 'FCFA'}`

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      {/* ===== LOADER PROFESSIONNEL ===== */}
      {showLoader && (
        <div className="loader-screen">
          {/* Particules d'arrière-plan */}
          <div className="loader-particles">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`loader-particle loader-particle-${i+1}`} />
            ))}
          </div>

          {/* Contenu central */}
          <div className="loader-center">

            {/* Icône panier SVG arrondie */}
            <div className="loader-icon-wrap">
              <div className="loader-icon-ring" />
              <div className="loader-icon-ring loader-icon-ring-2" />
              <div className="loader-cart-bubble">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Poignée */}
                  <path d="M8 10C8 10 10 10 11 10L15 28H32L36 15H14" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Roue gauche */}
                  <circle cx="17" cy="33" r="2.8" fill="white"/>
                  {/* Roue droite */}
                  <circle cx="29" cy="33" r="2.8" fill="white"/>
                  {/* Plus au centre */}
                  <path d="M23 18V24" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M20 21H26" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            {/* Message de bienvenue */}
            <div className="loader-shop-name">
              {parametres.general?.nom
                ? <>Bienvenue chez <span style={{ color:'var(--accent-color)' }}>{parametres.general.nom}</span></>
                : <span className="loader-name-shimmer" />
              }
            </div>

            {/* Tagline */}
            <div className="loader-tagline">
              {parametres.general?.description || 'Préparation de votre expérience…'}
            </div>

            {/* Barre de progression élégante */}
            <div className="loader-bar-wrap">
              <div className="loader-bar-track">
                <div className="loader-bar-fill" />
                <div className="loader-bar-glow" />
              </div>
            </div>

            {/* Statut */}
            <div className="loader-status">{loaderStatus}</div>

            {/* Points animés */}
            <div className="loader-dots">
              {[0,1,2].map(i => <div key={i} className="loader-dot" style={{ animationDelay:`${i*0.18}s` }} />)}
            </div>

          </div>
        </div>
      )}

      {/* ===== PAGE 404 ===== */}
      {show404 && (
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',textAlign:'center',padding:'40px 20px',animation:'fadeIn 0.5s ease' }}>
          <div style={{ fontSize:'5rem',marginBottom:'20px',animation:'bounce 1s ease infinite' }}>🔍</div>
          <h1 style={{ fontSize:'2rem',fontWeight:700,marginBottom:'16px' }}>Boutique introuvable</h1>
          <p style={{ fontSize:'1.1rem',color:'var(--text-secondary)',marginBottom:'32px',maxWidth:'500px',lineHeight:1.6 }}>Désolé, nous n'avons pas trouvé cette boutique. Vérifiez que le lien est correct ou contactez le propriétaire.</p>
          <a href={typeof window !== 'undefined' ? window.location.origin : '/'} style={{ padding:'14px 32px',background:'var(--primary-color)',color:'white',textDecoration:'none',borderRadius:'12px',fontWeight:600 }}>🏠 Retour à l'accueil</a>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <header className="mobile-header">
        <div className="header-top">
          <button className="btn-menu" id="menuBtn" onClick={ouvrirMenu}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <div className="logo-container">
            <img src={parametres.apparence?.logo || 'oda.jpg'} alt="Logo" className="logo-image" id="shopLogo" onError={(e) => { e.target.src = 'oda.jpg' }} />
            <h1 className="shop-name" id="shopName">{parametres.general?.nom || 'Ma Boutique'}</h1>
          </div>
          <button className="btn-cart" id="cartBtn" onClick={ouvrirPanier}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 2L7.17 4M15 2l1.83 2M9 20c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M7.17 4H20l-2 9H9L7.17 4zm0 0L6 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {cartBadgeCount > 0 && <span className="cart-badge" id="cartBadge">{cartBadgeCount}</span>}
          </button>
        </div>
        <div className="search-bar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <input type="text" placeholder="Rechercher des produits..." id="searchInput" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </header>

      {/* ===== MENU LATÉRAL ===== */}
      <div className={`side-menu${sideMenuOpen ? ' active' : ''}`} id="sideMenu">
        <div className="menu-header">
          <h2>Menu</h2>
          <button className="btn-close" id="closeMenuBtn" onClick={fermerMenu}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div className="menu-content">
          <div className="menu-section">
            <h3>Catégories</h3>
            <div className="category-list" id="categoryList">
              {categories.length > 0 ? categories.map(cat => (
                <div key={cat} className="category-item" style={{ borderColor: currentFilter === cat ? 'var(--primary-color)' : 'transparent' }} onClick={() => filtrerParCategorie(cat)}>{cat}</div>
              )) : <div style={{ padding:'12px',textAlign:'center',color:'var(--text-secondary)',fontSize:'0.9rem' }}>Aucune catégorie</div>}
            </div>
          </div>
          <div className="menu-section">
            <h3>Informations</h3>
            <a href="#" className="menu-link" id="aboutLink" onClick={e => { e.preventDefault(); fermerMenu(); setTimeout(() => setModalAPropos(true), 300) }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              À propos
            </a>
            <a href="#" className="menu-link" id="contactLink" onClick={e => { e.preventDefault(); fermerMenu(); setTimeout(() => setModalContact(true), 300) }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Contact
            </a>
          </div>
        </div>
      </div>

      {/* ===== OVERLAY ===== */}
      <div className={`overlay${overlayActive ? ' active' : ''}`} id="overlay" onClick={fermerTout} />

      {/* ===== CONTENU PRINCIPAL ===== */}
      {!show404 && (
        <main className="main-content">
          <section className="hero-section">
            <div className="hero-content">
              <h2 className="hero-title">Découvrez nos produits</h2>
              <p className="hero-subtitle" id="shopDescription">{parametres.general?.description || 'Les meilleurs produits au meilleur prix'}</p>
            </div>
          </section>

          <section className="filters-section">
            <div className="filter-chips" id="filterChips">
              <button className={`chip${currentFilter === 'all' ? ' active' : ''}`} data-filter="all" onClick={() => filtrerParCategorie('all')}>Tous</button>
              {categories.slice(0, 5).map(cat => (
                <button key={cat} className={`chip${currentFilter === cat ? ' active' : ''}`} data-filter={cat} onClick={() => filtrerParCategorie(cat)}>{cat}</button>
              ))}
            </div>
            <select className="filter-select" id="sortSelect" value={currentSort} onChange={e => setCurrentSort(e.target.value)}>
              <option value="recent">Plus récents</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="popular">Populaires</option>
            </select>
          </section>

          <section className="products-section">
            {filteredProduits.length === 0 ? (
              <div className="empty-state" id="emptyState" style={{ display:'flex' }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none"><path d="M9 2L7.17 4M15 2l1.83 2M9 20c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M7.17 4H20l-2 9H9L7.17 4zm0 0L6 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <h3>Aucun produit trouvé</h3>
                <p>Essayez de modifier vos filtres</p>
              </div>
            ) : (
              <div className="products-grid" id="productsGrid">
                {filteredProduits.map((produit, index) => {
                  const isLeft = index % 2 === 0
                  const delay = Math.floor(index / 2) * 0.09
                  const anim = isLeft ? 'slideInLeft' : 'slideInRight'
                  const hasPromo = produit.prixPromotion && produit.prixPromotion < produit.prix
                  const prixEffectif = hasPromo ? produit.prixPromotion : produit.prix
                  const remise = hasPromo ? Math.round((1 - produit.prixPromotion / produit.prix) * 100) : 0
                  return (
                    <div key={produit.id} className="product-card"
                      style={{ opacity:0, animation:`${anim} 0.45s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s forwards`, willChange:'transform, opacity' }}
                      onClick={e => { if (!e.target.closest('.btn-add-cart') && !e.target.closest('.btn-mention-chat')) setProductModal({ open: true, produit }) }}>
                      <div className="product-image-container">
                        <img src={produit.mainImage || 'https://via.placeholder.com/300'} className="product-image" alt={produit.nom} loading="lazy"
                          onError={e => { e.target.src = 'https://via.placeholder.com/300?text=Produit' }} />
                        {produit.stock < 5 && <span className="product-badge">Stock limité</span>}
                        {hasPromo && (
                          <span className="promo-badge">-{remise}%</span>
                        )}
                        <button className="btn-mention-chat" title="Discuter de ce produit" onClick={e => { e.stopPropagation(); mentionnerProduitDansChat(produit.id) }}>💬</button>
                      </div>
                      <div className="product-info">
                        <h3 className="product-name">{produit.nom}</h3>
                        <div className="product-price-block">
                          {hasPromo ? (
                            <>
                              <div className="product-price-promo">{prixFormate(prixEffectif)}</div>
                              <div className="product-price-original">{prixFormate(produit.prix)}</div>
                            </>
                          ) : (
                            <div className="product-price">{prixFormate(produit.prix)}</div>
                          )}
                        </div>
                        <div className="product-stock">Stock: {produit.stock}</div>
                        <button className="btn-add-cart" onClick={e => { e.stopPropagation(); ajouterAuPanier(produit.id) }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 2L7.17 4M15 2l1.83 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M7.17 4H20l-2 9H9L7.17 4zm0 0L6 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Ajouter
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </main>
      )}

      {/* ===== PANIER LATÉRAL ===== */}
      <div className={`cart-panel${cartOpen ? ' active' : ''}`} id="cartPanel">
        <div className="cart-header">
          <h2>Mon Panier</h2>
          <button className="btn-close" id="closeCartBtn" onClick={fermerPanier}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div className="cart-content" id="cartContent">
          {panier.length === 0 ? (
            <div style={{ textAlign:'center',padding:'40px 20px',color:'var(--text-secondary)' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ marginBottom:'16px',color:'var(--border-color)' }}>
                <path d="M9 2L7.17 4M15 2l1.83 2M9 20c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M7.17 4H20l-2 9H9L7.17 4zm0 0L6 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={{ fontWeight:600,marginBottom:'4px' }}>Votre panier est vide</p>
              <p style={{ fontSize:'0.85rem' }}>Ajoutez des produits pour commencer</p>
            </div>
          ) : panier.map((item, index) => (
            <div key={item.id} className="cart-item" style={{ animation:`fadeIn 0.3s ease ${index*0.05}s backwards` }}>
              <img src={item.image} className="cart-item-image" alt={item.nom} onError={e => { e.target.src = 'https://via.placeholder.com/70' }} />
              <div className="cart-item-info">
                <div className="cart-item-name">{item.nom}</div>
                <div className="cart-item-price">{prixFormate(item.prix)}</div>
                <div className="cart-item-controls">
                  <button className="btn-qty" onClick={() => modifierQuantite(item.id, -1)}>−</button>
                  <span className="item-qty">{item.quantite}</span>
                  <button className="btn-qty" onClick={() => modifierQuantite(item.id, 1)}>+</button>
                  <button className="btn-remove" onClick={() => retirerDuPanier(item.id)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-footer">
          <div className="cart-total">
            <span>Total</span>
            <span className="total-amount" id="totalAmount">{prixFormate(calculerTotal())}</span>
          </div>
          <button className="btn-checkout" id="checkoutBtn" onClick={ouvrirCheckout}>
            Commander
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      {/* ===== MODAL PRODUIT ===== */}
      <div className={`product-modal${productModal.open ? ' active' : ''}`} id="productModal">
        <div className="modal-content">
          <button className="btn-close-modal" id="closeModalBtn" onClick={() => setProductModal({ open: false, produit: null })}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          {productModal.produit && (
            <div className="modal-body" id="modalBody">
              <div style={{ marginBottom:'16px',animation:'fadeIn 0.3s ease' }}>
                <img src={productModal.produit.mainImage} style={{ width:'100%',height:'300px',objectFit:'cover',borderRadius:'12px' }} alt={productModal.produit.nom} onError={e => { e.target.src = 'https://via.placeholder.com/300?text=Produit' }} />
                {productModal.produit.descriptionImages?.length > 0 && (
                  <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px',marginTop:'16px' }}>
                    {productModal.produit.descriptionImages.slice(0,4).map((img, i) => (
                      <img key={i} src={img} style={{ width:'100%',height:'120px',objectFit:'cover',borderRadius:'8px' }} alt="Description" />
                    ))}
                  </div>
                )}
              </div>
              <h2 style={{ fontSize:'1.3rem',fontWeight:700,marginBottom:'8px' }}>{productModal.produit.nom}</h2>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px' }}>
                <div>
                  {productModal.produit.prixPromotion && productModal.produit.prixPromotion < productModal.produit.prix ? (
                    <div style={{ display:'flex',flexDirection:'column',gap:'4px' }}>
                      <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
                        <div style={{ fontSize:'1.6rem',fontWeight:800,color:'var(--accent-color)',textShadow:'0 2px 8px var(--accent-glow)' }}>
                          {prixFormate(productModal.produit.prixPromotion)}
                        </div>
                        <span className="promo-badge-modal">
                          -{Math.round((1 - productModal.produit.prixPromotion / productModal.produit.prix) * 100)}%
                        </span>
                      </div>
                      <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
                        <span style={{ fontSize:'1rem',color:'var(--text-secondary)',textDecoration:'line-through',fontWeight:500 }}>
                          {prixFormate(productModal.produit.prix)}
                        </span>
                        <span style={{ fontSize:'0.8rem',background:'var(--accent-light)',color:'var(--accent-color)',padding:'2px 8px',borderRadius:'8px',fontWeight:700 }}>
                          Économisez {prixFormate(productModal.produit.prix - productModal.produit.prixPromotion)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize:'1.5rem',fontWeight:800,color:'var(--primary-color)' }}>{prixFormate(productModal.produit.prix)}</div>
                  )}
                </div>
                <div style={{ fontSize:'0.9rem',color:'var(--text-secondary)' }}>Stock: <strong>{productModal.produit.stock}</strong></div>
              </div>
              <div style={{ background:'var(--bg-secondary)',padding:'12px',borderRadius:'8px',marginBottom:'16px' }}>
                <div style={{ fontSize:'0.85rem',color:'var(--text-secondary)',marginBottom:'4px' }}>Catégorie</div>
                <div style={{ fontWeight:600 }}>{productModal.produit.categorie}</div>
              </div>
              <p style={{ color:'var(--text-secondary)',lineHeight:1.6,marginBottom:'24px' }}>{productModal.produit.description}</p>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px' }}>
                <button onClick={() => { mentionnerProduitDansChat(productModal.produit.id); setProductModal({ open:false,produit:null }) }}
                  style={{ width:'100%',padding:'16px',fontSize:'1rem',background:'linear-gradient(135deg,#25D366,#128C7E)',color:'white',border:'none',borderRadius:'12px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px' }}>
                  <span style={{ fontSize:'1.2rem' }}>💬</span> Discuter
                </button>
                <button className="btn-add-cart" onClick={() => { ajouterAuPanier(productModal.produit.id); setProductModal({ open:false,produit:null }) }}
                  style={{ width:'100%',padding:'16px',fontSize:'1rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 2L7.17 4M15 2l1.83 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M7.17 4H20l-2 9H9L7.17 4zm0 0L6 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Ajouter au panier
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL CHECKOUT ===== */}
      <div className={`checkout-modal${checkoutModal ? ' active' : ''}`} id="checkoutModal">
        <div className="modal-content">
          <button className="btn-close-modal" id="closeCheckoutBtn" onClick={() => setCheckoutModal(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <div className="modal-body">
            <div className="checkout-header-new">
              <div className="checkout-icon">🛍️</div>
              <h2 className="checkout-title">Finaliser votre commande</h2>
              <p className="checkout-subtitle">Complétez vos informations pour recevoir votre commande</p>
            </div>
            <form id="checkoutForm" className="checkout-form-new" onSubmit={soumettreCommande}>
              <div className="form-section-new">
                <div className="section-header"><span className="section-icon">👤</span><h3>Vos informations</h3></div>
                <div className="form-row">
                  <div className="form-group-new">
                    <label className="form-label-new"><span className="label-text">Nom complet</span><span className="label-required">*</span></label>
                    <input type="text" className="form-input-new" id="customerName" placeholder="Ex: Marie Dupont" required value={customerName} onChange={e => setCustomerName(e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group-new">
                    <label className="form-label-new"><span className="label-text">Téléphone</span><span className="label-required">*</span></label>
                    <input type="tel" className="form-input-new" id="customerPhone" placeholder="+237 6XX XX XX XX" required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group-new">
                    <label className="form-label-new"><span className="label-text">Email (optionnel)</span></label>
                    <input type="email" className="form-input-new" id="customerEmail" placeholder="votre@email.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="form-section-new">
                <div className="section-header"><span className="section-icon">📍</span><h3>Adresse de livraison</h3></div>
                <div className="form-row">
                  <div className="form-group-new">
                    <label className="form-label-new"><span className="label-text">Ville</span><span className="label-required">*</span></label>
                    <select className="form-input-new" id="deliveryCity" required value={deliveryCity} onChange={e => handleDeliveryCityChange(e.target.value)}>
                      <option value="">Sélectionnez une ville</option>
                      {getVillesOptions().map(v => <option key={v} value={v}>{v}</option>)}
                      <option value="Autre">Autre ville</option>
                    </select>
                  </div>
                </div>
                {showOtherCity && (
                  <div className="form-row" id="otherCityRow">
                    <div className="form-group-new">
                      <label className="form-label-new"><span className="label-text">Précisez la ville</span><span className="label-required">*</span></label>
                      <input type="text" className="form-input-new" id="otherCityInput" placeholder="Nom de votre ville" value={otherCityInput} onChange={e => setOtherCityInput(e.target.value)} required />
                    </div>
                  </div>
                )}
                <div className="form-row">
                  <div className="form-group-new">
                    <label className="form-label-new"><span className="label-text">Adresse complète</span><span className="label-required">*</span></label>
                    <textarea className="form-input-new" id="deliveryAddress" placeholder="Quartier, rue, point de repère..." rows="3" required value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group-new">
                    <label className="form-label-new"><span className="label-text">Commentaire (optionnel)</span></label>
                    <textarea className="form-input-new" id="deliveryComment" placeholder="Instructions spéciales pour la livraison..." rows="2" value={deliveryComment} onChange={e => setDeliveryComment(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="order-summary-new">
                <div className="summary-header"><span className="summary-icon">📦</span><h3>Récapitulatif</h3></div>
                <div className="summary-items" id="summaryItems">
                  {panier.map(item => (
                    <div key={item.id} className="summary-item">
                      <div className="item-info">
                        <span className="item-qty">{item.quantite}</span>
                        <span className="item-name">{item.nom}</span>
                      </div>
                      <span className="item-price">{prixFormate(item.prix * item.quantite)}</span>
                    </div>
                  ))}
                </div>
                <div className="summary-divider" />
                <div className="summary-row">
                  <span className="summary-label">Sous-total</span>
                  <span className="summary-value" id="summarySubtotal">{prixFormate(calculerTotal())}</span>
                </div>
                <div className="summary-row delivery-row">
                  <span className="summary-label">
                    <span>Frais de livraison</span>
                    <span className="delivery-city" id="deliveryCityLabel">{livCityLabel}</span>
                  </span>
                  <span className="summary-value" id="summaryDelivery">
                    {livraisonGratuite ? <span style={{ color:'var(--success-color)',fontWeight:700 }}>🎁 GRATUIT</span> : (deliveryCity ? prixFormate(fraisLivraison) : 'À calculer')}
                  </span>
                </div>
                <div className="summary-divider" />
                <div className="summary-row total-row">
                  <span className="summary-label">Total à payer</span>
                  <span className="summary-total" id="summaryTotal">{prixFormate(calculerTotal() + fraisLivraison)}</span>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit-new">
                  <span className="btn-text">Procéder au paiement</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ===== WHATSAPP ===== */}
      <a href={`https://wa.me/${(parametres.general?.telephone || '237600000000').replace(/\s/g, '')}?text=Bonjour,%20je%20viens%20de%20votre%20boutique%20en%20ligne`}
        className="whatsapp-btn" id="whatsappBtn" target="_blank" rel="noreferrer">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor"/>
        </svg>
      </a>

      {/* ===== CHAT TOGGLE BUTTON ===== */}
      <button id="chat-toggle-btn" className="chat-toggle-btn" aria-label="Ouvrir le chat" onClick={() => setChatOpen(prev => !prev)}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {chatUnreadCount > 0 && <span id="chat-unread-badge" className="chat-badge">{chatUnreadCount}</span>}
      </button>

      {/* ===== CHAT WINDOW ===== */}
      <div id="chat-window" className={`chat-window${chatOpen ? ' active' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">💬</div>
            <div className="chat-header-text">
              <span className="chat-title">Service Client</span>
              <span className="chat-subtitle" id="chat-status">En ligne</span>
            </div>
          </div>
          <button id="chat-close-btn" className="chat-close-btn" aria-label="Fermer le chat" onClick={() => setChatOpen(false)}>×</button>
        </div>

        {chatScreen === 'login' ? (
          <div id="chat-login-screen" className="chat-body">
            <div className="chat-welcome">
              <div className="chat-welcome-icon">👋</div>
              <h3 className="chat-welcome-title">Bonjour !</h3>
              <p className="chat-welcome-text">Pour commencer à discuter avec nous, veuillez entrer votre nom :</p>
            </div>
            <div className="chat-login-form">
              <input type="text" id="chat-username-input" className="chat-input-field" placeholder="Votre nom (ex: Marie Dupont)" maxLength={50} autoComplete="name" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} onKeyPress={e => { if (e.key === 'Enter') demarrerConversation() }} />
              <button id="chat-start-btn" className="chat-submit-btn" onClick={demarrerConversation}>
                <span>💬</span> Commencer la discussion
              </button>
            </div>
          </div>
        ) : (
          <div id="chat-messages-screen" className="chat-body chat-messages-screen" style={{ display:'flex', flexDirection:'column', padding:0, background:'#f5f5f7' }}>
            <div style={{ display:'flex',justifyContent:'flex-end',padding:'8px 16px',background:'white',borderBottom:'1px solid #E5E7EB' }}>
              <button id="chat-delete-btn" onClick={supprimerDiscussion} style={{ background:'none',border:'none',cursor:'pointer',fontSize:'0.8rem',color:'var(--error-color)',fontWeight:600,padding:'4px 8px',borderRadius:'6px' }}>🗑️ Supprimer discussion</button>
            </div>
            <div id="chat-messages-list" className="chat-messages-list" ref={chatMessagesListRef}>
              {chatMessages.length === 0 ? (
                <div className="chat-empty-state">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5"/></svg>
                  <p>Aucun message pour l'instant</p>
                </div>
              ) : chatMessages.map((msg, i) => (
                <div key={i}>
                  {msg.produit ? (
                    <div style={{ display:'flex',flexDirection:'column',gap:'8px',maxWidth:'75%',alignSelf: msg.type === 'client' ? 'flex-end' : 'flex-start',animation:'messageSlideIn 0.3s ease' }}>
                      <div style={{ background: msg.type === 'client' ? 'rgba(255,255,255,0.15)' : 'white', border: `2px solid ${msg.type === 'client' ? 'rgba(255,255,255,0.3)' : 'var(--border-color)'}`, borderRadius:'12px',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>
                        <img src={msg.produit.image || msg.produit.mainImage || 'https://via.placeholder.com/300'} style={{ width:'100%',height:'150px',objectFit:'cover' }} alt={msg.produit.nom} onError={e => { e.target.src = 'https://via.placeholder.com/300?text=Produit' }} />
                        <div style={{ padding:'12px' }}>
                          <div style={{ fontWeight:600,marginBottom:'4px',color: msg.type === 'client' ? 'black' : 'var(--text-primary)',fontSize:'0.9rem' }}>{msg.produit.nom}</div>
                          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'8px' }}>
                            <span style={{ fontWeight:700,color: msg.type === 'client' ? 'black' : 'var(--primary-color)',fontSize:'1rem' }}>{prixFormate(msg.produit.prix)}</span>
                            <span style={{ fontSize:'0.8rem',color:'var(--text-secondary)' }}>📦 Stock: {msg.produit.stock}</span>
                          </div>
                        </div>
                      </div>
                      {msg.message && <div className={`c-message ${msg.type}`} style={{ marginTop:0 }}>{msg.message}<span className="c-message-time">{msg.time}</span></div>}
                    </div>
                  ) : (
                    <div className={`c-message ${msg.type}`}>{msg.message}<span className="c-message-time">{msg.time}</span></div>
                  )}
                </div>
              ))}
            </div>
            <div className="chat-input-area">
              <input type="text" id="chat-message-input" className="chat-message-input" placeholder="Votre message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyerMessageChat() } }} />
              <button id="chat-send-btn" className="chat-send-btn" disabled={!chatInput.trim()} onClick={envoyerMessageChat}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== NOTIFICATIONS ===== */}
      <div id="notification-container" style={{ position:'fixed',top:'160px',right:'16px',zIndex:10000,display:'flex',flexDirection:'column',gap:'12px',maxWidth:'calc(100% - 32px)' }}>
        {notifications.map(n => {
          const couleurs = { success:'#10B981', error:'#EF4444', info:'#3B82F6', warning:'#F59E0B' }
          return (
            <div key={n.id} style={{ background:'white',padding:'16px',borderRadius:'12px',boxShadow:'0 4px 12px rgba(0,0,0,0.15)',borderLeft:`4px solid ${couleurs[n.type]}`,animation:'slideIn 0.3s ease',fontSize:'0.9rem',fontWeight:500,color:'#1A1A1A' }}>
              {n.message}
            </div>
          )
        })}
      </div>

      {/* ===== MODAL À PROPOS ===== */}
      {modalAPropos && (
        <div className="product-modal active" id="modalAPropos" onClick={e => { if (e.target === e.currentTarget) setModalAPropos(false) }}>
          <div className="modal-content">
            <button className="btn-close-modal" onClick={() => setModalAPropos(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <div className="modal-body" style={{ maxHeight:'80vh',overflowY:'auto' }}>
              <div style={{ textAlign:'center',marginBottom:'32px' }}>
                <div style={{ fontSize:'4rem',marginBottom:'16px' }}>ℹ️</div>
                <h2 style={{ fontSize:'1.5rem',fontWeight:700,marginBottom:'8px' }}>À propos d'ODA</h2>
                <p style={{ color:'var(--text-secondary)',fontSize:'0.95rem' }}>Votre plateforme e-commerce simplifiée</p>
              </div>
              <div style={{ background:'linear-gradient(135deg,rgba(255,107,0,0.1),rgba(255,107,0,0.05))',padding:'24px',borderRadius:'16px',marginBottom:'24px',borderLeft:'4px solid var(--primary-color)' }}>
                <h3 style={{ fontSize:'1.2rem',fontWeight:700,marginBottom:'16px',color:'var(--primary-color)' }}>🚀 Comment fonctionne ODA ?</h3>
                <h4 style={{ fontWeight:600,marginBottom:'12px',color:'var(--text-primary)' }}>📱 Pour vous, le commerçant :</h4>
                <ul style={{ listStyle:'none',padding:0,margin:0 }}>
                  {['Créez votre boutique en ligne en quelques clics','Ajoutez vos produits avec photos et descriptions','Personnalisez les couleurs et l\'apparence','Configurez vos modes de paiement','Recevez les commandes directement'].map((item, i) => (
                    <li key={i} style={{ padding:'8px 0',display:'flex',gap:'8px' }}><span>✅</span><span>{item}</span></li>
                  ))}
                </ul>
              </div>
              <div style={{ background:'var(--bg-secondary)',padding:'24px',borderRadius:'16px',marginBottom:'24px',border:'2px solid var(--border-color)' }}>
                <h3 style={{ fontSize:'1.2rem',fontWeight:700,marginBottom:'16px',color:'var(--text-primary)' }}>💳 Modes de paiement acceptés</h3>
                <ul style={{ listStyle:'none',padding:0,margin:0,fontSize:'0.95rem',lineHeight:2 }}>
                  {[parametres.paiement?.carte?.actif && parametres.paiement?.carte?.confirme && '💳 Carte bancaire (Visa, Mastercard)',
                    parametres.paiement?.mobile?.mtn?.actif && '📱 MTN Money',
                    parametres.paiement?.mobile?.orange?.actif && '🟠 Orange Money',
                    parametres.paiement?.cash?.actif && parametres.paiement?.cash?.confirme && '💵 Paiement à la livraison (Espèces)']
                    .filter(Boolean).map((p, i) => <li key={i} style={{ marginBottom:'8px' }}>{p}</li>)}
                </ul>
              </div>
              <div style={{ background:'var(--bg-secondary)',padding:'24px',borderRadius:'16px',marginBottom:'24px',border:'2px solid var(--border-color)' }}>
                <h3 style={{ fontSize:'1.2rem',fontWeight:700,marginBottom:'16px' }}>🚚 Informations de livraison</h3>
                <ul style={{ listStyle:'none',padding:0,margin:0,fontSize:'0.9rem' }}>
                  <li style={{ padding:'6px 0',display:'flex',justifyContent:'space-between' }}><span>Douala :</span><strong>{prixFormate(parametres.livraison?.fraisDouala || 1000)}</strong></li>
                  <li style={{ padding:'6px 0',display:'flex',justifyContent:'space-between' }}><span>Autres villes :</span><strong>{prixFormate(parametres.livraison?.fraisAutres || 2500)}</strong></li>
                </ul>
                <p style={{ margin:'12px 0 0',fontSize:'0.9rem',color:'var(--text-secondary)' }}>⏱️ {parametres.livraison?.delai || '2-5 jours ouvrables'}</p>
              </div>
              <div style={{ marginTop:'24px',textAlign:'center' }}>
                <button onClick={() => setModalAPropos(false)} className="btn-primary" style={{ padding:'14px 32px' }}>Compris ! 👍</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL CONTACT ===== */}
      {modalContact && (
        <div className="product-modal active" id="modalContact" onClick={e => { if (e.target === e.currentTarget) setModalContact(false) }}>
          <div className="modal-content">
            <button className="btn-close-modal" onClick={() => setModalContact(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <div className="modal-body" style={{ maxHeight:'80vh',overflowY:'auto' }}>
              <div style={{ textAlign:'center',marginBottom:'32px' }}>
                <div style={{ fontSize:'4rem',marginBottom:'16px' }}>📞</div>
                <h2 style={{ fontSize:'1.5rem',fontWeight:700,marginBottom:'8px' }}>Contactez-nous</h2>
                <p style={{ color:'var(--text-secondary)',fontSize:'0.95rem' }}>Nous sommes là pour vous aider</p>
              </div>
              <div style={{ background:'linear-gradient(135deg,var(--primary-color),var(--primary-dark))',padding:'28px',borderRadius:'16px',marginBottom:'24px',color:'white',textAlign:'center' }}>
                <h3 style={{ fontSize:'1.4rem',fontWeight:700,marginBottom:'12px' }}>{parametres.general?.nom || 'Ma Boutique'}</h3>
                {parametres.general?.description && <p style={{ margin:0,opacity:0.9,fontSize:'0.9rem',lineHeight:1.6 }}>{parametres.general.description}</p>}
              </div>
              <div style={{ display:'flex',flexDirection:'column',gap:'16px',marginBottom:'24px' }}>
                {parametres.general?.telephone && (
                  <div style={{ background:'var(--bg-secondary)',padding:'20px',borderRadius:'12px',border:'2px solid var(--border-color)',display:'flex',alignItems:'center',gap:'16px' }}>
                    <div style={{ width:'48px',height:'48px',background:'linear-gradient(135deg,var(--primary-color),var(--primary-dark))',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'1.5rem' }}>📱</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'0.8rem',color:'var(--text-secondary)',marginBottom:'4px',fontWeight:500 }}>Téléphone</div>
                      <a href={`tel:${parametres.general.telephone.replace(/\s/g,'')}`} style={{ fontSize:'1rem',fontWeight:600,color:'var(--text-primary)',textDecoration:'none' }}>{parametres.general.telephone}</a>
                    </div>
                    <a href={`tel:${parametres.general.telephone.replace(/\s/g,'')}`} style={{ padding:'10px 20px',background:'var(--success-color)',color:'white',borderRadius:'8px',textDecoration:'none',fontWeight:600,fontSize:'0.85rem' }}>Appeler</a>
                  </div>
                )}
                {parametres.general?.email && (
                  <div style={{ background:'var(--bg-secondary)',padding:'20px',borderRadius:'12px',border:'2px solid var(--border-color)',display:'flex',alignItems:'center',gap:'16px' }}>
                    <div style={{ width:'48px',height:'48px',background:'linear-gradient(135deg,var(--primary-color),var(--primary-dark))',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'1.5rem' }}>📧</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'0.8rem',color:'var(--text-secondary)',marginBottom:'4px',fontWeight:500 }}>Email</div>
                      <a href={`mailto:${parametres.general.email}`} style={{ fontSize:'0.95rem',fontWeight:600,color:'var(--text-primary)',textDecoration:'none',wordBreak:'break-all' }}>{parametres.general.email}</a>
                    </div>
                    <a href={`mailto:${parametres.general.email}`} style={{ padding:'10px 20px',background:'var(--primary-color)',color:'white',borderRadius:'8px',textDecoration:'none',fontWeight:600,fontSize:'0.85rem' }}>Écrire</a>
                  </div>
                )}
                {parametres.general?.adresse && (
                  <div style={{ background:'var(--bg-secondary)',padding:'20px',borderRadius:'12px',border:'2px solid var(--border-color)',display:'flex',alignItems:'start',gap:'16px' }}>
                    <div style={{ width:'48px',height:'48px',background:'linear-gradient(135deg,var(--primary-color),var(--primary-dark))',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'1.5rem' }}>📍</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'0.8rem',color:'var(--text-secondary)',marginBottom:'4px',fontWeight:500 }}>Adresse</div>
                      <div style={{ fontSize:'0.95rem',fontWeight:600,color:'var(--text-primary)',lineHeight:1.6 }}>{parametres.general.adresse}</div>
                    </div>
                  </div>
                )}
              </div>
              {parametres.general?.telephone && (
                <div style={{ background:'linear-gradient(135deg,#25D366,#128C7E)',padding:'24px',borderRadius:'16px',textAlign:'center',marginBottom:'24px' }}>
                  <div style={{ fontSize:'3rem',marginBottom:'12px' }}>💬</div>
                  <h4 style={{ color:'white',fontWeight:700,marginBottom:'12px',fontSize:'1.1rem' }}>Contactez-nous sur WhatsApp</h4>
                  <p style={{ color:'rgba(255,255,255,0.9)',marginBottom:'20px',fontSize:'0.85rem' }}>Obtenez une réponse rapide à vos questions</p>
                  <a href={`https://wa.me/${parametres.general.telephone.replace(/\s/g,'')}?text=Bonjour,%20je%20viens%20de%20votre%20boutique%20en%20ligne`} target="_blank" rel="noreferrer"
                    style={{ display:'inline-block',padding:'14px 32px',background:'white',color:'#25D366',borderRadius:'12px',textDecoration:'none',fontWeight:700,fontSize:'1rem' }}>
                    Ouvrir WhatsApp
                  </a>
                </div>
              )}
              <div style={{ marginTop:'24px',textAlign:'center' }}>
                <button onClick={() => setModalContact(false)} className="btn-primary" style={{ padding:'14px 32px' }}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ==================== STYLES GLOBAUX ====================
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
  :root {
    --primary-color: #FF6B00; --primary-dark: #E55D00; --secondary-color: #1A1A1A;
    --accent-color: #FF9A3C; --accent-light: rgba(255,154,60,0.15); --accent-glow: rgba(255,154,60,0.35);
    --bg-primary: #FFFFFF; --bg-secondary: #F8F9FA; --text-primary: #1A1A1A;
    --text-secondary: #6B7280; --border-color: #E5E7EB;
    --success-color: #10B981; --error-color: #EF4444;
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05); --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
    --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
    --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px;
    --transition: 0.3s ease; --font-family: 'Outfit',-apple-system,BlinkMacSystemFont,sans-serif;
    --chat-primary: #007AFF; --chat-shadow: 0 8px 24px rgba(0,0,0,0.15); --chat-shadow-lg: 0 12px 40px rgba(0,0,0,0.2);
    --secondary-lighter: rgba(26,26,26,0.1); --secondary-light: rgba(26,26,26,0.3); --secondary-medium: rgba(26,26,26,0.6);
    --primary-light: rgba(255,107,0,0.1); --primary-glow: rgba(255,107,0,0.22);
  }
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{font-family:var(--font-family);background:var(--bg-secondary);color:var(--text-primary);line-height:1.6;overflow-x:hidden;padding-top:140px;padding-bottom:80px}
  .mobile-header{position:fixed;top:0;left:0;right:0;background:var(--bg-primary);box-shadow:var(--shadow-md);z-index:1000;padding:12px 16px}
  .header-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
  .btn-menu,.btn-cart{width:44px;height:44px;border-radius:var(--radius-md);border:none;background:var(--bg-secondary);color:var(--text-primary);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:var(--transition)}
  .btn-menu:active,.btn-cart:active{transform:scale(0.95);background:var(--border-color)}
  .logo-container{display:flex;align-items:center;gap:10px;flex:1;justify-content:center}
  .logo-image{width:36px;height:36px;border-radius:50%;object-fit:cover}
  .shop-name{font-size:1.1rem;font-weight:800;color:var(--primary-color);animation:shimmer 4s ease infinite;background-size:200% 200%!important}
  .btn-cart{position:relative}
  .cart-badge{position:absolute;top:-4px;right:-4px;background:var(--error-color);color:white;font-size:0.7rem;font-weight:700;padding:2px 6px;border-radius:10px;min-width:18px;text-align:center;display:flex;align-items:center;justify-content:center;background:linear-gradient(-45deg,var(--primary-color),var(--secondary-color),var(--primary-color))!important;background-size:300% 300%!important;animation:gradientShift 3s ease infinite,pulse 2s ease infinite!important}
  .search-bar{display:flex;align-items:center;gap:10px;background:var(--bg-secondary);padding:10px 16px;border-radius:var(--radius-lg);border:2px solid var(--border-color);transition:var(--transition)}
  .search-bar:focus-within{border-color:var(--primary-color);background:var(--bg-primary);animation:glow 2s ease infinite}
  .search-bar svg{color:var(--text-secondary);flex-shrink:0}
  .search-bar input{flex:1;border:none;background:transparent;font-size:0.95rem;font-family:var(--font-family);color:var(--text-primary);outline:none}
  .search-bar input::placeholder{color:var(--text-secondary)}
  .side-menu{position:fixed;top:0;left:-100%;width:85%;max-width:320px;height:100vh;background:var(--bg-primary);box-shadow:var(--shadow-lg);z-index:2000;transition:left 0.3s ease;overflow-y:auto;-webkit-overflow-scrolling:touch}
  .side-menu.active{left:0}
  .menu-header{display:flex;justify-content:space-between;align-items:center;padding:20px;border-bottom:1px solid var(--border-color);background:var(--primary-color);color:white;position:relative;overflow:hidden}
  .menu-header::after{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle,var(--primary-color) 0%,transparent 70%);animation:rotate 15s linear infinite;opacity:0.2}
  .menu-header h2{font-size:1.25rem;font-weight:700}
  .btn-close{width:40px;height:40px;border-radius:50%;border:none;background:rgba(255,255,255,0.2);color:white;display:flex;align-items:center;justify-content:center;cursor:pointer}
  .menu-content{padding:20px}
  .menu-section{margin-bottom:32px}
  .menu-section h3{font-size:0.85rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px}
  .category-list{display:flex;flex-direction:column;gap:8px}
  .category-item{padding:12px 16px;background:var(--bg-secondary);border-radius:var(--radius-md);font-weight:500;cursor:pointer;transition:all 0.3s ease;border:2px solid transparent;position:relative}
  .category-item::before{content:'';position:absolute;left:0;top:0;height:100%;width:0;background:linear-gradient(90deg,var(--primary-color),var(--secondary-color));transition:width 0.3s ease;border-radius:var(--radius-md);z-index:-1}
  .category-item:hover::before{width:100%}
  .category-item:hover{color:white;transform:translateX(5px)}
  .category-item:active{transform:scale(0.98);border-color:var(--primary-color)}
  .menu-link{display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--bg-secondary);border-radius:var(--radius-md);text-decoration:none;color:var(--text-primary);font-weight:500;margin-bottom:8px;transition:var(--transition)}
  .menu-link:hover{background:linear-gradient(90deg,var(--primary-light),var(--secondary-light))!important;border-left:4px solid var(--primary-color);padding-left:12px}
  .menu-link:active{transform:scale(0.98);background:var(--border-color)}
  .overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);z-index:1500;opacity:0;visibility:hidden;transition:all 0.3s ease}
  .overlay.active{opacity:1;visibility:visible}
  .main-content{max-width:100%;padding:0 16px}
  .hero-section{margin-bottom:24px;background:linear-gradient(135deg,var(--primary-color),var(--primary-dark));padding:32px 24px;border-radius:var(--radius-lg);color:white;text-align:center;position:relative;overflow:hidden}
  .hero-section::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle,var(--secondary-color) 0%,transparent 70%);animation:rotate 20s linear infinite;opacity:0.3;pointer-events:none}
  .hero-title{font-size:1.5rem;font-weight:800;margin-bottom:8px;position:relative;z-index:1}
  .hero-subtitle{font-size:0.95rem;opacity:0.9;position:relative;z-index:1}
  .filters-section{display:flex;gap:12px;margin-bottom:24px;overflow-x:auto;padding-bottom:8px;-webkit-overflow-scrolling:touch}
  .filters-section::-webkit-scrollbar{display:none}
  .filter-chips{display:flex;gap:8px;flex:1;overflow-x:auto;-webkit-overflow-scrolling:touch}
  .filter-chips::-webkit-scrollbar{display:none}
  .chip{padding:8px 16px;background:var(--bg-primary);border:2px solid var(--border-color);border-radius:20px;font-size:0.85rem;font-weight:600;white-space:nowrap;cursor:pointer;transition:all 0.3s ease;position:relative;overflow:hidden}
  .chip::before{content:'';position:absolute;top:50%;left:50%;width:0;height:0;border-radius:50%;background:radial-gradient(circle,var(--secondary-color),var(--primary-color));transform:translate(-50%,-50%);transition:width 0.5s ease,height 0.5s ease}
  .chip:hover::before{width:300px;height:300px}
  .chip.active{background:var(--primary-color);color:white;border-color:var(--primary-color);background-size:200% 200%!important;animation:shimmer 3s ease infinite}
  .filter-select{padding:8px 16px;background:var(--bg-primary);border:2px solid var(--border-color);border-radius:var(--radius-md);font-size:0.85rem;font-weight:600;font-family:var(--font-family);cursor:pointer;min-width:140px}
  .products-section{margin-bottom:24px}
  .products-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
  .product-card{background:var(--bg-primary);border-radius:var(--radius-md);overflow:hidden;box-shadow:var(--shadow-sm);transition:all 0.3s ease;cursor:pointer;position:relative;will-change:transform,opacity}
  .product-card::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,var(--primary-color),var(--secondary-color));opacity:0;transition:opacity 0.3s ease;border-radius:var(--radius-md);z-index:-1}
  .product-card:hover::before{opacity:0.1}
  .product-card:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 12px 30px rgba(0,0,0,0.15),0 0 20px var(--primary-light),0 0 30px var(--accent-light)}
  .product-card:active{transform:scale(0.98)}
  .product-image-container{position:relative;width:100%;padding-top:100%;background:var(--bg-secondary);overflow:hidden}
  .product-image{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover}
  .product-badge{position:absolute;top:8px;right:8px;background:var(--error-color);color:white;font-size:0.7rem;font-weight:700;padding:4px 8px;border-radius:12px;animation:glow 2s ease infinite,pulse 2s ease infinite}
  .promo-badge{position:absolute;top:8px;left:8px;background:linear-gradient(135deg,var(--accent-color),var(--primary-color));color:white;font-size:0.72rem;font-weight:800;padding:4px 10px;border-radius:20px;letter-spacing:0.03em;box-shadow:0 2px 10px var(--accent-glow);animation:promoPop 0.4s cubic-bezier(.34,1.56,.64,1),promoShimmer 3s ease 0.4s infinite;z-index:5}
  .promo-badge-modal{display:inline-flex;align-items:center;background:linear-gradient(135deg,var(--accent-color),var(--primary-color));color:white;font-size:0.8rem;font-weight:800;padding:4px 12px;border-radius:20px;letter-spacing:0.03em;box-shadow:0 2px 12px var(--accent-glow);animation:promoPop 0.4s cubic-bezier(.34,1.56,.64,1)}
  @keyframes promoPop{0%{transform:scale(0) rotate(-10deg);opacity:0}60%{transform:scale(1.15) rotate(2deg)}100%{transform:scale(1) rotate(0deg);opacity:1}}
  @keyframes promoShimmer{0%,100%{box-shadow:0 2px 10px var(--accent-glow)}50%{box-shadow:0 4px 20px var(--accent-glow),0 0 0 3px var(--accent-light)}}
  .product-price-block{margin-bottom:8px;display:flex;flex-direction:column;gap:2px}
  .product-price-promo{font-size:1.1rem;font-weight:800;color:var(--accent-color);text-shadow:0 1px 4px var(--accent-light);background:linear-gradient(135deg,var(--accent-color),var(--primary-color));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background-size:200% 200%;animation:shimmer 3s ease infinite;display:inline-block}
  .product-price-original{font-size:0.82rem;color:var(--text-secondary);text-decoration:line-through;font-weight:500;opacity:0.8}
  .product-info{padding:12px}
  .product-name{font-size:0.9rem;font-weight:600;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .product-price{font-size:1.1rem;font-weight:800;color:var(--primary-color);margin-bottom:8px;background:linear-gradient(135deg,var(--primary-color),var(--secondary-color));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background-size:200% 200%;animation:shimmer 3s ease infinite;display:inline-block}
  .product-stock{font-size:0.75rem;color:var(--text-secondary);margin-bottom:8px}
  .btn-add-cart{width:100%;padding:10px;background:var(--primary-color);color:white;border:none;border-radius:var(--radius-md);font-weight:600;font-size:0.85rem;cursor:pointer;transition:var(--transition);display:flex;align-items:center;justify-content:center;gap:6px}
  .btn-add-cart:active{transform:scale(0.95);background:var(--primary-dark)}
  .btn-mention-chat{position:absolute;top:12px;left:12px;width:40px;height:40px;background:linear-gradient(135deg,#25D366,#128C7E);color:white;border:none;border-radius:50%;font-size:1.3rem;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(37,211,102,0.4);transition:all 0.3s ease;z-index:10;opacity:0;transform:scale(0.8);animation:fadeInScale 0.3s ease 0.2s forwards}
  @keyframes fadeInScale{to{opacity:1;transform:scale(1)}}
  .btn-mention-chat::before{content:'';position:absolute;top:50%;left:50%;width:100%;height:100%;border-radius:50%;background:rgba(37,211,102,0.4);transform:translate(-50%,-50%) scale(1);animation:pulseMention 2s infinite;z-index:-1}
  @keyframes pulseMention{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.8}50%{transform:translate(-50%,-50%) scale(1.3);opacity:0}}
  .product-card:hover .btn-mention-chat{transform:scale(1.1);box-shadow:0 6px 18px rgba(37,211,102,0.6)}
  .empty-state{text-align:center;padding:60px 20px;color:var(--text-secondary);display:flex;flex-direction:column;align-items:center;gap:16px}
  .empty-state svg{opacity:0.3}
  .empty-state h3{font-size:1.1rem;font-weight:600}
  .cart-panel{position:fixed;top:0;right:-100%;width:90%;max-width:400px;height:100vh;background:var(--bg-primary);box-shadow:var(--shadow-lg);z-index:2000;transition:right 0.3s ease;display:flex;flex-direction:column}
  .cart-panel.active{right:0}
  .cart-header{display:flex;justify-content:space-between;align-items:center;padding:20px;border-bottom:1px solid var(--border-color)}
  .cart-header h2{font-size:1.25rem;font-weight:700}
  .cart-content{flex:1;overflow-y:auto;padding:16px}
  .cart-item{display:flex;gap:12px;background:var(--bg-secondary);padding:12px;border-radius:var(--radius-md);margin-bottom:12px}
  .cart-item-image{width:70px;height:70px;border-radius:var(--radius-sm);object-fit:cover;flex-shrink:0}
  .cart-item-info{flex:1;min-width:0}
  .cart-item-name{font-size:0.9rem;font-weight:600;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .cart-item-price{font-size:0.95rem;font-weight:700;color:var(--primary-color);margin-bottom:8px}
  .cart-item-controls{display:flex;align-items:center;gap:8px}
  .btn-qty{width:28px;height:28px;border-radius:50%;border:none;background:var(--bg-primary);color:var(--text-primary);font-weight:700;cursor:pointer;transition:var(--transition)}
  .btn-qty:active{transform:scale(0.9);background:var(--border-color)}
  .item-qty{font-weight:600;min-width:24px;text-align:center}
  .btn-remove{margin-left:auto;color:var(--error-color);background:none;border:none;cursor:pointer;padding:4px}
  .cart-footer{padding:20px;border-top:1px solid var(--border-color)}
  .cart-total{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;font-size:1.1rem;font-weight:700}
  .total-amount{color:var(--primary-color);font-size:1.3rem;background:linear-gradient(-45deg,var(--primary-color),var(--secondary-color),var(--primary-color));background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gradientShift 4s ease infinite;font-weight:900}
  .btn-checkout{width:100%;padding:16px;background:var(--primary-color);color:white;border:none;border-radius:var(--radius-md);font-weight:700;font-size:1rem;cursor:pointer;transition:var(--transition);display:flex;align-items:center;justify-content:center;gap:8px;position:relative;overflow:hidden;background:linear-gradient(-45deg,var(--primary-color),var(--secondary-color),var(--primary-color))!important;background-size:300% 300%!important;animation:gradientShift 3s ease infinite}
  .btn-checkout::before{content:'';position:absolute;top:50%;left:50%;width:0;height:0;border-radius:50%;background:rgba(255,255,255,0.3);transform:translate(-50%,-50%);transition:width 0.6s ease,height 0.6s ease}
  .btn-checkout:hover::before{width:300px;height:300px}
  .btn-checkout:active{transform:scale(0.98);background:var(--primary-dark)}
  .product-modal,.checkout-modal{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:3000;display:none;align-items:flex-end;justify-content:center}
  .product-modal.active,.checkout-modal.active{display:flex}
  .modal-content{background:var(--bg-primary);width:100%;max-height:90vh;border-radius:var(--radius-lg) var(--radius-lg) 0 0;overflow-y:auto;animation:slideUp 0.3s ease;position:relative}
  @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
  .btn-close-modal{position:absolute;top:16px;right:16px;width:40px;height:40px;border-radius:50%;border:none;background:rgba(0,0,0,0.5);color:white;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10}
  .modal-body{padding:20px}
  .whatsapp-btn{position:fixed;bottom:24px;right:24px;width:60px;height:60px;background:#25D366;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(37,211,102,0.4);z-index:999;transition:var(--transition)}
  .whatsapp-btn:active{transform:scale(0.9)}
  .whatsapp-btn:hover{animation:pulse 1s ease infinite;box-shadow:0 8px 25px rgba(37,211,102,0.6)}
  .chat-toggle-btn{position:fixed;bottom:110px;right:24px;width:60px;height:60px;background:linear-gradient(-45deg,var(--primary-color),var(--secondary-color),var(--primary-color))!important;background-size:300% 300%!important;animation:gradientShift 5s ease infinite,chatPulse 2s infinite;color:white;border-radius:50%;border:none;box-shadow:var(--chat-shadow);cursor:pointer;z-index:2000;display:flex;align-items:center;justify-content:center;transition:all 0.3s cubic-bezier(0.4,0,0.2,1)}
  .chat-toggle-btn:hover{transform:scale(1.1);box-shadow:var(--chat-shadow-lg)}
  .chat-toggle-btn:active{transform:scale(0.95)}
  @keyframes chatPulse{0%,100%{box-shadow:var(--chat-shadow),0 0 0 0 rgba(255,107,0,0.4)}50%{box-shadow:var(--chat-shadow),0 0 0 15px rgba(255,107,0,0)}}
  .chat-badge{position:absolute;top:-4px;right:-4px;background:#FF3B30;color:white;font-size:0.7rem;padding:3px 7px;border-radius:12px;font-weight:700;min-width:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.2);animation:badgePop 0.3s ease}
  @keyframes badgePop{0%{transform:scale(0)}50%{transform:scale(1.2)}100%{transform:scale(1)}}
  .chat-window{position:fixed;bottom:100px;right:26px;width:380px;height:550px;background:white;border-radius:20px;box-shadow:var(--chat-shadow-lg);z-index:2001;display:none;flex-direction:column;overflow:hidden;animation:slideUpChat 0.4s cubic-bezier(0.4,0,0.2,1)}
  .chat-window.active{display:flex}
  @keyframes slideUpChat{from{opacity:0;transform:translateY(30px) scale(0.9)}to{opacity:1;transform:translateY(0) scale(1)}}
  .chat-header{background:linear-gradient(135deg,var(--primary-color),var(--primary-dark));color:white;padding:20px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
  .chat-header-info{display:flex;align-items:center;gap:12px}
  .chat-avatar{width:44px;height:44px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem}
  .chat-header-text{display:flex;flex-direction:column;gap:2px}
  .chat-title{font-weight:600;font-size:1rem}
  .chat-subtitle{font-size:0.8rem;opacity:0.9}
  .chat-close-btn{background:rgba(255,255,255,0.2);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:1.8rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.3s ease;line-height:1}
  .chat-close-btn:hover{background:rgba(255,255,255,0.3);transform:rotate(90deg)}
  .chat-body{flex:1;display:flex;flex-direction:column;padding:24px;overflow-y:auto;background:linear-gradient(to bottom,#f9f9f9,#ffffff)}
  .chat-welcome{text-align:center;margin-bottom:32px;animation:fadeInUp 0.5s ease}
  .chat-welcome-icon{font-size:4rem;margin-bottom:16px;animation:wave 1s ease infinite}
  @keyframes wave{0%,100%{transform:rotate(0deg)}25%{transform:rotate(20deg)}75%{transform:rotate(-20deg)}}
  .chat-welcome-title{font-size:1.5rem;font-weight:700;color:var(--text-primary);margin-bottom:8px}
  .chat-welcome-text{color:var(--text-secondary);font-size:0.95rem;line-height:1.5}
  .chat-login-form{display:flex;flex-direction:column;gap:16px}
  .chat-input-field{width:100%;padding:14px 18px;border:2px solid #E5E7EB;border-radius:12px;font-size:0.95rem;font-family:inherit;transition:all 0.3s ease;background:white}
  .chat-input-field:focus{outline:none;border-color:var(--primary-color);box-shadow:0 0 0 4px rgba(255,107,0,0.1)}
  .chat-submit-btn{width:100%;padding:14px 24px;background:linear-gradient(135deg,var(--primary-color),var(--primary-dark));color:white;border:none;border-radius:12px;font-weight:600;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.3s ease;font-family:inherit}
  .chat-submit-btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(255,107,0,0.3)}
  .chat-messages-screen{padding:0;background:#f5f5f7}
  .chat-messages-list{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}
  .chat-messages-list::-webkit-scrollbar{width:6px}
  .chat-messages-list::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.2);border-radius:10px}
  .c-message{max-width:75%;padding:10px 14px;border-radius:18px;font-size:0.9rem;word-wrap:break-word;line-height:1.4;animation:messageSlideIn 0.3s ease;position:relative}
  @keyframes messageSlideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  .c-message.client{align-self:flex-end;background:linear-gradient(135deg,#007AFF,#5AC8FA);color:white;border-bottom-right-radius:4px;box-shadow:0 2px 8px rgba(0,122,255,0.3)}
  .c-message.admin{align-self:flex-start;background:white;color:#1A1A1A;border-bottom-left-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.08);border:1px solid #E5E7EB}
  .c-message-time{font-size:0.7rem;opacity:0.7;margin-top:4px;display:block}
  .chat-input-area{display:flex;gap:8px;padding:16px 20px;border-top:1px solid #E5E7EB;background:white;align-items:center}
  .chat-message-input{flex:1;padding:12px 16px;border:2px solid #E5E7EB;border-radius:24px;font-size:0.9rem;font-family:inherit;transition:all 0.3s ease;background:#f9f9f9}
  .chat-message-input:focus{outline:none;border-color:var(--primary-color);background:white;box-shadow:0 0 0 3px rgba(255,107,0,0.1)}
  .chat-send-btn{width:40px;height:40px;background:linear-gradient(135deg,var(--primary-color),var(--primary-dark));color:white;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.3s ease;flex-shrink:0}
  .chat-send-btn:hover{transform:scale(1.1);box-shadow:0 4px 12px rgba(255,107,0,0.4)}
  .chat-send-btn:disabled{opacity:0.4;cursor:not-allowed;transform:none}
  .chat-empty-state{text-align:center;color:var(--text-secondary);padding:40px 20px;animation:fadeIn 0.5s ease}
  .chat-empty-state svg{width:80px;height:80px;opacity:0.3;margin-bottom:16px}
  .checkout-header-new{text-align:center;padding:40px 24px 32px;background:linear-gradient(135deg,rgba(255,107,0,0.05),rgba(255,107,0,0.1));border-radius:20px 20px 0 0;margin:-20px -20px 24px}
  .checkout-icon{font-size:4rem;margin-bottom:16px;animation:bounceIn 0.8s ease}
  @keyframes bounceIn{0%{transform:scale(0);opacity:0}50%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
  .checkout-title{font-size:1.5rem;font-weight:800;color:var(--text-primary);margin-bottom:8px}
  .checkout-subtitle{font-size:0.9rem;color:var(--text-secondary);line-height:1.5}
  .form-section-new{background:white;border:2px solid var(--border-color);border-radius:16px;padding:24px;margin-bottom:20px;transition:all 0.3s ease;animation:slideInForm 0.5s ease backwards}
  .form-section-new:hover{border-color:var(--primary-color);box-shadow:0 4px 12px rgba(255,107,0,0.1)}
  .form-section-new:nth-child(1){animation-delay:0.1s}
  .form-section-new:nth-child(2){animation-delay:0.2s}
  @keyframes slideInForm{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  .section-header{display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid var(--bg-secondary)}
  .section-icon{font-size:1.5rem}
  .section-header h3{font-size:1.1rem;font-weight:700;color:var(--text-primary);margin:0}
  .form-row{margin-bottom:20px}
  .form-group-new{position:relative}
  .form-label-new{display:flex;align-items:center;gap:4px;margin-bottom:8px;font-size:0.9rem;font-weight:600;color:var(--text-primary)}
  .label-text{flex:1}
  .label-required{color:var(--error-color);font-size:1.1rem}
  .form-input-new{width:100%;padding:14px 16px;border:2px solid var(--border-color);border-radius:12px;font-size:0.95rem;font-family:inherit;transition:all 0.3s ease;background:white;color:var(--text-primary)}
  .form-input-new:focus{outline:none;border-color:var(--primary-color);box-shadow:0 0 0 4px rgba(255,107,0,0.1);transform:translateY(-2px)}
  select.form-input-new{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23FF6B00' d='M8 11L3 6h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:40px}
  textarea.form-input-new{resize:vertical;min-height:80px}
  .order-summary-new{background:linear-gradient(135deg,rgba(255,107,0,0.05),rgba(255,107,0,0.1));border:2px solid rgba(255,107,0,0.2);border-radius:16px;padding:24px;margin-bottom:24px;animation:slideInForm 0.5s ease 0.3s backwards;position:relative}
  .order-summary-new::before{content:'';position:absolute;top:-2px;left:-2px;right:-2px;bottom:-2px;background:linear-gradient(135deg,var(--primary-color),var(--secondary-color));border-radius:16px;z-index:-1}
  .summary-header{display:flex;align-items:center;gap:12px;margin-bottom:20px}
  .summary-icon{font-size:1.5rem}
  .summary-header h3{font-size:1.1rem;font-weight:700;color:var(--text-primary);margin:0}
  .summary-items{margin-bottom:16px}
  .summary-item{display:flex;justify-content:space-between;align-items:center;padding:12px;background:white;border-radius:8px;margin-bottom:8px;font-size:0.85rem}
  .item-info{display:flex;align-items:center;gap:8px;flex:1}
  .item-qty{display:flex;align-items:center;justify-content:center;width:24px;height:24px;background:var(--primary-color);color:white;border-radius:50%;font-weight:700;font-size:0.75rem}
  .item-name{font-weight:500;color:var(--text-primary)}
  .item-price{font-weight:700;color:var(--primary-color)}
  .summary-divider{height:2px;background:rgba(255,107,0,0.2);margin:16px 0}
  .summary-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;font-size:0.95rem}
  .summary-label{color:var(--text-secondary);font-weight:500;display:flex;flex-direction:column;gap:4px}
  .summary-value{font-weight:600;color:var(--text-primary)}
  .delivery-city{font-size:0.8rem;color:var(--primary-color);font-weight:600}
  .total-row{margin-top:8px}
  .summary-label.total-row,.total-row .summary-label{font-size:1rem;font-weight:700;color:var(--text-primary)}
  .summary-total{font-size:1.3rem;font-weight:900;color:var(--primary-color)}
  .form-actions{margin-top:24px}
  .btn-submit-new{width:100%;padding:18px 24px;background:linear-gradient(135deg,var(--primary-color),var(--primary-dark));color:white;border:none;border-radius:16px;font-weight:700;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:12px;transition:all 0.3s ease;font-family:inherit;position:relative;overflow:hidden}
  .btn-submit-new::before{content:'';position:absolute;top:50%;left:50%;width:0;height:0;border-radius:50%;background:rgba(255,255,255,0.3);transform:translate(-50%,-50%);transition:width 0.6s ease,height 0.6s ease}
  .btn-submit-new:hover::before{width:300px;height:300px}
  .btn-submit-new:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(255,107,0,0.4)}
  .btn-submit-new:disabled{opacity:0.6;cursor:not-allowed;transform:none}
  .btn-text{position:relative;z-index:1}
  .btn-primary{background:var(--primary-color);color:white;border:none;border-radius:12px;font-weight:700;font-size:1rem;cursor:pointer;padding:12px 24px;transition:var(--transition)}
  @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  @keyframes shimmer{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  @keyframes pulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,107,0,0.7)}50%{transform:scale(1.05);box-shadow:0 0 0 10px rgba(255,107,0,0)}}
  @keyframes rotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes glow{0%,100%{box-shadow:0 0 5px var(--primary-color),0 0 10px var(--primary-color),0 0 15px var(--secondary-color)}50%{box-shadow:0 0 10px var(--primary-color),0 0 20px var(--primary-color),0 0 30px var(--secondary-color)}}
  @keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideInLeft{from{opacity:0;transform:translateX(-40px) translateY(20px) scale(0.95)}to{opacity:1;transform:translateX(0) translateY(0) scale(1)}}
  @keyframes slideInRight{from{opacity:0;transform:translateX(40px) translateY(20px) scale(0.95)}to{opacity:1;transform:translateX(0) translateY(0) scale(1)}}
  @media(min-width:640px){.products-grid{grid-template-columns:repeat(3,1fr);gap:16px}.side-menu{max-width:400px}}
  @media(min-width:768px){.products-grid{grid-template-columns:repeat(4,1fr)}.modal-content{max-width:600px;border-radius:var(--radius-lg);max-height:80vh}.product-modal,.checkout-modal{align-items:center}}
  @media(max-width:480px){.chat-window{width:100%;height:100vh;height:100dvh;top:0;left:0;bottom:0;right:0;border-radius:0;z-index:3000}.chat-toggle-btn{bottom:90px;right:20px;width:56px;height:56px}.c-message{max-width:85%}}
  @media(max-width:768px){.hero-section::before,.menu-header::after{animation-duration:30s}.product-card:hover{transform:translateY(-4px) scale(1.01)}}
  @media(prefers-reduced-motion:reduce){*{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important}}

  /* ══════════════════════════════════════
     LOADER PROFESSIONNEL
  ══════════════════════════════════════ */
  .loader-screen{
    position:fixed;inset:0;z-index:9999;
    display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,
      #0f0f1a 0%,
      #1a0a00 35%,
      #0a0a1a 65%,
      #0f0f1a 100%);
    background-size:400% 400%;
    animation:loaderBgShift 6s ease infinite;
    overflow:hidden;
  }
  @keyframes loaderBgShift{
    0%{background-position:0% 50%}
    50%{background-position:100% 50%}
    100%{background-position:0% 50%}
  }

  /* ── Particules flottantes ── */
  .loader-particles{position:absolute;inset:0;pointer-events:none;overflow:hidden}
  .loader-particle{
    position:absolute;border-radius:50%;
    background:radial-gradient(circle,var(--accent-color),transparent);
    opacity:0;animation:loaderFloat linear infinite;
  }
  .loader-particle-1{width:120px;height:120px;left:10%;top:20%;animation-duration:8s;animation-delay:0s}
  .loader-particle-2{width:80px;height:80px;right:15%;top:10%;animation-duration:10s;animation-delay:-2s}
  .loader-particle-3{width:160px;height:160px;left:60%;bottom:15%;animation-duration:12s;animation-delay:-4s}
  .loader-particle-4{width:60px;height:60px;left:30%;bottom:25%;animation-duration:7s;animation-delay:-1s}
  .loader-particle-5{width:100px;height:100px;right:5%;bottom:40%;animation-duration:9s;animation-delay:-3s}
  .loader-particle-6{width:50px;height:50px;left:5%;top:60%;animation-duration:11s;animation-delay:-5s}
  @keyframes loaderFloat{
    0%{opacity:0;transform:translateY(0) scale(0.8)}
    20%{opacity:0.12}
    80%{opacity:0.06}
    100%{opacity:0;transform:translateY(-80px) scale(1.2)}
  }

  /* ── Centre ── */
  .loader-center{
    position:relative;z-index:1;
    display:flex;flex-direction:column;
    align-items:center;gap:20px;
    animation:loaderEnter 0.7s cubic-bezier(.34,1.56,.64,1);
    text-align:center;padding:0 32px;
  }
  @keyframes loaderEnter{
    from{opacity:0;transform:translateY(24px) scale(0.92)}
    to{opacity:1;transform:none}
  }

  /* ── Icône panier ── */
  .loader-icon-wrap{
    position:relative;
    width:100px;height:100px;
    display:flex;align-items:center;justify-content:center;
    margin-bottom:4px;
  }
  .loader-icon-ring{
    position:absolute;inset:0;border-radius:50%;
    border:2px solid transparent;
    border-top-color:var(--primary-color);
    border-right-color:var(--accent-color);
    animation:loaderRingSpin 1.4s cubic-bezier(.4,0,.2,1) infinite;
  }
  .loader-icon-ring-2{
    inset:10px;border-width:1.5px;
    border-top-color:var(--accent-color);
    border-right-color:transparent;
    border-bottom-color:var(--primary-color);
    animation-duration:2s;animation-direction:reverse;
  }
  @keyframes loaderRingSpin{to{transform:rotate(360deg)}}

  .loader-cart-bubble{
    width:64px;height:64px;border-radius:20px;
    background:linear-gradient(145deg,var(--primary-color),var(--accent-color));
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 8px 28px var(--primary-glow),0 2px 8px rgba(0,0,0,0.3);
    animation:loaderCartBounce 1.6s cubic-bezier(.34,1.56,.64,1) infinite;
  }
  @keyframes loaderCartBounce{
    0%,100%{transform:translateY(0) scale(1)}
    45%{transform:translateY(-7px) scale(1.07)}
    65%{transform:translateY(-2px) scale(0.97)}
  }

  /* ── Textes ── */
  .loader-shop-name{
    font-size:1.65rem;font-weight:800;letter-spacing:-0.02em;
    color:#ffffff;
    text-shadow:0 2px 20px var(--primary-glow);
    animation:loaderFadeUp 0.6s ease 0.3s both;
    line-height:1.2;min-height:2rem;display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center;
  }
  .loader-name-shimmer{
    display:inline-block;width:180px;height:1.65rem;border-radius:8px;
    background:linear-gradient(90deg,rgba(255,255,255,0.06) 25%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0.06) 75%);
    background-size:400% 100%;
    animation:loaderShimmerSlide 1.4s ease infinite;
  }
  @keyframes loaderShimmerSlide{
    0%{background-position:100% 0}
    100%{background-position:-100% 0}
  }
  .loader-tagline{
    font-size:0.88rem;font-weight:400;
    color:rgba(255,255,255,0.5);letter-spacing:0.02em;
    animation:loaderFadeUp 0.6s ease 0.45s both;
    max-width:260px;line-height:1.5;
  }
  @keyframes loaderFadeUp{
    from{opacity:0;transform:translateY(10px)}
    to{opacity:1;transform:none}
  }

  /* ── Barre de progression ── */
  .loader-bar-wrap{
    width:220px;
    animation:loaderFadeUp 0.5s ease 0.6s both;
  }
  .loader-bar-track{
    height:3px;border-radius:99px;
    background:rgba(255,255,255,0.1);
    overflow:visible;position:relative;
  }
  .loader-bar-fill{
    height:100%;border-radius:99px;
    background:linear-gradient(90deg,var(--primary-color),var(--accent-color),var(--primary-color));
    background-size:200% 100%;
    animation:loaderBarSlide 2s ease infinite;
    box-shadow:0 0 8px var(--primary-glow);
  }
  .loader-bar-glow{
    position:absolute;top:50%;left:0;
    width:40px;height:12px;
    background:radial-gradient(ellipse,var(--accent-color) 0%,transparent 70%);
    transform:translateY(-50%);
    animation:loaderGlowSlide 2s ease infinite;
    pointer-events:none;
  }
  @keyframes loaderBarSlide{
    0%{width:0%;background-position:0%}
    50%{width:100%;background-position:100%}
    100%{width:100%;opacity:0}
  }
  @keyframes loaderGlowSlide{
    0%{left:0%;opacity:0}
    20%{opacity:1}
    80%{opacity:0.6}
    100%{left:calc(100% - 40px);opacity:0}
  }

  /* ── Statut + dots ── */
  .loader-status{
    font-size:0.8rem;color:rgba(255,255,255,0.4);
    letter-spacing:0.04em;font-weight:500;
    animation:loaderFadeUp 0.5s ease 0.7s both;
    min-height:18px;
  }
  .loader-dots{display:flex;gap:6px;animation:loaderFadeUp 0.5s ease 0.8s both}
  .loader-dot{
    width:5px;height:5px;border-radius:50%;
    background:var(--accent-color);
    animation:loaderDotPulse 1.1s ease infinite;
  }
  @keyframes loaderDotPulse{
    0%,100%{opacity:0.25;transform:scale(0.8)}
    50%{opacity:1;transform:scale(1.3)}
  }
`