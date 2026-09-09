'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { track } from '@vercel/analytics'
import { ArrowUpRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScenarioScene, type ScenarioId } from './scenario-scene'
import { ScenarioContact } from './scenario-contact'

const choices: { id: ScenarioId; label: string; note: string }[] = [
  { id: 'website', label: 'Chcę więcej zapytań', note: 'Strona, która ułatwia pierwszy kontakt.' },
  { id: 'support', label: 'Chcę sprawniej obsługiwać klientów', note: 'Od wiadomości do uporządkowanego zgłoszenia.' },
  { id: 'workflow', label: 'Chcę odzyskać czas zespołu', note: 'Mniej powtarzania. Płynniejsza praca.' },
  { id: 'idea', label: 'Mam inny pomysł', note: 'Nie widzisz tu swojej potrzeby? Opowiedz nam o niej.' },
]
const initialDrafts: Record<ScenarioId, string> = {
  website: 'Chcę stworzyć stronę, która jasno przedstawia moją ofertę i ułatwia klientom kontakt.',
  support: 'Chcę sprawniej obsługiwać zapytania klientów w mojej firmie.',
  workflow: 'Chcę ograniczyć ręczne przepisywanie danych i powtarzalne zadania w moim zespole.',
  idea: '',
}
const services = [
  ['AI i automatyzacje', 'Mniej przepisywania danych i powtarzających się pytań. Łączymy Twoje narzędzia, a asystenta uczymy na materiałach Twojej firmy.'],
  ['Aplikacje dla biznesu', 'Panel, rezerwacje lub narzędzie do obsługi zleceń. Projektujemy aplikacje wokół Twojego sposobu pracy.'],
  ['Strony internetowe', 'Szybka, czytelna strona, która przedstawia ofertę i ułatwia kontakt. Z formularzami, blogiem i miejscem na rozwój.'],
  ['Szkolenia z AI', 'Praktyczne warsztaty na zadaniach Twojego zespołu: od pisania poleceń po sprawdzanie odpowiedzi i bezpieczną pracę z danymi.'],
  ['Audyty i plan wdrożenia', 'Sprawdzamy procesy, narzędzia i sposób wykorzystania AI. Ustalamy priorytety oraz zakres dalszych prac, także wokół AI Act.'],
]

export function ServicesSection() {
  const [selected, setSelected] = useState<ScenarioId>('website')
  const [drafts, setDrafts] = useState(initialDrafts)
  const [contactOpen, setContactOpen] = useState(false)
  const reduced = useReducedMotion()
  function choose(scenario: ScenarioId) {
    setSelected(scenario)
    setContactOpen(scenario === 'idea')
    track('scenario_selected', { scenario })
  }
  return <section id="uslugi" className="scroll-mt-20 bg-[#101214] bg-[radial-gradient(ellipse_at_top_right,#282a2c_0%,transparent_65%)] px-6 py-20 text-[#f5f2ed] md:px-8 lg:py-24">
    <div className="mx-auto max-w-[1680px]">
      <div className="grid items-start gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-14">
        <div>
          <p className="mb-6 text-xs uppercase tracking-[.2em] text-[#dedbd5]">01 / Twoja firma. Nowe możliwości.</p>
          <h2 className="max-w-xl text-4xl font-semibold leading-[1.06] tracking-[-.055em] sm:text-5xl xl:text-[64px]">Zobacz, co możemy<br className="hidden xl:block" /> usprawnić <span className="font-editorial font-normal italic text-[#f34c30]">u Ciebie.</span></h2>
          <p className="mb-8 mt-6 max-w-md text-base leading-relaxed text-[#dedbd5]">Wybierz swoją potrzebę lub opowiedz nam o własnym pomyśle.</p>
          <div className="border-t border-white/20" role="group" aria-label="Wybierz potrzebę firmy">
            {choices.map((choice, index) => <Button key={choice.id} onClick={() => choose(choice.id)} aria-pressed={selected === choice.id} aria-controls="service-detail" className={`h-auto min-h-24 w-full items-start justify-between gap-4 whitespace-normal rounded-none border-0 border-b border-white/20 bg-transparent px-0 py-5 text-left hover:bg-white/5 focus-visible:ring-[#f34c30] ${selected === choice.id ? 'text-[#f34c30]' : 'text-[#f5f2ed]'}`}>
              <span className="mt-1 font-mono text-[10px] text-[#aaa8a1]">0{index + 1}</span>
              <span className="flex-1"><span className="block text-lg font-medium tracking-tight xl:text-xl">{choice.label}</span><span className="mt-2 block text-xs font-normal leading-relaxed text-[#aaa8a1]">{choice.note}</span></span>
              <ArrowUpRight className={`mt-1 transition-transform duration-300 ${selected === choice.id ? 'rotate-45' : ''}`} />
            </Button>)}
          </div>
        </div>
        <div id="service-detail" className="relative min-w-0 rounded-xl border border-[#d9d6d0] bg-[#f5f2ed] p-5 text-[#151719] sm:p-8 xl:p-10">
          <motion.div key={selected} initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .35 }}>
            {selected === 'idea' ? <div><p className="flex items-center gap-2 text-[11px] uppercase tracking-[.14em] text-[#62625d]"><Plus className="size-4 text-[#c93820]" />Miejsce na Twój pomysł</p><h3 className="mt-6 text-3xl font-semibold leading-[1.1] tracking-[-.045em] sm:text-4xl">Dobry początek?<br /><span className="font-editorial font-normal italic">Twoje własne pytanie.</span></h3><p className="mt-4 text-sm leading-relaxed text-[#62625d]">Nietypowy projekt, aplikacja, szkolenie albo coś, czego jeszcze nie nazwaliśmy. Zacznijmy od rozmowy.</p></div> : <ScenarioScene scenario={selected} />}
          </motion.div>
          {selected !== 'idea' && <Button onClick={() => setContactOpen(value => !value)} aria-expanded={contactOpen} aria-controls="scenario-contact" className="mt-4 h-auto min-h-14 w-full justify-between gap-4 whitespace-normal rounded-md bg-[#c93820] px-5 py-4 text-left text-base text-white hover:bg-[#ac301c]">{contactOpen ? 'Ukryj wybór kontaktu' : 'Porozmawiajmy o takim rozwiązaniu'}<ArrowUpRight /></Button>}
          <ScenarioContact message={drafts[selected]} onMessageChange={message => setDrafts(previous => ({ ...previous, [selected]: message }))} custom={selected === 'idea'} visible={selected === 'idea' || contactOpen} scenario={selected} />
        </div>
      </div>
      <details className="mt-12 border-y border-white/20 py-4">
        <summary className="cursor-pointer py-3 text-sm text-[#dedbd5] underline-offset-4 hover:underline">Poznaj pełny zakres usług — strony, aplikacje, AI, szkolenia i audyty</summary>
        <div className="grid gap-6 py-6 sm:grid-cols-2 lg:grid-cols-3">{services.map(([name, description]) => <div key={name}><h3 className="mb-3 text-lg font-medium">{name}</h3><p className="text-sm leading-relaxed text-[#aaa8a1]">{description}</p></div>)}</div>
        <Link href="/#kontakt" className="inline-flex min-h-11 items-center text-sm text-[#f34c30] underline underline-offset-4">Porozmawiajmy o zakresie współpracy ↗</Link>
      </details>
      <div id="case-study" className="mt-6 flex flex-wrap justify-between gap-5 scroll-mt-24 text-sm">
        <Link href="/case-studies" className="inline-flex min-h-11 items-center text-[#dedbd5] underline underline-offset-4">Poznaj przykładowe zastosowania</Link>
        <Link href="/#klara" className="inline-flex min-h-11 items-center text-[#f34c30] underline underline-offset-4">Wypróbuj działające demo Klary ↗</Link>
      </div>
    </div>
  </section>
}
