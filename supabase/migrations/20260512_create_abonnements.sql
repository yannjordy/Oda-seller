CREATE TABLE IF NOT EXISTS abonnements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'gratuit',
  limite_produits INTEGER NOT NULL DEFAULT 10,
  date_debut TIMESTAMPTZ DEFAULT NOW(),
  date_expiration TIMESTAMPTZ,
  statut TEXT NOT NULL DEFAULT 'actif',
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_abonnement UNIQUE (user_id)
);

ALTER TABLE abonnements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own abonnement' AND tablename = 'abonnements') THEN
    CREATE POLICY "Users can view their own abonnement"
      ON abonnements FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own abonnement' AND tablename = 'abonnements') THEN
    CREATE POLICY "Users can insert their own abonnement"
      ON abonnements FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own abonnement' AND tablename = 'abonnements') THEN
    CREATE POLICY "Users can update their own abonnement"
      ON abonnements FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;
