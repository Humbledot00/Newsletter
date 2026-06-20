-- Initial database schema for Newsletter App
-- Run this against your Neon PostgreSQL database

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  source_url TEXT,
  content_snapshot TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  publish_date TIMESTAMPTZ,
  featured BOOLEAN DEFAULT FALSE,
  author TEXT,
  cover_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'unsubscribed')),
  token TEXT NOT NULL UNIQUE DEFAULT uuid_generate_v4()::TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- Page views table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_publish_date ON posts(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_token ON subscribers(token);
CREATE INDEX IF NOT EXISTS idx_page_views_post_id ON page_views(post_id);

-- Auto-update updated_at on posts
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
