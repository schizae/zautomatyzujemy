/**
 * Komunikaty auth współdzielone między Server Actions a formularzami.
 * Osobny moduł, bo plik z dyrektywą 'use server' może eksportować wyłącznie
 * funkcje asynchroniczne.
 */

export const EMAIL_NOT_CONFIRMED =
  'Konto nie zostało jeszcze potwierdzone. Sprawdź skrzynkę i kliknij link aktywacyjny.'
