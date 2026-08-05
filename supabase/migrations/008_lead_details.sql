-- ============================================================
-- Migracja 008: Pełne dane leada z chatbota
-- Projekt: Zautomatyzujemy.pl
-- Wykonaj w: Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS phone                  TEXT,
  ADD COLUMN IF NOT EXISTS preferred_contact_time TEXT,
  ADD COLUMN IF NOT EXISTS lead_score             SMALLINT,
  ADD COLUMN IF NOT EXISTS lead_score_reason      TEXT;

-- DROP + ADD zamiast IF NOT EXISTS — Postgres nie wspiera tego dla constraintów
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_lead_score_range;

ALTER TABLE leads
  ADD CONSTRAINT leads_lead_score_range
  CHECK (lead_score IS NULL OR (lead_score BETWEEN 1 AND 5));

COMMENT ON COLUMN leads.phone IS 'Telefon podany dobrowolnie w rozmowie; dowód zgody w conversation_log';
COMMENT ON COLUMN leads.preferred_contact_time IS 'Preferowane godziny kontaktu, tekstem (np. "po 16", "rano")';
COMMENT ON COLUMN leads.lead_score IS 'Potencjał leada 1-5 oceniony przez Gemini na podstawie rozmowy';
COMMENT ON COLUMN leads.lead_score_reason IS 'Jednozdaniowe uzasadnienie oceny';
