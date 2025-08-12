-- db/migrations/003_slugs.sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS slug text UNIQUE;

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

-- Optional backfill for existing rows without a slug
-- Simple slug; you can handle collisions separately if needed
UPDATE posts
SET slug = lower(regexp_replace(title, '[^a-z0-9]+', '-', 'g'))
WHERE slug IS NULL;
