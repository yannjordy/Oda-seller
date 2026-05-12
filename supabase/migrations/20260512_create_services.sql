-- ===========================================================
-- Migration: Table des services
-- ===========================================================

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  nom text NOT NULL,
  description text DEFAULT '',
  whatsapp text DEFAULT '',
  lieu text DEFAULT '',
  images text[] DEFAULT '{}',
  video_url text DEFAULT '',
  statut text DEFAULT 'actif',
  created_at timestamptz DEFAULT now()
);

-- Index pour requête rapide par vendeur
CREATE INDEX IF NOT EXISTS idx_services_user ON services (user_id, created_at DESC);

-- Sécurité : activer RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les services actifs
CREATE POLICY "Lecture publique des services"
  ON services FOR SELECT
  USING (statut = 'actif');

-- Seul le vendeur peut créer ses services
CREATE POLICY "Les vendeurs peuvent créer leurs services"
  ON services FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Seul le propriétaire peut modifier/supprimer
CREATE POLICY "Les vendeurs peuvent modifier leurs services"
  ON services FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Les vendeurs peuvent supprimer leurs services"
  ON services FOR DELETE
  USING (auth.uid() = user_id);