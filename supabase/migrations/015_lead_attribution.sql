-- 015_lead_attribution.sql
-- Skąd przyszedł lead. Wszystkie kolumny opcjonalne: brak atrybucji nie może
-- blokować zapisu leada, bo lead jest ważniejszy niż wiedza o jego pochodzeniu.

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS landing_path TEXT,
  ADD COLUMN IF NOT EXISTS referrer     TEXT,
  ADD COLUMN IF NOT EXISTS utm_source   TEXT,
  ADD COLUMN IF NOT EXISTS source_kind  TEXT;

COMMENT ON COLUMN leads.source_kind IS
  'organic | social | referral | direct | campaign | internal — klasyfikacja z lib/attribution.ts';

-- Raport miesięczny grupuje właśnie po tej kolumnie
CREATE INDEX IF NOT EXISTS leads_source_kind_idx ON leads (source_kind);
