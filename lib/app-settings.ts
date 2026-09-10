import { createServiceClient } from '@/lib/supabase/server'
import type { BlogPublishMode } from '@/lib/ai-disclosure'

const BLOG_PUBLISH_MODE_KEY = 'blog_publish_mode'

/**
 * Tabela `app_settings` nie ma polityki publicznego odczytu, więc czytamy ją
 * klientem service role.
 */
export async function getBlogPublishMode(): Promise<BlogPublishMode> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', BLOG_PUBLISH_MODE_KEY)
    .maybeSingle()

  if (error) {
    // Nieodczytany tryb traktujemy jak redakcyjny: wstrzymana publikacja jest
    // odwracalna jednym kliknięciem, opublikowany bez nadzoru artykuł nie jest.
    console.error('[app-settings] Nie udało się odczytać trybu publikacji:', error.message)
    return 'review'
  }

  return data?.value === 'auto' ? 'auto' : 'review'
}

export async function setBlogPublishMode(
  mode: BlogPublishMode
): Promise<{ error: string | null }> {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('app_settings')
    .update({ value: mode, updated_at: new Date().toISOString() })
    .eq('key', BLOG_PUBLISH_MODE_KEY)

  return { error: error?.message ?? null }
}
