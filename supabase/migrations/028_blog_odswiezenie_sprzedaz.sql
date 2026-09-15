-- Odświeżenie artykułu ai-w-sprzedazy-i-marketingu-msp-przewaga-konkurencyjna
-- Źródło: docs/seo/odswiezenia/automatyzacja-sprzedazy.md, złożone skryptem scripts/seo/migracja-odswiezenia.mjs.
--
-- Treść jest podmieniana tylko wtedy, gdy w bazie stoi dokładnie ta wersja, z której składano
-- migrację (skrót md5 b509520570aad67436b95341db031d0b). Ponowne uruchomienie po udanym nic nie robi.

DO $$
DECLARE
  obecny_skrot TEXT;
BEGIN
  SELECT md5(content) INTO obecny_skrot FROM posts WHERE slug = 'ai-w-sprzedazy-i-marketingu-msp-przewaga-konkurencyjna';

  IF obecny_skrot IS NULL THEN
    RAISE EXCEPTION 'Brak artykułu ai-w-sprzedazy-i-marketingu-msp-przewaga-konkurencyjna';
  END IF;

  IF obecny_skrot = 'e3815d131e2ba7a76b840ff2d76ceb46' THEN
    RAISE NOTICE 'Artykuł jest już odświeżony';
    RETURN;
  END IF;

  IF obecny_skrot <> 'b509520570aad67436b95341db031d0b' THEN
    RAISE EXCEPTION 'Treść artykułu zmieniła się od złożenia migracji, złóż ją ponownie';
  END IF;

  UPDATE posts SET
    title = $tresc$Automatyzacja sprzedaży w małej firmie: cztery miejsca, w których ucieka klient$tresc$,
    excerpt = $tresc$Automatyzacja sprzedaży w małej firmie bez wielkiego systemu: przyjęcie zapytania, pierwsza odpowiedź, przypomnienia i przygotowanie oferty. Co oddać automatowi, a co zostawić handlowcowi.$tresc$,
    target_keyword = $tresc$automatyzacja sprzedaży$tresc$,
    ai_model = 'claude-opus-5',
    reviewed_at = now(),
    -- Git na Windowsie potrafi zamienić końce linii w pliku migracji, a skrót liczymy z LF.
    content = replace($tresc$Automatyzacja sprzedaży w małej firmie polega na tym, żeby zapytanie klienta samo trafiało do właściwej osoby, a przypomnienia i powtarzalne kroki działy się bez pamiętania o nich. Nie zastępuje rozmowy handlowej, tylko pilnuje, żeby żadne zapytanie nie utknęło po drodze.

## Gdzie w małej firmie ucieka klient

Sprzedaż rzadko przegrywa na etapie negocjacji. Częściej przegrywa wcześniej, w miejscach, których nikt nie mierzy:

1. **Zapytanie leży w skrzynce.** Formularz ze strony trafia na wspólny adres, a każdy zakłada, że odpowie ktoś inny.
2. **Pierwsza odpowiedź przychodzi za późno.** Klient pisał do kilku firm naraz i rozmawia z tą, która odezwała się pierwsza.
3. **Nikt nie wraca po wysłaniu oferty.** Oferta poszła, klient nie odpisał, temat umiera, bo nie było przypomnienia.
4. **Oferta powstaje od zera.** Handlowiec kopiuje poprzedni dokument i ręcznie poprawia dane, co zajmuje czas i rodzi pomyłki.

Każde z tych miejsc da się zautomatyzować osobno. Nie trzeba zaczynać od wdrożenia dużego systemu.

## Miejsce 1 i 2: zapytanie trafia do CRM i dostaje odpowiedź

Formularz na stronie wysyła dane do przepływu, a przepływ robi trzy rzeczy: zakłada kontakt i szansę sprzedaży w CRM, powiadamia osobę odpowiedzialną i wysyła klientowi potwierdzenie, że zapytanie dotarło.

W n8n punktem wejścia jest węzeł Webhook, który według [dokumentacji n8n](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook) przyjmuje dane wysłane z zewnątrz, na przykład z formularza. Dalej węzeł CRM zapisuje kontakt, a węzeł poczty albo Slacka wysyła powiadomienie.

Potwierdzenie dla klienta nie musi udawać handlowca. Wystarczy uczciwa informacja: zapytanie dotarło, kto się odezwie i kiedy. Jeśli klient ma dostać odpowiedź merytoryczną od razu, na przykład o dostępności albo warunkach, potrzebny jest asystent oparty na firmowych dokumentach. Jak taki asystent działa i kiedy przekazuje rozmowę człowiekowi, opisuje artykuł o [automatyzacji obsługi klienta](/blog/automatyzacja-obslugi-klienta-ai-rag-msp).

## Miejsce 3: przypomnienia po wysłaniu oferty

Tu automatyzacja daje najwięcej przy najmniejszym wysiłku. Reguła jest prosta: jeśli szansa sprzedaży stoi na etapie „oferta wysłana” dłużej niż ustalona liczba dni, handlowiec dostaje zadanie, żeby zadzwonić.

Wiele systemów CRM ma to wbudowane. W Pipedrive automatyzacja działa według schematu „jeśli – to”: [zdarzenie, na przykład zmiana etapu szansy, uruchamia akcję](https://support.pipedrive.com/en/article/workflow-automation), taką jak utworzenie zadania, wysłanie maila albo powiadomienie w innej aplikacji. Między zdarzeniem a akcją można dodać warunki i oczekiwanie.

Gdy firma nie ma CRM, tę samą logikę zbudujesz w n8n: węzeł Wait wstrzymuje przepływ na określony czas, a węzeł If sprawdza, czy klient w międzyczasie odpisał.

Jedna zasada: przypomnienie trafia do handlowca, nie do klienta. Automatyczny mail „czy zapoznał się Pan z ofertą?” wysłany trzy razy z rzędu szkodzi bardziej, niż pomaga. Rozmowę po ofercie prowadzi człowiek.

## Miejsce 4: oferta z gotowych danych

Oferta w małej firmie zwykle składa się z tych samych elementów: danych klienta, zakresu, ceny i warunków. Automat może złożyć z nich szkic dokumentu na podstawie tego, co już jest w CRM, a handlowiec sprawdza i uzupełnia to, co wymaga namysłu.

Model językowy przydaje się tu przy opisach, na przykład przy dopasowaniu opisu zakresu do branży klienta. Ceny i warunki nie powinny pochodzić od modelu, tylko z cennika, bo pomyłka w kwocie kosztuje najwięcej. Więcej o tym, gdzie AI pomaga przy ofertach, a gdzie nie, jest w artykule o [ofertach i wycenach z AI](/blog/ai-w-ofertach-i-wycenach-msp-szybka-sprzedaz-wieksze-zyski).

## Czego nie automatyzować

- **Negocjacji i decyzji o rabacie.** To rozmowa, nie przepływ danych.
- **Pierwszego kontaktu udającego człowieka.** Klient, który zorientuje się, że pisał z automatem podpisanym imieniem handlowca, traci zaufanie do całej firmy.
- **Masowych maili do osób, które o nie nie prosiły.** Wysyłka informacji handlowej wymaga podstawy prawnej, więc przed uruchomieniem kampanii sprawdź zgody, a nie tylko listę adresów.

## Od czego zacząć

Zacznij od miejsca, w którym tracisz najwięcej. Najczęściej są to przypomnienia po ofercie, bo wymagają tylko reguły w CRM. Jeśli zapytania giną wcześniej, zacznij od przepływu z formularza do CRM. Każdy z tych kroków to osobna, mała automatyzacja, którą da się uruchomić i sprawdzić, zanim zbudujesz kolejną. Jak takie przepływy składać z gotowych węzłów, pokazuje artykuł o [automatyzacjach n8n z AI](/blog/ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n).

## Najczęstsze pytania

**Czy do automatyzacji sprzedaży potrzebny jest CRM?**
Nie na start. Przepływ z formularza może zapisywać zapytania w arkuszu i wysyłać powiadomienia. CRM staje się potrzebny, gdy chcesz widzieć etapy sprzedaży i ustawiać przypomnienia zależne od etapu.

**Czy automat może sam odpowiadać klientom?**
Może potwierdzić przyjęcie zapytania i odpowiedzieć na pytania, na które odpowiedź jest zapisana w dokumentach firmy. Wycenę, negocjacje i decyzje zostawiasz handlowcowi.

**Ile to kosztuje?**
Zależy od liczby łączonych narzędzi i wyjątków w procesie. Prosty przepływ, na przykład z formularza do CRM z powiadomieniem, to inna skala niż obieg ofert z akceptacjami.

**Czy to się opłaca w firmie z jednym handlowcem?**
Szczególnie tam. Jedna osoba nie ma kogo poprosić o przypomnienie, a każde zapomniane zapytanie to utracony klient.

Przepływ od zapytania do oferty buduję w ramach [automatyzacji procesów biznesowych](/uslugi/automatyzacja-procesow-biznesowych), a gdy pierwszą odpowiedź ma dawać asystent oparty na firmowej wiedzy, w ramach usługi [agenci AI i chatboty](/uslugi/agenci-ai-i-chatboty).
$tresc$, E'\r\n', E'\n')
  WHERE slug = 'ai-w-sprzedazy-i-marketingu-msp-przewaga-konkurencyjna';
END $$;

-- Weryfikacja: tytuł nowy i skrót równy e3815d131e2ba7a76b840ff2d76ceb46.
--
--   SELECT title, target_keyword, md5(content) FROM posts WHERE slug = 'ai-w-sprzedazy-i-marketingu-msp-przewaga-konkurencyjna';
