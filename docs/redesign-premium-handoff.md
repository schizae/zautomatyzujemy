# Redesign premium — przekazanie Codex / Claude

Status: implementacja na branchu codex/redesign-premium; oczekuje na pełne QA przed scaleniem.
Branch: `codex/redesign-premium`; baza: `main`, `ced3f52e8d6b7329ec5403112bcf6b23146af9b8`.
Nie scalać ani nie publikować na produkcji. Użytkownik zamówił podgląd i PR.

## Współpraca

Przy rozpoczęciu pracy pobierz aktualne branche i sprawdź otwarte PR. W chwili
rozpoczęcia tego zadania nie było otwartych PR. Codex nie ma kanału do sesji Claude.
Ta notatka i przyszły PR są miejscem przekazania zmian, nie potwierdzeniem ich odbioru.
Prace równoległe prowadź na osobnym branchu/worktree. Jeśli dotyczą tych samych
komponentów, najpierw porównaj diff redesignu i zapisz zakres w PR. Nie nadpisuj
tego brancha ani zmian użytkownika. Backend można rozwijać niezależnie, sprawdzając
kontrakty formularzy i Klary przed scaleniem. Nie zmieniono workflow CI i publikacji bloga.

## Zmiana wizualna

Ciepłe tło #F5F2ED, grafit #151719, pomarańcz. CTA na jasnym tle ma ciemniejszy
odcień #C93820 dla kontrastu z białym tekstem. Istniejące fonty Space Grotesk i
Manrope, oszczędna systemowa kursywa serif. Bez dodatkowych zależności.
Sześć bloków narracyjnych: hero/Klara; oferta/przykładowe przebiegi;
kalkulator; checklista/szkolenia/audyty; o nas/blog; FAQ/kontakt.
Klara ma animowaną wektorową formę, pauzę, ograniczenie ruchu i zatrzymanie poza ekranem.
Nie jest to kopia bitmapowa makiet; wymaga jeszcze porównania wizualnego z referencjami.

## Zakres i kontrakty

- `app/page.tsx`, komponenty marketingowe: układ, styl i treści prezentacyjne.
- `app/blog/**`: styl istniejącego bloga, adresy i dane bez zmian.
- `components/voice/klara-provider.tsx`, providers i chat: jedna wspólna sesja.
- `use-voice-call.ts`: stan mowy z prawdziwych zdarzeń SDK speech-start/speech-end;
  stan przygotowania odpowiedzi po końcowym transkrypcie użytkownika. Dostępność
  transkryptu zależy od clientMessages w konfiguracji asystenta. Brak zdarzenia
  nie jest zastępowany timerem ani symulacją.
- Token nadal pobierany z NEXT_PUBLIC_GLOS_TOKEN_URL przy kliknięciu. SDK importowane
  leniwie. Przycisk głosu niewidoczny bez endpointu; czat pozostaje dostępny.
- CMS hero nadal ma pierwszeństwo przed nowym domyślnym tekstem. Aby pokazać nowy
  nagłówek na produkcji, właściciel powinien zaktualizować treść w CMS osobno.
- Kalkulator zachowuje zakresy i wzór (22 dni, 4.33 tygodnia, współczynnik 0.7).
  Przykład domyślny: 66 h, 3960 zł, 2772 zł/mies., 33264 zł/rok.
  Opis wyraźnie określa 70% jako założenie, a wynik jako wartość czasu, nie gwarancję.
- Formularze wywołują istniejące Server Actions; nazwy pól, honeypot i zgody
  zachowane. Newsletter nadal opcjonalny i odrębny od dostarczenia checklisty.
- Zachowano login, konta, regulamin, politykę, checklistę, case studies i ich URL.
- Nie zmieniono bazy, sekretów, RAG, webhooków, Resend, treści postów ani CI.

## Weryfikacja i brakujące kroki

`npm ci` zakończone. TypeScript i ESLint przechodzą. Produkcyjna kompilacja Next
zakończyła się powodzeniem, ale cały `npm run build` NIE przeszedł: prerender
/sitemap.xml wymaga NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY.
Nie dodano fałszywych danych ani kluczy w celu ukrycia tego problemu.

Podgląd przeglądarkowy w środowisku Codex nie wystartował: narzędzie przekazuje
flagi Vite (--host/--strictPort), których istniejący `next dev` nie obsługuje.
Nie zmieniono stosu ani skryptów projektu w celu obejścia tej niezgodności.
Brak wizualnego potwierdzenia 375/768/1280 px oraz testów E2E.

Przed oznaczeniem PR jako gotowy:
1. W środowisku deweloperskim ustawić właściwe zmienne z .env.example, bez commitowania.
2. Uruchomić npm run build i npm run dev; sprawdzić 375, 768 i 1280 px, 200% zoom,
   klawiaturę, reduced-motion, menu, wszystkie kategorie oferty i suwaki.
3. Sprawdzić chat, leady, VAPI start/stop, odmowę mikrofonu, powtórzenie po błędzie,
   współdzielenie głosu przez hero i chat, wyjście ze strony podczas łączenia.
4. Sprawdzić prawdziwą wysyłkę checklisty z opcjonalną zgodą zaznaczoną i bez niej,
   kontakt, konta i istniejące adresy bloga. Testy prowadzić na danych testowych.
5. W Vercel Preview sprawdzić zmienne Preview oraz dozwolony origin po stronie GŁOS.
   Nie osłabiać listy originów. Ustawienia panelu Vercel nie były dostępne Codexowi.
6. Przed PR ponownie pobrać main i sprawdzić konflikty z pracami Claude.

Dostęp GitHub do zapisu został potwierdzony po instalacji aplikacji na koncie schizae.
Branch codex/redesign-premium utworzono z tej samej bazy; ponowny fetch potwierdził,
że main nie zmienił się podczas pracy. PR pozostaje wersją roboczą do pełnego QA.

## Korekta zgodności z makietami (kolejna iteracja)

Na wyraźne żądanie właściciela przywrócono kompozycję makiet: duży hero z
metaliczną grafiką Klary, szersze sekcje, Instrument Serif, poziomy panel usług,
kalkulator obok nagłówka, trzykolumnowy PDF z okładką, editorial blog i kompaktowy
kontakt z rozwijanym formularzem. Grafiki są osobnymi zoptymalizowanymi WebP,
nie obrazami całej strony. Prompty: metaliczna wstęga Möbiusa na grafitowym tle;
czarna okładka AI ACT z pomarańczowym grzbietem; grafitowe wnętrze z pomarańczowym
światłem drzwi. Wygenerowane wbudowanym imagegen, zapisane w public/redesign.
Nagłówek i opis hero są teraz zgodne z zatwierdzoną makietą; poprzednie wpisy CMS
nie nadpisują tych dwóch elementów. CMS nadal steruje podpisami CTA. Formularze,
zgody, zakresy kalkulatora i integracje pozostają prawdziwe i niezmienione.
