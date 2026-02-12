// ==================== SYSTÈME DE TRADUCTION UNIVERSEL ====================

class UniversalTranslationManager {
    constructor() {
        this.currentLanguage = this.loadLanguagePreference();
        this.translations = {
            fr: {
                // Traductions complètes (même dictionnaire que précédemment)
                // ... (gardez toutes les traductions précédentes)
            },
            en: {
                // ... (gardez toutes les traductions anglaises)
            }
        };
        
        // Dictionnaire de traduction automatique texte-à-texte
        this.autoTranslations = {
            // Header & Navigation
            'Menu': { en: 'Menu' },
            'Rechercher des produits, boutiques...': { en: 'Search for products, shops...' },
            'Favoris': { en: 'Favorites' },
            'Paramètres': { en: 'Settings' },
            'Notifications': { en: 'Notifications' },
            
            // Produits
            'Tous les produits': { en: 'All products' },
            'produits': { en: 'products' },
            'Aucun produit trouvé': { en: 'No products found' },
            'Revenez plus tard pour découvrir nos nouveaux produits': { 
                en: 'Come back later to discover our new products' 
            },
            'Plus que': { en: 'Only' },
            'en stock !': { en: 'left in stock!' },
            'Boutique': { en: 'Shop' },
            'likes': { en: 'likes' },
            'commentaires': { en: 'comments' },
            
            // Menu latéral
            'Catégories': { en: 'Categories' },
            'Tous': { en: 'All' },
            'Navigation': { en: 'Navigation' },
            'Accueil': { en: 'Home' },
            'Mes Favoris': { en: 'My Favorites' },
            'Boutiques': { en: 'Shops' },
            'Informations': { en: 'Information' },
            'À propos': { en: 'About' },
            'Contact': { en: 'Contact' },
            'Aide': { en: 'Help' },
            
            // Bannière
            'Découvrez nos produits populaires': { en: 'Discover our popular products' },
            'favoris': { en: 'favorites' },
            'boutique': { en: 'shop' },
            
            // Commentaires
            'Commentaires': { en: 'Comments' },
            'Likes': { en: 'Likes' },
            'Note moyenne': { en: 'Average rating' },
            'Ajouter un commentaire': { en: 'Add a comment' },
            'Note :': { en: 'Rating:' },
            'Partagez votre avis...': { en: 'Share your opinion...' },
            'Publier le commentaire': { en: 'Post comment' },
            'Tous les commentaires': { en: 'All comments' },
            'Aucun commentaire': { en: 'No comments' },
            'Soyez le premier à donner votre avis !': { 
                en: 'Be the first to share your opinion!' 
            },
            
            // Paramètres
            'Profil utilisateur': { en: 'User profile' },
            "Nom d'utilisateur": { en: 'Username' },
            'Modifiable': { en: 'Modifiable' },
            'Modifier': { en: 'Modify' },
            'Changement de nom autorisé tous les 3 mois': { 
                en: 'Name change allowed every 3 months' 
            },
            
            'Notifications Push': { en: 'Push Notifications' },
            'Statut des notifications': { en: 'Notification status' },
            'Chargement...': { en: 'Loading...' },
            'Activer': { en: 'Activate' },
            'Nouveaux produits': { en: 'New products' },
            'Être notifié des nouveaux produits': { en: 'Be notified of new products' },
            'Promotions': { en: 'Promotions' },
            'Recevoir les offres spéciales': { en: 'Receive special offers' },
            'Nouveaux commentaires': { en: 'New comments' },
            'Sur les produits que vous suivez': { en: 'On products you follow' },
            'Produits populaires': { en: 'Popular products' },
            'Vos favoris qui deviennent populaires': { 
                en: 'Your favorites that become popular' 
            },
            
            'Préférences': { en: 'Preferences' },
            'Langue': { en: 'Language' },
            "Choisir la langue de l'application": { en: 'Choose app language' },
            'Français': { en: 'Français' },
            'English': { en: 'English' },
            'Mode sombre': { en: 'Dark mode' },
            'Activer le thème sombre': { en: 'Enable dark theme' },
            'Sons': { en: 'Sounds' },
            "Activer les sons de l'application": { en: 'Enable app sounds' },
            
            'Données': { en: 'Data' },
            'Effacer toutes mes données': { en: 'Delete all my data' },
            "Cache de l'application": { en: 'App cache' },
            'Taille:': { en: 'Size:' },
            'Âge:': { en: 'Age:' },
            'Statut:': { en: 'Status:' },
            'Forcer le rechargement': { en: 'Force reload' },
            'Vider le cache': { en: 'Clear cache' },
            
            // Loader
            'Chargement des produits...': { en: 'Loading products...' },
            'Vérification du cache...': { en: 'Checking cache...' },
            'Chargement des boutiques...': { en: 'Loading shops...' },
            'Chargement des likes...': { en: 'Loading likes...' },
            'Chargement des commentaires...': { en: 'Loading comments...' },
            'Traitement des données...': { en: 'Processing data...' },
            'Sauvegarde en cache...': { en: 'Saving to cache...' },
            'Chargement terminé !': { en: 'Loading complete!' },
            
            // Toast
            'Ajouté aux favoris': { en: 'Added to favorites' },
            'Retiré des favoris': { en: 'Removed from favorites' },
            'Produit liké !': { en: 'Product liked!' },
            'Like retiré': { en: 'Like removed' },
            'Commentaire ajouté !': { en: 'Comment added!' },
            'Erreur': { en: 'Error' },
            'Succès': { en: 'Success' },
            
            // Dates
            "Aujourd'hui": { en: 'Today' },
            'Hier': { en: 'Yesterday' },
            'Il y a': { en: 'ago' },
            'jours': { en: 'days' },
            'semaines': { en: 'weeks' },
            
            // Cache Status
            'Calcul...': { en: 'Calculating...' },
            'Nouveau': { en: 'New' },
            'Valide ✔': { en: 'Valid ✔' },
            'Expiré ✗': { en: 'Expired ✗' },
            
            // Autres
            'Votre nom': { en: 'Your name' },
            'Non défini': { en: 'Not defined' },
        };
        
        // Observer pour détecter les changements du DOM
        this.observer = null;
        this.translatedNodes = new WeakSet();
    }

    // Charger la préférence de langue
    loadLanguagePreference() {
        const saved = localStorage.getItem('oda_language');
        return saved || 'fr';
    }

    // Sauvegarder la préférence de langue
    saveLanguagePreference(lang) {
        localStorage.setItem('oda_language', lang);
        this.currentLanguage = lang;
    }

    // Traduire un texte
    translate(text) {
        if (!text || typeof text !== 'string') return text;
        
        const trimmed = text.trim();
        
        // Si on est en français, retourner le texte original
        if (this.currentLanguage === 'fr') return text;
        
        // Chercher dans le dictionnaire
        const translation = this.autoTranslations[trimmed];
        if (translation && translation[this.currentLanguage]) {
            return text.replace(trimmed, translation[this.currentLanguage]);
        }
        
        // Chercher des correspondances partielles pour les textes avec variables
        for (const [key, value] of Object.entries(this.autoTranslations)) {
            if (trimmed.includes(key) && value[this.currentLanguage]) {
                return text.replace(key, value[this.currentLanguage]);
            }
        }
        
        return text;
    }

    // Traduire un nœud texte
    translateNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (!this.translatedNodes.has(node)) {
                const originalText = node.textContent;
                const translatedText = this.translate(originalText);
                
                if (translatedText !== originalText) {
                    node.textContent = translatedText;
                    this.translatedNodes.add(node);
                }
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Traduire les attributs placeholder, title, aria-label
            if (node.hasAttribute('placeholder')) {
                const original = node.getAttribute('placeholder');
                node.setAttribute('placeholder', this.translate(original));
            }
            
            if (node.hasAttribute('title')) {
                const original = node.getAttribute('title');
                node.setAttribute('title', this.translate(original));
            }
            
            if (node.hasAttribute('aria-label')) {
                const original = node.getAttribute('aria-label');
                node.setAttribute('aria-label', this.translate(original));
            }
            
            // Traduire les enfants
            node.childNodes.forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    this.translateNode(child);
                }
            });
        }
    }

    // Traduire tout le document
    translatePage() {
        console.log(`🌍 Traduction de la page en ${this.currentLanguage}...`);
        
        // Réinitialiser le cache
        this.translatedNodes = new WeakSet();
        
        // Traduire le body
        this.translateElement(document.body);
        
        console.log('✅ Page traduite');
    }

    // Traduire un élément et ses enfants
    translateElement(element) {
        if (!element) return;
        
        // Ignorer les scripts et styles
        if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
            return;
        }
        
        // Traduire les attributs
        if (element.hasAttribute && element.hasAttribute('placeholder')) {
            const original = element.getAttribute('placeholder');
            element.setAttribute('placeholder', this.translate(original));
        }
        
        if (element.hasAttribute && element.hasAttribute('title')) {
            const original = element.getAttribute('title');
            element.setAttribute('title', this.translate(original));
        }
        
        // Traduire le contenu texte
        Array.from(element.childNodes).forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                const original = child.textContent;
                const translated = this.translate(original);
                if (translated !== original) {
                    child.textContent = translated;
                }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                this.translateElement(child);
            }
        });
    }

    // Changer la langue
    setLanguage(lang) {
        if (lang !== 'fr' && lang !== 'en') {
            console.error(`Langue non supportée: ${lang}`);
            return false;
        }
        
        this.saveLanguagePreference(lang);
        this.translatePage();
        
        // Mettre à jour les boutons de langue
        this.updateLanguageButtons();
        
        return true;
    }

    // Mettre à jour les boutons de langue
    updateLanguageButtons() {
        document.querySelectorAll('.language-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLanguage);
        });
    }

    // Initialiser l'observateur de mutations
    initMutationObserver() {
        this.observer = new MutationObserver((mutations) => {
            if (this.currentLanguage === 'fr') return;
            
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.translateElement(node);
                    } else if (node.nodeType === Node.TEXT_NODE) {
                        this.translateNode(node);
                    }
                });
            });
        });
        
        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
        
        console.log('👀 Observateur de mutations actif');
    }

    // Initialiser le système de traduction
    init() {
        // Traduire la page au chargement
        if (this.currentLanguage !== 'fr') {
            this.translatePage();
        }
        
        // Initialiser l'observateur
        this.initMutationObserver();
        
        // Mettre à jour les boutons
        this.updateLanguageButtons();
        
        console.log(`✅ Traduction initialisée (${this.currentLanguage})`);
    }

    // Obtenir la langue courante
    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// Instance globale
window.universalTranslationManager = new UniversalTranslationManager();

// Fonction de changement de langue
window.changerLangue = function(lang) {
    if (window.universalTranslationManager.setLanguage(lang)) {
        showToast(
            lang === 'fr' ? '🇫🇷 Langue changée en Français' : '🇬🇧 Language changed to English',
            'success'
        );
    }
};

// Auto-initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.universalTranslationManager.init();
    });
} else {
    window.universalTranslationManager.init();
}

console.log('🌍 Universal Translation Manager chargé');