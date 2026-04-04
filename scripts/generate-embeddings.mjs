/**
 * Skrypt do generowania embeddingów z plików w katalogu knowledge/
 * Użycie: pnpm db:generate
 *
 * Ładuje zmienne z .env.local przez flagę --env-file (Node 20.6+)
 */

import { createClient } from '@supabase/supabase-js'
import { google } from '@ai-sdk/google'
import { embedMany } from 'ai'
import { readdir, readFile } from 'node:fs/promises'
import { join, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')
const KNOWLEDGE_DIR = join(ROOT, 'knowledge')

const CHUNK_SIZE = 500
const CHUNK_OVERLAP = 50
const SUPPORTED_EXTENSIONS = new Set(['.txt', '.md'])

/**
 * Dzieli tekst na chunki z nakładaniem (overlap).
 * @param {string} text
 * @returns {string[]}
 */
function chunkText(text) {
  const chunks = []
  let start = 0
  const clean = text.replace(/\r\n/g, '\n').trim()

  while (start < clean.length) {
    const end = Math.min(start + CHUNK_SIZE, clean.length)
    const chunk = clean.slice(start, end).trim()
    if (chunk.length > 0) chunks.push(chunk)
    if (end === clean.length) break
    start = end - CHUNK_OVERLAP
  }

  return chunks
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Brakuje zmiennych środowiskowych: NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error('❌ Brakuje zmiennej środowiskowej: GOOGLE_GENERATIVE_AI_API_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  let files
  try {
    files = await readdir(KNOWLEDGE_DIR)
  } catch {
    console.error(`❌ Nie można odczytać katalogu knowledge/. Upewnij się, że istnieje: ${KNOWLEDGE_DIR}`)
    process.exit(1)
  }

  const textFiles = files.filter(f => SUPPORTED_EXTENSIONS.has(extname(f).toLowerCase()))

  if (textFiles.length === 0) {
    console.log('⚠️  Brak plików .txt lub .md w katalogu knowledge/')
    console.log('   Dodaj dokumenty (cennik, FAQ, opis usług) i uruchom ponownie.')
    return
  }

  console.log(`📂 Znaleziono ${textFiles.length} plik(ów) w knowledge/\n`)

  for (const file of textFiles) {
    const source = basename(file)
    const content = await readFile(join(KNOWLEDGE_DIR, file), 'utf-8')
    const chunks = chunkText(content)

    if (chunks.length === 0) {
      console.log(`⏭  ${source}: pominięto (pusty plik)`)
      continue
    }

    console.log(`⚙️  ${source}: ${chunks.length} chunków — generuję embeddingi...`)

    // Usuń stare embeddingi dla tego pliku
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('source', source)

    if (deleteError) {
      console.error(`❌ Błąd usuwania starych danych dla ${source}:`, deleteError.message)
      continue
    }

    // Generuj embeddingi (Google text-embedding-004, 768 dim)
    const { embeddings } = await embedMany({
      model: google.textEmbeddingModel('text-embedding-004'),
      values: chunks,
    })

    // Zapisz do Supabase
    const rows = chunks.map((chunk, i) => ({
      content: chunk,
      embedding: embeddings[i],
      source,
      metadata: { source, chunk_index: i, total_chunks: chunks.length },
    }))

    const { error: insertError } = await supabase.from('documents').insert(rows)

    if (insertError) {
      console.error(`❌ Błąd zapisu dla ${source}:`, insertError.message)
      continue
    }

    console.log(`✅ ${source}: zapisano ${chunks.length} chunków\n`)
  }

  console.log('🎉 Gotowe! Baza wiedzy jest zaktualizowana.')
}

main().catch(err => {
  console.error('❌ Nieoczekiwany błąd:', err)
  process.exit(1)
})
