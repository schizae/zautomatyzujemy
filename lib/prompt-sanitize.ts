/**
 * Sanityzacja tekstu użytkownika przed wstrzyknięciem do promptu LLM.
 *
 * 1. Escapuje delimitery (<<<, >>>) — zapobiega ucieczce z sekcji danych
 * 2. Obcina do limitu znaków
 * 3. Wykrywa podejrzane wzorce prompt injection
 */

const DELIMITER_REGEX = /<<<|>>>/g

/** Zamienia delimitery na znaki widoczne ale nieinterpretowalne */
export function escapeDelimiters(text: string): string {
  return text.replace(DELIMITER_REGEX, match =>
    match === '<<<' ? '‹‹‹' : '›››'
  )
}

/** Pełna sanityzacja: escape + truncate */
export function sanitizeUserContent(text: string, maxLength = 4000): string {
  return escapeDelimiters(text).slice(0, maxLength)
}

/**
 * Wykrywa dominujący język tekstu (heurystyka oparta na znakach diakrytycznych
 * i częstych słowach). Zwraca true jeśli tekst jest _głównie_ po polsku
 * lub zawiera zbyt mało tekstu do oceny (< 20 znaków).
 */
const POLISH_MARKERS = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g
const POLISH_WORDS = /\b(jest|nie|tak|jak|czy|ale|lub|dla|się|bez|już|może|jestem|chcę|proszę|dzięki|witam|potrzebuję)\b/gi

export function isPredominantlyPolish(text: string): boolean {
  if (text.length < 20) return true // zbyt krótkie do oceny

  const polishChars = (text.match(POLISH_MARKERS) ?? []).length
  const polishWords = (text.match(POLISH_WORDS) ?? []).length
  const wordCount = text.split(/\s+/).length

  // Jeśli ≥ 2 polskie znaki diakrytyczne LUB ≥ 15% słów to polskie słowa → OK
  if (polishChars >= 2) return true
  if (wordCount > 0 && polishWords / wordCount >= 0.15) return true

  return false
}

/**
 * Wzorce typowe dla prompt injection (niezależnie od języka).
 * Dopasowuje znane techniki: "ignore previous", "system:", "you are now", itp.
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|rules?|prompts?)/i,
  /disregard\s+(all\s+)?(previous|above|prior)/i,
  /forget\s+(everything|all|your)\s+(above|previous|instructions?)/i,
  /you\s+are\s+now\s+(a|an|the)\s+/i,
  /new\s+instructions?\s*:/i,
  /system\s*:\s*/i,
  /\bDAN\b.*\bjailbreak/i,
  /pretend\s+you\s+(are|can|have)/i,
  /act\s+as\s+(if|a|an|the)\s+/i,
  /override\s+(your|all|the)\s+(rules?|instructions?|safety)/i,
  /reveal\s+(your|the)\s+(system|initial|original)\s+(prompt|instructions?)/i,
]

export function containsInjectionPatterns(text: string): boolean {
  return INJECTION_PATTERNS.some(pattern => pattern.test(text))
}
