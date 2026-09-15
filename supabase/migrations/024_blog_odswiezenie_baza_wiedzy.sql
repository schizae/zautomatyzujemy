-- Odświeżenie artykułu ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp
-- Źródło: docs/seo/odswiezenia/baza-wiedzy-ai.md, złożone skryptem scripts/seo/migracja-odswiezenia.mjs.
--
-- Treść jest podmieniana tylko wtedy, gdy w bazie stoi dokładnie ta wersja, z której składano
-- migrację (skrót md5 1bfb58fac432c592d93e96700d45c49c). Ponowne uruchomienie po udanym nic nie robi.

DO $$
DECLARE
  obecny_skrot TEXT;
BEGIN
  SELECT md5(content) INTO obecny_skrot FROM posts WHERE slug = 'ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp';

  IF obecny_skrot IS NULL THEN
    RAISE EXCEPTION 'Brak artykułu ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp';
  END IF;

  IF obecny_skrot = 'dac1c7a7307e314adda06acd16201d49' THEN
    RAISE NOTICE 'Artykuł jest już odświeżony';
    RETURN;
  END IF;

  IF obecny_skrot <> '1bfb58fac432c592d93e96700d45c49c' THEN
    RAISE EXCEPTION 'Treść artykułu zmieniła się od złożenia migracji, złóż ją ponownie';
  END IF;

  UPDATE posts SET
    title = $tresc$Baza wiedzy AI w firmie: jak działa i jak ją zbudować bez zgadywania$tresc$,
    excerpt = $tresc$Jak działa baza wiedzy AI, na liczbach z działającego wdrożenia: wielkość fragmentów, model embeddingów, zmierzony próg dopasowania i trzy rzeczy, które psują odpowiedzi.$tresc$,
    target_keyword = $tresc$baza wiedzy ai$tresc$,
    ai_model = 'claude-opus-5',
    reviewed_at = now(),
    -- Git na Windowsie potrafi zamienić końce linii w pliku migracji, a skrót liczymy z LF.
    content = replace($tresc$Baza wiedzy AI to zbiór firmowych dokumentów podzielonych na fragmenty i zapisanych tak, żeby model językowy znalazł te, które odpowiadają na pytanie, i odpowiedział na ich podstawie. Działa dobrze pod trzema warunkami: dokumenty są aktualne, fragmenty mają sensowną wielkość, a próg dopasowania jest zmierzony, nie zgadnięty.

## Jak baza wiedzy odpowiada na pytanie

Model językowy nie uczy się Twoich dokumentów. Dostaje je w chwili pytania, w czterech krokach:

1. **Podział na fragmenty.** Dokumenty są cięte na kawałki po kilkaset znaków, z niewielką zakładką, żeby zdanie przecięte na granicy nie zgubiło sensu.
2. **Zapis znaczenia.** Każdy fragment trafia do modelu embeddingów, który zamienia go na wektor, czyli listę liczb opisującą znaczenie. Wektory leżą w bazie danych, na przykład w PostgreSQL z rozszerzeniem pgvector, które opisuje [dokumentacja Supabase](https://supabase.com/docs/guides/ai/vector-columns).
3. **Wyszukanie.** Pytanie też zamienia się na wektor, a baza zwraca kilka fragmentów o najbliższym znaczeniu, o ile przekraczają ustalony próg podobieństwa.
4. **Odpowiedź.** Model językowy dostaje pytanie razem ze znalezionymi fragmentami i instrukcję, żeby odpowiadał wyłącznie na ich podstawie.

Zmiana w dokumencie zmienia więc odpowiedź bez trenowania czegokolwiek. Wystarczy ponownie przeliczyć wektory zmienionych fragmentów.

## Liczby z działającego wdrożenia

Chatbot na tej stronie działa dokładnie według tego schematu, więc zamiast przykładu z wyobraźni masz tu jego ustawienia.

- **Źródła:** artykuły z bloga, opisy usług, pytania i odpowiedzi oraz treści stron, wszystko publiczne.
- **Fragmenty:** po 500 znaków z zakładką 50 znaków.
- **Model embeddingów:** `gemini-embedding-001` w 768 wymiarach. Model domyślnie zwraca 3072, a [dokumentacja Google](https://ai.google.dev/gemini-api/docs/embeddings) zaleca 768, 1536 albo 3072. Mniejszy wektor zajmuje mniej miejsca i szybciej się porównuje.
- **Wyszukanie:** pięć najbliższych fragmentów powyżej progu 0,6.
- **Odświeżanie:** automatyczne, raz w tygodniu, po publikacji nowych treści.

Próg 0,6 nie wziął się z poradnika. Pomiar na bazie 321 fragmentów pokazał, że trafne fragmenty dostają od 0,65 do 0,73. Przy często polecanym progu 0,7 odpadała odpowiedź o przebiegu współpracy, która miała 0,679. Klient pytający, jak wygląda współpraca, dostałby wtedy „nie wiem”, choć odpowiedź była w bazie.

Takiego asystenta dla klientów albo zespołu buduję w ramach usługi [agenci AI i chatboty](/uslugi/agenci-ai-i-chatboty).

## Trzy rzeczy, które psują odpowiedzi

**Dwie wersje tego samego dokumentu.** Stary cennik obok nowego to przepis na odpowiedź, która raz podaje jedną kwotę, a raz drugą. Wyszukiwanie nie wie, która wersja obowiązuje. Każda informacja powinna mieć w bazie jedno źródło, a wycofany dokument ma z niej znikać.

**Zmiana modelu embeddingów.** Wektory z różnych modeli nie są porównywalne. Google wycofał model `text-embedding-004`, co odnotowuje [strona wycofanych modeli Gemini API](https://ai.google.dev/gemini-api/docs/deprecations). Chatbot na tej stronie przeszedł z niego na `gemini-embedding-001` w sierpniu 2026, a przejście wymagało przeliczenia całej bazy od zera. Przy wyborze modelu sprawdź, czy dostawca nie zapowiada już jego wycofania.

**Dokumenty, których pytający nie powinien widzieć.** Baza wiedzy odpowiada tym, co w niej jest. Jeśli asystent dla klientów ma w bazie wewnętrzne procedury albo marże, prędzej czy później je zacytuje. Asystent publiczny powinien mieć bazę złożoną wyłącznie z treści publicznych, a wewnętrzny osobną, z kontrolą dostępu.

## Od czego zacząć

1. **Spisz dwadzieścia pytań**, które klienci albo pracownicy zadają najczęściej. To jest zakres pierwszej wersji.
2. **Zbierz dokumenty, które na nie odpowiadają.** Pytanie bez dokumentu to luka do uzupełnienia, nie zadanie dla modelu.
3. **Przetestuj bazę tymi samymi pytaniami**, zanim zobaczy ją ktokolwiek z zewnątrz. Zapisz, jaki wynik podobieństwa dostaje trafny fragment, i dopiero na tej podstawie ustaw próg.
4. **Zapisuj pytania bez odpowiedzi.** To gotowa lista dokumentów do dopisania.

Jeśli nie wiesz, od których pytań i dokumentów zacząć, wybór ułatwi [audyt i doradztwo AI](/uslugi/audyt-i-doradztwo-ai).

Jeśli baza ma zasilać automatyczne odpowiedzi na maile, zobacz trzeci przepływ w artykule o [automatyzacjach n8n z AI](/blog/ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n). Jak takie odpowiedzi wpiąć w kontakt z klientem, opisuje artykuł o [automatyzacji obsługi klienta](/blog/automatyzacja-obslugi-klienta-ai-rag-msp).

## Najczęstsze pytania

**Czy to to samo co trenowanie modelu na firmowych danych?**
Nie. Model pozostaje bez zmian, a dokumenty dostaje w chwili pytania. Dzięki temu aktualizacja wiedzy to przeliczenie fragmentów, a nie nowe trenowanie.

**Czy firmowe dokumenty trafiają do dostawcy modelu?**
Tak, w części. Fragmenty wysyłane do modelu embeddingów i te dołączane do pytania przechodzą przez API dostawcy. Dokumenty, których nie wolno wysłać na zewnątrz, wymagają modelu uruchomionego na własnym serwerze albo pozostają poza bazą.

**Czy baza wiedzy musi mieć formę chatbota?**
Nie. Ta sama baza może podpowiadać odpowiedzi pracownikowi w skrzynce, odpowiadać na pytania w Slacku albo przygotowywać szkice maili do zatwierdzenia.

**Jak sprawdzić, czy baza odpowiada dobrze?**
Stałym zestawem pytań testowych, uruchamianym po każdej większej zmianie dokumentów. Jeśli trafna odpowiedź przestaje się pojawiać, wiesz o tym przed klientem.

Zanim powstanie pierwszy fragment, trzeba zdecydować, na jakie pytania baza ma odpowiadać i które dokumenty są jedynym źródłem prawdy. Od tej rozmowy zaczyna się każde wdrożenie [asystenta opartego na firmowej wiedzy](/uslugi/agenci-ai-i-chatboty).
$tresc$, E'\r\n', E'\n')
  WHERE slug = 'ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp';
END $$;

-- Weryfikacja: tytuł nowy i skrót równy dac1c7a7307e314adda06acd16201d49.
--
--   SELECT title, target_keyword, md5(content) FROM posts WHERE slug = 'ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp';
