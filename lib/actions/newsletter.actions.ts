'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'

const TokenSchema = z.string().uuid()

/**
 * Wypis z newslettera. Token jest jedyną autoryzacją — dlatego UUID
 * (nieodgadywalny) i tylko ustawienie daty, bez kasowania rekordu:
 * dowód udzielonej i wycofanej zgody musi zostać.
 */
export async function unsubscribeNewsletterAction(formData: FormData): Promise<void> {
  const parsed = TokenSchema.safeParse(formData.get('token'))

  if (!parsed.success) {
    redirect('/newsletter/wypisz?status=blad')
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('unsubscribe_token', parsed.data)

  if (error) {
    console.error('[newsletter] wypis nieudany:', error.message)
    redirect('/newsletter/wypisz?status=blad')
  }

  redirect('/newsletter/wypisz?status=ok')
}
