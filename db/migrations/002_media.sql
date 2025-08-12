-- db/migrations/002_media.sql
-- Rename logic without PL/pgSQL, safe for fresh dbs and existing dbs

-- Ensure new cover image column exists
ALTER TABLE posts ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Drop old image_url if it exists
ALTER TABLE posts DROP COLUMN IF EXISTS image_url;

-- Inline images table (for multiple images in content)
CREATE TABLE IF NOT EXISTS post_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  width int,
  height int,
  position int,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, position)
);

CREATE INDEX IF NOT EXISTS idx_post_images_post_id ON post_images (post_id);
