-- ============================================================
-- Migracja 001: Schemat początkowy
-- Projekt: Zautomatyzujemy.pl
-- Wykonaj w: Supabase Dashboard → SQL Editor
-- ============================================================

-- Włącz rozszerzenie pgvector (wymagane do RAG)
CREATE EXTENSION IF NOT EXISTS vector;

-- ─── Tabela: posts (Blog) ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS posts (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug          TEXT        UNIQUE NOT NULL,
  title         TEXT        NOT NULL,
  content       TEXT        NOT NULL,         -- treść w formacie Markdown
  excerpt       TEXT,                         -- krótki opis do listingów/SEO
  cover_image   TEXT,                         -- URL obrazu okładkowego
  published_at  TIMESTAMPTZ,                  -- NULL = wersja robocza
  is_published  BOOLEAN     DEFAULT false,
  author        TEXT        DEFAULT 'Zautomatyzujemy',
  tags          TEXT[]      DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tabela: documents (Baza wiedzy chatbota / RAG) ─────────────────────────

CREATE TABLE IF NOT EXISTS documents (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  content     TEXT    NOT NULL,               -- chunk tekstu
  embedding   vector(1536),                   -- OpenAI text-embedding-3-small
  metadata    JSONB   DEFAULT '{}',           -- np. {"source": "cennik.pdf", "page": 2}
  source      TEXT,                           -- nazwa pliku źródłowego
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks IVFFLAT do szybkiego wyszukiwania wektorowego (cosine similarity)
-- Uwaga: utwórz dopiero gdy masz >= 1000 wierszy, wcześniej brute-force jest szybszy
CREATE INDEX IF NOT EXISTS documents_embedding_idx
  ON documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ─── Tabela: leads (Leady z chatbota) ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS leads (
  id                    UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  email                 TEXT    NOT NULL,
  name                  TEXT,
  conversation_summary  TEXT,               -- co użytkownik chciał osiągnąć
  source                TEXT    DEFAULT 'chatbot',
  n8n_sent              BOOLEAN DEFAULT false,   -- czy webhook do n8n wysłany
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Row Level Security (RLS) ────────────────────────────────────────────────

ALTER TABLE posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads     ENABLE ROW LEVEL SECURITY;

-- Publiczny odczyt opublikowanych artykułów (anonimowy użytkownik)
CREATE POLICY "Opublikowane posty widoczne dla wszystkich"
  ON posts FOR SELECT
  USING (is_published = true);

-- Service role ma pełny dostęp (używany przez webhook n8n i skrypty)
CREATE POLICY "Service role — pełny dostęp do posts"
  ON posts FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role — pełny dostęp do documents"
  ON documents FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role — pełny dostęp do leads"
  ON leads FOR ALL
  USING (auth.role() = 'service_role');

-- ─── Funkcja: match_documents (Similarity Search dla RAG) ───────────────────

CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
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

-- ─── Trigger: auto-update updated_at w tabeli posts ──────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── Dane testowe (opcjonalne — usuń w produkcji) ─────────────────────────────

-- INSERT INTO posts (slug, title, content, excerpt, is_published, published_at)
-- VALUES (
--   'witamy-na-blogu',
--   'Witamy na blogu Zautomatyzujemy.pl',
--   '# Witamy!\n\nTo jest pierwszy artykuł testowy.',
--   'Pierwszy artykuł na naszym blogu o automatyzacji AI.',
--   true,
--   NOW()
-- );
