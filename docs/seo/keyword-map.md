# Mapa fraz i krajobraz wyników — 10 września 2026

Faza 0 planu widoczności. Dokument łączy trzy rzeczy: kto dziś zajmuje wyniki dla naszych fraz,
które klastry mają sens, i która strona ma za nie odpowiadać.

Zastrzeżenie do metody: wyszukiwania robiłem narzędziem, które odpytuje wyszukiwarkę z terenu
Stanów Zjednoczonych. Zestaw witryn w wynikach jest wiarygodny, kolejność może się różnić od tej,
którą widzi użytkownik w Polsce. Wolumeny wyszukiwań uzupełni właściciel z Bing Webmaster Tools
i z Search Console, bo tych danych nie da się pobrać bez zalogowania.

---

## 1. Krajobraz wyników, klaster po klastrze

### 1.1 Wdrożenia n8n i automatyzacja procesów

Zajmują wyniki: agisona.pl, automationnex.io, specinfo.pl, stormit.pl, dokodu.it, cognity.pl.

Sami mali gracze i agencje wielkości kilku osób, żadnej marki rozpoznawalnej.
Treści są w większości poradnikowe, typu „czym jest n8n", z cienką warstwą sprzedażową.
**Werdykt: realne.** To najlepszy klaster na start. Jednoosobowa witryna z konkretnym przepływem,
zrzutami z działającego wdrożenia i liczbami wygrywa z ogólnikiem o tym, czym jest n8n.

### 1.2 Chatbot AI, cena i wdrożenie

Zajmują wyniki: syntalith.ai, momentumsquads.com, falconworks.pl, fastlanding.io, lessmanual.ai
(dwa osobne artykuły), gagan.pl, pixelagency.pl, cenauslug.pl.

**To obala założenie z pierwszej wersji planu.** Pisałem tam, że frazy cenowe wygramy,
bo agencje unikają podawania widełek. Nieprawda: co najmniej osiem firm ma dedykowany artykuł
z cennikiem chatbota, część aktualizowaną pod rok 2026, z konkretnymi kwotami w tytule.
To jeden z najgęściej obsadzonych klastrów, jakie sprawdziłem.

**Werdykt: nierealne jako cel SEO w pierwszym roku.** Strona `/cennik` zostaje w planie,
ale jako narzędzie sprzedaży i element zaufania, a nie jako sposób na pozycję w wynikach.
Wchodzimy tam długim ogonem, na przykład kosztem konkretnego wdrożenia w konkretnej branży,
a nie ogólnym pytaniem, ile kosztuje chatbot.

Dane rynkowe zebrane przy okazji, przydadzą się do treści `/cennik`: rozrzut od 2 000 do 45 000 zł,
mediana rynkowa około 18 000 zł, utrzymanie od 300 do 2 500 zł miesięcznie, integracja z jednym
systemem zewnętrznym od 1 000 do 5 000 zł.

### 1.3 Automatyzacja faktur i obiegu dokumentów

Zajmują wyniki: webcon.com, qalcwise.com, automee.pl, zyntegrai.pl, industrialdigital.pl,
autopilot.com.pl, abcfaktury.pl.

Tu stoją producenci oprogramowania z budżetami, nie agencje wdrożeniowe. Konkurują o firmę,
która szuka gotowego systemu.
**Werdykt: realne wąskim wejściem.** Nie walczymy o „program do obiegu faktur", tylko o wdrożenie
u kogoś, kto nie chce kupować systemu, na przykład automatyzacja faktur w n8n bez zmiany
programu księgowego.

### 1.4 Voicebot i asystent głosowy

Zajmują wyniki: actio.pl, callsono.com, maikon.io, malinski.ai, home.pl, semcore.pl, autopilot.com.pl.

Klaster zdominowany przez dostawców platform abonamentowych.
**Werdykt: realne tylko poradnikowo**, i to nie w pierwszej kolejności. Dane rynkowe do treści:
abonament od 900 do 7 000 zł miesięcznie, wdrożenie od 1 500 zł w górę, czas wdrożenia jeden
do dwóch tygodni.

### 1.5 Zgodność z AI Act

Zajmują wyniki: ey.com (dwie strony), kancelarie prawne (lome.legal, ipsolegal.pl),
firmy doradcze (doradcy365.pl, jds.com.pl), startbrain.ai, cyberwsieci.pl.

Klaster obsadzony przez prawników i duże doradztwo. Na ogólne pytania o obowiązki nie mamy szans.
**Werdykt: realne od strony praktycznej, nie prawnej.** Mamy przewagę, której oni nie mają:
działający rejestr systemów AI we własnym produkcie, oznaczanie treści generowanych
i gotową stronę `/ai-act-checklist`. Wejście prowadzi przez frazy wykonawcze, na przykład
jak prowadzić rejestr systemów AI albo jak oznaczyć treści AI na stronie firmowej.

### 1.6 Frazy lokalne — najważniejsze odkrycie

**W Chojnicach jest już konkurent robiący dokładnie to, co planowaliśmy.**
JustAutomate ma stronę `justautomate.ai/chojnice/automatyzacja-biznesu/`: nagłówek z nazwą miasta,
od 2500 do 3000 słów, odniesienia do Borów Tucholskich, jeziora Charzykowskiego, węzła kolejowego
i przemysłu drzewnego, opis metodyki wdrożenia, sekcja o zwrocie z inwestycji, FAQ i formularz.
Z tej samej strony linkują do sześciu innych miast, każde pod adresem `/miasto/agent-ai/`.

To zmienia dwie rzeczy w planie.

Po pierwsze, strona lokalna nie może być kolejną stroną o tym samym. Przewaga, której konkurent
nie podrobi, jest jedna: właściciel naprawdę mieszka w Chojnicach, ma numer telefonu, twarz
i może przyjechać. Strona lokalna ma sprzedawać obecność, nie słowa kluczowe.

Po drugie, sam fakt, że ktoś generuje strony pod miasta seryjnie, nie dowodzi popytu.
Takie strony powstają dla skali, nie dlatego, że w Chojnicach ktoś tego szuka.
Zanim napiszemy stronę lokalną, właściciel sprawdza wolumen w Bing Webmaster Tools.
Zero wyszukiwań oznacza jedną krótką stronę wizytówkową zamiast dużej strony ofertowej,
a uwaga przenosi się na frazy usługowe.

---

## 2. Frazy z podpowiedzi wyszukiwarki

Zebrane skryptem z publicznego endpointu podpowiedzi Google: 140 zapytań, 20 fraz nasiennych
w siedmiu wariantach każda. Wynik: 110 unikalnych podpowiedzi.
Surowe dane: `data/seo/suggest-raw.json`. Wolumeny uzupełni właściciel, opis w `docs/zadania-wlasciciela.md`.

### 2.1 Dwa odkrycia, które zmieniają plan

**Zero podpowiedzi lokalnych.** Ani jedna ze 110 fraz nie zawiera nazwy miasta ani województwa,
mimo że siedem wariantów każdego ziarna kończyło się na „chojnice" albo „pomorskie".
Wyszukiwarka podpowiada to, co ludzie faktycznie wpisują, więc brak podpowiedzi jest przesłanką,
że popyt lokalny na te frazy jest bliski zeru. To domyka warunek zapisany w specyfikacji:
ścieżka lokalna schodzi do jednej krótkiej strony, a priorytet przechodzi na frazy usługowe.
Właściciel może to jeszcze zweryfikować wolumenami z Bing Webmaster Tools, ale poprzeczka
dla strony lokalnej jest teraz wyższa, nie niższa.

**Fraza główna klastra pierwszego jest zanieczyszczona intencją zawodową.**
Podpowiedzi do „automatyzacja procesów biznesowych" to w większości: praca, zarobki, studia,
studia podyplomowe, kurs, UŁ. To ludzie szukający pracy i studiów, nie firmy szukające wykonawcy.
Pozycja na tę frazę przyniosłaby ruch bez wartości sprzedażowej. Celujemy w węższe warianty
z rzeczownikiem firmowym, wymienione niżej.

### 2.2 Frazy z intencją zakupową, klaster po klastrze

**Automatyzacja procesów i n8n** — strona `/uslugi/automatyzacja-procesow-biznesowych`
- automatyzacja procesów w firmie
- automatyzacja procesów biznesowych firmy
- automatyzacja procesów księgowych
- automatyzacja procesów obsługi klienta
- automatyzacja procesów produkcyjnych firmy
- automatyzacja ai n8n

**Poradnikowe wokół n8n** — artykuły na blog, każdy linkuje do strony usługowej
- n8n jak zacząć
- n8n jak działa
- n8n co to jest
- n8n ile kosztuje
- n8n self hosted
- n8n jak przechowuje dane wrażliwe

Ostatnia pozycja jest najciekawsza z całego zbioru. Pytanie o dane wrażliwe zadaje ktoś,
kto już rozważa wdrożenie i szuka argumentu dla siebie albo dla przełożonego.
Odpowiedź wymaga wiedzy, której nie ma w materiałach producenta, i naturalnie prowadzi
do rozmowy o wdrożeniu na własnej infrastrukturze.

**Chatboty i asystenci** — strona `/uslugi/chatboty-i-asystenci-ai`
- chatbot dla firmy
- agent ai dla firmy
- asystent ai dla firmy
- chatbot ai opinie

**Faktury i dokumenty** — strona `/uslugi/automatyzacja-dokumentow-i-faktur`
- automatyzacja faktur kosztowych
- automatyzacja obiegu dokumentów
- automatyzacja wystawiania faktur
- ocr faktur zakupu
- ocr faktur api

**Voicebot** — na razie wyłącznie artykuł, nie osobna usługa
- voicebot dla firm
- ile kosztuje voicebot
- voicebot co to

**Szkolenia** — strona `/uslugi/szkolenia-z-ai-dla-zespolow`
- szkolenie ai dla firm
- szkolenie ai w firmie

**Wdrożenia ogólne i produkcja**
- wdrożenie ai w firmie
- sztuczna inteligencja w firmie produkcyjnej

Druga z nich celuje w konkretną branżę i pasuje do lokalnego kontekstu, bo w okolicy
dominuje przemysł drzewny i produkcja.

**Obsługa klienta i baza wiedzy**
- automatyzacja obsługi klienta
- baza wiedzy ai

### 2.3 Frazy świadomie odrzucone

| Fraza | Dlaczego odpada |
|---|---|
| automatyzacja procesów biznesowych praca, zarobki, studia, kurs, uł | intencja zawodowa, nie zakupowa |
| n8n docker, github, jaki port, download, self hosted install | intencja techniczna, czytelnik nie kupuje wdrożenia |
| n8n jakarta, n8n firmenwert, n8n firmensitz, voicebot cez, ocr faktur pajak | zapytania spoza polskiego rynku |
| chatbot ai free, za darmo, mod apk, bez ograniczeń, cancel subscription | szukają darmowego narzędzia, nie wykonawcy |
| chatbot ai character | zupełnie inna intencja, rozrywka |
| ocr fakturownia, ocr faktura xl | szukają konkretnego produktu, nie usługi |

Ta tabela jest równie ważna jak lista fraz docelowych. Automat blogowy dostanie ją jako listę
wykluczeń, żeby nie napisał artykułu o zarobkach w automatyzacji procesów.

---

## 3. Przypisanie klastrów do stron

| Klaster | Strona docelowa | Priorytet | Werdykt |
|---|---|---|---|
| Automatyzacja procesów i n8n | `/uslugi/automatyzacja-procesow-biznesowych` | 1 | realne |
| Chatboty i asystenci AI | `/uslugi/chatboty-i-asystenci-ai` | 2 | realne poradnikowo, cenowo nie |
| Automatyzacja faktur i dokumentów | `/uslugi/automatyzacja-dokumentow-i-faktur` | 3 | realne wąskim wejściem |
| Szkolenia | `/uslugi/szkolenia-z-ai-dla-zespolow` | 4 | realne, dwie konkretne frazy |
| Zgodność z AI Act | `/uslugi/zgodnosc-z-ai-act` oraz istniejąca `/ai-act-checklist` | 5 | jedna podpowiedź na 110, popyt niski, ale mamy gotowe aktywa |
| Audyt i doradztwo | `/uslugi/audyt-i-doradztwo-ai` | 6 | brak własnych podpowiedzi, wchodzi jako wsparcie innych stron |
| Strony i oprogramowanie | `/uslugi/strony-i-oprogramowanie-na-zamowienie` | 7 | poza rdzeniem oferty |
| Voicebot | artykuł na blogu, nie osobna usługa | 8 | klaster dostawców platform |
| Lokalne | `/automatyzacja-ai-chojnice` | najniższy | zero podpowiedzi, konkurent już obecny |
| Cena i widełki | `/cennik` | wysoki sprzedażowo, niski wyszukiwarkowo | nierealne jako cel SEO |

Kolejność zmieniła się po zebraniu danych. W pierwszej wersji planu poziom lokalny miał być
pierwszy, bo „najszybciej daje efekt". Podpowiedzi tego nie potwierdziły, więc spada na koniec.
Awansowały szkolenia, bo mają konkretne frazy zakupowe i najniższy próg wejścia dla jednej osoby.

Slugi wzięte z migracji `011_services_content.sql` na gałęzi `feat/strony-uslugowe`, żeby nie tworzyć
drugiego zestawu adresów. Korekta pod frazy dopiero po uzupełnieniu wolumenów.
