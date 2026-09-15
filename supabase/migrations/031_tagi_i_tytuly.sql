-- 031_tagi_i_tytuly.sql
-- Porządki na stronie (spec 2026-09-15-porzadki-strony-design.md):
-- 1. Dziesięć artykułów w indeksie dostaje czytelne tagi z polskimi znakami zamiast slugów.
-- 2. Pięć tytułów przechodzi z angielskiej konwencji wielkich liter na polską. Słowa bez zmian.
--
-- Dla każdego artykułu: wartość sprzed migracji → zmiana; wartość docelowa → pominięcie
-- (migracja już zastosowana); cokolwiek innego → wyjątek i nic się nie zapisuje.
-- nowy_tytul = NULL oznacza, że tytuł zostaje bez zmian.

DO $$
DECLARE
  zmiana record;
  obecny_tytul text;
  obecne_tagi text[];
BEGIN
  FOR zmiana IN
    SELECT * FROM (VALUES
    ('ai-w-ofertach-i-wycenach-msp-szybka-sprzedaz-wieksze-zyski',
     'AI w ofertach i wycenach: Jak MSP szybciej sprzedaje i więcej zarabia?',
     'AI w ofertach i wycenach: jak MSP szybciej sprzedaje i więcej zarabia?',
     ARRAY['ai-w-sprzedazy-msp','automatyzacja-ofert-i-wycen','optymalizacja-procesow-sprzedazowych','narzedzia-ai-dla-msp','oszczednosc-czasu-biznes'],
     ARRAY['Sprzedaż','Oferty']),
    ('ai-w-analizie-danych-msp-lepsze-decyzje',
     'AI w Analizie Danych: Jak MSP Podejmują Lepsze Decyzje i Wyprzedzają Konkurencję',
     'AI w analizie danych: jak MSP podejmują lepsze decyzje i wyprzedzają konkurencję',
     ARRAY['ai-w-analizie-danych','business-intelligence-msp','podejmowanie-decyzji','optymalizacja-biznesu','efektywnosc-biznesu','cyfrowa-transformacja','narzedzia-ai','oszczednosc-kosztow'],
     ARRAY['Analiza danych']),
    ('forteca-firmy-ai-cyberbezpieczenstwo-msp',
     'Forteca dla Twojej Firmy: Jak AI Wzmacnia Cyberbezpieczeństwo w MSP',
     'Forteca dla twojej firmy: jak AI wzmacnia cyberbezpieczeństwo w MSP',
     ARRAY['ai-w-cyberbezpieczenstwie','bezpieczenstwo-msp','ochrona-danych','automatyzacja-zagrozen','zarzadzanie-ryzykiem'],
     ARRAY['Cyberbezpieczeństwo']),
    ('ai-w-zarzadzaniu-projektami-msp-kontrola-wyniki',
     'AI w Zarządzaniu Projektami dla MSP: Większa Kontrola, Lepsze Wyniki',
     'AI w zarządzaniu projektami dla MSP: większa kontrola, lepsze wyniki',
     ARRAY['ai-w-zarzadzaniu-projektami','automatyzacja-msp','efektywnosc-biznesu','narzedzia-ai','optymalizacja-procesow','zarzadzanie-ryzykiem','planowanie-projektow','cyfrowa-transformacja','oszczednosc-czasu'],
     ARRAY['Zarządzanie projektami']),
    ('ai-w-rekrutacji-msp-najlepsi-pracownicy',
     'AI w Rekrutacji: Jak MSP Szybko i Obiektywnie Znajdują Najlepszych Pracowników',
     'AI w rekrutacji: jak MSP szybko i obiektywnie znajdują najlepszych pracowników',
     ARRAY['AI w rekrutacji','Automatyzacja HR','Rekrutacja MSP','Efektywność biznesu','Narzędzia AI','Oszczędność czasu','Innowacje HR','Optymalizacja procesów'],
     ARRAY['Rekrutacja','HR']),
    ('ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n',
     NULL::text,
     NULL::text,
     ARRAY['automatyzacja-procesow','integracje-ai','make-n8n','optymalizacja-msp','efektywnosc-biznesu','ai-w-biznesie','cyfrowa-transformacja','zarzadzanie-operacjami'],
     ARRAY['n8n','Integracje']),
    ('ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp',
     NULL::text,
     NULL::text,
     ARRAY['zarzadzanie-wiedza-ai','rag-w-biznesie','automatyzacja-msp','efektywnosc-biznesu','wiedza-firmowa','narzedzia-ai','cyfrowa-transformacja','optymalizacja-procesow'],
     ARRAY['Baza wiedzy','RAG']),
    ('ai-w-sprzedazy-i-marketingu-msp-przewaga-konkurencyjna',
     NULL::text,
     NULL::text,
     ARRAY['ai-w-sprzedazy','ai-w-marketingu','automatyzacja-sprzedazy','automatyzacja-marketingu','msp-ai','generowanie-leadow','content-marketing-ai','narzedzia-ai','rag-w-biznesie','personalizacja-ai'],
     ARRAY['Sprzedaż','CRM']),
    ('automatyzacja-dokumentow-faktur-ai-msp',
     NULL::text,
     NULL::text,
     ARRAY['automatyzacja-dokumentow','ai-w-biznesie','oszczednosc-kosztow','msp','faktury-ai','zarzadzanie-procesami','digitalizacja','narzedzia-ai'],
     ARRAY['Faktury','OCR','KSeF']),
    ('automatyzacja-obslugi-klienta-ai-rag-msp',
     NULL::text,
     NULL::text,
     ARRAY['ai-w-obsludze-klienta','rag','automatyzacja-msp','chatboty','oszczednosc-kosztow','bazy-wiedzy','efektywnosc-biznesu','sztuczna-inteligencja','cyfrowa-transformacja'],
     ARRAY['Obsługa klienta','Chatboty'])
    ) AS t(slug, stary_tytul, nowy_tytul, stare_tagi, nowe_tagi)
  LOOP
    SELECT title, tags INTO obecny_tytul, obecne_tagi FROM posts WHERE slug = zmiana.slug;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Brak artykułu: %', zmiana.slug;
    END IF;

    IF zmiana.nowy_tytul IS NOT NULL
       AND obecny_tytul IS DISTINCT FROM zmiana.stary_tytul
       AND obecny_tytul IS DISTINCT FROM zmiana.nowy_tytul THEN
      RAISE EXCEPTION 'Artykuł % ma nieoczekiwany tytuł: %', zmiana.slug, obecny_tytul;
    END IF;

    IF obecne_tagi IS DISTINCT FROM zmiana.stare_tagi
       AND obecne_tagi IS DISTINCT FROM zmiana.nowe_tagi THEN
      RAISE EXCEPTION 'Artykuł % ma nieoczekiwane tagi: %', zmiana.slug, obecne_tagi;
    END IF;

    UPDATE posts
    SET title = coalesce(zmiana.nowy_tytul, title),
        tags = zmiana.nowe_tagi
    WHERE slug = zmiana.slug
      AND (title IS DISTINCT FROM coalesce(zmiana.nowy_tytul, title)
           OR tags IS DISTINCT FROM zmiana.nowe_tagi);
  END LOOP;
END $$;

-- ─── Weryfikacja ─────────────────────────────────────────────────────────────
-- Zero wierszy:
--
--   SELECT slug, title, tags FROM posts
--   WHERE is_published AND noindex = false
--     AND (array_to_string(tags, ' ') ~ '[a-z]-[a-z]'
--          OR title ~ ': [A-ZĄĆĘŁŃÓŚŹŻ]');
