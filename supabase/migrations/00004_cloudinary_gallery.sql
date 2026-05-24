-- Migration: Cloudinary metadata and video support for gallery_images
--
-- Adds the columns required by the cloudinary-gallery-media feature so the
-- gallery_images table can store Cloudinary asset metadata alongside the
-- existing src/alt/orientation/order_index fields. Legacy rows (rows whose
-- src is /images/... or a data: URL) keep working with NULL Cloudinary
-- columns (Req 3.6, 9.1).
--
-- This migration is idempotent: every statement is guarded so running it
-- twice against the same database leaves the schema in the same final state
-- without raising an error (Req 3.8). It contains no UPDATE or DELETE
-- statements, so existing row data is untouched (Req 3.9).
--
-- Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.6, 3.7, 3.8, 3.9

-- 1. Add Cloudinary metadata columns. One ALTER per column with IF NOT EXISTS
--    so each column add is independently idempotent.
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS public_id TEXT;
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS resource_type TEXT;
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS format TEXT;
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS width INTEGER;
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS height INTEGER;
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS bytes INTEGER;
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS duration NUMERIC;

-- 2. CHECK constraint on resource_type. Postgres has no
--    "ADD CONSTRAINT IF NOT EXISTS" syntax for table constraints, so guard
--    the ADD CONSTRAINT with a pg_constraint lookup. NULLs are allowed by
--    default in CHECK semantics, which preserves legacy rows (Req 3.2).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'gallery_images_resource_type_check'
      AND conrelid = 'gallery_images'::regclass
  ) THEN
    ALTER TABLE gallery_images
      ADD CONSTRAINT gallery_images_resource_type_check
      CHECK (resource_type IN ('image', 'video'));
  END IF;
END
$$;

-- 3. Partial unique index on public_id. The WHERE clause makes the
--    constraint apply only to non-null values, so multiple legacy rows can
--    keep public_id = NULL while two non-null rows with the same public_id
--    are rejected (Req 3.6).
CREATE UNIQUE INDEX IF NOT EXISTS gallery_images_public_id_unique
  ON gallery_images (public_id)
  WHERE public_id IS NOT NULL;
