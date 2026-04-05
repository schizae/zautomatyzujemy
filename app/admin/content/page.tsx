import { getPageContents, getServices, getFaqItems } from '@/lib/actions/admin.actions'
import { ContentForm } from './_components/content-form'
import { ServicesEditor } from './_components/services-editor'
import { FaqEditor } from './_components/faq-editor'

export const metadata = { title: 'Treść strony — Admin' }

const SECTION_LABELS: Record<string, string> = {
  hero: 'Sekcja Hero',
  about: 'Sekcja "O nas"',
  cta: 'Sekcja CTA',
}

export default async function AdminContentPage() {
  const [contents, services, faqItems] = await Promise.all([
    getPageContents(),
    getServices(),
    getFaqItems(),
  ])

  // Group by section
  const sections = contents.reduce<Record<string, typeof contents>>((acc, item) => {
    acc[item.section] ??= []
    acc[item.section]!.push(item)
    return acc
  }, {})

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface">Treść strony</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Edytuj teksty wyświetlane na stronie głównej.
        </p>
      </div>

      <div className="space-y-6">
        {/* Page content sections */}
        {Object.entries(sections).map(([section, items]) => (
          <ContentForm
            key={section}
            items={items}
            section={section}
            title={SECTION_LABELS[section] ?? section}
          />
        ))}

        {/* Services */}
        <ServicesEditor services={services} />

        {/* FAQ */}
        <FaqEditor items={faqItems} />
      </div>
    </div>
  )
}
