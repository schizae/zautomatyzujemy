import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { ContactForm } from '@/components/marketing/contact-form'
import { JsonLd } from '@/components/seo/json-ld'

const SITE_URL =
  process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://www.zautomatyzujemy.pl'

export const metadata: Metadata = {
  title: 'Kontakt',
  description:
    'Napisz lub zadzwoń: automatyzacja procesów, agenci AI, obieg dokumentów, szkolenia. Chojnice i powiat chojnicki na miejscu, cała Polska zdalnie. Odpowiadam w jeden dzień roboczy.',
  alternates: { canonical: '/kontakt' },
  openGraph: {
    type: 'website',
    title: 'Kontakt — Zautomatyzujemy.pl',
    description:
      'Automatyzacja procesów, agenci AI, szkolenia. Chojnice na miejscu, cała Polska zdalnie.',
    url: '/kontakt',
  },
}

export default function ContactPage() {
  return (
    <main
      id="main"
      className="marketing-theme font-body min-h-screen bg-[#101214] text-[#f5f2ed] [color-scheme:dark]"
    >
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Kontakt — Zautomatyzujemy.pl',
          url: `${SITE_URL}/kontakt`,
          mainEntity: {
            '@type': 'Person',
            '@id': `${SITE_URL}/o-mnie#osoba`,
            name: 'Norbert Chojnacki',
            telephone: '+48730094465',
            email: 'norbert@zautomatyzujemy.pl',
          },
        }}
      />

      <div className="px-6 pt-8 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-10">
            <BrandLogo inverse />
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded text-sm text-[#dedbd5] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb49f]"
          >
            <ArrowLeft size={16} />
            Wróć na stronę główną
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1200px] items-start gap-12 px-6 py-16 md:px-8 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:py-24">
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-widest text-[#ffb49f]">Kontakt</p>
          <h1 className="font-body text-4xl font-semibold leading-[1.06] tracking-[-0.045em] sm:text-5xl xl:text-6xl">
            Napisz, zadzwoń,
            <br />
            <span className="font-editorial font-normal italic text-[#f34c30]">
              albo umów rozmowę.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[#dedbd5]">
            Odpowiadam osobiście, w jeden dzień roboczy. Nie ma działu handlowego ani
            przekazywania sprawy dalej. Pierwsza rozmowa jest bezpłatna i trwa około pół godziny.
          </p>

          <dl className="mt-12 space-y-8 border-t border-white/20 pt-10">
            <div className="flex gap-4">
              <Phone className="mt-1 shrink-0 text-[#f34c30]" size={20} aria-hidden="true" />
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-[#aaa8a1]">Telefon</dt>
                <dd className="mt-2">
                  <a
                    href="tel:+48730094465"
                    className="inline-flex min-h-11 items-center rounded text-lg transition-colors hover:text-[#f34c30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb49f]"
                  >
                    +48 730 094 465
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex gap-4">
              <Mail className="mt-1 shrink-0 text-[#f34c30]" size={20} aria-hidden="true" />
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-[#aaa8a1]">E-mail</dt>
                <dd className="mt-2">
                  <a
                    href="mailto:norbert@zautomatyzujemy.pl"
                    className="inline-flex min-h-11 items-center rounded text-lg transition-colors hover:text-[#f34c30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb49f]"
                  >
                    norbert@zautomatyzujemy.pl
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex gap-4">
              <MapPin className="mt-1 shrink-0 text-[#f34c30]" size={20} aria-hidden="true" />
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-[#aaa8a1]">
                  Obszar działania
                </dt>
                <dd className="mt-2 text-base leading-relaxed text-[#dedbd5]">
                  Chojnice i powiat chojnicki — spotkania na miejscu.
                  <br />
                  Cała Polska — zdalnie, bez różnicy w zakresie pracy.
                </dd>
              </div>
            </div>
          </dl>

          <p className="mt-10 text-sm leading-relaxed text-[#aaa8a1]">
            Nie wiesz jeszcze, czego potrzebujesz?{' '}
            <Link
              href="/uslugi"
              className="rounded underline underline-offset-4 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb49f]"
            >
              Zobacz zakres usług
            </Link>{' '}
            albo napisz własnymi słowami, co Cię uwiera. To wystarczy na start.
          </p>
        </div>

        <div className="lg:pt-5">
          <ContactForm idPrefix="kontakt" />
        </div>
      </div>
    </main>
  )
}
