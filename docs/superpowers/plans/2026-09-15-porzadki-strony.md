# Porządki na stronie — plan wykonania

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Cel:** Case studies poza indeksem, czytelne tagi z polskimi znakami i tytuły w polskiej konwencji — bez możliwości odtworzenia usterek przez generator.

**Architektura:** Dwie małe zmiany w metadanych i mapie strony (warunek na `is_example`), usunięcie zamiany myślników w trzech komponentach, dwie reguły w standardzie pisarskim i wzorze promptu, jedna migracja SQL z blokiem `DO` sprawdzającym stan każdego wiersza przed zmianą.

**Stos:** Next.js App Router (TypeScript strict), Supabase (Postgres), skrypty Node w `.github/scripts/`.

**Spec:** `docs/superpowers/specs/2026-09-15-porzadki-strony-design.md`

---

## Zasady dla wykonawcy

- Pracujesz w `C:\Projects\zautomatyzujemy-porzadki` (gałąź `feat/porzadki-strony`). **Nie wchodź do `C:\Projects\zautomatyzujemy`** — tam jest gałąź Codeksa z jego niezacommitowaną zmianą. Nie dotykaj `app/uslugi/`, `.worktrees/`, `output/`, `tmp/`.
- Menedżer pakietów: wyłącznie `npm`. Żadnych nowych zależności.
- Pliki w repo mają końce linii CRLF. Zmieniaj je narzędziem Edit, nie `sed` ani `split('\n')`.
- Stron Next.js nie obejmują testy jednostkowe i nie dodajemy frameworka testowego. Zmiany w stronach sprawdza `type-check`, `build` i zapytanie HTTP do lokalnego serwera (Task 6). Migrację sprawdza zapytanie tylko do odczytu na produkcyjnej bazie (Task 5).
- Supabase MCP jest tylko do odczytu. Migracji nie uruchamiasz — robi to właściciel.
- Commit kończy się linią `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

## Mapa plików

| Plik | Zmiana | Task |
|---|---|---|
| `app/case-studies/[slug]/page.tsx` | `noindex` dla `is_example = true` | 2 |
| `app/sitemap.ts` | pominięcie scenariuszy poglądowych | 2 |
| `app/blog/_components/BlogCarousel.tsx` | bez zamiany myślników w tagach | 3 |
| `app/blog/[slug]/page.tsx` | bez zamiany myślników w tagach | 3 |
| `components/marketing/blog-preview.tsx` | bez zamiany myślników w kategorii | 3 |
| `docs/seo/editorial-standard.md` | reguły tytułu i tagów | 4 |
| `.github/scripts/blog-auto.mjs` | wzór tagów w odpowiedzi JSON | 4 |
| `supabase/migrations/031_tagi_i_tytuly.sql` | nowy plik | 5 |

---

### Task 1: Przygotowanie katalogu roboczego

**Pliki:** brak zmian w repo.

- [ ] **Krok 1: Zainstaluj zależności**

Run (w `C:\Projects\zautomatyzujemy-porzadki`): `npm ci`
Expected: kończy się bez `ERR!`.

- [ ] **Krok 2: Skopiuj zmienne środowiskowe**

`.env.local` nie jest w git, a `build` i lokalny serwer go potrzebują.

Run: `cp /c/Projects/zautomatyzujemy/.env.local /c/Projects/zautomatyzujemy-porzadki/.env.local`
Expected: plik istnieje; `git status --short` go nie pokazuje (jest w `.gitignore`).

- [ ] **Krok 3: Stan wyjściowy**

Run: `npm run type-check && npm run lint && npm test`
Expected: wszystko przechodzi. Jeśli coś nie przechodzi już teraz — zatrzymaj się i zgłoś, zanim cokolwiek zmienisz.

---

### Task 2: Case studies poza indeksem

**Pliki:**
- Modify: `app/case-studies/[slug]/page.tsx` (funkcja `generateMetadata`)
- Modify: `app/sitemap.ts` (zapytanie o `case_studies`)

- [ ] **Krok 1: Pobierz `is_example` w metadanych**

W `app/case-studies/[slug]/page.tsx` zamień:

```ts
    .select('title, description, cover_image')
```

na:

```ts
    .select('title, description, cover_image, is_example')
```

- [ ] **Krok 2: Dodaj `robots` do zwracanych metadanych**

W tym samym pliku zamień:

```ts
  return {
    title: data.title,
    description,
    alternates: {
      canonical: `/case-studies/${slug}`,
    },
```

na:

```ts
  return {
    title: data.title,
    description,
    // Scenariusz poglądowy ma za mało treści do indeksu. Realne wdrożenie
    // (is_example = false) wejdzie do indeksu bez zmian w kodzie.
    ...(data.is_example === true && { robots: { index: false, follow: true } }),
    alternates: {
      canonical: `/case-studies/${slug}`,
    },
```

Wzorzec `data.noindex === true && { robots: ... }` jest już w `app/blog/[slug]/page.tsx:78`.

- [ ] **Krok 3: Pomiń scenariusze w mapie strony**

W `app/sitemap.ts` zamień:

```ts
    supabase
      .from('case_studies')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('sort_order'),
```

na:

```ts
    supabase
      .from('case_studies')
      .select('slug, updated_at')
      .eq('is_active', true)
      // Scenariusze poglądowe mają noindex w metadanych — bez sprzecznego sygnału w mapie.
      .eq('is_example', false)
      .order('sort_order'),
```

Wpis `${baseUrl}/case-studies` (sama lista) zostaje bez zmian.

- [ ] **Krok 4: Sprawdź typy**

Run: `npm run type-check`
Expected: brak błędów.

- [ ] **Krok 5: Commit**

```bash
git add "app/case-studies/[slug]/page.tsx" app/sitemap.ts
git commit -m "fix(case-studies): scenariusze pogladowe poza indeksem i mapa strony

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Tagi wyświetlane tak, jak są zapisane

**Pliki:**
- Modify: `app/blog/_components/BlogCarousel.tsx`
- Modify: `app/blog/[slug]/page.tsx`
- Modify: `components/marketing/blog-preview.tsx`

Po migracji 031 tagi są gotowymi etykietami. Zamiana myślników na spacje rozbiłaby etykietę typu „E-commerce”.

- [ ] **Krok 1: Kafelek na liście bloga**

W `app/blog/_components/BlogCarousel.tsx` zamień:

```tsx
                          {tag.replace(/-/g, ' ')}
```

na:

```tsx
                          {tag}
```

- [ ] **Krok 2: Nagłówek artykułu**

W `app/blog/[slug]/page.tsx` zamień:

```tsx
                  {tag.replace(/-/g, ' ')}
```

na:

```tsx
                  {tag}
```

- [ ] **Krok 3: Sekcja bloga na stronie głównej**

W `components/marketing/blog-preview.tsx` zamień:

```ts
    category: (p.tags?.[0] ?? 'Blog').replace(/-/g, ' '),
```

na:

```ts
    category: p.tags?.[0] ?? 'Blog',
```

- [ ] **Krok 4: Upewnij się, że nic nie zostało**

Run: `grep -rn "replace(/-/g" app components`
Expected: brak wyników.

- [ ] **Krok 5: Sprawdź typy i lint**

Run: `npm run type-check && npm run lint`
Expected: brak błędów.

- [ ] **Krok 6: Commit**

```bash
git add app/blog/_components/BlogCarousel.tsx "app/blog/[slug]/page.tsx" components/marketing/blog-preview.tsx
git commit -m "fix(blog): tagi wyswietlane bez zamiany myslnikow

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Reguły dla nowych artykułów

**Pliki:**
- Modify: `docs/seo/editorial-standard.md` (sekcja „Struktura artykułu”)
- Modify: `.github/scripts/blog-auto.mjs` (wzór JSON w prompcie)

Standard czytają `blog-auto.mjs`, `social-posts.mjs` i redaktor w panelu (przez `scripts/seo/prompt-artykulu.mjs`), więc to jedyne miejsce na regułę. Redaktor w panelu opisuje tagi tylko schematem `z.array(z.string())`, bez własnego wzoru — nie wymaga zmiany.

- [ ] **Krok 1: Dopisz reguły do standardu**

W `docs/seo/editorial-standard.md` zamień:

```markdown
Długość wynika z tematu, nie z normy. Nie ma dolnego progu liczby słów i nie ma powodu
rozciągać tekstu, żeby wyglądał poważnie.
```

na:

```markdown
Długość wynika z tematu, nie z normy. Nie ma dolnego progu liczby słów i nie ma powodu
rozciągać tekstu, żeby wyglądał poważnie.

Tytuł piszemy po polsku: wielka litera tylko na początku, w nazwach własnych i w skrótowcach
(AI, MSP, KSeF). „Jak małe firmy podejmują lepsze decyzje”, nie „Jak Małe Firmy Podejmują Lepsze Decyzje”.

Tagi: dwa lub trzy, zwykłymi słowami po polsku, z polskimi znakami, dokładnie tak,
jak mają się wyświetlić na stronie. „Obsługa klienta”, nie „obsluga-klienta”.
```

- [ ] **Krok 2: Popraw wzór tagów w prompcie generatora**

W `.github/scripts/blog-auto.mjs` zamień:

```js
  "tags": ["[tag1]", "[tag2]", "[tag3]", "[tag4]"],
```

na:

```js
  "tags": ["[tag po polsku z polskimi znakami, np. Obsługa klienta]", "[drugi tag, np. Chatboty]"],
```

- [ ] **Krok 3: Testy skryptów**

Bramka jakości i prompt mają testy, które mogą czytać standard.

Run: `npm test`
Expected: wszystkie testy przechodzą, liczba testów taka sama jak w Task 1 Krok 3.

- [ ] **Krok 4: Commit**

```bash
git add docs/seo/editorial-standard.md .github/scripts/blog-auto.mjs
git commit -m "docs(seo): regula tytulow i tagow w standardzie i prompcie generatora

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Migracja 031 — tagi i tytuły

**Pliki:**
- Create: `supabase/migrations/031_tagi_i_tytuly.sql`

- [ ] **Krok 1: Sprawdź na produkcji, że wartości „sprzed” zgadzają się z bazą (przed napisaniem pliku)**

Uruchom przez Supabase MCP (`execute_sql`, tylko odczyt). To te same dane, które wejdą do migracji — literówka w tablicy tagów wyjdzie tutaj, a nie u właściciela.

```sql
SELECT t.slug,
       p.title = t.stary_tytul OR t.stary_tytul IS NULL AS tytul_zgodny,
       p.tags = t.stare_tagi AS tagi_zgodne
FROM (VALUES
  ('ai-w-ofertach-i-wycenach-msp-szybka-sprzedaz-wieksze-zyski',
   'AI w ofertach i wycenach: Jak MSP szybciej sprzedaje i więcej zarabia?',
   ARRAY['ai-w-sprzedazy-msp','automatyzacja-ofert-i-wycen','optymalizacja-procesow-sprzedazowych','narzedzia-ai-dla-msp','oszczednosc-czasu-biznes']),
  ('ai-w-analizie-danych-msp-lepsze-decyzje',
   'AI w Analizie Danych: Jak MSP Podejmują Lepsze Decyzje i Wyprzedzają Konkurencję',
   ARRAY['ai-w-analizie-danych','business-intelligence-msp','podejmowanie-decyzji','optymalizacja-biznesu','efektywnosc-biznesu','cyfrowa-transformacja','narzedzia-ai','oszczednosc-kosztow']),
  ('forteca-firmy-ai-cyberbezpieczenstwo-msp',
   'Forteca dla Twojej Firmy: Jak AI Wzmacnia Cyberbezpieczeństwo w MSP',
   ARRAY['ai-w-cyberbezpieczenstwie','bezpieczenstwo-msp','ochrona-danych','automatyzacja-zagrozen','zarzadzanie-ryzykiem']),
  ('ai-w-zarzadzaniu-projektami-msp-kontrola-wyniki',
   'AI w Zarządzaniu Projektami dla MSP: Większa Kontrola, Lepsze Wyniki',
   ARRAY['ai-w-zarzadzaniu-projektami','automatyzacja-msp','efektywnosc-biznesu','narzedzia-ai','optymalizacja-procesow','zarzadzanie-ryzykiem','planowanie-projektow','cyfrowa-transformacja','oszczednosc-czasu']),
  ('ai-w-rekrutacji-msp-najlepsi-pracownicy',
   'AI w Rekrutacji: Jak MSP Szybko i Obiektywnie Znajdują Najlepszych Pracowników',
   ARRAY['AI w rekrutacji','Automatyzacja HR','Rekrutacja MSP','Efektywność biznesu','Narzędzia AI','Oszczędność czasu','Innowacje HR','Optymalizacja procesów']),
  ('ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n',
   NULL,
   ARRAY['automatyzacja-procesow','integracje-ai','make-n8n','optymalizacja-msp','efektywnosc-biznesu','ai-w-biznesie','cyfrowa-transformacja','zarzadzanie-operacjami']),
  ('ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp',
   NULL,
   ARRAY['zarzadzanie-wiedza-ai','rag-w-biznesie','automatyzacja-msp','efektywnosc-biznesu','wiedza-firmowa','narzedzia-ai','cyfrowa-transformacja','optymalizacja-procesow']),
  ('ai-w-sprzedazy-i-marketingu-msp-przewaga-konkurencyjna',
   NULL,
   ARRAY['ai-w-sprzedazy','ai-w-marketingu','automatyzacja-sprzedazy','automatyzacja-marketingu','msp-ai','generowanie-leadow','content-marketing-ai','narzedzia-ai','rag-w-biznesie','personalizacja-ai']),
  ('automatyzacja-dokumentow-faktur-ai-msp',
   NULL,
   ARRAY['automatyzacja-dokumentow','ai-w-biznesie','oszczednosc-kosztow','msp','faktury-ai','zarzadzanie-procesami','digitalizacja','narzedzia-ai']),
  ('automatyzacja-obslugi-klienta-ai-rag-msp',
   NULL,
   ARRAY['ai-w-obsludze-klienta','rag','automatyzacja-msp','chatboty','oszczednosc-kosztow','bazy-wiedzy','efektywnosc-biznesu','sztuczna-inteligencja','cyfrowa-transformacja'])
) AS t(slug, stary_tytul, stare_tagi)
LEFT JOIN posts p ON p.slug = t.slug
ORDER BY t.slug;
```

Expected: 10 wierszy, w każdym `tytul_zgodny = true` i `tagi_zgodne = true`. Jeśli którykolwiek jest `false` albo `null` — popraw literał według bazy (odczytaj `SELECT slug, title, tags FROM posts WHERE slug = '…'`) i powtórz. Nie przechodź dalej, dopóki wszystkie są `true`.

- [ ] **Krok 2: Napisz plik migracji**

Create `supabase/migrations/031_tagi_i_tytuly.sql` — literały „sprzed” identyczne jak w zapytaniu z Kroku 1:

```sql
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
```

Uwaga do weryfikacji: `': [A-ZĄĆĘŁŃÓŚŹŻ]'` wyłapuje wielką literę po dwukropku, czyli wzór wszystkich pięciu starych tytułów. Tytuły pozostałych artykułów w indeksie mają małą literę po dwukropku (sprawdzone 2026-09-15).

- [ ] **Krok 3: Sprawdź, że zapytanie weryfikacyjne dziś trafia w usterki**

Uruchom przez Supabase MCP zapytanie weryfikacyjne (bez komentarzy `--`).
Expected **przed** migracją: dokładnie 10 wierszy (wszystkie artykuły w indeksie mają tagi-slugi albo tytuł z wielką literą po dwukropku). Jeśli wynik jest inny — zapytanie jest złe; zgłoś, zanim zacommitujesz.

- [ ] **Krok 4: Commit**

```bash
git add supabase/migrations/031_tagi_i_tytuly.sql
git commit -m "feat(blog): migracja 031 - czytelne tagi i polska konwencja tytulow

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Weryfikacja całości i PR

**Pliki:** brak zmian.

- [ ] **Krok 1: Pełne sprawdzenie**

Run: `npm run type-check && npm run lint && npm test && npm run build`
Expected: wszystko przechodzi.

- [ ] **Krok 2: Uruchom zbudowaną stronę lokalnie**

Run (w tle): `npx next start -p 3100`
Expected: w logu `Ready`.

- [ ] **Krok 3: `noindex` na podstronie case study**

Run: `curl -s http://localhost:3100/case-studies/oszczednosc-czasu-fintech | grep -o '<meta name="robots"[^>]*>'`
Expected: `<meta name="robots" content="noindex, follow"/>`

Run: `curl -s http://localhost:3100/case-studies | grep -o '<meta name="robots"[^>]*>'`
Expected: brak `noindex` (lista zostaje w indeksie; pusty wynik albo `index, follow`).

- [ ] **Krok 4: Mapa strony**

Run: `curl -s http://localhost:3100/sitemap.xml | grep -o '<loc>[^<]*case-studies[^<]*</loc>'`
Expected: dokładnie jedna linia, kończąca się na `/case-studies</loc>` — bez podstron.

- [ ] **Krok 5: Zatrzymaj serwer**

Zatrzymaj proces `next start` uruchomiony w Kroku 2.

- [ ] **Krok 6: Wypchnij gałąź i otwórz PR**

```bash
git push -u origin feat/porzadki-strony
gh pr create --base main --title "Porządki: case studies poza indeksem, czytelne tagi i tytuły" --body "$(cat <<'EOF'
## Co zmienia

- Podstrony case studies oznaczone `is_example` dostają `noindex, follow` i wypadają z `sitemap.xml`. Lista `/case-studies` zostaje.
- Tagi wyświetlane tak, jak są zapisane (bez zamiany myślników) na liście bloga, w artykule i na stronie głównej.
- Standard pisarski i prompt generatora: tytuły w polskiej konwencji, tagi po polsku z polskimi znakami.
- Migracja `031_tagi_i_tytuly.sql`: czytelne tagi dla 10 artykułów, poprawiona wielkość liter w 5 tytułach.

## Do zrobienia po stronie właściciela

Uruchomić `supabase/migrations/031_tagi_i_tytuly.sql` w Supabase, potem zapytanie weryfikacyjne z końca pliku (oczekiwane zero wierszy). Kod działa poprawnie przed migracją i po niej.

Spec: `docs/superpowers/specs/2026-09-15-porzadki-strony-design.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: link do PR.

---

## Po scaleniu (właściciel i kontroler)

1. Właściciel uruchamia migrację 031 i zapytanie weryfikacyjne — zero wierszy.
2. Na produkcji: `https://www.zautomatyzujemy.pl/case-studies/oszczednosc-czasu-fintech` ma `noindex, follow`; `https://www.zautomatyzujemy.pl/sitemap.xml` nie ma podstron case studies; kafelki na `/blog` pokazują „Sprzedaż”, „n8n”, „Faktury” itd.
3. Katalog roboczy `C:\Projects\zautomatyzujemy-porzadki` można usunąć: `git worktree remove ../zautomatyzujemy-porzadki` (z głównego katalogu).
