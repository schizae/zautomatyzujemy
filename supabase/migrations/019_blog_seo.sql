-- 019_blog_seo.sql
-- Dwie kolumny, obie z konsumentem od pierwszego dnia.
--
-- target_keyword: fraza, pod którą artykuł powstał. Potrzebna generatorowi, żeby wiedział,
-- które tematy z planu treści są już wykorzystane, i człowiekowi przy przeglądzie.
--
-- noindex: wyłączenie archiwalnych przeglądów z indeksu bez usuwania ich ze strony.
-- Sama kolumna niczego nie deindeksuje — działa dopiero z robots w metadanych artykułu
-- i z filtrem w mapie strony. Kolejność ma znaczenie: mapa to podpowiedź, robots to polecenie.

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS target_keyword TEXT,
  ADD COLUMN IF NOT EXISTS noindex        BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN posts.target_keyword IS
  'Fraza docelowa z docs/seo/plan-tresci.md, pod którą artykuł został napisany.';

COMMENT ON COLUMN posts.noindex IS
  'TRUE wyłącza artykuł z mapy strony i dodaje robots: noindex w metadanych.';
