CREATE TABLE IF NOT EXISTS meta_connexions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fb_user_id TEXT,
  fb_user_name TEXT,
  access_token TEXT,
  platform_status JSONB NOT NULL DEFAULT '{}'::jsonb,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_connexion UNIQUE (user_id)
);

ALTER TABLE meta_connexions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own connexions' AND tablename = 'meta_connexions') THEN
    CREATE POLICY "Users can insert their own connexions"
      ON meta_connexions FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own connexions' AND tablename = 'meta_connexions') THEN
    CREATE POLICY "Users can view their own connexions"
      ON meta_connexions FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own connexions' AND tablename = 'meta_connexions') THEN
    CREATE POLICY "Users can update their own connexions"
      ON meta_connexions FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;
