-- Add is_private column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;
