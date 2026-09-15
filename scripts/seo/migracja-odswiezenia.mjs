/**
 * Składa migrację podmieniającą treść istniejącego artykułu na odświeżoną wersję.
 *
 * Źródłem jest plik z docs/seo/odswiezenia/, zatwierdzany przez właściciela przed uruchomieniem.
 * Skrypt przepuszcza tekst przez tę samą bramkę co generator i odmawia pracy, dopóki
 * w tekście stoi znacznik wstawki autorskiej.
 *
 * Migracja podmienia treść tylko wtedy, gdy ta w bazie jest identyczna jak w chwili składania
 * migracji. Artykuł poprawiony w międzyczasie w panelu nie zostanie po cichu nadpisany.
 *
 * Użycie:
 *   node --env-file=.env.local scripts/seo/migracja-odswiezenia.mjs \
 *     docs/seo/odswiezenia/plik.md supabase/migrations/NNN_nazwa.sql
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { sprawdzArtykul } from './quality-gate.mjs'

const [zrodlo, cel] = process.argv.slice(2)
if (!zrodlo || !cel) {
  console.error('Podaj plik artykułu i ścieżkę migracji.')
  process.exit(1)
}

function wczytajArtykul(sciezka) {
  const tekst = readFileSync(sciezka, 'utf8').replace(/\r\n/g, '\n')
  const dopasowanie = tekst.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!dopasowanie) throw new Error(`Brak nagłówka z metadanymi w ${sciezka}`)

  const pola = Object.fromEntries(
    dopasowanie[1].split('\n').map(linia => {
      const i = linia.indexOf(':')
      return [linia.slice(0, i).trim(), linia.slice(i + 1).trim().replace(/^"|"$/g, '')]
    })
  )
  return { ...pola, content: dopasowanie[2].trim() + '\n' }
}

async function pobierz(sciezka) {
  const klucz = process.env.SUPABASE_SERVICE_ROLE_KEY
  const odpowiedz = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${sciezka}`, {
    headers: { apikey: klucz, Authorization: `Bearer ${klucz}` },
  })
  if (!odpowiedz.ok) throw new Error(`Supabase ${odpowiedz.status} dla ${sciezka}`)
  return odpowiedz.json()
}

const md5 = tekst => createHash('md5').update(tekst, 'utf8').digest('hex')

const artykul = wczytajArtykul(zrodlo)
const posty = await pobierz('posts?select=slug,title,content')
const uslugi = await pobierz('services?select=slug&is_active=eq.true')

const obecny = posty.find(post => post.slug === artykul.slug)
if (!obecny) throw new Error(`Nie ma w bazie artykułu ${artykul.slug}`)

const wynik = sprawdzArtykul(
  { title: artykul.title, slug: artykul.slug, targetKeyword: artykul.target_keyword, content: artykul.content },
  {
    istniejace: posty.filter(post => post.slug !== artykul.slug),
    uslugi: uslugi.map(usluga => usluga.slug),
  }
)
for (const uwaga of wynik.uwagi) console.warn(`Uwaga: ${uwaga}`)
if (!wynik.przechodzi) {
  console.error(`Bramka odrzuciła tekst:\n- ${wynik.braki.join('\n- ')}`)
  process.exit(1)
}

// Dolar-cytowanie zamiast escapowania, więc tekst w migracji da się przeczytać jak artykuł.
const znacznik = '$tresc$'
for (const wartosc of [artykul.title, artykul.excerpt, artykul.content]) {
  if (wartosc.includes(znacznik)) throw new Error(`Tekst zawiera ${znacznik}`)
}
const literal = wartosc => `${znacznik}${wartosc}${znacznik}`

const sql = `-- Odświeżenie artykułu ${artykul.slug}
-- Źródło: ${zrodlo.replace(/\\/g, '/')}, złożone skryptem scripts/seo/migracja-odswiezenia.mjs.
--
-- Treść jest podmieniana tylko wtedy, gdy w bazie stoi dokładnie ta wersja, z której składano
-- migrację (skrót md5 ${md5(obecny.content)}). Ponowne uruchomienie po udanym nic nie robi.

DO $$
DECLARE
  obecny_skrot TEXT;
BEGIN
  SELECT md5(content) INTO obecny_skrot FROM posts WHERE slug = '${artykul.slug}';

  IF obecny_skrot IS NULL THEN
    RAISE EXCEPTION 'Brak artykułu ${artykul.slug}';
  END IF;

  IF obecny_skrot = '${md5(artykul.content)}' THEN
    RAISE NOTICE 'Artykuł jest już odświeżony';
    RETURN;
  END IF;

  IF obecny_skrot <> '${md5(obecny.content)}' THEN
    RAISE EXCEPTION 'Treść artykułu zmieniła się od złożenia migracji, złóż ją ponownie';
  END IF;

  UPDATE posts SET
    title = ${literal(artykul.title)},
    excerpt = ${literal(artykul.excerpt)},
    target_keyword = ${literal(artykul.target_keyword)},
    ai_model = 'claude-opus-5',
    reviewed_at = now(),
    -- Git na Windowsie potrafi zamienić końce linii w pliku migracji, a skrót liczymy z LF.
    content = replace(${literal(artykul.content)}, E'\\r\\n', E'\\n')
  WHERE slug = '${artykul.slug}';
END $$;

-- Weryfikacja: tytuł nowy i skrót równy ${md5(artykul.content)}.
--
--   SELECT title, target_keyword, md5(content) FROM posts WHERE slug = '${artykul.slug}';
`

writeFileSync(cel, sql)
console.log(`Bramka przepuściła tekst. Migracja zapisana w ${cel}`)
