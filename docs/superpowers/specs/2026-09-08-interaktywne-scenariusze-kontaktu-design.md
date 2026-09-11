# Interaktywne scenariusze i wybór kontaktu

Data: 2026-09-08
Status: koncept zaakceptowany w rozmowie; specyfikacja do przeglądu przed planem implementacji.

## Cel i zakres

Pozyskiwanie klientów przez pokazanie rozwiązania ich problemu i płynne przejście do rozmowy. Klara głosowa, chatbot tekstowy i formularz e-mail są równorzędnymi drogami kontaktu. Nie zakładamy, że sama animacja zwiększy konwersję; to hipoteza do sprawdzenia.

Rozwijamy obecną sekcję usług i demonstrację procesu. Nie dodajemy drugiej sekcji o identycznej funkcji. Zachowujemy dostęp do całej oferty, w tym aplikacji, szkoleń i audytów. Cztery potrzeby są wejściem do rozmowy, a nie nową, zamkniętą listą oferowanych usług.

Poza zakresem: zmiana hero, kalkulatora ROI, identyfikacji wizualnej, przebudowa backendu leadów, nowy CRM, wdrożenie na produkcję w ramach samego projektowania.

## Zatwierdzone ustalenia

- Trzy animowane scenariusze: więcej zapytań, sprawniejsza obsługa klientów, odzyskany czas zespołu.
- Czwarta, równie widoczna opcja: „Mam inny pomysł”.
- W czwartej opcji klient najpierw wpisuje pomysł, następnie wybiera Klarę głosową, chatbot tekstowy lub formularz e-mail.
- Opis nie ginie przy zmianie kanału. Samo pisanie i wybieranie scenariusza niczego nie wysyła.
- Zachowujemy obecny styl strony, a pokaz ma prowadzić do zrozumienia oferty i kontaktu.

Poniższe szczegóły wykonawcze doprecyzowują te ustalenia: realistyczne interfejsy z subtelnym metalicznym akcentem, parametry ruchu, walidacja i sposób przekazania kontekstu.

## Układ i treść

Nagłówek: **Zobacz, co możemy usprawnić u Ciebie**.

Podpis: „Wybierz swoją potrzebę lub opowiedz nam o własnym pomyśle”.

Na desktopie cztery przyciski wyboru obok dużej sceny. Na telefonie wybór nad sceną, bez poziomego przewijania. Czwarta opcja ma ten sam rozmiar, kontrast i rangę jak pozostałe. Nie ukrywamy jej w menu ani pod linkiem „więcej”.

Pierwszy scenariusz jest widoczny początkowo. Scena odtwarza się raz po wejściu w obszar widoczny, kolejne po świadomym wyborze. Zmiana scenariusza przerywa poprzednią sekwencję. Podgląd nie blokuje kontaktu.

### 1. Chcę więcej zapytań

Fragmenty oferty układają się w czytelną stronę: nagłówek, prezentacja usługi, przycisk kontaktu. Następnie pojawia się przykładowe zgłoszenie.

Rezultat: „Strona, która jasno przedstawia ofertę i ułatwia kontakt”.

Nie pokazujemy wymyślonych wzrostów sprzedaży, liczników klientów ani gwarancji pozyskania zapytań.

### 2. Chcę sprawniej obsługiwać klientów

Przykładowa wiadomość przechodzi przez uporządkowanie informacji do zgłoszenia i szkicu odpowiedzi. Rozwijamy istniejący pokaz, wykorzystując jego czytelne elementy.

Rezultat: „Zapytania uporządkowane. Odpowiedź przygotowana do sprawdzenia”.

### 3. Chcę odzyskać czas zespołu

Dokumenty i powtarzalne zadania łączą się w uporządkowany proces, zakończony widokiem gotowego zadania w panelu. Ruch pokazuje przepływ informacji, nie wykonuje rzeczywistej automatyzacji.

Rezultat: „Mniej przepisywania. Więcej czasu na właściwą pracę”.

### 4. Mam inny pomysł

Podpis: „Nie widzisz tu swojej potrzeby? Opowiedz nam o niej”.

Elementy sceny odsuwają się i zanikają, odsłaniając pole tekstowe. Etykieta: **Co chciałbyś zmienić lub stworzyć w swojej firmie?**

Tekst pomocniczy: „Wystarczy kilka zdań. Nie musisz znać technologii ani mieć gotowego planu”.

Pole ma widoczną etykietę, zachowuje wpisaną treść i pozwala na jej edycję. Opis: 10–2000 znaków po usunięciu skrajnych spacji, zgodnie z obecnym limitem formularza. Limit i błąd są czytelnie opisane, bez cichego obcinania treści.

Pod polem od początku widać trzy kanały kontaktu. Próba przejścia z niepoprawnym opisem pokazuje błąd przy polu i przenosi do niego fokus.

## Trzy kanały kontaktu

### Porozmawiaj z Klarą — rozmowa głosowa

Kliknięcie rozpoczyna połączenie i proces uzyskania dostępu do mikrofonu. Do nowej rozmowy trafia aktualny opis jako kontekst użytkownika, nie jako instrukcja systemowa. Pokazujemy stan łączenia, możliwość anulowania i stan błędu. Blokujemy wielokrotne uruchomienie równoległych połączeń.

Odmowa mikrofonu lub niedostępność usługi pozostawia opis na miejscu i pozwala przejść do czatu albo e-maila. Przy braku konfiguracji głosu opcja pozostaje wyjaśniona jako niedostępna, zamiast udawać działający przycisk.

Istniejącej aktywnej rozmowy nie restartujemy. Zmiana opisu nie dopisuje automatycznie treści do trwającego połączenia. Użytkownik może zakończyć rozmowę i świadomie rozpocząć nową z aktualnym opisem.

### Przejdź do czatu — rozmowa tekstowa

Otwieramy istniejący chatbot i umieszczamy opis w edytowalnym polu wiadomości. Nie wysyłamy go automatycznie: użytkownik używa przycisku wysłania w czacie. Pomoc pod wyborem: „Otworzymy czat z Twoim opisem. Wyślesz go, gdy będziesz gotowy”.

Istniejąca historia pozostaje zachowana. Jeżeli w czacie jest już inny niewysłany szkic, nie nadpisujemy go: pokazujemy w czacie podgląd przekazanego pomysłu z akcją świadomego użycia zamiast obecnego szkicu. Przekazanie ma jednorazowy identyfikator, aby renderowanie i ponowne otwarcie nie wstawiały duplikatów.

### Napisz do nas — formularz e-mail

Rozwijamy formularz w obrębie tej sekcji. Pokazujemy zachowany, edytowalny opis oraz wymagane obecnie imię i nazwisko, adres e-mail i zgodę. Przycisk „Wyślij zapytanie” dopiero wysyła zgłoszenie przez istniejącą Server Action.

Nie otwieramy programu pocztowego przez mailto. Nie tworzymy drugiego backendu wysyłania. Dane kontaktowe i opis pozostają po błędzie lub przełączeniu kanału; sukces jest pokazany dopiero po potwierdzeniu serwera. Nie zmieniamy istniejących zasad walidacji, ochrony antyspamowej i ograniczania liczby żądań.

### Kontakt z trzech gotowych scenariuszy

Przycisk „Porozmawiajmy o takim rozwiązaniu” odsłania ten sam wybór kanałów. Zamiast wymagać ponownego wpisania potrzeby, pokazuje edytowalny opis zainteresowania, np. „Chcę sprawniej obsługiwać zapytania klientów w mojej firmie”. Nie przekazujemy fikcyjnej treści demonstracji jako danych klienta.

## Styl i ruch

- Obecna typografia, kremowe tło, grafit i czerwień. Metal tylko jako detal; głównym bohaterem są czytelne interfejsy.
- Sekwencja 6–8 sekund: problem → połączenie elementów → rezultat. Bez nieskończonej pętli.
- Ruch głównie przez transform i opacity; cienkie połączenia i czerwony impuls w SVG.
- Przejście pomiędzy scenariuszami 250–400 ms; ujawnienie formularza około 350 ms. Pola i przyciski nie uciekają przed wskaźnikiem.
- Rezerwujemy miejsce sceny, żeby odtwarzanie nie przesuwało reszty strony. Formularz może naturalnie zwiększyć jej wysokość.
- Widoczne sterowanie: pauza/wznowienie, ponowne odtworzenie i możliwość przejścia do końcowego stanu. Kliknięcie kontaktu nie wymaga obejrzenia całego pokazu.
- Zatrzymanie poza viewportem i w nieaktywnej karcie. Przy reduced motion od razu czytelny rezultat, bez parallax i przemieszczania.
- Rzeczywiste etykiety HTML; dekoracyjne SVG ukryte przed czytnikiem ekranu. Animacja nie odczytuje każdej klatki przez aria-live.
- Klawiatura, widoczny fokus, cele dotykowe co najmniej 44 px. Na telefonie brak przypinania sceny do przewijania.
- Oznaczenie trzech pokazów: „Demonstracja — przykładowy przebieg”. Nie nazywamy ich realizacjami dla klientów.

## Zweryfikowany stan kodu i granice integracji

Sprawdzono lokalny kod podczas przygotowania dokumentu:

| Miejsce | Obecne zachowanie | Potrzebna zmiana |
|---|---|---|
| `components/marketing/services-section.tsx` | Lista usług, wybór, panel demonstracji | Cztery wejścia według potrzeb i zachowanie dostępu do pełnej oferty |
| `components/marketing/automation-flow.tsx`, `service-flow-map.tsx` | Demonstracja i mapa procesu | Wykorzystanie elementów w nowych scenach, bez podwójnego pokazu |
| `components/voice/klara-provider.tsx` | Wspólny stan głosu i otwarcia widgetu | Jawne przekazanie szkicu do czatu, bez globalnych zdarzeń DOM |
| `components/voice/use-voice-call.ts` | `start()` bez argumentu; token i `instance.start(assistantId)` | Zweryfikowane przekazanie kontekstu do asystenta |
| `components/chat/chat-widget.tsx` | Własny input i historia useChat | Jednorazowe odebranie szkicu, bez automatycznego wysyłania |
| `components/marketing/contact-form.tsx` | Formularz z własnym stanem | Możliwość użycia w sekcji z zachowaniem szkicu i unikalnych ID |
| `lib/actions/contact.actions.ts` | Walidacja, zapis leada i powiadomienie | Ponowne użycie istniejącego kontraktu |

**Warunek integracji głosowej:** repo nie potwierdza obecnie obsługi kontekstu przez serwer GŁOS. Przed implementacją tego fragmentu należy sprawdzić zainstalowane typy SDK i kontrakt serwera wydającego token. Nie wolno zgadywać dodatkowych parametrów `start`, dopisywać nieobsługiwanych pól token endpointu ani osłabiać ograniczeń tokenu. Jeżeli potrzebna jest zmiana po stronie GŁOS, należy ją wyraźnie uwzględnić w planie i zweryfikować osobno. Do tego czasu nie można uznać całej ścieżki głosowej z opisem za gotową.

Stan wyboru, opisu i kanału jest lokalny dla sekcji. Niewysłany pomysł pozostaje w pamięci podczas bieżącej wizyty, także po przełączeniu scenariusza. Nie zapisujemy go do URL, localStorage ani analityki. Odświeżenie strony może go wyczyścić. Formularz zachowuje szkic mimo zamknięcia swojej części; nie polegamy na stanie odmontowywanego komponentu.

Stos: istniejący React/TypeScript, Tailwind, Framer Motion, SVG. Bez nowych zależności. Szczegółowy podział plików i API wewnętrznych należy do planu implementacji.

## Pomiar

Oddzielamy zainteresowanie od pozyskania klienta. Wybór scenariusza, obejrzenie animacji i otwarcie kanału są zdarzeniami pomocniczymi. Główne wyniki to zapisane zapytania i późniejsza ocena ich jakości oraz umówione rozmowy.

W istniejącym mechanizmie analityki, jeśli obsługuje takie zdarzenia, rejestrujemy wyłącznie identyfikator scenariusza i kanału oraz etap: wybór, otwarcie, potwierdzony kontakt. Nie wysyłamy opisów, nazwisk, adresów ani transkrypcji do analityki. Otwarcie widgetu nie jest leadem, a aktywne połączenie nie jest automatycznie umówioną konsultacją.

Przed publikacją utrwalamy dostępny poziom odniesienia. Porównujemy udział wartościowych zapytań przy uwzględnieniu źródeł ruchu; nie obiecujemy procentowego wzrostu bez danych.

## Kryteria odbioru

- [ ] Cztery opcje są widoczne na desktopie i telefonie; pełna oferta pozostaje dostępna.
- [ ] Każda z trzech scen ma czytelny rezultat, pauzę, replay i kontakt dostępny od początku.
- [ ] Czwarta opcja pozwala wpisać pomysł i wybrać głos, czat albo e-mail.
- [ ] Opis i dane formularza nie giną przy zmianie scenariusza, kanału ani błędzie.
- [ ] Samo wpisanie opisu nie uruchamia żądań czatu, mikrofonu ani wysyłki formularza.
- [ ] Czat odbiera szkic raz, nie kasuje historii i chroni istniejącą niewysłaną wiadomość.
- [ ] Kontekst nowej rozmowy głosowej jest potwierdzony testem integracji, a nie samym otwarciem mikrofonu.
- [ ] Błąd głosu i odmowa mikrofonu pozostawiają działające alternatywy.
- [ ] E-mail używa istniejącej walidacji i backendu, zapobiega wielokrotnemu wysłaniu podczas oczekiwania i zachowuje dane po błędzie.
- [ ] Brak poziomego overflow przy 375, 768 i 1440 px oraz utraty użyteczności przy powiększeniu 200%.
- [ ] Klawiatura, fokus, reduced motion i zatrzymanie animacji poza ekranem działają.
- [ ] Testy nie wysyłają prawdziwych leadów i nie uruchamiają płatnych rozmów bez uzgodnionego środowiska testowego.
- [ ] `npm run type-check`, `npm run lint`, `npm run build` oraz testy istotnych przepływów przechodzą po implementacji.

## Kolejność dalszej pracy

1. Przegląd tego dokumentu przez właściciela.
2. Plan implementacji, zaczynający od weryfikacji przekazania kontekstu do głosu.
3. Budowa scen i trzech kanałów z zachowaniem jednego opisu.
4. Weryfikacja wizualna, dostępności i integracji.
5. Podgląd gotowego rozwiązania i osobne rozstrzygnięcie publikacji.
