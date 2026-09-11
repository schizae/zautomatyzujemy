# Zautomatyzujemy.pl — plan pięciu efektów WOW dla Claude AI

**Data:** 8 września 2026  
**Odbiorca:** Claude AI pracujący w repozytorium `schizae/zautomatyzujemy`  
**Cel:** wdrożyć pięć opisanych niżej ulepszeń wizualnych na bazie obecnej strony, z zachowaniem jej identyfikacji i funkcjonalności.  
**Architektura:** niewielkie komponenty klienckie wewnątrz istniejących sekcji; logika biznesowa, źródła danych i Server Components pozostają na swoich miejscach.  
**Technologie:** Next.js App Router, React, TypeScript strict, Tailwind CSS, istniejący Framer Motion, SVG, Web Animations API. Bez nowych zależności.  
**Tryb pracy:** realizacja etapami, według `executing-plans`, jeżeli skill jest dostępny. Ten dokument jest specyfikacją do wykonania, nie poleceniem ponownego projektowania strony od zera.

---

## 1. Wiadomość właściciela i granice zadania

Właściciel zaakceptował **wszystkie pięć propozycji**:

1. Klara reagująca na ruch myszy i stan rozmowy.
2. Interaktywna mapa automatyzacji powiązana z wyborem usługi.
3. Kalkulator ROI pokazujący odzyskany czas.
4. Filmowe wejście do sekcji kontaktowej.
5. Precyzyjne reakcje przycisków i kart.

Właściciel chce zobaczyć, jak Claude poradzi sobie z implementacją tego planu. **To konkretne zlecenie obejmuje frontend i animacje.** Starsza notatka `docs/animacje-main-handoff.md`, przypisująca frontend wyłącznie Codexowi, nie wyklucza wykonania tego nowego zadania przez Claude’a. Pozostałe reguły repozytorium nadal obowiązują.

Nie zmieniaj całej kompozycji, palety, fontów, logo ani języka marki. Nie dodawaj nowych obietnic marketingowych, fikcyjnych klientów, wyników wdrożeń ani integracji, których strona rzeczywiście nie wykonuje.

**Oczekiwany rezultat:** działająca, sprawdzona wersja lokalna i gałąź do przeglądu. Nie publikuj automatycznie tych nowych zmian na produkcji. Wcześniejsza publikacja animacji z PR #14 dotyczyła poprzedniego zakresu, nie odbioru tej implementacji.

## 2. Punkt startowy — bardzo ważne

Adres strony: https://www.zautomatyzujemy.pl/  
Repozytorium: https://github.com/schizae/zautomatyzujemy

W chwili przygotowania dokumentu lokalny `main` wskazuje commit:

```text
61a07a589a1bab8189c85ddc75528b78b9d2af77
Merge pull request #14 from schizae/codex/animacje-main
```

To sprawdzony punkt odniesienia, nie polecenie cofania nowszych commitów. Zanim zaczniesz:

```bash
git status --short
git fetch origin
git log -5 --oneline origin/main
```

Jeżeli katalog jest czysty, przejdź na aktualny main i utwórz gałąź:

```bash
git switch main
git pull --ff-only origin main
git switch -c codex/claude-motion-five-effects
```

Jeżeli są cudze zmiany, zachowaj je i zastosuj izolację zgodną z regułami repo. Nie wykonuj `reset --hard`, nie czyść schowków i nie aplikuj starych animacji ze stasha.

**Nie używaj gałęzi `feat/strony-uslugowe` jako wzorca wyglądu.** Powstała przed redesignem.

### Co już jest wdrożone

- Nagłówek pisany litera po literze, migający czerwony kursor, końcowe podkreślenie.
- Metalowa forma Klary z delikatnym ruchem i ścieżkami sygnałów SVG.
- Pauza animacji hero, obsługa widoczności strony i ograniczenia ruchu.
- Demonstracja: wpisywana wiadomość → skanowanie → zgłoszenie → szkic odpowiedzi; przycisk powtórzenia.
- Łagodne przewijanie kółkiem na urządzeniach z precyzyjnym wskaźnikiem i animowane kotwice.
- Wolniejsze wejścia treści, reakcje linków i strzałek, menu mobilne.
- Czat z Escape, fokusem po otwarciu i powrotem fokusu po zamknięciu.
- Usunięta grafika wstęgi powodująca widoczny prostokąt w karcie usług.

**Nowa praca rozwija te rozwiązania. Nie twórz drugiego maszynopisu, drugiego silnika scrolla ani konkurencyjnej demonstracji procesu.**

## 3. Styl: redakcyjna elegancja + precyzja technologii

Strona ma wyglądać jak dopracowana marka projektująca praktyczne rozwiązania AI dla biznesu. Charakter technologiczny wyrażamy ruchem, głębią, połączeniami i odpowiedzią na interakcję.

### Nienaruszalna baza

| Element | Obecna wartość / zasada |
|---|---|
| Tło jasne | `#f5f2ed` |
| Powierzchnie kart | `#faf8f5`, lokalnie `#fffdfa` |
| Tekst główny | `#151719` |
| Tekst drugorzędny | `#62625d` |
| Główny akcent | `#c93820` |
| Światło i impulsy | `#f34c30` |
| Ciemne sekcje | `#101214` |
| Typografia | obecne `font-body`, `font-editorial`, `font-label` i ich mapowanie w projekcie |
| Charakter | duże nagłówki, kursywa redakcyjna, spokojna przestrzeń, metalowe ilustracje |

Monospace stosuj tylko do krótkich oznaczeń procesu i danych. Nie zmieniaj całej strony w terminal. Zachowaj czytelne, polskie nazwy dla odbiorcy biznesowego.

### Język ruchu

- Główne wrażenie: płynność, precyzja, kontrolowana energia.
- Maksymalnie jeden dominujący efekt w aktualnym obszarze uwagi.
- Ruch towarzyszy działaniu: wskazaniu, wybraniu usługi, zmianie suwaka, dojściu do kontaktu.
- Głębia jest subtelna. Nie stosuj gwałtownego przechylania całych sekcji.
- Zachowaj zwykły kursor systemowy. Bez globalnego śladu kursora, deszczu kodu, glitchowania tekstu i konfetti.
- Nie dodawaj loadera ani sekwencji startowej blokującej dostęp do strony.
- Nie wydłużaj bardziej istniejącego maszynopisu. Nowy efekt hero ma z nim współpracować.

### Parametry startowe do dostrojenia w przeglądarce

| Interakcja | Parametry |
|---|---|
| Metal Klary za kursorem | przesunięcie do ±10 px, obrót do ±2° |
| Warstwa ścieżek za kursorem | przesunięcie do ±4 px, delikatnie przeciwne do metalu |
| Wygładzenie kursora | sprężyna bez widocznego odbicia; punkt startowy stiffness 120, damping 24, mass 0,8 |
| Powrót po opuszczeniu karty | około 400–550 ms |
| Zmiana mapy usługi | 350–550 ms; wyjście krótsze od wejścia |
| Liczby ROI | 450–650 ms do nowego celu, bez overshootu |
| Magnetyzm CTA | maksymalnie ±3 px, wyłącznie wnętrze przycisku |
| Naciśnięcie CTA | skala około 0,98; 100–150 ms |
| Refleks karty | niska widoczność, maksimum około 0,10 opacity |
| Kontakt | skala tła 1,06 → 1,00; pionowe przesunięcie w granicach ±16 px |

To limity kierunku artystycznego, nie powód do naruszania responsywności. Na małych ekranach amplitudy ograniczamy lub wyłączamy.

## 4. Techniki i zasady implementacji

### Wykorzystaj istniejące narzędzia

- **Framer Motion:** Motion Values, sprężyny, kontrolery animacji, `AnimatePresence`, obserwacja viewportu i postępu scrolla. Zweryfikuj eksporty i typy w zainstalowanej wersji przed użyciem API.
- **SVG:** połączenia, węzły, śledzenie przebiegu sygnału, maski i przycinanie ilustracji.
- **Web Animations API:** lokalne, jednorazowe wejścia, z anulowaniem przy odmontowaniu i zmianie preferencji ruchu.
- **Tailwind:** wygląd, breakpointy, stany focus/hover/active, ograniczenie ruchu.
- **React:** wybrany węzeł, wybrana usługa i inne semantyczne stany. Nie wysyłaj współrzędnych kursora do `setState` przy każdym ruchu.

Nie instaluj GSAP, Lenis, Three.js, React Three Fiber, bibliotek grafów ani nowego systemu komponentów. Obecne zasoby wystarczą do tych efektów.

### Zgodność z regułami projektu

Przeczytaj `AGENTS.md` i wskazane pliki `.claude/rules/`. Korzystaj wyłącznie z npm. Brak `any`, `@ts-ignore`, nowych zależności i sekretów w repo.

Projekt zabrania ręcznego custom CSS i `style={...}` dla stylowania. Stosuj klasy Tailwind i istniejące wzorce animacji. Dynamiczne wartości podawaj przez kontrolery Framer Motion / jego propsy animacji lub WAAPI; SVG może korzystać z atrybutów. Nie dodawaj arkusza CSS ani bloku `<style>` jako skrótu. Nie rozbudowuj globalnych styli tylko po to, aby obsłużyć jedną kartę.

Nie łącz dwóch niezależnych animatorów na tej samej właściwości `transform` tego samego elementu. Rozdziel warstwy, np.:

```text
Karta Klary — nieruchoma; obsługuje pointer i przyciski
├── warstwa paralaksy metalu
│   └── istniejący spokojny ruch ilustracji
├── warstwa paralaksy ścieżek
│   └── istniejący ruch sygnałów SVG
├── warstwa kontrastu dla tekstu
└── tekst, pauza i CTA — nieruchome
```

Motion Values nie oznaczają zgody na ukrycie podstawowej treści podczas SSR. Statyczny HTML ma zawierać komplet tekstu, wartości i właściwy stan końcowy. Ulepszenia uruchamiaj dopiero w przeglądarce.

### Wspólne bramki ruchu

```text
ambientAllowed = !reducedMotion && pageVisible && sectionVisible && !paused
pointerAllowed = ambientAllowed && finePointer && supportsHover
```

Pauza istniejąca przy Klarze obejmuje całą jej dekorację, także nowe warstwy. Nie zatrzymuje rozmowy ani nie ukrywa informacji o stanie połączenia. Semantyczne zmiany, takie jak wynik ROI czy wybór usługi, zawsze następują; przy reduced motion po prostu bez animacji.

---

## 5. Efekt 1 — Klara reagująca na użytkownika

### Jak ma to wyglądać

Użytkownik przesuwa mysz po karcie Klary. Metalowa forma reaguje spokojnym przesunięciem i minimalnym obrotem. Ścieżki sygnałów poruszają się odrobinę inaczej, tworząc wrażenie kilku planów. Tekst i przyciski nie uciekają spod kursora.

Po opuszczeniu karty warstwy wracają do pozycji neutralnej. Powrót nie wywołuje kołysania.

Podczas rozmowy dekoracja odzwierciedla **rzeczywisty stan**:

| Stan z istniejącego hooka | Zachowanie wizualne |
|---|---|
| `idle` | obecny spokojny ruch oraz subtelna reakcja na pointer |
| `connecting` | jeden spokojny sygnał wejściowy; bez udawania gotowego połączenia |
| `active` + `listening` | delikatne impulsy skierowane ku formie |
| `active` + `thinking` | uporządkowany przebieg sygnału po ścieżkach |
| `active` + `speaking` | istniejące pulsowanie formy i sygnały wychodzące |
| `denied` / `error` | neutralna dekoracja; istniejący czytelny komunikat błędu |

Hook udostępnia status i aktywność, **nie poziom głośności audio**. Nie wymyślaj `volume`, `audioLevel` ani dostępu do analizatora dźwięku. Nie uruchamiaj mikrofonu dla efektów wizualnych.

### Pliki

- Zmień `components/marketing/hero-section.tsx`.
- Rozwiń `components/marketing/neural-traces.tsx`.
- Przeczytaj `components/voice/klara-provider.tsx` i `components/voice/use-voice-call.ts`; nie zmieniaj ich protokołu.
- Zachowaj `components/marketing/typewriter-heading.tsx`.
- Jeżeli wydzielasz obsługę pointera, utwórz jeden współdzielony hook `components/marketing/use-pointer-motion.ts`, wykorzystywany także w efekcie 5.

### Kroki

- [ ] Zmierz granice nieruchomej karty, nie transformowanej ilustracji.
- [ ] Przelicz lokalne współrzędne na zakres od −1 do 1, z clampem.
- [ ] Zasil sprężyny / kontrolery, bez renderowania całego hero przy każdym ruchu.
- [ ] Oddziel paralaksę od istniejącej animacji transform ilustracji.
- [ ] Dodaj powrót do zera na pointerleave, utracie widoczności, pauzie i zmianie preferencji.
- [ ] Powiąż prędkość i kierunek istniejących ścieżek z realnymi stanami hooka.
- [ ] Na touch wyłącz paralaksę; zachowaj stan połączenia i obecne kontrolki.

Przykład kompletnej funkcji normalizującej, jeśli taki helper okaże się potrzebny:

```ts
function normalizePointer(position: number, start: number, size: number): number {
  if (size <= 0) return 0
  return Math.max(-1, Math.min(1, ((position - start) / size - 0.5) * 2))
}
```

**Odbiór:** przesunięcie nie przekracza limitu; karta nie powoduje overflow; CTA pozostają nieruchome; pauza i reduced motion zerują reakcję; nie występują żądania głosowe bez kliknięcia użytkownika.

## 6. Efekt 2 — interaktywna mapa usług

### Jak ma to wyglądać

Zachowaj lewą listę usług. Prawa jasna karta staje się interaktywną ilustracją wybranej usługi. Niewielkie węzły łączą cienkie linie. Wskazanie, fokus lub kliknięcie węzła podświetla jego połączenia i pokazuje krótkie objaśnienie w stałym miejscu pod diagramem.

Zmiana usługi przebudowuje mapę płynnie, bez przeskoku wysokości i migotania całej sekcji. Przyciski kontaktowe nadal prowadzą do obecnych celów.

### Zawartość pięciu map

| Usługa | Węzły w kolejności |
|---|---|
| AI i automatyzacje | Wiadomość → AI porządkuje dane → CRM / zgłoszenie → Szkic odpowiedzi |
| Aplikacje dla biznesu | Potrzeba zespołu → Prototyp → Połączenie systemów → Gotowa aplikacja |
| Strony internetowe | Oferta i odbiorcy → Treść i projekt → Responsywna strona → Kontakt od klienta |
| Szkolenia z AI | Potrzeby zespołu → Praktyczne ćwiczenia → Weryfikacja odpowiedzi → Materiały do pracy |
| Audyty i plan wdrożenia | Przegląd procesów → Możliwości i ryzyka → Priorytety → Plan działania |

Mapy przedstawiają **przykładowy przebieg**, nie potwierdzenie działającego połączenia z CRM użytkownika. Zachowaj informację „Ilustracja procesu · bez wysyłania danych”.

### Połączenie z obecną demonstracją

Nie usuwaj `AutomationFlow` i nie wyświetlaj dwóch pełnych diagramów równocześnie. W pierwszej usłudze mapa pełni funkcję sterowania sceną:

- Wiadomość wybiera początek istniejącej demonstracji.
- AI wybiera etap skanowania i porządkowania.
- Zgłoszenie wybiera wypełnione pola.
- Szkic odpowiedzi wybiera końcowy rezultat.

Kliknięcie węzła przerywa automatyczną sekwencję i pokazuje wybrany etap. „Powtórz animację” wraca do pełnego odtworzenia. Fokus i hover tylko objaśniają węzeł — nie resetują sekwencji przy każdym ruchu myszy.

Możesz rozszerzyć `AutomationFlow` o kontrolowany etap. Nazwy nowych propsów są decyzją implementacyjną; dopilnuj jednego źródła prawdy i anulowania poprzednich timerów.

### Technika i pliki

- Zmień `components/marketing/services-section.tsx` i `components/marketing/automation-flow.tsx`.
- Dodaj `components/marketing/service-flow-map.tsx` dla prezentacji i interakcji mapy.
- Węzły jako prawdziwe przyciski z istniejącego `Button`; SVG wyłącznie jako dekoracyjne połączenia.
- Stabilne identyfikatory węzłów; `AnimatePresence` i kontrolowane przejścia. Nie implementuj ogólnego edytora grafów.
- Układ desktop: poziomy lub dwurzędowy. Mobile: pionowy, bez poziomego przewijania i bez zmniejszania tekstu do mikroskopijnego rozmiaru.
- Preferuj stałą geometrię dla czterech węzłów. Jeżeli pomiar jest konieczny, aktualizuj go przez `ResizeObserver`, nie w każdej klatce.
- Linie prowadź do krawędzi węzłów; nie przez tekst.

### Kroki i odbiór

- [ ] Każda z pięciu usług otrzymuje własne węzły i krótkie, zgodne z treścią objaśnienia.
- [ ] Węzeł dostępny myszą, dotykiem i klawiaturą; Enter/Space wybiera.
- [ ] Panel opisu ma zarezerwowane miejsce; hover nie przesuwa CTA.
- [ ] Szybkie zmiany usług nie zostawiają starego opisu ani aktywnej sekwencji.
- [ ] Stan aktywny odróżnia się także obrysem lub ikoną, nie wyłącznie kolorem.
- [ ] Reduced motion pokazuje wybraną mapę i etap natychmiast.
- [ ] Nie ma nowych requestów do backendu podczas używania mapy.

## 7. Efekt 3 — ROI: zobacz odzyskany czas

### Jak ma to wyglądać

Zmiana suwaka płynnie aktualizuje liczby. Nie resetuj ich do zera. Obok lub w obrębie obecnej karty wyników pojawia się czytelna ilustracja czasu:

- „Obecnie”: cały miesięczny czas ręcznej pracy.
- „Po automatyzacji — scenariusz”: 30% czasu pozostającego.
- Czerwony fragment: 70% czasu potencjalnie odzyskanego, z podaną liczbą godzin.

Przy pierwszym wejściu ilustracja jednorazowo rozdziela cały czas na pracę pozostającą i odzyskaną. Przy zmianie danych aktualizuje się od bieżącej wartości do nowej. To ma przypominać porządkowanie pracy, nie jackpot.

### Matematyka pozostaje obecna

W `roi-calculator.tsx` jest już założenie 70% redukcji, jawnie opisane jako scenariusz. Zachowaj je, wszystkie wejścia i zastrzeżenia. Nie dodawaj twierdzenia, że firma gwarantuje takie oszczędności.

```text
wykonaniaMiesięcznie = częstotliwość × mnożnik
czasMiesięczny = (minutyZadania / 60) × wykonaniaMiesięcznie × liczbaOsób
kosztMiesięczny = czasMiesięczny × stawkaGodzinowa
odzyskanyCzas = czasMiesięczny × 0,7
pozostającyCzas = czasMiesięczny × 0,3
wartośćOdzyskanegoCzasu = kosztMiesięczny × 0,7
```

Mnożniki: dziennie 22, tygodniowo 4,33, miesięcznie 1. Zaokrąglaj do prezentacji, nie po każdym kroku obliczenia.

**Przypadek kontrolny z obecnych ustawień:** 30 min, 3 razy dziennie, 60 zł/h, 2 osoby → 66 h/miesiąc, 3960 zł kosztu, 2772 zł wartości odzyskanego czasu miesięcznie, 33 264 zł rocznie. Nowa ilustracja: 46,2 h odzyskane i 19,8 h pozostające.

**Ważne:** stosunek 70/30 jest stały w tym scenariuszu. Nie udawaj, że procent zmienia się z suwakiem. Zmieniają się liczby godzin. Jeśli pokazujesz długości zależne od godzin, obie porównywane wartości muszą mieć tę samą, widoczną skalę. Nie zmieniaj skali po cichu przy każdej interakcji.

### Technika i pliki

- Zmień `components/marketing/roi-calculator.tsx`.
- Dodaj `components/marketing/roi-time-visual.tsx` dla ilustracji.
- Opcjonalnie dodaj `components/marketing/animated-value.tsx`, jeżeli naprawdę współdzielisz animację kilku wartości. Sprawdź istniejący `AnimatedCounter` w `components/animations/index.tsx`; nie zakładaj, że obsługuje płynne aktualizacje, formatowanie i SSR bez zmian.
- Do liczb użyj Motion Value / kontrolowanej interpolacji, z anulowaniem poprzedniego celu. Aktualna wartość biznesowa pozostaje w React; animowana prezentacja nie jest źródłem obliczeń.
- `Intl.NumberFormat('pl-PL')`, cyfry tabelaryczne tam, gdzie nie pogarszają obecnej typografii, odpowiednia szerokość na duże wyniki.
- Czytnik ekranu otrzymuje końcowy wynik, nie 60 komunikatów na sekundę. Animowany duplikat wizualny oznacz `aria-hidden`, a finalny tekst dostępny aktualizuj spokojnie po zakończeniu interakcji.
- Wizualizację rysuj SVG albo płaskimi elementami transformowanymi przez `scaleX`, nie animacją layoutowej szerokości całej karty.

### Kroki i odbiór

- [ ] Zanotuj wyniki przed zmianą komponentu dla ustawień domyślnych i skrajnych.
- [ ] Dodaj interpolację startującą od aktualnej liczby, bez overshootu i wartości ujemnych.
- [ ] Dodaj podział czasu z jednoznacznymi podpisami i scenariuszem 70/30.
- [ ] Sprawdź szybkie przeciąganie suwaka w obie strony i zmianę jednostki częstotliwości.
- [ ] Sprawdź maksymalne wartości wejść: tekst nie wychodzi z karty; nie ukrywaj pełnej wartości skrótem bez dostępnego odpowiednika.
- [ ] Reduced motion pokazuje od razu dokładną wartość.
- [ ] Obliczenia, formularze i istniejące zastrzeżenia nie uległy zmianie.

## 8. Efekt 4 — filmowe wejście do kontaktu

### Jak ma to wyglądać

Istniejąca ilustracja drzwi nabiera głębi. W miarę dojścia do sekcji kamera wykonuje łagodny najazd, a warstwa przyciemniająca stopniowo odsłania światło. Nagłówek i przyciski nadal są czytelne od razu; ich wejścia współgrają z tłem.

Nie twórz nowych drzwi ani nowego obrazu. Pracuj na `public/redesign/contact-door.webp`. Nie przypinaj sekcji na kilka ekranów i nie wymagaj „dokończenia filmu”, żeby otworzyć formularz.

### Technika

- Zmień `components/marketing/contact-section.tsx`.
- Obserwuj postęp wejścia tej sekcji przez istniejący Framer Motion `useScroll` albo ograniczony listener połączony z requestAnimationFrame. Preferuj bibliotekę już używaną w projekcie.
- Powiąż skalę i przesunięcie tła z postępem, a nie z niekończącą się pętlą.
- Początek: górna krawędź sekcji pojawia się na dole viewportu. Koniec: sekcja zajmuje dostępną przestrzeń nad stopką. Sprawdź krótki wariant kontaktu — koniec animacji musi być osiągalny również przy dolnej granicy dokumentu.
- Na końcu pokaż stabilny stan; nie dodawaj odbicia po zatrzymaniu scrolla.
- Wydziel wrapper obrazu, warstwę przyciemniającą i treść. Transformuj wyłącznie tło.
- Utrzymaj zapas obrazu pod kadrem, aby przy ruchu nie odsłaniać pustych krawędzi.
- Maksymalna skala na telefonie około 1,02 lub całkowicie statyczne tło, jeżeli urządzenie wymaga uproszczenia.

### Kroki i odbiór

- [ ] Sprawdź aktualny kadr i wysokość kontaktu z zamkniętym oraz otwartym formularzem.
- [ ] Dodaj ograniczony zakres ruchu tła i kontrolowane odsłanianie istniejącej warstwy światła.
- [ ] Nie nakładaj drugiego wejścia na te same nagłówki, które już mają `RevealText`.
- [ ] Kliknięcie CTA z hero i linku w menu prowadzi do poprawnej pozycji mimo animacji.
- [ ] Otwarcie formularza aktualizuje pomiary bez skoku kamery i nie zwija formularza.
- [ ] Cofanie scrolla płynnie odwraca ruch tła; nic nie zasłania pól ani linków.
- [ ] W reduced motion końcowy, czytelny kadr jest widoczny natychmiast.

## 9. Efekt 5 — detale przycisków i kart

### Jak ma to wyglądać

Wybrane główne CTA reagują na pointer o kilka pikseli, a strzałka delikatnie podąża w kierunku działania. Kliknięcie daje krótki nacisk. Karty dostają subtelny refleks przy krawędzi, pojawiający się tylko podczas wskazania.

Efekt ma być dostrzegalny po użyciu, a nie stale dominować nad treścią.

### Gdzie stosować

| Miejsce | Efekt |
|---|---|
| Główne CTA hero | ruch wnętrza do ±3 px, strzałka, nacisk |
| CTA kontaktu | ten sam język nacisku i strzałki |
| Karta wyników ROI | lokalny, dyskretny refleks |
| Karty bloga | refleks / delikatna zmiana krawędzi; zachować obecny ruch obrazu |
| Nawigacja, formularze, przyciski mapy | standardowy focus/hover; bez magnetyzmu |

### Technika i ograniczenia

- Strefa klikalna i układ pozostają nieruchome. Poruszaj wewnętrzną warstwą dekoracji lub treści CTA, nie całym elementem pod kursorem.
- Ponownie wykorzystaj lokalny helper pointera z hero, jeśli został wydzielony. Nie twórz jednego globalnego listenera przeliczającego wszystkie karty naraz.
- Refleks: lokalna przycięta warstwa z gradientem Tailwind, przesuwana kontrolerem lub WAAPI; niska opacity. Bez kosztownej animacji dużego rozmycia i cienia w każdej klatce.
- Dekoracja `pointer-events-none` i `aria-hidden`.
- Na klawiaturze widoczny ring/obrys, bez ruchu uciekającego elementu. Na dotyku wyłącznie krótka odpowiedź na naciśnięcie.
- `disabled`, loading, link z `asChild` i formularz submit muszą zachować obecne działanie.
- Nie zmieniaj globalnie `components/ui/button.tsx`, jeśli efekt dotyczy tylko marketingu. Dodaj lokalny wrapper, np. `components/marketing/motion-cta.tsx`, o minimalnym kontrakcie dla faktycznych zastosowań.
- Ewentualny wrapper kart: `components/marketing/interactive-surface.tsx`. Nie zamieniaj karty zawierającej kilka kontrolek w jeden wielki przycisk.

### Odbiór

- [ ] Główne CTA trafia się tak samo łatwo jak przed zmianą.
- [ ] Przejście między hover i focus nie resetuje stanu ani nie wywołuje migotania.
- [ ] Efekty nie uruchamiają się na touch i przy reduced motion, poza natychmiastową zmianą stanu.
- [ ] Otwarcie linku w nowej karcie, Enter, Space dla przycisku i submit formularza działają jak wcześniej.
- [ ] Refleks nie zmniejsza kontrastu tekstu i nie wychodzi poza zaokrąglenie karty.

---

## 10. Mapa plików i kolejność pracy

Nazwy nowych plików są propozycjami dla tej implementacji. Najpierw sprawdź, czy analogiczny helper nie powstał już na nowszym main.

| Etap | Odpowiedzialność | Główne pliki |
|---|---|---|
| 0 | Punkt odniesienia i pomiary | `AGENTS.md`, `.claude/rules/*`, `app/page.tsx`, obecne komponenty |
| 1 | Pointer i neutralizacja ruchu | `use-pointer-motion.ts` tylko jeśli potrzebny współdzielony helper |
| 2 | Klara | `hero-section.tsx`, `neural-traces.tsx` |
| 3 | Detale CTA i kart | `motion-cta.tsx`, `interactive-surface.tsx`, `blog-preview.tsx`, wybrane CTA |
| 4 | Mapa usług | `services-section.tsx`, `service-flow-map.tsx`, `automation-flow.tsx` |
| 5 | ROI | `roi-calculator.tsx`, `roi-time-visual.tsx`, ewentualnie `animated-value.tsx` |
| 6 | Kontakt | `contact-section.tsx` |
| 7 | Integracja, testy i przekazanie | raport, zrzuty i krótkie nagranie lokalne |

Wszystkie wymienione krótkie nazwy komponentów znajdują się lub mają powstać w `components/marketing/`.

Nie rozdzielaj pracy równoległej nad tymi samymi plikami. Jeżeli korzystasz z agentów, każdy musi dostać wyłączną odpowiedzialność za pliki, a integracja hero/services/contact musi mieć jednego właściciela. Zwykła realizacja sekwencyjna jest wystarczająca.

### Etap 0 — przed kodem

- [ ] Przeczytaj reguły, pliki objęte zmianami i sąsiadów planowanych nowych komponentów.
- [ ] Uruchom bieżącą stronę; zapisz zrzuty desktop i mobile oraz wynik obliczeń ROI.
- [ ] Sprawdź obecne zachowanie pauzy, mapy demonstracyjnej, scrolla, formularza i czatu.
- [ ] Zapisz krótko architekturę zmian i punkty, w których zastępujesz istniejący efekt.

### Realizacja każdego etapu

- [ ] Najpierw określ obserwowalne zachowanie i scenariusz regresji.
- [ ] Dla zmian logiki napisz test zachowania przed implementacją, zgodnie z istniejącym zapleczem testowym.
- [ ] Wykonaj minimalny zakres komponentów dla tego etapu.
- [ ] Sprawdź TypeScript, interakcje klawiaturą i reduced motion.
- [ ] Zapisz spójny commit po zakończonym etapie. Nie commituj sekretów, nagrań ani lokalnych konfiguracji przeglądarki.

## 11. Plan weryfikacji końcowej

### Komendy projektu

```bash
npm run type-check
npm run lint
npm run build
git diff --check
```

Nie wykonuj builda i `next dev` równocześnie na tym samym `.next`. Nie instaluj dodatkowych bibliotek testowych bez zgody. W projekcie dostępny był globalny `playwright-cli`; sprawdź jego dostępność we własnym środowisku.

### Minimalna macierz przeglądarkowa

| Warunek | Co sprawdzić |
|---|---|
| 1440×1000 | hero, parallax, cała mapa, ROI, kadrowanie kontaktu |
| 768×1024 | łamanie treści i przejście diagramu między układami |
| 375×812 | brak overflow, pionowa mapa, pełne CTA i wyniki |
| 320 px szerokości | kontrola skrajna: brak uciętych liczb i elementów interaktywnych |
| Touch / coarse pointer | brak hover-only funkcji i magnetyzmu |
| Klawiatura | wszystkie węzły, suwaki, CTA, formularz i czat |
| Reduced motion przy starcie | pełna treść i końcowe wartości, dekoracja nieruchoma |
| Reduced motion zmienione na żywo | aktywne efekty zatrzymują się, stan nie ginie |
| Ukryta karta / sekcja poza widokiem | brak niepotrzebnych pętli i nasłuchu ruchu |
| Pauza hero | wszystkie dekoracje Klary zatrzymane, rozmowa nadal obsługiwana |

### Scenariusze obowiązkowe

1. Przesuń pointer z centrum karty Klary do narożników, następnie poza kartę. Sprawdź limity oraz powrót do neutralnej pozycji.
2. Użyj pauzy i zmień reduced motion. Powtórz interakcję; warstwy pozostają neutralne.
3. Wybierz kolejno wszystkie pięć usług. Sprawdź nazwy węzłów, objaśnienia i zachowanie CTA.
4. W pierwszej mapie wybierz etap w trakcie odtwarzania, potem uruchom „Powtórz animację”. Nie mogą działać dwa konkurencyjne odtwarzania.
5. Obsłuż wszystkie węzły klawiaturą. Opis musi być osiągalny również bez hover.
6. Sprawdź domyślny ROI: 66 h, 3960 zł, 2772 zł/miesiąc, 33 264 zł/rok; wizualizacja 46,2 h odzyskane / 19,8 h pozostające.
7. Przesuwaj suwaki szybko w obie strony, następnie ustaw wartości skrajne. Po zakończeniu animacji liczby muszą dokładnie odpowiadać obliczeniom.
8. Otwórz kontakt przez CTA hero i menu mobilne, następnie otwórz formularz. Sprawdź pozycję scrolla, fokus i kadr tła.
9. Otwórz i zamknij czat przez Escape. Nie wysyłaj wiadomości i nie rozpoczynaj prawdziwej rozmowy głosowej w testach wyglądu.
10. Zbierz krótki profil Performance podczas ruchu pointera i przeciągania suwaka; nie deklaruj „60 FPS” bez pomiaru na opisanym urządzeniu.

### Przykładowy kompletny test zachowania layoutu

Poniższa funkcja nadaje się jako treść pliku przekazywanego do `playwright-cli run-code --filename=...`. Nie jest całym testem akceptacyjnym.

```js
async page => {
  const failures = [];
  for (const width of [1440, 768, 375, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('http://localhost:3000');
    for (const id of ['klara', 'uslugi', 'kalkulator', 'kontakt']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500);
      const overflowing = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth
      );
      if (overflowing) failures.push(`${width}px / ${id}`);
    }
  }
  if (failures.length) throw new Error(`Overflow: ${failures.join(', ')}`);
  return 'Brak poziomego overflow w sprawdzonych sekcjach';
}
```

### Wydajność i dostępność — kryteria, nie obietnice

- Brak nowych zależności i pełnoekranowego canvasu/WebGL.
- React Profiler nie pokazuje renderowania całego hero przy każdym pointermove.
- Żaden nowy efekt nie powoduje layout shiftów podczas wpisywania tekstu, animacji liczb i wyboru węzła.
- Efekty wyłączają się poza widokiem; listenery i animacje są sprzątane przy odmontowaniu.
- Zmierz rozmiar JS dla `/` przed i po tym zadaniu. Cel orientacyjny: przyrost do 10 kB gzip; jeżeli go przekroczysz, opisz konkretną przyczynę. Nie utożsamiaj bez pomiaru wyniku `next build` z gzip.
- Zapisz urządzenie, viewport i warunki dla pomiarów płynności. Nie ukrywaj kosztów dużych obrazów jako kosztów samych animacji.
- Dekoracje nie są odczytywane przez czytnik ekranu, a istotny stan nie jest przekazywany wyłącznie kolorem.

## 12. Znane ograniczenia, których nie należy pomylić z regresją

- Bez JavaScriptu istniejący globalny `app/loading.tsx` pozostawiał stronę w ukrytej granicy streamingu Next.js. To zgłoszone ograniczenie poprzedniej wersji, nie pretekst do ukrywania nowych komponentów w SSR. Jeśli nadal występuje, opisz je osobno; nie deklaruj pełnego zaliczenia testu strony bez JS.
- Lokalnie rozmowa głosowa może być niedostępna z powodu braku konfiguracji endpointu. Do testów wizualnych nie kopiuj kluczy ani nie obchodź konfiguracji.
- W buildzie występowały ostrzeżenia dotyczące Sentry, wykrywania pluginu ESLint i wieku danych Browserslist. Odróżnij stan zastany od błędów wprowadzonych przez siebie.
- Część obrazów bloga jest zewnętrzna. Błąd dostawcy obrazu nie oznacza, że wolno zastąpić treści fikcyjnymi danymi.

## 13. Co oddać właścicielowi

- Działającą wersję lokalną z podanym adresem.
- Gałąź opartą na aktualnym main; draft PR, jeżeli masz skonfigurowany dostęp i wykonujesz przekazanie w GitHub.
- Zrzuty desktop/mobile oraz krótkie nagranie pokazujące wszystkie pięć efektów.
- Listę zmienionych plików i krótki opis odpowiedzialności komponentów.
- Wyniki type-check, lint, build i testów interakcji — wraz z rzeczywistymi ograniczeniami.
- Potwierdzenie, że obliczenia ROI, integracje Klary, formularze, kontakt i treść marki zostały zachowane.

**Praca jest zakończona, gdy wszystkie pięć efektów działa razem i przechodzi odbiór. Sama makieta, animacja jednego komponentu albo opis tego, co można zrobić później, nie jest rezultatem tego zlecenia.**

---

## Prompt startowy do wklejenia Claude’owi

> Wdroż w repozytorium zautomatyzujemy.pl wszystkie pięć efektów opisanych w załączonym planie. Rozpocznij od aktualnego main, zachowaj obecny redesign i już wdrożone animacje. W tym konkretnym zadaniu powierzam Ci frontend, mimo starszego podziału obowiązków zapisanego w repo. Przeczytaj AGENTS.md, reguły projektu i bieżące komponenty. Korzystaj z istniejącego stosu bez dodawania zależności. Wykonuj etapy, sprawdzaj zachowanie w przeglądarce, pokaż lokalny podgląd, nagranie i wyniki testów. Nie publikuj nowej wersji na produkcji przed moim odbiorem. Zależy mi na widocznej jakości ruchu, dobrej wydajności i zachowaniu obecnego stylu — dopracuj wszystkie pięć elementów jako jeden spójny projekt.
