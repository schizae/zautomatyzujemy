# Uwagi do planu widoczności zautomatyzujemy.pl

Data: 2026-09-10  
Dokument oceniany: `planseofinal.md`  
Zakres: recenzja planu, z uwzględnieniem późniejszej prośby właściciela o zachowanie automatycznego zbierania materiałów. To nie jest raport z ponownego audytu kodu, produkcji ani bazy danych.

## Ocena ogólna

Około **7/10**: dobry kierunek biznesowy, ale kilka założeń wymaga korekty przed wdrożeniem. Największą wartość mają strony usługowe, ceny, dowody kompetencji i pomiar zapytań. Plan zbyt kategorycznie opisuje zasady Google i nadmiernie rozbudowuje kontrolę automatycznie tworzonych artykułów.

**Automatyczne zbieranie treści należy zachować.** Zastrzeżenia dotyczą sposobu oceny jakości i automatycznego publikowania, a nie automatyzacji researchu.

## 1. Doprecyzowanie: automat ma zbierać materiały

Właściciel chce, aby automat zbierał treści. Przyjmuję, że oznacza to pozyskiwanie materiałów, tematów i źródeł przydatnych do bloga oraz oferty. Ta prośba nie przesądza jeszcze o publikacji bez zatwierdzenia.

Rekomendowany podział odpowiedzialności:

| Etap | Rola automatu | Rola właściciela |
|---|---|---|
| Zbieranie | Wyszukiwanie materiałów z wybranych źródeł, dokumentacji, aktualizacji i RSS, jeśli dostępne | Wskazanie obszarów zainteresowania |
| Selekcja | Odrzucanie powtórzonych adresów i materiałów niezwiązanych z ofertą | Okresowa ocena trafności |
| Opracowanie | Krótkie streszczenie, link, data, propozycja zastosowania biznesowego | Wybór wartościowych tematów |
| Szkic | Opcjonalne przygotowanie artykułu na podstawie zebranych materiałów | Weryfikacja faktów, uzupełnienie doświadczeniem |
| Publikacja | Obsługa techniczna po zatwierdzeniu | Decyzja o publikacji w rekomendowanym trybie redakcyjnym |

Każdy zebrany materiał powinien zachowywać co najmniej tytuł, adres źródła, datę pobrania, datę publikacji, jeśli jest dostępna, oraz krótkie streszczenie. Warto dodać informację, której usługi lub problemu klienta dotyczy.

Istotna jest różnica między streszczeniem przeczytanego materiału a propozycją modelu: automat powinien je rozróżniać. Nie powinien traktować niepobranego źródła jako zweryfikowanego ani przedstawiać cudzych wyników jako własnych realizacji.

Na początek wystarczy lista wybranych źródeł, eliminacja duplikatów po URL i jeden zbiorczy przegląd materiałów tygodniowo. Nie ma potrzeby budowania od razu osobnego panelu ani embeddingowej oceny każdego materiału. Miejsce zapisu należy dobrać po sprawdzeniu obecnego mechanizmu bloga.

**Proponowana korekta planu:** rozdzielić Fazę 2 na zbieranie materiałów, przygotowanie szkiców i publikację. Zachować automat zbierający nawet przy ograniczeniu liczby publikowanych artykułów. Zebrany materiał nie musi automatycznie stawać się wpisem.

## 2. Co warto zachować

- Strony usługowe, cennik i formularze jako priorytet przed zwiększaniem liczby artykułów.
- Wykorzystanie istniejącej pracy nad usługami, po sprawdzeniu jej aktualności i jakości.
- Uczciwe oddzielenie scenariuszy poglądowych od realizacji dla klientów.
- Mapę fraz w pliku i pomiar w prostym arkuszu zamiast rozbudowanego panelu SEO.
- Linkowanie istniejących artykułów do właściwych usług.
- Uwzględnienie edycji oferty w panelu i aktualizacji wiedzy chatbota.
- Równoległe zdobywanie klientów przez relacje, społeczności i LinkedIn.

## 3. Najważniejsze poprawki merytoryczne

### 3.1. Google Business Profile: rejestracja firmy nie wystarcza

Podział „zarejestrowana działalność = GBP, brak rejestracji = brak GBP” jest zbyt uproszczony. Google wymaga przede wszystkim rzeczywistego kontaktu z klientami osobiście. Działalność wyłącznie internetowa nie kwalifikuje się. Sama rejestracja firmy nie zapewnia kwalifikacji ani weryfikacji profilu.

Plan powinien uzależniać tę ścieżkę od rzeczywistego sposobu świadczenia usług i spełnienia zasad GBP. To nie jest ocena prawnych wymogów prowadzenia działalności.

Źródło: [Google — Business eligibility and ownership guidelines](https://support.google.com/business/answer/13763036?hl=en).

### 3.2. Ręczny akapit nie gwarantuje zgodności z polityką Google

Dwa artykuły AI tygodniowo nie oznaczają automatycznie skalowanego nadużycia. Dodanie własnego akapitu nie daje automatycznie ochrony. Google ocenia cel produkcji oraz wartość treści niezależnie od tego, czy powstaje ona ręcznie, automatycznie czy w modelu mieszanym.

W punkcie 2.4 należy usunąć stwierdzenie, że 30 minut pracy i wstawka autorska są „ceną” za uniknięcie tej kwalifikacji. Ręczny przegląd powinien obejmować prawdziwość i przydatność całego tekstu. Własne przykłady są wartościowym wkładem, ale nie formalną przepustką.

Źródło: [Google — Spam policies, Scaled content abuse](https://developers.google.com/search/docs/essentials/spam-policies).

### 3.3. Plan jest sprzeczny w sprawie zatwierdzania

Punkt 2.4 wymaga udziału człowieka w każdym tekście. Punkt 2.6 dopuszcza automatyczną publikację po przejściu bramki, która nie sprawdza tego udziału.

Zalecenie: automat zbiera materiały i może przygotowywać szkice; publikacja w rekomendowanym trybie następuje po przeglądzie. Jeśli pozostaje opcja publikacji automatycznej, trzeba jasno opisać, że jest to odmienny tryb redakcyjny, bez gwarancji ludzkiego przeglądu. Sam wynik bramki technicznej nie jest zatwierdzeniem merytorycznym.

### 3.4. Zero wyświetleń nie wystarcza do ustawienia noindex

Reguła „zero wyświetleń = noindex, jakiekolwiek wyświetlenie = zostawić” jest zbyt mechaniczna. Przed decyzją trzeba uwzględnić wiek tekstu, stan indeksacji, przydatność, linkowanie i potencjał aktualizacji. Brak przypisanej frazy również nie dowodzi braku wartości.

Przy 30 artykułach rozsądniejszy będzie ręczny przegląd: zostawić, poprawić, połączyć albo wyłączyć z indeksu. Noindex jest uzasadnioną opcją dla nieprzydatnych archiwalnych briefów, ale wymaga oceny treści.

Źródło: [Google — Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

### 3.5. Atrybucja musi rozróżniać źródło i stronę wejścia

Landing path nie dowodzi pozyskania leada z SEO. Wejście na artykuł może pochodzić z LinkedIna, wiadomości lub zakładki. Końcowy miernik planu powinien łączyć źródło wejścia ze stroną i kwalifikacją zapytania.

Docelowy łańcuch pomiaru: **źródło → strona wejścia → kwalifikowane zapytanie → sprzedaż**.

SessionStorage daje pomiar wejścia w obrębie sesji karty, nie pierwszej wizyty klienta w całej historii. To akceptowalne minimum, jeśli ograniczenie jest opisane. Trzeba też przewidzieć kategorię „źródło nieznane”; brak referrera nie dowodzi konkretnego kanału.

Cel „wszystkie nowe leady mają landing_path” jest niespójny z dopuszczeniem braku danych. Lepiej mierzyć odsetek uzupełnienia i poprawne działanie formularzy również bez atrybucji.

## 4. Priorytety biznesowe

### 4.1. Dowód kompetencji od początku

Nie czekałbym kwartału na opis własnego wdrożenia. Chatbot, automat zbierający materiały lub workflow mogą już teraz pokazać sposób pracy.

Opis powinien przedstawiać problem, rozwiązanie, demonstrację, ograniczenia i rzeczywiste wyniki, jeśli zostały zmierzone. Repozytorium może być dodatkiem, ale klient powinien zrozumieć wartość bez czytania kodu.

### 4.2. Prognozy oznaczyć jako hipotezy

Horyzont 6–12 miesięcy, cel +8 fraz w Top 10 i 30 kliknięć miesięcznie są założeniami planistycznymi. Dokument nie przedstawia danych wystarczających, by traktować je jako prognozę.

Podobnie twierdzenie, że frazy cenowe są jedynymi możliwymi do wygrania, wymaga sprawdzenia konkurencji. Cennik jest dobrym pomysłem sprzedażowym niezależnie od tego, czy okaże się łatwym celem SEO.

Ocena 62/100 potrzebuje metody i wag albo powinna pozostać oceną jakościową. Moje 7/10 również jest oceną recenzencką, nie pomiarem.

### 4.3. Gotowe treści nadal wymagają przeglądu

Istnienie siedmiu tekstów w migracji uzasadnia ich wykorzystanie, ale nie automatycznie publikację bez oceny. Każda strona powinna jasno wyjaśniać usługę, odbiorcę i następny krok. Gotowość techniczna i gotowość treści to osobne warunki.

## 5. Uproszczenie kontroli jakości bez usuwania automatu

Przy jednym artykule tygodniowo embeddingowe porównywanie tytułów i konspektów można odłożyć. Podobieństwo tematyczne nie rozstrzyga, czy teksty odpowiadają na tę samą potrzebę.

Na początek warto automatycznie sprawdzać:

- powtórzone adresy zebranych źródeł;
- kompletność metadanych materiału;
- istnienie linków wewnętrznych;
- dostępność źródeł, z rozróżnieniem błędu chwilowego i brakującej strony;
- poprawny zapis szkicu oraz brak przypadkowej publikacji.

Człowiek ocenia zgodność twierdzeń ze źródłami, użyteczność i odrębność tematu. Dwa linki zewnętrzne same w sobie nie dowodzą prawdziwości tekstu. Wymagana liczba linków do usług nie powinna wymuszać niepasujących odnośników.

Zamiast „trzy teksty przechodzą bramkę bez poprawek” lepiej sprawdzać, czy automat dostarcza przydatne materiały, pozwala prześledzić źródła i oszczędza czas redakcyjny. Jakość gotowego artykułu nadal podlega przeglądowi.

## 6. Dodatkowe korekty

### Wydajność

Próg LCP 2,5 s jest sensowny, ale pojedynczy wynik laboratoryjny PSI nie jest tym samym co ocena rzeczywistych użytkowników w 75. percentylu. Należy określić powtarzalny sposób pomiaru przed wdrożeniem i osobno późniejszy pomiar terenowy, gdy dostępne będą dane.

Źródła: [LCP](https://web.dev/articles/lcp?hl=en), [różnice między pomiarami laboratoryjnymi i terenowymi](https://web.dev/articles/lab-and-field-data-differences?hl=en).

### FAQ

Opis dostępności wyników rozszerzonych FAQ jest nieaktualny: Google wycofało tę funkcję od 7 maja 2026 r. FAQ może być przydatne czytelnikowi; nie należy uzasadniać obowiązkowego schematu oczekiwanym wynikiem rozszerzonym ani gwarancją cytowania przez AI.

Źródło: [Google — aktualizacje dokumentacji](https://developers.google.com/search/updates).

### Autorstwo

Nie przypisywać automatycznie wszystkich starych tekstów konkretnej osobie bez rzeczywistego przeglądu i przyjęcia odpowiedzialności za treść. Dane autora powinny odzwierciedlać faktyczny udział.

### Harmonogram

Nagłówek Fazy 1 i końcowa tabela podają różne zakresy czasu. Trzeba ujednolicić liczby oraz oddzielić nakład pracy od czasu kalendarzowego przy zadaniach równoległych. Czas potrzebny na zebranie materiałów, napisanie treści i zatwierdzenie oferty powinien być widoczny w harmonogramie.

## 7. Zalecana kolejność

1. Ustalić minimum pomiaru źródeł i kwalifikowanych zapytań.
2. Uruchomić lub zachować automatyczne zbieranie materiałów, bez uzależniania tego od rozbudowanej bramki SEO.
3. Dopracować najważniejsze usługi, ceny, kontakt i jeden wiarygodny przykład działania.
4. Podłączyć istniejące wartościowe artykuły do oferty i ocenić pozostałe teksty.
5. Z zebranych materiałów wybierać tematy, przygotowywać szkice i publikować po przeglądzie.
6. Rozbudować kontrolę automatyczną dopiero wtedy, gdy powtórzenia lub nakład ręcznej pracy staną się mierzalnym problemem.

**Rekomendacja końcowa:** zachować automat jako narzędzie regularnego zbierania wiedzy i przygotowania materiałów. Równolegle priorytetowo poprawić ofertę, dowody kompetencji i pomiar sprzedażowy. Automatyzacja researchu ma sens już teraz; rozbudowany system automatycznej oceny artykułów nie musi być warunkiem startu.
