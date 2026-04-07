'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

// ─── Schemas ─────────────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  firstName: z.string().min(1, 'Imię jest wymagane.').max(100),
  lastName: z.string().min(1, 'Nazwisko jest wymagane.').max(100),
  email: z.string().email('Podaj poprawny adres e-mail.'),
  phone: z.string().min(1, 'Numer telefonu jest wymagany.').max(20),
  password: z.string().min(6, 'Hasło musi mieć min. 6 znaków.'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Hasła nie są identyczne.',
  path: ['confirmPassword'],
})

const LoginSchema = z.object({
  email: z.string().email('Podaj poprawny adres e-mail.'),
  password: z.string().min(1, 'Hasło jest wymagane.'),
})

const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, 'Imię jest wymagane.').max(100),
  lastName: z.string().min(1, 'Nazwisko jest wymagane.').max(100),
  phone: z.string().max(20).default(''),
})

const ChangePasswordSchema = z.object({
  newPassword: z.string().min(6, 'Nowe hasło musi mieć min. 6 znaków.'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Hasła nie są identyczne.',
  path: ['confirmPassword'],
})

// ─── Rejestracja ─────────────────────────────────────────────────────────────

export async function registerAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = RegisterSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Nieprawidłowe dane.'
    return { success: false, error: firstError }
  }

  const { firstName, lastName, email, phone, password } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone,
      },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { success: false, error: 'Ten adres e-mail jest już zarejestrowany.' }
    }
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ─── Logowanie ───────────────────────────────────────────────────────────────

export async function clientLoginAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Nieprawidłowe dane.'
    return { success: false, error: firstError }
  }

  const { email, password } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { success: false, error: 'Nieprawidłowy e-mail lub hasło.' }
  }

  return { success: true }
}

// ─── Wylogowanie ─────────────────────────────────────────────────────────────

export async function clientLogoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

// ─── Aktualizacja profilu ────────────────────────────────────────────────────

export async function updateProfileAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = UpdateProfileSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    phone: formData.get('phone'),
  })

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Nieprawidłowe dane.'
    return { success: false, error: firstError }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Nie jesteś zalogowany.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      phone: parsed.data.phone,
    })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: 'Nie udało się zaktualizować profilu.' }
  }

  return { success: true }
}

// ─── Zmiana hasła ────────────────────────────────────────────────────────────

export async function changePasswordAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = ChangePasswordSchema.safeParse({
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Nieprawidłowe dane.'
    return { success: false, error: firstError }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Nie jesteś zalogowany.' }
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  })

  if (error) {
    return { success: false, error: 'Nie udało się zmienić hasła.' }
  }

  return { success: true }
}
