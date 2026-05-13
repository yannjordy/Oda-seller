-- ===========================================================
-- Migration: Admin control tower infrastructure
-- 1. admin_roles : qui est admin
-- 2. signalements : moderation des produits/services
-- 3. admin_logs : audit trail des actions admin
-- 4. Indexes supplementaires pour le dashboard admin
-- ===========================================================

-- ═══════════════════════════════════════════════════════════════
-- 1. admin_roles
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'moderator' CHECK (role IN ('super_admin', 'admin', 'moderator', 'support')),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(user_id)
);

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Les admins voient la table des admins (service_role uniquement en pratique)
CREATE POLICY "Admins can view admin_roles"
  ON admin_roles FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_roles));

-- ═══════════════════════════════════════════════════════════════
-- 2. signalements (reports)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS signalements (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('produit', 'service', 'boutique', 'commentaire', 'utilisateur')),
  target_id text NOT NULL,
  raison text NOT NULL DEFAULT '',
  description text DEFAULT '',
  statut text NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'en_cours', 'resolu', 'rejete')),
  created_at timestamptz DEFAULT now(),
  traite_par uuid REFERENCES auth.users(id),
  traite_le timestamptz,
  action_prise text DEFAULT ''
);

ALTER TABLE signalements ENABLE ROW LEVEL SECURITY;

-- Public insert (anyone can report)
CREATE POLICY "Tout le monde peut signaler"
  ON signalements FOR INSERT
  WITH CHECK (true);

-- Admins can view and update signalements
CREATE POLICY "Admins can view signalements"
  ON signalements FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_roles));

CREATE POLICY "Admins can update signalements"
  ON signalements FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_roles));

-- ═══════════════════════════════════════════════════════════════
-- 3. admin_logs (audit trail)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS admin_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view logs"
  ON admin_logs FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_roles));

CREATE POLICY "Admins can insert logs"
  ON admin_logs FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_roles));

-- ═══════════════════════════════════════════════════════════════
-- 4. Indexes pour le dashboard
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_signalements_statut ON signalements (statut, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signalements_type ON signalements (type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs (admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs (action, created_at DESC);

-- Index pour stats produits par user
CREATE INDEX IF NOT EXISTS idx_produits_user_statut ON produits (user_id, statut);
CREATE INDEX IF NOT EXISTS idx_services_user_statut ON services (user_id, statut);

-- Index pour commandes stats temporelles
CREATE INDEX IF NOT EXISTS idx_commandes_date ON commandes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commandes_user_date ON commandes (user_id, created_at DESC);

-- Index pour visiteurs
CREATE INDEX IF NOT EXISTS idx_visiteurs_date ON visiteurs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_visiteurs_user_date ON visiteurs (user_id, timestamp DESC);

-- Index pour abonnements
CREATE INDEX IF NOT EXISTS idx_abonnements_statut ON abonnements (statut);
CREATE INDEX IF NOT EXISTS idx_abonnements_plan ON abonnements (plan);

-- Index pour boosts
CREATE INDEX IF NOT EXISTS idx_boosts_statut ON boosts (statut, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_boosts_user ON boosts (user_id, created_at DESC);
