# Strony usługowe i strona o osobie — plan wdrożenia

> **Dla agentów wykonawczych:** WYMAGANY SUB-SKILL: użyj `subagent-driven-development` (zalecane)
> albo `executing-plans` do wykonania tego planu zadanie po zadaniu.
> Kroki mają składnię checkboxów (`- [ ]`) do odhaczania.

**Cel:** Dać witrynie adresy, pod którymi może rankować oferta i osoba, zamiast jednej strony
głównej próbującej odpowiadać na wszystko.

**Architektura:** Wykorzystujemy gotową, odłożoną gałąź `feat/strony-uslugowe` zamiast pisać
od zera. Treść siedmiu usług żyje w tabeli `services` i jest edytowalna w panelu.
Widoki przechodzą na obecny język wizualny witryny. Dochodzą dwie nowe strony statyczne:
`/kontakt` i `/o-mnie`, obie z danymi strukturalnymi wiążącymi witrynę z konkretną osobą.

**Stos:** Next.js App Router, TypeScript strict, Supabase, Tailwind, shadcn/ui, testy `node --test`.

**Źródła:** spec `docs/superpowers/specs/2026-09-10-widocznosc-w-wyszukiwarce-design.md` (punkty 1.1–1.7),
mapa fraz `docs/seo/keyword-map.md`, dane właściciela w `docs/zadania-wlasciciela.md`.

**To drugi z planów projektu widoczności.** Pierwszy (atrybucja i kanoniczny host) jest scalony.
Poza zakresem tego planu, do osobnych planów: strona `/cennik`, strona lokalna,
silnik treści bloga, automat propozycji postów.

---

## Stan wyjściowy, zweryfikowany

| Fakt | Źródło |
|---|---|
| `feat/strony-uslugowe` ma 11 commitów i jest 52 commity za `main` | `git rev-list --left-right --count` |
| Gałąź istnieje wyłącznie lokalnie, nie ma jej na `origin` | `git branch -a` |
| Zawiera `app/uslugi/page.tsx` (86 linii) i `app/uslugi/[slug]/page.tsx` (133 linie) | odczyt z gałęzi |
| Widoki używają starej palety (`bg-slate-950`, `bg-slate-50`), nie obecnej | odczyt z gałęzi |
| Migracja `011` wypełnia treścią wszystkie siedem usług | odczyt z gałęzi |
| Produkcyjna tabela `services` ma 6 wierszy i nie ma kolumny `slug` | zapytanie do bazy |
| `012_ai_transparency` i `015_lead_attribution` są już zastosowane | zapytanie do bazy |
| `ServiceSchema` w panelu nie obejmuje pól `content`, `slug`, `seo_title`, `seo_description` | `lib/actions/admin.actions.ts` |
| Zdjęcie właściciela leży w `public/norbert.png` i jest używane na stronie głównej | `components/marketing/about-section.tsx:11` |

Slugi z migracji `011`: `automatyzacja-procesow-biznesowych`, `chatboty-i-asystenci-ai`,
`automatyzacja-dokumentow-i-faktur`, `audyt-i-doradztwo-ai`, `szkolenia-z-ai-dla-zespolow`,
`strony-i-oprogramowanie-na-zamowienie`, `zgodnosc-z-ai-act`.

Mapa fraz przypisuje im priorytety: automatyzacja procesów jest pierwsza, chatboty druga,
faktury trzecia, szkolenia czwarta. Te cztery przepisujemy pod frazy docelowe. Pozostałe trzy
wchodzą z treścią, którą już mają.

---

## Struktura plików

| Plik | Odpowiedzialność |
|---|---|
| `app/uslugi/page.tsx` | Lista usług, schemat `ItemList`. Z gałęzi, przeniesiona na obecny design. |
| `app/uslugi/[slug]/page.tsx` | Pojedyncza usługa, schemat `Service` i okruszki. Z gałęzi, przeniesiona. |
| `app/kontakt/page.tsx` | Osobny adres kontaktowy z pełnymi danymi i formularzem. Nowy. |
| `app/o-mnie/page.tsx` | Strona osoby ze schematem `Person`. Nowa. |
| `components/marketing/service-cta.tsx` | Warstwa konwersji wspólna dla stron usługowych. Nowy. |
| `components/seo/breadcrumbs.tsx` | Widoczne okruszki plus schemat, wspólne dla podstron. Nowy. |
| `lib/actions/admin.actions.ts` | Rozszerzenie schematu usługi o pola treści i SEO. |
| `app/admin/content/_components/services-editor.tsx` | Formularz edycji tych pól. |
| `app/sitemap.ts` | Dodanie usług oraz nowych adresów statycznych. |
| `app/page.tsx` | Uzupełnienie `Organization.sameAs`, powiązanie z `Person`. |
| `supabase/migrations/016_services_pages.sql` | Dawna `010` z gałęzi, przenumerowana. |
| `supabase/migrations/017_services_content.sql` | Dawna `011` z gałęzi, przenumerowana. |

Numeracja: `015` jest zajęta przez atrybucję, więc migracje z gałęzi dostają `016` i `017`.

---

## Kontrakt wizualny, obowiązuje w każdym zadaniu

Witryna przeszła redesign, którego odłożona gałąź nie zna. Każdy przeniesiony i nowy widok
trzyma się tego języka. **Plikiem odniesienia jest `app/case-studies/page.tsx`** — przeczytaj go
przed pisaniem czegokolwiek i powielaj jego wzorce, nie wymyślaj własnych.

| Element | Wartość |
|---|---|
| Tło jasne | `#f5f2ed`, karty `#faf8f4`, obramowania `#d8d4cc` |
| Tło ciemne nagłówka | `#151719`, tekst na nim `#f5f2ed`, tekst pomocniczy `#dedbd5` |
| Akcent | `#c93820` na jasnym tle, `#ffb49f` na ciemnym |
| Tekst drugorzędny na jasnym | `#62625d` |
| Nagłówek strony | `font-editorial`, `font-normal`, duże rozmiary, `tracking-tight` |
| Nadtytuł nad H1 | `text-xs font-bold tracking-widest uppercase` w kolorze akcentu |
| Szerokość treści | `max-w-7xl mx-auto px-6` |
| Stan skupienia | `focus-visible:ring-2` w kolorze akcentu, zawsze widoczny |
| Animacje | tylko przez `motion-safe:`, nigdy bezwarunkowo |

Zakaz z reguł projektu: żadnego własnego CSS, żadnego `style={{}}`, wyłącznie klasy Tailwind
i komponenty shadcn/ui. Żadnego `any`, żadnego `as` bez sprawdzenia typu.
Każdy widok ma działać od 375 pikseli szerokości w górę.

---

## Przygotowanie

- [ ] **Krok 1: Zabezpiecz gałąź, która istnieje tylko lokalnie**

```bash
git push -u origin feat/strony-uslugowe
```

To pierwsza czynność w całym planie. Gałąź z jedenastoma commitami żyjąca wyłącznie na jednym dysku
to jedna awaria od utraty dwóch tygodni cudzej pracy.

- [ ] **Krok 2: Sprawdź stan wyjściowy**

```bash
git fetch origin && git rev-list --left-right --count origin/main...feat/strony-uslugowe
```

Oczekiwane: liczba po lewej to dystans gałęzi od głównej. Zanotuj ją, przyda się w opisie PR.

---

## Zadanie 1: Rebase odłożonej gałęzi

**Pliki:** cała gałąź `feat/strony-uslugowe`.

To zadanie wykonuje człowiek albo agent z wyraźnym poleceniem zatrzymania się przy konflikcie.
Nie da się go rozpisać na kroki TDD, bo konflikty wymagają decyzji, a nie procedury.

- [ ] **Krok 1: Utwórz gałąź roboczą, żeby nie psuć oryginału**

```bash
git checkout feat/strony-uslugowe
git checkout -b feat/uslugi-i-osoba
```

Oryginalna gałąź zostaje nietknięta jako punkt odwrotu.

- [ ] **Krok 2: Rebase na aktualną gałąź główną**

```bash
git fetch origin
git rebase origin/main
```

Konfliktów spodziewaj się w: `app/sitemap.ts`, `components/marketing/services-section.tsx`,
`components/marketing/navbar.tsx`, `scripts/generate-embeddings.mjs`, `eslint.config.mjs`.

**Reguła rozstrzygania konfliktów:** wersja z gałęzi głównej wygrywa we wszystkim, co dotyczy
wyglądu i redesignu. Wersja z gałęzi wygrywa wyłącznie tam, gdzie dokłada obsługę usług
(nowe pozycje w mapie strony, pozycja w menu, odczyt tabeli `services` w skrypcie embeddingów).
Przy wątpliwości zatrzymaj się i zapytaj, zamiast zgadywać.

- [ ] **Krok 3: Po rebase sprawdź, że nic się nie rozsypało**

```bash
npm ci && npm run type-check && npm test
```

Oczekiwane: instalacja przechodzi, brak błędów typów, 46 testów zielonych.
Build pominij na tym etapie, bo strony usług jeszcze nie mają zastosowanych migracji.

- [ ] **Krok 4: Wypchnij i zatrzymaj się**

```bash
git push -u origin feat/uslugi-i-osoba
```

Zgłoś kontrolerowi, ile konfliktów wystąpiło i jak zostały rozstrzygnięte. Dopiero potem idź dalej.

---

## Zadanie 2: Przenumerowanie i zastosowanie migracji

**Pliki:**
- Zmień nazwę: `supabase/migrations/010_services_pages.sql` → `016_services_pages.sql`
- Zmień nazwę: `supabase/migrations/011_services_content.sql` → `017_services_content.sql`

- [ ] **Krok 1: Zmień nazwy plików**

```bash
git mv supabase/migrations/010_services_pages.sql supabase/migrations/016_services_pages.sql
git mv supabase/migrations/011_services_content.sql supabase/migrations/017_services_content.sql
```

- [ ] **Krok 2: Popraw nagłówki w treści plików**

W obu plikach pierwsza linia to komentarz z nazwą pliku. Zmień `-- 010_services_pages.sql`
na `-- 016_services_pages.sql` oraz `-- 011_services_content.sql` na `-- 017_services_content.sql`.

- [ ] **Krok 3: Sprawdź, czy migracja `016` wypełni slug każdemu wierszowi**

Migracja przypisuje slugi po `sort_order` od 1 do 6, a na końcu ustawia kolumnę jako wymaganą.
Sprawdzone wcześniej: produkcyjne `sort_order` to dokładnie 1 do 6, więc żaden wiersz nie zostanie
bez sluga. Zweryfikuj to ponownie przed uruchomieniem, bo panel pozwala zmieniać kolejność:

```sql
SELECT sort_order, title FROM services ORDER BY sort_order;
```

Oczekiwane: sześć wierszy z kolejnością 1, 2, 3, 4, 5, 6 bez luk i bez duplikatów.
**Jeśli wynik jest inny, zatrzymaj się i zgłoś to** — migracja w obecnej postaci zostawiłaby
wiersz bez sluga i wywróciła się na ostatniej linii.

- [ ] **Krok 4: Zadanie właściciela — uruchomić obie migracje**

Migracje uruchamia właściciel w panelu Supabase, w kolejności `016`, potem `017`.
Połączenie, którym dysponuje agent, jest tylko do odczytu.

Weryfikacja po uruchomieniu:

```sql
SELECT slug, LENGTH(content) AS dlugosc_tresci FROM services ORDER BY sort_order;
```

Oczekiwane: siedem wierszy, każdy z niepustym slugiem i niezerową długością treści.

- [ ] **Krok 5: Commit**

```bash
git add supabase/migrations/
git commit -m "chore(uslugi): przenumerowanie migracji na 016 i 017"
```

---

## Zadanie 3: Przeniesienie widoków na obecny design

**Pliki:**
- Modyfikuj: `app/uslugi/page.tsx`
- Modyfikuj: `app/uslugi/[slug]/page.tsx`

- [ ] **Krok 1: Przeczytaj plik odniesienia**

Przeczytaj w całości `app/case-studies/page.tsx` oraz `app/case-studies/[slug]/page.tsx`.
Te dwa pliki mają dokładnie tę samą strukturę problemu: lista pozycji z bazy i strona szczegółu.
Twoje widoki mają wyglądać, jakby powstały razem z nimi.

- [ ] **Krok 2: Przenieś listę usług**

W `app/uslugi/page.tsx` zamień starą paletę na obecną, zgodnie z kontraktem wizualnym wyżej.
Zachowaj bez zmian: pobranie danych z Supabase, schemat `ItemList`, adresy `/uslugi/<slug>`.
Zmień: wszystkie klasy `slate-*` na tokeny z kontraktu, nagłówek na `font-editorial`,
karty na wzór kart z `case-studies`, dodaj nadtytuł nad nagłówkiem.

Popraw też metadane, bo dziś nie zawierają frazy docelowej:

```tsx
export const metadata: Metadata = {
  title: 'Automatyzacja procesów i wdrożenia AI dla firm',
  description:
    'Automatyzacja procesów w firmie, chatboty i asystenci AI, odczyt faktur, szkolenia i zgodność z AI Act. Wdrażam samodzielnie, rozmawiasz bezpośrednio ze mną.',
  alternates: { canonical: '/uslugi' },
}
```

- [ ] **Krok 3: Przenieś stronę pojedynczej usługi**

W `app/uslugi/[slug]/page.tsx` zrób to samo. Zachowaj schemat `Service`, okruszki i `generateMetadata`.
Treść usługi renderuje się z Markdowna przez `MDXRemote` z `safeMdxComponents` — nie zmieniaj
tego mechanizmu, bo jest wspólny z blogiem.

- [ ] **Krok 4: Sprawdź typy i wygląd**

```bash
npm run type-check
```

Następnie uruchom `npm run dev` i obejrzyj `/uslugi` oraz jedną stronę szczegółu
w trzech szerokościach: 375, 768 i 1280 pikseli. Sprawdź, czy nagłówek nie ucieka poza ekran
i czy karty układają się w jedną kolumnę na telefonie.

- [ ] **Krok 5: Sprawdź, czy nie został żaden własny CSS ani stara paleta**

```bash
grep -n "slate-\|style={{" app/uslugi/page.tsx "app/uslugi/[slug]/page.tsx"
```

Oczekiwane: brak wyników.

- [ ] **Krok 6: Commit**

```bash
git add app/uslugi
git commit -m "feat(uslugi): widoki na obecnym jezyku wizualnym witryny"
```

---

## Zadanie 4: Panel musi umieć edytować treść usługi

**Pliki:**
- Modyfikuj: `lib/actions/admin.actions.ts`
- Modyfikuj: `app/admin/content/_components/services-editor.tsx`

Dziś `ServiceSchema` obejmuje tylko `title`, `description`, `icon`, `sort_order` i `is_active`.
Bez tego zadania przepisanie treści usług pod frazy wymagałoby ręcznego SQL-a przy każdej zmianie.

- [ ] **Krok 1: Przeczytaj obecny schemat i formularz**

Przeczytaj `ServiceSchema` oraz akcję zapisującą usługę w `lib/actions/admin.actions.ts`,
a także formularz w `app/admin/content/_components/services-editor.tsx`.
Odwzoruj ich styl, nie wymyślaj własnego.

- [ ] **Krok 2: Rozszerz schemat walidacji**

Do `ServiceSchema` dołóż cztery pola, wszystkie opcjonalne poza slugiem:

```typescript
  slug: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Slug może zawierać tylko małe litery, cyfry i myślniki.'),
  content: z.string().max(20000).nullish(),
  seo_title: z.string().max(70).nullish(),
  seo_description: z.string().max(170).nullish(),
```

Limity `seo_title` i `seo_description` są celowo trochę wyższe niż to, co wyświetla wyszukiwarka.
Twarde ucinanie na 60 i 160 znakach zmuszałoby do liczenia znaków w trakcie pisania.

- [ ] **Krok 3: Dołóż pola do formularza**

W `services-editor.tsx` dodaj cztery pola odpowiadające tym z kroku 2: krótkie pole tekstowe
na slug, duże pole wielowierszowe na treść w Markdownie, dwa krótkie na tytuł i opis dla wyszukiwarki.
Użyj komponentów `Input` i `Textarea` z `components/ui`, tak jak reszta formularza.
Przy polach SEO pokaż licznik znaków z progiem zalecanym: 60 dla tytułu, 160 dla opisu.

- [ ] **Krok 4: Sprawdź działanie**

```bash
npm run type-check && npm run lint
```

Uruchom `npm run dev`, zaloguj się do panelu, otwórz edycję usługi, zmień treść, zapisz
i sprawdź, czy zmiana jest widoczna na `/uslugi/<slug>`.

- [ ] **Krok 5: Commit**

```bash
git add lib/actions/admin.actions.ts app/admin/content
git commit -m "feat(panel): edycja tresci i metadanych uslugi"
```

---

## Zadanie 5: Warstwa konwersji na stronach usługowych

**Pliki:**
- Utwórz: `components/marketing/service-cta.tsx`
- Modyfikuj: `app/uslugi/[slug]/page.tsx`

Dziś strona usługi kończy się odesłaniem do kotwicy na stronie głównej. Przy ruchu liczonym
przez pół roku w dziesiątkach wejść to strata każdego odwiedzającego, któremu nie chciało się
przewijać dalej.

- [ ] **Krok 1: Utwórz komponent**

`components/marketing/service-cta.tsx` ma być Server Component (bez `'use client'`),
przyjmować nazwę usługi jako props i zawierać:
- nagłówek z nazwą usługi w wołaczu lub w formie pytania
- trzy punkty mówiące, co warto przysłać w zapytaniu: opis procesu, używane narzędzia,
  ile czasu zajmuje dziś
- deklarację czasu odpowiedzi: jeden dzień roboczy
- ofertę bezpłatnej trzydziestominutowej konsultacji
- osadzony `ContactForm` z `components/marketing/contact-form`, z `idPrefix` zbudowanym ze sluga
  usługi, żeby identyfikatory pól nie powtarzały się między stronami

Interfejs props:

```tsx
interface ServiceCtaProps {
  serviceName: string
  serviceSlug: string
}
```

`ContactForm` jest komponentem klienckim i przyjmuje `idPrefix` — sprawdź jego sygnaturę
w `components/marketing/contact-form.tsx` przed użyciem.

- [ ] **Krok 2: Osadź komponent na stronie usługi**

W `app/uslugi/[slug]/page.tsx`, poniżej treści usługi, przed stopką.

- [ ] **Krok 3: Sprawdź brak kolizji identyfikatorów**

Uruchom `npm run dev`, otwórz stronę usługi i w konsoli przeglądarki wykonaj:

```js
new Set([...document.querySelectorAll('[id]')].map(e => e.id)).size === document.querySelectorAll('[id]').length
```

Oczekiwane: `true`. Wynik `false` oznacza powtórzony identyfikator, co psuje powiązanie etykiet
z polami i dostępność formularza.

- [ ] **Krok 4: Commit**

```bash
git add components/marketing/service-cta.tsx "app/uslugi/[slug]/page.tsx"
git commit -m "feat(uslugi): warstwa konwersji na stronie uslugi"
```

---

## Zadanie 6: Strona kontaktowa pod własnym adresem

**Pliki:**
- Utwórz: `app/kontakt/page.tsx`
- Modyfikuj: `app/sitemap.ts`

Dziś kontakt to kotwica na stronie głównej. Osobny adres jest potrzebny, żeby dało się go
zalinkować z zewnątrz, pokazać w wynikach wyszukiwania i wskazać w danych strukturalnych.

- [ ] **Krok 1: Utwórz stronę**

Server Component, obecny język wizualny, treść:
- nagłówek i jedno zdanie o tym, czego się spodziewać po kontakcie
- dane: Norbert Chojnacki, telefon `+48 730 094 465`, e-mail `norbert@zautomatyzujemy.pl`
- obszar działania: Chojnice i powiat chojnicki na miejscu, cała Polska zdalnie
- deklaracja czasu odpowiedzi: jeden dzień roboczy
- osadzony `ContactForm` z `idPrefix="kontakt"`

Metadane:

```tsx
export const metadata: Metadata = {
  title: 'Kontakt',
  description:
    'Napisz lub zadzwoń: automatyzacja procesów, chatboty AI, odczyt faktur. Chojnice i powiat chojnicki na miejscu, cała Polska zdalnie. Odpowiadam w ciągu jednego dnia roboczego.',
  alternates: { canonical: '/kontakt' },
}
```

Telefon i e-mail mają być odnośnikami `tel:` i `mailto:`, żeby na telefonie działały jednym dotknięciem.

- [ ] **Krok 2: Dodaj adres do mapy strony**

W `app/sitemap.ts`, do tablicy adresów statycznych, na wzór istniejących wpisów:

```typescript
    {
      url: `${baseUrl}/kontakt`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.8,
    },
```

- [ ] **Krok 3: Sprawdź**

```bash
npm run type-check && npm run build
```

Oczekiwane: build przechodzi, liczba wygenerowanych stron rośnie o jeden wobec poprzedniego.

- [ ] **Krok 4: Commit**

```bash
git add app/kontakt app/sitemap.ts
git commit -m "feat(kontakt): strona kontaktowa pod wlasnym adresem"
```

---

## Zadanie 7: Strona o osobie ze schematem Person

**Pliki:**
- Utwórz: `app/o-mnie/page.tsx`
- Modyfikuj: `app/sitemap.ts`

Dla jednoosobowej działalności to najważniejsza strona zaufania. Klient kupuje konkretnego człowieka,
a wyszukiwarka potrzebuje encji, z którą powiąże witrynę.

Dane od właściciela, potwierdzone: Norbert Chojnacki, inżynier informatyki,
zdjęcie `public/norbert.png`, GitHub `https://github.com/schizae`,
LinkedIn `https://www.linkedin.com/in/norbert-chojnacki-16a351270/`.

- [ ] **Krok 1: Utwórz stronę**

Server Component, obecny język wizualny. Zdjęcie przez `next/image` z `public/norbert.png`,
z sensownym `alt` i jawnymi wymiarami. Treść:
- kim jest i co robi, w pierwszej osobie, bez języka korporacyjnego
- wykształcenie: inżynier informatyki
- czym się zajmuje: automatyzacja procesów, wdrożenia AI, integracje
- odnośniki do GitHuba i LinkedIna, oba z `rel="me noopener"` i `target="_blank"`
- odesłanie do `/kontakt`

Metadane:

```tsx
export const metadata: Metadata = {
  title: 'O mnie — Norbert Chojnacki',
  description:
    'Inżynier informatyki. Wdrażam automatyzacje i AI dla małych i średnich firm. Rozmawiasz bezpośrednio ze mną, od pierwszej rozmowy po uruchomienie.',
  alternates: { canonical: '/o-mnie' },
}
```

- [ ] **Krok 2: Dodaj schemat `Person`**

Użyj istniejącego komponentu `JsonLd` z `components/seo/json-ld`:

```tsx
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          '@id': `${SITE_URL}/o-mnie#osoba`,
          name: 'Norbert Chojnacki',
          jobTitle: 'Inżynier informatyki',
          image: `${SITE_URL}/norbert.png`,
          url: `${SITE_URL}/o-mnie`,
          email: 'norbert@zautomatyzujemy.pl',
          telephone: '+48730094465',
          sameAs: [
            'https://github.com/schizae',
            'https://www.linkedin.com/in/norbert-chojnacki-16a351270/',
          ],
          worksFor: {
            '@type': 'Organization',
            name: 'Zautomatyzujemy.pl',
            url: SITE_URL,
          },
        }}
      />
```

`SITE_URL` zbuduj tak samo jak w sąsiednich stronach, z wartością domyślną
`https://www.zautomatyzujemy.pl`. Test `scripts/canonical-host.test.mjs` tego pilnuje —
jeśli dodasz plik z wartością bez www, dopisz go do listy w teście i popraw.

- [ ] **Krok 3: Dodaj adres do mapy strony**

Analogicznie jak `/kontakt`, z priorytetem `0.7`.

- [ ] **Krok 4: Sprawdź**

```bash
npm run type-check && npm test && npm run build
```

- [ ] **Krok 5: Commit**

```bash
git add app/o-mnie app/sitemap.ts
git commit -m "feat(o-mnie): strona osoby ze schematem Person"
```

---

## Zadanie 8: Powiązanie danych strukturalnych

**Pliki:**
- Modyfikuj: `app/page.tsx`

Dziś `Organization.sameAs` jest pustą tablicą (`app/page.tsx:96`), a osoba nie jest z niczym powiązana.

- [ ] **Krok 1: Uzupełnij `sameAs` i dodaj założyciela**

W schemacie `Organization` na stronie głównej:

```tsx
          sameAs: [
            'https://github.com/schizae',
            'https://www.linkedin.com/in/norbert-chojnacki-16a351270/',
          ],
          founder: {
            '@type': 'Person',
            '@id': `${SITE_URL}/o-mnie#osoba`,
            name: 'Norbert Chojnacki',
          },
```

Identyfikator `@id` musi być identyczny z tym ze strony `/o-mnie`, inaczej wyszukiwarka
potraktuje to jako dwie różne osoby.

- [ ] **Krok 2: Zamień `LocalBusiness` na `ProfessionalService`**

W tym samym pliku zmień `'@type': 'LocalBusiness'` na `'@type': 'ProfessionalService'`
i rozszerz obszar działania, zachowując zasięg krajowy:

```tsx
          areaServed: [
            { '@type': 'Country', name: 'Polska' },
            { '@type': 'AdministrativeArea', name: 'województwo pomorskie' },
          ],
```

`GeoCircle` świadomie pomijamy. Zawężałby deklarację firmy pracującej zdalnie w całym kraju,
a o pakiet map i tak decyduje wizytówka Google, której nie będzie.

- [ ] **Krok 3: Sprawdź poprawność danych strukturalnych**

```bash
npm run build
```

Następnie uruchom `npm run dev`, otwórz stronę główną i w konsoli przeglądarki wykonaj:

```js
[...document.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent)['@type'])
```

Oczekiwane: lista zawiera `Organization`, `WebSite`, `ProfessionalService` i `FAQPage`,
a żaden wpis nie wyrzuca błędu parsowania.

- [ ] **Krok 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat(seo): powiazanie organizacji z osoba i profilami"
```

---

## Zadanie 9: Okruszki widoczne dla czytelnika

**Pliki:**
- Utwórz: `components/seo/breadcrumbs.tsx`
- Modyfikuj: `app/uslugi/[slug]/page.tsx`

Schemat `BreadcrumbList` już istnieje na artykułach i studiach przypadku, ale czytelnik nie widzi
żadnej ścieżki. Na stronie usługi, do której trafia się prosto z wyszukiwarki, to jedyna
podpowiedź, gdzie się jest.

- [ ] **Krok 1: Utwórz komponent**

Server Component przyjmujący tablicę pozycji:

```tsx
interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}
```

Renderuje `<nav aria-label="Ścieżka nawigacji">` z listą, gdzie każda pozycja poza ostatnią
jest odnośnikiem, a ostatnia zwykłym tekstem z `aria-current="page"`.
Separatory mają mieć `aria-hidden="true"`, żeby czytnik ekranu ich nie odczytywał.
Komponent renderuje wyłącznie warstwę widoczną. Schemat `BreadcrumbList` zostaje tam,
gdzie jest dzisiaj, czyli w `JsonLd` na stronie — nie duplikuj go tutaj.

- [ ] **Krok 2: Osadź na stronie usługi**

Ścieżka: strona główna, usługi, nazwa bieżącej usługi.

- [ ] **Krok 3: Sprawdź dostępność**

Uruchom `npm run dev` i przejdź po stronie usługi samym tabulatorem. Każdy odnośnik w okruszkach
musi mieć widoczny stan skupienia. Sprawdź też, czy separator nie trafia do kolejności tabulacji.

- [ ] **Krok 4: Commit**

```bash
git add components/seo/breadcrumbs.tsx "app/uslugi/[slug]/page.tsx"
git commit -m "feat(uslugi): widoczne okruszki nawigacyjne"
```

---

## Zadanie 10: Przepisanie czterech usług pod frazy docelowe

**Pliki:** treść w bazie, edytowana przez panel z Zadania 4. Bez zmian w kodzie.

Przypisanie fraz pochodzi z `docs/seo/keyword-map.md`, sekcja 2.2.

| Usługa | Fraza główna | Frazy wspierające |
|---|---|---|
| `automatyzacja-procesow-biznesowych` | automatyzacja procesów w firmie | automatyzacja procesów biznesowych firmy, automatyzacja procesów księgowych, automatyzacja procesów obsługi klienta |
| `chatboty-i-asystenci-ai` | chatbot dla firmy | agent ai dla firmy, asystent ai dla firmy |
| `automatyzacja-dokumentow-i-faktur` | automatyzacja faktur kosztowych | automatyzacja obiegu dokumentów, ocr faktur zakupu |
| `szkolenia-z-ai-dla-zespolow` | szkolenie ai dla firm | szkolenie ai w firmie |

- [ ] **Krok 1: Dla każdej z czterech usług napisz treść według tej samej struktury**

- pierwszy akapit odpowiada na pytanie zawarte we frazie w dwóch zdaniach, przed jakimkolwiek wstępem
- fraza główna pada w tytule, w pierwszym akapicie i w jednym śródtytule, i nigdzie więcej
- problem, który rozwiązujemy, opisany językiem klienta, nie technologii
- jak wygląda wdrożenie, krok po kroku, z czasem trwania
- czego potrzebuję od klienta, żeby zacząć
- rząd wielkości kosztu, choćby jako widełki
- sekcja pytań i odpowiedzi, od trzech do pięciu pytań
- **zakaz**: obiecywania efektów, których nie da się pokazać, i powoływania się na scenariusze
  poglądowe ze studiów przypadku jako na zrealizowane wdrożenia

- [ ] **Krok 2: Uzupełnij `seo_title` i `seo_description`**

Tytuł do 60 znaków z frazą główną na początku. Opis do 160 znaków, mówiący, co czytelnik zyska,
a nie czym jest usługa.

- [ ] **Krok 3: Po zapisaniu treści odśwież bazę wiedzy chatbota**

Treść usług zasila chatbota przez embeddingi. Uruchom ręcznie workflow `kb-refresh.yml`
w zakładce Actions na GitHubie. Bez tego chatbot będzie cytował poprzednią wersję oferty.

- [ ] **Krok 4: Sprawdź, czy fraza faktycznie pada tam, gdzie ma**

Dla każdej z czterech stron otwórz ją i wykonaj w konsoli:

```js
document.title + ' | H1: ' + document.querySelector('h1').textContent
```

Oczekiwane: fraza główna widoczna w obu miejscach.

---

## Domknięcie

- [ ] **Krok 1: Pełna weryfikacja**

```bash
npm ci && npm test && npm run type-check && npm run lint && npm run build
```

- [ ] **Krok 2: Sprawdź mapę strony**

Uruchom `npm run dev` i otwórz `http://localhost:3000/sitemap.xml`.
Oczekiwane: siedem adresów `/uslugi/...` plus `/uslugi`, `/kontakt` i `/o-mnie`,
czyli dziesięć nowych wobec stanu sprzed planu.

- [ ] **Krok 3: Otwórz pull request**

```bash
git push -u origin feat/uslugi-i-osoba
gh pr create --base main --head feat/uslugi-i-osoba --title "Strony uslugowe i strona o osobie" --body "Odblokowanie odlozonej galezi, siedem stron uslugowych na obecnym designie, strona kontaktowa, strona o osobie ze schematem Person, warstwa konwersji i okruszki. Drugi z planow projektu widocznosci."
```

- [ ] **Krok 4: Po wdrożeniu zgłoś nowe adresy do indeksacji**

Zadanie właściciela. W Search Console, narzędzie sprawdzania adresu URL, zgłoś do indeksacji
`/uslugi`, `/kontakt`, `/o-mnie` oraz cztery przepisane strony usług.

**Kryterium ukończenia planu:** dziesięć nowych adresów w mapie strony, każdy z unikalnym tytułem,
opisem i nagłówkiem pierwszego poziomu, wszystkie zgłoszone do indeksacji,
a chatbot cytuje aktualną treść usług.
