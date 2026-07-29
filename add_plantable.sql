-- Optional: explicit plantable flag on products
-- Run in Supabase SQL Editor if you want admin control beyond category defaults.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS plantable BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN products.plantable IS
  'When true, show planting tab and plantable badge on product page.';
