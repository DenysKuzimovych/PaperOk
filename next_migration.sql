-- =============================================================================
-- PaperOK — next_migration.sql
-- =============================================================================
-- Само промени СЛЕД последното пушване (9b587b8).
-- Предишният batch (plantable, contact_inquiries, Speedy, RLS) вече е пушнат.
--
-- Пусни върху СЪЩЕСТВУВАЩА база — НЕ дропва таблици / данни.
-- =============================================================================

-- Ensure the 3 main menu roots exist (Картички / Подаръци / Семенна хартия)
INSERT INTO collections (handle, title, description, position, parent_id)
SELECT 'kartichki', 'Картички', 'Картички от семенна хартия', 0, NULL
WHERE NOT EXISTS (SELECT 1 FROM collections WHERE handle = 'kartichki');

INSERT INTO collections (handle, title, description, position, parent_id)
SELECT 'podaraci', 'Подаръци', 'Подаръци от семенна хартия', 1, NULL
WHERE NOT EXISTS (SELECT 1 FROM collections WHERE handle = 'podaraci');

INSERT INTO collections (handle, title, description, position, parent_id)
SELECT 'semenna-hartia', 'Семенна хартия', 'Семенна хартия и материали', 2, NULL
WHERE NOT EXISTS (SELECT 1 FROM collections WHERE handle = 'semenna-hartia');

-- Keep the three roots top-level with correct titles
UPDATE collections
SET parent_id = NULL,
    title = CASE handle
      WHEN 'kartichki' THEN 'Картички'
      WHEN 'podaraci' THEN 'Подаръци'
      WHEN 'semenna-hartia' THEN 'Семенна хартия'
      ELSE title
    END
WHERE handle IN ('kartichki', 'podaraci', 'semenna-hartia');
