# Strony usługowe `/uslugi` — plan wdrożenia

> **Dla agentów wykonawczych:** WYMAGANY SUB-SKILL: użyj `superpowers:subagent-driven-development` (zalecane) albo `superpowers:executing-plans`, żeby wykonać ten plan zadanie po zadaniu. Kroki mają składnię checkboxów (`- [ ]`).

**Cel:** Siedem usług dostaje własne adresy `/uslugi/<slug>` plus stronę zbiorczą `/uslugi`, żeby każda usługa mogła rankować pod własne zapytanie zamiast dzielić jeden URL ze stroną główną.

**Architektura:** Treść mieszka w Supabase w rozszerzonej tabeli `services` (jak `case_studies`), renderowana przez `MDXRemote` z `safeMdxComponents`. Trasy kopiują wzorzec z `app/case-studies/` — `createServiceClient()`, `generateMetadata`, `JsonLd`. Sekcja na stronie głównej zostaje wizualnie bez zmian, dostaje tylko linki do nowych stron.

**Stos:** Next.js 15 App Router, TypeScript strict, Supabase (service role), `next-mdx-remote/rsc`, Tailwind, schema.org `Service` + `BreadcrumbList`.

---

## Kontekst — ustalenia przed startem

**Rozjazd, który ten plan likwiduje.** Sekcja `ServicesSection` na stronie głównej ma 5 zahardkodowanych kafelków z AI Act jako flagowym. Tabela `services` w bazie — z której korzysta chatbot przez RAG — ma 6 innych pozycji i nie zawiera AI Act. Strona i bot mówią dziś o różnych usługach. Po tym planie źródłem prawdy jest baza, a lista liczy 7 pozycji.

**Ustalona lista i slugi:**

| # | Usługa | Slug | Ikona |
|---|---|---|---|
| 1 | Automatyzacja procesów biznesowych | `automatyzacja-procesow-biznesowych` | `Zap` |
| 2 | Chatboty i asystenci AI | `chatboty-i-asystenci-ai` | `MessageSquare` |
| 3 | Automatyzacja dokumentów i faktur | `automatyzacja-dokumentow-i-faktur` | `FileText` |
| 4 | Audyt i doradztwo AI | `audyt-i-doradztwo-ai` | `Search` |
| 5 | Szkolenia z AI dla zespołów | `szkolenia-z-ai-dla-zespolow` | `GraduationCap` |
| 6 | Strony i oprogramowanie na zamówienie | `strony-i-oprogramowanie-na-zamowienie` | `Code` |
| 7 | Zgodność z AI Act | `zgodnosc-z-ai-act` | `Shield` |

**Zasady dla treści — obowiązują w każdym zadaniu:**

- **Zero deklaracji o klientach.** Nie ma zdań „pomagam klientom", „typowo oszczędzam", „moi klienci". Działalność startuje. To ta sama zasada, którą 9 sierpnia 2026 wymusiliśmy na chatbocie — patrz commit `21a7f0e`.
- **Bez cen, terminów i gwarancji efektów.** Wycena jest indywidualna i ustala ją Norbert.
- **Pierwsza osoba liczby pojedynczej** („buduję", „prowadzę", „przeglądam") — spójnie z sekcją na stronie głównej.
- **Liczby wyłącznie jako widełki hipotetyczne**, zawsze z zastrzeżeniem, że zależą od procesu.

**Brak runnera testów.** W projekcie nie ma Vitest ani Jest, a dokładanie zależności wymaga zgody właściciela (patrz plan Fazy A, sekcja „Świadomie poza zakresem"). Zamiast testów jednostkowych każde zadanie kończy się **weryfikowalną komendą z oczekiwanym wyjściem**: `npm run type-check`, `npm run lint`, `npm run build` albo zapytanie SQL/HTTP. To nie jest pominięcie TDD z lenistwa — to brak narzędzia, którego nie wolno dodać bez pytania.

---

## Struktura plików

**Tworzone:**
- `supabase/migrations/010_services_pages.sql` — kolumny, slugi, rekord AI Act
- `supabase/migrations/011_services_content.sql` — treści MDX siedmiu usług
- `app/uslugi/page.tsx` — lista usług
- `app/uslugi/[slug]/page.tsx` — strona pojedynczej usługi

**Modyfikowane:**
- `types/index.ts:93-102` — interfejs `Service`
- `app/sitemap.ts:42-50` — wpisy `/uslugi` i `/uslugi/<slug>`
- `components/marketing/services-section.tsx` — linki do stron + usunięcie fałszywej deklaracji z linii 80-81
- `components/marketing/navbar.tsx:11` — „Rozwiązania" prowadzi do `/uslugi`
- `scripts/generate-embeddings.mjs:138-143` — RAG indeksuje pełne treści usług

---

## Zadanie 1: Migracja schematu i slugów

**Pliki:**
- Utwórz: `supabase/migrations/010_services_pages.sql`

- [ ] **Krok 1: Sprawdź stan wyjściowy tabeli**

Uruchom przez MCP Supabase (`execute_sql`):

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'services' ORDER BY ordinal_position;
```

Oczekiwane: `id, title, description, icon, sort_order, is_active, created_at, updated_at` — **bez** `slug`.

Sprawdź też warunek, od którego zależy bezpieczeństwo `SET NOT NULL` na końcu migracji:

```sql
SELECT count(*) AS wszystkie, count(*) FILTER (WHERE NOT is_active) AS nieaktywne,
       max(sort_order) AS max_sort FROM services;
```

Oczekiwane (stan zweryfikowany 17 sierpnia 2026): `wszystkie = 6`, `nieaktywne = 0`, `max_sort = 6`. Sześć poniższych `UPDATE` pokrywa wtedy **wszystkie** wiersze i po wstawieniu AI Act żaden nie zostaje bez sluga. Gdyby liczby się różniły — zatrzymaj się i uzupełnij slugi dla nadmiarowych wierszy, zanim nałożysz `NOT NULL`.

- [ ] **Krok 2: Napisz migrację**

```sql
-- 010_services_pages.sql
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
```

- [ ] **Krok 3: Zastosuj migrację**

Wykonaj zawartość pliku przez MCP Supabase (`execute_sql`).

- [ ] **Krok 4: Zweryfikuj**

```sql
SELECT sort_order, slug, title FROM services WHERE is_active = TRUE ORDER BY sort_order;
```

Oczekiwane: **7 wierszy**, każdy z niepustym slugiem, siódmy to `zgodnosc-z-ai-act`.

- [ ] **Krok 5: Commit**

```bash
git add supabase/migrations/010_services_pages.sql
git commit -m "feat(uslugi): migracja 010 — slugi i pola tresci dla uslug"
```

---

## Zadanie 2: Typ `Service`

**Pliki:**
- Modyfikuj: `types/index.ts:93-102`

- [ ] **Krok 1: Rozszerz interfejs**

Zastąp obecny interfejs `Service`:

```typescript
export interface Service {
  id: string
  title: string
  description: string
  icon: string
  sort_order: number
  is_active: boolean
  /** Klucz trasy /uslugi/<slug> — unikalny, wymagany od migracji 010 */
  slug: string
  /** Jedno zdanie pod nagłówkiem na stronie usługi */
  subtitle: string | null
  /** Treść MDX renderowana przez MDXRemote */
  content: string | null
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}
```

- [ ] **Krok 2: Sprawdź typy**

Uruchom: `npm run type-check`
Oczekiwane: brak błędów. Gdyby jakieś miejsce budowało obiekt `Service` ręcznie, ujawni się tutaj.

- [ ] **Krok 3: Commit**

```bash
git add types/index.ts
git commit -m "feat(typy): Service z slugiem i polami tresci"
```

---

## Zadanie 3: Treści siedmiu usług

**Pliki:**
- Utwórz: `supabase/migrations/011_services_content.sql`

- [ ] **Krok 1: Napisz migrację z treściami**

Uwaga składniowa: w SQL apostrof wewnątrz tekstu zapisuje się **podwójnie** (`''`). Poniższe treści już to uwzględniają.

```sql
-- 011_services_content.sql
-- Treści stron usługowych. Zasady: zero deklaracji o zrealizowanych
-- wdrożeniach i klientach, zero cen i terminów, pierwsza osoba liczby
-- pojedynczej.

UPDATE services SET
  subtitle = 'Łączę narzędzia, z których już korzystasz, żeby dane przepływały między nimi bez ręcznego przepisywania.',
  seo_title = 'Automatyzacja procesów biznesowych — n8n i Make dla firm',
  seo_description = 'Automatyzacja powtarzalnych procesów w firmie: integracje CRM, księgowości, sklepu i poczty na n8n i Make. Bezpłatna konsultacja.',
  content = '## Problem

Dane w firmie krążą między systemami, ale przenosi je człowiek. Ktoś przepisuje zamówienie ze sklepu do księgowości, ktoś przekleja dane z maila do CRM-u, ktoś raz w tygodniu składa raport z czterech arkuszy. Każda z tych czynności jest drobna. Razem potrafią zjeść etat.

## Jak to robię

Zaczynam od prześledzenia jednego procesu od początku do końca i policzenia, ile realnie zajmuje. Dopiero potem buduję automatyzację — najczęściej w **n8n** lub **Make**, czyli narzędziach, w których przepływ widać jako diagram, a nie jako kod zrozumiały dla jednej osoby.

To celowa decyzja: rozwiązanie zostaje Twoje. Możesz je rozwijać samodzielnie albo zlecić komu innemu, bez uzależnienia ode mnie.

## Dla kogo

Dla firm, w których ktoś regularnie robi to samo ręcznie i wie, że to strata czasu — ale nikt nie ma przestrzeni, żeby się tym zająć. Zwykle są to zespoły od kilku do kilkudziesięciu osób, korzystające z kilku niepołączonych narzędzi.

## Co dostajesz

- Mapę procesu przed zmianą, z policzonym czasem
- Działającą automatyzację wraz z obsługą sytuacji wyjątkowych
- Dokumentację po polsku i przekazanie, żebyś wiedział, co się dzieje
- Ustalony sposób reagowania, gdy zewnętrzne narzędzie zmieni zasady działania

Ile czasu odzyskasz, zależy od tego, jak wygląda dany proces — realnie oceniam to dopiero po jego obejrzeniu, nie wcześniej.'
WHERE slug = 'automatyzacja-procesow-biznesowych';

UPDATE services SET
  subtitle = 'Asystent, który zna Twoją ofertę i odpowiada klientom o każdej porze — na stronie, w komunikatorze albo wewnątrz firmy.',
  seo_title = 'Chatboty i asystenci AI dla firm — wdrożenie zgodne z AI Act',
  seo_description = 'Chatbot oparty na Twojej bazie wiedzy: odpowiada na pytania klientów, zbiera kontakty, działa całą dobę. Wdrożenie zgodne z AI Act.',
  content = '## Problem

Te same pytania wracają codziennie: czy macie to na stanie, jak długo trwa wysyłka, jak wygląda zwrot, ile to kosztuje. Odpowiada na nie człowiek, który mógłby w tym czasie robić coś, czego nikt inny nie zrobi. Po godzinach nie odpowiada nikt, a klient idzie dalej.

## Jak to robię

Buduję asystenta na **Twojej** bazie wiedzy — dokumentacji, regulaminie, FAQ, opisach produktów. Nie na ogólnej wiedzy modelu, bo ta bywa nieaktualna i potrafi zmyślać. Technicznie to podejście zwane RAG: bot najpierw znajduje właściwy fragment Twoich treści, dopiero potem układa odpowiedź.

Gdy pytanie wykracza poza to, co bot wie, przyznaje to wprost i zbiera kontakt zamiast zgadywać. Ten sam mechanizm działa na tej stronie — możesz go przetestować w prawym dolnym rogu.

## Zgodność z prawem od pierwszego dnia

Od 2 sierpnia 2026 AI Act wymaga, żeby użytkownik wiedział, że rozmawia z maszyną. Każdy asystent, którego buduję, przedstawia się jako AI i nie udaje człowieka. To nie jest dodatek — to warunek legalnego działania.

## Dla kogo

Dla firm z powtarzalnym ruchem w obsłudze klienta i uporządkowaną wiedzą do wykorzystania. Jeśli tej wiedzy jeszcze nie ma, zaczynamy od jej spisania — bez tego żaden asystent nie zadziała sensownie.

## Co dostajesz

- Asystenta osadzonego na stronie, w komunikatorze albo wewnątrz firmy
- Bazę wiedzy, którą można rozwijać bez przebudowy całości
- Przekazywanie kontaktów wraz z podsumowaniem rozmowy
- Widoczne oznaczenie AI zgodne z wymogami przejrzystości'
WHERE slug = 'chatboty-i-asystenci-ai';

UPDATE services SET
  subtitle = 'Faktury i dokumenty odczytywane automatycznie: numery, kwoty, terminy, kontrahenci — bez ręcznego przepisywania.',
  seo_title = 'Automatyzacja faktur i dokumentów — odczyt danych przez AI',
  seo_description = 'Automatyczny odczyt faktur z maili i skanów: numer, kwota, termin, kontrahent trafiają wprost do systemu księgowego. Bezpłatna konsultacja.',
  content = '## Problem

Faktury przychodzą mailem, w PDF-ie, czasem jako zdjęcie zrobione telefonem. Ktoś je otwiera, przepisuje cztery pola do systemu i odkłada do katalogu. Przy kilkuset dokumentach miesięcznie to nie jest drobiazg — to etat, w dodatku taki, w którym literówka kosztuje najwięcej.

## Jak to robię

Dokument trafia do odczytu automatycznie — z monitorowanej skrzynki albo katalogu. Model wyciąga numer, datę, kwoty, stawki VAT i dane kontrahenta, po czym dane lądują tam, gdzie mają: w systemie księgowym, arkuszu albo bazie.

Kluczowa część to nie odczyt, tylko **kontrola**. Automat, który cicho myli kwoty, jest gorszy od jego braku. Dlatego każdy odczyt dostaje próg pewności, a dokumenty wątpliwe trafiają do ręcznego zatwierdzenia zamiast przechodzić dalej.

## Dla kogo

Dla firm przyjmujących regularnie powtarzalne dokumenty: faktury zakupowe, zamówienia, protokoły, listy przewozowe. Im bardziej ustalony format, tym prościej — ale różnorodność sama w sobie nie jest przeszkodą.

## Co dostajesz

- Automatyczny odczyt z maila, skanu albo katalogu
- Zapis do Twojego systemu księgowego lub bazy
- Próg pewności i kolejkę dokumentów do ręcznego sprawdzenia
- Archiwum z możliwością wyszukiwania po treści, nie tylko po nazwie pliku'
WHERE slug = 'automatyzacja-dokumentow-i-faktur';

UPDATE services SET
  subtitle = 'Zanim cokolwiek wdrożymy: przegląd procesów i uczciwa odpowiedź, co warto zautomatyzować, a co lepiej zostawić człowiekowi.',
  seo_title = 'Audyt AI i doradztwo — co w firmie warto zautomatyzować',
  seo_description = 'Przegląd procesów firmy pod kątem automatyzacji i AI. Uporządkowana lista tego, co warto wdrożyć — i czego nie. Bezpłatna konsultacja.',
  content = '## Problem

O sztucznej inteligencji mówią wszyscy, więc łatwo wdrożyć coś, bo wypada, a nie dlatego, że rozwiązuje problem. Odwrotna pułapka jest równie kosztowna: firma odkłada temat latami, bo nie wie, od czego zacząć, i traci czas na rzeczach, które maszyna zrobiłaby lepiej.

## Jak to robię

Przeglądam procesy tak, jak działają naprawdę, a nie jak wyglądają na schemacie. Rozmawiam z ludźmi, którzy je wykonują, bo to oni wiedzą, gdzie są obejścia i drugie arkusze prowadzone „na boku".

Wynikiem jest lista uporządkowana według stosunku zysku do trudności — z jawnym zaznaczeniem tego, **czego automatyzować nie warto**. Ta druga część bywa cenniejsza, bo oszczędza pieniądze wydane na rozwiązanie problemu, którego nie ma.

## Dla kogo

Dla firm, które chcą zacząć, ale nie wiedzą gdzie — oraz dla tych, które próbowały i się rozczarowały. Także dla takich, które chcą zweryfikować ofertę otrzymaną skądinąd, zanim ją podpiszą.

## Co dostajesz

- Mapę procesów z policzonym czasem i punktami zapalnymi
- Listę usprawnień w kolejności opłacalności
- Wyraźne wskazanie rzeczy, których nie warto ruszać
- Szacunek nakładu przy każdej pozycji, żebyś mógł zdecydować samodzielnie

Audyt jest samodzielną usługą. Możesz go wykorzystać u kogokolwiek — nie jest wstępem, który do czegoś zobowiązuje.'
WHERE slug = 'audyt-i-doradztwo-ai';

UPDATE services SET
  subtitle = 'Praktyczne warsztaty pod konkretne stanowiska — narzędzia i sposoby pracy, z których zespół skorzysta następnego dnia.',
  seo_title = 'Szkolenia z AI dla firm — obowiązek AI literacy z AI Act',
  seo_description = 'Warsztaty z AI dopasowane do stanowisk w Twojej firmie. Realizują obowiązek AI literacy z AI Act. Zaświadczenia i dokumentacja.',
  content = '## Problem

Część zespołu używa narzędzi AI po kryjomu, bo nikt nie powiedział, czy wolno. Część nie używa wcale, bo nie wie jak zacząć. Efekt jest podwójnie zły: dane firmy trafiają tam, gdzie nie powinny, a korzyści i tak nie ma.

Do tego dochodzi obowiązek prawny. AI Act wymaga od firm zapewnienia pracownikom odpowiedniego poziomu wiedzy o sztucznej inteligencji — to nie jest dobra praktyka, tylko wymóg.

## Jak to robię

Szkolenie układam pod stanowiska, nie pod ogólny temat. Handlowiec, księgowa i osoba z obsługi klienta mają zupełnie inne zastosowania i zupełnie inne pułapki do ominięcia.

Prowadzę je warsztatowo, na narzędziach i na danych zbliżonych do tych, z którymi zespół pracuje na co dzień. Bez slajdów o rewolucji — z konkretami, które da się użyć następnego dnia.

Osobny blok poświęcam temu, czego robić nie wolno: jakich danych nie wolno wklejać, kiedy odpowiedź modelu wymaga sprawdzenia i skąd się biorą pewnie brzmiące nieprawdy.

## Dla kogo

Dla zespołów na dowolnym poziomie zaawansowania, w tym takich, które zaczynają od zera. Także dla firm, które potrzebują udokumentować wypełnienie obowiązku z AI Act.

## Co dostajesz

- Program dopasowany do stanowisk w Twojej firmie
- Warsztat na realnych przypadkach, nie na przykładach z internetu
- Zasady bezpiecznego korzystania spisane dla zespołu
- Zaświadczenia i dokumentację przydatną przy wykazywaniu zgodności'
WHERE slug = 'szkolenia-z-ai-dla-zespolow';

UPDATE services SET
  subtitle = 'Szybkie, dostępne strony i aplikacje szyte pod proces, którego nie obsłuży żadne gotowe narzędzie.',
  seo_title = 'Strony internetowe i oprogramowanie na zamówienie — Next.js',
  seo_description = 'Strony i aplikacje budowane pod konkretny proces. Next.js, TypeScript, dostępność i szybkość. Bezpłatna konsultacja.',
  content = '## Problem

Czasem gotowe narzędzie po prostu nie pasuje. Albo pasuje w siedemdziesięciu procentach, a pozostałe trzydzieści zespół obchodzi arkuszem i wiedzą trzymaną w głowie. Bywa też odwrotnie: firma płaci abonament za rozbudowany system, z którego używa trzech funkcji.

## Jak to robię

Buduję na **Next.js i TypeScript** — to ten sam stos, na którym stoi strona, którą właśnie czytasz, razem z panelem administracyjnym i chatbotem. Nie polecam narzędzi, których sam nie używam.

Zaczynam od procesu, nie od wyglądu. Wygląd jest ważny, ale aplikacja, która ładnie wygląda i nie pasuje do sposobu pracy, i tak wyląduje obok arkusza.

Szybkość i dostępność traktuję jako część zakresu, nie dodatek. Strona ma działać na słabym telefonie i przy słabym zasięgu, bo tak wygląda znaczna część ruchu.

## Dla kogo

Dla firm z procesem na tyle własnym, że gotowe narzędzia go nie obejmują — oraz dla tych, którym obecna strona nie przynosi zapytań i nie wiadomo dlaczego.

## Co dostajesz

- Aplikację lub stronę zbudowaną pod Twój proces
- Kod, który zostaje Twój, wraz z dostępem do repozytorium
- Dokumentację wdrożeniową i przekazanie
- Podstawową analitykę, żeby dało się zobaczyć, co działa'
WHERE slug = 'strony-i-oprogramowanie-na-zamowienie';

UPDATE services SET
  subtitle = 'Unijne rozporządzenie o AI obowiązuje od 2 sierpnia 2026 i dotyczy także firm, które tylko korzystają z gotowych narzędzi.',
  seo_title = 'Zgodność z AI Act dla MŚP — audyt, wdrożenie i szkolenie',
  seo_description = 'AI Act obowiązuje od 2 sierpnia 2026. Klasyfikacja systemów, wymagane oznaczenia, dokumentacja i szkolenie zespołu. Bezpłatna konsultacja.',
  content = '## Problem

Powszechne jest przekonanie, że AI Act dotyczy tych, którzy sztuczną inteligencję tworzą. Nieprawda — obowiązki spadają też na firmy, które z niej tylko korzystają. Chatbot na stronie, narzędzie do selekcji CV, system oceniający zdolność kredytową: każde z nich uruchamia konkretne wymagania.

Obowiązki przejrzystości obowiązują **od 2 sierpnia 2026** i są egzekwowane karami. Terminy dla systemów wysokiego ryzyka przesunięto na grudzień 2027, co daje czas — ale nie na bezczynność.

## Jak to robię

Zaczynam od inwentaryzacji: co w firmie w ogóle jest systemem AI w rozumieniu rozporządzenia. Ta lista zwykle okazuje się dłuższa, niż wszyscy zakładali, bo obejmuje także narzędzia wbudowane w programy używane od lat.

Potem klasyfikacja według poziomu ryzyka, bo od niej zależy cała reszta. Następnie wdrożenie tego, co wymagane: oznaczanie treści generowanych przez AI, informowanie użytkowników o kontakcie z maszyną, dokumentacja, polityka korzystania i szkolenie zespołu.

## Dla kogo

Dla małych i średnich firm, które używają AI — świadomie albo nie zdając sobie z tego sprawy. Szczególnie tych, które przetwarzają dane osobowe albo podejmują z pomocą AI decyzje dotyczące ludzi.

## Co dostajesz

- Inwentaryzację systemów AI używanych w firmie
- Klasyfikację ryzyka wraz z uzasadnieniem
- Wdrożenie wymaganych mechanizmów przejrzystości
- Politykę korzystania z AI i szkolenie zespołu
- Komplet dokumentacji na wypadek kontroli

Zanim zdecydujesz się na współpracę, możesz zacząć od bezpłatnej [checklisty AI Act](/ai-act-checklist) i sprawdzić samodzielnie, co Cię dotyczy.'
WHERE slug = 'zgodnosc-z-ai-act';
```

- [ ] **Krok 2: Zastosuj migrację**

Wykonaj plik przez MCP Supabase (`execute_sql`).

- [ ] **Krok 3: Zweryfikuj kompletność**

```sql
SELECT slug,
       subtitle IS NOT NULL AS ma_podtytul,
       length(content)      AS dlugosc_tresci,
       seo_title IS NOT NULL AS ma_seo
FROM services WHERE is_active = TRUE ORDER BY sort_order;
```

Oczekiwane: 7 wierszy, wszędzie `true`, `dlugosc_tresci` powyżej 1000 znaków.

- [ ] **Krok 4: Sprawdź, czy nie wróciły fałszywe deklaracje**

```sql
SELECT slug FROM services
WHERE content ILIKE '%moich klientów%' OR content ILIKE '%pomagałem%'
   OR content ILIKE '%zrealizowa%'     OR content ILIKE '%moi klienci%';
```

Oczekiwane: **zero wierszy**.

- [ ] **Krok 5: Commit**

```bash
git add supabase/migrations/011_services_content.sql
git commit -m "feat(uslugi): migracja 011 — tresci siedmiu stron uslugowych"
```

---

## Zadanie 4: Strona pojedynczej usługi

**Pliki:**
- Utwórz: `app/uslugi/[slug]/page.tsx`

- [ ] **Krok 1: Napisz stronę**

Wzorzec skopiowany z `app/case-studies/[slug]/page.tsx` — ta sama para `createServiceClient` + `generateMetadata`, ten sam `MDXRemote` z `safeMdxComponents`.

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { createServiceClient } from '@/lib/supabase/server'
import { safeMdxComponents } from '@/lib/mdx-components'
import { JsonLd } from '@/components/seo/json-ld'
import type { Service } from '@/types'

const SITE_URL =
  process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://zautomatyzujemy.pl'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('services')
    .select('title, description, seo_title, seo_description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!data) return { title: 'Usługa nie znaleziona' }

  return {
    title: data.seo_title ?? data.title,
    description: data.seo_description ?? data.description,
    alternates: { canonical: `/uslugi/${slug}` },
    openGraph: {
      type: 'website',
      title: data.seo_title ?? data.title,
      description: data.seo_description ?? data.description,
      url: `/uslugi/${slug}`,
    },
  }
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!data) notFound()
  const service = data as Service

  return (
    <main className="min-h-screen bg-white">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.title,
          description: service.description,
          serviceType: service.title,
          provider: {
            '@type': 'Organization',
            name: 'Zautomatyzujemy.pl',
            url: SITE_URL,
          },
          areaServed: { '@type': 'Country', name: 'Polska' },
          url: `${SITE_URL}/uslugi/${service.slug}`,
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Strona główna', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Usługi', item: `${SITE_URL}/uslugi` },
            {
              '@type': 'ListItem',
              position: 3,
              name: service.title,
              item: `${SITE_URL}/uslugi/${service.slug}`,
            },
          ],
        }}
      />

      <div className="bg-slate-950 pt-20 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/uslugi"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-8"
          >
            <ArrowLeft size={16} />
            Wszystkie usługi
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            {service.title}
          </h1>
          {service.subtitle && (
            <p className="text-slate-300 text-lg leading-relaxed">{service.subtitle}</p>
          )}
        </div>
      </div>

      {service.content && (
        <article className="max-w-3xl mx-auto px-6 py-16 text-slate-800 leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-5 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol]:space-y-1.5 [&_li]:text-slate-700 [&_strong]:font-bold [&_em]:italic [&_a]:text-primary [&_a]:underline [&_a]:hover:opacity-80">
          <MDXRemote source={service.content} components={safeMdxComponents} />
        </article>
      )}

      <section className="bg-slate-50 border-t border-slate-200 px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Porozmawiajmy o Twoim procesie</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Zakres i wycenę ustalam indywidualnie, po obejrzeniu tego, jak pracujecie dzisiaj.
            Pierwsza rozmowa jest bezpłatna i do niczego nie zobowiązuje.
          </p>
          <Link
            href="/#kontakt"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white font-bold hover:brightness-110 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Umów bezpłatną konsultację
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  )
}
```

- [ ] **Krok 2: Sprawdź typy i lint**

Uruchom: `npm run type-check && npm run lint`
Oczekiwane: brak błędów.

- [ ] **Krok 3: Commit**

```bash
git add app/uslugi/[slug]/page.tsx
git commit -m "feat(uslugi): strona pojedynczej uslugi ze schematem Service"
```

---

## Zadanie 5: Strona zbiorcza `/uslugi`

**Pliki:**
- Utwórz: `app/uslugi/page.tsx`

- [ ] **Krok 1: Napisz stronę**

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, MoveRight } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import { JsonLd } from '@/components/seo/json-ld'
import type { Service } from '@/types'

const SITE_URL =
  process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://zautomatyzujemy.pl'

export const metadata: Metadata = {
  title: 'Usługi — automatyzacja i AI dla firm',
  description:
    'Automatyzacja procesów, chatboty AI, odczyt faktur, audyt, szkolenia, oprogramowanie na zamówienie i zgodność z AI Act. Bezpłatna konsultacja.',
  alternates: { canonical: '/uslugi' },
}

export default async function ServicesPage() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  const services = (data ?? []) as Service[]

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Usługi Zautomatyzujemy.pl',
          itemListElement: services.map((service, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: service.title,
            url: `${SITE_URL}/uslugi/${service.slug}`,
          })),
        }}
      />

      <div className="bg-slate-950 pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-8"
          >
            <ArrowLeft size={16} />
            Wróć na stronę główną
          </Link>
          <h1 className="text-5xl font-extrabold text-white tracking-tight">Usługi</h1>
          <p className="text-slate-400 mt-4 text-lg max-w-2xl">
            Każde wdrożenie zaczyna się od konkretnego problemu, który kosztuje czas albo
            pieniądze. Poniżej obszary, w których pomagam.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {services.length === 0 ? (
          <p className="text-center text-slate-400 py-16">Brak dostępnych usług.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(service => (
              <Link key={service.slug} href={`/uslugi/${service.slug}`}>
                <article className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {service.title}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                    {service.subtitle ?? service.description}
                  </p>
                  <span className="text-primary font-bold text-sm inline-flex items-center gap-1">
                    Zobacz szczegóły <MoveRight size={14} />
                  </span>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Krok 2: Sprawdź typy i lint**

Uruchom: `npm run type-check && npm run lint`
Oczekiwane: brak błędów.

- [ ] **Krok 3: Zweryfikuj w przeglądarce**

Uruchom `npm run dev`, otwórz `http://localhost:3000/uslugi`.
Oczekiwane: siedem kafelków, każdy prowadzi do własnej strony.

- [ ] **Krok 4: Commit**

```bash
git add app/uslugi/page.tsx
git commit -m "feat(uslugi): strona zbiorcza z lista siedmiu uslug"
```

---

## Zadanie 6: Sitemapa

**Pliki:**
- Modyfikuj: `app/sitemap.ts`

- [ ] **Krok 1: Dodaj pobranie usług**

W `app/sitemap.ts` dopisz `services` do istniejącego `Promise.all` (obecnie pobiera `posts` i `caseStudiesResult`):

```typescript
  const [postsResult, caseStudiesResult, servicesResult] = await Promise.all([
    supabase
      .from('posts')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false }),
    supabase
      .from('case_studies')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('services')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('sort_order'),
  ])

  const posts = postsResult.data ?? []
  const caseStudies = caseStudiesResult.data ?? []
  const services = servicesResult.data ?? []
```

- [ ] **Krok 2: Dodaj wpisy do zwracanej tablicy**

Zaraz po wpisie `/blog`, przed `/case-studies`, dodaj stronę zbiorczą — priorytet 0.9, bo to druga najważniejsza strona serwisu po głównej:

```typescript
    {
      url: `${baseUrl}/uslugi`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
```

Na końcu tablicy, obok pozostałych rozwinięć, dodaj strony poszczególnych usług:

```typescript
    ...services.map(service => ({
      url: `${baseUrl}/uslugi/${service.slug}`,
      lastModified: new Date(service.updated_at as string),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
```

- [ ] **Krok 3: Zweryfikuj**

Uruchom `npm run dev`, potem:

```bash
curl -s http://localhost:3000/sitemap.xml | grep -c "uslugi"
```

Oczekiwane: **8** (strona zbiorcza plus siedem usług).

- [ ] **Krok 4: Commit**

```bash
git add app/sitemap.ts
git commit -m "feat(seo): strony uslugowe w sitemapie"
```

---

## Zadanie 7: Sekcja na stronie głównej — linki i usunięcie fałszywej deklaracji

**Pliki:**
- Modyfikuj: `components/marketing/services-section.tsx`

Sekcja zostaje wizualnie bez zmian. Dwie zmiany: kafelki prowadzą do stron, a z kafelka o automatyzacji znika deklaracja o klientach.

- [ ] **Krok 1: Usuń fałszywą deklarację**

W kafelku „Automatyzacja powtarzalnych procesów" (linie 76-82) zastąp ostatnie zdanie. Było:

```
czynności za Was — 24 godziny na dobę, bez błędów, bez urlopów. Typowo
oszczędzam klientom od 10 do 40 godzin tygodniowo.
```

Ma być:

```
czynności za Was — 24 godziny na dobę, bez błędów, bez urlopów. Ile czasu
odzyskacie, zależy od procesu — liczę to konkretnie podczas bezpłatnej konsultacji.
```

Powód: „typowo oszczędzam klientom" deklaruje zrealizowane wdrożenia i powtarzalny wynik. To ta sama nieprawda, którą naprawiliśmy w chatbocie commitem `21a7f0e`.

- [ ] **Krok 2: Podlinkuj kafelek AI Act**

Zmień `href` w linku wewnątrz kafelka AI Act (linia 58) z `/#kontakt` na `/uslugi/zgodnosc-z-ai-act` i tekst z `Sprawdź zgodność swojej firmy` na `Poznaj szczegóły usługi`.

- [ ] **Krok 3: Owiń trzy kafelki w linki**

Kafelki „Automatyzacja powtarzalnych procesów", „Chatboty i asystenci AI dla obsługi klienta" oraz „Szkolenia zespołów z AI" owiń komponentem `Link`, zachowując istniejące klasy na wewnętrznym `div`. Wzorzec dla pierwszego z nich:

```tsx
<Link href="/uslugi/automatyzacja-procesow-biznesowych" className="md:col-span-2">
  <div className="h-full bg-[#1a1c1a] p-10 rounded-[2.5rem] flex flex-col justify-between group hover:bg-[#1e201e] transition-colors duration-500">
    {/* ...dotychczasowa zawartość kafelka bez zmian... */}
  </div>
</Link>
```

Adresy pozostałych dwóch: `/uslugi/chatboty-i-asystenci-ai` oraz `/uslugi/szkolenia-z-ai-dla-zespolow`.

Kafelek „Bezpłatna konsultacja wdrożeniowa" zostaw bez zmian — to wezwanie do działania, nie usługa.

- [ ] **Krok 4: Dodaj odnośnik do pełnej listy**

Na końcu sekcji, tuż przed zamykającym `</section>`, dodaj:

```tsx
      <div className="mt-12 text-center">
        <Link
          href="/uslugi"
          className="inline-flex items-center gap-2 text-[#70e5ea] font-headline font-bold hover:gap-3 transition-all"
        >
          Zobacz wszystkie usługi
          <ArrowRight size={18} />
        </Link>
      </div>
```

- [ ] **Krok 5: Zweryfikuj brak fałszywych deklaracji**

```bash
grep -n "oszczędzam klientom\|moim klientom\|typowo oszczędzam" components/marketing/services-section.tsx
```

Oczekiwane: brak wyników.

- [ ] **Krok 6: Sprawdź typy, lint i build**

Uruchom: `npm run type-check && npm run lint && npm run build`
Oczekiwane: build przechodzi, w wykazie tras pojawiają się `/uslugi` i `/uslugi/[slug]`.

- [ ] **Krok 7: Commit**

```bash
git add components/marketing/services-section.tsx
git commit -m "fix(tresc): sekcja uslug bez deklaracji o klientach, z linkami do stron"
```

---

## Zadanie 8: Nawigacja

**Pliki:**
- Modyfikuj: `components/marketing/navbar.tsx:11`

- [ ] **Krok 1: Przekieruj pozycję menu**

Zmień:

```typescript
  { label: 'Rozwiązania', href: '/#uslugi' },
```

na:

```typescript
  { label: 'Usługi', href: '/uslugi' },
```

Powód: „Rozwiązania" nie jest słowem, którego ktokolwiek szuka, a kotwica `/#uslugi` prowadzi do sekcji zamiast do stron, które mają rankować.

- [ ] **Krok 2: Zweryfikuj obie wersje menu**

Plik ma dwa miejsca renderujące linki (desktop w okolicy linii 45, mobile w okolicy linii 120). Oba czytają z tej samej tablicy, więc jedna zmiana wystarcza — potwierdź to, otwierając `http://localhost:3000` i sprawdzając menu w obu szerokościach.

- [ ] **Krok 3: Commit**

```bash
git add components/marketing/navbar.tsx
git commit -m "feat(nawigacja): menu prowadzi do stron uslugowych"
```

---

## Zadanie 9: Baza wiedzy chatbota

**Pliki:**
- Modyfikuj: `scripts/generate-embeddings.mjs:138-143`

Dziś RAG indeksuje z usług tylko `title` i `description`, i to wszystkie razem jako jeden dokument `services`. Po tej zmianie każda usługa jest osobnym źródłem z pełną treścią, więc bot potrafi odpowiedzieć szczegółowo i podać adres strony.

- [ ] **Krok 1: Rozszerz zapytanie**

Zmień `select` z `'title, description'` na `'title, description, slug, subtitle, content'`.

- [ ] **Krok 2: Zamień jeden zbiorczy dokument na osobne**

Zastąp obecny blok budujący dokument `services`:

```javascript
  if (services && services.length > 0) {
    for (const service of services) {
      const tekst = [
        `Usługa: ${service.title}`,
        `Adres strony: /uslugi/${service.slug}`,
        service.subtitle ?? '',
        service.description,
        service.content ?? '',
      ]
        .filter(Boolean)
        .join('\n\n')

      docs.push({
        source: `service:${service.slug}`,
        content: tekst,
      })
    }
  }
```

Klucz `source` w formacie `service:<slug>` jest zgodny ze wzorcem `case-study:<slug>` i `post:<slug>`, więc mechanizm sprzątania osieroconych źródeł usunie stary zbiorczy wpis `services` samoczynnie.

- [ ] **Krok 3: Przebuduj bazę wiedzy**

Uruchom: `npm run db:generate`
Oczekiwane: w logu pojawia się siedem linii `service:<slug>`, a na końcu `Zsynchronizowano N/N źródeł`.

- [ ] **Krok 4: Sprawdź, czy stary wpis zniknął**

```sql
SELECT DISTINCT source FROM documents WHERE source LIKE 'service%' ORDER BY source;
```

Oczekiwane: siedem wierszy `service:<slug>`, **bez** wiersza `services`.

- [ ] **Krok 5: Commit**

```bash
git add scripts/generate-embeddings.mjs
git commit -m "feat(rag): kazda usluga jako osobne zrodlo z pelna trescia"
```

---

## Zadanie 10: Weryfikacja końcowa

- [ ] **Krok 1: Pełne sprawdzenie lokalne**

Uruchom: `npm run type-check && npm run lint && npm run build`
Oczekiwane: wszystko przechodzi, w wykazie tras są `/uslugi` oraz `ƒ /uslugi/[slug]`.

- [ ] **Krok 2: Sprawdź wszystkie siedem stron**

Przy uruchomionym `npm run dev`:

```bash
for s in automatyzacja-procesow-biznesowych chatboty-i-asystenci-ai \
         automatyzacja-dokumentow-i-faktur audyt-i-doradztwo-ai \
         szkolenia-z-ai-dla-zespolow strony-i-oprogramowanie-na-zamowienie \
         zgodnosc-z-ai-act; do
  printf "%-42s %s\n" "$s" "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/uslugi/$s)"
done
```

Oczekiwane: siedem razy `200`.

- [ ] **Krok 3: Sprawdź nieistniejący slug**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/uslugi/nie-ma-takiej
```

Oczekiwane: `404`.

- [ ] **Krok 4: Sprawdź dane strukturalne**

```bash
curl -s http://localhost:3000/uslugi/zgodnosc-z-ai-act | grep -o '"@type":"Service"'
```

Oczekiwane: jedno dopasowanie.

- [ ] **Krok 5: Sprawdź chatbota**

Zadaj botowi pytanie „czym się zajmujecie w zakresie faktur". Oczekiwane: odpowiedź opiera się na treści usługi i nie zawiera deklaracji o zrealizowanych wdrożeniach.

- [ ] **Krok 6: Merge i wdrożenie**

```bash
git checkout main
git merge --no-ff feat/strony-uslugowe
git push origin main
```

Po wdrożeniu sprawdź produkcję:

```bash
curl -s https://www.zautomatyzujemy.pl/sitemap.xml | grep -c "uslugi"
```

Oczekiwane: `8`.

---

## Świadomie poza zakresem

| Rzecz | Dlaczego |
|---|---|
| Panel administracyjny dla usług | `app/admin/content` obsługuje dziś inne treści; edycja przez migracje wystarcza przy siedmiu rzadko zmienianych stronach |
| Zdjęcia i grafiki na stronach usług | Wymagają materiału, którego nie ma; strony działają bez nich, można dołożyć później |
| Przestawienie automatu blogowego | Osobne zadanie Fazy B — ma sens dopiero, gdy istnieją strony, do których artykuły będą linkować |
| Treści lokalne pod Chojnice | Czeka na wizytówkę Google, ta na rejestrację działalności |
| Testy end-to-end tras | Brak runnera; Playwright CLI jest zainstalowany i można to zrobić osobno |
