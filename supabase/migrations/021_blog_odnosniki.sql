-- 021_blog_odnosniki.sql
-- Zadanie 10 planu trzeciego: odnośniki z dziesięciu artykułów w indeksie do stron usługowych
-- i do innych artykułów. Przed tą migracją żaden z nich nie prowadził do oferty.
--
-- Każda zmiana obejmuje odnośnikiem fragment, który już stoi w tekście, w miejscu, gdzie
-- temat się zgadza. Treść artykułów nie jest przepisywana. Artykuł o cyberbezpieczeństwie
-- dostaje jedną stronę usługową zamiast dwóch, bo standard pisarski zabrania wciskania
-- odnośnika do usługi, której temat nie dotyczy.
--
-- Zabezpieczenia:
-- - fragment musi wystąpić w treści dokładnie raz, inaczej migracja przerywa się w całości,
--   więc zmieniona w międzyczasie treść nie zostanie po cichu uszkodzona;
-- - fragment już objęty odnośnikiem jest pomijany, więc ponowne uruchomienie niczego nie psuje.

DO $$
DECLARE
  zmiana RECORD;
  tresc TEXT;
  pozycja INT;
BEGIN
  FOR zmiana IN
    SELECT * FROM (VALUES
    ('ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n',
     'Inteligentna Automatyzacja Procesów (IPA) to coś więcej',
     '[Inteligentna Automatyzacja Procesów](/uslugi/automatyzacja-procesow-biznesowych) (IPA) to coś więcej'),
    ('ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n',
     'link do odpowiedniego artykułu w wewnętrznej bazie wiedzy',
     'link do odpowiedniego artykułu w [wewnętrznej bazie wiedzy](/blog/ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp)'),
    ('ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n',
     'Przeprowadź audyt w swojej firmie',
     '[Przeprowadź audyt](/uslugi/audyt-i-doradztwo-ai) w swojej firmie'),
    ('ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n',
     'Pamiętaj o przeszkoleniu pracowników',
     'Pamiętaj o [przeszkoleniu pracowników](/uslugi/szkolenia-z-ai-dla-zespolow)'),
    ('automatyzacja-dokumentow-faktur-ai-msp',
     'Automatyzacja dokumentów i faktur z AI to konkretne narzędzie',
     '[Automatyzacja dokumentów i faktur z AI](/uslugi/automatyzacja-dokumentow-i-faktur) to konkretne narzędzie'),
    ('automatyzacja-dokumentow-faktur-ai-msp',
     '**integracji z istniejącymi systemami** (ERP, CRM, księgowymi)',
     '[**integracji z istniejącymi systemami**](/uslugi/automatyzacja-procesow-biznesowych) (ERP, CRM, księgowymi)'),
    ('automatyzacja-dokumentow-faktur-ai-msp',
     'przechwytywane przez scenariusz w Make.com',
     'przechwytywane przez [scenariusz w Make.com](/blog/ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n)'),
    ('automatyzacja-obslugi-klienta-ai-rag-msp',
     'które już posiadasz – Twojej własnej bazie wiedzy',
     'które już posiadasz – [Twojej własnej bazie wiedzy](/blog/ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp)'),
    ('automatyzacja-obslugi-klienta-ai-rag-msp',
     'samodzielnie lub z pomocą zewnętrznych specjalistów',
     'samodzielnie lub [z pomocą zewnętrznych specjalistów](/uslugi/audyt-i-doradztwo-ai)'),
    ('automatyzacja-obslugi-klienta-ai-rag-msp',
     'W Make czy n8n możesz stworzyć scenariusz',
     'W [Make czy n8n](/blog/ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n) możesz stworzyć scenariusz'),
    ('automatyzacja-obslugi-klienta-ai-rag-msp',
     '**Strona www:** Chatbot na Twojej stronie firmowej.',
     '**Strona www:** [Chatbot na Twojej stronie firmowej](/uslugi/agenci-ai-i-chatboty).'),
    ('ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp',
     'Zautomatyzowane narzędzia do OCR (optycznego rozpoznawania znaków)',
     '[Zautomatyzowane narzędzia do OCR](/uslugi/automatyzacja-dokumentow-i-faktur) (optycznego rozpoznawania znaków)'),
    ('ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp',
     'Make (dawniej Integromat) lub n8n.io do automatyzacji',
     '[Make (dawniej Integromat) lub n8n.io](/blog/ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n) do automatyzacji'),
    ('ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp',
     'Microsoft Teams (bot, który odpowiada na pytania)',
     'Microsoft Teams ([bot, który odpowiada na pytania](/uslugi/agenci-ai-i-chatboty))'),
    ('ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp',
     'Kluczem jest szkolenie, pokazanie korzyści',
     'Kluczem jest [szkolenie](/uslugi/szkolenia-z-ai-dla-zespolow), pokazanie korzyści'),
    ('ai-w-sprzedazy-i-marketingu-msp-przewaga-konkurencyjna',
     'pozwalają na tworzenie zaawansowanych automatyzacji między różnymi platformami',
     'pozwalają na [tworzenie zaawansowanych automatyzacji między różnymi platformami](/uslugi/automatyzacja-procesow-biznesowych)'),
    ('ai-w-sprzedazy-i-marketingu-msp-przewaga-konkurencyjna',
     'czyli generowanie rozszerzone o pobieranie danych',
     'czyli [generowanie rozszerzone o pobieranie danych](/blog/automatyzacja-obslugi-klienta-ai-rag-msp)'),
    ('ai-w-sprzedazy-i-marketingu-msp-przewaga-konkurencyjna',
     'Implementacja wewnętrznego systemu RAG polega',
     '[Implementacja wewnętrznego systemu RAG](/uslugi/agenci-ai-i-chatboty) polega'),
    ('ai-w-ofertach-i-wycenach-msp-szybka-sprzedaz-wieksze-zyski',
     'pozwalają na automatyczne wyzwalanie procesów tworzenia ofert',
     'pozwalają na [automatyczne wyzwalanie procesów tworzenia ofert](/uslugi/automatyzacja-procesow-biznesowych)'),
    ('ai-w-ofertach-i-wycenach-msp-szybka-sprzedaz-wieksze-zyski',
     'Twoja wewnętrzna baza wiedzy (broszury produktowe',
     '[Twoja wewnętrzna baza wiedzy](/blog/ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp) (broszury produktowe'),
    ('ai-w-ofertach-i-wycenach-msp-szybka-sprzedaz-wieksze-zyski',
     'handlowcy rozumieli, jak korzystać z nowych narzędzi',
     'handlowcy rozumieli, [jak korzystać z nowych narzędzi](/uslugi/szkolenia-z-ai-dla-zespolow)'),
    ('ai-w-analizie-danych-msp-lepsze-decyzje',
     'możesz tworzyć hiperpersonalizowane kampanie marketingowe',
     'możesz tworzyć [hiperpersonalizowane kampanie marketingowe](/blog/ai-w-sprzedazy-i-marketingu-msp-przewaga-konkurencyjna)'),
    ('ai-w-analizie-danych-msp-lepsze-decyzje',
     'zidentyfikować, gdzie automatyzacja jest najbardziej potrzebna',
     'zidentyfikować, [gdzie automatyzacja jest najbardziej potrzebna](/uslugi/audyt-i-doradztwo-ai)'),
    ('ai-w-analizie-danych-msp-lepsze-decyzje',
     'pozwalają na automatyczne zbieranie danych z różnych źródeł',
     'pozwalają na [automatyczne zbieranie danych z różnych źródeł](/uslugi/automatyzacja-procesow-biznesowych)'),
    ('forteca-firmy-ai-cyberbezpieczenstwo-msp',
     'narzędzia takie jak Make (dawniej Integromat) czy n8n, aby połączyć',
     'narzędzia takie jak [Make (dawniej Integromat) czy n8n](/blog/ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n), aby połączyć'),
    ('forteca-firmy-ai-cyberbezpieczenstwo-msp',
     'Dzięki temu automatyczne reakcje będą natychmiastowe',
     'Dzięki temu [automatyczne reakcje](/uslugi/automatyzacja-procesow-biznesowych) będą natychmiastowe'),
    ('ai-w-zarzadzaniu-projektami-msp-kontrola-wyniki',
     'AI może zoptymalizować przydział zadań do członków zespołu',
     'AI może [zoptymalizować przydział zadań do członków zespołu](/blog/ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n)'),
    ('ai-w-zarzadzaniu-projektami-msp-kontrola-wyniki',
     'budowanie własnych, prostych systemów predykcyjnych',
     '[budowanie własnych, prostych systemów predykcyjnych](/uslugi/strony-i-oprogramowanie-na-zamowienie)'),
    ('ai-w-zarzadzaniu-projektami-msp-kontrola-wyniki',
     'czy stworzysz własne, proste automatyzacje',
     'czy stworzysz [własne, proste automatyzacje](/uslugi/automatyzacja-procesow-biznesowych)'),
    ('ai-w-rekrutacji-msp-najlepsi-pracownicy',
     'Możesz stworzyć własnego chatbota, który wstępnie analizuje CV',
     'Możesz stworzyć [własnego chatbota](/uslugi/agenci-ai-i-chatboty), który wstępnie analizuje CV'),
    ('ai-w-rekrutacji-msp-najlepsi-pracownicy',
     'korzystając z bazy wiedzy firmy (implementacja RAG',
     'korzystając z [bazy wiedzy firmy](/blog/ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp) (implementacja RAG'),
    ('ai-w-rekrutacji-msp-najlepsi-pracownicy',
     'regularnie audytowane pod kątem potencjalnych błędów czy ukrytych uprzedzeń',
     '[regularnie audytowane pod kątem potencjalnych błędów czy ukrytych uprzedzeń](/uslugi/zgodnosc-z-ai-act)'),
    ('ai-w-zarzadzaniu-projektami-msp-kontrola-wyniki',
     '[zautomatyzujemy.pl](https://zautomatyzujemy.pl)',
     '[zautomatyzujemy.pl](/kontakt)')
    ) AS t(slug, stary, nowy)
  LOOP
    SELECT content INTO tresc FROM posts WHERE slug = zmiana.slug;

    IF tresc IS NULL THEN
      RAISE EXCEPTION 'Brak artykułu: %', zmiana.slug;
    END IF;

    CONTINUE WHEN strpos(tresc, zmiana.nowy) > 0;

    pozycja := strpos(tresc, zmiana.stary);
    IF pozycja = 0 THEN
      RAISE EXCEPTION 'W artykule % nie ma fragmentu: %', zmiana.slug, zmiana.stary;
    END IF;
    IF strpos(substr(tresc, pozycja + length(zmiana.stary)), zmiana.stary) > 0 THEN
      RAISE EXCEPTION 'W artykule % fragment występuje więcej niż raz: %', zmiana.slug, zmiana.stary;
    END IF;

    UPDATE posts
    SET content = overlay(tresc PLACING zmiana.nowy FROM pozycja FOR length(zmiana.stary))
    WHERE slug = zmiana.slug;
  END LOOP;
END $$;

-- ─── Weryfikacja ─────────────────────────────────────────────────────────────
-- Po uruchomieniu każdy artykuł w indeksie ma co najmniej jeden odnośnik do usługi.
-- Wynik: dziesięć wierszy, kolumna do_uslug od 1 do 3, do_artykulow od 1 do 2.
--
--   SELECT slug,
--     (SELECT count(*) FROM regexp_matches(content, '\]\(/uslugi/', 'g')) AS do_uslug,
--     (SELECT count(*) FROM regexp_matches(content, '\]\(/blog/', 'g')) AS do_artykulow
--   FROM posts WHERE is_published AND noindex = false ORDER BY slug;
