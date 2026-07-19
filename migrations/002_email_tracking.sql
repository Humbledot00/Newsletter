-- Email tracking tables for newsletter analytics

CREATE TABLE IF NOT EXISTS email_opens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES subscribers(id) ON DELETE SET NULL,
  opened_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES subscribers(id) ON DELETE SET NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_opens_post_id ON email_opens(post_id);
CREATE INDEX IF NOT EXISTS idx_email_opens_subscriber_id ON email_opens(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_email_clicks_post_id ON email_clicks(post_id);
CREATE INDEX IF NOT EXISTS idx_email_clicks_subscriber_id ON email_clicks(subscriber_id);
