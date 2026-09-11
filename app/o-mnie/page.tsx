import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Github, Linkedin } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { JsonLd } from '@/components/seo/json-ld'

const SITE_URL =
  process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://www.zautomatyzujemy.pl'

const GITHUB = 'https://github.com/schizae'
const LINKEDIN = 'https://www.linkedin.com/in/norbert-chojnacki-16a351270/'

export const metadata: Metadata = {
  title: 'O mnie — Norbert Chojnacki',
  description:
    'Inżynier informatyki. Wdrażam automatyzacje i AI dla małych i średnich firm. Rozmawiasz bezpośrednio ze mną, od pierwszej rozmowy po uruchomienie.',
  alternates: { canonical: '/o-mnie' },
  openGraph: {
    type: 'profile',
    title: 'O mnie — Norbert Chojnacki',
    description:
      'Inżynier informatyki. Wdrażam automatyzacje i AI dla małych i średnich firm.',
    url: '/o-mnie',
    images: [{ url: '/norbert.png', width: 600, height: 800, alt: 'Norbert Chojnacki' }],
  },
}

export default function AboutPage() {
  return (
    <main
      id="main"
      className="marketing-theme font-body min-h-screen bg-[#f5f2ed] text-[#151719] [color-scheme:light]"
    >
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          '@id': `${SITE_URL}/o-mnie#osoba`,
          name: 'Norbert Chojnacki',
          jobTitle: 'Inżynier informatyki',
          image: `${SITE_URL}/norbert.png`,
          url: `${SITE_URL}/o-mnie`,
          email: 'norbert@zautomatyzujemy.pl',
          telephone: '+48730094465',
          knowsAbout: [
            'automatyzacja procesów biznesowych',
            'agenci AI',
            'n8n',
            'zgodność z AI Act',
            'szkolenia z AI',
          ],
          sameAs: [GITHUB, LINKEDIN],
          worksFor: {
            '@type': 'Organization',
            name: 'Zautomatyzujemy.pl',
            url: SITE_URL,
          },
        }}
      />

      <div className="bg-[#151719] px-6 pb-16 pt-8 md:pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <BrandLogo inverse />
          </div>
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 rounded text-sm text-[#dedbd5] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb49f]"
          >
            <ArrowLeft size={16} />
            Wróć na stronę główną
          </Link>
          <p className="mb-5 text-xs font-bold uppercase tracking-widest text-[#ffb49f]">O mnie</p>
          <h1 className="font-editorial text-5xl font-normal leading-[1.05] tracking-tight text-[#f5f2ed] md:text-7xl">
            Norbert Chojnacki
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#dedbd5] md:text-lg">
            Inżynier informatyki. Wdrażam automatyzacje i AI w małych i średnich firmach.
            Rozmawiasz bezpośrednio ze mną, od pierwszego pytania po uruchomienie.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[280px_1fr] md:gap-16">
          <div>
            <Image
              src="/norbert.png"
              alt="Norbert Chojnacki"
              width={280}
              height={373}
              className="w-full rounded-lg border border-[#d8d4cc] object-cover"
              priority
            />
            <div className="mt-6 flex flex-col gap-3">
              <a
                href={LINKEDIN}
                target="_blank"
                rel="me noopener"
                className="inline-flex min-h-11 items-center gap-2 rounded text-sm text-[#151719] underline underline-offset-4 transition-colors hover:text-[#c93820] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c93820]"
              >
                <Linkedin size={16} aria-hidden="true" />
                LinkedIn
              </a>
              <a
                href={GITHUB}
                target="_blank"
                rel="me noopener"
                className="inline-flex min-h-11 items-center gap-2 rounded text-sm text-[#151719] underline underline-offset-4 transition-colors hover:text-[#c93820] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c93820]"
              >
                <Github size={16} aria-hidden="true" />
                GitHub
              </a>
            </div>
          </div>

          <div className="max-w-2xl leading-relaxed text-[#30322f]">
            <h2 className="font-editorial text-3xl font-normal text-[#151719]">Czym się zajmuję</h2>
            <p className="mt-4">
              Buduję rozwiązania, które wykonują za firmę powtarzalną pracę: przepisywanie danych
              między systemami, odpowiadanie na te same pytania, obieg dokumentów, raporty składane
              ręcznie co tydzień. Zwykle zaczyna się od jednego procesu, który zabiera komuś kilka
              godzin tygodniowo.
            </p>
            <p className="mt-5">
              Pracuję na n8n, modelach językowych i integracjach z systemami, których firma już
              używa. Nie namawiam do wymiany narzędzi, bo najtańsza automatyzacja to ta, która
              opiera się na tym, co już macie.
            </p>

            <h2 className="mt-12 font-editorial text-3xl font-normal text-[#151719]">
              Dlaczego bezpośrednio
            </h2>
            <p className="mt-4">
              Jestem jedną osobą i to jest świadomy wybór, nie etap przejściowy. Rozmawiasz
              z człowiekiem, który potem to zbuduje, więc nic nie ginie po drodze między handlowcem
              a wykonawcą. Jeśli czegoś nie umiem albo uznam, że problem da się rozwiązać taniej bez
              mojego udziału, powiem to wprost.
            </p>

            <h2 className="mt-12 font-editorial text-3xl font-normal text-[#151719]">
              Ta strona jako przykład
            </h2>
            <p className="mt-4">
              Witryna, którą właśnie czytasz, jest zbudowana na tych samych narzędziach, które
              wdrażam u klientów. Artykuły na blogu powstają automatycznie i przechodzą mój
              przegląd przed publikacją. Czat odpowiada na podstawie bazy wiedzy o ofercie, a nie
              zmyśla. Systemy AI, z których korzystam, są wpisane do{' '}
              <Link
                href="/ai-act-checklist"
                className="rounded text-[#c93820] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c93820]"
              >
                rejestru zgodnego z AI Act
              </Link>
              , a treści generowane są oznaczone. To nie jest deklaracja, tylko coś, co możesz
              sprawdzić.
            </p>

            <div className="mt-12 border-t border-[#d8d4cc] pt-8">
              <Link
                href="/kontakt"
                className="inline-flex min-h-12 items-center rounded-md bg-[#c93820] px-6 py-3 text-base text-white transition-colors hover:bg-[#ac301c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c93820] focus-visible:ring-offset-2"
              >
                Porozmawiajmy o Twoim procesie
              </Link>
              <p className="mt-4 text-sm text-[#62625d]">
                Albo najpierw zobacz{' '}
                <Link
                  href="/uslugi"
                  className="rounded underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c93820]"
                >
                  zakres usług
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
