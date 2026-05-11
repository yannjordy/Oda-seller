// ==========================================
// ⚙️ OdaMarket — Configuration centralisée
// ==========================================

// ─── Supabase ─────────────────────────────
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Variables d\'environnement Supabase manquantes');
}

// ─── Cloudinary ───────────────────────────
export const CLOUDINARY_CLOUD_NAME = 'dnpeuymo0';
export const CLOUDINARY_UPLOAD_PRESET = 'oda_unsigned_upload';

// ─── Catégories de produits ───────────────
export const CATEGORIES = [
  'Vetements','Electroniques','Decoration','Electromenager','Beaute & soin',
  'Accessoires','Bebe','jeux & jouets','Bricolage','Alimentation','Boissons',
  'Livre','Hygiene & sante','fitness','Animaux','Luxe','Bureau','peruque',
  'chaussures','telephone','outils','enfants','bijoux','autre','site-web',
  'voiture','formation',
];

// ─── Paramètres boutique par défaut ───────
export const PARAMS_DEFAUT = {
  general: { nom: '', description: '', telephone: '+237 6XX XX XX XX', email: '', adresse: '' },
  apparence: { couleurPrimaire: '#FF6B00', couleurSecondaire: '#1A1A1A', accent: '#FF9A3C', logo: 'oda.jpg', favicon: 'oda.jpg', police: 'Outfit' },
  paiement: {
    carte: { actif: false, cle: '', confirme: false },
    mobile: { actif: false, confirme: false, mtn: { actif: false, numero: '', nomCompte: '', confirme: false }, orange: { actif: false, numero: '', nomCompte: '', confirme: false } },
    cash: { actif: true, confirme: true }, devise: 'FCFA'
  },
  livraison: { fraisDouala: 1000, fraisAutres: 2500, zonesPersonnalisees: [], delai: '2-5 jours ouvrables', livraisonGratuite: false, montantMinimum: 50000 }
};

export default {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  CATEGORIES,
  PARAMS_DEFAUT,
};
