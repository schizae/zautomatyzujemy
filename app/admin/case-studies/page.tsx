import Link from 'next/link'
import { Plus, Pencil, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAdminCaseStudies } from '@/lib/actions/admin.actions'
import { DeleteButton } from './_components/delete-button'

export const metadata = { title: 'Case Study — Admin' }

export default async function AdminCaseStudiesPage() {
  const items = await getAdminCaseStudies()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Case Study</h1>
          <p className="mt-1 text-sm text-slate-500">{items.length} realizacji</p>
        </div>
        <Button asChild>
          <Link href="/admin/case-studies/new" className="gap-2">
            <Plus className="size-4" />
            Nowa realizacja
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <p className="text-slate-500">Brak realizacji. Dodaj pierwszą!</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Tytuł</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Tag</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Kolejność</th>
                <th className="px-6 py-3 text-right font-semibold text-slate-700">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-400">/case-studies/{item.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{item.tag || '—'}</td>
                  <td className="px-6 py-4">
                    {item.is_active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                        <Eye className="size-3" /> Aktywny
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        <EyeOff className="size-3" /> Ukryty
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{item.sort_order}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/case-studies/${item.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeleteButton itemId={item.id} itemTitle={item.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
