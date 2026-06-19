-- ============================================================
--  010_futurechat_conversations.sql
--  Creates per-user persistent FutureChat history table.
--  Each row is one message (user or assistant).
--  session_id groups a single conversation thread —
--  New Chat creates a new UUID session without deleting history.
-- ============================================================

CREATE TABLE IF NOT EXISTS futurechat_conversations (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT        NOT NULL,                   -- Firebase UID
  session_id  UUID        NOT NULL,                   -- Groups a conversation thread
  role        TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performant per-user, per-session queries
CREATE INDEX IF NOT EXISTS idx_futurechat_user_id
  ON futurechat_conversations (user_id);

CREATE INDEX IF NOT EXISTS idx_futurechat_session_id
  ON futurechat_conversations (session_id);

CREATE INDEX IF NOT EXISTS idx_futurechat_user_created
  ON futurechat_conversations (user_id, created_at DESC);
