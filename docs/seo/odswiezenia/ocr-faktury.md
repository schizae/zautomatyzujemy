---
slug: automatyzacja-dokumentow-faktur-ai-msp
title: "OCR faktury z AI po wejściu KSeF: kiedy ma jeszcze sens i jak go ustawić"
target_keyword: ocr faktury
excerpt: "OCR faktury z AI po wejściu KSeF: które dokumenty nadal trzeba odczytywać, jak ustawić sprawdzenia kwot i NIP-u, żeby błędy nie trafiały do księgowości."
---

OCR faktury z AI to odczyt danych z pliku PDF albo skanu i zamiana ich na pola: numer, NIP, kwoty, termin płatności. Od 1 kwietnia 2026 faktury od polskich firm przychodzą w większości przez KSeF jako gotowe dane, więc OCR potrzebujesz już głównie do faktur zagranicznych, paragonów i dokumentów papierowych.

## Co zmienił KSeF

Krajowy System e-Faktur wszedł w dwóch etapach. Według [pytań i odpowiedzi Ministerstwa Finansów](https://ksef.podatki.gov.pl/pytania-i-odpowiedzi-ksef-20/):

- od 1 lutego 2026 każdy podatnik odbiera faktury przez KSeF, a wystawiają w nim firmy, których sprzedaż w 2024 roku przekroczyła 200 mln zł,
- od 1 kwietnia 2026 wystawiają w nim pozostali podatnicy,
- do 31 grudnia 2026 poza KSeF mogą wystawiać podatnicy, których sprzedaż udokumentowana fakturami nie przekracza 10 000 zł miesięcznie.

Faktura z KSeF to plik XML o ustalonej strukturze. Numer, NIP i kwoty są w nim osobnymi polami, więc nie ma czego odczytywać. Takie faktury pobiera się przez API systemu wprost do programu księgowego albo arkusza.

## Kiedy odczyt faktur z PDF-ów nadal ma sens

**Faktury od zagranicznych dostawców.** Nie przechodzą przez KSeF i nie trzeba ich do niego raportować. Przychodzą jako PDF w różnych językach i układach, a tu model językowy radzi sobie lepiej niż szablon, który zakłada stałe położenie pól.

**Paragony i rachunki.** Paliwo, hotel, drobne zakupy służbowe. Zwykle zdjęcie z telefonu, często krzywe i słabo oświetlone.

**Faktury od małych sprzedawców do końca 2026 roku.** Podatnik ze sprzedażą do 10 000 zł miesięcznie może jeszcze wystawić fakturę w PDF-ie.

**Dokumenty, które nie są fakturami.** Zamówienia, dowody dostawy, umowy, protokoły odbioru. KSeF ich nie dotyczy, a to z nich często trzeba wyciągnąć numer zamówienia albo datę, żeby dopasować fakturę.

## Jak ustawić odczyt, żeby błędy nie trafiały do księgowości

Sam odczyt to połowa pracy. Druga połowa to sprawdzenia, które wyłapują błędy modelu, zanim ktoś na ich podstawie zrobi przelew.

1. **Rozpoznaj rodzaj pliku.** PDF z warstwą tekstową da się przeczytać bez OCR. Skan albo zdjęcie wymaga rozpoznania znaków. To dwie różne ścieżki i warto je rozdzielić na starcie.
2. **Wyciągaj dane do stałego zestawu pól.** Numer faktury, NIP albo numer VAT sprzedawcy, data wystawienia, kwota netto, VAT, brutto, waluta, termin płatności. Model ma wypełnić pola, a nie streszczać dokument.
3. **Sprawdź kwoty rachunkiem.** Netto plus VAT musi dać brutto, a suma pozycji musi dać netto. To wyłapuje większość pomyłek odczytu bez udziału człowieka.
4. **Sprawdź NIP sumą kontrolną.** Ostatnia cyfra polskiego NIP-u wynika z dziewięciu poprzednich, więc pomyłkę w jednej cyfrze widać od razu. Status sprzedawcy i jego rachunek bankowy potwierdzisz w [wykazie podatników VAT](https://www.podatki.gov.pl/wykaz-podatnikow-vat-wyszukiwarka). Numer VAT kontrahenta z Unii sprawdzisz w systemie [VIES](https://ec.europa.eu/taxation_customs/vies/).
5. **Wyłapuj duplikaty.** Ten sam NIP sprzedawcy i ten sam numer faktury to ta sama faktura, nawet jeśli przyszła drugi raz w innym mailu.
6. **Kieruj wyjątki do człowieka.** Dokument, który nie przeszedł choć jednego sprawdzenia, trafia do księgowej z informacją, które pole się nie zgadza. Reszta idzie dalej sama.

Jak to złożyć z gotowych węzłów, pokazuje drugi przepływ w artykule o [automatyzacjach n8n z AI](/blog/ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n).

## Co dalej z fakturą po odczycie

Odczytane dane to dopiero wejście do procesu. Faktura kosztowa zwykle potrzebuje jeszcze przypisania do zamówienia, akceptacji osoby odpowiedzialnej za budżet i zapisu w systemie księgowym.

Tu OCR przestaje być osobnym narzędziem, a staje się jednym krokiem obiegu, w którym faktury z KSeF i odczytane z PDF-ów trafiają do tej samej ścieżki akceptacji. Taki obieg to zakres usługi [automatyzacja obiegu dokumentów i faktur](/uslugi/automatyzacja-dokumentow-i-faktur). Gdy faktury są tylko jednym z kilku niepołączonych procesów w firmie, szerzej patrzy [automatyzacja procesów biznesowych](/uslugi/automatyzacja-procesow-biznesowych).

## Najczęstsze pytania

**Czy po wejściu KSeF odczytywanie faktur z PDF-ów jest jeszcze potrzebne?**
Tak, ale w mniejszym zakresie. Faktury od polskich firm pobierzesz z KSeF jako dane. OCR zostaje dla faktur zagranicznych, paragonów, faktur od małych sprzedawców do końca 2026 roku i dokumentów, które nie są fakturami.

**Czy darmowy OCR wystarczy?**
Do zamiany skanu na tekst często tak. Darmowe narzędzie zwróci jednak tekst, a nie pola. Przypisanie kwoty do pola „brutto”, a numeru do pola „numer faktury” to osobny krok, który przy różnych układach dokumentów robi model językowy.

**Czy model może się pomylić w kwocie?**
Może, szczególnie na słabym skanie albo w tabeli z wieloma stawkami VAT. Dlatego kwoty sprawdza się rachunkiem, a dokument z niezgodnością idzie do człowieka.

**Czy faktury zagraniczne trzeba wprowadzać do KSeF?**
Nie. Faktur od zagranicznych dostawców nie raportuje się do KSeF, więc zostają poza nim i wymagają osobnej obsługi.

Zanim wybierzesz narzędzie, policz, ile dokumentów miesięcznie nadal przychodzi poza KSeF i jakiego są rodzaju. Od tej liczby zależy, czy potrzebujesz odczytu z AI, czy wystarczy pobieranie faktur z KSeF i prosty [obieg akceptacji dokumentów](/uslugi/automatyzacja-dokumentow-i-faktur).
