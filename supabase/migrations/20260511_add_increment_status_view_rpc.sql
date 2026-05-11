-- ===========================================================
-- Migration: Add RPC function to increment status view count
-- ===========================================================

CREATE OR REPLACE FUNCTION increment_status_view(row_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE shop_statuses SET views = views + 1 WHERE id = row_id;
END;
$$;
