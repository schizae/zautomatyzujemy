-- ============================================================
-- Migracja 004: Tabela case_studies
-- Projekt: Zautomatyzujemy.pl
-- Wykonaj w: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS case_studies (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        TEXT        UNIQUE NOT NULL,
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL,
  content     TEXT        DEFAULT '',
  cover_image TEXT,
  tag         TEXT        NOT NULL DEFAULT '',
  sort_order  INT         DEFAULT 0,
  is_active   BOOLEAN     DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Publiczny odczyt aktywnych case studies"
  ON case_studies FOR SELECT USING (is_active = true);

CREATE POLICY "Service role — pełny dostęp do case_studies"
  ON case_studies FOR ALL USING (auth.role() = 'service_role');

-- Trigger updated_at
CREATE TRIGGER trg_case_studies_updated_at
  BEFORE UPDATE ON case_studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dane domyślne
INSERT INTO case_studies (slug, title, description, tag, sort_order) VALUES
  ('wzrost-sprzedazy-ecommerce', 'Wzrost sprzedaży o 30%', 'Automatyzacja procesów retencji klienta i personalizacja ofert AI dla lidera branży home decor.', 'E-commerce', 0),
  ('oszczednosc-czasu-fintech',  'Oszczędność 40h/tydz',  'Wdrożenie zautomatyzowanego obiegu dokumentów i faktur w biurze rachunkowym.',                   'Fintech',    1),
  ('zadowolenie-klientow-saas',  '95% zadowolenia',        'Integracja inteligentnego czatu opartego o GPT-4 dla wsparcia technicznego platformy B2B.',         'SaaS',       2)
ON CONFLICT (slug) DO NOTHING;
