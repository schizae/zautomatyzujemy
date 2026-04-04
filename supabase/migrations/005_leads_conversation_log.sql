-- ============================================================
-- Migracja 005: Dodanie pola conversation_log do tabeli leads
-- Projekt: Zautomatyzujemy.pl
-- Wykonaj w: Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS conversation_log JSONB DEFAULT '[]';
