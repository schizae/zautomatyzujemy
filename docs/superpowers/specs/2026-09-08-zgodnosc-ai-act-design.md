# Zgodność z AI Act na zautomatyzujemy.pl — specyfikacja

**Data:** 8 września 2026
**Status:** do akceptacji właściciela przed napisaniem planu wdrożenia
**Baza:** `main` @ `0365218`

## Cel

Wdrożyć u siebie mechanizmy wymagane przez obowiązki przejrzystości z art. 50 AI Act, tak zbudowane, żeby dały się odsprzedać MŚP jako pakiet wdrożeniowy o stałej cenie.

To pierwszy z trzech projektów. Kolejne, poza zakresem tego dokumentu: przebudowa generatora bloga pod widoczność w wyszukiwarce, oraz oferta wraz ze stroną sprzedażową.

## Dlaczego teraz

Obowiązki przejrzystości obowiązują od 2 sierpnia 2026, polska ustawa o systemach AI od 11 sierpnia. **28 października 2026 Komisja Rozwoju i Bezpieczeństwa Sztucznej Inteligencji uzyskuje pełne uprawnienia kontrolne i karne.** Kary sięgają 15 mln € lub 3% obrotu; dla MŚP stosuje się niższą z wartości.

Niezależnie od regulacji: aktualizacja rdzenia Google z marca 2026 wzięła na cel treści skalowane bez nadzoru redakcyjnego, a serwisy publikujące w tym wzorcu traciły 50–80% ruchu. Nasz blog publikuje dwa artykuły tygodniowo z generatora, bez człowieka w pętli.

## Stan zastany — zweryfikowany w kodzie

| Obszar | Stan |
|---|---|
| Czat tekstowy Klary | **Spełnia art. 50 ust. 1.** Powitanie mówi wprost „Rozmawiasz ze sztuczną inteligencją, nie z człowiekiem", nagłówek dodaje „odpowiedzi automatyczne". Powracający użytkownik nadal widzi treść — `localStorage` pomija wyłącznie animację pisania. |
| Kanał głosowy Klary | **Niezweryfikowany.** Asystent konfigurowany po stronie GŁOS, poza tym repozytorium. |
| Blog | **Luka.** `app/api/blog/publish/route.ts:87` ustawia `is_published: true` bezwarunkowo. Artykuły z Gemini publikują się w piątki 9:00 i poniedziałki 7:00 UTC, podpisane „Zautomatyzujemy", bez śladu maszynowego pochodzenia. Tabela `posts` nie ma pola, w którym można by je odnotować. |
| Rejestr systemów AI | Nie istnieje. |
| Tabela ustawień | Nie istnieje. |

## Zakres

### W zakresie

1. Oznaczanie treści generowanych przez AI — model danych, znacznik maszynowy, widoczna adnotacja
2. Przełącznik trybu publikacji bloga: redakcyjny ↔ automatyczny, bez wdrożenia
3. Wewnętrzny rejestr systemów AI
4. Weryfikacja ujawnienia AI w kanale głosowym

### Świadomie poza zakresem

- **Ocena prawna i kwalifikacja ryzyka systemów.** Nie jesteśmy kancelarią. Kwalifikacja „wysokiego ryzyka" i „interesu publicznego" to wykładnia prawa i nie sprzedajemy jej ani sobie, ani klientom.
- **C2PA i XMP dla okładek.** Obrazy przechodzą przez ImgBB, który ścina metadane przy uploadzie. Osadzanie ich byłoby atrapą zgodności.
- **Przebudowa generatora pod SEO.** Osobny projekt, buduje na polach wprowadzonych tutaj.
- **Strona sprzedażowa i cennik.** Dopiero po zmierzeniu rzeczywistego czasu wdrożenia.

## Model danych

### `posts` — trzy nowe kolumny

| Kolumna | Typ | Rola |
|---|---|---|
| `ai_generated` | `BOOLEAN NOT NULL DEFAULT false` | Czy treść powstała maszynowo |
| `ai_model` | `TEXT` | Model użyty do wygenerowania, np. `gemini-2.5-flash` |
| `reviewed_at` | `TIMESTAMPTZ` | Kiedy zatwierdzono redakcyjnie |

Dwie pierwsze niosą znacznik. Trzecia jest dowodem kontroli redakcyjnej — czyli podstawą zwolnienia z art. 50 ust. 4.

Świadomie **nie ma kolumny `reviewed_by`**. Panel admina chroni jedno wspólne hasło z `ADMIN_SECRET`, bez kont użytkowników, więc pole zapisywałoby zawsze tę samą wartość i nie niosłoby informacji. Przy wdrożeniach u klientów z wieloma redaktorami to naturalny punkt rozszerzenia.

Istniejące wpisy dostają `ai_generated = false`. Nie mamy pewności co do pochodzenia każdego z nich, a oznaczanie wstecz na podstawie domysłu byłoby zmyślaniem dowodu.

### `app_settings` — nowa tabela

Klucz, wartość, `updated_at`. Jeden wiersz na start: `blog_publish_mode` o wartości `review` albo `auto`.

Nie używam do tego `page_content`, mimo podobnego kształtu: edytor treści w panelu iteruje po kluczach tej tabeli, więc flaga trybu wylądowałaby w interfejsie obok nagłówków sekcji marketingowych.

## Oznaczanie treści

Działa w obu trybach publikacji. Trzy warstwy:

**1. Meta tagi** w `generateMetadata` artykułu — para znaczników deklarujących maszynowe pochodzenie i użyty model.

**2. JSON-LD** — rozszerzenie istniejącego obiektu `Article` o wartość ze słownika IPTC `digitalSourceType`, URI `http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia`. Ten sam słownik stosują Meta i Google do oznaczania mediów AI.

**3. Widoczna adnotacja** na końcu artykułu, dyskretna typograficznie — mniejszy stopień pisma, kolor tekstu drugorzędnego, oddzielona linią.

### Treść adnotacji zależy od trybu

Adnotacja musi mówić prawdę o tym, jak wpis powstał. Zdanie o weryfikacji redakcyjnej pod tekstem, którego nikt nie czytał, jest nie tylko nieuczciwe — podważa dokładnie to zwolnienie, na którym opieramy zgodność w trybie redakcyjnym.

- Tryb redakcyjny: *„Tekst przygotowany przez redaktora AI Zautomatyzujemy.pl, sprawdzony przed publikacją 8 września 2026."*
- Tryb automatyczny: *„Tekst przygotowany przez redaktora AI Zautomatyzujemy.pl, publikowany automatycznie."*

### Uczciwe zastrzeżenie co do standardu

**Dla tekstu publikowanego na stronie nie istnieje dziś przesądzony format oznaczenia czytelnego maszynowo.** Kodeks praktyk do art. 50 wciąż powstaje. Słownik IPTC jest standardem dla mediów osadzanych w XMP, nie dla tekstu w HTML.

Budujemy więc **uzasadnioną interpretację opartą na uznanym słowniku**, nie zgodność certyfikowaną. Dokładnie to samo mówimy klientowi i zapisujemy w umowie. Nie obiecujemy „gwarancji zgodności" — nikt dziś nie może jej dać.

## Przełącznik trybu publikacji

`/api/blog/publish` odczytuje `blog_publish_mode` przed zapisem:

- `review` → `is_published: false`, `published_at: null`, wpis czeka w panelu
- `auto` → zachowanie dzisiejsze

Znacznik zapisywany jest w obu trybach. To dlatego przełącznik jest bezpieczny: w trybie redakcyjnym zgodność opiera się na zwolnieniu z kontroli redakcyjnej, w automatycznym — na znaczniku. Jedno zabezpiecza drugie.

Przełącznik w panelu admina opisany konsekwencją, nie samą nazwą: *„Automat — artykuły trafiają na stronę bez sprawdzenia. Zgodność opiera się wtedy wyłącznie na znaczniku maszynowym."*

Do tego powiadomienie mailowe przez istniejącą integrację Resend, gdy szkic czeka na zatwierdzenie.

## Rejestr systemów AI

**Wyłącznie wewnętrzny**, za logowaniem do panelu admina. Decyzja właściciela: nie pokazujemy konkurencji, z czego i jak korzystamy.

Typowana stała w kodzie plus prosta strona — bez tabeli w bazie, bo to pięć pozycji zmienianych raz na kwartał. Pozycje: czat tekstowy Klary, kanał głosowy Klary, `blog-auto`, `blog-brief`, embeddingi bazy wiedzy. Przy każdej: model, cel, dane wejściowe i nasza rola w rozumieniu rozporządzenia — dostawca czy podmiot stosujący.

## Zadanie poza kodem

**Weryfikacja kanału głosowego.** Trzeba sprawdzić w panelu Vapi, czy asystent na początku rozmowy informuje, że jest sztuczną inteligencją. To ten sam obowiązek z art. 50 ust. 1, który czat tekstowy spełnia wzorowo. Jeśli brakuje — poprawka idzie w konfiguracji asystenta, nie w tym repozytorium. Zadanie dla właściciela.

## Kryteria akceptacji

1. Każdy artykuł oznaczony jako wygenerowany maszynowo niesie znacznik w meta tagach i JSON-LD oraz widoczną adnotację zgodną z trybem, w którym powstał
2. Przełączenie trybu w panelu zmienia zachowanie publikacji bez wdrożenia i bez restartu
3. W trybie redakcyjnym wpis z generatora nie pojawia się publicznie do czasu zatwierdzenia, a zatwierdzenie zapisuje `reviewed_at`
4. W trybie automatycznym zachowanie publikacji jest identyczne z dzisiejszym, wzbogacone o znacznik
5. Rejestr systemów AI dostępny po zalogowaniu, niedostępny publicznie
6. Istniejące artykuły, formularze, czat i kalkulator działają bez zmian
7. `npm run type-check`, `npm run lint` i `npm run build` przechodzą

## Do potwierdzenia przy pisaniu planu

- Dokładna składnia osadzenia wartości IPTC w obiekcie `Article` schema.org — sprawdzić w dokumentacji schema.org, nie zakładać z pamięci
- Czy `blog-brief.mjs` wymaga tych samych zmian co `blog-auto.mjs`, czy różni się kształtem payloadu
