import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { getAdminPost } from '@/lib/actions/admin.actions'
import { PostForm } from '../_components/post-form'

export const metadata = { title: 'Edytuj artykuł — Admin' }

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const post = await getAdminPost(id)

  if (!post) {
    notFound()
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-on-surface"
        >
          <ChevronLeft className="size-4" />
          Wróć do listy
        </Link>
        <h1 className="mt-2 font-headline text-2xl font-bold text-on-surface">Edytuj artykuł</h1>
        <p className="text-sm text-on-surface-variant">{post.title}</p>
      </div>
      <PostForm post={post} />
    </div>
  )
}
