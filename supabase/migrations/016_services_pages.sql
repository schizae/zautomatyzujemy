-- 016_services_pages.sql
-- Rozszerza services o pola potrzebne stronom /uslugi/<slug>.
-- Slug jest kluczem trasy, więc musi być unikalny i niepusty.

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS slug            TEXT,
  ADD COLUMN IF NOT EXISTS subtitle        TEXT,
  ADD COLUMN IF NOT EXISTS content         TEXT,
  ADD COLUMN IF NOT EXISTS seo_title       TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- Slugi dla sześciu istniejących usług, dopasowane po sort_order
UPDATE services SET slug = 'automatyzacja-procesow-biznesowych'   WHERE sort_order = 1;
UPDATE services SET slug = 'chatboty-i-asystenci-ai'              WHERE sort_order = 2;
UPDATE services SET slug = 'automatyzacja-dokumentow-i-faktur'    WHERE sort_order = 3;
UPDATE services SET slug = 'audyt-i-doradztwo-ai'                 WHERE sort_order = 4;
UPDATE services SET slug = 'szkolenia-z-ai-dla-zespolow'          WHERE sort_order = 5;
UPDATE services SET slug = 'strony-i-oprogramowanie-na-zamowienie' WHERE sort_order = 6;

-- Siódma usługa: AI Act. Była tylko na stronie głównej, nigdy w bazie,
-- więc chatbot o niej nie wiedział.
INSERT INTO services (title, description, icon, sort_order, is_active, slug)
VALUES (
  'Zgodność z AI Act',
  'Unijne rozporządzenie o sztucznej inteligencji obowiązuje od 2 sierpnia 2026 i dotyczy także firm, które tylko korzystają z gotowych narzędzi AI. Sprawdzam, co Cię obowiązuje, i pomagam wdrożyć wymagane mechanizmy.',
  'Shield', 7, TRUE, 'zgodnosc-z-ai-act'
)
ON CONFLICT DO NOTHING;

-- Dopiero po wypełnieniu wszystkich wierszy można zabezpieczyć kolumnę
ALTER TABLE services ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS services_slug_key ON services (slug);
