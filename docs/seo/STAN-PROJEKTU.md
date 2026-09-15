# Stan projektu widoczności — punkt kontrolny 15 września 2026

Dokument do wznowienia pracy bez historii rozmowy. Opisuje, co zrobione, co czeka
i czego nie podważać, bo zostało rozstrzygnięte na danych.

---

## Gdzie co leży

| Plik | Co zawiera |
|---|---|
| `docs/superpowers/specs/2026-09-10-widocznosc-w-wyszukiwarce-design.md` | specyfikacja całości |
| `docs/seo/keyword-map.md` | mapa fraz, wolumeny, analiza konkurencji |
| `docs/seo/plan-tresci.md` | trzynaście tematów dla generatora, źródło kolejki |
| `docs/seo/editorial-standard.md` | zasady pisania, czyta je generator i bramka |
| `docs/seo/przeglad-artykulow.md` | decyzje o istniejących artykułach |
| `docs/seo/baseline.md` | punkt odniesienia sprzed zmian |
| `docs/zadania-wlasciciela.md` | co należy do właściciela |
| `docs/seo/social-topics.md` | tematy, głos i format postów, czyta automat postów |
| `data/seo/wolumeny.csv` | 15 385 fraz z wolumenami, źródło tematów po wyczerpaniu planu |

---

## Plany i ich stan

| Plan | Zakres | Stan |
|---|---|---|
| 1. Atrybucja leadów i kanoniczny host | scalony, na produkcji | **zrobiony** |
| 2. Strony usługowe, kontakt, o mnie | scalony, PR 21 | **zrobiony** |
| 3. Silnik treści bloga | scalony 15 września, PR 22 | **zrobiony**, poza kryterium trzech szkiców |
| 3a. Odświeżenie czterech artykułów pod frazy | gałąź `feat/odswiezenie-artykulow` | **zrobione 15 września**, na produkcji |
| 4. Automat propozycji postów na LinkedIn i Facebooka | scalony 15 września, PR 27, workflow `social-posts.yml`, poniedziałki | **zrobiony** |

### Plan trzeci — co zostało

Kryterium domknięcia: trzy kolejne szkice generatora przechodzą bramkę bez ręcznych poprawek.
Sprawdza się w piątkowych biegach `blog-auto.yml`. Do tego czasu tryb redakcyjny.

### Plan trzeci — historia zadań 9 i 10

**Zadanie 9 — zastosowanie decyzji o artykułach.** Zrobione. Migracja `020_blog_przeglad.sql`
uruchomiona i sprawdzona na produkcji: dziesięć artykułów w indeksie, dwadzieścia jeden wyłączonych,
pięć z frazą docelową.

**Zadanie 10 — doszycie odnośników wewnętrznych.** Zrobione 15 września. Migracja
`021_blog_odnosniki.sql` uruchomiona i sprawdzona, baza wiedzy chatbota odświeżona. 33 zmiany w dziesięciu artykułach: od jednej do trzech
stron usługowych i od jednego do dwóch artykułów na tekst. Każda zmiana obejmuje odnośnikiem
fragment, który już stoi w treści, więc tekst nie jest przepisywany. Wszystkie fragmenty
sprawdzone na produkcyjnej treści: każdy występuje dokładnie raz.

Odnośniki weszły też do czterech artykułów do odświeżenia. Odświeżenie ich nie usuwa,
o ile nie przepisuje zdań z odnośnikami.

### Co wyszło przy czytaniu artykułów do zadania 10

Punkty 1 i 2 załatwiła migracja `022_blog_scenariusze.sql`, uruchomiona i sprawdzona 15 września.
Ta sama migracja wyłączyła z indeksu przegląd nowości z 14 września: stary workflow przeglądu
działa na main do scalenia pull requesta 22 i w każdy poniedziałek dołoży następny.
Punkt 3 zostaje na odświeżenie artykułów.

1. **Sześć z dziesięciu artykułów podaje wymyślone wdrożenia jako prawdziwe.** Firmy z nazwami,
   procenty wyników, w artykule o rekrutacji nawet cytat właściciela „Szybkiej Paki Logistics".
   Bez oznaczenia, że to scenariusz. Dotyczy artykułów o n8n, sprzedaży, ofertach, analizie danych,
   zarządzaniu projektami i rekrutacji. Standard pisarski tego zabrania. Pozostałe cztery oznaczają
   przykłady jako hipotetyczne.
2. **Artykuł o rekrutacji twierdzi, że AI jest wolna od uprzedzeń**, i poleca przesiewanie CV
   bez słowa o tym, że AI Act zalicza takie systemy do wysokiego ryzyka (załącznik III, punkt 4).
   Na stronie, która sprzedaje zgodność z AI Act.
3. **Zwroty z czarnej listy i zdublowany nagłówek.** „W dzisiejszym dynamicznym świecie",
   „w erze cyfrowej", „rewolucja" w kilku tekstach. Sześć artykułów powtarza tytuł jako nagłówek
   pierwszego poziomu w treści, więc strona ma dwa. W artykule o obsłudze klienta marka jest
   zapisana jako „Zautomatyzuj.pl".

---

## Czego nie podważać

Te rzeczy zostały rozstrzygnięte na danych i wracanie do nich kosztuje czas bez efektu.

**Fraz lokalnych nie ma.** Wyszukanie `chojnice` w Senuto dało 5 387 fraz, z branży tylko
`informatyk chojnice` (30 wyszukiwań). Zero podpowiedzi lokalnych ze 140 zapytań do Google Suggest.
Zero zapytań lokalnych w Search Console. Strona lokalna zostaje wizytówką, nie kanałem ruchu.

**Wizytówki Google nie będzie.** Właściciel nie ma działalności, a wytyczne Google i tak wymagają
kontaktu z klientem osobiście, czego praca zdalna nie spełnia.

**Bing nie jest źródłem wolumenów.** Sprawdzone: dane ma trzynaście fraz ze stu dziesięciu,
endpoint powiązanych fraz zwraca dla Polski pustkę. Klucz API zostaje podpięty, ale planowanie
opiera się na danych z Senuto.

**Frazy cenowe są gęsto obsadzone.** Osiem firm ma dedykowane artykuły cennikowe.
Strona `/cennik` ma sens sprzedażowy, nie wyszukiwarkowy.

**Standard pisarski nie ma być skillem.** Czyta go generator w GitHub Actions i bramka jakości,
czyli skrypty Node, które nie widzą skilli Claude'a. Jeden plik w repozytorium, zero kopii.

---

## Skala popytu, do której odnosimy decyzje

| Fraza | Wyszukiwań miesięcznie |
|---|---|
| n8n | 33 100 |
| agent ai / ai agent / agenty ai | 5 400 |
| ai act | 3 600 |
| workflow | 3 600 |
| asystent ai | 2 400 |
| klaster szkoleniowy łącznie | kilka tysięcy |
| automatyzacja procesów biznesowych | 590 |
| automatyzacja obiegu dokumentów | 90 |
| automatyzacja faktur | 20 |

## Konkurencja, do której się porównujemy

| Domena | Frazy w TOP 10 | Szacowany ruch | Uwaga |
|---|---|---|---|
| letsautomate.pl | 23 | 613 | siedzi na naszych frazach docelowych |
| sagiton.pl | 67 | 544 | strona usługowa pierwsza na `ai consulting` |
| codium.pl | 16 | 585 | ruch z jednego artykułu o WordPressie, spada |

Poprzeczka na pierwszy rok: dwadzieścia kilka fraz w pierwszej dziesiątce i kilkaset wejść.

---

## Zadania właściciela, stan otwarty

1. ~~Zgłosić w Search Console ponowną indeksację czterech odświeżonych artykułów~~ — ZROBIONE 15 września.
2. Uruchomić migrację `027_uslugi_cena_automatyzacji.sql`, po niej workflow `kb-refresh.yml`.
   Decyzja z 15 września: widełek nie ma, wycena indywidualna. Jedyna kwota: proste automatyzacje
   od 500 zł (strona automatyzacji procesów). Szkolenia: od 2000 zł netto. Agenci AI i obieg dokumentów bez kwoty.
3. Po wdrożeniu planu drugiego zgłosić dziesięć nowych adresów do indeksacji w Search Console.
4. Zdobyć trzy realne wdrożenia z prawem do opisu albo uruchomić wariant zapasowy
   z publicznym repozytorium przepływu n8n.

## Odświeżanie artykułów

Szkic leży w `docs/seo/odswiezenia/`, z metadanymi w nagłówku. Migrację składa
`node --env-file=.env.local scripts/seo/migracja-odswiezenia.mjs <szkic> <migracja>`:
przepuszcza tekst przez bramkę, odmawia przy znaczniku wstawki i podmienia treść tylko wtedy,
gdy w bazie stoi wersja z chwili składania.

| Artykuł | Fraza | Stan |
|---|---|---|
| ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n | automatyzacje n8n (40) | **zrobione 15 września**, migracja `023`, bez wstawki z decyzji właściciela |
| ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp | baza wiedzy ai (wolumen niezmierzony, fraza z podpowiedzi Google) | **zrobione 15 września**, migracja `024` |
| automatyzacja-dokumentow-faktur-ai-msp | ocr faktury (70), zamiast frazy strony usługowej | **zrobione 15 września**, migracja `025` |
| automatyzacja-obslugi-klienta-ai-rag-msp | automatyzacja obsługi klienta (110) | **zrobione 15 września**, migracja `026` |

**Fraza „automatyzacja ai n8n” z przeglądu była błędem.** Nie ma jej w danych z Senuto,
pochodziła z podpowiedzi Google i w mapie fraz jest przypisana stronie usługowej.
Przed odświeżeniem kolejnych artykułów sprawdź ich frazę w `data/seo/wolumeny.csv`.
`automatyzacja obiegu dokumentów` też była błędnym przydziałem: to fraza główna strony usługowej.

**Fakty z 15 września użyte w tekstach.** KSeF: odbiór dla wszystkich od 1 lutego 2026, wystawianie
od 1 kwietnia 2026, zwolnienie do 10 000 zł miesięcznie do końca 2026, faktury zagraniczne poza KSeF.
AI Act: art. 50 od 2 sierpnia 2026, terminy wysokiego ryzyka z załącznika III przesunięte na grudzień 2027.

**Znacznik wstawki psuje kompilację MDX.** Artykuł z `<!-- WSTAWKA -->` w bazie wysypie stronę,
więc znacznik nie może trafić do migracji w żadnym trybie.

## Pułapki techniczne

- **Pliki migracji tracą treść po uruchomieniu.** 022 i 026 zostały na dysku ucięte albo wyczyszczone
  w chwili, gdy właściciel wklejał je do Supabase. Przed commitem sprawdź `git status` i przywróć
  plik poleceniem `git restore`, zamiast commitować pusty.

- **Serwer MCP Supabase jest tylko do odczytu.** Każdą migrację pisz jako plik i wpisuj
  jej uruchomienie do zadań właściciela wraz z zapytaniem weryfikującym.
- **Publiczne API PageSpeed zwraca 429.** Pomiar wydajności planuj jako ręczny.
- **Nie używaj `git add -A`.** W repozytorium leżą katalogi spoza projektu: `.worktrees`
  należący do Codeksa, `output` i `tmp`. Są w `.gitignore` od 11 września, ale raz już
  wpadły do commita.
- **Heredoc z Pythonem zjada ukośniki.** Przy plikach z wyrażeniami regularnymi używaj
  narzędzia do zapisu plików, nie skryptu w powłoce.
- **Numeracja migracji.** Zajęte do `027` włącznie. Następna wolna to `028`.
- **Zmiany treści artykułów rób zamianą fragmentu, nie nadpisaniem.** Wzorzec w `021`:
  fragment musi wystąpić dokładnie raz, inaczej migracja się przerywa. Treść w bazie mogła
  się zmienić od chwili, gdy ją czytałeś.
