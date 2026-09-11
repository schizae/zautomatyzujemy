# Punkt odniesienia — 11 września 2026

Stan przed rozpoczęciem projektu widoczności. Wszystkie kolejne pomiary porównujemy do tych liczb.
Dane z Search Console i pomiary szybkości dostarczył właściciel 11 września 2026.

---

## Search Console

Zakres danych: od 8 sierpnia do 8 września 2026, czyli 32 dni. Wcześniej usługa nie była
zweryfikowana, więc historii po prostu nie ma. Filtr w eksporcie pokazuje szerszy zakres,
ale wiersze zaczynają się dopiero w sierpniu.

| Miara | Wartość |
|---|---|
| Kliknięcia | 6 |
| Wyświetlenia | 51 |
| Średni CTR | 12,77% (dla Polski) |
| Średnia pozycja | 34,06 |
| Dni z jakimkolwiek wyświetleniem | 22 z 32 |
| Kliknięcia na adresy komercyjne | 0, takie adresy nie istnieją |

Trzeba to nazwać wprost: pięćdziesiąt jeden wyświetleń w miesiąc oznacza, że witryna jest
w wyszukiwarce praktycznie niewidoczna. To nie jest zła wiadomość, tylko punkt startu.
Wysoki CTR przy tak małej próbce nic nie znaczy statystycznie.

### Strony z jakimkolwiek ruchem

| Adres | Kliknięcia | Wyświetlenia | Pozycja |
|---|---|---|---|
| strona główna | 6 | 41 | 24,9 |
| `/ai-act-checklist` | 0 | 4 | 56,5 |
| `/case-studies/oszczednosc-czasu-fintech` | 0 | 4 | 92,5 |
| `/blog/nowosci-ai-2026-08-17` | 0 | 2 | 6 |
| `/blog/nowosci-ai-2026-08-24` | 0 | 2 | 6 |
| `/blog/forteca-firmy-ai-cyberbezpieczenstwo-msp` | 0 | 2 | 9 |
| pozostałe cztery adresy | 0 | po 1 | od 5 do 9 |

Cały ruch idzie na stronę główną. Blog generuje pojedyncze wyświetlenia na wysokich pozycjach,
co zwykle oznacza zapytania tak rzadkie, że konkurencji tam po prostu nie ma.

### Zapytania, na które witryna się wyświetla

| Zapytanie | Wyświetlenia | Pozycja |
|---|---|---|
| 4semantics | 6 | 56,17 |
| automatyzacje dla firm | 6 | 78,83 |
| automatyzacja rozliczeń | 4 | 92,5 |
| ai act starter pack | 3 | 72 |
| automatyzacja ai dla firm | 2 | 26 |
| zautomatyzowani | 2 | 35 |
| automatyzacja ai | 1 | 25 |

Trzy obserwacje. Żadne zapytanie nie zawiera nazwy miasta ani województwa, co potwierdza
wniosek z mapy fraz. Zapytania ogólne, czyli „automatyzacja ai" i „automatyzacja ai dla firm",
łapią pozycję w okolicach 25, czyli druga i trzecia strona wyników. To najbliższy cel do ruszenia.
Pozycje w okolicach 80 i 90 oznaczają, że witryna w praktyce nie bierze udziału w wyścigu.

Surowe eksporty leżą w `data/seo/gsc-zapytania-2026-09-11.csv`,
`data/seo/gsc-strony-2026-09-11.csv` i `data/seo/gsc-wykres-2026-09-11.csv`.

---

## PageSpeed Insights, wariant mobilny, 11 września 2026

| Adres | Wydajność | LCP | CLS | TBT | FCP |
|---|---|---|---|---|---|
| strona główna | 60 | **5,0 s** | 0 | 740 ms | 1,0 s |
| `/blog` | 82 | 3,8 s | 0 | 320 ms | 1,2 s |
| artykuł na blogu | 89 | 3,5 s | 0 | 150 ms | 1,2 s |

Pozostałe kategorie: dostępność 91 na stronie głównej i 100 na dwóch pozostałych,
sprawdzone metody 100, 96 i 100, SEO 100 wszędzie.

**Strona główna nie mieści się w progu przyjętym w planie.** Próg to 2,5 sekundy dla LCP,
a strona główna ma dwa razy tyle. Przyczyny wskazane przez narzędzie: 156 KiB nieużywanego
JavaScriptu, 4,1 sekundy pracy głównego wątku, dwie animacje renderowane poza kompozytorem
i siedem długich zadań blokujących wątek.

Konsekwencja dla planu: **nowe strony nie mogą dziedziczyć stosu strony głównej.**
Strony usługowe, kontakt i strona o osobie mają być komponentami serwerowymi bez ciężkich animacji.
Artykuł na blogu z wynikiem 89 pokazuje, że to jest osiągalne w tym projekcie.

Naprawa samej strony głównej to osobna sprawa, poza zakresem obecnych planów. Nie jest pilna,
dopóki na tę stronę wchodzi kilkadziesiąt osób miesięcznie, ale wróci, gdy ruch wzrośnie.

Dostępność strony głównej na 91 ma trzy konkretne przyczyny: niewystarczający kontrast tekstu,
odnośniki odróżnialne wyłącznie kolorem i nagłówki w nieprawidłowej kolejności.
Ostatnia pozycja dotyczy też wyszukiwarki, bo hierarchia nagłówków jest jednym z sygnałów struktury.

To pomiar laboratoryjny. Dane od realnych użytkowników w Search Console pokazują „brak danych",
bo ruch jest za mały, żeby Google je zebrał. Przy tej skali to normalne.

---

## Treść i indeksacja

| Miara | Wartość |
|---|---|
| Adresy w mapie strony | 39 |
| Artykuły na blogu | 30 |
| w tym cotygodniowe przeglądy `nowosci-ai-*` | 18 |
| Studia przypadku | 3, oznaczone jako scenariusze poglądowe |
| Adresy komercyjne | 0 |

Liczba stron zaindeksowanych z raportu indeksowania: do uzupełnienia przy najbliższej okazji.
Nie jest pilna, bo przy 39 adresach i takim ruchu nic z niej jeszcze nie wynika.

---

## Leady

| Miara | Wartość |
|---|---|
| Leady łącznie | 10 |
| z czatu | 5 |
| z checklisty AI Act | 4 |
| z formularza kontaktowego | 1 |
| Zakres dat | 25 kwietnia 2026 do 7 września 2026 |
| Leady z rozpoznanym źródłem wizyty | 0 |

Ostatnia pozycja zmienia się od wdrożenia z 11 września. Każdy nowy lead zapisuje stronę wejścia,
referrera i klasyfikację kanału.
