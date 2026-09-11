# Stan projektu widoczności — punkt kontrolny 11 września 2026

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
| `data/seo/wolumeny.csv` | 15 385 fraz z wolumenami, źródło tematów po wyczerpaniu planu |

---

## Plany i ich stan

| Plan | Zakres | Stan |
|---|---|---|
| 1. Atrybucja leadów i kanoniczny host | scalony, na produkcji | **zrobiony** |
| 2. Strony usługowe, kontakt, o mnie | scalony, PR 21 | **zrobiony** |
| 3. Silnik treści bloga | PR 22, osiem zadań z dziesięciu | **w toku** |
| 4. Automat propozycji postów na LinkedIn i Facebooka | plan nienapisany | **do zrobienia** |

### Co zostało w planie trzecim

**Zadanie 9 — zastosowanie decyzji o artykułach.** Migracja `020_blog_przeglad.sql` jest gotowa
i czeka na uruchomienie przez właściciela. Wyłącza z indeksu osiemnaście przeglądów nowości
i trzy artykuły spoza oferty, przypisuje frazy docelowe pięciu artykułom.

**Zadanie 10 — doszycie odnośników wewnętrznych.** Nie zaczęte. Dziesięć artykułów zostających
w indeksie nie ma ani jednego odnośnika do stron usługowych, więc ruch z nich nie ma dokąd
prowadzić. Do wykonania po uruchomieniu migracji 020.

Uwaga wykonawcza do zadania 10: standard pisarski zabrania wrzucania odnośników w blok na końcu
tekstu. Mają stać tam, gdzie są merytorycznie uzasadnione. Przy czterech artykułach do odświeżenia
odnośniki wchodzą razem z odświeżeniem, przy pozostałych sześciu trzeba przeczytać tekst
i wstawić je w sensownym miejscu.

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

1. Uruchomić migrację `020_blog_przeglad.sql`.
2. Podać widełki cenowe dla trzech usług: automatyzacja procesów, agenci AI, obieg dokumentów.
   Szkolenia mają już cenę: od 2000 zł netto.
3. Po wdrożeniu planu drugiego zgłosić dziesięć nowych adresów do indeksacji w Search Console.
4. Zdobyć trzy realne wdrożenia z prawem do opisu albo uruchomić wariant zapasowy
   z publicznym repozytorium przepływu n8n.

## Pułapki techniczne

- **Serwer MCP Supabase jest tylko do odczytu.** Każdą migrację pisz jako plik i wpisuj
  jej uruchomienie do zadań właściciela wraz z zapytaniem weryfikującym.
- **Publiczne API PageSpeed zwraca 429.** Pomiar wydajności planuj jako ręczny.
- **Nie używaj `git add -A`.** W repozytorium leżą katalogi spoza projektu: `.worktrees`
  należący do Codeksa, `output` i `tmp`. Są w `.gitignore` od 11 września, ale raz już
  wpadły do commita.
- **Heredoc z Pythonem zjada ukośniki.** Przy plikach z wyrażeniami regularnymi używaj
  narzędzia do zapisu plików, nie skryptu w powłoce.
- **Numeracja migracji.** Zajęte do `020` włącznie. Następna wolna to `021`.
