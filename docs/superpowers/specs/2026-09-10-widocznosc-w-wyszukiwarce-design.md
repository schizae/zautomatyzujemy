# Plan widoczności zautomatyzujemy.pl — wersja finalna

Trzy iteracje recenzji: 5/10 → 7/10 → 8/10, plus poprawki po ostatniej recenzji.

Kontekst: Norbert, freelancer bez zarejestrowanej działalności, AI i automatyzacja procesów.
Baza: Chojnice (powiat chojnicki, pomorskie), praca zdalna w całej Polsce.
Stack: Next.js App Router + Supabase + Vercel, blog z GitHub Actions + Gemini.
Cel: nie ruch, tylko zapytania ofertowe od firm.

---

## DECYZJA ROZSTRZYGNIĘTA — bez wizytówki Google

Właściciel nie zakłada teraz działalności, więc idziemy ścieżką bez wizytówki Google.
Dochodzi do tego korekta z recenzji Codeksa, którą przyjmuję: **sama rejestracja i tak by nie wystarczyła.**
Wytyczne Google wymagają rzeczywistego kontaktu z klientem osobiście, a działalność prowadzona
wyłącznie zdalnie nie kwalifikuje się do wizytówki. Rejestracja jest więc warunkiem koniecznym,
ale nie wystarczającym, i przestaje być rozwidleniem planu.

Konsekwencja: poziom lokalny opiera się wyłącznie na wynikach organicznych.
Jedna strona `/automatyzacja-ai-chojnice`, widoczna wzmianka o obszarze działania na stronach
usługowych i w kontakcie, cytowania w katalogach społeczności n8n i Make, LinkedIn,
publiczne repozytorium z workflow. Pakietu map nie będzie i nie planujemy pod niego pracy.

---

## CZĘŚĆ A — AUDYT

Zweryfikowany w kodzie, w bazie produkcyjnej i na żywej witrynie 2026-09-10.

### A.1 Co działa (nie ruszamy)

`metadataBase` i szablon tytułów, OG i Twitter cards, dynamiczny `opengraph-image`,
`app/robots.ts`, dynamiczny `app/sitemap.ts`, weryfikacja Search Console (`app/layout.tsx:100`),
canonical na artykułach, JSON-LD: Organization, WebSite, LocalBusiness, FAQPage, BlogPosting,
**BreadcrumbList już istnieje** (`app/blog/[slug]/page.tsx:123`, `app/case-studies/[slug]/page.tsx:100`),
oznaczenie treści AI zgodne z AI Act, przełącznik `blog_publish_mode` z trybami `review` i `auto`,
`@vercel/analytics` osadzone (`app/layout.tsx:133`).

### A.2 Wąskie gardła wg wpływu

**B1. Brak stron pod intencje zakupowe, przy gotowej pracy leżącej na półce.**
`/uslugi` zwraca 404 na produkcji. Gałąź `feat/strony-uslugowe` (11 commitów, **52 commity za `main`,
istnieje wyłącznie lokalnie, nie ma jej na `origin`**) zawiera `app/uslugi/page.tsx`,
`app/uslugi/[slug]/page.tsx` ze schematem `Service`, wpis do sitemapy, pozycję w menu, integrację
z bazą wiedzy chatbota oraz migracje `010` i `011`. **Migracja 011 wypełnia treścią wszystkie siedem
usług**, nie trzy. Produkcyjna tabela `services` ma 6 wierszy i nie ma kolumny `slug`, czyli migracje
nie zostały zastosowane. To praca odłożona, nie brakująca.

**B2. Zerowe sygnały lokalne w treści.** Schema `LocalBusiness` zawiera Chojnice i telefon
(`app/page.tsx:110`), ale żaden widoczny tekst nie zawiera słowa „Chojnice" ani „pomorskie".
`areaServed` ustawione na `Country: Polska`. Brak `/kontakt` jako osobnego adresu.

**B3. 18 z 30 wpisów bloga to treść bez popytu.** Wpisy `nowosci-ai-YYYY-MM-DD` to przeglądy newsów.
Nikt nie wyszukuje „nowości AI 2026-08-24". Problemem jest cienkość, powtarzalność i rozmycie
tematyki witryny, a nie budżet indeksowania — przy 39 adresach budżet indeksowania nie jest problemem.
Pozostałe 12 artykułów to generyczne „AI dla MŚP", żaden bez frazy docelowej.

**B4. Ryzyko polityki o skalowanym nadużyciu treści.** Dwa artykuły tygodniowo, w całości generowane,
publikowane bez przeglądu. Bramka jakości tego nie usuwa, bo polityka dotyczy skali i celu produkcji.
Jedyna realna odpowiedź to udział człowieka w każdym tekście — rozstrzygnięty w punkcie 2.4.

**B5. Brak linkowania wewnętrznego do konwersji.** Artykuły nie linkują do stron usługowych,
bo takich stron nie ma. Brak widocznych okruszków w interfejsie, choć schemat jest.

**B6. Brak dowodu i autorytetu.** `author` = „Zautomatyzujemy", brak strony o osobie,
`Organization.sameAs` puste (`app/page.tsx:96`). Case studies są uczciwie oznaczone jako scenariusze
poglądowe (`app/case-studies/page.tsx:48`) — realizacji do pokazania nie ma. Przy usługach B2B
za kilka tysięcy złotych brak dowodu hamuje konwersję mocniej niż brak strony usługowej.

**B7. Brak powiązania leada ze źródłem.** Produkcyjna tabela `leads` ma `id, email, name,
conversation_summary, source, n8n_sent, created_at, conversation_log, phone, preferred_contact_time,
lead_score, lead_score_reason`. Ani strony wejścia, ani referrera. Vercel Analytics pokazuje
źródła ruchu zbiorczo, więc wiemy, ile wejść przyszło z wyszukiwarki, ale nie wiemy,
z której strony przyszedł konkretny lead. To wystarczy, żeby zadanie miało sens, i nie więcej.

**B8. Rozjazd domeny.** Cztery pliki (`app/layout.tsx:31`, `app/sitemap.ts:6`, `app/robots.ts:5`,
`app/blog/[slug]/page.tsx:16`) mają fallback `https://zautomatyzujemy.pl`, a produkcja odpowiada
z www. Dodatkowo **non-www zwraca 307, czyli przekierowanie tymczasowe** — kanoniczny host
powinien być podpięty przekierowaniem trwałym w konfiguracji domeny na Vercelu.

**B9. Wydajność bez progu.** 20 z 28 komponentów marketingowych to Client Components,
strona główna ma ciężkie animacje. Nowe strony odziedziczą ten stos bez ustalonego progu.

### A.3 Ocena

Ocena jakościowa, bez punktacji. Wcześniejsze „62/100" wyglądało na pomiar, a było wrażeniem
z przypisaną liczbą — recenzja Codeksa słusznie się do tego przyczepiła.
Warstwa techniczna jest mocna. Architektura treści pod popyt praktycznie nie istnieje.
Sygnały lokalne są tylko w danych strukturalnych, więc dla czytelnika ich nie ma.
Autorytet i dowód kompetencji są na starcie.

---

## CZĘŚĆ B — STRATEGIA, HORYZONT, WIDOCZNOŚĆ W ODPOWIEDZIACH AI

Trzy poziomy: lokalny, regionalny, ogólnopolski. Kolejność rozstrzyga Faza 0, nie założenie.

**Powiedziane wprost: przy zerowym autorytecie domeny, braku realizacji i braku GBP
pierwsze zapytania ofertowe z wyszukiwarki to horyzont 6–12 miesięcy, nie 90 dni.**
SEO nie jest tu najszybszym kanałem i nie powinno być jedynym.

**Kanał pomostowy na ten czas:** regularna aktywność na LinkedIn z konkretnymi przepływami n8n,
obecność w społecznościach n8n i Make, publiczne repozytorium z workflow, bezpośredni kontakt
z lokalnymi firmami. To buduje też cytowania i linki, których SEO potrzebuje.

**Widoczność w odpowiedziach AI jest celem równorzędnym, nie dodatkiem.** Znaczna część zapytań
„jak zautomatyzować X" kończy się w AI Overviews i w asystentach, bez kliknięcia w wynik.
Praca jest ta sama, ale musi być nazwana, żeby nie wypadła przy cięciu zakresu:
odpowiedź na pytanie w pierwszych dwóch zdaniach, jasna struktura pytanie–odpowiedź, encje
i `sameAs`, wzmianki na cudzych stronach. Kontrolę robimy skillem `searchfit-seo:ai-visibility`
raz na kwartał.

---

## CZĘŚĆ C — PLAN WDROŻENIA

### FAZA 0 — Dane i atrybucja (3–4 dni)

**0.1 Atrybucja leadów — pierwsze zadanie, z opisanym mechanizmem.**
Migracja `015_lead_attribution.sql`: `landing_path TEXT`, `referrer TEXT`, `utm_source TEXT`.
Mechanizm, bo sam Server Action tego nie zobaczy (`headers()` zwróci referrera własnego POST-a):
- mały komponent kliencki zapisuje przy pierwszym wejściu `document.referrer`, `location.pathname`
  i parametry `utm_*` do `sessionStorage` (first touch, nie nadpisujemy przy kolejnych podstronach)
- formularz kontaktowy i lead magnet (`lib/actions/contact.actions.ts`) dostają ukryte pola
  wypełniane z `sessionStorage` przed wysłaniem
- lead z chatbota: leada zapisuje Server Action `saveChatLeadAction`
  (`lib/actions/chat.actions.ts:178`) wołana z komponentu klienckiego, więc atrybucja wchodzi
  jako dodatkowy argument tej akcji. Nie przez transport czatu — ten obsługuje wiadomości, nie leada
Walidacja Zodem jak reszta payloadów, wartości opcjonalne, brak danych nie blokuje wysyłki.

Dwie korekty po recenzji Codeksa, obie słuszne:
- **Strona wejścia to nie źródło.** Wejście na artykuł może przyjść z LinkedIna, z wiadomości
  albo z zakładki. Dlatego zapisujemy osobno źródło (z referrera i `utm_source`) i osobno stronę wejścia,
  a leady bez referrera trafiają do kategorii „źródło nieznane". Łańcuch, który nas interesuje,
  to źródło, potem strona wejścia, potem kwalifikowane zapytanie.
- **`sessionStorage` mierzy sesję karty, nie pierwszą wizytę w historii klienta.** To akceptowalne
  minimum przy tej skali, ale zapisane wprost jako ograniczenie, żeby nikt później nie czytał
  tych danych jako pełnej ścieżki klienta.
Miernikiem nie jest „wszystkie leady mają stronę wejścia", bo dopuszczamy brak danych.
Mierzymy odsetek uzupełnienia i to, czy formularze działają również bez atrybucji.

**0.2 Dane z Search Console — eksport CSV, bez integracji.**
Zapytania z 16 miesięcy pobierane z interfejsu GSC do `data/seo/gsc-queries.csv`.
Konto usługi w Google Cloud i skrypt `fetch-gsc.mjs` odpadają: skoro pomiar w Fazie 3 to arkusz
z tego samego interfejsu, integracja z API byłaby niespójna z własną decyzją planu.

**0.3 Frazy z trzech darmowych źródeł.**
- Google Suggest przez `suggestqueries.google.com` — daje frazy, nie wolumen
- **Bing Webmaster Tools** — realny wolumen bez konta reklamowego
- **Google Keyword Planner** — widełki przy koncie Ads bez wydatków
Frazy nasienne: około 20 pozycji wokół siedmiu usług z bazy plus warianty „+ Chojnice",
„+ pomorskie", „+ cena", „+ ile kosztuje". Warianty pod miasta bez stron docelowych odpadają.

**0.4 Analiza konkurencji.** Dla każdego klastra: kto zajmuje Top 3, jaki typ strony, jaka objętość,
czy jednoosobowa witryna bez linków ma tam czego szukać. Wynik trafia jako kolumna „realne / nierealne"
do mapy fraz z 0.5, nie do osobnego dokumentu, do którego nikt nie wróci.

**0.5 Klasteryzacja.** Skill `searchfit-seo:keyword-clustering`. Wynik `docs/seo/keyword-map.md`:
klaster, fraza główna, frazy wspierające, intencja, strona docelowa. **Zwykły plik, nie tabela w bazie** —
sześć klastrów i jeden artykuł tygodniowo to około pięćdziesięciu fraz na rok.

**0.6 Kalibracja progu podobieństwa.** Liczymy macierz podobieństw tytułów i konspektów
30 istniejących artykułów modelem `gemini-embedding-001` (`scripts/generate-embeddings.mjs:29`),
oglądamy rozkład i dopiero z niego wybieramy próg odrzucenia. Pół godziny pracy,
bez tego bramka z Fazy 2 przepuszcza wszystko albo nic.

**0.7 Pomiar wyjściowy.** PageSpeed Insights dla `/`, `/blog` i artykułu, liczba zaindeksowanych stron,
średnia pozycja z GSC. Zapis do `docs/seo/baseline.md`.
**Próg wydajności: nowa strona nie wchodzi na produkcję z LCP powyżej 2,5 s na mobile w PSI.**
Z zastrzeżeniem, które dokładam po recenzji: pojedynczy wynik laboratoryjny z PSI to nie to samo,
co dane od realnych użytkowników w 75. percentylu. Próg laboratoryjny jest bramką przed wdrożeniem,
a pomiar terenowy sprawdzamy osobno w Search Console, gdy uzbiera się ruch.

**Kryterium wyjścia:** dla każdego z co najmniej 6 klastrów szacunek wolumenu z Bing WMT
lub Keyword Plannera i trzech konkurentów z SERP-a. Zerowy wolumen klastra lokalnego redukuje
ścieżkę lokalną do jednej strony i przenosi priorytet na frazy usługowe i cenowe.

### FAZA 1 — Strony docelowe (nakład: minimum 8–10 dni, rozszerzony 14, plus 2–3 dni na rebase)

**1.1 Odblokowanie `feat/strony-uslugowe` — wyceniane osobno, 2–3 dni.**
**Kroki 1 i 2 wykonujemy w dniu zerowym, równolegle z 0.3–0.5.** Rebase jest najdłuższym
i najbardziej ryzykownym elementem planu, a jego trudność rośnie z każdym dniem, w którym `main`
się rusza. Mapa fraz nie jest do niego potrzebna.
1. `git push -u origin feat/strony-uslugowe` — zabezpieczenie gałęzi, która istnieje tylko lokalnie
2. rebase na `main`. Gałąź jest **52 commity za `main`**, po drodze cały redesign premium.
   Kolizji spodziewamy się w `app/sitemap.ts`, `components/marketing/services-section.tsx`,
   `components/marketing/navbar.tsx`, `scripts/generate-embeddings.mjs`, `eslint.config.mjs`
3. **przenumerowanie migracji**: `010` → `013`, `011` → `014`, bo `012_ai_transparency` jest już
   zastosowane na produkcji. Atrybucja z 0.1 to `015`, pola blogowe z 2.1 to `016`.
   Migracja `013` kończy się `ALTER COLUMN slug SET NOT NULL`, a wypełnia slugi po `sort_order` —
   sprawdzone, produkcyjne `sort_order` to dokładnie 1–6, więc żaden wiersz nie zostanie bez sluga
4. przeniesienie widoków na obecny design: tokeny `marketing-theme`, `#f5f2ed` / `#151719`,
   akcent `#f34c30`, Space Grotesk / Manrope / Inter, wyłącznie klasy Tailwind i komponenty shadcn

**1.2 Siedem stron usługowych od razu, nie trzy.**
Poprzednia wersja planu zakładała „trzy najmocniejsze strony", co nie da się pogodzić z gałęzią:
`app/uslugi/[slug]/page.tsx` renderuje każdą usługę z `is_active = true`, a migracja `014` (dawna 011)
wypełnia treścią wszystkie siedem. Ograniczanie do trzech wymagałoby dezaktywacji czterech usług,
a te same wiersze zasilają sekcję usług na stronie głównej i bazę wiedzy chatbota.
Dlatego: **publikujemy wszystkie siedem z gotową treścią, a przepisujemy pod frazy docelowe
trzy najmocniejsze wg mapy z Fazy 0.** Pozostałe cztery wchodzą w takiej postaci, w jakiej są —
treść z migracji jest napisana w pierwszej osobie, bez zmyślonych wdrożeń i bez cen, ale nie jest
pisana pod żadną frazę i nie ma FAQ. To świadoma decyzja, nie przeoczenie; przepisujemy je
w zakresie rozszerzonym. Korekta slugów tylko tam, gdzie mapa fraz wskaże inne brzmienie.

**1.2b Panel administracyjny nie umie dziś edytować treści usług.**
`ServiceSchema` w `lib/actions/admin.actions.ts` obejmuje wyłącznie `title`, `description`, `icon`,
`sort_order` i `is_active` — ani `content`, ani `slug`, ani pól SEO z migracji `013`.
Przepisanie trzech tekstów pod frazy wymaga więc rozszerzenia schematu i formularza
`services-editor.tsx`, albo jednorazowej edycji przez SQL. Wybór: rozszerzamy panel,
bo treść usług będzie zmieniana wielokrotnie. Koszt: około pół dnia, wliczony w Fazę 1.

**1.3 Strona z widełkami cenowymi — `/cennik`.**
„Ile kosztuje chatbot dla firmy", „ile kosztuje automatyzacja procesów" to frazy o najwyższej
intencji zakupowej i jedyne, które jednoosobowa witryna bez linków realnie wygra, bo agencje
unikają podawania widełek. Bez tej strony frazy „+ cena" zbierane w 0.3 nie mają gdzie wylądować.
Treść: rzędy kosztów dla trzech typów wdrożeń, co wpływa na cenę, co dostaje klient, FAQ.

**1.4 Warstwa konwersji na każdej stronie usługowej.**
Przy ruchu liczonym przez pół roku w dziesiątkach wejść współczynnik konwersji waży więcej
niż osiem fraz w Top 10. Na każdej stronie usługowej: formularz na miejscu zamiast linku do kotwicy
na stronie głównej, deklaracja czasu odpowiedzi, lista tego, co warto przysłać w zapytaniu,
oferta bezpłatnej trzydziestominutowej konsultacji, widełki lub link do `/cennik`.

**1.5 `/kontakt` jako osobny adres** z pełnym NAP: imię i nazwisko, telefon, e-mail, obszar działania.
**`/o-mnie`** ze schematem `Person` powiązanym z `Organization`.

**1.6 Strona lokalna** `/automatyzacja-ai-chojnice` z realnie odrębną treścią: obsługiwane miejscowości,
lokalny kontekst, praca zdalna. Druga strona `/automatyzacja-ai-pomorskie` tylko przy potwierdzonym
popycie. Nie generujemy klonów pod dziesiątki miast.

**1.7 Schematy i zaufanie.**
- `LocalBusiness` → `ProfessionalService`, `areaServed` zostaje `Country: PL` i dostaje dodatkowo
  `AdministrativeArea` dla pomorskiego. `GeoCircle` wokół Chojnic z v2 odpada: zawężałby deklarację
  firmy, która pracuje zdalnie w całej Polsce, a o pakiet map i tak decyduje GBP, którego nie będzie.
  Lokalność budujemy widocznym tekstem — dziś jedyne wystąpienie słowa „Chojnice" w całym kodzie
  jest w JSON-LD (`app/page.tsx:124`), czyli w miejscu, którego czytelnik nie widzi
- `Organization.sameAs` uzupełnione o LinkedIn i GitHub
- `Person` jako `author` **tylko tam, gdzie odpowiada to prawdzie**. Hurtowy `UPDATE` na 30 starych
  artykułach z v3 wypada: Codex słusznie zauważa, że podpisywanie się pod tekstem, którego się
  nie przeczytało, to fałszywa deklaracja autorstwa, a przy oznaczeniu treści jako wygenerowanej
  byłaby też niespójna z rejestrem AI Act. Osobą podpisujemy artykuły od momentu wprowadzenia
  przeglądu redakcyjnego oraz te stare, które faktycznie przejrzymy w punkcie 2.8b
- strony usługowe **nie linkują do scenariuszy poglądowych jako do referencji**

**1.8 Naprawa domeny.** Fallback `https://www.zautomatyzujemy.pl` w czterech plikach
oraz **zmiana przekierowania non-www z tymczasowego (307) na trwałe (308)** w konfiguracji domeny na Vercelu.

**1.9 Dowód — zadanie właściciela, z wariantem zapasowym.**
Trzy realne realizacje z prawem do opisu i podania nazwy, choćby za obniżoną stawkę w zamian
za referencję. **Jeśli w ciągu kwartału się nie uda**: publiczne repozytorium z działającym
workflow n8n plus opis własnego wdrożenia na tej witrynie (automat blogowy, chatbot RAG, rejestr AI)
jako dowód kompetencji zamiast wdrożenia u klienta. Ten wariant jest gorszy, ale nie jest pusty.

**1.10 Linki zewnętrzne.** Profil w społeczności n8n i Make, publiczne repozytorium z workflow,
LinkedIn z realną aktywnością, katalogi lokalnych usług, jeden wpis gościnny w polskim medium o MŚP.

**1.11 Baza wiedzy chatbota po edycji usług.** Treść usług żyje w bazie i jest edytowana w `/admin`,
a chatbot czyta ją przez embeddingi. `kb-refresh.yml` chodzi raz w tygodniu i ma `workflow_dispatch`,
więc po każdej edycji treści usługi uruchamiamy go ręcznie. Inaczej chatbot cytuje nieaktualną ofertę.

**Kryterium wyjścia:** nowe adresy w sitemapie, każdy z unikalnym tytułem, opisem i H1,
zgłoszone do indeksacji, żaden powyżej progu LCP.

### FAZA 2 — Silnik treści (3–4 dni)

**2.1 Migracja `016_blog_seo.sql` — dwie kolumny.**
`target_keyword TEXT` i `noindex BOOLEAN DEFAULT false`.
`meta_description` odpada, bo plan sam stwierdza, że meta opis nie jest czynnikiem rankingowym
i wyrzuca go z bramki. `pillar_slug` odpada, bo mapa „klaster → strona usługowa" mieści się
w `docs/seo/editorial-standard.md`. `keyword_queue` odpada — kolejność tematów to lista w pliku.

**2.2 Temat z listy, nie z wyobraźni.** Generator czyta `docs/seo/keyword-map.md`, bierze pierwszą
frazę bez przypisanego artykułu i zapisuje ją w `target_keyword`. Bez tabeli ze statusami
i bez skryptu liczącego priorytet.

**2.3 Standard pisarski w repo** — `docs/seo/editorial-standard.md`, czytany przez generator.
Gotowego skilla do copywritingu SEO nie ma sensu instalować, budujemy własny standard:
- jedna fraza główna w tytule, H1, adresie i pierwszym akapicie, bez upychania
- pierwszy akapit odpowiada na pytanie z frazy w dwóch zdaniach, przed jakimkolwiek wstępem
  (to samo służy widoczności w odpowiedziach AI)
- czarna lista zwrotów: „w dzisiejszym dynamicznym świecie", „rewolucja", „game changer",
  „nie od dziś wiadomo", „w erze cyfrowej" i dalsze
- konkret zamiast ogólnika: nazwy narzędzi, kroki, czasy, rzędy kosztów
- zdania krótkie, strona czynna, druga osoba liczby pojedynczej
- sekcja FAQ z 3–5 pytań z realnych zapytań. **Bez obiecywania sobie czegokolwiek w zamian:**
  Google wycofało wyniki rozszerzone FAQ 7 maja 2026, a cytowanie przez modele nie jest niczyją
  gwarancją. FAQ robimy dla czytelnika, bo odpowiada na pytania, które ludzie realnie zadają.
  Schema `FAQPage` dokładamy, bo nic nie kosztuje, ale nie liczymy na nią
- minimum dwa linki do stron usługowych i jeden do innego artykułu, z opisowym anchorem

**2.4 Przegląd redakcyjny — potwierdzone 30 minut tygodniowo.**
Generator nie napisze własnego doświadczenia, a wymyślone byłoby gorsze niż jego brak. Dlatego
**każdy tekst czyta Norbert przed publikacją**: sprawdza prawdziwość twierdzeń i przydatność całości,
poprawia, co trzeba, i dopisuje jeden akapit z własnym doświadczeniem, zrzutem przepływu albo własną liczbą.
Czas potwierdzony przez właściciela: około 30 minut tygodniowo.

Korekta po recenzji Codeksa, którą przyjmuję: **własny akapit nie jest przepustką.**
Google ocenia cel produkcji i wartość treści niezależnie od tego, czy powstała ręcznie, czy z modelem,
a dwa teksty tygodniowo same w sobie nie są jeszcze skalowanym nadużyciem. Przegląd człowieka jest
warunkiem koniecznym jakości, nie formalnym zabezpieczeniem, i tak go opisujemy.

**2.5 Bramka jakości — trzy bramki techniczne, wynik binarny.**
`scripts/seo/quality-gate.mjs` zwraca „przechodzi" albo listę braków. Bramka sprawdza rzeczy
sprawdzalne maszynowo. Prawdziwość, użyteczność i odrębność tematu ocenia człowiek w 2.4:
1. **Duplikaty.** Powtórzony adres źródła i powtórzony temat wobec istniejących artykułów.
   Na start porównanie po adresach i tytułach, bo to kosztuje zero.
   **Porównanie embeddingowe odkładamy** — przy jednym tekście tygodniowo podobieństwo tematyczne
   i tak nie rozstrzyga, czy dwa teksty odpowiadają na tę samą potrzebę. Kalibracja progu z 0.6
   zostaje w planie jako przygotowanie, wdrażamy ją dopiero, gdy powtórki staną się realnym problemem.
2. **Źródła osiągalne i kompletne.** Każde źródło ma tytuł, adres, datę pobrania i datę publikacji,
   jeśli jest dostępna. Adresy odpytywane, z rozróżnieniem błędu chwilowego od strony nieistniejącej.
   Detektor liczb bez źródła odpada nawet w zawężonej wersji: regex z listą wyjątków odrzucałby
   poprawne teksty. Dwa linki zewnętrzne niczego nie dowodzą, więc prawdziwość twierdzeń
   sprawdza człowiek w 2.4. Bramka pilnuje tylko, czy da się te twierdzenia prześledzić.
3. **Linki wewnętrzne istnieją i prowadzą dokądś.** Adresy sprawdzone pod kątem istnienia.
   Wymóg „minimum dwa do usług" jest miękki: brak pasującej usługi nie wymusza wciskania
   niepasującego odnośnika, bramka wtedy zgłasza uwagę zamiast odrzucać.
Bez punktów za długość i za długość meta opisu. Bez sędziego LLM oceniającego tekst innego LLM.

**2.6 Egzekwowanie bramki — mechanizm i miejsce wpięcia.**
Dziś `app/api/blog/publish/route.ts` czyta tryb serwerowo przez `getBlogPublishMode()`
i przekazuje go do `resolvePublishState` (`lib/ai-disclosure.ts:57`), więc workflow nie ma jak
wymusić szkicu. Zmiany, obie konieczne:
- **strona wysyłająca:** `.github/scripts/blog-auto.mjs` importuje bramkę i przed wysłaniem POST-a
  wstawia do payloadu wynik. Bez tego pole opisane niżej nie miałoby nadawcy
- **strona przyjmująca:** payload zyskuje `quality_gate_passed: boolean`, a route traktuje `false`
  dokładnie jak tryb `review` — artykuł zapisuje się jako szkic, a powiadomienie zawiera listę braków
Tryb `review` nadal zawsze tworzy szkic, **pozostaje domyślny i jest jedynym rekomendowanym**.
Tryb `auto` publikuje wyłącznie przy `quality_gate_passed: true`, ale opisujemy go uczciwie:
**przejście bramki technicznej nie jest zatwierdzeniem merytorycznym**, tylko stwierdzeniem,
że tekst ma źródła i działające linki. Codex trafnie wytknął, że poprzednia wersja planu wymagała
człowieka w punkcie 2.4 i jednocześnie dopuszczała publikację bez niego w 2.6.
Sprzeczność znika przez nazwanie rzeczy: `auto` to tryb bez przeglądu, na odpowiedzialność właściciela.
Istniejąca gałąź `if (existing?.reviewed_at) return existing` wyprzedza całą tę logikę i zostaje:
artykuł raz zatwierdzony przez człowieka nie wraca do szkiców.

**2.7 Kadencja.** Piątkowy `blog-auto` zostaje, przechodzi na listę fraz i bramkę.
Jeden artykuł tygodniowo, każdy przez przegląd redakcyjny.

**2.7b Tygodniowe nowości znikają z bloga i lądują w prywatnej skrzynce.**
`blog-brief` przestaje publikować cokolwiek na stronie. Zbieranie materiałów zostaje bez zmian —
skrypt już dziś czyta kanały RSS producentów modeli i to jest gotowy automat researchowy,
o którego zachowanie słusznie upomina się Codex. Zmienia się tylko odbiorca:
zamiast POST-a do `/api/blog/publish` idzie **mail na prywatny adres właściciela**, wysyłany
przez istniejącą integrację z Resendem (`lib/email/resend.ts`).
Treść maila: 6–10 pozycji, każda z tytułem, adresem źródła, datą publikacji, dwuzdaniowym
streszczeniem i jednym zdaniem, której usługi lub problemu klienta dotyczy.
Mail zachowuje rozróżnienie, co jest streszczeniem pobranego materiału, a co propozycją modelu.
Ten sam plik materiałów zasila listę tematów dla `blog-auto`, więc research nie ginie,
tylko przestaje być publikowany bez wartości dodanej.
Generowanie okładki dla briefu odpada, bo nie ma już czego ilustrować.

**2.8 Osiemnaście starych briefów — ręczny przegląd, nie reguła automatyczna.**
Poprzednia wersja mówiła „zero wyświetleń to `noindex`, jakikolwiek ruch to zostawiamy".
Codex ma rację, że to za mechaniczne: brak wyświetleń nie dowodzi braku wartości, a przy osiemnastu
pozycjach ręczny przegląd kosztuje godzinę. Dla każdego wpisu jedna z czterech decyzji:
zostawić, odświeżyć pod frazę, połączyć z innym, wyłączyć z indeksu.
Wyświetlenia z GSC są przesłanką, nie wyrokiem. Domyślnie spodziewam się, że większość
archiwalnych przeglądów wyjdzie z indeksu, bo powtarzają newsy sprzed miesięcy.
Mechanizm wyłączania z indeksu:
- `robots: { index: false, follow: true }` w `generateMetadata`, warunkowane kolumną — to jest sedno
- filtr `noindex = false` w `app/sitemap.ts` jako uzupełnienie, żeby nie wysyłać sprzecznego sygnału
Wycięcie z sitemapy strony już znanej Google niczego nie usuwa z indeksu, więc kolejność ma znaczenie.
Konsolidacja z przekierowaniami odpada jako najdroższa.

**2.8b Pozostałe 12 artykułów — nie zostawiamy ich bez decyzji.**
Punkt B3 nazywa je generycznymi i bez frazy docelowej, a to one decydują, jak blog wygląda dla kogoś,
kto trafi tam z zapytania usługowego. Dla każdego: przypisanie frazy z mapy i odświeżenie,
albo `noindex`, jeśli fraza nie istnieje. Decyzja na podstawie wyświetleń z GSC, jak przy briefach.

**2.8c Doszycie linków z istniejących artykułów.**
Wszystkie artykuły zostawione w indeksie dostają link do właściwej strony usługowej i do `/cennik`.
To jedyne strony, które dziś mogą dostać wyświetlenie, a nie mają dokąd prowadzić.
Jedno przejście, około godziny pracy, najkrótsza droga od istniejącego ruchu do formularza.

**2.9 Filar i klaster.** Sekcja „powiązane artykuły" na stronie usługowej, link zwrotny w artykule,
mapa powiązań w `editorial-standard.md`. **Bez stron tagów** — przy tej liczbie wpisów powstałyby
cienkie, wzajemnie podobne listy, czyli problem, który sprząta punkt 2.8.

**Kryterium wyjścia:** trzy kolejne artykuły przechodzą bramkę bez ręcznych poprawek,
każdy z frazą docelową z mapy i z wstawką autorską dodaną przy zatwierdzeniu.

**2.10 Model generujący — podniesienie o trzy pokolenia.**
Sprawdzone na kluczu projektu 2026-09-10: dziś wszystkie generatory chodzą na `gemini-2.5-flash`
(8 wystąpień w kodzie) i `gemini-2.5-flash-image` do okładek. Na tym samym kluczu odpowiadają
`gemini-3.8-flash` i `gemini-3.1-flash-image` — sprawdziłem realnym wywołaniem, oba zwracają 200.
Zmiana: teksty na `gemini-3.8-flash`, okładki na `gemini-3.1-flash-image`.
Koszt jest nieistotny przy tej skali. Cennik wprowadzający dla 3.8 Flash to 0,75 dolara
za milion tokenów wejściowych i 3,75 za milion wyjściowych do końca 2026, potem dwukrotnie więcej.
Przy czterech artykułach i kilkunastu postach miesięcznie mówimy o kwotach rzędu złotówki.
Czat Klary zostawiamy na razie na 2.5-flash i zmieniamy osobno, bo to gorący ruch produkcyjny
z własnym promptem systemowym i wymaga oddzielnego testu.
**Obowiązkowe domknięcie: aktualizacja `lib/ai-registry.ts`.** To rejestr systemów AI prowadzony
pod AI Act, wpisy `blog-auto` i `blog-brief` podają wprost nazwy modeli. Zmiana modelu bez zmiany
rejestru rozjeżdża dokumentację zgodności z rzeczywistością.

### FAZA 2B — Automat treści do LinkedIna i Facebooka (2–3 dni, równolegle z Fazą 2)

Cel: dostarczać właścicielowi gotowe do redakcji propozycje postów. **Nic nie publikuje się samo
i nigdzie nie łączymy się z LinkedInem ani z Facebookiem.** Automat kończy pracę na tekście
w skrzynce, publikacja jest ręczna. To upraszcza rzecz radykalnie: żadnych tokenów OAuth,
żadnych limitów API, żadnego ryzyka publikacji czegoś, czego właściciel nie przeczytał.

**2b.1 Wspólny silnik, nie drugi system.** Ten sam skrypt zbierający materiały co w 2.7b,
ten sam standard pisarski, ta sama trójbramkowa kontrola. Różni się prompt i format wyjścia.
Nowy plik `.github/scripts/social-posts.mjs` i workflow `social-posts.yml`.

**2b.2 Zakres tematyczny** wprost od właściciela: nowości w AI, automatyzacje w MŚP, modele językowe,
praktyczne rozwiązania, chatboty, voiceboty, ciekawostki dla małych i średnich firm.
Zapisany w `docs/seo/social-topics.md`, żeby dało się go zmieniać bez ruszania kodu.

**2b.3 Wyjście: pięć propozycji tygodniowo w jednym mailu.**
Każda propozycja zawiera: wersję na LinkedIn (do 1300 znaków, akapit z hakiem, konkret, pytanie
na końcu), skróconą wersję na Facebooka, jedno źródło z adresem i sugerowany format
(tekst, karuzela, krótkie wideo). Bez emoji jako ozdobników i bez hashtagów ponad trzy.

**2b.4 Trzy bramki, te same co w blogu.**
Duplikaty wobec propozycji z poprzednich tygodni. Źródło osiągalne i z kompletnymi metadanymi.
Długość i struktura zgodne z limitami obu platform.
Propozycja, która nie przechodzi, trafia do maila oznaczona jako wymagająca uwagi, a nie znika.

**2b.5 Czego świadomie nie robimy.** Bez harmonogramu publikacji, bez kolejki postów w bazie,
bez panelu. Mail plus kopiuj-wklej wystarczy do czasu, aż okaże się, że nie wystarcza.
Wtedy dołożymy tyle, ile zabraknie.

**2b.6 Związek z SEO jest pośredni, ale realny.** Posty nie budują pozycji bezpośrednio.
Budują wzmianki, cytowania i ruch, czyli dokładnie te sygnały, których brakuje domenie bez linków,
i są kanałem pomostowym na te 6–12 miesięcy, zanim wyszukiwarka zacznie cokolwiek dawać.

### FAZA 3 — Pomiar

Comiesięczny przegląd Search Console w arkuszu: pozycje, zapytania na miejscach 8–20, strony tracące
wyświetlenia, a osobno kliknięcia na adresy komercyjne (`/uslugi/*`, `/cennik`).
Interfejs GSC ma to wbudowane. Własna tabela `seo_rankings`, workflow raportujący
i panel `/admin/seo` odpadają. Kontrola widoczności w odpowiedziach AI skillem
`searchfit-seo:ai-visibility` dopiero wtedy, gdy pojawią się pierwsze pozycje w Top 20 —
wcześniej dwa przebiegi zwrócą to samo zero.

---

## CZĘŚĆ D — RYZYKA

| Ryzyko | Jak adresujemy |
|---|---|
| Pierwsze zapytania z organicznego to 6–12 miesięcy | Powiedziane wprost, kanał pomostowy w Części B |
| Brak wizytówki Google i pakietu map | Rozstrzygnięte na starcie, lokalne opiera się wyłącznie na wynikach organicznych |
| Popyt lokalny może być zerowy | Walidacja wolumenu jako kryterium wyjścia z Fazy 0 |
| Skalowana treść AI może obniżyć ocenę witryny | Przegląd redakcyjny każdego tekstu, tryb `review` domyślny, jeden tekst tygodniowo |
| Zmiana modelu rozjeżdża rejestr AI Act | Aktualizacja `lib/ai-registry.ts` w tym samym commicie co zmiana modelu (2.10) |
| Automat postów zacznie publikować sam | Nie łączymy się z LinkedInem ani Facebookiem, wyjściem jest mail (2B) |
| Brak dowodu blokuje konwersję mimo ruchu | Zadanie 1.9 z wariantem zapasowym (publiczne repozytorium z workflow) |
| Rebase 52 commitów może być bolesny | Wyceniony osobno na 2–3 dni, gałąź najpierw wypchnięta na `origin` |
| Migracje poza kolejnością | Przenumerowanie na 013–016, `013` uruchamiana w transakcji |
| Nowe strony odziedziczą ciężki stos animacji | Próg LCP 2,5 s jako warunek wejścia na produkcję |
| Chatbot cytuje nieaktualną ofertę | Ręczne uruchomienie `kb-refresh.yml` po edycji usługi (1.11) |
| Ja robię design zamiast Codeksa | Trzymam się istniejących tokenów i komponentów, Codex może poprawić |

## CZĘŚĆ E — HARMONOGRAM I MIERNIKI

| Faza | Zakres minimalny | Zakres rozszerzony |
|---|---|---|
| 0 — dane i atrybucja | 3–4 dni | — |
| 1.1 — rebase i migracje (start w dniu zerowym) | 2–3 dni | — |
| 1 — pozostałe strony i treść sprzedażowa | 8–10 dni | 14 dni |
| 2 — silnik treści bloga | 3–4 dni | 4–5 dni |
| 2B — automat postów do sieci społecznościowych | 2–3 dni | — |
| 3 — pomiar | 0, przegląd w arkuszu | — |
| **Nakład pracy razem** | **18–24 dni roboczych** | **25–29 dni** |

Tabela podaje **nakład pracy, nie czas kalendarzowy** — Codex słusznie wytknął, że wcześniej
te dwie rzeczy się myliły, a nagłówek Fazy 1 przeczył tabeli. Faza 2B idzie równolegle z Fazą 2,
a kroki 1 i 2 z punktu 1.1 startują w dniu zerowym, więc kalendarz jest krótszy niż suma.
Osobno, poza tą tabelą, leży czas właściciela: 30 minut tygodniowo na przegląd artykułu,
zatwierdzenie tekstów ofertowych i zdobycie referencji z punktu 1.9.

Wycena Fazy 1 urosła świadomie. Mieszczą się w niej: przeniesienie siedmiu widoków na obecne tokeny,
przepisanie trzech tekstów usługowych pod frazy, rozszerzenie panelu o pola treści, `/cennik`
z widełkami i FAQ, `/kontakt`, `/o-mnie`, strona lokalna, warstwa konwersji na siedmiu stronach,
schematy i aktualizacja autora na 30 artykułach. Sama sensowna kopia sprzedażowa B2B
to pół dnia na stronę i wcześniejsze 4–5 dni było życzeniem, nie wyceną.

Mierniki po 90 dniach. **To hipotezy planistyczne, nie prognozy** — nie mamy danych, na których
dałoby się oprzeć prognozę, a wcześniejsza wersja podawała je tonem pewności, którego nie miała.
Ich rolą jest dać punkt, w którym sprawdzamy, czy kierunek działa, a nie obiecać wynik:

| Miernik | Stan dziś | Cel |
|---|---|---|
| Adresy komercyjne w indeksie (usługi, cennik, kontakt, o mnie, lokalna) | 0 | 11 |
| Adresy łącznie w sitemapie | 39 | zależnie od decyzji z 2.8, przy `noindex` na briefach spadek do ok. 32 |
| Frazy w Top 10 | wartość bazowa z 0.7 | +8 |
| Kliknięcia miesięcznie na adresy komercyjne (`/uslugi/*`, `/cennik`) | 0 | 30 |
| Odsetek leadów z rozpoznanym źródłem i stroną wejścia | 0 | 70% |
| Artykuły przechodzące bramkę za pierwszym razem | brak bramki | 3 z 3 |

Liczba adresów w indeksie **celowo nie jest miernikiem wzrostu** — po ustawieniu `noindex`
na briefach spadnie, i to będzie dobra wiadomość. Mierzymy adresy komercyjne osobno.

Miernik po 9 miesiącach, ten właściwy: pierwsze zapytania ofertowe z `landing_path`
wskazującym stronę usługową, cennik albo artykuł.
