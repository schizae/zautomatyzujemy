'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Check, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FadeInUp, RevealText } from '@/components/animations'
import { AutomationFlow } from './automation-flow'

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
  return <section id="uslugi" className="scroll-mt-20 bg-[#101214] bg-[radial-gradient(ellipse_at_top_right,#282a2c_0%,transparent_65%)] px-6 py-20 text-[#f5f2ed] md:px-8 lg:py-20">
    <div className="mx-auto max-w-[1680px]">
      <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="mb-6 text-xs uppercase tracking-[0.2em] text-[#dedbd5]">01 / Rozwiązania</p>
          <h2 className="font-body text-5xl font-semibold leading-[1.04] tracking-[-0.055em] xl:text-[68px]"><RevealText>Mniej przeszkód.</RevealText><br />Więcej <span className="font-editorial font-normal italic tracking-[-0.06em]">działania.</span></h2>
          <p className="my-8 text-lg text-[#dedbd5]">Wybierz obszar, który chcesz usprawnić.</p>
        <div className="min-w-0">{services.map((item, i) => <Button key={item.name} onClick={() => setSelected(i)} aria-pressed={selected === i} aria-controls="service-detail" className={`flex h-auto w-full justify-between whitespace-normal rounded-none border-0 border-b border-white/20 bg-transparent px-0 py-5 text-left text-lg hover:bg-white/5 duration-200 md:text-2xl ${selected === i ? 'text-[#f34c30]' : 'text-[#dedbd5]'}`}>
          <span>
            <span className="mr-5 text-xs">0{i + 1}</span>{item.name}</span>
          <ArrowUpRight className="transition-transform duration-200 motion-safe:group-hover/button:translate-x-1 motion-safe:group-hover/button:-translate-y-1 motion-safe:group-focus-visible/button:translate-x-1" />
        </Button>)}</div>
        </div>
        <div id="service-detail" className="relative isolate min-w-0 overflow-hidden rounded-xl border border-[#d9d6d0] bg-[#f5f2ed] min-h-[570px] p-6 text-[#151719] md:p-8 xl:p-10">
          <div className="flex flex-wrap items-center gap-3"><span className="rounded border border-[#b4b0a9] px-3 py-1 text-xs font-semibold uppercase tracking-widest">Przykład</span><p className="text-xs text-[#62625d]">Ilustracja procesu · bez wysyłania danych</p></div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={selected} initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: reduced ? 1 : 0 }} transition={{ duration: reduced ? 0 : .35 }}>
              <h3 className="my-8 font-body text-3xl font-semibold tracking-tight">{selected === 0 ? 'Od wiadomości do gotowego zgłoszenia' : service.name}</h3>
              {selected === 0 ? <AutomationFlow /> : <><p className="my-5 leading-relaxed text-[#62625d]">{service.description}</p><ol className="space-y-2">{service.steps.map((step, i) => <li key={step}><FadeInUp delay={i * .1}><div className="flex items-center gap-3 rounded-lg border border-[#d9d6d0] bg-white/60 p-4 text-sm"><Check className="size-4 text-[#c93820]" />{step}</div></FadeInUp>{i < 2 && <ArrowDown className="mx-auto mt-2 size-4 text-[#62625d]" />}</li>)}</ol></>}
              <p className="mt-6 text-sm font-medium">{service.result}</p>
            </motion.div>
          </AnimatePresence>
          <Button asChild className="mt-8 h-auto rounded-md bg-[#c93820] px-6 py-4 text-white hover:bg-[#ac301c] duration-200 motion-safe:active:scale-[.98]"><Link href={selected === 0 ? "/#klara" : "/#kontakt"}>{selected === 0 ? "Wypróbuj Klarę →" : "Porozmawiajmy o tym →"}</Link></Button>
        </div>
      </div>
      <div id="case-study" className="mt-10 flex flex-wrap justify-between gap-5 scroll-mt-24 text-sm">
        <Link href="/case-studies" className="text-[#dedbd5] underline underline-offset-4">Poznaj przykładowe zastosowania</Link>
        <Link href="/#klara" className="text-[#f34c30] underline underline-offset-4">Wypróbuj działające demo Klary ↗</Link>
      </div>
    </div>
  </section>
}
