-- ============================================================
-- Migracja 003: Tabele treści edytowalnych przez admin
-- Projekt: Zautomatyzujemy.pl
-- Wykonaj w: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── Tabela: page_content (Hero, O nas, CTA itp.) ───────────────────────────

CREATE TABLE IF NOT EXISTS page_content (
  key         TEXT        PRIMARY KEY,   -- np. 'hero_title', 'hero_description'
  value       TEXT        NOT NULL,
  label       TEXT        NOT NULL,      -- czytelna etykieta dla admina
  section     TEXT        NOT NULL,      -- np. 'hero', 'about', 'cta'
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tabela: services (Sekcja "Usługi") ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS services (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL,
  icon        TEXT        NOT NULL DEFAULT 'Zap',   -- nazwa ikony Lucide
  sort_order  INT         DEFAULT 0,
  is_active   BOOLEAN     DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tabela: faq_items (Sekcja "FAQ") ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS faq_items (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  question    TEXT        NOT NULL,
  answer      TEXT        NOT NULL,
  sort_order  INT         DEFAULT 0,
  is_active   BOOLEAN     DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE services     ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items    ENABLE ROW LEVEL SECURITY;

-- Publiczny odczyt aktywnych rekordów
CREATE POLICY "Publiczny odczyt page_content"
  ON page_content FOR SELECT USING (true);

CREATE POLICY "Publiczny odczyt aktywnych usług"
  ON services FOR SELECT USING (is_active = true);

CREATE POLICY "Publiczny odczyt aktywnych FAQ"
  ON faq_items FOR SELECT USING (is_active = true);

-- Service role — pełny dostęp
CREATE POLICY "Service role — pełny dostęp do page_content"
  ON page_content FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role — pełny dostęp do services"
  ON services FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role — pełny dostęp do faq_items"
  ON faq_items FOR ALL USING (auth.role() = 'service_role');

-- ─── Triggery updated_at ─────────────────────────────────────────────────────

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_faq_items_updated_at
  BEFORE UPDATE ON faq_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_page_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_page_content_updated_at
  BEFORE UPDATE ON page_content
  FOR EACH ROW EXECUTE FUNCTION update_page_content_updated_at();

-- ─── Dane domyślne: page_content ─────────────────────────────────────────────

INSERT INTO page_content (key, value, label, section) VALUES
  ('hero_title',       'Automatyzujemy Twój Biznes z&nbsp;AI', 'Tytuł Hero', 'hero'),
  ('hero_description', 'Wdrażamy chatboty, integracje n8n i systemy RAG, które oszczędzają czas, redukują koszty i skalują operacje.', 'Opis Hero', 'hero'),
  ('hero_cta_primary', 'Umów Konsultację', 'Przycisk CTA (główny)', 'hero'),
  ('hero_cta_secondary','Poznaj Nasze Usługi', 'Przycisk CTA (drugorzędny)', 'hero'),
  ('about_title',      'Dlaczego Automatyzacja?', 'Tytuł sekcji "O nas"', 'about'),
  ('about_text',       'Pomagamy firmom odzyskać czas i zasoby dzięki inteligentnym automatyzacjom opartym na AI i n8n.', 'Tekst sekcji "O nas"', 'about'),
  ('cta_title',        'Gotowy na automatyzację?', 'Tytuł CTA (dolny)', 'cta'),
  ('cta_description',  'Skontaktuj się z nami i umów bezpłatną konsultację.', 'Opis CTA (dolny)', 'cta')
ON CONFLICT (key) DO NOTHING;
