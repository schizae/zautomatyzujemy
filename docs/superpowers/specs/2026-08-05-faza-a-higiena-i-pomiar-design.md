# Faza A — higiena treści i pomiar. Specyfikacja

**Data:** 2026-08-05
**Status:** zatwierdzona przez właściciela, gotowa do rozpisania planu wdrożenia

---

## Problem

Audyt strony zautomatyzujemy.pl wykazał, że witryna nie jest gotowa na ruch, który miałaby przyciągnąć.

| Obszar | Stan zastany |
|---|---|
| Usługi na stronie głównej | 1 wpis testowy: `chatbot ` / „robimy czatboty na zamowienie" |
| FAQ | 1 wpis testowy: „kto jest CEO" / „CEO Firmy jestem JA " |
| Case studies | 3 fikcyjne wdrożenia prezentowane jako rzeczywiste |
| Pomiar | brak Search Console, brak analityki, brak wizytówki Google |
| Administrator danych | wskazany jako „Zautomatyzujemy.pl" — nazwa domeny, nie podmiot |
| Adres w `LocalBusiness` | pełny adres domowy + współrzędne, publicznie w źródle strony |
| Blog | 13 z 22 artykułów (59%) to przeglądy newsów bez intencji wyszukiwania |
| Strony usługowe | brak |

Dodatkowo treści testowe zostały 2026-08-05 zaindeksowane do bazy wiedzy RAG, więc chatbot może je cytować jako oficjalną wiedzę o firmie.

## Kontekst biznesowy

Właściciel działa jako freelancer, bez zarejestrowanej działalności, z domu w Chojnicach. Udostępnia numer telefonu i miasto, nie ma biura. Nie ma jeszcze klientów — stąd fikcyjne case studies.

## Cel

Doprowadzić stronę do stanu, w którym nie szkodzi wizerunkowi i daje się mierzyć. Dopiero na tym fundamencie budować widoczność.

Kryteria jakości narzucone przez właściciela, obowiązujące dla całej fazy: **zgodność prawna, bezpieczeństwo, nowoczesny wygląd, treść zachęcająca do kontaktu i budująca wrażenie profesjonalizmu.** Teksty pisane językiem korzyści, spójne tonem z resztą strony — nie hasła w punktach.

## Poza zakresem fazy A

Świadomie odłożone do fazy B: strony usługowe pod frazy sprzedażowe, przestawienie automatu blogowego z przeglądów newsów na treści z intencją zakupową, lokalne treści pod Chojnice, kalendarz Cal.com, opinie klientów.

Każda z tych rzeczy to inwestycja tygodni i nie ma sensu jej zaczynać, dopóki strona pokazuje dane testowe, a właściciel nie widzi żadnych liczb.

---

## A1. Wiarygodność treści

### Usługi — 6 kafelków

Siatka to `md:grid-cols-3` (`components/marketing/services-section.tsx:23`), więc sześć wpisów wypełnia dwa rzędy równo. Treści wynikają z oferty opisanej w `BASE_SYSTEM` w `app/api/chat/route.ts`.

1. **Automatyzacja procesów biznesowych** — Łączymy narzędzia, z których już korzystasz: CRM, system księgowy, sklep, arkusze, pocztę. Dane przepływają między nimi bez ręcznego przepisywania. Buduję na n8n i Make, więc rozwiązanie zostaje Twoje i możesz je rozwijać bez uzależnienia ode mnie.

2. **Chatboty i asystenci AI** — Asystent, który zna Twoją ofertę i odpowiada klientom o każdej porze — na stronie, w komunikatorze albo wewnątrz firmy. Zbiera kontakty i przekazuje je do Ciebie wraz z podsumowaniem rozmowy.

3. **Automatyzacja dokumentów i faktur** — Faktury i dokumenty odczytywane automatycznie: numery, kwoty, terminy, kontrahenci. Trafiają tam, gdzie mają trafić, bez przepisywania z PDF-a do arkusza.

4. **Audyt i doradztwo AI** — Zanim cokolwiek wdrożymy: przegląd Twoich procesów i uczciwa odpowiedź, co realnie warto zautomatyzować, a co lepiej zostawić człowiekowi. Plan dostajesz niezależnie od tego, czy zdecydujesz się na współpracę.

5. **Szkolenia z AI dla zespołów** — Praktyczne warsztaty pod konkretne stanowiska. Nie ogólniki o rewolucji AI, tylko narzędzia i sposoby pracy, które Twoi ludzie wykorzystają następnego dnia.

6. **Strony i oprogramowanie na zamówienie** — Szybkie, dostępne strony i aplikacje szyte pod proces, którego nie obsłuży żadne gotowe narzędzie.

### FAQ — 6 pytań

Sekcja znika całkowicie przy pustej bazie (`components/marketing/faq-section.tsx:21`).

**Wiążące ograniczenie:** FAQ trafia do bazy wiedzy RAG, więc chatbot będzie stąd cytował. Odpowiedzi muszą być zgodne z jego granicami decyzyjnymi — żadnych kwot, terminów ani zobowiązań. Sprzeczność między FAQ a promptem oznacza bota, który sam sobie przeczy.

1. **Ile kosztuje wdrożenie automatyzacji?** — Każda wycena jest indywidualna, bo zależy od liczby procesów, systemów do połączenia i skali działania. Dlatego zaczynamy od bezpłatnej konsultacji: po niej wiesz, co da się zrobić i ile to kosztuje, bez żadnych zobowiązań.

2. **Jak długo trwa wdrożenie?** — Zależy od zakresu. Pojedynczą automatyzację uruchamiamy szybciej niż integrację kilku systemów naraz. Konkretny termin ustalam po konsultacji, gdy znam już Twoje procesy — nie obiecuję dat w ciemno.

3. **Czy muszę znać się na technologii?** — Nie. Moją rolą jest przełożyć Twój proces na działające rozwiązanie i przekazać je w formie, którą obsłużysz bez wiedzy technicznej. Po wdrożeniu dostajesz instrukcję i wsparcie.

4. **Co z bezpieczeństwem moich danych?** — Pracuję na Twoich kontach i Twojej infrastrukturze, z dostępami ograniczonymi do niezbędnego minimum. Zakres przetwarzania danych ustalamy pisemnie przed startem, zgodnie z RODO.

5. **Co, jeśli automatyzacja przestanie działać?** — Automatyzacje mają monitoring i powiadomienia o błędach, więc o problemie dowiadujesz się, zanim zauważy go klient. Zasady wsparcia po wdrożeniu ustalamy na starcie, żebyś nie został sam z awarią.

6. **Od czego zacząć, gdy nie wiem, co automatyzować?** — Od rozmowy. Zwykle wystarczy opowiedzieć, na co schodzi najwięcej czasu w tygodniu — wąskie gardła widać po kilkunastu minutach. Bezpłatna konsultacja właśnie temu służy.

### Case studies — jawnie oznaczone przykłady

Właściciel potwierdził, że to wymyślone przykłady poglądowe. Zostają jako ilustracja możliwości, ale bez udawania zrealizowanych wdrożeń.

**Nowe tytuły** — opisują rozwiązanie zamiast obiecywać wynik. Wzorowane na zestawie zaszytym dziś w `components/marketing/case-study-section.tsx:7-43`, który był sformułowany uczciwiej niż wersja z bazy:

Slugi zostają bez zmian — są w sitemapie, w linkach i jako klucze `source` w bazie wiedzy RAG. Nowe tytuły dobrane tak, żeby pasowały do istniejących slugów:

| Slug (bez zmian) | Nowy tytuł |
|---|---|
| `oszczednosc-czasu-fintech` | Biuro rachunkowe: automatyzacja księgowania faktur z maili |
| `zadowolenie-klientow-saas` | Platforma SaaS: asystent AI dla wsparcia technicznego |
| `wzrost-sprzedazy-ecommerce` | Sklep internetowy: chatbot odpowiadający na większość zapytań klientów |

Z opisów znikają zmyślone liczby („30%", „40h/tydz", „95%", „80%"), bo są niesprawdzalne i wprost wprowadzają w błąd.

**Oznaczenie w trzech miejscach:**
- widoczna etykieta „Przykład możliwej automatyzacji" na kaflu i na stronie szczegółowej
- zdanie w nagłówku sekcji wyjaśniające, że to scenariusze poglądowe, a nie zrealizowane wdrożenia
- oznaczenie w treści strony szczegółowej, nie tylko wizualnie — strony emitują `Article` JSON-LD, więc Google też nie może być wprowadzony w błąd

**Nowa kolumna `case_studies.is_example`** (boolean, domyślnie `true` dla obecnych trzech). Uzasadnienie mimo zasady YAGNI: gdy pojawi się pierwszy prawdziwy klient, rozróżnienie musi istnieć w danych. Zaszycie etykiety w kodzie oznaczałoby, że przy pierwszej realnej referencji trzeba zmieniać komponent i ryzykować, że prawdziwe wdrożenie zostanie oznaczone jako fikcja.

**Usunięcie duplikatu z kodu** — zestaw `fallbackCases` znika. Dwa źródła tej samej treści gwarantują, że za pół roku poprawi się jedno i przeoczy drugie.

### Sposób wprowadzenia treści

Migracja SQL `009_seed_content.sql`, nie ręczne klikanie w panelu admina. Powód: treść jest wtedy wersjonowana w gicie i odtwarzalna, a panel zostaje do późniejszych edycji.

Migracja czyści tabele `services` i `faq_items` z danych testowych, wstawia komplet nowych wpisów, aktualizuje trzy wiersze `case_studies` po slugu i dodaje kolumnę `is_example`.

### Przeindeksowanie bazy wiedzy

Po zmianach treści uruchamiane jest `pnpm db:generate`. Skrypt sprząta osierocone źródła, więc stare wpisy testowe znikają z pamięci chatbota automatycznie.

**Zmiana w skrypcie:** tekst budowany dla case studies w `scripts/generate-embeddings.mjs` musi zawierać informację, że to przykład poglądowy. Bez tego chatbot będzie opowiadał o nich jako o zrealizowanych wdrożeniach — czyli ten sam problem, który naprawiamy na stronie, wróci przez czat.

---

## A2. Tożsamość prawna i dane osobowe

### Administrator danych

`app/privacy-policy/page.tsx:35` wskazuje „Zautomatyzujemy.pl", czyli nazwę domeny. RODO art. 13 wymaga tożsamości administratora i danych kontaktowych. Przy działalności nierejestrowanej administratorem jest osoba fizyczna.

Do uzupełnienia: imię i nazwisko, adres e-mail do kontaktu w sprawach danych, miasto. Dane pobierane od właściciela na etapie wdrożenia.

### Adres w danych strukturalnych

`app/page.tsx:109-120` publikuje pełny adres domowy z ulicą i numerem mieszkania oraz współrzędne geograficzne. Właściciel nie ma biura i planuje wizytówkę w trybie firmy usługowej, gdzie adres jest ukryty.

**Decyzja:** zostają `addressLocality: Chojnice`, `postalCode`, `addressCountry` i `telephone`. Znikają `streetAddress` i blok `geo`. Spójne z wizytówką i nie eksponuje adresu domowego.

### Język o firmie

Strona konsekwentnie mówi „agencja" i „właściciel firmy", co przy działalności nierejestrowanej jest na wyrost. Do przeformułowania tak, żeby brzmiało profesjonalnie i pozostało prawdziwe — bez umniejszania i bez przesady.

Miejsca do przejrzenia, ustalone przez wyszukanie wzorców `agencj`, `właściciel firmy`, `naszej firmy`:

| Plik | Kontekst |
|---|---|
| `app/api/chat/route.ts` | `BASE_SYSTEM` — bot przedstawia firmę klientom |
| `app/page.tsx` | opis w `LocalBusiness` JSON-LD |
| `components/marketing/about-section.tsx` | sekcja „O nas" |
| `components/marketing/case-study-section.tsx` | nagłówek sekcji |
| `app/manifest.ts` | opis aplikacji |
| `knowledge/o-firmie.md` | źródło bazy wiedzy RAG |
| `lib/actions/chat.actions.ts` | prompt oceny leada |

Pominięte świadomie: `lib/actions/admin.actions.ts` (komunikaty panelu, niewidoczne publicznie), `n8n-blog-workflow.json` (nieużywana pozostałość po n8n), dokumenty w `docs/`.

Zmiana w `knowledge/o-firmie.md` wymaga ponownego uruchomienia `pnpm db:generate`, bo plik jest źródłem bazy wiedzy.

---

## A3. Pomiar

### Google Search Console — bezwarunkowo

Weryfikacja rekordem DNS albo meta tagiem w `app/layout.tsx`. Nie używa ciasteczek, nie dotyka odwiedzających, nie wymaga zgód. Jedyne źródło informacji o tym, czy Google indeksuje stronę i na jakie frazy się wyświetla.

Zgłoszenie sitemapy `https://zautomatyzujemy.pl/sitemap.xml` po weryfikacji.

### Analityka — Vercel Web Analytics

**Decyzja właściciela: Vercel Web Analytics, nie Google Analytics 4.**

Uzasadnienie: GA4 zapisuje ciasteczka śledzące. Zgodne z prawem użycie wymagałoby przebudowy banera zgód na wariant z realnym przyciskiem odmowy i kategoriami, zablokowania skryptu do czasu zgody oraz przepisania polityki prywatności, która dziś stwierdza wprost, że cookies śledzące nie są stosowane (`app/privacy-policy/page.tsx:159`). Obecny baner (`components/marketing/cookie-banner.tsx`) ma wyłącznie przycisk akceptacji i niczego nie warunkuje.

Vercel Web Analytics jest bezcookiesowe. Nie wymaga zgody ani zmiany banera i nie zaprzecza polityce prywatności. Wymaga jedynie dopisania do niej informacji o anonimowej statystyce odwiedzin. Projekt jest już hostowany na Vercelu, więc to jedna zależność i jeden komponent w `app/layout.tsx`.

Świadomie akceptowany kompromis: brak śledzenia ścieżek między sesjami, brak integracji z Google Ads, uboższe raporty. Przy obecnym ruchu bez znaczenia. GA4 można dołożyć w przyszłości, gdy skala uzasadni koszt banera zgód.

### Wizytówka Google — tryb firmy usługowej

Działanie właściciela w panelu Google, nie zmiana w kodzie. Adres podawany wyłącznie do weryfikacji, publicznie widoczny obszar działania zamiast pinezki. Dane NAP (nazwa, adres, telefon) muszą być identyczne z tymi w `LocalBusiness` JSON-LD — rozbieżność osłabia efekt lokalny.

---

## A4. Szybkie poprawki SEO

**Sitemapa** — `app/sitemap.ts` pomija `/ai-act-checklist`, realną stronę z treścią i lead magnetem. Do dopisania z priorytetem `0.7`.

**Schemat FAQPage** — do dodania na stronie głównej po wypełnieniu FAQ realnymi pytaniami. Daje szansę na rozszerzony wynik w Google. Bez treści nie ma sensu, więc kolejność po A1.

Reszta struktury danych jest poprawna i nie wymaga zmian: `Organization`, `WebSite`, `LocalBusiness`, `BlogPosting`, `Article`, `BreadcrumbList`, `robots.ts`.

---

## Kolejność wykonania

1. **A1** — migracja treści, oznaczenie case studies, usunięcie duplikatu z kodu, zmiana skryptu embeddingów, przeindeksowanie
2. **A2** — administrator danych, adres w JSON-LD, język o firmie
3. **A4** — sitemapa, schemat FAQPage (po A1, bo wymaga treści)
4. **A3** — Search Console, Vercel Web Analytics, wizytówka

A3 na końcu, bo pomiar ma sens dopiero wtedy, gdy mierzy stronę w docelowym stanie.

## Zależności po stronie właściciela

| Co | Blokuje |
|---|---|
| Zatwierdzenie lub korekta treści usług i FAQ | A1 |
| Imię, nazwisko i e-mail kontaktowy do polityki prywatności | A2 |
| Weryfikacja Search Console (dostęp do DNS lub wklejenie meta tagu) | A3 |
| Założenie wizytówki Google | A3 |

## Kryteria sukcesu

- Żadna sekcja strony nie pokazuje danych testowych
- Case studies są jednoznacznie oznaczone jako przykłady — w treści, wizualnie i w danych
- Chatbot pytany o case studies mówi o nich jako o przykładach, nie o zrealizowanych wdrożeniach
- Polityka prywatności wskazuje administratora zgodnie z RODO art. 13
- Adres domowy nie występuje w źródle strony
- Search Console pokazuje status indeksacji
- Vercel Web Analytics zlicza wizyty, baner zgód pozostaje niezmieniony
- `pnpm type-check`, `pnpm lint` i `pnpm build` przechodzą
