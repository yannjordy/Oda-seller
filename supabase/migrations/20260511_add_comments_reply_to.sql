-- Ajout de la colonne reply_to pour les réponses aux commentaires
ALTER TABLE shop_status_comments
  ADD COLUMN IF NOT EXISTS reply_to uuid REFERENCES shop_status_comments;
