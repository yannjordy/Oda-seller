'use client';

// ==================== IMPORTS ====================
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ==================== CONFIGURATION SUPABASE ====================
const SUPABASE_URL = 'https://xjckbqbqxcwzcrlmuvzf.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================== COMPOSANT PRINCIPAL ====================
export default function PaiementPage() {
  // ==================== VARIABLES GLOBALES (STATE) ====================
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [orderData, setOrderData]           = useState({});
  const [mobileMoneyConfig, setMobileMoneyConfig] = useState({});

  // UI States
  const [summaryData, setSummaryData]         = useState(null);
  const [errorType, setErrorType]             = useState(null); // 'noOrder'
  const [noPaymentError, setNoPaymentError]   = useState(false);

  // Payment options visibility (like style.display)
  const [paymentVisibility, setPaymentVisibility] = useState({ mtn: false, orange: false, cash: false });

  // Info affichées dans les détails mobile money
  const [mtnInfo, setMtnInfo]     = useState({ nom: '-', numero: '-' });
  const [orangeInfo, setOrangeInfo] = useState({ nom: '-', numero: '-' });

  // Instructions
  const [instructionSteps, setInstructionSteps] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false);

  // Boutons
  const [btnLaunchDisabled, setBtnLaunchDisabled] = useState(true);
  const [btnLaunchContent, setBtnLaunchContent]   = useState('📱 Lancer le paiement');
  const [btnConfirmLoading, setBtnConfirmLoading] = useState(false);

  // Modal succès
  const [showSuccess, setShowSuccess]       = useState(false);
  const [successCommande, setSuccessCommande] = useState(null);

  // ==================== INITIALISATION ====================
  useEffect(() => {
    console.log('💳 Page de paiement initialisée');
    chargerDonneesCommande();
    chargerConfigurationPaiement();

    // Empêcher le retour arrière accidentel
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      if (confirm('Voulez-vous vraiment annuler le paiement et retourner à la boutique ?')) {
        sessionStorage.removeItem('commande_en_cours');
        window.location.href = 'boutique';
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ==================== CHARGEMENT DES DONNÉES ====================
  function chargerDonneesCommande() {
    try {
      const commandeStr = sessionStorage.getItem('commande_en_cours');

      if (!commandeStr) {
        console.warn('⚠️ Aucune commande en cours trouvée');
        setErrorType('noOrder');
        return;
      }

      const data = JSON.parse(commandeStr);
      console.log('✅ Données reçues:', data);

      if (!data.montantTotal || !data.client) {
        console.error('❌ Données de commande incomplètes:', data);
        setErrorType('noOrder');
        return;
      }

      console.log('✅ Commande chargée:', {
        client: data.client.nom,
        ville: data.ville,
        total: data.montantTotal,
      });

      setOrderData(data);
      setSummaryData({
        subtotal: data.sousTotal || 0,
        delivery: data.fraisLivraison || 0,
        total: data.montantTotal || 0,
      });
    } catch (error) {
      console.error('❌ Erreur chargement commande:', error);
      setErrorType('noOrder');
    }
  }

  // ==================== CONFIGURATION PAIEMENT ====================
  async function chargerConfigurationPaiement() {
    try {
      console.log('💳 Chargement configuration paiement...');
      let parametresConfig = null;

      // 1. Essayer localStorage avec clé générique
      const paramsStr = localStorage.getItem('parametres_boutique');
      if (paramsStr) {
        parametresConfig = JSON.parse(paramsStr);
        console.log('✅ Config trouvée dans localStorage (générique)');
      }

      // 2. Essayer de récupérer depuis Supabase
      if (!parametresConfig) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { data, error } = await supabase
              .from('parametres_boutique')
              .select('config')
              .eq('user_id', session.user.id)
              .single();
            if (data && !error) {
              parametresConfig = data.config;
              console.log('✅ Config trouvée dans Supabase');
            }
          }
        } catch (err) {
          console.log('⚠️ Pas de session utilisateur, recherche de config locale');
        }
      }

      // 3. Essayer toutes les clés localStorage qui commencent par 'parametres_'
      if (!parametresConfig) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('parametres_')) {
            const configStr = localStorage.getItem(key);
            if (configStr) {
              parametresConfig = JSON.parse(configStr);
              console.log('✅ Config trouvée dans localStorage:', key);
              break;
            }
          }
        }
      }

      if (!parametresConfig) {
        console.error('❌ Aucune configuration trouvée');
        setNoPaymentError(true);
        return;
      }

      const configPaiement = parametresConfig.paiement || {};
      console.log('💳 Configuration paiement:', configPaiement);

      let methodeDisponible = false;
      const newConfig = {};
      const newVisibility = { mtn: false, orange: false, cash: false };

      // ✅ MTN Money
      if (configPaiement.mobile?.mtn?.actif && configPaiement.mobile.mtn.numero) {
        newConfig.mtn = configPaiement.mobile.mtn;
        setMtnInfo({
          nom:    configPaiement.mobile.mtn.nomCompte || 'Marchand',
          numero: configPaiement.mobile.mtn.numero,
        });
        newVisibility.mtn = true;
        methodeDisponible = true;
        console.log('✅ MTN Money activé:', configPaiement.mobile.mtn.numero);
      }

      // ✅ Orange Money
      if (configPaiement.mobile?.orange?.actif && configPaiement.mobile.orange.numero) {
        newConfig.orange = configPaiement.mobile.orange;
        setOrangeInfo({
          nom:    configPaiement.mobile.orange.nomCompte || 'Marchand',
          numero: configPaiement.mobile.orange.numero,
        });
        newVisibility.orange = true;
        methodeDisponible = true;
        console.log('✅ Orange Money activé:', configPaiement.mobile.orange.numero);
      }

      // ✅ Paiement à la livraison
      if (configPaiement.cash?.actif) {
        newVisibility.cash = true;
        methodeDisponible = true;
        console.log('✅ Paiement à la livraison activé');
      }

      setMobileMoneyConfig(newConfig);
      setPaymentVisibility(newVisibility);

      if (!methodeDisponible) {
        console.error('❌ Aucune méthode de paiement active');
        setNoPaymentError(true);
      } else {
        console.log('✅ Méthodes de paiement disponibles');
      }
    } catch (error) {
      console.error('❌ Erreur chargement configuration:', error);
      setNoPaymentError(true);
    }
  }

  // ==================== SÉLECTION MÉTHODE ====================
  function selectionnerMethodePaiement(method) {
    console.log('💳 Méthode sélectionnée:', method);
    setSelectedMethod(method);
    setBtnLaunchDisabled(false);

    if (method === 'cash') {
      setBtnLaunchContent('✓ Confirmer la commande');
    } else {
      setBtnLaunchContent('📱 Lancer le paiement');
    }

    afficherInstructions(method);
  }

  // ==================== INSTRUCTIONS ====================
  function afficherInstructions(method) {
    const montant = orderData.montantTotal;
    let steps = [];

    if (method === 'mtn') {
      steps = [
        'Composez *126# sur votre téléphone MTN',
        'Sélectionnez "Transfert d\'argent"',
        'Entrez le numéro du marchand ci-dessus',
        `Entrez le montant: ${formatPrice(montant)}`,
        'Confirmez avec votre code PIN',
      ];
    } else if (method === 'orange') {
      steps = [
        'Composez #150# sur votre téléphone Orange',
        'Sélectionnez "Transfert d\'argent"',
        'Entrez le numéro du marchand ci-dessus',
        `Entrez le montant: ${formatPrice(montant)}`,
        'Confirmez avec votre code secret',
      ];
    } else if (method === 'cash') {
      steps = [
        `Préparez le montant exact: ${formatPrice(montant)}`,
        'Le livreur vous contactera avant la livraison',
        'Payez en espèces lors de la réception',
        'Vérifiez votre commande avant de payer',
      ];
    }

    setInstructionSteps(steps);
    setShowInstructions(true);
  }

  // ==================== LANCER PAIEMENT ====================
  function lancerPaiement() {
    if (!selectedMethod) {
      alert('⚠️ Veuillez sélectionner une méthode de paiement');
      return;
    }

    if (selectedMethod === 'cash') {
      confirmerPaiement();
    } else if (selectedMethod === 'mtn') {
      const numero = mobileMoneyConfig.mtn?.numero;
      const montant = orderData.montantTotal;
      alert(
        `📱 Instructions MTN Money:\n\n` +
        `1. Composez *126# sur votre téléphone\n` +
        `2. Sélectionnez "Transfert d'argent"\n` +
        `3. Destinataire: ${numero}\n` +
        `4. Montant: ${formatPrice(montant)}\n` +
        `5. Confirmez avec votre PIN\n\n` +
        `Après le paiement, cliquez sur "J'ai effectué le paiement"`
      );
    } else if (selectedMethod === 'orange') {
      const numero = mobileMoneyConfig.orange?.numero;
      const montant = orderData.montantTotal;
      alert(
        `🍊 Instructions Orange Money:\n\n` +
        `1. Composez #150# sur votre téléphone\n` +
        `2. Sélectionnez "Transfert d'argent"\n` +
        `3. Destinataire: ${numero}\n` +
        `4. Montant: ${formatPrice(montant)}\n` +
        `5. Confirmez avec votre code secret\n\n` +
        `Après le paiement, cliquez sur "J'ai effectué le paiement"`
      );
    }
  }

  // ==================== CONFIRMER PAIEMENT ====================
  async function confirmerPaiement() {
    if (!selectedMethod) {
      alert('⚠️ Veuillez sélectionner une méthode de paiement');
      return;
    }

    setBtnConfirmLoading(true);

    try {
      const commandeData = {
        client_nom:        orderData.client?.nom || 'Client',
        client_email:      orderData.client?.email || '',
        client_telephone:  orderData.client?.tel || '',
        adresse_livraison: orderData.adresseLivraison || '',
        ville:             orderData.ville || '',
        commentaire:       orderData.commentaire || '',
        produits_data:     orderData.produits || [],
        montant_total:     orderData.montantTotal || 0,
        frais_livraison:   orderData.fraisLivraison || 0,
        methode_paiement:
          selectedMethod === 'mtn'    ? 'MTN Mobile Money'      :
          selectedMethod === 'orange' ? 'Orange Money'          :
                                        'Paiement à la livraison',
        statut: 'pending',
        numero: `#${Date.now()}`,
        user_id: await getUserId(),
      };

      console.log('📤 Envoi de la commande:', commandeData);

      const { data, error } = await supabase
        .from('commandes')
        .insert([commandeData])
        .select();

      if (error) throw error;

      console.log('✅ Commande enregistrée:', data);

      await nettoyerPanier();
      setSuccessCommande(data[0]);
      setShowSuccess(true);
    } catch (error) {
      console.error('❌ Erreur confirmation:', error);
      alert(
        `❌ Erreur lors de la confirmation.\n\nDétails: ${error.message}\n\nVeuillez réessayer.`
      );
    } finally {
      setBtnConfirmLoading(false);
    }
  }

  // ==================== GET USER ID ====================
  async function getUserId() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session ? session.user.id : null;
    } catch (error) {
      console.warn('Erreur récupération utilisateur:', error);
      return null;
    }
  }

  // ==================== NETTOYER PANIER ====================
  async function nettoyerPanier() {
    try {
      sessionStorage.removeItem('commande_en_cours');
      localStorage.removeItem('panier_ecommerce');
      console.log('✅ Panier nettoyé');
    } catch (error) {
      console.error('⚠️ Erreur nettoyage:', error);
    }
  }

  // ==================== UTILITAIRES ====================
  function formatPrice(price) {
    if (!price && price !== 0) return '0 FCFA';
    return (
      new Intl.NumberFormat('fr-FR', {
        style:                 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price) + ' FCFA'
    );
  }

  // Nom méthode lisible
  const methodeName =
    selectedMethod === 'mtn'    ? 'MTN Mobile Money'      :
    selectedMethod === 'orange' ? 'Orange Money'          :
                                   'Paiement à la livraison';

  // ==================== RENDER ====================
  return (
    <>
      {/* ===== STYLES CSS ===== */}
      <style>{`
        /* ==================== VARIABLES ==================== */
        :root {
          --primary-color: #FF6B00;
          --primary-dark: #E55D00;
          --mtn-yellow: #FFCC00;
          --mtn-dark: #E6B800;
          --orange-orange: #FF7900;
          --orange-dark: #E66900;
          --success-color: #10B981;
          --error-color: #EF4444;
          --text-primary: #1A1A1A;
          --text-secondary: #6B7280;
          --bg-primary: #FFFFFF;
          --bg-secondary: #F8F9FA;
          --border-color: #E5E7EB;
          --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
          --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
          --shadow-lg: 0 8px 24px rgba(0,0,0,0.15);
        }
        * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg-secondary);
          color: var(--text-primary);
          line-height: 1.6;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ===== CONTAINER ===== */
        .payment-container { flex:1; padding:20px; max-width:600px; margin:0 auto; width:100%; }

        /* ===== ORDER SUMMARY ===== */
        .order-summary {
          background:var(--bg-primary); border-radius:16px; padding:20px;
          margin-bottom:20px; box-shadow:var(--shadow-sm);
        }
        .summary-title { font-size:1.1rem; font-weight:700; margin-bottom:16px; color:var(--text-primary); }
        .summary-row {
          display:flex; justify-content:space-between; align-items:center;
          padding:12px 0; border-bottom:1px solid var(--border-color);
        }
        .summary-row:last-child {
          border-bottom:none; padding-top:16px; margin-top:8px;
          border-top:2px solid var(--border-color);
        }
        .summary-label { font-size:0.95rem; color:var(--text-secondary); }
        .summary-value { font-size:0.95rem; font-weight:600; color:var(--text-primary); }
        .summary-total { font-size:1.25rem; font-weight:800; color:var(--primary-color); }

        /* ===== PAYMENT METHODS ===== */
        .payment-methods { margin-bottom:20px; }
        .section-title { font-size:1rem; font-weight:700; color:var(--text-primary); margin-bottom:16px; padding-left:4px; }
        .payment-option {
          background:var(--bg-primary); border-radius:16px; padding:20px;
          margin-bottom:12px; cursor:pointer; transition:all 0.3s ease;
          border:2px solid var(--border-color); position:relative; overflow:hidden;
        }
        .payment-option:active { transform:scale(0.98); }
        .payment-option.selected { border-color:var(--primary-color); box-shadow:0 0 0 3px rgba(255,107,0,0.1); }
        .payment-option-header { display:flex; align-items:center; gap:16px; }
        .payment-icon {
          width:56px; height:56px; border-radius:14px; display:flex;
          align-items:center; justify-content:center; font-size:1.75rem;
          flex-shrink:0; box-shadow:var(--shadow-sm);
        }
        .payment-icon.mtn    { background:linear-gradient(135deg, var(--mtn-yellow), var(--mtn-dark)); }
        .payment-icon.orange { background:linear-gradient(135deg, var(--orange-orange), var(--orange-dark)); }
        .payment-info { flex:1; }
        .payment-name { font-size:1.05rem; font-weight:700; color:var(--text-primary); margin-bottom:4px; }
        .payment-desc { font-size:0.85rem; color:var(--text-secondary); }
        .payment-radio {
          width:24px; height:24px; border-radius:50%;
          border:2px solid var(--border-color); position:relative; transition:all 0.3s ease;
        }
        .payment-option.selected .payment-radio { border-color:var(--primary-color); background:var(--primary-color); }
        .payment-option.selected .payment-radio::after {
          content:'✓'; position:absolute; top:50%; left:50%;
          transform:translate(-50%,-50%); color:white; font-size:0.85rem; font-weight:700;
        }

        /* ===== PAYMENT DETAILS ===== */
        .payment-details {
          margin-top:16px; padding-top:16px;
          border-top:1px solid var(--border-color);
          animation:slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .detail-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:0.9rem; }
        .detail-label { color:var(--text-secondary); }
        .detail-value { font-weight:600; color:var(--text-primary); font-family:monospace; }
        .ussd-code { background:var(--bg-secondary); padding:12px 16px; border-radius:12px; margin-top:12px; text-align:center; }
        .ussd-label { font-size:0.85rem; color:var(--text-secondary); margin-bottom:6px; }
        .ussd-value { font-size:1.5rem; font-weight:800; color:var(--text-primary); font-family:'Courier New',monospace; letter-spacing:2px; }

        /* ===== INSTRUCTIONS ===== */
        .payment-instructions {
          background:linear-gradient(135deg, rgba(255,107,0,0.05), rgba(255,107,0,0.1));
          border-radius:16px; padding:20px; margin-bottom:20px;
          border-left:4px solid var(--primary-color);
        }
        .instructions-title { font-size:1rem; font-weight:700; color:var(--text-primary); margin-bottom:12px; display:flex; align-items:center; gap:8px; }
        .instruction-step { display:flex; gap:12px; margin-bottom:12px; }
        .instruction-step:last-child { margin-bottom:0; }
        .step-number {
          width:28px; height:28px; background:var(--primary-color); color:white;
          border-radius:50%; display:flex; align-items:center; justify-content:center;
          font-weight:700; font-size:0.85rem; flex-shrink:0;
        }
        .step-text { flex:1; font-size:0.9rem; color:var(--text-secondary); padding-top:4px; }

        /* ===== ACTION BUTTONS ===== */
        .action-buttons { display:flex; flex-direction:column; gap:12px; margin-bottom:20px; }
        .btn-primary {
          width:100%; padding:16px;
          background:linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          color:white; border:none; border-radius:14px; font-size:1rem;
          font-weight:700; cursor:pointer; transition:all 0.3s ease;
          box-shadow:var(--shadow-md); display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .btn-primary:active { transform:scale(0.98); }
        .btn-primary:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
        .btn-secondary {
          width:100%; padding:16px; background:var(--bg-primary);
          color:var(--text-primary); border:2px solid var(--border-color);
          border-radius:14px; font-size:1rem; font-weight:600; cursor:pointer; transition:all 0.3s ease;
        }
        .btn-secondary:active { transform:scale(0.98); background:var(--bg-secondary); }

        /* ===== SPINNER ===== */
        .spinner {
          width:20px; height:20px; border:3px solid rgba(255,255,255,0.3);
          border-top-color:white; border-radius:50%; animation:spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform:rotate(360deg); } }

        /* ===== SUCCESS MODAL ===== */
        .success-modal {
          position:fixed; top:0; left:0; right:0; bottom:0;
          background:rgba(0,0,0,0.7); backdrop-filter:blur(4px);
          display:none; align-items:center; justify-content:center;
          z-index:1000; padding:20px;
        }
        .success-modal.active { display:flex; }
        .success-content {
          background:var(--bg-primary); border-radius:24px; padding:40px 24px;
          text-align:center; max-width:400px; width:100%; animation:scaleIn 0.3s ease;
        }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
        .success-icon {
          width:80px; height:80px;
          background:linear-gradient(135deg, var(--success-color), #059669);
          border-radius:50%; display:flex; align-items:center; justify-content:center;
          font-size:3rem; margin:0 auto 24px; box-shadow:var(--shadow-lg); animation:bounce 0.6s ease;
        }
        @keyframes bounce { 0%,100% { transform:scale(1); } 50% { transform:scale(1.1); } }
        .success-title { font-size:1.5rem; font-weight:800; color:var(--text-primary); margin-bottom:12px; }
        .success-message { font-size:0.95rem; color:var(--text-secondary); margin-bottom:24px; line-height:1.5; }

        /* ===== SECURITY BADGE ===== */
        .security-badge {
          display:flex; align-items:center; justify-content:center; gap:8px;
          padding:12px; background:var(--bg-primary); border-radius:12px;
          margin-bottom:20px; font-size:0.85rem; color:var(--text-secondary);
        }
        .security-icon { color:var(--success-color); font-size:1.2rem; }

        /* ===== ANIMATIONS ===== */
        @keyframes fadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .payment-container > * { animation:fadeIn 0.4s ease forwards; }
        .payment-container > *:nth-child(1) { animation-delay:0.1s; }
        .payment-container > *:nth-child(2) { animation-delay:0.2s; }
        .payment-container > *:nth-child(3) { animation-delay:0.3s; }
        .payment-container > *:nth-child(4) { animation-delay:0.4s; }

        /* ===== RESPONSIVE ===== */
        @media (max-width:480px) {
          .payment-container { padding:16px; }
          .payment-header { padding:12px 16px; }
          .order-summary, .payment-option, .payment-instructions { padding:16px; }
          .header-title h1 { font-size:1.1rem; }
          .payment-icon { width:48px; height:48px; font-size:1.5rem; }
          .ussd-value { font-size:1.25rem; }
        }
      `}</style>

      {/* ===== CONTAINER ===== */}
      <div className="payment-container">

        {/* === CAS ERREUR : AUCUNE COMMANDE === */}
        {errorType === 'noOrder' ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:'4rem', marginBottom:'20px' }}>🛒</div>
            <h2 style={{ color:'var(--text-primary)', marginBottom:'12px' }}>Aucune commande en cours</h2>
            <p style={{ color:'var(--text-secondary)', marginBottom:'24px' }}>
              Veuillez d&apos;abord ajouter des produits au panier et passer une commande.
            </p>
            <button
              className="btn-primary"
              onClick={() => { window.location.href = 'boutique'; }}
            >
              Retour à la boutique
            </button>
          </div>
        ) : (
          <>
            {/* === RÉCAPITULATIF COMMANDE === */}
            {summaryData && (
              <div className="order-summary">
                <h3 className="summary-title">Récapitulatif de la commande</h3>
                <div className="summary-row">
                  <span className="summary-label">Sous-total</span>
                  <span className="summary-value">{formatPrice(summaryData.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Frais de livraison</span>
                  <span className="summary-value">{formatPrice(summaryData.delivery)}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Total à payer</span>
                  <span className="summary-total">{formatPrice(summaryData.total)}</span>
                </div>
              </div>
            )}

            {/* === MÉTHODES DE PAIEMENT === */}
            <div className="payment-methods">
              <h3 className="section-title">Méthodes de paiement</h3>

              {/* MTN Mobile Money */}
              {paymentVisibility.mtn && (
                <div
                  className={`payment-option${selectedMethod === 'mtn' ? ' selected' : ''}`}
                  data-method="mtn"
                  id="mtnOption"
                  onClick={() => selectionnerMethodePaiement('mtn')}
                >
                  <div className="payment-option-header">
                    <div className="payment-icon mtn">📱</div>
                    <div className="payment-info">
                      <div className="payment-name">MTN Mobile Money</div>
                      <div className="payment-desc">Paiement rapide et sécurisé</div>
                    </div>
                    <div className="payment-radio"></div>
                  </div>
                  {selectedMethod === 'mtn' && (
                    <div className="payment-details" id="mtnDetails">
                      <div className="detail-row">
                        <span className="detail-label">Compte marchand</span>
                        <span className="detail-value" id="mtnNom">{mtnInfo.nom}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Numéro</span>
                        <span className="detail-value" id="mtnNumero">{mtnInfo.numero}</span>
                      </div>
                      <div className="ussd-code">
                        <div className="ussd-label">Code USSD</div>
                        <div className="ussd-value">*126#</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Orange Money */}
              {paymentVisibility.orange && (
                <div
                  className={`payment-option${selectedMethod === 'orange' ? ' selected' : ''}`}
                  data-method="orange"
                  id="orangeOption"
                  onClick={() => selectionnerMethodePaiement('orange')}
                >
                  <div className="payment-option-header">
                    <div className="payment-icon orange">🍊</div>
                    <div className="payment-info">
                      <div className="payment-name">Orange Money</div>
                      <div className="payment-desc">Transfert instantané</div>
                    </div>
                    <div className="payment-radio"></div>
                  </div>
                  {selectedMethod === 'orange' && (
                    <div className="payment-details" id="orangeDetails">
                      <div className="detail-row">
                        <span className="detail-label">Compte marchand</span>
                        <span className="detail-value" id="orangeNom">{orangeInfo.nom}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Numéro</span>
                        <span className="detail-value" id="orangeNumero">{orangeInfo.numero}</span>
                      </div>
                      <div className="ussd-code">
                        <div className="ussd-label">Code USSD</div>
                        <div className="ussd-value">#150#</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Paiement à la livraison */}
              {paymentVisibility.cash && (
                <div
                  className={`payment-option${selectedMethod === 'cash' ? ' selected' : ''}`}
                  data-method="cash"
                  id="cashOption"
                  onClick={() => selectionnerMethodePaiement('cash')}
                >
                  <div className="payment-option-header">
                    <div className="payment-icon" style={{ background:'linear-gradient(135deg,#10B981,#059669)' }}>💵</div>
                    <div className="payment-info">
                      <div className="payment-name">Paiement à la livraison</div>
                      <div className="payment-desc">Payez en espèces à la réception</div>
                    </div>
                    <div className="payment-radio"></div>
                  </div>
                  {selectedMethod === 'cash' && (
                    <div className="payment-details" id="cashDetails">
                      <div style={{ background:'rgba(16,185,129,0.1)', padding:'16px', borderRadius:'12px', borderLeft:'4px solid #10B981' }}>
                        <p style={{ color:'var(--text-primary)', fontSize:'0.9rem', margin:0 }}>
                          ✓ Aucune configuration requise<br />
                          💵 Préparez le montant exact<br />
                          📦 Paiement au livreur
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Aucune méthode disponible */}
              {noPaymentError && (
                <div style={{ textAlign:'center', padding:'40px 20px', background:'rgba(255,59,48,0.1)', borderRadius:'16px', border:'2px solid rgba(255,59,48,0.3)', margin:'20px 0' }}>
                  <div style={{ fontSize:'3rem', marginBottom:'16px' }}>⚠️</div>
                  <h3 style={{ color:'#EF4444', marginBottom:'12px' }}>Aucune méthode de paiement disponible</h3>
                  <p style={{ color:'var(--text-secondary)', marginBottom:'20px' }}>
                    Le marchand n&apos;a pas encore configuré de méthode de paiement.<br />
                    Veuillez contacter le service client.
                  </p>
                  <button className="btn-secondary" onClick={() => { window.location.href = 'boutique'; }}>
                    Retour à la boutique
                  </button>
                </div>
              )}
            </div>

            {/* === INSTRUCTIONS DE PAIEMENT === */}
            {showInstructions && instructionSteps.length > 0 && (
              <div className="payment-instructions" id="instructions">
                <h3 className="instructions-title">
                  <span>💡</span>
                  <span>Instructions de paiement</span>
                </h3>
                <div id="instructionsContent">
                  {instructionSteps.map((step, index) => (
                    <div className="instruction-step" key={index}>
                      <div className="step-number">{index + 1}</div>
                      <div className="step-text">{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* === BADGE SÉCURITÉ === */}
            <div className="security-badge">
              <span className="security-icon">🔒</span>
              <span>Paiement 100% sécurisé</span>
            </div>

            {/* === BOUTONS D'ACTION === */}
            <div className="action-buttons">
              <button
                className="btn-primary"
                id="btnLaunchUSSD"
                disabled={btnLaunchDisabled}
                onClick={lancerPaiement}
              >
                <span id="btnText">{btnLaunchContent}</span>
              </button>
              <button
                className="btn-secondary"
                id="btnConfirm"
                onClick={confirmerPaiement}
                disabled={btnConfirmLoading}
              >
                {btnConfirmLoading ? (
                  <><div className="spinner" /> <span>Confirmation...</span></>
                ) : (
                  '✓ J\'ai effectué le paiement'
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ===== MODAL SUCCÈS ===== */}
      <div className={`success-modal${showSuccess ? ' active' : ''}`} id="successModal">
        <div className="success-content">
          {showSuccess && successCommande ? (
            <>
              <div className="success-icon">✓</div>
              <h2 className="success-title">Commande confirmée !</h2>
              <p className="success-message">Votre commande a été enregistrée avec succès.</p>

              <div style={{ background:'var(--bg-secondary)', padding:'16px', borderRadius:'12px', margin:'20px 0', textAlign:'left' }}>
                <h4 style={{ marginBottom:'12px', color:'var(--text-primary)' }}>📋 Détails</h4>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                  <span style={{ color:'var(--text-secondary)' }}>Montant total</span>
                  <span style={{ fontWeight:700, color:'var(--primary-color)' }}>{formatPrice(orderData.montantTotal)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                  <span style={{ color:'var(--text-secondary)' }}>Paiement</span>
                  <span style={{ fontWeight:600 }}>{methodeName}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'var(--text-secondary)' }}>Livraison</span>
                  <span style={{ fontWeight:600 }}>{orderData.ville}</span>
                </div>
              </div>

              <div style={{ background:'rgba(16,185,129,0.1)', padding:'16px', borderRadius:'12px', marginBottom:'20px' }}>
                <p style={{ color:'var(--text-secondary)', margin:0, fontSize:'0.9rem' }}>
                  📱 Vous recevrez une confirmation par SMS/WhatsApp
                </p>
              </div>

              <button
                className="btn-primary"
                onClick={() => { window.location.href = 'boutique'; }}
              >
                Retour à la boutique
              </button>
            </>
          ) : (
            <>
              <div className="success-icon">✓</div>
              <h2 className="success-title">Paiement confirmé !</h2>
              <p className="success-message">
                Votre commande a été enregistrée avec succès.{' '}
                Vous recevrez une confirmation par SMS/WhatsApp.
              </p>
              <button
                className="btn-primary"
                onClick={() => { window.location.href = 'boutique'; }}
              >
                Retour à la boutique
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}