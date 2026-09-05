'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Check, ArrowDown, Mail, FileText } from 'lucide-react'
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
    <div className="mx-auto max-w-[1600px]">
      <div className="grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="mb-6 text-xs uppercase tracking-[0.2em] text-[#c0bfba]">01 / Rozwiązania</p>
          <h2 className="font-body text-5xl font-semibold leading-[1.04] tracking-[-0.055em] xl:text-7xl">Mniej przeszkód.<br />Więcej <span className="font-editorial font-normal italic">działania.</span></h2>
          <p className="my-8 text-lg text-[#c0bfba]">Wybierz obszar, który chcesz usprawnić.</p>
        <div className="min-w-0">{services.map((item, i) => <Button key={item.name} onClick={() => setSelected(i)} aria-pressed={selected === i} aria-controls="service-detail" className={`flex h-auto w-full justify-between whitespace-normal rounded-none border-b border-white/15 bg-transparent py-6 text-left text-lg hover:bg-white/5 md:text-2xl ${selected === i ? 'text-[#f34c30]' : 'text-[#c0bfba]'}`}>
          <span>
            <span className="mr-5 text-xs">0{i + 1}</span>{item.name}</span>
          <ArrowUpRight />
        </Button>)}</div>
        </div>
        <div id="service-detail" className="min-w-0 rounded-2xl bg-[#f5f2ed] min-h-[620px] p-6 text-[#151719] md:p-10">
          <p className="text-xs uppercase tracking-widest text-[#686862]">Przykładowy przebieg · nie realizacja klienta</p>
          <AnimatePresence mode="wait">
            <motion.div key={selected} initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .18 }}>
              <h3 className="my-8 font-body text-3xl font-semibold tracking-tight">{selected === 0 ? 'Od wiadomości do gotowego zgłoszenia' : service.name}</h3>
              {selected === 0 ? <div className="grid items-center gap-5 xl:grid-cols-[1fr_auto_1fr]">
                <div className="min-h-64 rounded-xl border border-black/10 bg-white/70 p-5 shadow-sm"><div className="mb-5 flex items-center gap-3 border-b border-black/10 pb-4 text-sm"><Mail className="size-5" />Nowa wiadomość</div><p className="text-xs text-[#686862]">Od: klient@przyklad.pl</p><p className="mt-2 text-xs text-[#686862]">Temat: Zapytanie o ofertę</p><p className="mt-6 leading-relaxed">Proszę o ofertę montażu klimatyzacji.</p></div>
                <ArrowUpRight className="mx-auto size-6" />
                <div className="min-h-64 rounded-xl border border-black/10 bg-white/70 p-5 shadow-sm"><div className="mb-5 flex items-center gap-3 text-sm font-semibold"><FileText className="size-5" />Nowe zgłoszenie</div><dl className="space-y-4 text-sm"><div><dt className="text-xs text-[#686862]">Temat</dt><dd>Montaż klimatyzacji</dd></div><div><dt className="text-xs text-[#686862]">Źródło</dt><dd>E-mail</dd></div><div><dt className="text-xs text-[#686862]">Status</dt><dd className="text-[#c93820]">Nowe</dd></div></dl><p className="mt-5 rounded-md bg-[#f34c30]/10 p-3 text-sm">✓ Szkic odpowiedzi gotowy</p></div>
              </div> : <><p className="my-5 leading-relaxed text-[#686862]">{service.description}</p><ol className="space-y-2">{service.steps.map((step, i) => <li key={step}><div className="flex items-center gap-3 rounded-lg border border-[#d9d6d0] bg-white/60 p-4 text-sm"><Check className="size-4 text-[#c93820]" />{step}</div>{i < 2 && <ArrowDown className="mx-auto mt-2 size-4 text-[#686862]" />}</li>)}</ol></>}
              <p className="mt-6 text-sm font-medium">{service.result}</p>
            </motion.div>
          </AnimatePresence>
          <Button asChild className="mt-10 h-auto rounded-md bg-[#e84324] px-6 py-4 text-white hover:bg-[#c93820]"><Link href={selected === 0 ? "/#klara" : "/#kontakt"}>{selected === 0 ? "Wypróbuj Klarę →" : "Porozmawiajmy o tym →"}</Link></Button>
        </div>
      </div>
      <div id="case-study" className="mt-10 flex flex-wrap justify-between gap-5 scroll-mt-24 text-sm">
        <Link href="/case-studies" className="text-[#c0bfba] underline underline-offset-4">Poznaj przykładowe zastosowania</Link>
        <Link href="/#klara" className="text-[#f34c30] underline underline-offset-4">Wypróbuj działające demo Klary ↗</Link>
      </div>
    </div>
  </section>
}
