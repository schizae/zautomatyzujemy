'use client'

import { useActionState, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save, Sparkles } from 'lucide-react'
import { createPostAction, updatePostAction, generatePostAction } from '@/lib/actions/admin.actions'
import type { ActionResult, Post } from '@/types'

interface PostFormProps {
  post?: Post
}

const initialState: ActionResult = { success: true }

export function PostForm({ post }: PostFormProps) {
  const action = post
    ? updatePostAction.bind(null, post.id)
    : createPostAction

  const [state, formAction, isPending] = useActionState(action, initialState)

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [tags, setTags] = useState(post?.tags.join(', ') ?? '')
  const [topic, setTopic] = useState('')
  const [isGenerating, startGenerating] = useTransition()
  const [generateError, setGenerateError] = useState('')

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!post) {
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

  function handleGenerate() {
    if (!topic.trim()) return
    setGenerateError('')
    startGenerating(async () => {
      const result = await generatePostAction(topic)
      if (!result.success) {
        setGenerateError(result.error)
        return
      }
      if (result.data) {
        setTitle(result.data.title)
        setSlug(result.data.slug)
        setExcerpt(result.data.excerpt ?? '')
        setContent(result.data.content)
        setTags(result.data.tags.join(', '))
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* AI Generator */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <h2 className="mb-3 font-headline text-sm font-bold text-primary">
          Generuj artykuł przez AI
        </h2>
        <div className="flex gap-3">
          <Input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Temat artykułu, np. Automatyzacja faktur z AI"
            className="flex-1 bg-surface-container"
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
          />
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="gap-2 shrink-0"
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {isGenerating ? 'Generowanie...' : 'Generuj'}
          </Button>
        </div>
        {generateError && (
          <p className="mt-2 text-sm text-red-400">{generateError}</p>
        )}
        <p className="mt-2 text-xs text-primary/70">
          AI wypełni pola poniżej — możesz je potem edytować przed zapisem.
        </p>
      </div>

      {/* Form */}
      <form action={formAction} className="space-y-6">
        {/* Hidden fields synced with state */}
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="excerpt" value={excerpt} />
        <input type="hidden" name="content" value={content} />
        <input type="hidden" name="tags" value={tags} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-on-surface-variant">Tytuł *</label>
            <Input
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Tytuł artykułu"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-on-surface-variant">Slug (URL) *</label>
            <Input
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="moj-artykul"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-on-surface-variant">Opis (excerpt / SEO)</label>
          <Input
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="Krótki opis artykułu..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-on-surface-variant">Treść (Markdown) *</label>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="# Nagłówek&#10;&#10;Treść artykułu w Markdown..."
            rows={20}
            className="font-mono text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-on-surface-variant">Tagi (oddziel przecinkami)</label>
            <Input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="automatyzacja, n8n, AI"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-on-surface-variant">Autor</label>
            <Input
              name="author"
              defaultValue={post?.author ?? 'Zautomatyzujemy'}
              placeholder="Zautomatyzujemy"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-on-surface-variant">URL obrazu okładkowego</label>
          <Input
            name="cover_image"
            defaultValue={post?.cover_image ?? ''}
            placeholder="https://..."
            type="url"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_published"
            name="is_published"
            value="true"
            defaultChecked={post?.is_published}
            className="size-4 rounded accent-primary"
          />
          <label htmlFor="is_published" className="text-sm font-medium text-on-surface-variant">
            Opublikuj od razu
          </label>
        </div>

        {!state.success && (
          <p className="rounded-lg bg-red-900/30 px-4 py-2.5 text-sm font-medium text-red-400">
            {state.error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending} className="gap-2">
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {post ? 'Zapisz zmiany' : 'Utwórz artykuł'}
          </Button>
          <Button type="button" variant="outline" onClick={() => history.back()}>
            Anuluj
          </Button>
        </div>
      </form>
    </div>
  )
}
