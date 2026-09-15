-- 020_blog_przeglad.sql
-- Zastosowanie decyzji z docs/seo/przeglad-artykulow.md, zaakceptowanych 11 września 2026.
--
-- Wyłączenie z indeksu jest odwracalne jedną zmianą wartości, więc nie jest decyzją
-- na zawsze. Artykuły zostają pod swoimi adresami i są dostępne dla czytelnika —
-- znikają wyłącznie z wyników wyszukiwania i z mapy strony.

-- ─── 1. Osiemnaście przeglądów nowości ───────────────────────────────────────
-- Powtarzają newsy sprzed miesięcy, żaden nie ma przypisanej frazy, a razem stanowiły
-- ponad połowę bloga. Od teraz przegląd wychodzi mailem, więc nowe już nie przybędą.

UPDATE posts SET noindex = TRUE
WHERE slug LIKE 'nowosci-ai-%';

-- ─── 2. Trzy artykuły o tematach spoza oferty ────────────────────────────────
-- Projektowanie graficzne, opieka zdrowotna i bezpieczeństwo modeli. Żadnego z tych
-- tematów nie sprzedajemy, więc ruch z nich nie ma dokąd prowadzić.

UPDATE posts SET noindex = TRUE
WHERE slug IN (
  'claude-design-ai-dla-projektowania-bez-designera',
  'chatgpt-w-opiece-zdrowotnej-rewolucja-dla-klinik',
  'rewolucja-ai-z-hamulcem-grozne-modele'
);

-- ─── 3. Frazy docelowe dla artykułów zostających w indeksie ──────────────────
-- Cztery pierwsze to teksty do odświeżenia: mają frazę z realnym popytem
-- i tylko jej nie używają. Piąty zostaje bez zmian redakcyjnych, ale dostaje frazę,
-- żeby było wiadomo, czego dotyczy.
-- Wolumeny z data/seo/wolumeny.csv.

UPDATE posts SET target_keyword = 'automatyzacja ai n8n'
WHERE slug = 'ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n';

UPDATE posts SET target_keyword = 'baza wiedzy ai'
WHERE slug = 'ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp';

UPDATE posts SET target_keyword = 'automatyzacja obiegu dokumentów'
WHERE slug = 'automatyzacja-dokumentow-faktur-ai-msp';

UPDATE posts SET target_keyword = 'automatyzacja obsługi klienta'
WHERE slug = 'automatyzacja-obslugi-klienta-ai-rag-msp';

UPDATE posts SET target_keyword = 'automatyzacja sprzedaży'
WHERE slug = 'ai-w-sprzedazy-i-marketingu-msp-przewaga-konkurencyjna';

-- ─── Weryfikacja ─────────────────────────────────────────────────────────────
-- Po uruchomieniu to zapytanie ma pokazać 10 artykułów w indeksie i 21 wyłączonych.
--
--   SELECT noindex, count(*) FROM posts WHERE is_published GROUP BY noindex;
--
-- A to pięć artykułów z przypisaną frazą:
--
--   SELECT slug, target_keyword FROM posts WHERE target_keyword IS NOT NULL;
