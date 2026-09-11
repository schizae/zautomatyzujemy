-- 018_services_seo_content.sql
-- Przepisanie czterech usług o największym popycie pod frazy docelowe z docs/seo/keyword-map.md.
--
-- Wspólny układ każdej strony: akapit odpowiadający na pytanie z frazy, problem, sposób pracy,
-- dla kogo, co dostajesz, cena, pytania. Frazy główne pochodzą z wolumenów Senuto,
-- nie z przypuszczeń — szczegóły w sekcji 2.4 mapy fraz.
--
-- Treść wcześniejsza (migracja 017) została zachowana i przebudowana, a nie zastąpiona:
-- pierwsza osoba, brak zmyślonych wdrożeń i brak obietnic to atut, nie przypadek.

-- ─── 1. Automatyzacja procesów biznesowych ───────────────────────────────────
-- Fraza główna: automatyzacja procesów biznesowych (590/mies.)
-- Wsparcie: automatyzacja procesów w firmie (140), automatyzacja procesów księgowych (90)

UPDATE services SET
  seo_title = 'Automatyzacja procesów biznesowych — wdrożenia n8n i Make',
  seo_description = 'Łączę narzędzia, z których już korzystasz, żeby dane przepływały bez ręcznego przepisywania. Mapa procesu, wdrożenie, dokumentacja po polsku.',
  content = $tresc$Automatyzacja procesów biznesowych polega na tym, żeby dane przepływały między systemami same, zamiast przez człowieka z klawiaturą. Zaczynam od jednego procesu, policzenia ile realnie zajmuje, i dopiero potem buduję rozwiązanie.

## Problem

Dane w firmie krążą między systemami, ale przenosi je człowiek. Ktoś przepisuje zamówienie ze sklepu do księgowości, ktoś przekleja dane z maila do CRM-u, ktoś raz w tygodniu składa raport z czterech arkuszy. Każda z tych czynności jest drobna. Razem potrafią zjeść etat.

Najgorsze jest to, że nikt tego nie liczy. Dopóki proces nie jest zmierzony, wygląda na drobiazg, o którym nie warto rozmawiać.

## Jak wygląda automatyzacja procesów biznesowych w praktyce

Zaczynam od prześledzenia jednego procesu od początku do końca i policzenia, ile realnie zajmuje. To zwykle godzina rozmowy i kilka pytań do osoby, która ten proces wykonuje.

Dopiero potem buduję automatyzację, najczęściej w **n8n** lub **Make**, czyli narzędziach, w których przepływ widać jako diagram, a nie jako kod zrozumiały dla jednej osoby.

To celowa decyzja: rozwiązanie zostaje Twoje. Możesz je rozwijać samodzielnie albo zlecić komu innemu, bez uzależnienia ode mnie.

Osobno projektuję to, co dzieje się przy błędzie. Automatyzacja, która cicho przestaje działać, jest gorsza od jej braku, bo nikt tego nie zauważa przez tydzień.

## Dla kogo

Dla firm, w których ktoś regularnie robi to samo ręcznie i wie, że to strata czasu, ale nikt nie ma przestrzeni, żeby się tym zająć. Zwykle są to zespoły od kilku do kilkudziesięciu osób, korzystające z kilku niepołączonych narzędzi.

Częste punkty startu to automatyzacja procesów księgowych, obsługi zamówień i raportowania.

## Co dostajesz

- Mapę procesu przed zmianą, z policzonym czasem
- Działającą automatyzację wraz z obsługą sytuacji wyjątkowych
- Dokumentację po polsku i przekazanie, żebyś wiedział, co się dzieje
- Ustalony sposób reagowania, gdy zewnętrzne narzędzie zmieni zasady działania

Ile czasu odzyskasz, zależy od tego, jak wygląda dany proces. Realnie oceniam to dopiero po jego obejrzeniu, nie wcześniej.

## Ile to kosztuje

Na cenę wpływa liczba systemów, które trzeba połączyć, oraz to, ile wyjątków ma proces. Połączenie dwóch narzędzi jednym przepływem to inna skala niż obieg z akceptacjami i wieloma ścieżkami.

Wycenę podaję po krótkiej rozmowie, w której oglądam proces. Rozmowa jest bezpłatna, trwa około pół godziny i nie zobowiązuje do niczego.

## Najczęstsze pytania

**Czy muszę wymieniać systemy, z których korzystamy?**
Nie. Sens tej pracy polega właśnie na połączeniu tego, co już macie. Wymiana narzędzi to osobna decyzja i zwykle niepotrzebna.

**Co, jeśli proces się zmieni?**
Dlatego buduję w narzędziach, w których przepływ widać jako diagram. Drobne zmiany wprowadzisz samodzielnie, a przy większych wracasz do mnie albo do kogokolwiek innego.

**Czy automatyzacja procesów to to samo co wdrożenie AI?**
Nie zawsze. Sporo procesów da się zautomatyzować bez żadnego modelu, samymi integracjami, i tak wychodzi taniej. Model wchodzi tam, gdzie trzeba zrozumieć treść, na przykład przy [obiegu dokumentów](/uslugi/automatyzacja-dokumentow-i-faktur).

**Od czego zacząć, jeśli nie wiem, co automatyzować?**
Od [audytu procesów](/uslugi/audyt-i-doradztwo-ai) albo od [szkolenia zespołu](/uslugi/szkolenia-z-ai-dla-zespolow). Ludzie, którzy wykonują pracę, zwykle wiedzą najlepiej, co ich uwiera.
$tresc$
WHERE slug = 'automatyzacja-procesow-biznesowych';

-- ─── 2. Agenci AI i chatboty ─────────────────────────────────────────────────
-- Fraza główna: agent ai (5400/mies.) — największy klaster po samym n8n
-- Wsparcie: asystent ai dla firmy, chatbot dla firmy, agent ai dla firmy
-- Zmiana tytułu: klaster chatbotowy ma zapytania o narzędzie, nie o wykonawcę

-- Zmiana sluga jest bezpieczna wyłącznie dlatego, że ta strona nigdy nie była
-- opublikowana: /uslugi zwraca dziś 404 na produkcji, więc nie ma czego zerwać.
-- Po wdrożeniu zmiana adresu wymagałaby przekierowania.
UPDATE services SET
  slug = 'agenci-ai-i-chatboty',
  title = 'Agenci AI i chatboty dla firm',
  subtitle = 'Agent AI, który zna Twoją ofertę i odpowiada klientom o każdej porze — na stronie, w komunikatorze albo wewnątrz firmy.',
  seo_title = 'Agenci AI i chatboty dla firm — wdrożenie na Twojej wiedzy',
  seo_description = 'Agent AI oparty na Twojej bazie wiedzy, nie na ogólnej wiedzy modelu. Odpowiada, zbiera kontakty i przyznaje, gdy czegoś nie wie.',
  content = $tresc$Agent AI dla firmy to program, który samodzielnie odpowiada na pytania i wykonuje zadania na podstawie Twojej wiedzy, a nie ogólnej wiedzy modelu. Buduję takie rozwiązania na dokumentach, które już macie, i pilnuję, żeby agent przyznawał się do niewiedzy zamiast zgadywać.

## Problem

Te same pytania wracają codziennie: czy macie to na stanie, jak długo trwa wysyłka, jak wygląda zwrot, ile to kosztuje. Odpowiada na nie człowiek, który mógłby w tym czasie robić coś, czego nikt inny nie zrobi. Po godzinach nie odpowiada nikt, a klient idzie dalej.

Gotowe chatboty z półki zwykle rozczarowują, bo nie znają Twojej oferty. Odpowiadają ogólnie albo zmyślają, a to kosztuje więcej niż milczenie.

## Czym agent AI różni się od chatbota

Chatbot odpowiada na pytania. Agent potrafi też wykonać zadanie: sprawdzić dostępność w systemie, założyć zgłoszenie, umówić termin, przekazać sprawę dalej wraz z podsumowaniem.

W praktyce granica bywa płynna i nie ma sensu się o nią spierać. Ma znaczenie jedno: czy rozwiązanie ma dostęp do Twoich danych i czy wolno mu coś zmienić, czy tylko odpowiadać.

## Jak to robię

Buduję na **Twojej** bazie wiedzy: dokumentacji, regulaminie, FAQ, opisach produktów. Technicznie to podejście zwane RAG, czyli agent najpierw znajduje właściwy fragment Twoich treści, dopiero potem układa odpowiedź.

Gdy pytanie wykracza poza to, co wie, przyznaje to wprost i zbiera kontakt zamiast zgadywać. Ten sam mechanizm działa na tej stronie, możesz go przetestować w prawym dolnym rogu.

## Zgodność z prawem od pierwszego dnia

Od 2 sierpnia 2026 AI Act wymaga, żeby użytkownik wiedział, że rozmawia z maszyną. Każdy agent, którego buduję, przedstawia się jako AI i nie udaje człowieka. To nie jest dodatek, tylko warunek legalnego działania. Szerzej o obowiązkach: [zgodność z AI Act](/uslugi/zgodnosc-z-ai-act).

## Dla kogo

Dla firm z powtarzalnym ruchem w obsłudze klienta i uporządkowaną wiedzą do wykorzystania. Jeśli tej wiedzy jeszcze nie ma, zaczynamy od jej spisania, bo bez tego żaden agent nie zadziała sensownie.

## Co dostajesz

- Agenta osadzonego na stronie, w komunikatorze albo wewnątrz firmy
- Bazę wiedzy, którą można rozwijać bez przebudowy całości
- Przekazywanie kontaktów wraz z podsumowaniem rozmowy
- Widoczne oznaczenie AI zgodne z wymogami przejrzystości

## Ile to kosztuje

Na cenę wpływają trzy rzeczy: ile treści trzeba przygotować jako bazę wiedzy, czy agent ma tylko odpowiadać, czy też sięgać do Twoich systemów, oraz gdzie ma działać.

Wycenę podaję po krótkiej rozmowie. Jest bezpłatna i trwa około pół godziny.

## Najczęstsze pytania

**Skąd agent bierze wiedzę o mojej firmie?**
Z dokumentów, które mu dajesz. Nic nie wymyśla z własnej pamięci, a gdy nie znajdzie odpowiedzi w Twoich treściach, mówi o tym wprost.

**Co, jeśli oferta się zmieni?**
Aktualizujesz bazę wiedzy, a agent odpowiada po nowemu. Nie wymaga to przebudowy ani mojego udziału.

**Czy agent może rozmawiać przez telefon?**
Tak, to voicebot. Działa na tej samej bazie wiedzy, ale wdrożenie jest droższe i zwykle ma sens dopiero przy dużym ruchu telefonicznym.

**Chcę, żeby zespół sam umiał budować takich agentów.**
To temat na warsztat, nie na wdrożenie. Zobacz [szkolenia z AI dla firm](/uslugi/szkolenia-z-ai-dla-zespolow).
$tresc$
WHERE slug = 'chatboty-i-asystenci-ai';

-- ─── 3. Automatyzacja obiegu dokumentów i faktur ─────────────────────────────
-- Fraza główna: automatyzacja obiegu dokumentów (90/mies.)
-- Uwaga: automatyzacja faktur ma 20/mies., więc fraza fakturowa zeszła na wsparcie

UPDATE services SET
  title = 'Automatyzacja obiegu dokumentów i faktur',
  seo_title = 'Automatyzacja obiegu dokumentów — odczyt faktur i skanów',
  seo_description = 'Faktury i dokumenty odczytywane automatycznie: numery, kwoty, terminy, kontrahenci. Z progiem pewności i kolejką do ręcznego sprawdzenia.',
  content = $tresc$Automatyzacja obiegu dokumentów polega na tym, że dokument sam trafia z maila do systemu, a człowiek tylko zatwierdza to, co budzi wątpliwość. Odczyt to łatwiejsza część. Trudniejsza i ważniejsza jest kontrola tego, co automat wyciągnął.

## Problem

Faktury przychodzą mailem, w PDF-ie, czasem jako zdjęcie zrobione telefonem. Ktoś je otwiera, przepisuje cztery pola do systemu i odkłada do katalogu. Przy kilkuset dokumentach miesięcznie to nie jest drobiazg, tylko etat, w dodatku taki, w którym literówka kosztuje najwięcej.

## Jak to robię

Dokument trafia do odczytu automatycznie, z monitorowanej skrzynki albo katalogu. Model wyciąga numer, datę, kwoty, stawki VAT i dane kontrahenta, po czym dane lądują tam, gdzie mają: w systemie księgowym, arkuszu albo bazie.

Kluczowa część to nie odczyt, tylko **kontrola**. Automat, który cicho myli kwoty, jest gorszy od jego braku. Dlatego każdy odczyt dostaje próg pewności, a dokumenty wątpliwe trafiają do ręcznego zatwierdzenia zamiast przechodzić dalej.

## Dla kogo

Dla firm przyjmujących regularnie powtarzalne dokumenty: faktury zakupowe, zamówienia, protokoły, listy przewozowe. Im bardziej ustalony format, tym prościej, ale różnorodność sama w sobie nie jest przeszkodą.

## Co dostajesz

- Automatyczny odczyt z maila, skanu albo katalogu
- Zapis do Twojego systemu księgowego lub bazy
- Próg pewności i kolejkę dokumentów do ręcznego sprawdzenia
- Archiwum z możliwością wyszukiwania po treści, nie tylko po nazwie pliku

## Ile to kosztuje

Na cenę wpływa liczba typów dokumentów, docelowy system oraz to, czy potrzebny jest interfejs do zatwierdzania wątpliwych odczytów. Jeden typ dokumentu i zapis do arkusza to inna skala niż obieg z akceptacjami.

Wycenę podaję po krótkiej rozmowie, w której oglądam przykładowe dokumenty. Rozmowa jest bezpłatna.

## Najczęstsze pytania

**Czy odczyt działa na zdjęciach zrobionych telefonem?**
Tak, choć jakość zdjęcia wpływa na pewność odczytu. Dokumenty poniżej progu pewności trafiają do ręcznego sprawdzenia, więc zły odczyt nie przechodzi dalej po cichu.

**Co z dokumentami w obcych językach?**
Działa, o ile z góry wiadomo, jakich języków się spodziewać.

**Czy to zastąpi księgową?**
Nie i nie taki jest cel. Zdejmuje przepisywanie, zostawia decyzje. Księgowa przestaje przepisywać, a zaczyna sprawdzać wyjątki.

**Mam też inne procesy do uporządkowania.**
Wtedy rozmawiamy szerzej o [automatyzacji procesów biznesowych](/uslugi/automatyzacja-procesow-biznesowych), bo obieg dokumentów rzadko stoi sam.
$tresc$
WHERE slug = 'automatyzacja-dokumentow-i-faktur';

-- ─── 4. Szkolenia z AI dla firm ──────────────────────────────────────────────
-- Fraza główna: szkolenie ai dla firm (140/mies.), klaster szkoleniowy to kilka tysięcy
-- Zmiana tytułu z „dla zespołów" na „dla firm": fraza docelowa musi paść w nagłówku
-- Cena podana przez właściciela: od 2000 zł netto, wycena indywidualna

UPDATE services SET
  title = 'Szkolenia z AI dla firm',
  subtitle = 'Praktyczne warsztaty pod konkretne stanowiska. Narzędzia i sposoby pracy, z których zespół skorzysta następnego dnia.',
  seo_title = 'Szkolenia z AI dla firm — warsztaty i obowiązek AI Act',
  seo_description = 'Warsztaty z AI pod stanowiska w Twojej firmie. Zespół wychodzi z gotowymi narzędziami, Ty z dokumentacją obowiązku AI literacy. Od 2000 zł netto.',
  content = $tresc$Szkolenie z AI dla firm ma sens wtedy, gdy zespół wychodzi z niego z konkretnymi narzędziami do swojej pracy, a nie z ogólnym wrażeniem, że sztuczna inteligencja jest ważna. Układam warsztaty pod stanowiska, które faktycznie są w Twojej firmie, i prowadzę je na danych zbliżonych do tych, z którymi zespół pracuje na co dzień.

## Problem

Część zespołu używa narzędzi AI po kryjomu, bo nikt nie powiedział, czy wolno. Część nie używa wcale, bo nie wie jak zacząć. Efekt jest podwójnie zły: dane firmy trafiają tam, gdzie nie powinny, a korzyści i tak nie ma.

Do tego dochodzi obowiązek prawny. AI Act wymaga od firm zapewnienia pracownikom odpowiedniego poziomu wiedzy o sztucznej inteligencji. To nie jest dobra praktyka, tylko wymóg, i dotyczy także firm, które korzystają wyłącznie z gotowych narzędzi.

## Jak wygląda szkolenie z AI dla firm

Program układam pod stanowiska, nie pod ogólny temat. Handlowiec, księgowa i osoba z obsługi klienta mają zupełnie inne zastosowania i zupełnie inne pułapki do ominięcia. Rozmowa przed warsztatem służy właśnie temu, żeby to ustalić.

Prowadzę warsztatowo, na narzędziach i na danych zbliżonych do tych, z którymi zespół pracuje na co dzień. Bez slajdów o rewolucji. Każdy uczestnik wychodzi z co najmniej jednym zadaniem, które od jutra robi szybciej.

Osobny blok poświęcam temu, czego robić nie wolno: jakich danych nie wolno wklejać, kiedy odpowiedź modelu wymaga sprawdzenia i skąd się biorą pewnie brzmiące nieprawdy.

Dla zespołów, które są już dalej, robię blok o agentach AI: czym różnią się od czatu, co da się im powierzyć, a czego nie. To naturalne przedłużenie warsztatu podstawowego i częsty temat drugiego spotkania.

## Dla kogo

Dla zespołów na dowolnym poziomie, w tym takich, które zaczynają od zera. Także dla firm, które potrzebują udokumentować wypełnienie obowiązku z AI Act i nie wiedzą, od czego zacząć. Jeśli zastanawiasz się, co dokładnie Cię obowiązuje, zacznij od [bezpłatnej checklisty AI Act](/ai-act-checklist).

## Co dostajesz

- Program dopasowany do stanowisk w Twojej firmie
- Warsztat na realnych przypadkach, nie na przykładach z internetu
- Zasady bezpiecznego korzystania spisane dla zespołu
- Zaświadczenia i dokumentację przydatną przy wykazywaniu zgodności

## Ile to kosztuje

Szkolenia zaczynają się **od 2000 zł netto**. Każde wyceniam indywidualnie, bo na cenę wpływają trzy rzeczy: liczba stanowisk, dla których układam osobny program, długość warsztatu i to, czy potrzebujesz dokumentacji zgodności z AI Act.

Wycenę podaję po krótkiej rozmowie, w której ustalamy zakres. Rozmowa jest bezpłatna i trwa około pół godziny.

## Najczęstsze pytania

**Ile trwa szkolenie?**
Od pół dnia dla jednego zespołu do serii spotkań rozłożonych na kilka tygodni. Krótkie warsztaty sprawdzają się lepiej niż jedno długie spotkanie, bo między nimi zostaje czas na przećwiczenie.

**Czy szkolenie odbywa się na miejscu, czy online?**
Obie formy. Na miejscu w Chojnicach i okolicy, zdalnie w całej Polsce. Warsztatowy charakter działa w obu wariantach, o ile grupa nie jest większa niż kilkanaście osób.

**Czy to wystarczy, żeby wypełnić obowiązek z AI Act?**
Szkolenie realizuje obowiązek podnoszenia kompetencji i dostajesz dokumentację, która to potwierdza. Sam obowiązek jest jednak szerszy i obejmuje też rejestr używanych systemów oraz oznaczanie treści. Tym zajmuje się osobna usługa: [zgodność z AI Act](/uslugi/zgodnosc-z-ai-act).

**Zespół nigdy nie korzystał z AI. Nie będzie za trudno?**
Nie. Grupy zaczynające od zera to najczęstszy przypadek. Zaczynamy od jednego zadania, które każdy wykonuje ręcznie co tydzień, i pokazuję, jak je skrócić.

**Co po szkoleniu?**
Zwykle okazuje się, że dwie albo trzy rzeczy warto nie tyle usprawnić, co zautomatyzować na stałe. Wtedy wchodzi [automatyzacja procesów biznesowych](/uslugi/automatyzacja-procesow-biznesowych), ale to osobna decyzja i osobna rozmowa.
$tresc$
WHERE slug = 'szkolenia-z-ai-dla-zespolow';
