# Zadania właściciela — projekt widoczności w wyszukiwarce

Rzeczy, których nie zrobię za Ciebie, bo wymagają dostępu, którego nie mam, albo decyzji,
która należy do Ciebie. Stan na 10 września 2026.

---

## 1. Zastosować migrację w Supabase — ZROBIONE 11 września 2026

Sprawdzone: cztery kolumny i indeks `leads_source_kind_idx` są w bazie produkcyjnej.
Pull request 18 można scalać.

<details><summary>Treść zadania, dla historii</summary>

Bez tego zapis leada z nowymi kolumnami zwróci błąd, więc formularz kontaktowy przestanie
przyjmować zgłoszenia po wdrożeniu gałęzi `feat/atrybucja-leadow`.
**Zrób to przed scaleniem pull requesta numer 18.**

Wejdź w panel Supabase, edytor SQL, wklej i uruchom zawartość pliku
`supabase/migrations/015_lead_attribution.sql`, czyli:

```sql
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS landing_path TEXT,
  ADD COLUMN IF NOT EXISTS referrer     TEXT,
  ADD COLUMN IF NOT EXISTS utm_source   TEXT,
  ADD COLUMN IF NOT EXISTS source_kind  TEXT;

COMMENT ON COLUMN leads.source_kind IS
  'organic | social | referral | direct | campaign | internal — klasyfikacja z lib/attribution.ts';

CREATE INDEX IF NOT EXISTS leads_source_kind_idx ON leads (source_kind);
```

Sprawdzenie, że się udało — to zapytanie ma zwrócić cztery wiersze:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'leads'
  AND column_name IN ('landing_path', 'referrer', 'utm_source', 'source_kind')
ORDER BY column_name;
```

Dlaczego nie zrobiłem tego sam: serwer Supabase jest podpięty w trybie tylko do odczytu
i odmawia wykonania polecenia zmieniającego strukturę bazy.

</details>

---

## 2. Przekierowanie domeny na trwałe — ZROBIONE 11 września 2026

Sprawdzone: `https://zautomatyzujemy.pl` zwraca `308 Permanent Redirect` na wersję z www.

<details><summary>Treść zadania, dla historii</summary>

Dziś `zautomatyzujemy.pl` przekierowuje na wersję z www kodem 307, czyli tymczasowym.
Dla wyszukiwarki tymczasowe przekierowanie nie przenosi sygnałów rankingowych na docelowy adres.

Panel Vercel, projekt, zakładka Domains, ustawienie przekierowania z `zautomatyzujemy.pl`
na `www.zautomatyzujemy.pl` zmienić na trwałe (Permanent, kod 308).

Sprawdzenie po zmianie:

```bash
curl -sI https://zautomatyzujemy.pl | head -3
```

Oczekiwane: `308 Permanent Redirect` zamiast obecnego `307`.

</details>

---

## 3. Uzupełnić punkt odniesienia (`docs/seo/baseline.md`)

Dwie tabele w tym pliku czekają na dane, do których nie mam dostępu.

**Search Console, ostatnie 3 miesiące.** Zakładka Skuteczność: kliknięcia, wyświetlenia,
średni CTR, średnia pozycja. Raport Indeksowanie stron: liczba stron zaindeksowanych i wykluczonych.

**PageSpeed Insights, wariant mobilny.** Wejdź na pagespeed.web.dev i zmierz trzy adresy
wypisane w pliku. Publiczne API odmówiło mi pomiaru z powodu wyczerpanego wspólnego limitu zapytań.

Po co: bez liczb sprzed zmian nie da się później wykazać, czy cokolwiek się poprawiło.

---

## 4. Dostęp do danych z Search Console (potrzebne do doboru tematów)

Automat blogowy ma pisać pod frazy, które ludzie realnie wpisują. Połowa tych danych siedzi
w Search Console i wymaga Twojego zalogowania.

Wejdź w Skuteczność, ustaw zakres na 16 miesięcy, zakładka Zapytania, przycisk Eksportuj,
format CSV. Plik wrzuć do `data/seo/gsc-queries.csv` w repo albo prześlij mi go w rozmowie.

---

## 5. Decyzje, które czekają

**Trzy realne wdrożenia z prawem do opisu.** Case studies na stronie są uczciwie oznaczone jako
scenariusze poglądowe, czyli nie masz czym się pochwalić. Dla usług B2B za kilka tysięcy złotych
brak dowodu blokuje sprzedaż mocniej niż brak strony usługowej. Wariant zapasowy, jeśli w ciągu
kwartału nie znajdziesz klientów na referencje: publiczne repozytorium z działającym przepływem n8n
plus opis własnych wdrożeń na tej witrynie.

**Profile do uzupełnienia w danych strukturalnych.** Potrzebuję adresów Twojego LinkedIna i GitHuba,
żeby wpiąć je jako `sameAs`. Dziś to pole jest puste, a to jeden z sygnałów, po których wyszukiwarka
łączy witrynę z osobą.

**Prywatny adres na cotygodniowy przegląd nowości AI.** Przeglądy znikają z bloga i mają trafiać
do Ciebie mailem. Podaj adres, na który je wysyłać.

---

## Czego nie musisz robić

Przeglądu artykułów, na razie. Automat blogowy zmienia się dopiero w trzecim planie.
Do tego czasu wszystko chodzi jak dotąd.
