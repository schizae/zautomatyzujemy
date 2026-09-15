-- 027_uslugi_cena_automatyzacji.sql
-- Cena od właściciela, 15 września 2026: proste automatyzacje od 500 zł, reszta wyceniana
-- indywidualnie. Dotyczy tylko strony automatyzacji procesów. Agenci AI i obieg dokumentów
-- zostają bez kwoty, bo właściciel nie ma dla nich widełek.
--
-- Zabezpieczenia jak w 021: zdanie wstawiamy przed fragmentem, który musi wystąpić w treści
-- dokładnie raz; ponowne uruchomienie po udanym nic nie zmienia.

DO $$
DECLARE
  tresc TEXT;
  pozycja INT;
  kotwica CONSTANT TEXT := 'Wycenę podaję po krótkiej rozmowie, w której oglądam proces.';
  zdanie CONSTANT TEXT := 'Proste automatyzacje, takie jak połączenie dwóch narzędzi jednym przepływem, zaczynają się od 500 zł. ';
BEGIN
  SELECT content INTO tresc FROM services WHERE slug = 'automatyzacja-procesow-biznesowych';

  IF tresc IS NULL THEN
    RAISE EXCEPTION 'Brak usługi automatyzacja-procesow-biznesowych';
  END IF;

  IF strpos(tresc, zdanie) = 0 THEN
    pozycja := strpos(tresc, kotwica);
    IF pozycja = 0 THEN
      RAISE EXCEPTION 'W treści usługi nie ma fragmentu: %', kotwica;
    END IF;
    IF strpos(substr(tresc, pozycja + length(kotwica)), kotwica) > 0 THEN
      RAISE EXCEPTION 'Fragment występuje w treści więcej niż raz: %', kotwica;
    END IF;

    UPDATE services
    SET content = overlay(tresc PLACING zdanie || kotwica FROM pozycja FOR length(kotwica))
    WHERE slug = 'automatyzacja-procesow-biznesowych';
  END IF;
END $$;

-- Opis w wynikach wyszukiwania, tak jak przy szkoleniach („Od 2000 zł netto.”).
UPDATE services
SET seo_description = seo_description || ' Proste automatyzacje od 500 zł.'
WHERE slug = 'automatyzacja-procesow-biznesowych'
  AND seo_description NOT LIKE '%od 500 zł%';

-- ─── Weryfikacja ─────────────────────────────────────────────────────────────
-- Jeden wiersz, obie kolumny true:
--
--   SELECT content LIKE '%zaczynają się od 500 zł. Wycenę podaję%' AS w_tresci,
--          seo_description LIKE '%Proste automatyzacje od 500 zł.' AS w_opisie
--   FROM services WHERE slug = 'automatyzacja-procesow-biznesowych';
