# Interaktywne scenariusze kontaktu — Implementation Plan

> For agentic workers: use executing-plans / subagent-driven-development. Implement and verify tasks below in this session.

**Goal:** Cztery potrzeby prowadzą do kontaktu głosowego, tekstowego lub e-mail z zachowaniem opisu.
**Architecture:** ServicesSection posiada wybór scenariusza i szkice. ScenarioScene odpowiada za demonstrację. ScenarioContact utrzymuje zamontowany ContactForm i korzysta ze wspólnego KlaraProvider. Istniejące backendy pozostają źródłem wysyłki.
**Tech Stack:** Next.js, TypeScript, React, Tailwind, Web Animations API, istniejący Framer Motion i Vapi SDK. Bez nowych zależności.

## Zadania i weryfikacja

- [x] Test przeglądarkowy przed zmianą: `getByRole('button', {name: /Mam inny pomysł/})` musi istnieć. Obecna strona nie ma tej ścieżki — oczekiwane niepowodzenie.
- [x] `components/voice/use-voice-call.ts`: `start(context?: string)` przekazuje wiadomość użytkownika po call-start przez zweryfikowane `send({type: 'add-message', message: {role: 'user', content: context}, triggerResponseEnabled: false})`. Test jednorazowego przekazania, braku treści w żądaniu tokenu, błędów i anulowania. Nie testować realnego płatnego połączenia.
- [x] `components/voice/klara-provider.tsx`: `openChatDraft(text: string)`, `pendingDraft: {id: number; text: string} | null`, `clearPendingDraft()`. Monotoniczne ID z ref, żadnego localStorage.
- [x] `components/chat/chat-widget.tsx`: odbierz szkic raz bez sendMessage; przy zajętym input pokaż jawny wybór zastąpienia lub zachowania. Historia bez resetu. Sprawdzić w przeglądarce brak POST do czatu.
- [x] `components/marketing/contact-form.tsx`: opcjonalnie kontrolowane `message`/`onMessageChange`, unikalny `idPrefix`; dotychczasowa instancja działa bez props. Nie resetuj danych po błędzie.
- [x] `components/marketing/scenario-scene.tsx`: trzy sceny w HTML/SVG, wspólna sekwencja 7 s, pauza, wznowienie, replay, rezultat. Web Animations API pozwala zatrzymać wszystkie elementy razem. Reduced motion = stan końcowy. IntersectionObserver i visibilitychange kontrolują odtwarzanie.
- [x] `components/marketing/scenario-contact.tsx`: pole 10–2000 znaków, trzy kanały, komunikaty głosu, formularz zamontowany także przy ukryciu. Nie wysyłaj danych przez sam wybór. Nie restartuj trwającej rozmowy.
- [x] `components/marketing/services-section.tsx`: cztery potrzeby, jeden panel, szkic per potrzeba, dostęp do całej dotychczasowej oferty w rozwijanym opisie. Nie duplikuj mapy procesu. Scena kontaktu dostępna od początku pokazu.
- [x] Przeglądarka: wybierz czwartą opcję, wpisz opis, otwórz czat i sprawdź szkic; zamknij, otwórz e-mail, wpisz dane, przełącz opcję i wróć — wartości muszą zostać. Sprawdź konflikt input, walidację, pauzę/replay i reduced motion. Żadnych prawdziwych leadów.
- [x] `npm run type-check`, `npm run lint`, `npm run build`; przegląd 375/768/1440 px i klawiatury. Raportuj granicę testu głosowego osobno od wyniku frontendu.

## Pomiar

Nie dodawaj nowego narzędzia analityki. Sprawdź istniejący Vercel Analytics i rejestruj zdarzenia wyboru scenariusza/kanału bez opisu i danych osobowych. Otwarcie kanału nie jest leadem. Nie twórz fikcyjnego poziomu odniesienia konwersji.

## Wynik weryfikacji — 2026-09-09

- TypeScript, ESLint i build produkcyjny: powodzenie.
- Końcowy test szkiców i trzech szerokości przechodzi również na `next start`. Pierwszy render sceny jest zgodny między serwerem a klientem; CTA hero otrzymało `max-w-full`, usuwając wykryte mobilne przepełnienie. Przejściowe kontenery streamingu React nie są traktowane przez test jako gotowy interfejs.
- `node --test scripts/voice-context.test.mjs`: 9 testów cyklu rozmowy przechodzi, bez sieci i mikrofonu.
- `scripts/scenario-browser.js.txt`: walidacja, szkic czatu i konflikt, zachowanie danych formularza, trzy szerokości, reduced motion, unikalne ID i brak automatycznych wysyłek przechodzą.
- `scripts/scenario-motion-browser.js.txt`: pauza/wznowienie/pominięcie/powtórka, zatrzymanie poza ekranem, walidacja długiego opisu bez obcinania i powrót fokusu przechodzą.
- Pierwsza próba testu przed implementacją wykazała brak ścieżki, lecz lokalny serwer miał wtedy także błąd dostępu do danych. Nie traktujemy jej jako izolowanego dowodu regresyjnego. Końcowe testy wykonano na działającej stronie.
- Nowe sceny zastępują nieużywane po zmianie `automation-flow.tsx` i `service-flow-map.tsx`; opisy całej oferty pozostają dostępne.
- Pomiar: `scenario_selected` i `scenario_contact_opened`, wyłącznie identyfikatory, bez treści pomysłów. Istniejący lokalny CSP blokuje skrypt debug Vercel Analytics; dostarczenie zdarzeń wymaga kontroli na środowisku z działającą analityką.

### Granice potwierdzenia

Nie wykonano prawdziwego wysłania leada ani płatnego połączenia. Lokalna konfiguracja nie udostępnia głosu. Zgodność `send(add-message)` z zainstalowanym SDK i cykl sesji są przetestowane; przyjęcie kontekstu przez rzeczywistego asystenta GŁOS wymaga kontrolowanego testu integracyjnego. Nie deklarujemy jeszcze potwierdzenia całej ścieżki głosowej end-to-end.

Implementacja pozostaje na `codex/contact-scenes`, w `.worktrees/contact-scenes`. Podgląd: `http://localhost:3001/#uslugi`. Nie opublikowano na produkcji.

## Korekta kierunku po ocenie właściciela

Właściciel odrzucił wysuwane karty i czerwone łączniki oraz brak wyraźnej różnicy między działaniem systemu i rezultatem. Zastąpiono je dziewięcioma pełnymi kompozycjami:

- Strona: brief pracowni → projekt z autorską fotografią architektury → konkretne zapytanie o współpracę.
- Obsługa: wiadomość klienta → wydobycie intencji, obiektu i terminu → zgłoszenie ze szkicem odpowiedzi do sprawdzenia.
- Automatyzacja: trzy dokumenty → zestawienie odczytanych danych → lista przygotowanych działań.

Każda historia ma 12 sekund, trzy wybieralne etapy oraz subtelne przejście ostrości i przenikanie. Odczytywane pola ujawniają się kolejno. Wszystkie efekty należą do jednej osi czasu, więc pauza zatrzymuje również detale. Reduced motion udostępnia ręcznie wybierane, statyczne kadry.

Nowe pliki: `website-scenes.tsx`, `process-scenes.tsx`; zdjęcie `public/redesign/scenario-architecture.webp` wygenerowane dla fikcyjnej demonstracji (nie jest realizacją klienta). Zachowano wszystkie ścieżki kontaktu.

Weryfikacja: `scenario-frames-browser.js.txt` potwierdza dopasowanie wszystkich 9 kadrów na 1440 i 375 px; `scenario-story-browser.js.txt` rozróżnialność projektu i zapytania; `scenario-motion-browser.js.txt` sterowanie, offscreen pause i zachowanie kontaktu. TypeScript i ESLint przechodzą. Istniejące ostrzeżenia hydracji dotyczą stylów ROI/kontaktu, poza przebudowanymi scenami.
