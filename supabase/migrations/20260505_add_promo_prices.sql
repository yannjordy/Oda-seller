-- Migration pour ajouter les champs de prix promotionnel
ALTER TABLE produits 
  ADD COLUMN IF NOT EXISTS prix_promo NUMERIC,
  ADD COLUMN IF NOT EXISTS prix_initial NUMERIC;

-- Mettre à jour les produits existants (prix_promo = null par défaut)
UPDATE produits SET prix_promo = NULL WHERE prix_promo IS NULL;
UPDATE produits SET prix_initial = NULL WHERE prix_initial IS NULL;

-- Commentaire
COMMENT ON COLUMN produits.prix_promo IS 'Prix promotionnel (null si pas de promo)';
COMMENT ON COLUMN produits.prix_initial IS 'Prix avant promotion (null si pas de promo)';
