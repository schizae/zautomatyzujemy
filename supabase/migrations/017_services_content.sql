-- 017_services_content.sql
-- Treści stron usługowych. Zasady: zero deklaracji o zrealizowanych
-- wdrożeniach i klientach, zero cen i terminów, pierwsza osoba liczby
-- pojedynczej.

UPDATE services SET
  subtitle = 'Łączę narzędzia, z których już korzystasz, żeby dane przepływały między nimi bez ręcznego przepisywania.',
  seo_title = 'Automatyzacja procesów biznesowych — n8n i Make dla firm',
  seo_description = 'Automatyzacja powtarzalnych procesów w firmie: integracje CRM, księgowości, sklepu i poczty na n8n i Make. Bezpłatna konsultacja.',
  content = '## Problem

Dane w firmie krążą między systemami, ale przenosi je człowiek. Ktoś przepisuje zamówienie ze sklepu do księgowości, ktoś przekleja dane z maila do CRM-u, ktoś raz w tygodniu składa raport z czterech arkuszy. Każda z tych czynności jest drobna. Razem potrafią zjeść etat.

## Jak to robię

Zaczynam od prześledzenia jednego procesu od początku do końca i policzenia, ile realnie zajmuje. Dopiero potem buduję automatyzację — najczęściej w **n8n** lub **Make**, czyli narzędziach, w których przepływ widać jako diagram, a nie jako kod zrozumiały dla jednej osoby.

To celowa decyzja: rozwiązanie zostaje Twoje. Możesz je rozwijać samodzielnie albo zlecić komu innemu, bez uzależnienia ode mnie.

## Dla kogo

Dla firm, w których ktoś regularnie robi to samo ręcznie i wie, że to strata czasu — ale nikt nie ma przestrzeni, żeby się tym zająć. Zwykle są to zespoły od kilku do kilkudziesięciu osób, korzystające z kilku niepołączonych narzędzi.

## Co dostajesz

- Mapę procesu przed zmianą, z policzonym czasem
- Działającą automatyzację wraz z obsługą sytuacji wyjątkowych
- Dokumentację po polsku i przekazanie, żebyś wiedział, co się dzieje
- Ustalony sposób reagowania, gdy zewnętrzne narzędzie zmieni zasady działania

Ile czasu odzyskasz, zależy od tego, jak wygląda dany proces — realnie oceniam to dopiero po jego obejrzeniu, nie wcześniej.'
WHERE slug = 'automatyzacja-procesow-biznesowych';

UPDATE services SET
  subtitle = 'Asystent, który zna Twoją ofertę i odpowiada klientom o każdej porze — na stronie, w komunikatorze albo wewnątrz firmy.',
  seo_title = 'Chatboty i asystenci AI dla firm — wdrożenie zgodne z AI Act',
  seo_description = 'Chatbot oparty na Twojej bazie wiedzy: odpowiada na pytania klientów, zbiera kontakty, działa całą dobę. Wdrożenie zgodne z AI Act.',
  content = '## Problem

Te same pytania wracają codziennie: czy macie to na stanie, jak długo trwa wysyłka, jak wygląda zwrot, ile to kosztuje. Odpowiada na nie człowiek, który mógłby w tym czasie robić coś, czego nikt inny nie zrobi. Po godzinach nie odpowiada nikt, a klient idzie dalej.

## Jak to robię

Buduję asystenta na **Twojej** bazie wiedzy — dokumentacji, regulaminie, FAQ, opisach produktów. Nie na ogólnej wiedzy modelu, bo ta bywa nieaktualna i potrafi zmyślać. Technicznie to podejście zwane RAG: bot najpierw znajduje właściwy fragment Twoich treści, dopiero potem układa odpowiedź.

Gdy pytanie wykracza poza to, co bot wie, przyznaje to wprost i zbiera kontakt zamiast zgadywać. Ten sam mechanizm działa na tej stronie — możesz go przetestować w prawym dolnym rogu.

## Zgodność z prawem od pierwszego dnia

Od 2 sierpnia 2026 AI Act wymaga, żeby użytkownik wiedział, że rozmawia z maszyną. Każdy asystent, którego buduję, przedstawia się jako AI i nie udaje człowieka. To nie jest dodatek — to warunek legalnego działania.

## Dla kogo

Dla firm z powtarzalnym ruchem w obsłudze klienta i uporządkowaną wiedzą do wykorzystania. Jeśli tej wiedzy jeszcze nie ma, zaczynamy od jej spisania — bez tego żaden asystent nie zadziała sensownie.

## Co dostajesz

- Asystenta osadzonego na stronie, w komunikatorze albo wewnątrz firmy
- Bazę wiedzy, którą można rozwijać bez przebudowy całości
- Przekazywanie kontaktów wraz z podsumowaniem rozmowy
- Widoczne oznaczenie AI zgodne z wymogami przejrzystości'
WHERE slug = 'chatboty-i-asystenci-ai';

UPDATE services SET
  subtitle = 'Faktury i dokumenty odczytywane automatycznie: numery, kwoty, terminy, kontrahenci — bez ręcznego przepisywania.',
  seo_title = 'Automatyzacja faktur i dokumentów — odczyt danych przez AI',
  seo_description = 'Automatyczny odczyt faktur z maili i skanów: numer, kwota, termin, kontrahent trafiają wprost do systemu księgowego. Bezpłatna konsultacja.',
  content = '## Problem

Faktury przychodzą mailem, w PDF-ie, czasem jako zdjęcie zrobione telefonem. Ktoś je otwiera, przepisuje cztery pola do systemu i odkłada do katalogu. Przy kilkuset dokumentach miesięcznie to nie jest drobiazg — to etat, w dodatku taki, w którym literówka kosztuje najwięcej.

## Jak to robię

Dokument trafia do odczytu automatycznie — z monitorowanej skrzynki albo katalogu. Model wyciąga numer, datę, kwoty, stawki VAT i dane kontrahenta, po czym dane lądują tam, gdzie mają: w systemie księgowym, arkuszu albo bazie.

Kluczowa część to nie odczyt, tylko **kontrola**. Automat, który cicho myli kwoty, jest gorszy od jego braku. Dlatego każdy odczyt dostaje próg pewności, a dokumenty wątpliwe trafiają do ręcznego zatwierdzenia zamiast przechodzić dalej.

## Dla kogo

Dla firm przyjmujących regularnie powtarzalne dokumenty: faktury zakupowe, zamówienia, protokoły, listy przewozowe. Im bardziej ustalony format, tym prościej — ale różnorodność sama w sobie nie jest przeszkodą.

## Co dostajesz

- Automatyczny odczyt z maila, skanu albo katalogu
- Zapis do Twojego systemu księgowego lub bazy
- Próg pewności i kolejkę dokumentów do ręcznego sprawdzenia
- Archiwum z możliwością wyszukiwania po treści, nie tylko po nazwie pliku'
WHERE slug = 'automatyzacja-dokumentow-i-faktur';

UPDATE services SET
  subtitle = 'Zanim cokolwiek wdrożymy: przegląd procesów i uczciwa odpowiedź, co warto zautomatyzować, a co lepiej zostawić człowiekowi.',
  seo_title = 'Audyt AI i doradztwo — co w firmie warto zautomatyzować',
  seo_description = 'Przegląd procesów firmy pod kątem automatyzacji i AI. Uporządkowana lista tego, co warto wdrożyć — i czego nie. Bezpłatna konsultacja.',
  content = '## Problem

O sztucznej inteligencji mówią wszyscy, więc łatwo wdrożyć coś, bo wypada, a nie dlatego, że rozwiązuje problem. Odwrotna pułapka jest równie kosztowna: firma odkłada temat latami, bo nie wie, od czego zacząć, i traci czas na rzeczach, które maszyna zrobiłaby lepiej.

## Jak to robię

Przeglądam procesy tak, jak działają naprawdę, a nie jak wyglądają na schemacie. Rozmawiam z ludźmi, którzy je wykonują, bo to oni wiedzą, gdzie są obejścia i drugie arkusze prowadzone „na boku".

Wynikiem jest lista uporządkowana według stosunku zysku do trudności — z jawnym zaznaczeniem tego, **czego automatyzować nie warto**. Ta druga część bywa cenniejsza, bo oszczędza pieniądze wydane na rozwiązanie problemu, którego nie ma.

## Dla kogo

Dla firm, które chcą zacząć, ale nie wiedzą gdzie — oraz dla tych, które próbowały i się rozczarowały. Także dla takich, które chcą zweryfikować ofertę otrzymaną skądinąd, zanim ją podpiszą.

## Co dostajesz

- Mapę procesów z policzonym czasem i punktami zapalnymi
- Listę usprawnień w kolejności opłacalności
- Wyraźne wskazanie rzeczy, których nie warto ruszać
- Szacunek nakładu przy każdej pozycji, żebyś mógł zdecydować samodzielnie

Audyt jest samodzielną usługą. Możesz go wykorzystać u kogokolwiek — nie jest wstępem, który do czegoś zobowiązuje.'
WHERE slug = 'audyt-i-doradztwo-ai';

UPDATE services SET
  subtitle = 'Praktyczne warsztaty pod konkretne stanowiska — narzędzia i sposoby pracy, z których zespół skorzysta następnego dnia.',
  seo_title = 'Szkolenia z AI dla firm — obowiązek AI literacy z AI Act',
  seo_description = 'Warsztaty z AI dopasowane do stanowisk w Twojej firmie. Realizują obowiązek AI literacy z AI Act. Zaświadczenia i dokumentacja.',
  content = '## Problem

Część zespołu używa narzędzi AI po kryjomu, bo nikt nie powiedział, czy wolno. Część nie używa wcale, bo nie wie jak zacząć. Efekt jest podwójnie zły: dane firmy trafiają tam, gdzie nie powinny, a korzyści i tak nie ma.

Do tego dochodzi obowiązek prawny. AI Act wymaga od firm zapewnienia pracownikom odpowiedniego poziomu wiedzy o sztucznej inteligencji — to nie jest dobra praktyka, tylko wymóg.

## Jak to robię

Szkolenie układam pod stanowiska, nie pod ogólny temat. Handlowiec, księgowa i osoba z obsługi klienta mają zupełnie inne zastosowania i zupełnie inne pułapki do ominięcia.

Prowadzę je warsztatowo, na narzędziach i na danych zbliżonych do tych, z którymi zespół pracuje na co dzień. Bez slajdów o rewolucji — z konkretami, które da się użyć następnego dnia.

Osobny blok poświęcam temu, czego robić nie wolno: jakich danych nie wolno wklejać, kiedy odpowiedź modelu wymaga sprawdzenia i skąd się biorą pewnie brzmiące nieprawdy.

## Dla kogo

Dla zespołów na dowolnym poziomie zaawansowania, w tym takich, które zaczynają od zera. Także dla firm, które potrzebują udokumentować wypełnienie obowiązku z AI Act.

## Co dostajesz

- Program dopasowany do stanowisk w Twojej firmie
- Warsztat na realnych przypadkach, nie na przykładach z internetu
- Zasady bezpiecznego korzystania spisane dla zespołu
- Zaświadczenia i dokumentację przydatną przy wykazywaniu zgodności'
WHERE slug = 'szkolenia-z-ai-dla-zespolow';

UPDATE services SET
  subtitle = 'Szybkie, dostępne strony i aplikacje szyte pod proces, którego nie obsłuży żadne gotowe narzędzie.',
  seo_title = 'Strony internetowe i oprogramowanie na zamówienie — Next.js',
  seo_description = 'Strony i aplikacje budowane pod konkretny proces. Next.js, TypeScript, dostępność i szybkość. Bezpłatna konsultacja.',
  content = '## Problem

Czasem gotowe narzędzie po prostu nie pasuje. Albo pasuje w siedemdziesięciu procentach, a pozostałe trzydzieści zespół obchodzi arkuszem i wiedzą trzymaną w głowie. Bywa też odwrotnie: firma płaci abonament za rozbudowany system, z którego używa trzech funkcji.

## Jak to robię

Buduję na **Next.js i TypeScript** — to ten sam stos, na którym stoi strona, którą właśnie czytasz, razem z panelem administracyjnym i chatbotem. Nie polecam narzędzi, których sam nie używam.

Zaczynam od procesu, nie od wyglądu. Wygląd jest ważny, ale aplikacja, która ładnie wygląda i nie pasuje do sposobu pracy, i tak wyląduje obok arkusza.

Szybkość i dostępność traktuję jako część zakresu, nie dodatek. Strona ma działać na słabym telefonie i przy słabym zasięgu, bo tak wygląda znaczna część ruchu.

## Dla kogo

Dla firm z procesem na tyle własnym, że gotowe narzędzia go nie obejmują — oraz dla tych, którym obecna strona nie przynosi zapytań i nie wiadomo dlaczego.

## Co dostajesz

- Aplikację lub stronę zbudowaną pod Twój proces
- Kod, który zostaje Twój, wraz z dostępem do repozytorium
- Dokumentację wdrożeniową i przekazanie
- Podstawową analitykę, żeby dało się zobaczyć, co działa'
WHERE slug = 'strony-i-oprogramowanie-na-zamowienie';

UPDATE services SET
  subtitle = 'Unijne rozporządzenie o AI obowiązuje od 2 sierpnia 2026 i dotyczy także firm, które tylko korzystają z gotowych narzędzi.',
  seo_title = 'Zgodność z AI Act dla MŚP — audyt, wdrożenie i szkolenie',
  seo_description = 'AI Act obowiązuje od 2 sierpnia 2026. Klasyfikacja systemów, wymagane oznaczenia, dokumentacja i szkolenie zespołu. Bezpłatna konsultacja.',
  content = '## Problem

Powszechne jest przekonanie, że AI Act dotyczy tych, którzy sztuczną inteligencję tworzą. Nieprawda — obowiązki spadają też na firmy, które z niej tylko korzystają. Chatbot na stronie, narzędzie do selekcji CV, system oceniający zdolność kredytową: każde z nich uruchamia konkretne wymagania.

Obowiązki przejrzystości obowiązują **od 2 sierpnia 2026** i są egzekwowane karami. Terminy dla systemów wysokiego ryzyka przesunięto na grudzień 2027, co daje czas — ale nie na bezczynność.

## Jak to robię

Zaczynam od inwentaryzacji: co w firmie w ogóle jest systemem AI w rozumieniu rozporządzenia. Ta lista zwykle okazuje się dłuższa, niż wszyscy zakładali, bo obejmuje także narzędzia wbudowane w programy używane od lat.

Potem klasyfikacja według poziomu ryzyka, bo od niej zależy cała reszta. Następnie wdrożenie tego, co wymagane: oznaczanie treści generowanych przez AI, informowanie użytkowników o kontakcie z maszyną, dokumentacja, polityka korzystania i szkolenie zespołu.

## Dla kogo

Dla małych i średnich firm, które używają AI — świadomie albo nie zdając sobie z tego sprawy. Szczególnie tych, które przetwarzają dane osobowe albo podejmują z pomocą AI decyzje dotyczące ludzi.

## Co dostajesz

- Inwentaryzację systemów AI używanych w firmie
- Klasyfikację ryzyka wraz z uzasadnieniem
- Wdrożenie wymaganych mechanizmów przejrzystości
- Politykę korzystania z AI i szkolenie zespołu
- Komplet dokumentacji na wypadek kontroli

Zanim zdecydujesz się na współpracę, możesz zacząć od bezpłatnej [checklisty AI Act](/ai-act-checklist) i sprawdzić samodzielnie, co Cię dotyczy.'
WHERE slug = 'zgodnosc-z-ai-act';
