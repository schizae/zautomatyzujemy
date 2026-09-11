import Link from 'next/link'
import { Clock, FileText, MessageSquare } from 'lucide-react'
import { ContactForm } from '@/components/marketing/contact-form'

interface ServiceCtaProps {
  serviceName: string
  serviceSlug: string
}

/**
 * Warstwa konwersji na stronie usługowej. Formularz stoi na miejscu, a nie za odnośnikiem
 * do kotwicy na stronie głównej — przy ruchu liczonym w dziesiątkach wejść każde dodatkowe
 * kliknięcie po drodze to stracony kontakt.
 *
 * Komponent serwerowy. Interaktywny jest wyłącznie osadzony formularz.
 */
export function ServiceCta({ serviceName, serviceSlug }: ServiceCtaProps) {
  return (
    <section className="bg-[#101214] px-6 py-20 text-[#f5f2ed] md:px-8 lg:py-24">
      <div className="mx-auto grid max-w-[1200px] items-start gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-widest text-[#ffb49f]">
            Pierwszy krok
          </p>
          <h2 className="font-body text-4xl font-semibold leading-[1.06] tracking-[-0.045em] sm:text-5xl">
            Opowiedz mi o swoim procesie,
            <br />
            <span className="font-editorial font-normal italic text-[#f34c30]">
              resztę wezmę na siebie.
            </span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[#dedbd5]">
            Piszesz o tym, jak wygląda {serviceName.toLowerCase()} u Ciebie dzisiaj. Ja odpowiadam,
            co da się z tym zrobić, ile to zajmie i ile kosztuje.
          </p>

          <dl className="mt-10 space-y-6 border-t border-white/20 pt-8">
            <div className="flex gap-4">
              <Clock className="mt-1 shrink-0 text-[#f34c30]" size={20} aria-hidden="true" />
              <div>
                <dt className="text-base font-medium">Odpowiadam w jeden dzień roboczy</dt>
                <dd className="mt-1 text-sm leading-relaxed text-[#aaa8a1]">
                  Bez działu handlowego i bez przekazywania sprawy dalej. Piszesz do mnie,
                  odpisuję ja.
                </dd>
              </div>
            </div>
            <div className="flex gap-4">
              <FileText className="mt-1 shrink-0 text-[#f34c30]" size={20} aria-hidden="true" />
              <div>
                <dt className="text-base font-medium">Co warto przysłać w pierwszej wiadomości</dt>
                <dd className="mt-1 text-sm leading-relaxed text-[#aaa8a1]">
                  Opis procesu krok po kroku, narzędzia, z których korzystacie, i szacunek,
                  ile czasu zajmuje on dzisiaj. To wystarczy, żeby powiedzieć coś konkretnego.
                </dd>
              </div>
            </div>
            <div className="flex gap-4">
              <MessageSquare className="mt-1 shrink-0 text-[#f34c30]" size={20} aria-hidden="true" />
              <div>
                <dt className="text-base font-medium">Bezpłatna konsultacja, trzydzieści minut</dt>
                <dd className="mt-1 text-sm leading-relaxed text-[#aaa8a1]">
                  Rozmowa bez zobowiązań. Jeśli uznam, że nie umiem pomóc, powiem to wprost.
                </dd>
              </div>
            </div>
          </dl>

          <Link
            href="/uslugi"
            className="mt-10 inline-flex min-h-11 items-center rounded text-sm text-[#dedbd5] underline underline-offset-4 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb49f]"
          >
            Zobacz pozostałe usługi
          </Link>
        </div>

        <div className="lg:pt-5">
          <ContactForm idPrefix={`usluga-${serviceSlug}`} />
        </div>
      </div>
    </section>
  )
}
