# Faza A — higiena treści i pomiar. Plan wdrożenia

> **Dla agentów wykonawczych:** WYMAGANY SUB-SKILL: użyj `subagent-driven-development` (zalecane) lub `executing-plans` do realizacji zadanie po zadaniu. Kroki mają składnię checkboxów (`- [ ]`).

**Cel:** Doprowadzić zautomatyzujemy.pl do stanu, w którym treść jest rzetelna i zgodna z prawem, chatbot nie cytuje danych testowych, a ruch da się mierzyć.

**Architektura:** Treści usług i FAQ trafiają do Supabase migracją SQL (wersjonowaną w gicie), skąd czyta je panel admina, skrypt embeddingów i — po podpięciu — sekcja FAQ na stronie głównej. Case studies dostają kolumnę `is_example` sterującą widoczną etykietą na podstronach. Pomiar opiera się na bezcookiesowym Vercel Web Analytics, więc baner zgód i polityka prywatności pozostają bez zmian strukturalnych.

**Stos:** Next.js 15 App Router, TypeScript strict, Supabase, Tailwind, `@vercel/analytics`.

**Specyfikacja:** `docs/superpowers/specs/2026-08-05-faza-a-higiena-i-pomiar-design.md`

---

## Stan wyjściowy (zweryfikowany 2026-08-05)

| Fakt | Wartość |
|---|---|
| Ostatnia migracja | `008_lead_details.sql` → następna to **009** |
| `services` — wierszy | 1 testowy; czyta panel admina i `scripts/generate-embeddings.mjs:130` |
| `services` — renderowanie publiczne | **brak** — `ServicesSection` ma treść zaszytą w kodzie, nie przyjmuje propsów |
| `faq_items` — wierszy | 1 testowy |
| `FaqSection` | istnieje, **nigdzie nieimportowany**, ostylowany pod nieaktualny jasny motyw |
| `case_studies` | 3 fikcyjne; strona główna oznacza je poprawnie, podstrony twierdzą, że to realizacje |
| Adresy kontaktowe | niespójne: `biuro@` (5 wystąpień) i `kontakt@` (4) |
| Typy | `Service`, `FaqItem`, `CaseStudy` w `types/index.ts:93-132` |
| Runner testów | brak skryptu `test` w `package.json` |

**Konsekwencja braku runnera:** weryfikacja opiera się na `pnpm type-check`, `pnpm lint`, `pnpm build`, zapytaniach SQL i oględzinach w przeglądarce. Testy jednostkowe wymagałyby Vitest — nowa zależność, poza zakresem.

---

## Wymagania wstępne (tylko właściciel)

- [ ] **Zdecydować, który adres kontaktowy jest właściwy** — `biuro@zautomatyzujemy.pl` czy `kontakt@zautomatyzujemy.pl`, i potwierdzić, że skrzynka faktycznie odbiera pocztę. Blokuje Zadanie 8.
- [ ] **Podać dane administratora danych** — imię i nazwisko do polityki prywatności. Blokuje Zadanie 8.
- [ ] **Zdecydować o nazewnictwie firmy** — patrz Zadanie 10, gdzie są dwa warianty do wyboru. Blokuje Zadanie 10.
- [ ] **Włączyć Web Analytics** w panelu Vercela: Project → Analytics → Enable. Blokuje weryfikację Zadania 13.
- [ ] **Założyć wizytówkę Google** w trybie firmy usługowej: https://business.google.com → nowy profil → kategoria „Usługi informatyczne" → przy pytaniu o adres wybrać „Nie, obsługuję klientów w ich lokalizacji" → obszar: Chojnice i okolice. Adres podawany wyłącznie do weryfikacji, publicznie niewidoczny. Dane NAP muszą być identyczne z `LocalBusiness` JSON-LD po Zadaniu 9: nazwa `Zautomatyzujemy.pl`, telefon `+48730094465`, miejscowość Chojnice.
- [ ] **Pobrać token weryfikacyjny Search Console** — https://search.google.com/search-console → Dodaj zasób → prefiks URL `https://zautomatyzujemy.pl` → metoda „tag HTML" → skopiować wartość `content`. Blokuje Zadanie 14.

---

## Struktura plików

| Plik | Odpowiedzialność | Akcja |
|---|---|---|
| `supabase/migrations/009_seed_content.sql` | treści usług i FAQ, kolumna `is_example` | nowy |
| `types/index.ts` | pole `is_example` w `CaseStudy` | modyfikacja |
| `app/case-studies/page.tsx` | usunięcie twierdzeń o realizacjach, etykieta na kaflu | modyfikacja |
| `app/case-studies/[slug]/page.tsx` | etykieta i zdanie wyjaśniające w treści | modyfikacja |
| `components/marketing/case-study-section.tsx` | usunięcie zduplikowanego `fallbackCases` | modyfikacja |
| `components/marketing/faq-section.tsx` | przestylowanie na ciemny motyw | modyfikacja |
| `app/page.tsx` | osadzenie FAQ, schemat FAQPage, adres w JSON-LD | modyfikacja |
| `scripts/generate-embeddings.mjs` | oznaczenie case studies jako przykładów | modyfikacja |
| `app/privacy-policy/page.tsx` | administrator danych, wzmianka o analityce | modyfikacja |
| `app/sitemap.ts` | wpis `/ai-act-checklist` | modyfikacja |
| `app/layout.tsx` | `<Analytics />`, weryfikacja Search Console | modyfikacja |

---

# CZĘŚĆ A1 — wiarygodność treści

### Zadanie 1: Migracja 009 — treści i kolumna `is_example`

**Pliki:**
- Utworzenie: `supabase/migrations/009_seed_content.sql`

- [ ] **Krok 1: Utwórz plik migracji**

```sql
-- ============================================================
-- Migracja 009: Rzetelne treści usług i FAQ + oznaczenie case studies
-- Projekt: Zautomatyzujemy.pl
-- Wykonaj w: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── Case studies: rozróżnienie przykładu od realizacji ──────────────────────
-- Kolumna jest potrzebna zanim pojawi się pierwszy prawdziwy klient. Zaszycie
-- etykiety w komponencie oznaczałoby zmianę kodu przy pierwszej referencji
-- i ryzyko oznaczenia realnego wdrożenia jako fikcji.
ALTER TABLE case_studies
  ADD COLUMN IF NOT EXISTS is_example BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN case_studies.is_example IS 'TRUE = scenariusz poglądowy, nie zrealizowane wdrożenie';

-- Tytuły opisują rozwiązanie zamiast obiecywać niesprawdzalny wynik.
-- Slugi zostają — są w sitemapie, linkach i jako klucze source w bazie wiedzy RAG.
UPDATE case_studies SET
  title = 'Biuro rachunkowe: automatyzacja księgowania faktur z maili',
  description = 'Faktury przychodzące na skrzynkę są odczytywane automatycznie — numer, kwota, termin i kontrahent trafiają do systemu księgowego bez przepisywania z PDF-a.',
  is_example = TRUE
WHERE slug = 'oszczednosc-czasu-fintech';

UPDATE case_studies SET
  title = 'Platforma SaaS: asystent AI dla wsparcia technicznego',
  description = 'Asystent oparty na bazie wiedzy produktu odpowiada na powtarzalne pytania użytkowników i przekazuje zespołowi tylko te zgłoszenia, które wymagają człowieka.',
  is_example = TRUE
WHERE slug = 'zadowolenie-klientow-saas';

UPDATE case_studies SET
  title = 'Sklep internetowy: chatbot odpowiadający na większość zapytań klientów',
  description = 'Chatbot zna asortyment, status zamówień i zasady zwrotów. Odpowiada od razu o każdej porze, a rozmowy wymagające decyzji przekazuje obsłudze.',
  is_example = TRUE
WHERE slug = 'wzrost-sprzedazy-ecommerce';

-- ─── Usługi ─────────────────────────────────────────────────────────────────
-- Tabela nie jest renderowana publicznie (ServicesSection ma treść w kodzie),
-- ale czyta ją panel admina i skrypt embeddingów — czyli chatbot.
DELETE FROM services;

INSERT INTO services (title, description, icon, sort_order, is_active) VALUES
('Automatyzacja procesów biznesowych',
 'Łączymy narzędzia, z których już korzystasz: CRM, system księgowy, sklep, arkusze, pocztę. Dane przepływają między nimi bez ręcznego przepisywania. Buduję na n8n i Make, więc rozwiązanie zostaje Twoje i możesz je rozwijać bez uzależnienia ode mnie.',
 'Zap', 1, TRUE),

('Chatboty i asystenci AI',
 'Asystent, który zna Twoją ofertę i odpowiada klientom o każdej porze — na stronie, w komunikatorze albo wewnątrz firmy. Zbiera kontakty i przekazuje je do Ciebie wraz z podsumowaniem rozmowy.',
 'MessageSquare', 2, TRUE),

('Automatyzacja dokumentów i faktur',
 'Faktury i dokumenty odczytywane automatycznie: numery, kwoty, terminy, kontrahenci. Trafiają tam, gdzie mają trafić, bez przepisywania z PDF-a do arkusza.',
 'FileText', 3, TRUE),

('Audyt i doradztwo AI',
 'Zanim cokolwiek wdrożymy: przegląd Twoich procesów i uczciwa odpowiedź, co realnie warto zautomatyzować, a co lepiej zostawić człowiekowi. Plan dostajesz niezależnie od tego, czy zdecydujesz się na współpracę.',
 'Search', 4, TRUE),

('Szkolenia z AI dla zespołów',
 'Praktyczne warsztaty pod konkretne stanowiska. Nie ogólniki o rewolucji AI, tylko narzędzia i sposoby pracy, które Twoi ludzie wykorzystają następnego dnia.',
 'GraduationCap', 5, TRUE),

('Strony i oprogramowanie na zamówienie',
 'Szybkie, dostępne strony i aplikacje szyte pod proces, którego nie obsłuży żadne gotowe narzędzie.',
 'Code', 6, TRUE);

-- ─── FAQ ────────────────────────────────────────────────────────────────────
-- Odpowiedzi trafiają do bazy wiedzy RAG, więc muszą być zgodne z granicami
-- decyzyjnymi chatbota: żadnych kwot, terminów ani zobowiązań.
DELETE FROM faq_items;

INSERT INTO faq_items (question, answer, sort_order, is_active) VALUES
('Ile kosztuje wdrożenie automatyzacji?',
 'Każda wycena jest indywidualna, bo zależy od liczby procesów, systemów do połączenia i skali działania. Dlatego zaczynamy od bezpłatnej konsultacji: po niej wiesz, co da się zrobić i ile to kosztuje, bez żadnych zobowiązań.',
 1, TRUE),

('Jak długo trwa wdrożenie?',
 'Zależy od zakresu. Pojedynczą automatyzację uruchamiamy szybciej niż integrację kilku systemów naraz. Konkretny termin ustalam po konsultacji, gdy znam już Twoje procesy — nie obiecuję dat w ciemno.',
 2, TRUE),

('Czy muszę znać się na technologii?',
 'Nie. Moją rolą jest przełożyć Twój proces na działające rozwiązanie i przekazać je w formie, którą obsłużysz bez wiedzy technicznej. Po wdrożeniu dostajesz instrukcję i wsparcie.',
 3, TRUE),

('Co z bezpieczeństwem moich danych?',
 'Pracuję na Twoich kontach i Twojej infrastrukturze, z dostępami ograniczonymi do niezbędnego minimum. Zakres przetwarzania danych ustalamy pisemnie przed startem, zgodnie z RODO.',
 4, TRUE),

('Co, jeśli automatyzacja przestanie działać?',
 'Automatyzacje mają monitoring i powiadomienia o błędach, więc o problemie dowiadujesz się, zanim zauważy go klient. Zasady wsparcia po wdrożeniu ustalamy na starcie, żebyś nie został sam z awarią.',
 5, TRUE),

('Od czego zacząć, gdy nie wiem, co automatyzować?',
 'Od rozmowy. Zwykle wystarczy opowiedzieć, na co schodzi najwięcej czasu w tygodniu — wąskie gardła widać po kilkunastu minutach. Bezpłatna konsultacja właśnie temu służy.',
 6, TRUE);
```

- [ ] **Krok 2: Zastosuj migrację**

Wklej całą treść pliku do Supabase Dashboard → SQL Editor → Run.
Oczekiwane: `Success. No rows returned`.

- [ ] **Krok 3: Zweryfikuj**

```sql
SELECT 'services' AS tabela, COUNT(*) FROM services WHERE is_active
UNION ALL SELECT 'faq_items', COUNT(*) FROM faq_items WHERE is_active
UNION ALL SELECT 'case_studies (przykłady)', COUNT(*) FROM case_studies WHERE is_example;
```

Oczekiwane: `services` = 6, `faq_items` = 6, `case_studies (przykłady)` = 3.

- [ ] **Krok 4: Commit**

```bash
git add supabase/migrations/009_seed_content.sql
git commit -m "feat(tresc): migracja 009 - uslugi, FAQ i oznaczenie case studies jako przykladow"
```

---

### Zadanie 2: Typ `CaseStudy` z polem `is_example`

**Pliki:**
- Modyfikacja: `types/index.ts:120-132`

- [ ] **Krok 1: Dodaj pole do interfejsu**

Było:
```typescript
export interface CaseStudy {
  id: string
  slug: string
  title: string
  description: string
  content: string
  cover_image: string | null
  tag: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}
```

Ma być:
```typescript
export interface CaseStudy {
  id: string
  slug: string
  title: string
  description: string
  content: string
  cover_image: string | null
  tag: string
  sort_order: number
  is_active: boolean
  /** TRUE = scenariusz poglądowy, nie zrealizowane wdrożenie */
  is_example: boolean
  created_at: string
  updated_at: string
}
```

- [ ] **Krok 2: Sprawdź typy**

Uruchom: `pnpm type-check`
Oczekiwane: brak błędów. Pole jest wymagane, ale wszystkie odczyty używają `select('*')`, więc dane je zawierają.

- [ ] **Krok 3: Commit**

```bash
git add types/index.ts
git commit -m "feat(typy): pole is_example w CaseStudy"
```

---

### Zadanie 3: Oznaczenie case studies na liście

**Pliki:**
- Modyfikacja: `app/case-studies/page.tsx` — linie 10, 45, 53 oraz kafel listy

Sekcja na stronie głównej jest już poprawnie oznaczona i **nie jest przedmiotem tego zadania**. Tu naprawiamy podstronę, która twierdzi coś przeciwnego.

- [ ] **Krok 1: Popraw meta description (linia 10)**

Było:
```typescript
  description: 'Przykłady wdrożeń AI i automatyzacji dla firm MŚP. Sprawdź nasze realizacje.',
```

Ma być:
```typescript
  description: 'Przykładowe scenariusze wdrożeń AI i automatyzacji dla firm MŚP. Zobacz, co da się zautomatyzować w Twojej firmie.',
```

- [ ] **Krok 2: Popraw nadtytuł nad `<h1>` (linia ~38)**

Było:
```tsx
          <p className="text-xs font-bold text-primary tracking-widest uppercase mb-3">
            Realizacje
          </p>
```

Ma być:
```tsx
          <p className="text-xs font-bold text-primary tracking-widest uppercase mb-3">
            Przykładowe scenariusze
          </p>
```

- [ ] **Krok 3: Popraw zdanie pod nagłówkiem (linia ~45)**

Było:
```tsx
            Przykłady wdrożeń AI i automatyzacji, które przyniosły realne rezultaty.
```

Ma być:
```tsx
            Scenariusze pokazujące, co da się zautomatyzować. To przykłady poglądowe,
            a nie opisy zrealizowanych projektów — efekty zależą od specyfiki Twoich procesów.
```

- [ ] **Krok 4: Popraw pusty stan (linia ~53)**

Było:
```tsx
          <p className="text-center text-slate-400 py-16">Brak dostępnych realizacji.</p>
```

Ma być:
```tsx
          <p className="text-center text-slate-400 py-16">Brak dostępnych scenariuszy.</p>
```

- [ ] **Krok 5: Dodaj etykietę na kaflu**

Kafle są **jasne** (`bg-white`, `text-slate-500`), mimo ciemnego nagłówka strony — dlatego etykieta używa palety Tailwind, a nie ciemnych kolorów ze strony głównej.

Znajdź `<div className="p-6">` wewnątrz `<article>` i wstaw **bezpośrednio po nim**, przed `<h2>`:

```tsx
                    {item.is_example && (
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-3">
                        Przykład możliwej automatyzacji
                      </span>
                    )}
```

- [ ] **Krok 5: Sprawdź typy i lint**

Uruchom: `pnpm type-check && pnpm lint`
Oczekiwane: brak błędów.

- [ ] **Krok 6: Commit**

```bash
git add app/case-studies/page.tsx
git commit -m "fix(case-studies): lista mowi o scenariuszach zamiast o realizacjach"
```

---

### Zadanie 4: Oznaczenie case study na stronie szczegółowej

**Pliki:**
- Modyfikacja: `app/case-studies/[slug]/page.tsx`

Strona emituje `Article` JSON-LD, więc oznaczenie musi być w treści, a nie tylko wizualne — inaczej wprowadza w błąd również Google.

Rekord jest w zmiennej `item` (`const item = data as CaseStudy`, linia 66). Nagłówek `<h1>` jest w linii 134, na ciemnym tle hero, tuż pod znacznikiem `{item.tag}`.

- [ ] **Krok 1: Popraw tekst linku powrotnego (linia ~127)**

Było:
```tsx
            Wróć do realizacji
```

Ma być:
```tsx
            Wróć do scenariuszy
```

- [ ] **Krok 2: Wstaw etykietę nad tytułem (przed `<h1>` w linii 134)**

Bezpośrednio **po** bloku `{item.tag && (...)}` i **przed** `<h1>` wstaw:

```tsx
          {item.is_example && (
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#ffa07b] bg-[#ffa07b]/15 border border-[#ffa07b]/30 px-2.5 py-0.5 rounded-full mb-4 ml-2">
              Przykład możliwej automatyzacji
            </span>
          )}
```

- [ ] **Krok 3: Wstaw wyjaśnienie pod opisem**

Bezpośrednio **po** akapicie `<p className="text-slate-300 text-lg leading-relaxed">{item.description}</p>` wstaw:

```tsx
          {item.is_example && (
            <p className="mt-6 rounded-2xl border border-[#ffa07b]/25 bg-[#ffa07b]/5 px-5 py-4 text-sm leading-relaxed text-slate-300">
              To scenariusz poglądowy, a nie opis zrealizowanego projektu. Pokazuje, jak taka
              automatyzacja działa w praktyce. Rzeczywisty zakres i efekty ustalamy dla Twojej
              firmy podczas bezpłatnej konsultacji.
            </p>
          )}
```

- [ ] **Krok 4: Sprawdź typy, lint i build**

Uruchom: `pnpm type-check && pnpm lint && pnpm build`
Oczekiwane: brak błędów.

- [ ] **Krok 5: Commit**

```bash
git add "app/case-studies/[slug]/page.tsx"
git commit -m "fix(case-studies): oznaczenie scenariusza poglądowego na stronie szczegolowej"
```

---

### Zadanie 5: Usunięcie zduplikowanych case studies z kodu

**Pliki:**
- Modyfikacja: `components/marketing/case-study-section.tsx:7-53`

Ten sam zestaw treści w dwóch miejscach gwarantuje, że za pół roku ktoś poprawi jedno i przeoczy drugie.

- [ ] **Krok 1: Usuń stałą `fallbackCases`**

Usuń całą tablicę zaczynającą się od `const fallbackCases` (linie ~7-43). Zachowaj definicję typu poniżej.

- [ ] **Krok 2: Zmień zachowanie przy pustych danych**

Było:
```typescript
  if (data.length === 0) return fallbackCases
  return data.map((cs) => ({
```

Ma być:
```typescript
  // Brak danych = sekcja się nie renderuje. Lepiej pokazać mniej niż wymyśloną treść.
  return data.map((cs) => ({
```

- [ ] **Krok 3: Ukryj sekcję przy braku danych**

Znajdź `return (` rozpoczynający JSX komponentu i wstaw bezpośrednio nad nim:

```typescript
  if (items.length === 0) return null
```

Jeśli zmienna z listą nazywa się inaczej niż `items`, użyj nazwy z pliku.

- [ ] **Krok 4: Sprawdź typy, lint i build**

Uruchom: `pnpm type-check && pnpm lint && pnpm build`
Oczekiwane: brak błędów, brak ostrzeżeń o nieużywanych zmiennych.

- [ ] **Krok 5: Commit**

```bash
git add components/marketing/case-study-section.tsx
git commit -m "refactor(case-studies): usuniecie zduplikowanego zestawu z kodu"
```

---

### Zadanie 6: Sekcja FAQ — przestylowanie i podpięcie

**Pliki:**
- Modyfikacja: `components/marketing/faq-section.tsx:23-56`
- Modyfikacja: `app/page.tsx`

Komponent jest gotowy, ale nigdy nie został zaimportowany i używa klas z nieaktualnego jasnego motywu.

- [ ] **Krok 1: Zastąp JSX ciemnym motywem**

Zastąp cały `return (...)` w `faq-section.tsx`:

```tsx
  return (
    <section className="py-24 px-6 border-t border-[#3d4949]/30" id="faq">
      <div className="max-w-4xl mx-auto">

        <FadeInUp className="text-center mb-16">
          <p className="text-xs font-bold text-[#70e5ea] tracking-widest uppercase mb-4 font-label">
            FAQ
          </p>
          <h2 className="text-4xl font-headline font-bold tracking-tight text-[#e2e3df]">
            Często zadawane pytania
          </h2>
        </FadeInUp>

        <StaggerContainer className="space-y-4">
          {faqs.map((faq, idx) => (
            <StaggerItem key={faq.id}>
              <Accordion defaultValue={idx === 0 ? ['item-0'] : []}>
                <AccordionItem
                  value={`item-${idx}`}
                  className="border border-[#3d4949]/40 bg-[#1e201e] rounded-2xl px-2 overflow-hidden hover:border-[#70e5ea]/30 transition-colors"
                >
                  <AccordionTrigger className="px-4 py-5 font-headline font-bold text-lg text-[#e2e3df] hover:no-underline hover:bg-[#282a28] rounded-2xl transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-5 text-[#bcc9c9] leading-relaxed font-body">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </StaggerItem>
          ))}
        </StaggerContainer>

      </div>
    </section>
  )
```

Zmiana `h2`/`h3` na `p`/`h2` naprawia też hierarchię nagłówków — poprzednia wersja miała `h2` z treścią „FAQ" jako nagłówek nadrzędny wobec właściwego tytułu sekcji.

- [ ] **Krok 2: Zaimportuj sekcję w `app/page.tsx`**

Dodaj do importów:
```typescript
import { FaqSection } from '@/components/marketing/faq-section'
```

- [ ] **Krok 3: Osadź sekcję przed sekcją kontaktową**

Znajdź w JSX `<ContactSection` (lub komponent kontaktu) i wstaw bezpośrednio **przed** nim:
```tsx
        <FaqSection />
```

FAQ przed formularzem, bo odpowiada na obiekcje tuż przed momentem decyzji o kontakcie.

- [ ] **Krok 4: Sprawdź typy, lint i build**

Uruchom: `pnpm type-check && pnpm lint && pnpm build`
Oczekiwane: brak błędów.

- [ ] **Krok 5: Weryfikacja wizualna**

Uruchom `pnpm dev`, otwórz `http://localhost:3000/#faq`. Sprawdź:
- sześć pytań, pierwsze rozwinięte
- ciemne tło spójne z resztą strony, brak białych prostokątów
- akcent turkusowy przy najechaniu
- czytelność na szerokości 375 px

- [ ] **Krok 6: Commit**

```bash
git add components/marketing/faq-section.tsx app/page.tsx
git commit -m "feat(faq): przestylowanie na ciemny motyw i osadzenie na stronie glownej"
```

---

### Zadanie 7: Case studies jako przykłady w bazie wiedzy chatbota

**Pliki:**
- Modyfikacja: `scripts/generate-embeddings.mjs` — funkcja `collectDbDocuments`

Bez tego naprawimy stronę, a chatbot dalej będzie opowiadał o fikcyjnych wdrożeniach jak o zrealizowanych.

- [ ] **Krok 1: Dodaj `is_example` do zapytania i treści**

Było:
```javascript
  const { data: caseStudies, error: caseStudiesError } = await supabase
    .from('case_studies')
    .select('slug, title, description, content, tag')
    .eq('is_active', true)
  if (caseStudiesError) throw new Error(`case_studies: ${caseStudiesError.message}`)

  for (const study of caseStudies ?? []) {
    docs.push({
      source: `case-study:${study.slug}`,
      text: `Wdrożenie u klienta (case study): ${study.title}\nKategoria: ${study.tag ?? 'brak'}\n\n${study.description ?? ''}\n\n${study.content ?? ''}`,
    })
  }
```

Ma być:
```javascript
  const { data: caseStudies, error: caseStudiesError } = await supabase
    .from('case_studies')
    .select('slug, title, description, content, tag, is_example')
    .eq('is_active', true)
  if (caseStudiesError) throw new Error(`case_studies: ${caseStudiesError.message}`)

  for (const study of caseStudies ?? []) {
    // Bez tej adnotacji bot opowiada o scenariuszach poglądowych jak o zrealizowanych wdrożeniach
    const naglowek = study.is_example
      ? `PRZYKŁAD POGLĄDOWY (nie jest to zrealizowane wdrożenie u klienta): ${study.title}`
      : `Zrealizowane wdrożenie u klienta: ${study.title}`

    const zastrzezenie = study.is_example
      ? '\n\nUWAGA: powyższy scenariusz jest przykładem pokazującym możliwości, a nie opisem wykonanego projektu. Nie przedstawiaj go klientowi jako referencji ani nie obiecuj takich samych efektów.'
      : ''

    docs.push({
      source: `case-study:${study.slug}`,
      text: `${naglowek}\nKategoria: ${study.tag ?? 'brak'}\n\n${study.description ?? ''}\n\n${study.content ?? ''}${zastrzezenie}`,
    })
  }
```

- [ ] **Krok 2: Sprawdź składnię**

Uruchom: `node --check scripts/generate-embeddings.mjs`
Oczekiwane: brak outputu, kod wyjścia 0.

- [ ] **Krok 3: Przeindeksuj bazę wiedzy**

Uruchom: `pnpm db:generate`
Oczekiwane: `Zsynchronizowano 29/29 źródeł` (lub więcej, jeśli przybyło artykułów).

- [ ] **Krok 4: Sprawdź, czy stare treści testowe zniknęły**

```sql
SELECT COUNT(*) AS pozostale_smieci
FROM documents
WHERE content ILIKE '%CEO Firmy jestem JA%'
   OR content ILIKE '%robimy czatboty na zamowienie%';
```

Oczekiwane: `0`.

- [ ] **Krok 5: Sprawdź, czy bot dostaje oznaczenie**

Uruchom: `node --env-file=.env.local scripts/generate-embeddings.mjs --probe "czy macie jakies wdrozenia dla sklepow internetowych"`

Oczekiwane: wśród wyników chunk ze źródła `case-study:*` zawierający frazę `PRZYKŁAD POGLĄDOWY`.

- [ ] **Krok 6: Commit**

```bash
git add scripts/generate-embeddings.mjs
git commit -m "fix(rag): case studies oznaczone w bazie wiedzy jako scenariusze pogladowe"
```

---

# CZĘŚĆ A2 — tożsamość prawna i dane

### Zadanie 8: Administrator danych i wzmianka o analityce

**Pliki:**
- Modyfikacja: `app/privacy-policy/page.tsx:35` oraz sekcja 7 (cookies)

**Zależność:** wymaga imienia i nazwiska od właściciela oraz decyzji o adresie kontaktowym.

- [ ] **Krok 1: Uzupełnij administratora (linia ~35)**

Było:
```tsx
              Administratorem Twoich danych osobowych jest Zautomatyzujemy.pl
              (dalej: &ldquo;Administrator&rdquo;). W sprawach dotyczących ochrony danych
```

Ma być — podstaw dane przekazane przez właściciela w miejsce `IMIĘ NAZWISKO` i `ADRES@zautomatyzujemy.pl`:
```tsx
              Administratorem Twoich danych osobowych jest IMIĘ NAZWISKO, prowadzący
              działalność pod marką Zautomatyzujemy.pl, z siedzibą w Chojnicach
              (dalej: &ldquo;Administrator&rdquo;). Kontakt w sprawach ochrony danych:
              ADRES@zautomatyzujemy.pl. W sprawach dotyczących ochrony danych
```

- [ ] **Krok 2: Dopisz analitykę do sekcji o cookies (linia ~158)**

Było:
```tsx
              Strona wykorzystuje pliki cookies wyłącznie w celach technicznych
              (sesja administratora). Nie stosujemy cookies śledzących ani reklamowych.
              Możesz zarządzać plikami cookies w ustawieniach przeglądarki.
```

Ma być:
```tsx
              Strona wykorzystuje pliki cookies wyłącznie w celach technicznych
              (sesja administratora). Nie stosujemy cookies śledzących ani reklamowych.
              Możesz zarządzać plikami cookies w ustawieniach przeglądarki.
              Do zliczania odwiedzin korzystamy z Vercel Web Analytics — narzędzia,
              które nie zapisuje plików cookies i nie tworzy profilu użytkownika.
```

- [ ] **Krok 3: Ujednolić adres kontaktowy w całym serwisie**

Uruchom, żeby zobaczyć rozbieżność:
```bash
grep -rn "biuro@zautomatyzujemy.pl\|kontakt@zautomatyzujemy.pl" --include=*.tsx --include=*.ts --include=*.md . | grep -v node_modules
```

Zamień wszystkie wystąpienia na adres wskazany przez właściciela. Nie ruszaj `powiadomienia@zautomatyzujemy.pl` — to adres nadawcy w Resend, nie kontakt dla klientów.

- [ ] **Krok 4: Sprawdź typy, lint i build**

Uruchom: `pnpm type-check && pnpm lint && pnpm build`
Oczekiwane: brak błędów.

- [ ] **Krok 5: Commit**

```bash
git add app/privacy-policy/page.tsx
git commit -m "fix(rodo): wskazanie administratora danych i informacja o analityce"
```

---

### Zadanie 9: Usunięcie adresu domowego z danych strukturalnych

**Pliki:**
- Modyfikacja: `app/page.tsx:109-120`

Wizytówka Google będzie w trybie firmy usługowej, gdzie adres jest ukryty. Publikowanie ulicy i numeru mieszkania w JSON-LD byłoby z tym niespójne i eksponuje adres domowy.

- [ ] **Krok 1: Usuń ulicę i współrzędne**

Było:
```tsx
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'ul. Sportowa 5/33',
            addressLocality: 'Chojnice',
            postalCode: '89-600',
            addressCountry: 'PL',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: 53.6977,
            longitude: 17.5572,
          },
```

Ma być:
```tsx
          // Bez ulicy i współrzędnych — działalność prowadzona z domu, wizytówka
          // Google w trybie firmy usługowej również nie pokazuje adresu
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Chojnice',
            postalCode: '89-600',
            addressCountry: 'PL',
          },
```

- [ ] **Krok 2: Sprawdź, czy adres zniknął z całego repo**

```bash
grep -rn "Sportowa" --include=*.tsx --include=*.ts . | grep -v node_modules
```

Oczekiwane: brak wyników.

- [ ] **Krok 3: Sprawdź build**

Uruchom: `pnpm type-check && pnpm lint && pnpm build`
Oczekiwane: brak błędów.

- [ ] **Krok 4: Commit**

```bash
git add app/page.tsx
git commit -m "fix(prywatnosc): usuniecie adresu domowego z danych strukturalnych"
```

---

### Zadanie 10: Uspójnienie nazewnictwa firmy

**Pliki:**
- Modyfikacja: `app/api/chat/route.ts`, `app/page.tsx`, `knowledge/o-firmie.md`, `components/marketing/about-section.tsx`, `components/marketing/case-study-section.tsx`, `app/manifest.ts`, `lib/actions/chat.actions.ts`

Serwis konsekwentnie mówi „agencja" i „właściciel firmy", podczas gdy działalność startuje jako jednoosobowa i niezarejestrowana. Nie jest to nadużycie prawne, ale przy pierwszym pytaniu klienta o NIP powstaje niezręczność, a spójność przekazu buduje zaufanie mocniej niż napompowana nazwa.

**Decyzja właściciela — dwa warianty:**

| Wariant | Brzmienie | Kiedy wybrać |
|---|---|---|
| **A — pierwsza osoba** (zalecany) | „Pomagam firmom automatyzować procesy", „Nazywam się Norbert Chojnacki" | Sprzedaż relacyjna, klient wie z kim rozmawia. Buduje zaufanie u MŚP, które wolą konkretną osobę od anonimowego podmiotu. |
| **B — marka bez słowa „agencja"** | „Zautomatyzujemy.pl — automatyzacja procesów dla MŚP", bez „agencji" i „właściciela firmy" | Jeśli planujesz rozbudowę zespołu i nie chcesz przepisywać treści za pół roku. |

Poniższe kroki zakładają wariant A. Przy wariancie B zamiast pierwszej osoby użyj nazwy marki, zachowując zasadę: **nie używamy słów „agencja" ani „właściciel firmy"**.

- [ ] **Krok 1: `app/page.tsx` — opis w LocalBusiness**

Było:
```tsx
          description:
            'Agencja automatyzacji AI — chatboty, integracje n8n, RAG, wdrożenia LLM dla firm MŚP.',
```

Ma być:
```tsx
          description:
            'Automatyzacja procesów z AI — chatboty, integracje n8n, RAG i wdrożenia LLM dla małych i średnich firm.',
```

- [ ] **Krok 2: `app/api/chat/route.ts` — pierwsze zdanie `BASE_SYSTEM`**

Było:
```
Jesteś pomocnym, miłym asystentem firmy Zautomatyzujemy.pl — agencji specjalizującej się w automatyzacji procesów biznesowych z pomocą AI i n8n.
```

Ma być:
```
Jesteś pomocnym, miłym asystentem Zautomatyzujemy.pl — marki, pod którą Norbert Chojnacki automatyzuje procesy biznesowe z pomocą AI i n8n.
```

- [ ] **Krok 3: `app/api/chat/route.ts` — zdanie o właścicielu**

Znajdź w sekcji „O NASZEJ FIRMIE I USŁUGACH" zdanie zaczynające się od `Właścicielem firmy jest inżynier informatyki stosowanej Norbert Chojnacki` i zamień początek na:
```
Za Zautomatyzujemy.pl stoi Norbert Chojnacki — inżynier informatyki stosowanej
```

Reszta zdania zostaje bez zmian.

- [ ] **Krok 4: `knowledge/o-firmie.md` — pierwsze zdanie sekcji „Kim jesteśmy"**

Było:
```markdown
Zautomatyzujemy.pl to agencja specjalizująca się w automatyzacji procesów biznesowych
```

Ma być:
```markdown
Zautomatyzujemy.pl to marka, pod którą Norbert Chojnacki automatyzuje procesy biznesowe
```

- [ ] **Krok 5: Pozostałe wystąpienia**

```bash
grep -rn "agencj\|Agencj\|właściciel firmy" --include=*.tsx --include=*.ts --include=*.md app/ components/ lib/ knowledge/
```

Dla każdego trafienia zastosuj tę samą zasadę. Pomiń `lib/actions/admin.actions.ts` (komunikaty panelu, niewidoczne publicznie) oraz katalog `docs/`.

- [ ] **Krok 6: Przeindeksuj bazę wiedzy**

`knowledge/o-firmie.md` jest źródłem bazy wiedzy chatbota, więc zmiana wymaga:
```bash
pnpm db:generate
```
Oczekiwane: `Zsynchronizowano N/N źródeł` bez błędów.

- [ ] **Krok 7: Sprawdź typy, lint i build**

Uruchom: `pnpm type-check && pnpm lint && pnpm build`
Oczekiwane: brak błędów.

- [ ] **Krok 8: Commit**

```bash
git add app/page.tsx app/api/chat/route.ts knowledge/o-firmie.md components/ lib/
git commit -m "fix(tresc): uspojnienie nazewnictwa - marka zamiast agencji"
```

---

# CZĘŚĆ A4 — szybkie poprawki SEO

### Zadanie 11: `/ai-act-checklist` w sitemapie

**Pliki:**
- Modyfikacja: `app/sitemap.ts:44-54`

Realna strona z treścią i lead magnetem, dziś niewidoczna dla Google w mapie strony.

- [ ] **Krok 1: Dodaj wpis**

Znajdź wpis `/case-studies` i wstaw bezpośrednio **po** nim:

```typescript
    {
      url: `${baseUrl}/ai-act-checklist`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
```

- [ ] **Krok 2: Zweryfikuj**

Uruchom `pnpm dev`, otwórz `http://localhost:3000/sitemap.xml`.
Oczekiwane: w dokumencie znajduje się `<loc>https://zautomatyzujemy.pl/ai-act-checklist</loc>`.

- [ ] **Krok 3: Commit**

```bash
git add app/sitemap.ts
git commit -m "fix(seo): /ai-act-checklist w sitemapie"
```

---

### Zadanie 12: Schemat FAQPage

**Pliki:**
- Modyfikacja: `app/page.tsx`

Wymaga wcześniejszego ukończenia Zadania 6 — schemat bez widocznej treści na stronie łamie wytyczne Google i może skutkować ręczną karą.

- [ ] **Krok 1: Pobierz FAQ w komponencie strony**

`app/page.tsx` jest Server Component, więc może czytać bezpośrednio. Dodaj do importów:
```typescript
import { createServiceClient } from '@/lib/supabase/server'
import type { FaqItem } from '@/types'
```

Na początku funkcji komponentu (przed `return`):
```typescript
  const supabase = createServiceClient()
  const { data: faqData } = await supabase
    .from('faq_items')
    .select('question, answer')
    .eq('is_active', true)
    .order('sort_order')

  const faqItems = (faqData ?? []) as Pick<FaqItem, 'question' | 'answer'>[]
```

Jeśli komponent nie jest jeszcze `async`, zmień jego sygnaturę na `export default async function Home()`.

- [ ] **Krok 2: Dodaj schemat obok pozostałych**

Bezpośrednio po ostatnim istniejącym `<JsonLd ... />` wstaw:

```tsx
      {faqItems.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map(item => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }}
        />
      )}
```

- [ ] **Krok 3: Sprawdź typy, lint i build**

Uruchom: `pnpm type-check && pnpm lint && pnpm build`
Oczekiwane: brak błędów.

- [ ] **Krok 4: Zweryfikuj strukturę**

Uruchom `pnpm dev`, otwórz `http://localhost:3000`, w źródle strony (Ctrl+U) wyszukaj `FAQPage`.
Oczekiwane: blok JSON zawierający sześć obiektów `Question` z treściami identycznymi jak widoczne w sekcji FAQ.

- [ ] **Krok 5: Commit**

```bash
git add app/page.tsx
git commit -m "feat(seo): schemat FAQPage na stronie glownej"
```

---

# CZĘŚĆ A3 — pomiar

### Zadanie 13: Vercel Web Analytics

**Pliki:**
- Modyfikacja: `package.json` (nowa zależność), `app/layout.tsx`

**Nowa zależność:** `@vercel/analytics`. Właściciel zatwierdził ten wybór, odrzucając GA4 wraz z wymaganą przez nie przebudową banera zgód.

- [ ] **Krok 1: Zainstaluj pakiet**

```bash
pnpm add @vercel/analytics
```

- [ ] **Krok 2: Osadź komponent w layoucie**

W `app/layout.tsx` dodaj do importów:
```typescript
import { Analytics } from '@vercel/analytics/next'
```

Następnie w `<body>` wstaw `<Analytics />` jako **ostatni** element, bezpośrednio przed zamknięciem `</body>`:
```tsx
        <Analytics />
```

- [ ] **Krok 3: Sprawdź typy, lint i build**

Uruchom: `pnpm type-check && pnpm lint && pnpm build`
Oczekiwane: brak błędów.

- [ ] **Krok 4: Commit i wdrożenie**

```bash
git add package.json pnpm-lock.yaml app/layout.tsx
git commit -m "feat(pomiar): bezcookiesowa analityka Vercel Web Analytics"
```

- [ ] **Krok 5: Weryfikacja po wdrożeniu**

Po wdrożeniu na produkcję odwiedź `https://zautomatyzujemy.pl`, potem wejdź w panel Vercela → Analytics.
Oczekiwane: licznik odwiedzin rośnie. Jeśli pokazuje zero — sprawdź, czy Web Analytics jest włączone w ustawieniach projektu (wymaganie wstępne).

---

### Zadanie 14: Weryfikacja Google Search Console

**Pliki:**
- Modyfikacja: `app/layout.tsx:28` (obiekt `metadata`)

**Zależność:** wymaga tokenu weryfikacyjnego od właściciela.

- [ ] **Krok 1: Dodaj pole `verification` do metadanych**

W obiekcie `export const metadata: Metadata = {` dodaj — podstaw token w miejsce `TOKEN_Z_SEARCH_CONSOLE`:

```typescript
  verification: {
    google: 'TOKEN_Z_SEARCH_CONSOLE',
  },
```

Next.js wygeneruje z tego `<meta name="google-site-verification" content="..." />`.

- [ ] **Krok 2: Sprawdź, czy tag się renderuje**

Uruchom `pnpm dev`, otwórz `http://localhost:3000`, w źródle strony wyszukaj `google-site-verification`.
Oczekiwane: tag obecny z podanym tokenem.

- [ ] **Krok 3: Commit i wdrożenie**

```bash
git add app/layout.tsx
git commit -m "feat(seo): weryfikacja Google Search Console"
```

- [ ] **Krok 4: Dokończ weryfikację i zgłoś sitemapę**

Po wdrożeniu wróć do Search Console i kliknij „Zweryfikuj". Następnie Sitemapy → dodaj `sitemap.xml`.

Oczekiwane: status „Sukces". Dane o indeksacji pojawiają się w ciągu 2-3 dni — to normalne, nie oznacza błędu.

---

## Weryfikacja końcowa

- [ ] `pnpm type-check` — bez błędów
- [ ] `pnpm lint` — bez błędów
- [ ] `pnpm build` — przechodzi
- [ ] `SELECT COUNT(*) FROM services WHERE is_active` → 6
- [ ] `SELECT COUNT(*) FROM faq_items WHERE is_active` → 6
- [ ] Zapytanie o pozostałe śmieci w `documents` → 0
- [ ] Sekcja FAQ widoczna na stronie głównej, ciemna, sześć pytań
- [ ] `/case-studies` nie zawiera słów „realizacje" ani „przyniosły realne rezultaty"
- [ ] Każdy case study ma widoczną etykietę „Przykład możliwej automatyzacji"
- [ ] Chatbot zapytany o wdrożenia mówi o przykładach, nie o zrealizowanych projektach
- [ ] Polityka prywatności wskazuje administratora z imienia i nazwiska
- [ ] `grep -rn "Sportowa"` w kodzie → brak wyników
- [ ] Jeden adres kontaktowy w całym serwisie
- [ ] `/sitemap.xml` zawiera `/ai-act-checklist`
- [ ] Źródło strony głównej zawiera `FAQPage` z sześcioma pytaniami
- [ ] Vercel Analytics zlicza wizyty
- [ ] Search Console zweryfikowany, sitemapa zgłoszona

---

## Świadomie poza zakresem

| Rzecz | Dlaczego |
|---|---|
| Strony usługowe `/uslugi/...` | faza B — to główna inwestycja w widoczność, wymaga osobnego planu |
| Przestawienie automatu blogowego | faza B — 59% treści to przeglądy newsów bez intencji wyszukiwania |
| Lokalne treści pod Chojnice | faza B, po założeniu wizytówki |
| Podpięcie `ServicesSection` pod bazę | sekcja wygląda dobrze i działa; przepisywanie jej teraz nie służy celom fazy A |
| Cal.com, opinie klientów | faza B lub później, wymagają pierwszych klientów |
| Testy jednostkowe | brak runnera; Vitest to nowa zależność, wymaga zgody właściciela |
