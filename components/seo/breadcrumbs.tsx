import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  /** Ciemne tło nagłówka wymaga jaśniejszych kolorów niż jasna sekcja treści. */
  inverse?: boolean
}

/**
 * Widoczna ścieżka nawigacji. Schemat BreadcrumbList zostaje tam, gdzie jest —
 * w JsonLd na stronie — żeby nie mieć dwóch źródeł tej samej prawdy.
 *
 * Ostatnia pozycja nie jest odnośnikiem, bo prowadziłaby do strony, na której już jesteś.
 */
export function Breadcrumbs({ items, inverse = false }: BreadcrumbsProps) {
  const kolorTekstu = inverse ? 'text-[#aaa8a1]' : 'text-[#62625d]'
  const kolorOdnosnika = inverse
    ? 'text-[#dedbd5] hover:text-white focus-visible:ring-[#ffb49f]'
    : 'text-[#454640] hover:text-[#c93820] focus-visible:ring-[#c93820]'

  return (
    <nav aria-label="Ścieżka nawigacji" className={`text-sm ${kolorTekstu}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const ostatni = index === items.length - 1

          return (
            <li key={item.href} className="flex items-center gap-x-2">
              {ostatni ? (
                <span aria-current="page">{item.label}</span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className={`rounded underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 ${kolorOdnosnika}`}
                  >
                    {item.label}
                  </Link>
                  <ChevronRight size={14} aria-hidden="true" className="shrink-0 opacity-60" />
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
