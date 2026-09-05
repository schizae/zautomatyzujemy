'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Check, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

const services = [
  { name: 'AI i automatyzacje', description: 'Mniej przepisywania danych i powtarzających się pytań. Łączymy Twoje narzędzia, a asystenta uczymy na materiałach Twojej firmy.', steps: ['Zapytanie od klienta', 'Uporządkowane dane w CRM', 'Projekt odpowiedzi do zatwierdzenia'], result: 'Ty decydujesz. System zajmuje się rutyną.' },
  { name: 'Aplikacje dla biznesu', description: 'Panel, rezerwacje lub narzędzie do obsługi zleceń. Projektujemy aplikacje wokół Twojego sposobu pracy.', steps: ['Potrzeba Twojego zespołu', 'Prototyp do wspólnego sprawdzenia', 'Aplikacja połączona z Twoimi systemami'], result: 'Wszystko, czego potrzebujesz, w jednym miejscu.' },
  { name: 'Strony internetowe', description: 'Szybka, czytelna strona, która przedstawia ofertę i ułatwia kontakt. Z formularzami, blogiem i miejscem na rozwój.', steps: ['Twoja oferta i odbiorcy', 'Projekt treści i wyglądu', 'Responsywna strona gotowa na klientów'], result: 'Dobry pierwszy kontakt zaczyna się od Twojej strony.' },
  { name: 'Szkolenia z AI', description: 'Praktyczne warsztaty na zadaniach Twojego zespołu: od pisania poleceń po sprawdzanie odpowiedzi i bezpieczną pracę z danymi.', steps: ['Rozpoznanie potrzeb zespołu', 'Ćwiczenia na codziennych zadaniach', 'Materiały do wykorzystania po szkoleniu'], result: 'Wiedza, którą wykorzystasz już następnego dnia.' },
  { name: 'Audyty i plan wdrożenia', description: 'Sprawdzamy procesy, narzędzia i sposób wykorzystania AI. Ustalamy priorytety oraz zakres dalszych prac, także wokół AI Act.', steps: ['Rozmowa i przegląd procesów', 'Ocena możliwości i ryzyk', 'Plan kolejnych kroków'], result: 'Zacznij od decyzji opartej na potrzebach firmy.' },
]
export function ServicesSection() {
  const [selected, setSelected] = useState(0)
  const reduced = useReducedMotion()
  const service = services[selected] ?? services[0]!
  return <section id="uslugi" className="scroll-mt-20 bg-[#151719] px-6 py-20 text-[#f5f2ed] md:px-8 lg:py-28">
    <div className="mx-auto max-w-7xl">
      <p className="mb-6 text-xs uppercase tracking-[0.2em] text-[#c0bfba]">02 / Rozwiązania dopasowane do Ciebie</p>
      <h2 className="max-w-3xl font-headline text-4xl font-medium tracking-tight md:text-6xl">Duże możliwości.<br />
        <span className="font-serif font-normal italic">Konkretny cel.</span>
      </h2>
      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div className="min-w-0">{services.map((item, i) => <Button key={item.name} onClick={() => setSelected(i)} aria-pressed={selected === i} aria-controls="service-detail" className={`flex h-auto w-full justify-between whitespace-normal rounded-none border-b border-white/15 bg-transparent py-5 text-left text-lg hover:bg-white/5 md:text-2xl ${selected === i ? 'text-[#ffab98]' : 'text-[#c0bfba]'}`}>
          <span>
            <span className="mr-5 text-xs">0{i + 1}</span>{item.name}</span>
          <ArrowUpRight />
        </Button>)}</div>
        <div id="service-detail" className="min-w-0 rounded-2xl bg-[#f5f2ed] p-6 text-[#151719] md:p-8">
          <p className="text-xs uppercase tracking-widest text-[#686862]">Przykładowy przebieg · nie realizacja klienta</p>
          <AnimatePresence mode="wait">
            <motion.div key={selected} initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .18 }}>
              <h3 className="mt-6 text-2xl font-headline">{service.name}</h3>
              <p className="my-5 leading-relaxed text-[#686862]">{service.description}</p>
              <ol className="space-y-2">{service.steps.map((step, i) => <li key={step}>
                <div className="flex items-center gap-3 rounded-lg border border-[#d9d6d0] bg-white/60 p-3 text-sm">
                  <Check className="size-4 text-[#c93820]" />{step}</div>{i < 2 && <ArrowDown className="mx-auto mt-2 size-4 text-[#686862]" />}</li>)}</ol>
              <p className="mt-6 text-sm font-medium">{service.result}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div id="case-study" className="mt-10 flex flex-wrap justify-between gap-5 scroll-mt-24 text-sm">
        <Link href="/case-studies" className="text-[#c0bfba] underline underline-offset-4">Poznaj przykładowe zastosowania</Link>
        <Link href="/#klara" className="text-[#ffab98] underline underline-offset-4">Wypróbuj działające demo Klary ↗</Link>
      </div>
    </div>
  </section>
}
