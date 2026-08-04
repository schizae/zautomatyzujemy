-- ============================================================
-- Migracja 007: Zgoda marketingowa i wypis z newslettera
-- Projekt: Zautomatyzujemy.pl
-- Wykonaj w: Supabase Dashboard → SQL Editor
-- ============================================================

-- Osobna tabela — lead (zapytanie handlowe) to nie to samo co subskrybent
-- newslettera. RODO wymaga oddzielnej, dobrowolnej zgody na marketing.
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id                UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  email             TEXT    NOT NULL UNIQUE,
  -- Dowód zgody na wypadek kontroli: kiedy, z jakiego IP, pod jaką treścią
  consent_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consent_ip        TEXT,
  consent_text      TEXT    NOT NULL,
  source            TEXT    DEFAULT 'lead_magnet',
  -- Token w linku wypisu — nieodgadywalny, jeden na subskrybenta
  unsubscribe_token UUID    NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  unsubscribed_at   TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS newsletter_subscribers_token_idx
  ON newsletter_subscribers (unsubscribe_token);

-- Aktywni subskrybenci = ci bez daty wypisu
CREATE INDEX IF NOT EXISTS newsletter_subscribers_active_idx
  ON newsletter_subscribers (email) WHERE unsubscribed_at IS NULL;

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Brak polityki dla anon — dostęp wyłącznie przez service role z Server Actions.
-- Adresy e-mail nie mogą być czytelne dla klienta.
CREATE POLICY "Service role — pełny dostęp do newsletter_subscribers"
  ON newsletter_subscribers FOR ALL
  USING (auth.role() = 'service_role');
