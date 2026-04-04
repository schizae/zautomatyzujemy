import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { PostForm } from '../_components/post-form'

export const metadata = { title: 'Nowy artykuł — Admin' }

export default function NewPostPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ChevronLeft className="size-4" />
          Wróć do listy
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-slate-900">Nowy artykuł</h1>
      </div>
      <PostForm />
    </div>
  )
}
