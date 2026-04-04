import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { CaseStudyForm } from '../_components/case-study-form'

export const metadata = { title: 'Nowa realizacja — Admin' }

export default function NewCaseStudyPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/case-studies"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ChevronLeft className="size-4" />
          Wróć do listy
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-slate-900">Nowa realizacja</h1>
      </div>
      <CaseStudyForm />
    </div>
  )
}
