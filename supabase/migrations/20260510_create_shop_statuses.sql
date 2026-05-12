-- Table des statuts (stories) pour les boutiques
CREATE TABLE IF NOT EXISTS shop_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  media_url text NOT NULL,
  caption text DEFAULT '',
  type text DEFAULT 'image',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '24 hours',
  views integer DEFAULT 0
);

-- Index pour requête rapide des status non expirés
CREATE INDEX IF NOT EXISTS idx_shop_statuses_active
  ON shop_statuses (user_id, expires_at);

-- Index pour requête par utilisateur
CREATE INDEX IF NOT EXISTS idx_shop_statuses_user
  ON shop_statuses (user_id, created_at DESC);

-- RLS
ALTER TABLE shop_statuses ENABLE ROW LEVEL SECURITY;

-- Lecture: tout le monde peut voir les status actifs
CREATE POLICY IF NOT EXISTS "Tout le monde peut voir les status actifs"
  ON shop_statuses FOR SELECT
  USING (expires_at > now());

-- Insertion: authentifié seulement
CREATE POLICY IF NOT EXISTS "Les vendeurs peuvent créer leurs status"
  ON shop_statuses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Suppression: propriétaire seulement
CREATE POLICY IF NOT EXISTS "Les vendeurs peuvent supprimer leurs status"
  ON shop_statuses FOR DELETE
  USING (auth.uid() = user_id);
