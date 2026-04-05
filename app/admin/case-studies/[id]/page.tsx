import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { getAdminCaseStudy } from '@/lib/actions/admin.actions'
import { CaseStudyForm } from '../_components/case-study-form'

export const metadata = { title: 'Edytuj realizację — Admin' }

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCaseStudyPage({ params }: EditPageProps) {
  const { id } = await params
  const item = await getAdminCaseStudy(id)

  if (!item) notFound()

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/case-studies"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-on-surface"
        >
          <ChevronLeft className="size-4" />
          Wróć do listy
        </Link>
        <h1 className="mt-2 font-headline text-2xl font-bold text-on-surface">Edytuj realizację</h1>
        <p className="text-sm text-on-surface-variant">{item.title}</p>
      </div>
      <CaseStudyForm item={item} />
    </div>
  )
}
