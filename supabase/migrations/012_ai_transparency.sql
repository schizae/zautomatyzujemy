-- ============================================================
-- Migracja 012: Przejrzystość AI (art. 50 AI Act)
-- Projekt: Zautomatyzujemy.pl
-- Wykonaj w: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── posts: znacznik maszynowego pochodzenia ─────────────────────────────────

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_model     TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at  TIMESTAMPTZ;

COMMENT ON COLUMN posts.ai_generated IS 'Czy treść powstała maszynowo (art. 50 ust. 2 AI Act)';
COMMENT ON COLUMN posts.ai_model     IS 'Model użyty do wygenerowania, np. gemini-2.5-flash';
COMMENT ON COLUMN posts.reviewed_at  IS 'Kiedy zatwierdzono redakcyjnie — dowód kontroli redakcyjnej (art. 50 ust. 4)';

-- Istniejące wpisy zostają z ai_generated = false. Nie mamy pewności co do
-- pochodzenia każdego z nich, a oznaczanie wstecz na podstawie domysłu byłoby
-- zmyślaniem dowodu.

-- ─── app_settings: ustawienia aplikacji ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT        PRIMARY KEY,
  value      TEXT        NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Start w trybie redakcyjnym: nic nie trafia na stronę bez zatwierdzenia.
INSERT INTO app_settings (key, value)
VALUES ('blog_publish_mode', 'review')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Świadomie bez polityki publicznego odczytu — ustawienia są wewnętrzne.
CREATE POLICY "Service role — pełny dostęp do app_settings"
  ON app_settings FOR ALL
  USING (auth.role() = 'service_role');
