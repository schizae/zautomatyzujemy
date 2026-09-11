# Animacje na main — przekazanie Claude / Codex

2026-09-07. Stan po czterech PR-ach scalonych tego dnia (#9, #10, #11, #12). `main` stoi na `c16bed3`.

Dokument powstał, bo poprzednie podejście do animacji poszło na złą gałąź. Opisuje, gdzie jesteśmy, co jest czyje i od czego zacząć.

---

## Zacznij od tego

Praca ma powstać **na `main`**, nie na `feat/strony-uslugowe`.

```bash
git checkout main && git pull
git checkout -b codex/animacje-main
```

Poprzednia sesja wystartowała z katalogu, który stał na `feat/strony-uslugowe`, i cała robota wylądowała na wersji strony sprzed redesignu — czyli na Twoim własnym designie sprzed trzech tygodni. Nic nie było nie tak z samą robotą, tylko z podkładem. Dlatego pierwszy krok to sprawdzenie, na czym stoi katalog.

---

## Podział pracy

Frontend i design należą do Codeksa. Claude pracuje wyłącznie nad funkcjonalnością: logika, Server Actions, integracje, baza, autoryzacja. Ustalone przez właściciela 7 września 2026.

W praktyce: Claude zmienia w UI tylko to, co wymusza funkcjonalność (nowe pole formularza, obsługa błędu, nowy stan), a klasy Tailwind, palety, układ i typografię zostawia. Jeśli funkcjonalność wymaga nowego widoku, składa go z wzorców już obecnych na gałęzi docelowej i zgłasza, że ekran czeka na przegląd.

---

## Aktualny design jest Twój i jest kanoniczny

`main` niesie redesign premium z 5 września i spójną identyfikację kont z 7 września. Jasna paleta (`#f5f2ed` tło, `#faf8f5` karty, `#c93820` akcent, `#151719` tekst, `#62625d` tekst drugorzędny), komponent `BrandLogo`, grafiki w `public/redesign/`. To jest punkt odniesienia — nic tego nie cofa.

Uwaga na `feat/strony-uslugowe`: tamta gałąź używa generycznej palety Tailwinda (`bg-slate-50`, `bg-slate-950`, `text-slate-400`), bo powstała 17 sierpnia, trzy tygodnie przed redesignem. Nie traktuj jej jako źródła prawdy o wyglądzie.

---

## Twoja poprzednia praca jest do odzyskania

Sesja z 7 września, 21:31–21:47, została odłożona do schowka gita, nie skasowana. Schowki nie są przypisane do gałęzi — zobaczysz je również z `main`:

```bash
git stash list
git stash show -p 'stash@{N}'   # N = pozycja wpisu "animacje Codeksa ze zlej galezi"
```

**Nie rób `stash apply`.** Pracowałeś na plikach sprzed redesignu — `hero-section.tsx`, `services-section.tsx` i `case-study-section.tsx` wyglądają dziś inaczej, a `components/brand-logo.tsx` wtedy jeszcze nie istniał. Ten diff to notatka „co chciałem osiągnąć", nie łatka.

Objęte pliki: `app/layout.tsx`, `components/chat/chat-widget.tsx`, `components/marketing/{hero,services,case-study,about}-section.tsx` oraz nowe `automation-visual.tsx`, `context-link.tsx`, `motion-reveal.tsx`, `lib/use-reduced-motion.ts`. W schowku jest też Twój plan `docs/superpowers/plans/2026-09-07-premium-motion.md` z odhaczonymi krokami i scenariuszami akceptacyjnymi.

### Trzy rzeczy stamtąd, które nie były animacjami

Warto je powtórzyć niezależnie od tego, co zdecydujesz o ruchu:

- `role="dialog"` i `aria-labelledby` na panelu czatu
- powrót fokusu na przycisk uruchamiający po zamknięciu czatu oraz obsługa Escape
- naprawa pozycji czatu na telefonie — poprzedni `SlideIn` w `about-section` przesuwał zawartość o 60 px i rozpychał viewport z 375 na 411 px, przez co przycisk czatu uciekał poza widoczny ekran

Ostatnie to prawdziwy błąd, nie kosmetyka.

---

## Co zmieniło się na `main` 7 września

Cztery scalone PR-y, wszystkie po stronie funkcjonalności:

**#9 — potwierdzanie konta e-mailem i reset hasła.** Rejestracja kończyła się na wysłaniu maila: aplikacja nie miała trasy odbierającej link, więc kliknięcie dawało 404, a niepotwierdzone konto przy logowaniu zgłaszało się jako błędne hasło. Doszły `app/auth/callback/route.ts`, `app/account/reset-password` i `app/account/update-password`, rozróżnienie konta niepotwierdzonego przy logowaniu wraz z ponowną wysyłką linku, oraz limit 5 maili na 15 minut per IP.

**#10 — formularz logowania z powrotem w SSR.** `useSearchParams` wymusza granicę Suspense i przy `fallback={null}` wypychał cały formularz do klienta. Parametr `?error=link` czytany jest teraz w Server Component i podany propem.

**#11 — Sentry raportuje tylko z produkcji.** Konfiguracje nie miały warunku środowiskowego, więc lokalny `next dev` wysyłał zdarzenia do projektu produkcyjnego. Konsekwencja: lokalny test integracji z Sentry wymaga tymczasowego przestawienia flagi `enabled`.

**#12 — `AGENTS.md` i plan RAG do repozytorium.** `AGENTS.md` wskazywał na osiem reguł w `.Codex/rules/`, a ten katalog jest celowo poza repo; odwołania przepisano na `.claude/rules/`. **To jest jedyny wersjonowany komplet reguł tego projektu i obowiązuje obu agentów** — katalog ma historyczną nazwę, ale drugi komplet oznaczałby rozjazd przy pierwszej zmianie.

### Dwie nowe strony czekają na Twój przegląd

`app/account/reset-password` i `app/account/update-password` to powierzchnie, których wcześniej nie było i których nie projektowałeś. Nie wymyślano dla nich nic własnego — poskładano je z klas skopiowanych z logowania i rejestracji (`BrandLogo`, `#f5f2ed`, `#faf8f5`, `#c93820`, ten sam układ karty). Powinny wtopić się bez zgrzytu, ale wypada, żebyś na nie spojrzał.

---

## Czego nie ruszać

**`feat/strony-uslugowe` jest odłożona świadomie.** Jedenaście commitów, strony `/uslugi` i `/uslugi/[slug]` dla siedmiu usług. Blokują ją dwie niezależne rzeczy: migracje `010` i `011` nie są wykonane na produkcyjnej bazie (tabela `services` ma wciąż tylko osiem pierwotnych kolumn, więc `/uslugi` zwraca 404 i to jest stan oczekiwany), a widoki są w palecie sprzed redesignu. Wracamy do niej później.

**Treść hero pochodzi częściowo z CMS.** `hero-section.tsx` czyta z `page_content` tylko `hero_cta_secondary`; nagłówek jest zahardkodowany. W bazie leżą jeszcze `hero_title`, `hero_description` i `hero_cta_primary` z poprzedniej wersji — panel `/admin/content` pozwala je edytować, ale zmiany nie pojawiają się na stronie. To znany dług po stronie funkcjonalności, nie proś się z nim w tej sesji.

---

## Weryfikacja przed zgłoszeniem gotowości

```bash
npm run type-check
npm run lint
npm run build
```

Menedżer pakietów: **wyłącznie npm**. CI używa `npm ci`, jedynym lockfile'em jest `package-lock.json`; `pnpm add` tworzy drugi lockfile i psuje ESLinta.

Poza tym, zgodnie z tym, co sam zapisałeś w poprzednim planie: treści z wyłączonym JavaScriptem, `prefers-reduced-motion`, działające CTA, nawigacja klawiaturą, otwieranie i zamykanie czatu bez wysyłania wiadomości, oraz szerokości 1440×1000, 768×1024 i 375×812.
