# Animacje aktualnego main

Cel: rozwinąć ruch obecnej strony bez zmiany treści, typografii, palety i układu.
Baza: e2c3979, zgodna z origin/main; gałąź robocza codex/animacje-main.
Przeczytano docs/animacje-main-handoff.md; schowka starego projektu nie aplikujemy.

## Kierunek

Główny moment: frazy nagłówka pojawiają się w krótkiej sekwencji, zakończonej
rysowaniem czerwonej linii. W rozwiązaniach ruch pokazuje zależność między
wiadomością, uporządkowanymi polami zgłoszenia i gotowym szkicem odpowiedzi.
Pozostałe wejścia są jednorazowe, krótkie; przyciski reagują strzałką i naciskiem.
Bez przejmowania scrolla, nowych zależności i zmian integracji.

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

Budżet: wejścia 500–700 ms, odstępy 80–120 ms (łącznie poniżej 350 ms),
reakcje 150–250 ms. Pętla wyłącznie na istniejącej grafice Klary, z pauzą,
zatrzymaniem poza widokiem i w ukrytej karcie. Animacje transform/opacity.

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
