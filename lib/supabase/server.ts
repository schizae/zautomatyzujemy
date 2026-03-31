import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Klient Supabase dla Server Components, Server Actions i Route Handlers.
 * Używa cookies do zarządzania sesją użytkownika (anon key).
 *
 * Użycie: `const supabase = await createClient()`
 */
export async function createClient() {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Brakuje zmiennych środowiskowych NEXT_PUBLIC_SUPABASE_URL lub NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // setAll może być wywołane z Server Component — ignorujemy błąd,
          // sesja będzie odświeżona przez middleware przy następnym żądaniu
        }
      },
    },
  })
}

/**
 * Klient Supabase z uprawnieniami service_role — TYLKO po stronie serwera.
 * Omija RLS — używaj wyłącznie w zaufanych endpointach (np. webhook n8n).
 *
 * NIGDY nie używaj w Client Components ani nie eksponuj klucza!
 */
export function createServiceClient() {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Brakuje zmiennych środowiskowych NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
  })
}
