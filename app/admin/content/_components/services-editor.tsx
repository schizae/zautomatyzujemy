'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { upsertServiceAction, deleteServiceAction } from '@/lib/actions/admin.actions'
import type { ActionResult, Service } from '@/types'

interface ServicesEditorProps {
  services: Service[]
}

const initialState: ActionResult = { success: true }

/** Pole z licznikiem znaków. Próg to zalecenie wyszukiwarki, nie twarde ograniczenie. */
function PoleZLicznikiem({
  label,
  name,
  defaultValue,
  prog,
  placeholder,
}: {
  label: string
  name: string
  defaultValue: string
  prog: number
  placeholder?: string
}) {
  const [wartosc, setWartosc] = useState(defaultValue)
  const zaDlugie = wartosc.length > prog

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-semibold text-on-surface-variant">{label}</label>
        <span className={`text-xs tabular-nums ${zaDlugie ? 'text-amber-500' : 'text-outline-color'}`}>
          {wartosc.length} / {prog}
        </span>
      </div>
      <Input
        name={name}
        value={wartosc}
        onChange={event => setWartosc(event.target.value)}
        placeholder={placeholder ?? ''}
        className="text-sm"
      />
    </div>
  )
}

function ServiceRow({ service }: { service: Service }) {
  const [expanded, setExpanded] = useState(false)
  const action = upsertServiceAction.bind(null, service.id)
  const [state, formAction, isPending] = useActionState(action, initialState)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Usunąć usługę "${service.title}"?`)) return
    setIsDeleting(true)
    await deleteServiceAction(service.id)
  }

  return (
    <div className="border-b border-outline-variant last:border-0">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-surface-container-high"
      >
        <span className="text-sm font-medium text-on-surface">{service.title}</span>
        {expanded ? <ChevronUp className="size-4 text-outline-color" /> : <ChevronDown className="size-4 text-outline-color" />}
      </button>

      {expanded && (
        <form action={formAction} className="space-y-3 px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Tytuł</label>
              <Input name="title" defaultValue={service.title} className="text-sm" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Ikona (Lucide)</label>
              <Input name="icon" defaultValue={service.icon} className="text-sm" required />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Opis</label>
            <Textarea name="description" defaultValue={service.description} rows={2} className="text-sm" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Adres strony (slug)</label>
            <Input name="slug" defaultValue={service.slug ?? ''} className="text-sm" required />
            <p className="text-xs text-outline-color">/uslugi/{service.slug ?? ''} — zmiana zrywa dotychczasowe odnośniki i pozycje w wyszukiwarce.</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Podtytuł</label>
            <Textarea name="subtitle" defaultValue={service.subtitle ?? ''} rows={2} className="text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Treść strony (Markdown)</label>
            <Textarea name="content" defaultValue={service.content ?? ''} rows={16} className="font-mono text-xs" />
          </div>
          <PoleZLicznikiem label="Tytuł dla wyszukiwarki" name="seo_title" defaultValue={service.seo_title ?? ''} prog={60} />
          <PoleZLicznikiem label="Opis dla wyszukiwarki" name="seo_description" defaultValue={service.seo_description ?? ''} prog={160} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Kolejność</label>
              <Input name="sort_order" type="number" defaultValue={service.sort_order} className="text-sm" />
            </div>
            <div className="flex items-end gap-2">
              <input type="hidden" name="is_active" value={service.is_active ? 'true' : 'false'} />
            </div>
          </div>
          {!state.success && (
            <p className="text-xs text-red-400">{state.error}</p>
          )}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending} className="gap-1.5">
              {isPending ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
              Zapisz
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={isDeleting}
              onClick={handleDelete}
              className="gap-1.5 text-red-400 hover:bg-red-900/20 hover:text-red-400"
            >
              {isDeleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
              Usuń
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

function NewServiceForm() {
  const action = upsertServiceAction.bind(null, null)
  const [state, formAction, isPending] = useActionState(action, initialState)
  const [show, setShow] = useState(false)

  if (!show) {
    return (
      <button
        type="button"
        onClick={() => setShow(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant py-3 text-sm font-medium text-on-surface-variant hover:border-primary/40 hover:text-primary"
      >
        <Plus className="size-4" />
        Dodaj usługę
      </button>
    )
  }

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <p className="text-xs font-bold text-primary">Nowa usługa</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-on-surface-variant">Tytuł *</label>
          <Input name="title" placeholder="Chatbot AI" className="bg-surface-container text-sm" required />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-on-surface-variant">Ikona Lucide *</label>
          <Input name="icon" placeholder="Bot" className="bg-surface-container text-sm" required />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-on-surface-variant">Opis *</label>
        <Textarea name="description" placeholder="Opis usługi..." rows={2} className="bg-surface-container text-sm" required />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-on-surface-variant">Adres strony (slug) *</label>
        <Input name="slug" placeholder="chatbot-ai-dla-firm" className="bg-surface-container text-sm" required />
      </div>
      <input type="hidden" name="sort_order" value="99" />
      <input type="hidden" name="is_active" value="true" />
      {!state.success && <p className="text-xs text-red-400">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending} className="gap-1.5">
          {isPending ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
          Dodaj
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setShow(false)}>
          Anuluj
        </Button>
      </div>
    </form>
  )
}

export function ServicesEditor({ services }: ServicesEditorProps) {
  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container">
      <div className="border-b border-outline-variant px-6 py-4">
        <h2 className="font-headline text-base font-bold text-on-surface">Usługi</h2>
        <p className="text-xs text-on-surface-variant">{services.length} usług</p>
      </div>
      <div>
        {services.map(s => <ServiceRow key={s.id} service={s} />)}
      </div>
      <div className="p-4">
        <NewServiceForm />
      </div>
    </div>
  )
}
