-- =============================================================================
-- PaperOK — next_migration.sql
-- =============================================================================
-- Инкрементални промени СЛЕД последното пушване (origin/main).
-- Пусни върху СЪЩЕСТВУВАЩА база — НЕ дропва таблици / данни.
--
-- Включва:
--   1) products.plantable (ако липсва)
--   2) contact_inquiries (запитвания от /contact → /admin/inquiries)
--   3) Speedy полета + bank_transfer в orders
--   4) RLS политики (вкл. contact_inquiries)
--
-- След като се пушне и се приложи на prod, този файл се изчиства / подменя
-- със следващия batch промени.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Plantable flag on products
-- -----------------------------------------------------------------------------
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS plantable BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN products.plantable IS
  'When true, show planting tab and plantable badge on product page.';

-- -----------------------------------------------------------------------------
-- 2) Contact form inquiries
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_inquiries (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    phone      TEXT,
    subject    TEXT,
    message    TEXT NOT NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'new'
                   CHECK (status IN ('new', 'read', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status
    ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at
    ON contact_inquiries(created_at DESC);

COMMENT ON TABLE  contact_inquiries        IS 'Messages from the public /contact form. Managed in /admin/inquiries.';
COMMENT ON COLUMN contact_inquiries.status IS 'new | read | archived';

-- -----------------------------------------------------------------------------
-- 3) Speedy shipping + bank transfer payment
-- -----------------------------------------------------------------------------
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_method TEXT,
  ADD COLUMN IF NOT EXISTS shipping_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS products_subtotal NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS shipping_site_id BIGINT,
  ADD COLUMN IF NOT EXISTS shipping_site_name TEXT,
  ADD COLUMN IF NOT EXISTS shipping_office_id INTEGER,
  ADD COLUMN IF NOT EXISTS shipping_office_name TEXT,
  ADD COLUMN IF NOT EXISTS shipping_deadline TEXT,
  ADD COLUMN IF NOT EXISTS shipping_details JSONB;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_shipping_method_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_shipping_method_check
  CHECK (
    shipping_method IS NULL OR
    shipping_method IN ('office', 'apt', 'address')
  );

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('cash_on_delivery', 'card', 'bank_transfer'));

COMMENT ON COLUMN orders.shipping_method    IS 'office | apt | address (Speedy)';
COMMENT ON COLUMN orders.shipping_price     IS 'Shipping cost from Speedy calculate (EUR, incl. VAT)';
COMMENT ON COLUMN orders.products_subtotal  IS 'Products total before shipping';
COMMENT ON COLUMN orders.shipping_details   IS 'Extra Speedy/address payload for admin';

-- -----------------------------------------------------------------------------
-- 4) RLS policies
-- -----------------------------------------------------------------------------
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_collections" ON collections;
DROP POLICY IF EXISTS "public_read_products" ON products;
DROP POLICY IF EXISTS "public_read_blog" ON blog_posts;
DROP POLICY IF EXISTS "public_insert_orders" ON orders;

CREATE POLICY "public_read_collections" ON collections
  FOR SELECT USING (true);

CREATE POLICY "public_read_products" ON products
  FOR SELECT USING (available = true);

CREATE POLICY "public_read_blog" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "public_insert_orders" ON orders
  FOR INSERT WITH CHECK (true);

-- contact_inquiries: no public policies — service role only (API + admin)
