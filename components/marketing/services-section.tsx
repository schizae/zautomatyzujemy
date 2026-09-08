'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RevealText } from '@/components/animations'
import { AutomationFlow } from './automation-flow'
import { ServiceFlowMap, type FlowNode } from './service-flow-map'

interface Service {
  name: string
  description: string
  /** Cztery etapy przykładowego przebiegu — ilustracja, nie deklaracja integracji. */
  flow: FlowNode[]
  result: string
}

const services: Service[] = [
  {
    name: 'AI i automatyzacje',
    description: 'Mniej przepisywania danych i powtarzających się pytań. Łączymy Twoje narzędzia, a asystenta uczymy na materiałach Twojej firmy.',
    flow: [
      { id: 'wiadomosc', label: 'Wiadomość', note: 'Zapytanie przychodzi e-mailem albo z formularza na stronie.' },
      { id: 'ai', label: 'AI porządkuje dane', note: 'Asystent odczytuje treść i wyciąga z niej temat, dane kontaktowe i intencję.' },
      { id: 'zgloszenie', label: 'CRM / zgłoszenie', note: 'Uporządkowane pola trafiają do zgłoszenia w Twoim systemie.' },
      { id: 'szkic', label: 'Szkic odpowiedzi', note: 'Dostajesz gotowy szkic do zatwierdzenia. Decyzja zostaje po Twojej stronie.' },
    ],
    result: 'Ty decydujesz. System zajmuje się rutyną.',
  },
  {
    name: 'Aplikacje dla biznesu',
    description: 'Panel, rezerwacje lub narzędzie do obsługi zleceń. Projektujemy aplikacje wokół Twojego sposobu pracy.',
    flow: [
      { id: 'potrzeba', label: 'Potrzeba zespołu', note: 'Zaczynamy od tego, jak pracujecie dziś i co najbardziej przeszkadza.' },
      { id: 'prototyp', label: 'Prototyp', note: 'Klikalna wersja do wspólnego sprawdzenia, zanim powstanie kod.' },
      { id: 'polaczenie', label: 'Połączenie systemów', note: 'Aplikacja rozmawia z narzędziami, których już używacie.' },
      { id: 'gotowa', label: 'Gotowa aplikacja', note: 'Wdrożenie, przekazanie i materiały dla zespołu.' },
    ],
    result: 'Wszystko, czego potrzebujesz, w jednym miejscu.',
  },
  {
    name: 'Strony internetowe',
    description: 'Szybka, czytelna strona, która przedstawia ofertę i ułatwia kontakt. Z formularzami, blogiem i miejscem na rozwój.',
    flow: [
      { id: 'oferta', label: 'Oferta i odbiorcy', note: 'Ustalamy, co sprzedajesz i do kogo mówisz.' },
      { id: 'tresc', label: 'Treść i projekt', note: 'Układ, teksty i wygląd powstają razem, nie jedno po drugim.' },
      { id: 'strona', label: 'Responsywna strona', note: 'Czytelna na telefonie i szybka w otwieraniu.' },
      { id: 'kontakt', label: 'Kontakt od klienta', note: 'Formularz, telefon albo rozmowa z asystentem — zależnie od strony.' },
    ],
    result: 'Dobry pierwszy kontakt zaczyna się od Twojej strony.',
  },
  {
    name: 'Szkolenia z AI',
    description: 'Praktyczne warsztaty na zadaniach Twojego zespołu: od pisania poleceń po sprawdzanie odpowiedzi i bezpieczną pracę z danymi.',
    flow: [
      { id: 'potrzeby', label: 'Potrzeby zespołu', note: 'Sprawdzamy, przy jakich zadaniach zespół traci najwięcej czasu.' },
      { id: 'cwiczenia', label: 'Praktyczne ćwiczenia', note: 'Warsztat na Waszych zadaniach, nie na przykładach z internetu.' },
      { id: 'weryfikacja', label: 'Weryfikacja odpowiedzi', note: 'Jak rozpoznać błąd modelu i kiedy nie ufać wynikowi.' },
      { id: 'materialy', label: 'Materiały do pracy', note: 'Gotowe polecenia i zasady pracy z danymi na po szkoleniu.' },
    ],
    result: 'Wiedza, którą wykorzystasz już następnego dnia.',
  },
  {
    name: 'Audyty i plan wdrożenia',
    description: 'Sprawdzamy procesy, narzędzia i sposób wykorzystania AI. Ustalamy priorytety oraz zakres dalszych prac, także wokół AI Act.',
    flow: [
      { id: 'przeglad', label: 'Przegląd procesów', note: 'Rozmowa i przegląd tego, jak dziś płynie praca w firmie.' },
      { id: 'ryzyka', label: 'Możliwości i ryzyka', note: 'Co da się usprawnić, a gdzie automatyzacja się nie opłaca.' },
      { id: 'priorytety', label: 'Priorytety', note: 'Kolejność prac ustawiona według efektu, nie łatwości wykonania.' },
      { id: 'plan', label: 'Plan działania', note: 'Zakres, etapy i obowiązki wynikające z AI Act.' },
    ],
    result: 'Zacznij od decyzji opartej na potrzebach firmy.',
  },
]

export function ServicesSection() {
  const [selected, setSelected] = useState(0)
  // Wybór węzła żyje obok wyboru usługi — zmiana usługi zawsze go zeruje,
  // żeby nowa mapa nie startowała z etapem z poprzedniej.
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const reduced = useReducedMotion()
  const service = services[selected] ?? services[0]!

  function chooseService(index: number) {
    setSelected(index)
    setActiveNode(null)
  }

  const stage = activeNode === null ? null : service.flow.findIndex(node => node.id === activeNode)

  return <section id="uslugi" className="scroll-mt-20 bg-[#101214] bg-[radial-gradient(ellipse_at_top_right,#282a2c_0%,transparent_65%)] px-6 py-20 text-[#f5f2ed] md:px-8 lg:py-20">
    <div className="mx-auto max-w-[1680px]">
      <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="mb-6 text-xs uppercase tracking-[0.2em] text-[#dedbd5]">01 / Rozwiązania</p>
          <h2 className="font-body text-5xl font-semibold leading-[1.04] tracking-[-0.055em] xl:text-[68px]"><RevealText>Mniej przeszkód.</RevealText><br />Więcej <span className="font-editorial font-normal italic tracking-[-0.06em]">działania.</span></h2>
          <p className="my-8 text-lg text-[#dedbd5]">Wybierz obszar, który chcesz usprawnić.</p>
        <div className="min-w-0">{services.map((item, i) => <Button key={item.name} onClick={() => chooseService(i)} aria-pressed={selected === i} aria-controls="service-detail" className={`flex h-auto w-full justify-between whitespace-normal rounded-none border-0 border-b border-white/20 bg-transparent px-0 py-5 text-left text-lg hover:bg-white/5 duration-200 md:text-2xl ${selected === i ? 'text-[#f34c30]' : 'text-[#dedbd5]'}`}>
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
              {selected !== 0 && <p className="my-5 leading-relaxed text-[#62625d]">{service.description}</p>}
              <ServiceFlowMap nodes={service.flow} activeId={activeNode} onActivate={setActiveNode} />
              {/* Klucz montuje scenę od nowa przy zmianie etapu. Elementy Framera
                  startują wtedy wprost na wartości wybranego etapu (`initial={false}`),
                  zamiast trzymać stan z poprzedniego odtworzenia. */}
              {selected === 0 && <div className="mt-6"><AutomationFlow key={stage ?? 'auto'} stage={stage} onReplay={() => setActiveNode(null)} /></div>}
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
