# Plan treści — pierwsze dwanaście artykułów

Kolejka tematów dla automatu blogowego, wyprowadzona z realnych wolumenów wyszukiwań
zebranych 11 września 2026. Źródło liczb: `data/seo/wolumeny.csv`.
Zasady pisania: `docs/seo/editorial-standard.md` (powstanie w planie trzecim).

Kolejność nie jest przypadkowa. Zaczynamy od klastra o największym popycie i najmniejszej
konkurencji merytorycznej, czyli od agentów AI, bo tam pytania są konkretne, a odpowiedzi
wymagają doświadczenia, którego autorzy ogólnych poradników nie mają.

---

## Filar 1: agenci AI — od pytania do wdrożenia

Klaster wart około dwóch tysięcy wyszukiwań miesięcznie w wariantach pytających.
Wszystkie artykuły linkują do `/uslugi/agenci-ai-i-chatboty` oraz do
`/uslugi/szkolenia-z-ai-dla-zespolow`.

| # | Temat | Fraza główna | Wolumen | Intencja |
|---|---|---|---|---|
| 1 | Czym jest agent AI i czym różni się od chatbota | co to jest agent ai | 260 | informacyjna |
| 2 | Jak stworzyć agenta AI: od pomysłu do działania | jak stworzyć agenta ai | 390 | poradnikowa |
| 3 | Własny agent AI czy gotowe narzędzie | własny agent ai | 90 | porównawcza |
| 4 | Ile kosztuje agent AI dla firmy | ile kosztuje agent ai | 50 | zakupowa |
| 5 | Agenci AI w praktyce: pięć zastosowań w małej firmie | agent ai przykłady | 100 | informacyjna |

Artykuł czwarty jest w tym zestawie najważniejszy sprzedażowo mimo najmniejszego wolumenu.
Pytanie o cenę zadaje ktoś, kto już się zdecydował.

---

## Filar 2: n8n — otoczka największej frazy w niszy

Samo `n8n` ma 33 100 wyszukiwań miesięcznie i jest nie do zdobycia, bo to zapytanie nawigacyjne.
Wchodzimy w jego otoczkę. Wszystkie artykuły linkują do
`/uslugi/automatyzacja-procesow-biznesowych`.

| # | Temat | Fraza główna | Wolumen | Intencja |
|---|---|---|---|---|
| 6 | Agenci AI w n8n: jak zbudować pierwszego | n8n ai agent | 320 | poradnikowa |
| 7 | Jak zacząć z n8n bez programowania | n8n kurs | 110 | poradnikowa |
| 8 | Gdzie n8n przechowuje dane i co to znaczy dla RODO | n8n self hosted | 20 | techniczno-decyzyjna |
| 8b | Czym jest workflow i po co firmie diagram procesu | workflow | 3 600 | informacyjna, wczesny etap |

Temat 8b doszedł po analizie konkurencji z 11 września. `workflow` ma 3 600 wyszukiwań,
a u sagiton.pl artykuł „co to jest workflow" ciąga 143 wejścia miesięcznie z pozycji szóstej.
To fraza o krok wcześniejsza niż reszta listy: trafia do kogoś, kto dopiero zaczyna
się rozglądać, i naturalnie prowadzi do automatyzacji procesów.

Artykuł ósmy ma najmniejszy wolumen i największą wartość dla sprzedaży.
Pytanie o dane wrażliwe zadaje osoba, która musi przekonać przełożonego albo dział prawny.
To jedyny temat na tej liście, w którym doświadczenie autora jest nie do podrobienia,
bo wymaga wiedzy spoza dokumentacji producenta.

---

## Filar 3: szkolenia z AI — największy klaster komercyjny

Rodzina fraz szkoleniowych sumuje się do kilku tysięcy wyszukiwań miesięcznie.
Wszystkie artykuły linkują do `/uslugi/szkolenia-z-ai-dla-zespolow`.

| # | Temat | Fraza główna | Wolumen | Intencja |
|---|---|---|---|---|
| 9 | Szkolenie z AI dla zespołu: co powinno zawierać | szkolenie ai dla firm | 140 | zakupowa |
| 10 | AI w biznesie: od czego zacząć w małej firmie | szkolenie ai w biznesie | 320 | informacyjna |

---

## Filar 4: AI Act w praktyce

Popyt: `ai act` 3 600, `ai act co to` 320, `ai act po polsku` 140.
Mamy pod ten temat gotowe aktywa, których nie ma żaden konkurent: stronę `/ai-act-checklist`,
rejestr systemów AI i wdrożone oznaczanie treści generowanych.
Artykuły linkują do `/uslugi/zgodnosc-z-ai-act` i do istniejącej checklisty.

| # | Temat | Fraza główna | Wolumen | Intencja |
|---|---|---|---|---|
| 11 | AI Act dla małej firmy: co Cię obowiązuje od sierpnia 2026 | ai act co to | 320 | informacyjna |
| 12 | Jak prowadzić rejestr systemów AI i po co | ai act po polsku | 140 | poradnikowa |

Artykuł dwunasty pokazuje własne rozwiązanie na żywym przykładzie, czyli rejestr działający
na tej witrynie. To jest dokładnie ta wstawka autorska, której nie napisze żaden generator.

---

## Czego świadomie nie ma na liście

**Chatbotów jako tematu głównego.** Fraza `chatbot` ma 9 900 wyszukiwań, ale obok niej stoi
`chatbot gpt` z tą samą liczbą. To ludzie szukający narzędzia do rozmowy, nie wykonawcy.
Warianty zakupowe mają po czterdzieści wyszukiwań. Chatboty wchodzą jako wątek w artykule
pierwszym, przy odróżnieniu agenta od chatbota.

**Automatyzacji faktur.** Dwadzieścia wyszukiwań miesięcznie. Usługa zostaje, temat nie.

**Czegokolwiek lokalnego.** Sprawdzone na pięciu tysiącach fraz wokół Chojnic.
Jedyne trafienie z branży to `informatyk chojnice` z trzydziestoma wyszukiwaniami.

**KSeF.** `ksef od kiedy` ma 33 100 wyszukiwań i jest tematem sąsiadującym z obiegiem dokumentów.
Właściciel odrzucił KSeF jako produkt i tej decyzji nie podważam. Gdyby kiedykolwiek zmienił zdanie
co do samych treści, to jest największy pojedynczy popyt, jaki widzieliśmy poza `n8n`.

---

## Jak automat ma z tego korzystać

Generator czyta ten plik, bierze pierwszy temat bez przypisanego artykułu i zapisuje frazę główną
w kolumnie `target_keyword`. Po opublikowaniu temat dostaje odnośnik do artykułu.
Gdy lista się skończy, kolejne tematy pochodzą z `data/seo/wolumeny.csv`, filtrowanego
przez listę wykluczeń z `docs/seo/keyword-map.md`, sekcja 2.3.

Kadencja: jeden artykuł tygodniowo, każdy przez przegląd redakcyjny.
Dwanaście tematów to kwartał pracy.
