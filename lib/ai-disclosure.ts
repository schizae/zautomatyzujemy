/**
 * Treść widocznej adnotacji pod artykułem, stan publikacji i znacznik maszynowy.
 *
 * Moduł jest celowo wolny od zależności — testuje go `scripts/ai-disclosure.test.mjs`
 * bez bazy, Reacta i sieci.
 */

/**
 * Człon wyliczenia `IPTCDigitalSourceEnumeration` oznaczający treść w całości
 * wygenerowaną maszynowo. Schema.org opisuje go jako zakodowany według słownika
 * IPTC — dlatego w JSON-LD używamy tej wartości, a nie surowego URI IPTC.
 */
export const TRAINED_ALGORITHMIC_MEDIA =
  'https://schema.org/TrainedAlgorithmicMediaDigitalSource'

const AUTHOR_PHRASE = 'Tekst przygotowany przez redaktora AI Zautomatyzujemy.pl'

export type BlogPublishMode = 'review' | 'auto'

export interface PublishState {
  is_published: boolean
  published_at: string | null
  reviewed_at: string | null
}

function formatReviewDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Zwraca `null` dla treści pisanej przez człowieka — wtedy adnotacji nie ma wcale.
 *
 * Dowodem kontroli redakcyjnej jest `reviewedAt`, nie tryb ustawiony dzisiaj
 * w panelu. Dzięki temu przełączenie trybu nie zmienia wstecz tego, co adnotacja
 * mówi o artykułach opublikowanych wcześniej.
 */
export function buildDisclosureText(
  aiGenerated: boolean,
  reviewedAt: string | null
): string | null {
  if (!aiGenerated) return null
  if (reviewedAt) {
    return `${AUTHOR_PHRASE}, sprawdzony przed publikacją ${formatReviewDate(reviewedAt)}.`
  }
  return `${AUTHOR_PHRASE}, publikowany automatycznie.`
}

/**
 * Rozstrzyga, czy przychodzący artykuł ma trafić na stronę, czy poczekać w panelu.
 *
 * `existing` to stan wpisu o tym samym slugu, jeśli już jest w bazie.
 */
export function resolvePublishState(
  mode: BlogPublishMode,
  now: string,
  requestedPublishedAt: string | null,
  existing: PublishState | null
): PublishState {
  // Artykuł raz zatwierdzony przez człowieka nie wraca do szkiców przy ponowieniu
  // żądania z generatora — inaczej retry cofałby decyzję redaktora.
  if (existing?.reviewed_at) {
    return existing
  }

  if (mode === 'review') {
    return { is_published: false, published_at: null, reviewed_at: null }
  }

  return {
    is_published: true,
    published_at: requestedPublishedAt ?? now,
    reviewed_at: null,
  }
}
