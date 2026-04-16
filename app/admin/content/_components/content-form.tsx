'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'
import { upsertPageContentAction } from '@/lib/actions/admin.actions'
import type { ActionResult, PageContent } from '@/types'

interface ContentFormProps {
  items: PageContent[]
  section: string
  title: string
}

const initialState: ActionResult = { success: true }

export function ContentForm({ items, section: _section, title }: ContentFormProps) {
  const [state, formAction, isPending] = useActionState(upsertPageContentAction, initialState)
  const [values, setValues] = useState<Record<string, string>>(
    () => Object.fromEntries(items.map(item => [item.key, item.value]))
  )

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container p-6">
      <h2 className="mb-4 font-headline text-base font-bold text-on-surface">{title}</h2>
      <form action={formAction} className="space-y-4">
        {items.map(item => (
          <div key={item.key} className="space-y-1.5">
            <label htmlFor={item.key} className="block text-sm font-semibold text-on-surface-variant">
              {item.label}
            </label>
            {item.value.length > 100 ? (
              <textarea
                id={item.key}
                name={item.key}
                value={values[item.key] ?? ''}
                onChange={e => setValues(v => ({ ...v, [item.key]: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-2.5 py-1.5 text-sm text-on-surface outline-none transition-colors placeholder:text-outline-color focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
              />
            ) : (
              <input
                id={item.key}
                name={item.key}
                type="text"
                value={values[item.key] ?? ''}
                onChange={e => setValues(v => ({ ...v, [item.key]: e.target.value }))}
                className="h-8 w-full rounded-lg border border-outline-variant bg-surface-container-low px-2.5 py-1 text-sm text-on-surface outline-none transition-colors placeholder:text-outline-color focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
              />
            )}
          </div>
        ))}

        {!state.success && (
          <p className="rounded-lg bg-red-900/30 px-4 py-2.5 text-sm font-medium text-red-400">
            {state.error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isPending} size="sm" className="gap-2">
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            Zapisz sekcję
          </Button>
        </div>
      </form>
    </div>
  )
}
