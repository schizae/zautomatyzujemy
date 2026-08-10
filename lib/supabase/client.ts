import { createBrowserClient } from '@supabase/ssr'

import { missingEnvError } from './env'

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
    throw missingEnvError({
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    })
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
