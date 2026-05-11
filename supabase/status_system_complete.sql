-- ===========================================================
-- Script complet d'installation du système Status/Stories
-- pour ODA Marketplace (oda-seller + oda-market)
-- Exécuter DANS L'ORDRE dans le SQL Editor Supabase
-- ===========================================================

-- 1. Table des status (stories) — 24h, image ou vidéo
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

-- Index pour requête rapide des status non expirés par boutique
CREATE INDEX IF NOT EXISTS idx_shop_statuses_active
  ON shop_statuses (user_id, expires_at);

-- Index pour liste chronologique des status d'un vendeur
CREATE INDEX IF NOT EXISTS idx_shop_statuses_user
  ON shop_statuses (user_id, created_at DESC);

-- Sécurité : activer RLS
ALTER TABLE shop_statuses ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les status encore actifs
CREATE POLICY "Tout le monde peut voir les status actifs"
  ON shop_statuses FOR SELECT
  USING (expires_at > now());

-- Seul le vendeur authentifié peut créer son status
CREATE POLICY "Les vendeurs peuvent créer leurs status"
  ON shop_statuses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Seul le propriétaire peut supprimer son status
CREATE POLICY "Les vendeurs peuvent supprimer leurs status"
  ON shop_statuses FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================================================
-- 2. Table des commentaires sur les status
-- ===========================================================
CREATE TABLE IF NOT EXISTS shop_status_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status_id uuid REFERENCES shop_statuses ON DELETE CASCADE NOT NULL,
  user_id text,
  author_name text DEFAULT 'Anonyme',
  content text NOT NULL,
  reply_to uuid REFERENCES shop_status_comments,
  created_at timestamptz DEFAULT now()
);

-- Index pour chargement rapide des commentaires d'un status
CREATE INDEX IF NOT EXISTS idx_status_comments_status
  ON shop_status_comments (status_id, created_at DESC);

-- Sécurité : activer RLS
ALTER TABLE shop_status_comments ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les commentaires
CREATE POLICY "Lecture publique des commentaires"
  ON shop_status_comments FOR SELECT
  USING (true);

-- Tout le monde peut commenter (anonyme ou connecté)
CREATE POLICY "Insertion publique des commentaires"
  ON shop_status_comments FOR INSERT
  WITH CHECK (true);

-- ===========================================================
-- Vérification finale
-- ===========================================================
SELECT '✅ shop_statuses' AS table_name, count(*) AS policies FROM pg_policies WHERE tablename = 'shop_statuses'
UNION ALL
SELECT '✅ shop_status_comments', count(*) FROM pg_policies WHERE tablename = 'shop_status_comments';
