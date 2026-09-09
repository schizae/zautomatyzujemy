# Stan prac i kolejka — przekazanie

9 września 2026. Dokument zbiorczy: gdzie jesteśmy, jakie zasady obowiązują i co robimy dalej. Powstał, żeby dało się zacząć nową sesję bez odtwarzania kontekstu z rozmowy.

## Gdzie jesteśmy

Na produkcji stoi redesign premium z jasną paletą, komplet animacji (typewriter w hero, metalowa forma Klary ze ścieżkami sygnałów, interaktywna mapa usług sterująca sceną demonstracji, wizualizacja odzyskanego czasu w kalkulatorze ROI, filmowe wejście do sekcji kontaktu) oraz pełna obsługa kont klientów — rejestracja z potwierdzeniem adresu, logowanie i reset hasła.

Zamknięte we wrześniu: PR #9 i #10 (konta i SSR formularza logowania), #11 (Sentry raportuje wyłącznie z produkcji), #12 (`AGENTS.md` i plan RAG do repo, jeden komplet reguł w `.claude/rules/`), #13 (przygotowanie `main` pod animacje), #14 i #15 (animacje). Po nich Codex dołożył interaktywne scenariusze, przebudowę demonstracji na trzy akty i spójne ilustracje bloga.

## Mapa wytycznych

**Reguły projektu mają pierwszeństwo przed regułami skilli.** Komplet leży w `.claude/rules/` i obowiązuje obu agentów — Codeksa przez `AGENTS.md`, Claude'a przez `CLAUDE.md`. Oba pliki wskazują na ten sam katalog; drugi komplet oznaczałby rozjazd przy pierwszej zmianie.

Najczęściej naruszane w praktyce, więc warto mieć przed oczami:

- **Zakaz zgadywania.** Import, sygnatura, nazwa zmiennej środowiskowej, klasa Tailwind — sprawdź w kodzie, zanim napiszesz. Jeśli nie da się sprawdzić, powiedz to zamiast zakładać.
- **Czytaj sąsiadów przed utworzeniem pliku.** Nowy plik ma pasować do konwencji projektu, nie do gustu autora.
- **Bez `any`, bez `as` bez type guarda.** `tsconfig` ma `strict`, `noUncheckedIndexedAccess` i `exactOptionalPropertyTypes` — ten ostatni potrafi odrzucić warunkowe `undefined` w propsach.
- **Bez custom CSS i `style={}` do stylowania.** Wyjątkiem są wartości animacji podawane przez kontrolery Framer Motion — to transport animacji, nie styl.
- **Menedżer pakietów: wyłącznie npm.** `pnpm add` tworzy drugi lockfile i psuje ESLinta.
- **Nie dodawaj zależności bez pytania.**

**Podział pracy z Codeksem:** domyślnie frontend i design prowadzi Codex, Claude robi funkcjonalność. To domyślny podział, nie zakaz — właściciel może przydzielić Claude'owi konkretne zadanie frontendowe i wtedy wykonuje je w całości. Tak było z pięcioma efektami ruchu w PR #15.

## Co robimy dalej — trzy projekty po kolei

### 1. Zgodność z AI Act — spec gotowy, czeka na przegląd właściciela

Spec: `docs/superpowers/specs/2026-09-08-zgodnosc-ai-act-design.md`.

Wdrażamy u siebie mechanizmy z art. 50, zbudowane tak, żeby dały się odsprzedać MŚP jako pakiet o stałej cenie. Napędza to termin **28 października 2026**, gdy KRiBSI uzyskuje uprawnienia kontrolne i karne.

Decyzje podjęte i zamknięte: sprzedajemy wdrożenie techniczne, nie doradztwo prawne; stała cena plus opcjonalna opieka; najpierw wdrożenie u siebie, dopiero potem oferta; rejestr systemów AI wyłącznie wewnętrzny; adnotacja pod artykułem dyskretna i zależna od trybu publikacji.

Powód, dla którego to pierwsze: `app/api/blog/publish/route.ts` ustawia `is_published: true` bezwarunkowo, więc artykuły z Gemini idą na żywo dwa razy w tygodniu bez śladu maszynowego pochodzenia i bez nadzoru redakcyjnego. To jednocześnie luka regulacyjna i dokładnie ten wzorzec, w który uderzyła aktualizacja rdzenia Google z marca 2026.

### 2. Blog jako kanał widoczności

Przebudowa generatora pod wyszukiwanie: research słów kluczowych, dobór tematów pod intencję, głębia ekspercka, linkowanie wewnętrzne. Buduje na polach z projektu 1, więc idzie po nim.

Dziś tematy dobierane są na wyczucie — prompt w `blog-auto.mjs` każe tylko unikać powtórzeń i nie dostaje żadnych danych o popycie wyszukiwawczym. Skill `.claude/commands/seo.md` to audyt techniczny (meta, JSON-LD, sitemapa, Core Web Vitals), nie strategia treści; do tego projektu nie wystarczy.

### 3. Ulepszenia strony

Zakres nieustalony. Kolejność drugiego i trzeciego można zamienić.

### Odrzucone świadomie

Usługa wokół KSeF, mimo twardego terminu 1 stycznia 2027 i realnego popytu. To teren księgowości i dostawców systemów finansowo-księgowych, gdzie mamy słabszą pozycję i większą odpowiedzialność.

## Otwarte zadania właściciela

- Przegląd specu zgodności z AI Act przed napisaniem planu wdrożenia
- Sprawdzenie w panelu Vapi, czy Klara przy rozmowie **głosowej** informuje, że jest AI — czat tekstowy ten obowiązek już spełnia
- Usunięcie testowego konta `schizae@gmail.com` z panelu Supabase (skrzynka nie istnieje, konta nie da się potwierdzić)
- `SENTRY_AUTH_TOKEN`, bez którego produkcyjne stack trace'y przychodzą zminifikowane
- Migracje `010` i `011` przed ewentualnym scaleniem `feat/strony-uslugowe` — bez nich `/uslugi` się wywróci

## Pułapki operacyjne

**Lokalny `main` bywa mocno w tyle.** 9 września był 8 commitów za `origin/main`, a katalog roboczy pokazywał pliki sprzed pracy, która od dawna jest na produkcji. Zaczynaj od `git fetch origin` i porównania.

**`.worktrees/` należy do Codeksa.** `contact-scenes` to jego aktywny worktree, nie pozostałość po sprzątaniu. Sprzątaj wyłącznie własne, po nazwie.

**Nie przełączaj gałęzi pod pracującym agentem.** Gdy potrzebujesz innej bazy, użyj własnego worktree zamiast `git switch`. Ta zasada wyszła z realnej pomyłki — cała sesja animacji powstała na złej gałęzi tylko dlatego, że katalog na niej stał.

**`output/` i `tmp/` nie są nasze.** W `output/sprzedaz-zautomatyzujemy/` leżą materiały sprzedażowe w PDF. Nie sprzątaj ich bez pytania.

**Serwer deweloperski zostawia zombie.** Po `npm run dev` potrafią zostać procesy trzymające porty 3000–3002; kolejny start ląduje po cichu na 3002 i strona wygląda na zepsutą, bo serwuje stary build. Nie mieszaj też `npm run build` z `next dev` na tym samym `.next`.
