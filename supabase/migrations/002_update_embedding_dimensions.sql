-- ============================================================
-- Migracja 002: Zmiana wymiarów embeddingu z 1536 (OpenAI) na 768 (Google)
-- Projekt: Zautomatyzujemy.pl
-- Wykonaj w: Supabase Dashboard → SQL Editor
-- ============================================================

-- Usuń stary indeks (incompatible z nowym typem)
DROP INDEX IF EXISTS documents_embedding_idx;

-- Zmień typ kolumny embedding
ALTER TABLE documents
  ALTER COLUMN embedding TYPE vector(768);

-- Zaktualizuj funkcję match_documents
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold FLOAT   DEFAULT 0.7,
  match_count     INT     DEFAULT 5
)
RETURNS TABLE (
  id          UUID,
  content     TEXT,
  metadata    JSONB,
  similarity  FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Odtwórz indeks (opcjonalne — potrzebne dopiero przy >= 1000 wierszy)
CREATE INDEX IF NOT EXISTS documents_embedding_idx
  ON documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
