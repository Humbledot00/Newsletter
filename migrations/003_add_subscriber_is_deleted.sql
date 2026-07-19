-- Add soft-delete support for subscribers

ALTER TABLE subscribers
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_subscribers_is_deleted ON subscribers(is_deleted);
