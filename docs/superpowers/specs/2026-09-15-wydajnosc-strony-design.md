# Wydajność i bezpieczeństwo strony — projekt

Data: 2026-09-15. Projekt 3 z kolejki („Ulepszenia strony”), podprojekt 2 z 2.
Podprojekt 1 (porządki) wdrożony w PR 33. Aktualizacje zależności (Next.js 15.5.25, sharp, ws) wdrożone osobno w PR 34.

## Cel

Właściciel: strona ma być szybka i bezpieczna, bez zbędnego kodu. Wygląd się nie zmienia.

Kryterium, mierzone ręcznie w PageSpeed Insights (wariant mobilny, strona główna) po wdrożeniu:

| Miara | 15.09 przed | Cel |
|---|---|---|
| LCP | 5,0 s | ≤ 2,5 s |
| Wydajność | 80 | ≥ 90 |
| Ułatwienia dostępu | 91 | 100 |

## Kiedy

Kod zaczyna się po scaleniu gałęzi Codeksa `codex/uslugi-animacje-i-ilustracje` do `main`,
bo zmiany dotykają paska nawigacji i layoutu wspólnych dla wszystkich podstron.
Praca na gałęzi `feat/wydajnosc-strony` od aktualnego `main`, w osobnym katalogu roboczym. Jeden PR.

## Diagnoza (sprawdzona w kodzie i na produkcji 15.09)

1. **Ekran „Ładowanie...” przed treścią.** HTML strony głównej zaczyna się od zawartości `app/loading.tsx`
   (ciemny ekran ze spinnerem), a właściwa treść przychodzi w ukrytym `<div id="S:0">` na końcu
   dokumentu i jest podmieniana skryptem. Ciemny kadr widać w pasku zrzutów PageSpeed. To główna przyczyna LCP.
   Te same pliki są w `app/blog/loading.tsx` i `app/case-studies/loading.tsx`, w kolorach sprzed redesignu.
2. **Czat na każdej wizycie.** `components/chat/chat-widget.tsx` importuje statycznie `@ai-sdk/react`, `ai`,
   renderer markdown i zod. Paczka 96 KB (61 KB nieużywane przy wejściu). Widget jest tylko na stronie głównej.
3. **Klient logowania Supabase na stronach marketingowych.** `app/_components/providers.tsx` owija całą aplikację
   w `AuthProvider`, a jedynym konsumentem `useAuth` poza `app/account/` jest `components/marketing/navbar.tsx`
   (pokazuje „Zaloguj się” albo imię). Paczka 48 KB (40 KB nieużywane). W bazie są 3 konta.
4. **Śledzenie wydajności Sentry w przeglądarce.** `instrumentation-client.ts` ma `tracesSampleRate: 0.1`,
   co wciąga moduł tracingu do paczki 115 KB.
5. **Obraz Klary w hero** ma `sizes="(min-width: 1024px) 50vw, 100vw"`, a karta na telefonie jest węższa
   od ekranu o boczne odstępy — pobiera się 750 px przy wyświetlaniu 364 px.
6. **Kontrast:** etykiety „02 /” (`components/marketing/roi-calculator.tsx`) i „03 /”
   (`components/marketing/lead-magnet-section.tsx`) w kolorze `#f34c30` na tle `#f5f2ed`.
7. **Kolejność nagłówków:** tytuły kafelków w `components/marketing/blog-preview.tsx` są `h4` bez `h3` nad nimi.

## Zmiany

### 1. Usunięcie ekranów ładowania

Usunąć `app/loading.tsx`, `app/blog/loading.tsx`, `app/case-studies/loading.tsx`.

Konsekwencja: przy przejściu linkiem na stronę renderowaną na żądanie (np. `/blog`) przeglądarka czeka
na odpowiedź serwera zamiast pokazać szkielet. Akceptowane — szkielety nie pasują do obecnego wyglądu.

### 2. Czat ładowany przy pierwszym otwarciu

`ChatWidget` dzieli się na:

- **przycisk** (zostaje w `components/chat/chat-widget.tsx`): pływający przycisk z licznikiem nieprzeczytanych,
  renderowany od razu, bez importu `ai` ani `@ai-sdk/react`;
- **panel rozmowy** (nowy plik w `components/chat/`): cała obecna logika rozmowy, wczytywany przez
  `next/dynamic` z `ssr: false` dopiero wtedy, gdy `isOpen` z `useKlara()` pierwszy raz stanie się `true`.

Po pierwszym otwarciu panel zostaje zamontowany do końca wizyty — zamknięcie i ponowne otwarcie nie kasuje rozmowy.
Otwarcie działa ze wszystkich obecnych miejsc, bo wszystkie idą przez `setIsOpen`/`openChatDraft` z `KlaraProvider`:
przycisk, „Wolę napisać” w hero, szkic z formularza scenariuszy.

Stan potrzebny przyciskowi przed pierwszym otwarciem (licznik nieprzeczytanych) jest zawsze zero, bo bez otwarcia
nie ma rozmowy. Dokładny podział stanu ustala plan po przeczytaniu całego pliku.

Podczas wczytywania panelu przycisk pokazuje stan oczekiwania (np. ikonę ładowania), żeby kliknięcie nie wyglądało na zignorowane.

### 3. Stały link „Konto” i `AuthProvider` tylko w koncie

- `components/marketing/navbar.tsx`: bez `useAuth`. Link konta zawsze prowadzi do `/account/settings`
  z etykietą „Konto”. Niezalogowanego przekierowuje istniejący middleware (`middleware.ts`, ścieżka `/account/settings`).
  Znika wyświetlanie imienia zalogowanej osoby.
- `app/_components/providers.tsx`: bez `AuthProvider`.
- Nowy `app/account/layout.tsx`: owija dzieci w `AuthProvider`. Wszyscy pozostali konsumenci `useAuth`
  są w `app/account/` (login, rejestracja, ustawienia).

### 4. Sentry bez tracingu w przeglądarce

- `next.config.ts`: `withSentryConfig(..., { bundleSizeOptimizations: { excludeTracing: true } })`
  (opcja istnieje w zainstalowanej wersji `@sentry/nextjs`).
- `instrumentation-client.ts`: bez `tracesSampleRate`.

Raporty błędów działają dalej. Konfiguracja serwerowa Sentry bez zmian.

### 5. Drobne

- `components/marketing/hero-section.tsx`: `sizes="(min-width: 1024px) 50vw, calc(100vw - 3rem)"`.
- Etykiety „02 /” i „03 /”: `text-[#f34c30]` → `text-[#c93820]` (kolor akcentu używany już na stronie, kontrast ok. 4,9:1 na `#f5f2ed`).
- `components/marketing/blog-preview.tsx`: `h4` → `h3`, klasy bez zmian.
- `next.config.ts`, CSP: `'unsafe-eval'` **zostaje**. Dochodzi tylko komentarz nad `script-src`:
  „`'unsafe-eval'` wymagane przez @daily-co/daily-js (protobuf generuje kod przez new Function) — bez tego
  rozmowa głosowa Klary nie łączy się; sprawdzone 2026-09-06, ADR-27 w glos-voicebot”.

## CSP — dlaczego `'unsafe-eval'` zostaje

Pierwsza wersja tego specu zakładała zamianę na `'wasm-unsafe-eval'`. Założenie było błędne.
6 września 2026 w projekcie GŁOS, na produkcji, strona rozmowy demo z CSP bez `'unsafe-eval'` wydawała token (HTTP 200),
miała zgodę na mikrofon, a rozmowa się nie łączyła. `@vapi-ai/web` ciągnie `@daily-co/daily-js`, który do protokołu mediów
używa protobufu generującego kod przez `new Function`. To wymaga pełnego `'unsafe-eval'` — `'wasm-unsafe-eval'` dopuszcza
tylko kompilację WebAssembly. Biblioteka przerywa pracę przed WebRTC bez czytelnego błędu. Decyzja: ADR-27
(`docs/adr/ADR-27-unsafe-eval-na-stronie-demo.md` w repo glos-voicebot).

Wyjątek da się usunąć dopiero, gdy Vapi albo Daily wypuści build bez generowania kodu w czasie działania.
Przed każdą próbą zaostrzenia CSP: na stronie z nowym CSP wkleić w konsoli przeglądarki nasłuch, potem kliknąć rozmowę głosową —
każda blokada wypisze się wprost:

```js
document.addEventListener('securitypolicyviolation', e =>
  console.warn('CSP:', e.violatedDirective, e.blockedURI, e.sourceFile, e.lineNumber))
```

## Poza zakresem

- Animacja wpisywania nagłówka — decyzja właściciela: zostaje.
- Trzy rodziny fontów — wybór projektowy.
- Polyfille (13 KB) i nieużywany CSS (10 KB) — mały zysk.
- Nonce w CSP — wymusiłyby renderowanie każdej strony na żądanie.
- Zaostrzanie CSP: `'unsafe-eval'` zostaje (patrz sekcja wyżej); nie zawężamy domen `api.vapi.ai`, `*.daily.co`
  i `glos-voicebot.vercel.app` w `connect-src` i `frame-src`.
- Żądanie do `salsify.com` w raporcie — nie pochodzi z kodu strony (brak w repo).
- `force-dynamic` na `/blog`.
- Pozostałe po PR 34 zgłoszenia `npm audit`: `postcss` wewnątrz `next` (tylko build, poprawka w Next 16), `brace-expansion` (narzędzia deweloperskie).

## Sprawdzenie

Przed PR:

- `npm run type-check`, `npm run lint`, `npm test`, `npm run build`.
- Porównanie z buildem `main`: rozmiar „First Load JS” strony głównej w wyniku `build` przed i po.
- Lokalny `next start`: HTML strony głównej, `/blog` i artykułu nie zawiera „Ładowanie”;
  żaden skrypt ładowany przez stronę główną nie zawiera `gotrue` (klient logowania).
- Przeglądarka (lokalnie): otwarcie czatu przyciskiem, wysłanie wiadomości, zamknięcie i ponowne otwarcie z zachowaną rozmową,
  „Wolę napisać” w hero, link „Konto” prowadzi niezalogowanego na `/account/login`, logowanie w `/account/login` działa.

Właściciel na podglądzie Vercela (za logowaniem):

- rozmowa głosowa z Klarą łączy się (regresja po zmianach w `KlaraProvider` i czacie; CSP bez zmian).

Po wdrożeniu:

- pomiar PageSpeed (mobilny) strony głównej, `/blog` i artykułu; porównanie z tabelą z sekcji „Cel” i z `docs/seo/baseline.md`.
