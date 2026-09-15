-- 022_blog_scenariusze.sql
-- Uczciwość artykułów w indeksie, decyzja właściciela z 15 września 2026.
--
-- 1. Sześć artykułów opisywało wymyślone wdrożenia tak, jakby się wydarzyły: firmy z nazwami,
--    procenty wyników. Standard pisarski zabrania powoływania się na scenariusze poglądowe
--    jak na zrealizowane wdrożenia. Etykieta zmienia się na „Scenariusz poglądowy”,
--    tak jak w czterech artykułach, które oznaczały to od początku.
-- 2. Z artykułu o rekrutacji znika cytat wymyślonej osoby, bo pod żadną etykietą nie jest prawdą.
-- 3. W tym samym artykule zdanie „AI jest wolna od takich uprzedzeń” zastępuje informacja,
--    że AI Act zalicza systemy do filtrowania kandydatur do wysokiego ryzyka
--    (rozporządzenie 2024/1689, załącznik III, punkt 4).
-- 4. Przegląd nowości z 14 września wychodzi z indeksu, jak osiemnaście poprzednich w migracji 020.
--    Opublikował go stary workflow, który działa na main do scalenia pull requesta 22.
--
-- Zabezpieczenia jak w 021: fragment musi wystąpić dokładnie raz, zmiana już wprowadzona
-- jest pomijana, a każdy inny rozjazd przerywa migrację w całości.

DO $$
DECLARE
  zmiana RECORD;
  tresc TEXT;
  pozycja INT;
BEGIN
  FOR zmiana IN
    SELECT * FROM (VALUES
    ('ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n',
     '**Przykład/Case Study:** Firma XYZ',
     '**Scenariusz poglądowy:** Firma XYZ'),
    ('ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n',
     '**Przykład/Case Study:** W firmie produkcyjnej ABC',
     '**Scenariusz poglądowy:** W firmie produkcyjnej ABC'),
    ('ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n',
     '**Przykład/Case Study:** Przedsiębiorstwo budowlane DEF',
     '**Scenariusz poglądowy:** Przedsiębiorstwo budowlane DEF'),
    ('ai-w-sprzedazy-i-marketingu-msp-przewaga-konkurencyjna',
     '**Przykład z życia MSP:** Wyobraź sobie',
     '**Scenariusz poglądowy:** Wyobraź sobie'),
    ('ai-w-sprzedazy-i-marketingu-msp-przewaga-konkurencyjna',
     '**Przykład zastosowania:** Mała agencja',
     '**Scenariusz poglądowy:** Mała agencja'),
    ('ai-w-sprzedazy-i-marketingu-msp-przewaga-konkurencyjna',
     '**Konkretny przykład dla MSP:** Firma szkoleniowa',
     '**Scenariusz poglądowy:** Firma szkoleniowa'),
    ('ai-w-sprzedazy-i-marketingu-msp-przewaga-konkurencyjna',
     '**Praktyczny przykład:** Dział sprzedaży',
     '**Scenariusz poglądowy:** Dział sprzedaży'),
    ('ai-w-ofertach-i-wycenach-msp-szybka-sprzedaz-wieksze-zyski',
     '## Case Study: Od Tygodni do Godzin',
     '## Scenariusz poglądowy: Od Tygodni do Godzin'),
    ('ai-w-analizie-danych-msp-lepsze-decyzje',
     '**Przykład z życia MSP: Piekarnia',
     '**Scenariusz poglądowy: Piekarnia'),
    ('ai-w-zarzadzaniu-projektami-msp-kontrola-wyniki',
     '### 4. Case Study: Jak Agencja Marketingowa',
     '### 4. Scenariusz poglądowy: Jak Agencja Marketingowa'),
    ('ai-w-rekrutacji-msp-najlepsi-pracownicy',
     '**Przykład:** Mała firma deweloperska',
     '**Scenariusz poglądowy:** Mała firma deweloperska'),
    ('ai-w-rekrutacji-msp-najlepsi-pracownicy',
     '### Case Study: Jak Przedsiębiorstwo Logistyczne Zrewolucjonizowało Rekrutację',
     '### Scenariusz poglądowy: Jak Przedsiębiorstwo Logistyczne Zmieniło Rekrutację'),
    ('ai-w-rekrutacji-msp-najlepsi-pracownicy',
     E'Pan Adam podkreśla, że dzięki AI jego firma może skupić się na budowaniu relacji z najlepszymi kandydatami, zamiast tonąć w papierkowej robocie. "AI nie zastąpiło naszych rekruterów, ale uczyniło ich pracę znacznie bardziej efektywną i strategiczną" – mówi.\n\n',
     ''),
    ('ai-w-rekrutacji-msp-najlepsi-pracownicy',
     'AI jest wolna od takich uprzedzeń. Skupia się wyłącznie na danych: umiejętnościach, doświadczeniu, kwalifikacjach.',
     'AI nie jest jednak od nich wolna. Model uczony na dawnych decyzjach rekrutacyjnych powtarza uprzedzenia, które w tych decyzjach były. Dlatego [AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj) zalicza systemy do analizy i filtrowania kandydatur do systemów wysokiego ryzyka, z obowiązkami dotyczącymi jakości danych i nadzoru człowieka.')
    ) AS t(slug, stary, nowy)
  LOOP
    SELECT content INTO tresc FROM posts WHERE slug = zmiana.slug;

    IF tresc IS NULL THEN
      RAISE EXCEPTION 'Brak artykułu: %', zmiana.slug;
    END IF;

    pozycja := strpos(tresc, zmiana.stary);

    -- Już wprowadzone: starego fragmentu nie ma, a nowy stoi w treści albo był usunięciem.
    CONTINUE WHEN pozycja = 0 AND (zmiana.nowy = '' OR strpos(tresc, zmiana.nowy) > 0);

    IF pozycja = 0 THEN
      RAISE EXCEPTION 'W artykule % nie ma fragmentu: %', zmiana.slug, left(zmiana.stary, 80);
    END IF;
    IF strpos(substr(tresc, pozycja + length(zmiana.stary)), zmiana.stary) > 0 THEN
      RAISE EXCEPTION 'W artykule % fragment występuje więcej niż raz: %', zmiana.slug, left(zmiana.stary, 80);
    END IF;

    UPDATE posts
    SET content = overlay(tresc PLACING zmiana.nowy FROM pozycja FOR length(zmiana.stary))
    WHERE slug = zmiana.slug;
  END LOOP;
END $$;

UPDATE posts SET noindex = TRUE
WHERE slug LIKE 'nowosci-ai-%' AND noindex = FALSE;

-- ─── Weryfikacja ─────────────────────────────────────────────────────────────
-- Pierwsze zapytanie: dziesięć artykułów w indeksie, zero przeglądów nowości.
--
--   SELECT count(*) AS w_indeksie,
--          count(*) FILTER (WHERE slug LIKE 'nowosci-ai-%') AS przegladow
--   FROM posts WHERE is_published AND noindex = false;
--
-- Drugie: zero wierszy, czyli nigdzie w indeksie nie zostało „Case Study” ani cytatu.
--
--   