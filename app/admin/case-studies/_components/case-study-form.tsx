'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'
import { createCaseStudyAction, updateCaseStudyAction } from '@/lib/actions/admin.actions'
import type { ActionResult, CaseStudy } from '@/types'

interface CaseStudyFormProps {
  item?: CaseStudy
}

const initialState: ActionResult = { success: true }

export function CaseStudyForm({ item }: CaseStudyFormProps) {
  const action = item
    ? updateCaseStudyAction.bind(null, item.id)
    : createCaseStudyAction

  const [state, formAction, isPending] = useActionState(action, initialState)

  const [title, setTitle] = useState(item?.title ?? '')
  const [slug, setSlug] = useState(item?.slug ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [content, setContent] = useState(item?.content ?? '')
  const [tag, setTag] = useState(item?.tag ?? '')
  const [coverImage, setCoverImage] = useState(item?.cover_image ?? '')
  const [sortOrder, setSortOrder] = useState(String(item?.sort_order ?? 0))
  const [isActive, setIsActive] = useState(item?.is_active ?? true)

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!item) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[ąćęłńóśźż]/g, c =>
            ({ ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' }[c] ?? c)
          )
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      )
    }
  }

  const fieldClass = "w-full rounded-lg border border-outline-variant bg-surface-container-low px-2.5 py-1.5 text-sm text-on-surface outline-none transition-colors placeholder:text-outline-color focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden synced fields */}
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="tag" value={tag} />
      <input type="hidden" name="cover_image" value={coverImage} />
      <input type="hidden" name="sort_order" value={sortOrder} />
      <input type="hidden" name="is_active" value={String(isActive)} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-on-surface-variant">Tytuł / Wynik *</label>
          <input
            type="text"
            value={title}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="np. Wzrost sprzedaży o 30%"
            className={fieldClass}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-bold text-on-surface-variant">Slug (URL) *</label>
          <input
            type="text"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder="wzrost-sprzedazy-30"
            className={fieldClass}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-on-surface-variant">Krótki opis (widoczny na karcie) *</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Zwięzły opis realizacji..."
          rows={3}
          className={fieldClass}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-on-surface-variant">Pełna treść (Markdown, opcjonalnie)</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="## Wyzwanie&#10;&#10;Opis szczegółowy..."
          rows={12}
          className={`${fieldClass} font-mono`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-on-surface-variant">Kategoria / Tag</label>
          <input
            type="text"
            value={tag}
            onChange={e => setTag(e.target.value)}
            placeholder="E-commerce"
            className={fieldClass}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-bold text-on-surface-variant">Kolejność</label>
          <input
            type="number"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            min={0}
            className={fieldClass}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-bold text-on-surface-variant">URL obrazu okładkowego</label>
          <input
            type="url"
            value={coverImage}
            onChange={e => setCoverImage(e.target.value)}
            placeholder="https://..."
            className={fieldClass}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_active"
          checked={isActive}
          onChange={e => setIsActive(e.target.checked)}
          className="size-4 rounded accent-primary"
        />
        <label htmlFor="is_active" className="text-sm font-medium text-on-surface-variant">
          Aktywny (widoczny na stronie)
        </label>
      </div>

      {!state.success && (
        <p className="rounded-lg bg-red-900/30 px-4 py-2.5 text-sm font-medium text-red-400">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {item ? 'Zapisz zmiany' : 'Dodaj realizację'}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Anuluj
        </Button>
      </div>
    </form>
  )
}
