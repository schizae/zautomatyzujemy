-- 030_blog_opisy.sql
-- Dokończenie porządków z 029: „zrewolucjonizować” i „rewolucjonizuje” zostały w polu excerpt,
-- które strona pokazuje jako opis w wynikach wyszukiwania. Dotyczy dwóch artykułów.
-- Podmiana tylko wtedy, gdy opis jest dokładnie taki jak przy składaniu migracji,
-- więc ponowne uruchomienie po udanym nic nie zmienia.

UPDATE posts
SET excerpt = 'Jak sztuczna inteligencja zmienia tworzenie ofert i wycen w małej firmie: narzędzia i sposoby, które skracają przygotowanie oferty i ograniczają pomyłki w kwotach.'
WHERE slug = 'ai-w-ofertach-i-wycenach-msp-szybka-sprzedaz-wieksze-zyski'
  AND excerpt = 'Dowiedz się, jak sztuczna inteligencja może zrewolucjonizować proces tworzenia ofert i wycen w Twojej firmie. Odkryj narzędzia i strategie, które pozwolą Ci skrócić cykle sprzedażowe, zwiększyć precyzję i budować przewagę konkurencyjną, oszczędzając cenny czas i zasoby.';

UPDATE posts
SET excerpt = 'Jak sztuczna inteligencja pomaga chronić dane w małych i średnich firmach: wykrywanie nietypowych zachowań, ochrona przed phishingiem i automatyczna reakcja na incydenty.'
WHERE slug = 'forteca-firmy-ai-cyberbezpieczenstwo-msp'
  AND excerpt = 'Odkryj, jak sztuczna inteligencja rewolucjonizuje ochronę danych w małych i średnich firmach. Naucz się, jak wdrożyć AI, by skutecznie zapobiegać atakom i chronić swój biznes przed cyberzagrożeniami, oszczędzając czas i zasoby.';

-- ─── Weryfikacja ─────────────────────────────────────────────────────────────
-- Zero wierszy:
--
--   SELECT slug FROM posts
--   WHERE is_published AND noindex = false AND excerpt ILIKE '%rewolucj%';
