-- Table des commentaires sur les status (stories)
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

-- RLS
ALTER TABLE shop_status_comments ENABLE ROW LEVEL SECURITY;

-- Lecture : tout le monde peut voir les commentaires
CREATE POLICY IF NOT EXISTS "Lecture publique des commentaires"
  ON shop_status_comments FOR SELECT
  USING (true);

-- Insertion : tout le monde peut commenter (anonyme ou connecté)
CREATE POLICY IF NOT EXISTS "Insertion publique des commentaires"
  ON shop_status_comments FOR INSERT
  WITH CHECK (true);
