


// ─── Meta / Facebook ───────────────────────────────────────────
// 👉 Obtenez votre App ID sur developers.facebook.com
export const META_APP_ID      = '1453272052599452';
export const META_API_VERSION = 'v19.0';

// ─── TikTok Ads ────────────────────────────────────────────────
// 👉 Obtenez votre App ID sur ads.tiktok.com/marketing_api
export const TIKTOK_APP_ID      = 'VOTRE_TIKTOK_APP_ID';
export const TIKTOK_API_VERSION = 'v1.3';

// ─── YouTube / Google Ads ──────────────────────────────────────
// 👉 Obtenez votre Client ID sur console.cloud.google.com
export const GOOGLE_CLIENT_ID   = 'VOTRE_GOOGLE_CLIENT_ID';
export const GOOGLE_API_VERSION = 'v14';

// ─── WhatsApp Business (via Meta) ──────────────────────────────
// Utilise le même App ID Meta — modifier META_APP_ID ci-dessus suffit.

// ─── Tarifs publicitaires par plateforme (FCFA/jour) ──────────
export const PLATFORM_PRICES = {
  facebook:  1500,
  instagram: 1500,
  whatsapp:  1000,
  tiktok:    2000,
  youtube:   2500,
};

// ─── Commissions ODA (internes — non affichées à l'utilisateur)
export const COMMISSION_ODA_RATE = 0.10; // 10 % prélevé sur le budget de base
export const SMARTBOOST_FEE_RATE = 0.05; // 5  % frais IA SmartBoost™