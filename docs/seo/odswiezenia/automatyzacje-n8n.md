---
slug: ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n
title: "Automatyzacje n8n z AI w małej firmie: trzy przepływy krok po kroku"
target_keyword: automatyzacje n8n
excerpt: "Trzy automatyzacje n8n z AI dla małej firmy rozpisane na węzły: rozdzielanie wiadomości z formularza, odczyt faktur z maila i szkice odpowiedzi zatwierdzane przez człowieka."
---

Automatyzacje n8n z AI to przepływy, w których n8n przenosi dane między systemami, a model językowy wykonuje jeden krok wymagający zrozumienia treści: klasyfikuje wiadomość, wyciąga dane z dokumentu albo szkicuje odpowiedź. Poniżej znajdziesz trzy takie przepływy dla małej firmy, rozpisane na konkretne węzły, razem z tym, co zrobić, gdy coś się zepsuje.

## Zasada, na której stoją wszystkie trzy przepływy

Model językowy nie steruje całym procesem. Dostaje jedno zadanie w środku przepływu, a resztę robią zwykłe węzły, które za każdym razem działają tak samo.

Schemat ma cztery części:

1. **Wyzwalacz**, czyli zdarzenie, które uruchamia przepływ: nowy mail, wysłany formularz, godzina w harmonogramie.
2. **Krok modelu**, czyli jedno zadanie wymagające zrozumienia tekstu.
3. **Sprawdzenie**, czyli węzeł If albo Switch, który weryfikuje wynik modelu, zanim cokolwiek zostanie zapisane lub wysłane.
4. **Zapis albo przekazanie człowiekowi**, zależnie od wyniku sprawdzenia.

Takie rozłożenie ma praktyczny powód. Kiedy przepływ zrobi coś źle, od razu widzisz, na którym węźle. Model odpowiada tylko za wąski fragment, który łatwo przetestować. To ta sama logika, na której opiera się [automatyzacja procesów biznesowych](/uslugi/automatyzacja-procesow-biznesowych) bez udziału AI: dane płyną same, a człowiek wchodzi tam, gdzie jest potrzebny.

## Przepływ 1: wiadomość z formularza trafia do właściwej osoby

Formularz kontaktowy wysyła wszystko na jedną skrzynkę. Zapytanie o ofertę leży obok reklamacji i faktury do wyjaśnienia, a ktoś codziennie to rozdziela.

Przepływ ma pięć węzłów:

1. **Webhook** odbiera dane z formularza na stronie.
2. **Respond to Webhook** od razu odsyła formularzowi potwierdzenie, żeby osoba po drugiej stronie nie czekała na resztę przepływu.
3. **Text Classifier** przypisuje wiadomość do jednej z kategorii: oferta, reklamacja, faktura, inne. Każdą kategorię opisujesz zdaniem, na przykład „reklamacja: klient zgłasza wadę albo opóźnienie zamówienia”.
4. **Switch** kieruje wiadomość według kategorii.
5. **Slack** albo **Gmail** wysyła ją do osoby, która się tym zajmuje.

Kategoria „inne” jest obowiązkowa. Bez niej model musi wcisnąć każdą wiadomość w którąś z pozostałych, a spam i pomyłki trafiają do sprzedaży. Wiadomości z tej kategorii idą do jednej osoby, która rozdziela je ręcznie.

## Przepływ 2: dane z faktury w mailu lądują w arkuszu

Faktury przychodzą jako załączniki PDF, a ktoś przepisuje z nich numer, NIP i kwoty do arkusza albo systemu księgowego.

Przepływ ma sześć węzłów:

1. **Gmail Trigger** reaguje na nowy mail z załącznikiem na skrzynce z fakturami.
2. **Extract From File** wyciąga tekst z PDF-u. Radzi sobie z plikami, które mają warstwę tekstową. Skan zapisany jako obraz trzeba najpierw przepuścić przez OCR.
3. **Information Extractor** zamienia tekst na pola: numer faktury, NIP sprzedawcy, kwota netto, VAT, kwota brutto, termin płatności.
4. **If** sprawdza wynik rachunkiem, nie modelem: czy NIP ma dziesięć cyfr i czy netto plus VAT daje brutto.
5. **Google Sheets** zapisuje fakturę, która przeszła sprawdzenie.
6. **Gmail** wysyła fakturę, która nie przeszła, do księgowej z informacją, które pole się nie zgadza.

Czwarty węzeł jest najważniejszy. Model potrafi źle odczytać kwotę z tabeli, a sprawdzenie arytmetyczne wyłapuje to bez udziału człowieka. Gdzie przy dokumentach AI pomaga, a gdzie nie, opisuje artykuł o [automatyzacji dokumentów i faktur](/blog/automatyzacja-dokumentow-faktur-ai-msp). Pełny obieg z akceptacjami i połączeniem z systemem księgowym to już [automatyzacja obiegu dokumentów i faktur](/uslugi/automatyzacja-dokumentow-i-faktur).

## Przepływ 3: szkic odpowiedzi dla klienta, zatwierdzany przez człowieka

Klienci pytają mailem o rzeczy opisane w regulaminie, cenniku albo instrukcji, a odpowiedź i tak zajmuje komuś kwadrans.

Przepływ ma pięć elementów:

1. **Gmail Trigger** reaguje na mail na skrzynce obsługi klienta.
2. **AI Agent** dostaje treść pytania i narzędzie do przeszukiwania firmowych dokumentów.
3. **Vector Store Question Answer Tool**, podłączony do agenta, wyszukuje fragmenty dokumentów pasujące do pytania. Dokumenty trzeba wcześniej zaindeksować osobnym przepływem.
4. Agent pisze szkic odpowiedzi na podstawie znalezionych fragmentów.
5. **Slack** z operacją Send and Wait for Response wysyła szkic pracownikowi. Mail do klienta wychodzi dopiero po zatwierdzeniu.

Piąty krok to świadoma decyzja. Dokumentacja n8n zaleca [zatwierdzanie przez człowieka](https://docs.n8n.io/build/integrate-ai/ai-examples/human-in-the-loop-for-tools) przy działaniach, których nie da się cofnąć, a wysłany mail do klienta do nich należy. Gdy przez kilka tygodni szkice są dobre, możesz zdjąć zatwierdzanie z najprostszych kategorii pytań.

Jak przygotować dokumenty, żeby wyszukiwanie trafiało we właściwe fragmenty, opisuje artykuł o [firmowej bazie wiedzy z AI](/blog/ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp). Gdy asystent ma rozmawiać z klientem bezpośrednio, na stronie albo w komunikatorze, to zakres [agentów AI i chatbotów](/uslugi/agenci-ai-i-chatboty).

## Zanim przepływ ruszy na dobre

Trzy rzeczy decydują o tym, czy automatyzacja przetrwa pierwszy miesiąc.

**Przepływ błędów.** W ustawieniach przepływu wskazujesz osobny przepływ, który zaczyna się od węzła Error Trigger i uruchamia przy nieudanym wykonaniu. Według [dokumentacji obsługi błędów](https://docs.n8n.io/build/flow-logic/handle-errors-gracefully) jeden taki przepływ może obsługiwać wiele innych. Wystarczy, że wyśle na Slacka nazwę przepływu i odnośnik do wykonania, które się nie udało. Automatyzacja, która przestaje działać po cichu, jest gorsza od jej braku.

**Dokąd trafiają dane.** n8n możesz uruchomić na własnym serwerze, ale krok modelu i tak wysyła fragment tekstu do dostawcy, jeśli korzystasz z jego API. Faktura z danymi kontrahenta albo mail klienta opuszcza wtedy firmę. To trzeba wiedzieć przed wdrożeniem, nie po.

**Kto będzie to rozwijał.** Edytor n8n jest wizualny. Prostą zmianę, na przykład nową kategorię w klasyfikatorze, zrobi osoba bez doświadczenia programistycznego. Serwer, aktualizacje i węzeł Code wymagają już kogoś technicznego. Jeśli przepływy ma utrzymywać Twój zespół, zacznij od [szkolenia z AI dla zespołu](/uslugi/szkolenia-z-ai-dla-zespolow).

## Najczęstsze pytania

**Czy n8n jest darmowy?**
Wersja Community uruchamiana na własnym serwerze jest darmowa i ma prawie pełny zestaw funkcji. Płatne są n8n Cloud oraz plany Business i Enterprise z funkcjami takimi jak logowanie SSO czy kontrola wersji w Git. Warianty porównuje strona [wyboru sposobu korzystania z n8n](https://docs.n8n.io/choose-how-to-use-n8n).

**Czy mogę używać darmowego n8n w firmie?**
Tak, do wewnętrznych potrzeb firmy. [Licencja Sustainable Use](https://docs.n8n.io/n8n-community-license/sustainable-use-license) pozwala synchronizować dane firmy i zlecić budowę przepływów zewnętrznemu wykonawcy. Zabrania odsprzedawania dostępu do n8n, na przykład hostowania go i pobierania za to opłat.

**n8n czy Make?**
Oba narzędzia budują przepływy w edytorze wizualnym. Make działa wyłącznie w chmurze producenta. n8n postawisz na własnym serwerze, a przy bardziej złożonej logice dopiszesz fragment kodu w węźle Code. Jeśli w firmie nie ma nikogo technicznego, a przepływy są proste, Make bywa szybszy na start.

**Od czego zacząć?**
Od jednego procesu, który ktoś wykonuje ręcznie co tydzień, i policzenia, ile zajmuje. Najlepszy kandydat ma jasne wejście, na przykład mail albo formularz, i jasny wynik, na przykład wiersz w arkuszu. Jeśli nie wiesz, który proces wybrać, pomoże [audyt procesów pod kątem AI](/uslugi/audyt-i-doradztwo-ai).

Każdy z tych przepływów zaczyna się od tej samej pracy: rozpisania procesu na wejście, jeden krok modelu, sprawdzenie i wynik. Od tego zaczyna się też [wdrożenie automatyzacji procesów](/uslugi/automatyzacja-procesow-biznesowych), zanim powstanie pierwszy węzeł.
