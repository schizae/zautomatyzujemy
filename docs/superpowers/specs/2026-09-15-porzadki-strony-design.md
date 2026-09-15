# Porządki na stronie — projekt

Data: 2026-09-15. Projekt 3 z kolejki („Ulepszenia strony”), podprojekt 1 z 2.
Podprojekt 2 — wydajność i dostępność strony głównej — dostanie osobny spec.

## Cel

Usunąć trzy usterki, które widać w wyszukiwarce i na kafelkach bloga:

1. Trzy przykładowe case studies są w indeksie, choć każde to tylko tytuł, dwa zdania i obrazek.
2. Tagi artykułów wyświetlają się jak slugi, bez polskich znaków („ai w sprzedazy msp”).
3. Pięć tytułów stosuje angielską konwencję wielkich liter („Jak MSP Podejmują Lepsze Decyzje”).

Dodatkowo generator i redaktor w panelu nie mogą tych usterek odtworzyć w nowych artykułach.

## Poza zakresem

- Wydajność i dostępność strony głównej (podprojekt 2).
- Treść case studies i realne wdrożenia — czekają na właściciela.
- Lista `/case-studies` i odnośnik „Poznaj przykładowe zastosowania” na stronie usług — zostają bez zmian.
- Tagi i tytuły wpisów z `noindex = true` (przeglądy nowości i tematy spoza oferty) — nie są widoczne na listach.
- Pliki w `app/uslugi/` — pracuje w nich Codeks.
- Test w bramce jakości wykrywający tagi-slugi — reguła w standardzie i wzór w prompcie wystarczą.

## Decyzje właściciela

- Kolejność: najpierw porządki, potem wydajność.
- Case studies: wyłączyć z indeksu, bez pisania treści i bez usuwania sekcji.
- Tagi: czytelne etykiety zapisane w bazie plus reguła dla generatora.

## Zmiany

### 1. Case studies poza indeksem

`app/case-studies/[slug]/page.tsx` — `generateMetadata` pobiera dodatkowo `is_example`
i przy `is_example = true` zwraca `robots: { index: false, follow: true }`.
To ten sam wzorzec, którego używa `app/blog/[slug]/page.tsx` dla `noindex`.

`app/sitemap.ts` — zapytanie o `case_studies` dostaje `.eq('is_example', false)`,
z komentarzem w stylu istniejącego przy postach: filtr nie deindeksuje, tylko nie wysyła sprzecznych sygnałów.

Warunek opiera się na `is_example`, a nie na liście slugów. Realne wdrożenie dodane w panelu
z `is_example = false` trafi do indeksu i mapy strony bez migracji ani zmiany kodu.

### 2. Czytelne tagi

Migracja `supabase/migrations/031_tagi_i_tytuly.sql` ustawia tagi dziesięciu artykułów w indeksie:

| Slug | Tagi |
|---|---|
| `ai-w-ofertach-i-wycenach-msp-szybka-sprzedaz-wieksze-zyski` | Sprzedaż, Oferty |
| `ai-w-analizie-danych-msp-lepsze-decyzje` | Analiza danych |
| `forteca-firmy-ai-cyberbezpieczenstwo-msp` | Cyberbezpieczeństwo |
| `ai-w-zarzadzaniu-projektami-msp-kontrola-wyniki` | Zarządzanie projektami |
| `ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n` | n8n, Integracje |
| `ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp` | Baza wiedzy, RAG |
| `ai-w-sprzedazy-i-marketingu-msp-przewaga-konkurencyjna` | Sprzedaż, CRM |
| `automatyzacja-dokumentow-faktur-ai-msp` | Faktury, OCR, KSeF |
| `automatyzacja-obslugi-klienta-ai-rag-msp` | Obsługa klienta, Chatboty |
| `ai-w-rekrutacji-msp-najlepsi-pracownicy` | Rekrutacja, HR |

Kafelek na `/blog` pokazuje dwa pierwsze tagi, nagłówek artykułu wszystkie.

W trzech miejscach znika `tag.replace(/-/g, ' ')`, bo etykieta z myślnikiem („E-commerce”)
rozpadłaby się na dwa słowa:

- `app/blog/_components/BlogCarousel.tsx`
- `app/blog/[slug]/page.tsx`
- `components/marketing/blog-preview.tsx` (tu zamiana siedzi w `toDisplayPosts`, domyślna wartość `'Blog'` zostaje)

### 3. Tytuły

Ta sama migracja zmienia wielkość liter w pięciu tytułach. Słowa zostają te same.

| Slug | Nowy tytuł |
|---|---|
| `ai-w-ofertach-i-wycenach-msp-szybka-sprzedaz-wieksze-zyski` | AI w ofertach i wycenach: jak MSP szybciej sprzedaje i więcej zarabia? |
| `ai-w-analizie-danych-msp-lepsze-decyzje` | AI w analizie danych: jak MSP podejmują lepsze decyzje i wyprzedzają konkurencję |
| `forteca-firmy-ai-cyberbezpieczenstwo-msp` | Forteca dla twojej firmy: jak AI wzmacnia cyberbezpieczeństwo w MSP |
| `ai-w-zarzadzaniu-projektami-msp-kontrola-wyniki` | AI w zarządzaniu projektami dla MSP: większa kontrola, lepsze wyniki |
| `ai-w-rekrutacji-msp-najlepsi-pracownicy` | AI w rekrutacji: jak MSP szybko i obiektywnie znajdują najlepszych pracowników |

Adresy (slugi) się nie zmieniają.

### 4. Reguły dla nowych artykułów

`docs/seo/editorial-standard.md` — dwie reguły w sekcji „Struktura artykułu”:

- Tytuł: wielka litera tylko na początku i w nazwach własnych oraz skrótowcach (AI, MSP, KSeF).
- Tagi: dwa lub trzy, zwykłe słowa po polsku z polskimi znakami, bez myślników zamiast spacji.

`.github/scripts/blog-auto.mjs` — we wzorze odpowiedzi JSON `"tags": ["[tag1]", …]`
zamienia się na przykład w nowej konwencji, np. `["Obsługa klienta", "Chatboty"]`, z dopiskiem, że to przykład formatu.

Redaktor AI w panelu (`generatePostAction`) czyta ten sam standard przez `promptArtykulu`,
a tagi opisuje tylko schemat `z.array(z.string())` bez własnego wzoru, więc reguła obejmuje go bez zmian w kodzie.

## Migracja 031 — zabezpieczenie

Wzorzec jak w 029: blok `DO` sprawdza każdy z dziesięciu wierszy przed zmianą.

- Wartość równa tej sprzed migracji → zmiana.
- Wartość równa docelowej → pominięcie (migracja już zastosowana).
- Cokolwiek innego → `RAISE EXCEPTION` z nazwą sluga; nic się nie zapisuje.

Wartości sprzed migracji pochodzą z odczytu bazy z 2026-09-15 i są wpisane do pliku dosłownie.
Na końcu pliku zapytanie weryfikacyjne w komentarzu: artykuły w indeksie z tagiem zawierającym myślnik
lub z tytułem niezgodnym z docelowym — oczekiwane zero wierszy.

Migrację uruchamia właściciel w Supabase (MCP jest tylko do odczytu). Kod działa poprawnie
zarówno przed migracją, jak i po niej, więc kolejność wdrożenia i migracji jest dowolna.

## Sprawdzenie

Przed PR:

- `npm run type-check`, `npm run lint`, `npm run build` bez błędów.

Po wdrożeniu i migracji:

- podstrona `/case-studies/oszczednosc-czasu-fintech` ma w HTML `<meta name="robots" content="noindex, follow">`,
- `sitemap.xml` nie zawiera adresów `/case-studies/…` (lista `/case-studies` zostaje),
- kafelki na `/blog` i sekcja bloga na stronie głównej pokazują tagi z polskimi znakami,
- zapytanie weryfikacyjne z migracji zwraca zero wierszy.

## Organizacja pracy

Gałąź `feat/porzadki-strony` z `origin/main`, w osobnym katalogu roboczym
`C:\Projects\zautomatyzujemy-porzadki`. Główny katalog zostaje na gałęzi Codeksa z jego niezacommitowaną zmianą.
Jeden PR.
