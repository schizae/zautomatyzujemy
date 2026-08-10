/**
 * Buduje komunikat wskazujący, których dokładnie zmiennych brakuje.
 *
 * Komunikat w formie "brakuje X lub Y" kosztował dwa nieudane buildy na
 * Vercelu (9 sierpnia 2026) — nie dało się z niego wyczytać, którą zmienną
 * naprawić, więc diagnoza szła metodą prób.
 *
 * Zwraca Error zamiast go rzucać, żeby wywołanie zostało pod `if`, który
 * zawęża typy — inaczej TypeScript nadal widziałby `string | undefined`.
 */
export function missingEnvError(checked: Record<string, string | undefined>): Error {
  const missing = Object.keys(checked).filter(name => !checked[name])

  return new Error(
    `Brakuje zmiennych środowiskowych: ${missing.join(', ')}. ` +
      'Sprawdź .env.local (wzorzec: .env.example) lub zmienne projektu w Vercelu.'
  )
}
