/**
 * Generowanie embeddingów bazy wiedzy chatbota.
 *
 * Źródła: pliki knowledge/*.md oraz treści z Supabase
 * (posts, case_studies, faq_items, services, page_content).
 *
 * Lokalnie:  pnpm db:generate
 * W CI:      node scripts/generate-embeddings.mjs
 * Diagnoza:  node --env-file=.env.local scripts/generate-embeddings.mjs --probe "ile kosztuje automatyzacja"
 */

import { createClient } from '@supabase/supabase-js'
import { google } from '@ai-sdk/google'
import { embedMany } from 'ai'
import { readdir, readFile } from 'node:fs/promises'
import { join, extname, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const KNOWLEDGE_DIR = join(ROOT, 'knowledge')

const CHUNK_SIZE = 500
const CHUNK_OVERLAP = 50
const EMBED_BATCH = 100
const SUPPORTED_EXTENSIONS = new Set(['.txt', '.md'])

// text-embedding-004 został wycofany z API — potwierdzone przez ListModels 2026-08-04
const EMBEDDING_MODEL = 'gemini-embedding-001'
// Musi zgadzać się z vector(768) z migracji 002 oraz z app/api/chat/route.ts
const EMBEDDING_DIMENSIONS = 768

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

/**
 * Dokumenty z katalogu knowledge/.
 * @returns {Promise<{source: string, text: string}[]>}
 */
async function collectFileDocuments() {
  let files
  try {
    files = await readdir(KNOWLEDGE_DIR)
  } catch {
    console.warn('⚠️  Brak katalogu knowledge/ — pomijam źródła plikowe.')
    return []
  }

  const docs = []
  for (const file of files) {
    if (!SUPPORTED_EXTENSIONS.has(extname(file).toLowerCase())) continue
    const text = await readFile(join(KNOWLEDGE_DIR, file), 'utf-8')
    docs.push({ source: `file:${basename(file)}`, text })
  }
  return docs
}

/**
 * Dokumenty z Supabase — tylko treści opublikowane/aktywne.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<{source: string, text: string}[]>}
 */
async function collectDbDocuments(supabase) {
  const docs = []

  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('slug, title, excerpt, content, tags')
    .eq('is_published', true)
  if (postsError) throw new Error(`posts: ${postsError.message}`)

  for (const post of posts ?? []) {
    const tags = Array.isArray(post.tags) && post.tags.length > 0
      ? `\nTagi: ${post.tags.join(', ')}`
      : ''
    docs.push({
      source: `post:${post.slug}`,
      text: `Artykuł z bloga: ${post.title}${tags}\n\n${post.excerpt ?? ''}\n\n${post.content ?? ''}`,
    })
  }

  const { data: caseStudies, error: caseStudiesError } = await supabase
    .from('case_studies')
    .select('slug, title, description, content, tag')
    .eq('is_active', true)
  if (caseStudiesError) throw new Error(`case_studies: ${caseStudiesError.message}`)

  for (const study of caseStudies ?? []) {
    docs.push({
      source: `case-study:${study.slug}`,
      text: `Wdrożenie u klienta (case study): ${study.title}\nKategoria: ${study.tag ?? 'brak'}\n\n${study.description ?? ''}\n\n${study.content ?? ''}`,
    })
  }

  const { data: faqItems, error: faqError } = await supabase
    .from('faq_items')
    .select('question, answer')
    .eq('is_active', true)
    .order('sort_order')
  if (faqError) throw new Error(`faq_items: ${faqError.message}`)

  if (faqItems && faqItems.length > 0) {
    docs.push({
      source: 'faq',
      text: `Najczęściej zadawane pytania:\n\n${faqItems
        .map(item => `Pytanie: ${item.question}\nOdpowiedź: ${item.answer}`)
        .join('\n\n')}`,
    })
  }

  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('title, description')
    .eq('is_active', true)
    .order('sort_order')
  if (servicesError) throw new Error(`services: ${servicesError.message}`)

  if (services && services.length > 0) {
    docs.push({
      source: 'services',
      text: `Nasze usługi:\n\n${services
        .map(service => `${service.title}: ${service.description ?? ''}`)
        .join('\n\n')}`,
    })
  }

  const { data: pageContent, error: pageContentError } = await supabase
    .from('page_content')
    .select('key, label, value')
  if (pageContentError) throw new Error(`page_content: ${pageContentError.message}`)

  if (pageContent && pageContent.length > 0) {
    docs.push({
      source: 'page-content',
      text: `Treści ze strony firmowej:\n\n${pageContent
        .map(item => `${item.label ?? item.key}: ${item.value ?? ''}`)
        .join('\n\n')}`,
    })
  }

  return docs
}

/**
 * Embeddingi w partiach — jedno wywołanie API ma limit wartości.
 * @param {string[]} chunks
 * @returns {Promise<number[][]>}
 */
async function embedChunks(chunks) {
  const result = []
  for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
    const { embeddings } = await embedMany({
      model: google.textEmbeddingModel(EMBEDDING_MODEL),
      values: chunks.slice(i, i + EMBED_BATCH),
      providerOptions: {
        google: {
          // Kolumna w bazie to vector(768); model domyślnie zwraca 3072
          outputDimensionality: EMBEDDING_DIMENSIONS,
          // Dokumenty i zapytania embeduje się asymetrycznie — to poprawia trafność
          taskType: 'RETRIEVAL_DOCUMENT',
        },
      },
    })
    result.push(...embeddings)
  }
  return result
}

/**
 * Tryb diagnostyczny — pokazuje realne podobieństwo dla zadanego pytania.
 * Bez tego nie da się sensownie dobrać match_threshold w app/api/chat/route.ts.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} question
 */
async function probe(supabase, question) {
  const { embeddings } = await embedMany({
    model: google.textEmbeddingModel(EMBEDDING_MODEL),
    values: [question],
    providerOptions: {
      google: {
        outputDimensionality: EMBEDDING_DIMENSIONS,
        // RETRIEVAL_QUERY, nie _DOCUMENT — tu embedujemy pytanie, nie treść
        taskType: 'RETRIEVAL_QUERY',
      },
    },
  })

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embeddings[0],
    match_threshold: 0.0,
    match_count: 10,
  })

  if (error) {
    console.error('❌ match_documents:', error.message)
    process.exit(1)
  }

  console.log(`\n🔍 Pytanie: "${question}"\n`)
  if (!data || data.length === 0) {
    console.log('   Brak jakichkolwiek wyników — baza wiedzy jest pusta.')
    return
  }

  for (const row of data) {
    const source = row.metadata?.source ?? 'brak'
    const preview = row.content.slice(0, 90).replace(/\n/g, ' ')
    console.log(`   ${row.similarity.toFixed(3)}  [${source}]  ${preview}…`)
  }
  console.log('\n   Próg w app/api/chat/route.ts wynosi 0.6 — odetnie wszystko poniżej.\n')
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Brakuje zmiennych: NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error('❌ Brakuje zmiennej: GOOGLE_GENERATIVE_AI_API_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const probeIndex = process.argv.indexOf('--probe')
  if (probeIndex !== -1) {
    const question = process.argv[probeIndex + 1]
    if (!question) {
      console.error('❌ Użycie: --probe "treść pytania"')
      process.exit(1)
    }
    await probe(supabase, question)
    return
  }

  const documents = [
    ...(await collectFileDocuments()),
    ...(await collectDbDocuments(supabase)),
  ]

  if (documents.length === 0) {
    console.log('⚠️  Brak treści do zaindeksowania.')
    return
  }

  console.log(`📂 Źródeł do zaindeksowania: ${documents.length}\n`)

  const syncedSources = []

  for (const { source, text } of documents) {
    const chunks = chunkText(text)

    if (chunks.length === 0) {
      console.log(`⏭  ${source}: pominięto (pusta treść)`)
      continue
    }

    console.log(`⚙️  ${source}: ${chunks.length} chunków — generuję embeddingi...`)

    // Embeddingi PRZED kasowaniem — błąd API nie może zostawić bazy bez danych
    let embeddings
    try {
      embeddings = await embedChunks(chunks)
    } catch (err) {
      console.error(`❌ ${source}: błąd embeddingu —`, err instanceof Error ? err.message : err)
      continue
    }

    // Id starych chunków zbieramy przed zapisem, żeby skasować je dopiero po udanym
    // insercie — gdyby zapis padł, źródło zostałoby bez danych do kolejnego przebiegu
    const { data: previousRows, error: previousError } = await supabase
      .from('documents')
      .select('id')
      .eq('source', source)

    if (previousError) {
      console.error(`❌ ${source}: nie udało się odczytać starych chunków —`, previousError.message)
      continue
    }

    const rows = chunks.map((chunk, index) => ({
      content: chunk,
      embedding: embeddings[index],
      source,
      metadata: { source, chunk_index: index, total_chunks: chunks.length },
    }))

    const { error: insertError } = await supabase.from('documents').insert(rows)
    if (insertError) {
      console.error(`❌ ${source}: błąd zapisu —`, insertError.message)
      continue
    }

    const previousIds = (previousRows ?? [])
      .map(row => row.id)
      .filter(id => typeof id === 'string')

    if (previousIds.length > 0) {
      const { error: deleteError } = await supabase.from('documents').delete().in('id', previousIds)
      if (deleteError) {
        // Duplikaty w wynikach RAG są nieprzyjemne, ale to i tak lepsze niż puste źródło
        console.error(`⚠️  ${source}: zapisano nowe chunki, ale stare zostały —`, deleteError.message)
      }
    }

    syncedSources.push(source)
    console.log(`✅ ${source}: zapisano ${chunks.length} chunków`)
  }

  /**
   * Sprzątanie: źródła, których już nie ma (artykuł cofnięty do szkicu, usunięty plik).
   * Porównujemy z listą źródeł OCZEKIWANYCH, a nie zsynchronizowanych — źródło, które
   * padło w tym przebiegu na błędzie API, nadal istnieje i jego dane muszą przetrwać.
   * Porównanie z syncedSources skasowałoby przy wyczerpanym limicie Gemini całą bazę.
   */
  const expectedSources = new Set(documents.map(doc => doc.source))
  const { data: existingRows, error: listError } = await supabase.from('documents').select('source')

  if (listError) {
    console.error('⚠️  Nie udało się sprawdzić osieroconych źródeł:', listError.message)
  } else {
    const orphans = [...new Set((existingRows ?? []).map(row => row.source))].filter(
      source => source && !expectedSources.has(source)
    )

    if (orphans.length > 0) {
      const { error: cleanupError } = await supabase.from('documents').delete().in('source', orphans)
      if (cleanupError) {
        console.error('⚠️  Błąd sprzątania:', cleanupError.message)
      } else {
        console.log(`\n🧹 Usunięto osierocone źródła: ${orphans.join(', ')}`)
      }
    }
  }

  const failed = documents.length - syncedSources.length
  console.log(
    `\n🎉 Gotowe! Zsynchronizowano ${syncedSources.length}/${documents.length} źródeł` +
      (failed > 0 ? ` — ${failed} nie powiodło się, ich stare dane pozostały nietknięte.` : '.')
  )
}

main().catch(err => {
  console.error('❌ Nieoczekiwany błąd:', err)
  process.exit(1)
})
