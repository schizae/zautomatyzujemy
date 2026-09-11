# Punkt odniesienia — 10 września 2026

Stan przed rozpoczęciem projektu widoczności. Wszystkie kolejne pomiary porównujemy do tych liczb.
Część pól czeka na uzupełnienie przez właściciela: dane z Search Console wymagają zalogowania,
a publiczne API PageSpeed Insights odmawia pomiaru bez klucza po wyczerpaniu wspólnego limitu.

## Treść i indeksacja

| Miara | Wartość | Skąd |
|---|---|---|
| Adresy w mapie strony | 39 | odczyt `sitemap.xml` 2026-09-10 |
| Artykuły na blogu | 30 | tabela `posts` |
| w tym cotygodniowe przeglądy `nowosci-ai-*` | 18 | mapa strony |
| Studia przypadku | 3 | tabela `case_studies`, oznaczone jako scenariusze poglądowe |
| Adresy komercyjne (usługi, cennik, kontakt, o mnie, lokalna) | 0 | nie istnieją |

## Leady

| Miara | Wartość |
|---|---|
| Leady łącznie | 10 |
| z czatu | 5 |
| z checklisty AI Act | 4 |
| z formularza kontaktowego | 1 |
| Zakres dat | 25 kwietnia 2026 do 7 września 2026 |
| Leady z rozpoznanym źródłem wizyty | 0 |

Ostatnia pozycja zmienia się od tego wdrożenia: od teraz każdy nowy lead zapisuje stronę wejścia,
referrera i klasyfikację kanału.

## Search Console, ostatnie 3 miesiące

Do uzupełnienia przez właściciela. Wejdź w Search Console, ustaw zakres na ostatnie 3 miesiące
i przepisz liczby z zakładki Skuteczność oraz z raportu Indeksowanie stron.

| Miara | Wartość |
|---|---|
| Kliknięcia | |
| Wyświetlenia | |
| Średni CTR | |
| Średnia pozycja | |
| Strony zaindeksowane | |
| Strony wykluczone z indeksu | |

## PageSpeed Insights, wariant mobilny

Do uzupełnienia przez właściciela. Wejdź na pagespeed.web.dev i zmierz trzy adresy.

| Adres | LCP | CLS | Wynik wydajności |
|---|---|---|---|
| https://www.zautomatyzujemy.pl/ | | | |
| https://www.zautomatyzujemy.pl/blog | | | |
| https://www.zautomatyzujemy.pl/blog/ai-w-analizie-danych-msp-lepsze-decyzje | | | |

To pomiar laboratoryjny. Dane od realnych użytkowników w 75. percentylu to osobna rzecz,
widoczna w Search Console dopiero przy większym ruchu. Nie porównujemy tych dwóch liczb ze sobą.

Próg przyjęty w planie: nowa strona nie wchodzi na produkcję z LCP powyżej 2,5 sekundy na mobile.
