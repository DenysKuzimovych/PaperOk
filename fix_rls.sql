-- =============================================================================
-- PaperOK — RLS Policies
-- =============================================================================
-- Пусни веднъж след final_supabase.sql (+ seed_data.sql).
-- Без тези политики магазинът (anon ключ) не вижда продукти и категории.
-- =============================================================================

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

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
