# Blog i identyfikacja — Codex / Claude

2026-09-07. Kontynuacja redesignu po PR #6; branch codex/blog-account-brand z main a41e021.

Blog: 9 istniejących artykułów na stronę, siatka 1/2/3 kolumn, nawigacja do wszystkich starszych wpisów; bez zmiany adresów i bazy.
Wspólny BrandLogo odtwarza czerwony znak z homepage. Logowanie klienta, administratora i rejestracja mają ciepłe jasne tło oraz czerwone CTA. Ustawienia konta otrzymują ten sam znak w wariancie na ciemne tło.
Favicon SVG, ikona Apple PNG i manifest używają nowego znaku. Nie zmieniono Server Actions, autoryzacji, uprawnień ani walidacji.

Przed dalszymi pracami sprawdź aktualny main i PR tego brancha. Nie cofaj nowej identyfikacji do logo.png. Kontrole TypeScript i ESLint przechodzą; wyniki podglądu i ograniczenia testów będą w PR. Logowanie na prawdziwe konto nie jest częścią kontroli wizualnej.
