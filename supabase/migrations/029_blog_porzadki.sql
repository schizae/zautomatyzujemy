-- 029_blog_porzadki.sql
-- Porządki w czterech artykułach, które zostają w indeksie bez odświeżenia, 15 września 2026.
--
-- 1. Usunięcie nagłówka powtarzającego tytuł na początku treści. Strona artykułu renderuje tytuł
--    jako H1, więc treść dodawała drugi. Generator migracji sprawdził, że usuwany nagłówek
--    to dokładnie tytuł artykułu.
-- 2. „Zrewolucjonizować” i „Rewolucjonizuje” z czarnej listy standardu pisarskiego zastąpione
--    zwykłym czasownikiem. Nagłówek z pytaniem retorycznym zamieniony na zdanie.
--
-- Artykuł o cyberbezpieczeństwie nie ma żadnego z tych problemów, więc go tu nie ma.
-- Treść pozostałych zdań się nie zmienia.
--
-- Zabezpieczenia jak w 022: fragment musi wystąpić dokładnie raz, zmiana już wprowadzona
-- jest pomijana, każdy inny rozjazd przerywa migrację w całości.

DO $$
DECLARE
  zmiana RECORD;
  tresc TEXT;
  pozycja INT;
BEGIN
  FOR zmiana IN
    SELECT * FROM (VALUES
    (E'ai-w-analizie-danych-msp-lepsze-decyzje',
     E'# AI w Analizie Danych: Jak MSP Podejmują Lepsze Decyzje i Wyprzedzają Konkurencję\n\n',
     E''),
    (E'ai-w-analizie-danych-msp-lepsze-decyzje',
     E'w których AI może zrewolucjonizować Twoje podejmowanie decyzji:',
     E'w których AI może zmienić sposób podejmowania decyzji w Twojej firmie:'),
    (E'ai-w-analizie-danych-msp-lepsze-decyzje',
     E'w których AI może zrewolucjonizować analizę danych w Twojej firmie',
     E'w których AI może usprawnić analizę danych w Twojej firmie'),
    (E'ai-w-ofertach-i-wycenach-msp-szybka-sprzedaz-wieksze-zyski',
     E'# AI w Ofertach i Wycenach: Jak MSP Szybciej Sprzedaje i Więcej Zarabia?\n\n',
     E''),
    (E'ai-w-ofertach-i-wycenach-msp-szybka-sprzedaz-wieksze-zyski',
     E'## Jak AI Rewolucjonizuje Proces Tworzenia Ofert i Wycen?',
     E'## Jak AI zmienia tworzenie ofert i wycen'),
    (E'ai-w-ofertach-i-wycenach-msp-szybka-sprzedaz-wieksze-zyski',
     E'Nie próbuj zrewolucjonizować wszystkiego od razu.',
     E'Nie próbuj zmieniać wszystkiego naraz.'),
    (E'ai-w-rekrutacji-msp-najlepsi-pracownicy',
     E'# AI w Rekrutacji: Jak MSP Szybko i Obiektywnie Znajdują Najlepszych Pracowników\n\n',
     E''),
    (E'ai-w-rekrutacji-msp-najlepsi-pracownicy',
     E'które może zrewolucjonizować sposób, w jaki',
     E'które może zmienić sposób, w jaki'),
    (E'ai-w-zarzadzaniu-projektami-msp-kontrola-wyniki',
     E'## AI w Zarządzaniu Projektami dla MSP: Większa Kontrola, Lepsze Wyniki\n\n',
     E''),
    (E'ai-w-zarzadzaniu-projektami-msp-kontrola-wyniki',
     E'jak AI może zrewolucjonizować zarządzanie projektami',
     E'jak AI może usprawnić zarządzanie projektami')
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

-- ─── Weryfikacja ─────────────────────────────────────────────────────────────
-- Zero wierszy: żaden artykuł w indeksie nie zaczyna treści od nagłówka
-- i nie ma „rewolucj” w treści.
--
--   SELECT slug FROM posts
--   WHERE is_published AND noindex = false
--     AND (content ~ '^#{1,2} ' OR content ILIKE '%rewolucj%');
