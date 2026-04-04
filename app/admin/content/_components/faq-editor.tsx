'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { upsertFaqAction, deleteFaqAction } from '@/lib/actions/admin.actions'
import type { ActionResult, FaqItem } from '@/types'

interface FaqEditorProps {
  items: FaqItem[]
}

const initialState: ActionResult = { success: true }

function FaqRow({ item }: { item: FaqItem }) {
  const [expanded, setExpanded] = useState(false)
  const action = upsertFaqAction.bind(null, item.id)
  const [state, formAction, isPending] = useActionState(action, initialState)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Usunąć pytanie "${item.question}"?`)) return
    setIsDeleting(true)
    await deleteFaqAction(item.id)
  }

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
      >
        <span className="text-sm font-medium text-slate-800 line-clamp-1">{item.question}</span>
        {expanded ? <ChevronUp className="size-4 shrink-0 text-slate-400" /> : <ChevronDown className="size-4 shrink-0 text-slate-400" />}
      </button>

      {expanded && (
        <form action={formAction} className="space-y-3 px-4 pb-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Pytanie *</label>
            <Input name="question" defaultValue={item.question} className="text-sm" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Odpowiedź *</label>
            <Textarea name="answer" defaultValue={item.answer} rows={3} className="text-sm" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Kolejność</label>
            <Input name="sort_order" type="number" defaultValue={item.sort_order} className="text-sm w-24" />
          </div>
          <input type="hidden" name="is_active" value={item.is_active ? 'true' : 'false'} />
          {!state.success && <p className="text-xs text-red-600">{state.error}</p>}
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
              className="gap-1.5 text-red-500 hover:bg-red-50 hover:text-red-600"
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

function NewFaqForm() {
  const action = upsertFaqAction.bind(null, null)
  const [state, formAction, isPending] = useActionState(action, initialState)
  const [show, setShow] = useState(false)

  if (!show) {
    return (
      <button
        type="button"
        onClick={() => setShow(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 hover:border-blue-300 hover:text-blue-600"
      >
        <Plus className="size-4" />
        Dodaj pytanie FAQ
      </button>
    )
  }

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
      <p className="text-xs font-bold text-blue-700">Nowe pytanie FAQ</p>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-600">Pytanie *</label>
        <Input name="question" placeholder="Jak długo trwa wdrożenie?" className="bg-white text-sm" required />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-600">Odpowiedź *</label>
        <Textarea name="answer" placeholder="Odpowiedź..." rows={3} className="bg-white text-sm" required />
      </div>
      <input type="hidden" name="sort_order" value="99" />
      <input type="hidden" name="is_active" value="true" />
      {!state.success && <p className="text-xs text-red-600">{state.error}</p>}
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

export function FaqEditor({ items }: FaqEditorProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="font-display text-base font-bold text-slate-900">FAQ</h2>
        <p className="text-xs text-slate-500">{items.length} pytań</p>
      </div>
      <div>
        {items.map(item => <FaqRow key={item.id} item={item} />)}
      </div>
      <div className="p-4">
        <NewFaqForm />
      </div>
    </div>
  )
}
