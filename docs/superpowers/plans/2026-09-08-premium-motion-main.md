# Animacje aktualnego main

Cel: rozwinąć ruch obecnej strony bez zmiany treści, typografii, palety i układu.
Baza: e2c3979, zgodna z origin/main; gałąź robocza codex/animacje-main.
Przeczytano docs/animacje-main-handoff.md; schowka starego projektu nie aplikujemy.

## Kierunek

Główny moment: nagłówek jest wpisywany litera po literze przez około 2,5 sekundy,
z migającym czerwonym kursorem i rysowaniem linii po zakończeniu. W rozwiązaniach ruch pokazuje zależność między
wiadomością, uporządkowanymi polami zgłoszenia i gotowym szkicem odpowiedzi.
Pozostałe wejścia są jednorazowe, krótkie; przyciski reagują strzałką i naciskiem.
Na wyraźną prośbę właściciela z drugiej iteracji: łagodne wyhamowywanie scrolla
kółkiem na urządzeniach z precyzyjnym wskaźnikiem i płynne przejścia do sekcji.
Dotyk, formularze, czat i przewijalne kontenery pozostają natywne. Bez nowych zależności.

## Wykonanie

- [x] W components/animations/index.tsx rozwinąć istniejące wejścia o animacje
  uruchamiane po wejściu w viewport. Domyślny HTML pozostaje widoczny. Przerwać
  efekty po zmianie prefers-reduced-motion oraz przy odmontowaniu.
- [x] W hero-section.tsx dodać animacje fraz i linii; zatrzymać dekorację również
  po ukryciu karty przeglądarki. Zachować pauzę i przyciski rozmowy.
- [x] W services-section.tsx dodać sekwencję przykładowego procesu i reakcje
  wyboru usługi; zachować treść i klawiaturową obsługę przycisków.
- [x] W navbar.tsx dopracować podkreślenia linków i przejście menu mobilnego.
- [x] W blog-preview.tsx zastosować krótkie wejścia kart.
- [x] Zweryfikować czat: szerokość na telefonie, otwieranie, Escape i powrót fokusu;
  jeśli brak obsługi, poprawić wyłącznie te zachowania i preferencję ruchu.
- [x] npm run type-check, npm run lint, npm run build.
- [x] Przegląd 1440×1000, 768×1024, 375×812: brak poziomego overflow,
  CTA, usługi, menu, czat bez wysyłania danych, reduced motion i wyłączony JS.

Budżet drugiej iteracji: wejścia 1100–1300 ms, maszynopis około 2500 ms,
demonstracja procesu 4800 ms z ręcznym powtórzeniem. Przy Klarze animowane ścieżki
sygnałów SVG i migający kursor, zatrzymywane istniejącą pauzą, poza widokiem
i w ukrytej karcie. Preferencja reduced motion pokazuje kompletną, statyczną treść.

## Wynik weryfikacji

- TypeScript, ESLint i build produkcyjny zakończone powodzeniem.
- 1440×1000, 768×1024 i 375×812: brak poziomego overflow przy hero, usługach, sekcji o nas i kontakcie.
- Menu mobilne, zmiana usługi, czat, Escape i powrót fokusu działają; nie wysyłano wiadomości ani nie rozpoczynano połączeń.
- Reduced motion: brak aktywnych animacji w main, dekoracja Klary zatrzymana.
- Bez JavaScriptu: style animowanych elementów mają opacity: 1. Całą stronę ukrywa jednak istniejąca granica streamingu S:0 z app/loading.tsx. To niezmieniony problem main, wymagający osobnej korekty renderowania; nie uznajemy testu całej strony bez JS za zaliczony.
- Lokalnie głos jest niedostępny z powodu braku konfiguracji endpointu.
- Detektor Impeccable: cztery ostrzeżenia dotyczą wyłącznie istniejących wzorców (gradient, obramowanie bloga, kropki pisania w czacie). Nie zmieniano designu w odpowiedzi na te ostrzeżenia.
- Istniejące ostrzeżenia builda dotyczą konfiguracji Sentry, wykrywania pluginu ESLint i wieku bazy Browserslist.

Podgląd: http://localhost:3000. Scenariusz przeglądarkowy i zrzuty są lokalnie w .playwright-cli (katalog ignorowany przez Git).

## Druga iteracja — więcej ruchu i charakter programistyczny

- TypewriterHeading: stałe wymiary nagłówka, znaki odsłaniane co 85 ms, kursor i finalne podkreślenie.
- NeuralTraces: sygnały poruszające się po ścieżkach przy metalowej formie Klary; wspólna pauza i ograniczenie ruchu.
- AutomationFlow: wpisywana wiadomość, skan, przekazanie sygnału, wypełnianie pól i gotowy szkic; sekwencja jednorazowa z przyciskiem powtórzenia.
- Usunięto service-ribbon.webp z karty: prostokątne tło zapisane w obrazie powodowało zgłoszony glitch.
- SmoothScroll: wygaszenie kółka, animowane kotwice, respektowanie skrótów, touch i wewnętrznych obszarów scrolla; przerwanie klawiaturą, dotykiem i pointerdown.
- Linki obsługiwane w fazie capture przed Next Link; fokus sekcji utrzymuje tabindex do blur. Pozycja kotwicy aktualizuje się podczas zamykania menu.

Weryfikacja drugiej iteracji: Playwright potwierdził postęp i zakończenie maszynopisu bez zmiany wymiarów nagłówka, wyhamowanie kółka do dokładnego celu, zakończenie i replay procesu, brak grafiki z prostokątem, fokus kotwicy, brak overflow przy 768 i 375 px oraz kompletną statyczną treść przy reduced motion. Osobno sprawdzono menu mobilne (docelowy odstęp 79,7 px przy założeniu 80 px), nieprzechwytywanie kółka w czacie i natywne zachowanie na emulowanym urządzeniu dotykowym. TypeScript i ESLint bez błędów.
