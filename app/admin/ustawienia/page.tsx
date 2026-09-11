import { Bot, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setBlogPublishModeAction } from '@/lib/actions/admin.actions'
import { getBlogPublishMode } from '@/lib/app-settings'

export const metadata = { title: 'Ustawienia — Admin' }

export default async function AdminSettingsPage() {
  const mode = await getBlogPublishMode()
  const isAuto = mode === 'auto'
  const nextMode = isAuto ? 'review' : 'auto'

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline text-2xl font-bold text-on-surface">Ustawienia</h1>
      <p className="mt-1 text-sm text-on-surface-variant">
        Zachowanie publikacji artykułów z generatora
      </p>

      <div className="mt-6 rounded-2xl border border-outline-variant bg-surface-container p-6">
        <div className="flex items-start gap-3">
          {isAuto ? (
            <Zap className="mt-0.5 size-5 text-amber-400" />
          ) : (
            <Bot className="mt-0.5 size-5 text-on-surface-variant" />
          )}
          <div>
            <p className="font-semibold text-on-surface">
              {isAuto ? 'Tryb automatyczny' : 'Tryb redakcyjny'}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {isAuto
                ? 'Artykuły trafiają na stronę bez sprawdzenia. Zgodność opiera się wtedy wyłącznie na znaczniku maszynowym.'
                : 'Artykuły z generatora czekają w panelu na zatwierdzenie. Dopóki ich nie sprawdzisz, nie są widoczne na stronie.'}
            </p>
          </div>
        </div>

        <form action={setBlogPublishModeAction} className="mt-6">
          <input type="hidden" name="mode" value={nextMode} />
          <Button type="submit" size="lg" variant={isAuto ? 'outline' : 'default'}>
            {isAuto ? 'Wróć do trybu redakcyjnego' : 'Przełącz na automat'}
          </Button>
        </form>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
        Znacznik maszynowy zapisywany jest w obu trybach. Adnotacja pod artykułem mówi
        o weryfikacji tylko wtedy, gdy weryfikacja faktycznie była.
      </p>
    </div>
  )
}
