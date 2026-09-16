# Ulepszenia stron usługowych — rozpiska i podział pracy

Powstało 16 września 2026 po przeglądzie oferty konkurencji (siatka usług z kartami
„dla kogo”, nazwany produkt agentowy z tabelą zwrotu z inwestycji, FAQ voicebota).
Dokument rozpisuje pięć zatwierdzonych ulepszeń usługa po usłudze i dzieli pracę tak,
żeby nie kolidowała z gałęzią `codex/uslugi-animacje-i-ilustracje`.

---

## Stan wykonania, 16 września 2026

Decyzje właściciela: bez widełek cenowych (zostaje „wycena po rozmowie”), zaczynamy od
voicebota, treści wgrywane do bazy od razu.

**Zrobione i na produkcji:**

- **Punkt 5, usługa** — `/uslugi/voicebot-asystent-glosowy` stoi na pozycji trzeciej,
  pozostałe usługi przesunięte w dół. FAQ agentów AI linkuje do niej.
- **Punkt 1** — zdania „dla kogo” dopisane do `subtitle` wszystkich ośmiu usług.
- **Punkt 2** — wszystkie osiem usług ma komplet sekcji `Ile to kosztuje`
  i `Najczęstsze pytania`. Wcześniej trzy nie miały żadnej z nich.
- **Punkt 5, artykuły** — filar piąty dopisany do `docs/seo/plan-tresci.md` (tematy 13 i 14),
  rozbieżność w `keyword-map.md` sekcja 1.4 zdjęta.
- Przy okazji: `app/sitemap.ts` dostał `revalidate`, bo mapa strony powstawała raz w czasie
  builda i nowa usługa do niej nie trafiała (PR #36).

**Zostało:**

- **Punkty 3 i 4** — demo Klary na stronach agentów i voicebota oraz kalkulator oszczędności.
  Teksty do napisania, komponenty należą do Codeksa.
- **Ilustracja dla voicebota** — `service-artwork.tsx` nie ma sceny dla nowego sluga, więc
  strona wyświetla się bez grafiki, a karta z ikoną domyślną. Zadanie Codeksa.
- **Punkt 1, wersja docelowa** — „dla kogo” jako osobny wiersz karty zamiast drugiego zdania
  `subtitle`, razem z kolumną `audience`. Zadanie Codeksa.
- **Sprawdzenie Klary w panelu Vapi** — czy przy rozmowie głosowej informuje, że jest AI.
  Zadanie właściciela, opisane niżej w punkcie 3.

---

## Podział pracy

**Claude — wyłącznie treść i dane, zero plików frontendowych:**
- pola `subtitle`, `content`, `seo_title`, `seo_description` w tabeli `services` (Supabase),
- nowy wiersz usługi voicebota w tej samej tabeli,
- `docs/seo/plan-tresci.md`, `docs/seo/keyword-map.md`, artykuł na blog,
- ten dokument.

**Codex — front, gałąź `codex/uslugi-animacje-i-ilustracje` i kolejne:**
- wiersz „Dla kogo” jako osobny element karty na `/uslugi` (dziś karta pokazuje
  `subtitle ?? description` jednym akapitem — patrz [app/uslugi/page.tsx:98](../app/uslugi/page.tsx#L98)),
- scena i ikona dla sluga voicebota w `components/marketing/service-artwork.tsx`,
- przycisk rozmowy z Klarą na stronach dwóch usług,
- komponent kalkulatora oszczędności,
- JSON-LD `FAQPage` na stronie usługi (dziś jest `Service` + `BreadcrumbList`).

**Jedyny punkt styku: slug nowej usługi.** Uzgadniamy go w tym dokumencie, Codex mapuje
go u siebie. Do czasu grafiki strona voicebota wyświetli się bez ilustracji — sprawdzone,
`ServiceArtwork` zwraca wtedy `null`, a karta dostaje ikonę domyślną.

Czego nie robimy: nie kopiujemy liczb konkurencji („8–12 godzin tygodniowo”, tabela
oszczędności). Firma nie ma jeszcze wdrożeń, więc każda taka liczba byłaby zmyślona.
Zamiast twierdzenia — kalkulator na danych klienta.

---

## 1. Zdanie „dla kogo” na kartach `/uslugi`

Konkurencja kończy każdą kartę zdaniem „Dla firm, które…”. U nas sekcja `## Dla kogo`
istnieje, ale dopiero na stronie szczegółowej. Poniższe zdania to skrót tej sekcji.

| Usługa | Zdanie na kartę |
|---|---|
| Automatyzacja procesów biznesowych | Dla firm, w których te same dane przepisuje się ręcznie między kilkoma narzędziami. |
| Agenci AI i chatboty | Dla firm, które odpowiadają klientom na te same pytania dziesiątki razy w tygodniu. |
| Voicebot i asystent głosowy AI | Dla firm, do których klienci najchętniej dzwonią, a telefon zostaje bez odbioru. |
| Automatyzacja dokumentów i faktur | Dla firm, w których ktoś co miesiąc przepisuje faktury z PDF-ów do arkusza lub systemu. |
| Audyt i doradztwo AI | Dla firm, które wiedzą, że da się coś usprawnić, ale nie wiedzą, od czego zacząć. |
| Szkolenia z AI dla zespołów | Dla zespołów, które mają dostęp do narzędzi AI i nie korzystają z nich w pracy. |
| Strony i oprogramowanie na zamówienie | Dla firm, którym gotowe narzędzie nie obsłuży procesu takiego, jaki mają naprawdę. |
| Zgodność z AI Act | Dla firm, które używają gotowych narzędzi AI i nie wiedzą, jakie obowiązki je obejmują. |

**Wdrożenie dwuetapowe.** Etap pierwszy, dziś, bez kodu: dopisuję zdanie jako drugie zdanie
pola `subtitle`. Etap drugi, Codex: osobny wiersz na karcie, wizualnie oddzielony jak
u konkurencji. Wtedy zdanie wraca do własnej kolumny `audience` i znika z `subtitle`
— migrację kolumny robimy dopiero razem z jego zmianą, żeby baza nie miała pola,
którego nic nie czyta.

---

## 2. FAQ na każdej stronie usługi

Wzorzec już istnieje i trzymamy się go: pytanie pogrubione, odpowiedź w kolejnej linii,
bez nagłówków trzeciego poziomu.

### Usługi, które mają FAQ — czego w nich brakuje

**Automatyzacja procesów biznesowych** — dopisać:

> **Co się stanie, jeśli automatyzacja przestanie działać?**
> Dostajesz powiadomienie o błędzie zanim zauważysz go po skutkach. Umawiamy się z góry,
> kto reaguje: Ty, Twój zespół, czy ja.
>
> **Czy muszę zmieniać programy, z których korzystamy?**
> Nie. Automatyzacja łączy to, co już masz. Jeśli któreś narzędzie naprawdę blokuje
> sensowny proces, powiem to wprost, ale nie jest to warunek wdrożenia.

**Agenci AI i chatboty** — dopisać:

> **Czy klient pozna, że rozmawia z AI?**
> Tak, i tak ma być. Agent mówi o tym na wejściu, bo od 2 sierpnia 2026 wymaga tego AI Act.
> Zobacz [zgodność z AI Act](/uslugi/zgodnosc-z-ai-act).
>
> **Co, jeśli klient chce rozmawiać z człowiekiem?**
> Agent przekazuje rozmowę dalej i dostajesz jej podsumowanie, żeby nie zaczynać od zera.
> Ustalamy przy wdrożeniu, kiedy ma to robić sam: na prośbę klienta, po nierozpoznanym
> pytaniu albo przy temacie, który wskażesz.

Pytanie o voicebota, które dziś stoi w tym FAQ, po uruchomieniu nowej usługi zamieniamy
na odnośnik do niej.

**Automatyzacja dokumentów i faktur** — dopisać:

> **Co z dokumentami, których system nie odczyta poprawnie?**
> Trafiają do ręcznego sprawdzenia zamiast wejść do systemu z błędem. Odczyt bez kontroli
> człowieka przy kwotach to proszenie się o kłopoty.
>
> **Gdzie trafiają moje dokumenty?**
> Ustalamy to przed wdrożeniem i zapisujemy: które narzędzie je przetwarza, gdzie leżą dane
> i jak długo. Jeśli dokumenty nie mogą opuścić Twojej infrastruktury, powiem od razu,
> czy da się to zrobić w Twoim budżecie.

**Szkolenia z AI dla zespołów** — dopisać:

> **Ile osób może wziąć udział?**
> Warsztat ma sens do kilkunastu osób. Powyżej tego nikt nie ćwiczy, wszyscy słuchają.
>
> **Czy szkolenie załatwia obowiązek z AI Act?**
> Artykuł 4 wymaga, żeby osoby korzystające z AI w firmie miały odpowiednią wiedzę.
> Szkolenie to realizuje i dostajesz listę obecności oraz zakres. Nie zastępuje
> pozostałych obowiązków — te sprawdzamy w [audycie AI Act](/uslugi/zgodnosc-z-ai-act).

### Usługi bez FAQ — do napisania w całości

**Audyt i doradztwo AI** (brak też sekcji `## Ile to kosztuje`):

> ## Ile to kosztuje
>
> Cena zależy od tego, ile procesów obejmujemy i ilu osób muszę wysłuchać.
> Wycenę podaję po krótkiej rozmowie. Jest bezpłatna i trwa około pół godziny.
>
> ## Najczęstsze pytania
>
> **Co dostaję, jeśli po audycie nic nie wdrożę?**
> Cały plan. Jest Twój niezależnie od tego, czy zostaniemy przy współpracy.
> Możesz go zrealizować sam albo z kimś innym.
>
> **Ile to trwa?**
> Zależy od liczby procesów. Dłużej niż rozmowa, krócej niż wdrożenie — dokładny termin
> podaję razem z wyceną.
>
> **Czy audyt kończy się listą narzędzi do kupienia?**
> Nie. Kończy się listą procesów uszeregowanych według tego, ile kosztują dzisiaj
> i ile z tego da się odzyskać. Część z nich najlepiej zostawić człowiekowi i to też napiszę.
>
> **Czy muszę udostępniać dostępy do systemów?**
> Do audytu nie. Wystarczy rozmowa o tym, jak proces wygląda, i przykładowe dokumenty.

**Strony i oprogramowanie na zamówienie** (brak też sekcji `## Ile to kosztuje`):

> ## Ile to kosztuje
>
> Na cenę wpływa liczba widoków, integracje i to, czy potrzebujesz panelu do zarządzania
> treścią. Wycenę podaję po rozmowie o tym, co strona ma robić.
>
> ## Najczęstsze pytania
>
> **Czy mogę potem sam zmieniać treści?**
> Tak. Ustalamy przed startem, które elementy mają być edytowalne bez programisty.
>
> **Czyja jest strona po zakończeniu?**
> Twoja: kod, domena, dostępy. Nie jest to abonament, z którego trudno wyjść.
>
> **Czemu nie gotowy kreator stron?**
> Bo do prostej wizytówki kreator wystarczy i tak powiem. Robię to, czego kreator
> nie udźwignie: proces, integrację z Twoimi systemami, nietypowy formularz.
>
> **Czy strona będzie dostępna dla osób z niepełnosprawnościami?**
> Tak, to standard w każdym projekcie, a nie dodatek za dopłatą.

**Zgodność z AI Act** (brak też sekcji `## Ile to kosztuje`):

> ## Ile to kosztuje
>
> Zależy od liczby narzędzi AI w firmie i tego, czy sam je wdrażasz, czy tylko z nich
> korzystasz. Wycenę podaję po rozmowie.
>
> ## Najczęstsze pytania
>
> **Czy AI Act dotyczy mojej firmy, skoro nic nie tworzymy?**
> Najprawdopodobniej tak. Rozporządzenie obejmuje także firmy, które używają gotowych
> narzędzi. Zakres obowiązków jest wtedy mniejszy, ale nie zerowy.
>
> **Czy to praca dla prawnika?**
> Wykładni prawa nie robię i mówię to wprost. Robię część praktyczną: spis narzędzi AI
> w firmie, oznaczanie treści generowanych, informowanie klientów, że rozmawiają z AI,
> oraz przeszkolenie zespołu.
>
> **Od kiedy to obowiązuje?**
> Przepisy o systemach ogólnego przeznaczenia stosuje się od 2 sierpnia 2026.
>
> **Czy da się to sprawdzić na czymś działającym?**
> Tak. Rejestr systemów AI i oznaczanie treści generowanych działają na tej stronie.
> Pokazuję własne rozwiązanie, nie slajd.

**Dla Codeksa:** gdy FAQ będą w bazie, warto dodać JSON-LD `FAQPage` na
`app/uslugi/[slug]/page.tsx`. Sekcje są w MDX, więc źródłem powinien być osobny zestaw
pytań, a nie parsowanie treści.

---

## 3. Demo Klary zamiast makiety

Konkurencja pokazuje statyczny zrzut rozmowy z agentem na wymyślonych danych.
My mamy działającego asystenta na Vapi, z którym można porozmawiać naprawdę.

- **Agenci AI i chatboty** — akapit w `## Jak to robię`: zaproszenie do rozmowy z Klarą
  jako dowód, że narzędzie działa, plus zdanie, że u klienta zna jego ofertę, a nie moją.
- **Voicebot i asystent głosowy AI** — to samo w wersji głosowej, mocniejsze, bo Klara
  jest dokładnie tą usługą.

Treść piszę ja. Przycisk uruchamiający rozmowę na stronie usługi to zadanie dla Codeksa
— dziś Klara stoi na stronie głównej.

**Zależność:** w [docs/stan-prac-handoff.md](stan-prac-handoff.md) wisi otwarte zadanie
właściciela — sprawdzenie w panelu Vapi, czy Klara przy rozmowie głosowej informuje,
że jest AI. Czat tekstowy ten obowiązek spełnia. Zanim zaczniemy reklamować voicebota
jako zgodnego z AI Act, nasz własny musi być zgodny.

---

## 4. Kalkulator oszczędności

Zamiast tabeli z obietnicą: trzy pola, które wypełnia klient — ile godzin tygodniowo
zajmuje czynność, ile osób ją wykonuje, jaka jest stawka godzinowa. Wynik miesięczny
i roczny, plus zdanie, że to koszt czynności dzisiaj, a nie obiecana oszczędność,
bo automatyzacja zwykle zdejmuje część, nie całość.

Gdzie: **audyt i doradztwo AI** (naturalne wejście w rozmowę) oraz **automatyzacja
procesów biznesowych**. Na pozostałych stronach nie — powtórzony w siedmiu miejscach
przestaje być narzędziem, a staje się ozdobą.

Komponent to zadanie dla Codeksa. Ja przygotuję teksty pól, opis wyniku i zastrzeżenie.
Bez zapisywania danych i bez bramki na e-mail: formularz kontaktowy stoi niżej na tej
samej stronie.

---

## 5. Voicebot i asystent głosowy AI — usługa oraz artykuł

Nazewnictwo zgodnie z decyzją właściciela: w treści używamy obu określeń.
„Voicebot” to fraza wyszukiwana (720 miesięcznie, dane z `data/seo/wolumeny.csv`),
„asystent głosowy AI” jest zrozumiały dla polskiego odbiorcy, który słowa „voicebot”
nie zna.

**Dane z Senuto, 16 września 2026** (eksport klastra „asystent głosowy”, 47 fraz)
potwierdzają, że to rozróżnienie trzeba utrzymać:

| Fraza | Wolumen | CPC |
|---|---|---|
| asystent głosowy | 480 | 2,15 zł |
| asystent głosowy google | 390 | 2,53 zł |
| asystent głosowy po polsku | 170 | 0,95 zł |
| jak wyłączyć asystenta głosowego samsung | 110 | 0,00 zł |
| asystent głosowy samsung | 110 | 0,00 zł |
| **bot głosowy** | **70** | **16,74 zł** |
| agent głosowy ai | 10 | 4,44 zł |

Klaster jest konsumencki i serwisowy. Po frazie głównej ustawiają się Google, Samsung,
Alexa, Huawei, Motorola, Windows, Yanosik i Discord, a największą podgrupę tworzą
warianty „jak wyłączyć asystenta głosowego”. Prawie wszystkie mają CPC równe zeru,
czyli nikt nie licytuje, bo nie ma z tego ruchu sprzedaży.

Wyjątkiem jest `bot głosowy`: 70 wyszukiwań, ale CPC 16,74 zł, czyli osiem razy wyżej
niż fraza główna i najwyżej w całym zestawie. Tam siedzi kupujący.

**Wniosek dla treści.** „Asystent głosowy AI” zostaje w nazwie usługi i w treści,
bo tak mówi polski odbiorca. Nie budujemy natomiast pod tę frazę ani tytułu SEO,
ani artykułu — przyciągnęlibyśmy ludzi szukających, jak wyłączyć asystenta w telewizorze.
Tytuły i frazy główne stoją na `voicebot`, a `bot głosowy` wplatamy naturalnie w treść.

### Usługa

- **slug:** `voicebot-asystent-glosowy` — do zmapowania przez Codeksa w `service-artwork.tsx`
- **tytuł:** Voicebot i asystent głosowy AI
- **sort_order:** 3, zaraz za agentami AI (pozostałe przesuwamy w dół)
- **seo_title:** Voicebot dla firm — asystent głosowy AI, który odbiera telefon
- **subtitle:** Asystent głosowy AI, który odbiera telefon, gdy nikt nie może: umawia,
  przypomina, zbiera zgłoszenie i przekazuje je dalej.

Sekcje treści zgodne z pozostałymi stronami: `Problem`, `Czym voicebot różni się od
chatbota`, `Jak to robię`, `Zgodność z prawem od pierwszego dnia`, `Dla kogo`,
`Co dostajesz`, `Ile to kosztuje`, `Najczęstsze pytania`.

Co musi znaleźć się w FAQ, bo tego szuka kupujący i to ma konkurencja:

- **różnica wobec chatbota** — kanał i technologia: rozpoznawanie mowy, synteza głosu,
  reakcja na przerwanie, opóźnienie odpowiedzi,
- **koszt** — utrzymujemy naszą konwencję („wycena po rozmowie”), ale mówimy wprost,
  że voicebot jest droższy od chatbota i ma sens przy powtarzalnym ruchu telefonicznym,
- **czas wdrożenia** — bez wymyślonych widełek: jeden scenariusz to inna praca niż pięć,
  termin podaję z wyceną,
- **RODO i nagrania** — co ustalamy przed startem: kto przetwarza nagrania, gdzie leżą,
  jak długo, i że klient słyszy informację o nagrywaniu. Bez obietnic o wdrożeniu
  na serwerach klienta, których jednoosobowa firma nie udźwignie,
- **przekazanie do człowieka** — na prośbę dzwoniącego i po nierozpoznanym pytaniu,
  razem z podsumowaniem rozmowy,
- **AI Act** — voicebot musi powiedzieć, że jest AI. To nasz wyróżnik: konkurencyjne FAQ
  w ogóle o tym nie wspomina.

Czego w treści **nie** piszemy: gwarancji opóźnienia poniżej sekundy, szyfrowania
konkretnym algorytmem, wdrożenia on-premises ani żadnej liczby wdrożeń.

### Artykuł

Voicebota nie ma dziś w [docs/seo/plan-tresci.md](seo/plan-tresci.md) ani na liście
wykluczeń — po prostu nie był rozważany. Proponuję dopisać filar piąty **na końcu listy**,
nie w środku: generator bierze pierwszy temat bez przypisanego artykułu, więc wstawienie
w środek przestawia całą kolejkę publikacji.

| # | Temat | Fraza główna | Wolumen | Intencja |
|---|---|---|---|---|
| 13 | Voicebot dla firm: co to jest i kiedy ma sens | voicebot co to | 110 | informacyjna |
| 14 | Ile kosztuje voicebot | voicebot cena | 40 | zakupowa |

Trzeba też zdjąć rozbieżność w [docs/seo/keyword-map.md](seo/keyword-map.md) — sekcja 1.4
mówi „na razie wyłącznie artykuł, nie osobna usługa”. Decyzja właściciela z 16 września
2026 to zmienia: usługa i artykuł. Werdykt SEO zostaje w mocy i trzeba go zapisać wprost:
klaster zajmują dostawcy platform abonamentowych, więc usługa powstaje z powodów
sprzedażowych, a nie dlatego, że liczymy na pozycje.

---

## Decyzje otwarte dla właściciela

1. **Widełki cenowe.** Wszystkie strony mówią dziś „wycena po rozmowie”. Konkurencja podaje
   kwoty. Dane rynkowe mamy zebrane w `keyword-map.md`. Trzymam obecną konwencję,
   dopóki nie zdecydujesz inaczej.
2. **Kolejność publikacji artykułów o voicebocie** — koniec listy czy wyżej.
3. **Sprawdzenie Klary w panelu Vapi** (informowanie o AI przy rozmowie głosowej),
   zanim voicebot stanie się reklamowaną usługą.
