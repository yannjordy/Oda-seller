-- Index manquant pour shop_statuses (créé séparément car la migration initiale a pu sauter cette étape)
CREATE INDEX IF NOT EXISTS idx_shop_statuses_active ON shop_statuses (user_id, expires_at);
