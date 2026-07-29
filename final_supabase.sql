-- =============================================================================
-- PaperOK — Final Database Schema for Supabase
-- =============================================================================
-- Run this entire file once in: Supabase Dashboard → SQL Editor → New query
--
-- ⚠️  WARNING: This DROPS all existing data in these tables!
--     Back up first if you have production data you need to keep.
-- =============================================================================

-- Drop all tables (dependency order)
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS collections CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS validate_products_json(JSONB) CASCADE;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. COLLECTIONS (categories — tree structure via parent_id)
-- =============================================================================
CREATE TABLE collections (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    handle      TEXT UNIQUE NOT NULL,
    title       TEXT NOT NULL,
    description TEXT,
    position    INTEGER NOT NULL DEFAULT 0,
    parent_id   UUID REFERENCES collections(id) ON DELETE SET NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collections_handle    ON collections(handle);
CREATE INDEX idx_collections_position  ON collections(position);
CREATE INDEX idx_collections_parent_id ON collections(parent_id);

COMMENT ON TABLE  collections            IS 'Product categories. Tree via parent_id. NULL parent = root.';
COMMENT ON COLUMN collections.parent_id  IS 'Parent category. NULL = root category.';

-- =============================================================================
-- 2. PRODUCTS
-- =============================================================================
CREATE TABLE products (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    handle           TEXT UNIQUE NOT NULL,
    title            TEXT NOT NULL,
    description      TEXT,
    price            NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(10, 2),
    featured_image   JSONB,
    images           JSONB[] NOT NULL DEFAULT '{}',
    variants         JSONB NOT NULL DEFAULT '[]',
    category         TEXT,
    available        BOOLEAN NOT NULL DEFAULT true,
    plantable        BOOLEAN NOT NULL DEFAULT true,
    position         INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_handle    ON products(handle);
CREATE INDEX idx_products_category  ON products(category);
CREATE INDEX idx_products_available ON products(available);
CREATE INDEX idx_products_position  ON products(position);

COMMENT ON TABLE  products          IS 'Store products. Images in images[] JSONB. Sizes in variants JSONB.';
COMMENT ON COLUMN products.category IS 'Collection handle this product belongs to.';
COMMENT ON COLUMN products.variants IS 'Size variants: [{id, name, price, description, enabled}]. Empty = use base price.';
COMMENT ON COLUMN products.plantable IS 'When true, show planting tab and plantable badge on the product page.';
COMMENT ON COLUMN products.images   IS 'Gallery images as JSONB array. Order = display order.';

-- =============================================================================
-- 3. PRODUCT_IMAGES (optional legacy table — app uses products.images JSONB)
-- =============================================================================
CREATE TABLE product_images (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url  TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_product_sort_order UNIQUE (product_id, sort_order)
);

CREATE INDEX idx_product_images_product_id  ON product_images(product_id);
CREATE INDEX idx_product_images_sort_order  ON product_images(product_id, sort_order);

COMMENT ON TABLE  product_images            IS 'Optional separate image table. App primarily uses products.images JSONB.';
COMMENT ON COLUMN product_images.sort_order IS '0 = main image, 1+ = secondary images.';

-- =============================================================================
-- 4. ORDERS
-- =============================================================================
CREATE TABLE orders (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Customer
    customer_name     VARCHAR(255) NOT NULL,
    customer_email    VARCHAR(255) NOT NULL,
    customer_phone    VARCHAR(50),
    customer_address  TEXT NOT NULL,
    -- Order
    products          JSONB NOT NULL,
    total_price       NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    payment_method    VARCHAR(20) NOT NULL DEFAULT 'cash_on_delivery'
                          CHECK (payment_method IN ('cash_on_delivery', 'card')),
    status            VARCHAR(20) NOT NULL DEFAULT 'new'
                          CHECK (status IN (
                              'new', 'pending_payment', 'confirmed',
                              'shipped', 'paid', 'completed', 'canceled'
                          )),
    comment           TEXT,
    -- Stripe & deduplication
    stripe_session_id TEXT,
    idempotency_key   TEXT,
    email_sent_at     TIMESTAMPTZ,
    -- Timestamps
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX        idx_orders_status         ON orders(status);
CREATE INDEX        idx_orders_created_at     ON orders(created_at DESC);
CREATE INDEX        idx_orders_updated_at     ON orders(updated_at DESC);
CREATE INDEX        idx_orders_customer_email ON orders(customer_email);
CREATE UNIQUE INDEX idx_orders_stripe_session_id
    ON orders(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE UNIQUE INDEX idx_orders_idempotency_key
    ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;

COMMENT ON TABLE  orders                    IS 'Customer orders. Cart lives in browser localStorage.';
COMMENT ON COLUMN orders.products           IS 'Snapshot: [{id, name, price, quantity, variant_name?}]';
COMMENT ON COLUMN orders.stripe_session_id  IS 'Stripe Checkout Session ID — one per payment.';
COMMENT ON COLUMN orders.idempotency_key    IS 'Client UUID — prevents duplicate orders on double-submit.';
COMMENT ON COLUMN orders.email_sent_at      IS 'When admin notification was sent — prevents duplicate emails.';
COMMENT ON COLUMN orders.status             IS 'new | pending_payment | confirmed | shipped | paid | completed | canceled';

-- =============================================================================
-- 5. BLOG POSTS
-- =============================================================================
CREATE TABLE blog_posts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            TEXT UNIQUE NOT NULL,
    title           TEXT NOT NULL,
    excerpt         TEXT,
    content         TEXT NOT NULL DEFAULT '',
    featured_image  JSONB,
    images          JSONB[] NOT NULL DEFAULT '{}',
    seo_title       TEXT,
    seo_description TEXT,
    published       BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug       ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published  ON blog_posts(published);
CREATE INDEX idx_blog_posts_created_at ON blog_posts(created_at DESC);

COMMENT ON TABLE blog_posts IS 'Blog articles managed from /admin/blog.';

-- =============================================================================
-- 6. VALIDATION FUNCTION — orders.products JSON structure
-- =============================================================================
CREATE OR REPLACE FUNCTION validate_products_json(products_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    IF jsonb_typeof(products_data) != 'array' THEN
        RETURN FALSE;
    END IF;

    RETURN (
        SELECT bool_and(
            elem ? 'id' AND
            elem ? 'name' AND
            elem ? 'price' AND
            elem ? 'quantity' AND
            (elem->>'quantity')::INTEGER > 0
        )
        FROM jsonb_array_elements(products_data) AS elem
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

ALTER TABLE orders
    ADD CONSTRAINT check_products_json
    CHECK (validate_products_json(products));

-- =============================================================================
-- 7. ROW LEVEL SECURITY (публичен магазин + checkout)
-- =============================================================================
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_collections" ON collections
  FOR SELECT USING (true);

CREATE POLICY "public_read_products" ON products
  FOR SELECT USING (available = true);

CREATE POLICY "public_read_blog" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "public_insert_orders" ON orders
  FOR INSERT WITH CHECK (true);

-- =============================================================================
-- Done.
--   collections  — category tree (parent_id)
--   products     — with variants JSONB for sizes
--   product_images — optional
--   orders       — with Stripe session + idempotency
--   blog_posts   — with slug, SEO, images
-- =============================================================================
