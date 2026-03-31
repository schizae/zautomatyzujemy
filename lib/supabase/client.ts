import { createBrowserClient } from '@supabase/ssr'

/**
 * Klient Supabase dla Client Components (przeglądarka).
 * Używa kluczy NEXT_PUBLIC_* — bezpieczne do eksponowania.
 *
 * Użycie: wywołuj wewnątrz Client Components ('use client')
 */
export function createClient() {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Brakuje zmiennych środowiskowych NEXT_PUBLIC_SUPABASE_URL lub NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Sprawdź plik .env.local (wzorzec: .env.example)'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
