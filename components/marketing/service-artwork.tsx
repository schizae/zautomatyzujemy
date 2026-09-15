import Image from 'next/image'
import {
  ArrowDown, ArrowUpRight, Bot, Check, CheckCheck, FileCheck2, FileText,
  GraduationCap, LayoutTemplate, Mail, Network, Search, ShieldCheck, Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { ServiceFlow, ServiceMotion } from './service-motion'

interface ServiceVisual {
  icon: LucideIcon
  caption: string
  scene: () => React.JSX.Element
}

const visuals: Record<string, ServiceVisual> = {
  'automatyzacja-procesow-biznesowych': { icon: Network, caption: 'Zapytanie ze strony → CRM → powiadomienie zespołu.', scene: AutomationScene },
  'agenci-ai-i-chatboty': { icon: Bot, caption: 'Rozmowa oparta na ofercie i materiałach Twojej firmy.', scene: ChatScene },
  'chatboty-i-asystenci-ai': { icon: Bot, caption: 'Rozmowa oparta na ofercie i materiałach Twojej firmy.', scene: ChatScene },
  'automatyzacja-dokumentow-i-faktur': { icon: FileText, caption: 'Od dokumentu do odczytanych danych i akceptacji.', scene: DocumentsScene },
  'audyt-i-doradztwo-ai': { icon: Search, caption: 'Procesy uporządkowane według sensu i kolejności wdrożenia.', scene: AuditScene },
  'szkolenia-z-ai-dla-zespolow': { icon: GraduationCap, caption: 'Praktyka na zadaniach, które Twój zespół zna z pracy.', scene: TrainingScene },
  'strony-i-oprogramowanie-na-zamowienie': { icon: LayoutTemplate, caption: 'Indywidualny projekt strony, od oferty po pierwszy kontakt.', scene: WebsiteScene },
  'zgodnosc-z-ai-act': { icon: ShieldCheck, caption: 'Inwentaryzacja narzędzi, ocena zastosowań i plan działań.', scene: ComplianceScene },
}

export function ServiceSymbol({ slug }: { slug: string }) {
  const Icon = visuals[slug]?.icon ?? ArrowUpRight
  return <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
}

export function ServiceArtwork({ slug }: { slug: string }) {
  const visual = visuals[slug]
  if (!visual) return null
  const Scene = visual.scene

  return (
    <figure className="min-w-0 overflow-hidden rounded-xl border border-white/15 bg-[#202426] text-[#f5f2ed] shadow-2xl shadow-black/20">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 text-xs text-[#c5c4bd]">
        <span>Tak może wyglądać Twoje rozwiązanie</span>
        <span className="flex gap-1.5" aria-hidden="true"><span className="size-1.5 rounded-full bg-[#f34c30]" /><span className="size-1.5 rounded-full bg-white/25" /><span className="size-1.5 rounded-full bg-white/25" /></span>
      </div>
      <div className="flex min-h-[380px] flex-col justify-center p-5 sm:min-h-[400px] sm:p-8" role="img" aria-label={visual.caption}>
        <div aria-hidden="true"><Scene /></div>
      </div>
      <figcaption className="border-t border-white/10 px-5 py-4 text-xs leading-relaxed text-[#c5c4bd]">
        <span className="mr-2 text-[#ffb49f]">Przykładowy scenariusz.</span>{visual.caption}
      </figcaption>
    </figure>
  )
}

function AutomationScene() {
  const steps = [
    { icon: Mail, title: 'Nowe zapytanie', detail: 'Formularz na Twojej stronie' },
    { icon: Network, title: 'Zapis w CRM', detail: 'Kontakt i temat w jednym miejscu' },
    { icon: CheckCheck, title: 'Zespół dostaje wiadomość', detail: 'Opiekun wie, co zrobić dalej' },
  ]
  return <div className="mx-auto max-w-md">
    {steps.map((step, index) => <div key={step.title}>
      {index > 0 && <ServiceFlow delay={index - 0.4} />}
      <ServiceMotion delay={index * 0.9} className="flex items-center gap-4 rounded-lg border border-white/15 bg-[#292e30] p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#f34c30]/10 text-[#ffb49f]"><step.icon className="size-5" strokeWidth={1.5} /></span>
        <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{step.title}</p><p className="mt-1 text-xs leading-relaxed text-[#c5c4bd]">{step.detail}</p></div>
        <Check className="size-4 shrink-0 text-[#b7c9aa]" />
      </ServiceMotion>
    </div>)}
    <p className="mt-6 text-center text-xs text-[#c5c4bd]">Jeden przepływ. Bez przepisywania danych.</p>
  </div>
}

function ChatScene() {
  return <div className="mx-auto max-w-md overflow-hidden rounded-lg bg-[#faf8f4] text-[#151719] shadow-xl">
    <div className="flex items-center gap-3 border-b border-[#d8d4cc] p-4"><span className="flex size-10 items-center justify-center rounded-full bg-[#f4e5dc] text-[#c93820]"><Bot className="size-5" /></span><div><p className="text-sm font-semibold">Asystent Twojej firmy</p><p className="mt-1 text-xs text-[#62625d]">Oferta · pytania · pierwszy kontakt</p></div></div>
    <div className="space-y-4 p-4 sm:p-5">
      <div className="ml-8 rounded-xl rounded-br-sm bg-[#eae5dc] px-4 py-3 text-sm leading-relaxed">Czy mogę połączyć formularz na stronie z moim CRM?</div>
      <ServiceMotion delay={0.7} className="mr-5 rounded-xl rounded-bl-sm border border-[#e0d9ce] px-4 py-3 text-sm leading-relaxed">Tak. Możemy automatycznie zapisywać nowe zapytania i powiadamiać opiekuna klienta.</ServiceMotion>
      <ServiceMotion delay={1.8} className="mr-5 rounded-xl rounded-bl-sm border border-[#e0d9ce] px-4 py-3 text-sm leading-relaxed">Z jakiego CRM korzysta Twój zespół?</ServiceMotion>
      <p className="flex items-center gap-2 text-xs text-[#62625d]"><FileCheck2 className="size-3.5 text-[#c93820]" />Na podstawie firmowej bazy wiedzy</p>
    </div>
  </div>
}

function DocumentsScene() {
  return <div className="mx-auto max-w-md">
    <div className="relative mr-6 rounded-lg bg-[#faf8f4] p-5 text-[#151719] shadow-xl">
      <div className="flex items-center justify-between border-b border-[#d8d4cc] pb-4"><span className="font-editorial text-2xl">Faktura</span><FileText className="size-6 text-[#c93820]" /></div>
      <dl className="mt-4 space-y-3 text-xs"><div className="flex justify-between gap-4"><dt className="text-[#62625d]">Numer</dt><dd>FV / 018 / 2026</dd></div><div className="flex justify-between gap-4"><dt className="text-[#62625d]">Kontrahent</dt><dd>Pracownia Północ</dd></div><div className="flex justify-between gap-4 border-t border-[#d8d4cc] pt-3"><dt>Do zapłaty</dt><dd className="font-semibold">2 460,00 zł</dd></div></dl>
    </div>
    <ServiceMotion delay={0.5} className="my-3 ml-8 text-[#ffb49f]"><ArrowDown className="size-5" /></ServiceMotion>
    <ServiceMotion delay={1.2} className="ml-6 rounded-lg border border-white/20 bg-[#303638] p-5 shadow-xl">
      <p className="flex items-center gap-2 text-sm font-semibold"><CheckCheck className="size-4 text-[#b7c9aa]" />Dane odczytane</p>
      <p className="mt-2 text-xs leading-relaxed text-[#c5c4bd]">Numer, kontrahent i kwota przypisane do dokumentu.</p>
      <p className="mt-4 border-t border-white/15 pt-3 text-xs text-[#ffb49f]">Następny krok: akceptacja w księgowości</p>
    </ServiceMotion>
  </div>
}

function AuditScene() {
  const processes = [
    ['Przepisywanie zapytań do CRM', 'Dobry punkt startu', 'text-[#b7c9aa]'],
    ['Raporty z kilku arkuszy', 'Kolejny etap', 'text-[#ffb49f]'],
    ['Decyzje w sprawach wyjątkowych', 'Zostają w zespole', 'text-[#c5c4bd]'],
  ]
  return <div className="mx-auto max-w-md">
    <div className="mb-7 flex items-center gap-3"><Search className="size-6 text-[#ffb49f]" /><p className="font-editorial text-3xl">Gdzie AI ma sens?</p></div>
    <div className="border-t border-white/20">{processes.map(([title, status, color], index) => <ServiceMotion key={title} delay={index * 0.8} className="border-b border-white/15 py-5"><p className="text-sm font-medium">{title}</p><p className={`mt-2 flex items-center gap-2 text-xs ${color}`}><span className="size-1.5 rounded-full bg-current" />{status}</p></ServiceMotion>)}</div>
    <p className="mt-6 text-xs leading-relaxed text-[#c5c4bd]">Najpierw proces i potrzeby. Potem wybór narzędzi.</p>
  </div>
}

function TrainingScene() {
  return <div className="mx-auto max-w-md">
    <div className="mb-5 flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-sm"><GraduationCap className="size-5 text-[#ffb49f]" />Warsztat z zespołem</p><span className="text-xs text-[#c5c4bd]">Ćwiczenie praktyczne</span></div>
    <div className="rounded-lg bg-[#faf8f4] p-5 text-[#151719] shadow-xl">
      <p className="font-editorial text-2xl">Od notatki do podsumowania.</p>
      <p className="mt-4 border-y border-[#d8d4cc] py-4 text-sm leading-relaxed text-[#62625d]">„Przygotuj podsumowanie spotkania. Wypisz ustalenia, osoby odpowiedzialne i terminy. Nie dopowiadaj brakujących informacji”.</p>
      <ServiceMotion delay={0.8} className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#c93820]"><Sparkles className="size-4" />Jasne zadanie + kontekst + format</ServiceMotion>
    </div>
    <ServiceMotion delay={1.8} className="mt-5 flex items-start gap-3 text-sm leading-relaxed"><Check className="mt-1 size-4 shrink-0 text-[#b7c9aa]" /><p>Sprawdź odpowiedź.<br /><span className="text-xs text-[#c5c4bd]">Porównaj ustalenia z notatką źródłową.</span></p></ServiceMotion>
  </div>
}

function WebsiteScene() {
  return <div>
    <Image src="/redesign/service-website-concept.png" alt="" width={1536} height={1024} priority sizes="(max-width: 1024px) 90vw, 560px" className="h-auto w-full rounded-lg" />
    <ServiceMotion delay={1} className="mt-4 flex items-center gap-2 text-xs text-[#c5c4bd]"><Check className="size-4 text-[#b7c9aa]" />Twoja oferta. Twój charakter. Na każdym ekranie.</ServiceMotion>
  </div>
}

function ComplianceScene() {
  const steps = ['Spis używanych narzędzi AI', 'Ocena sposobu wykorzystania', 'Dokumentacja i odpowiedzialność']
  return <div className="mx-auto max-w-md">
    <div className="flex items-center gap-4"><span className="flex size-16 shrink-0 items-center justify-center rounded-full border border-[#ffb49f]/30 text-[#ffb49f]"><ShieldCheck className="size-8" strokeWidth={1.25} /></span><div><p className="font-editorial text-3xl">AI pod kontrolą.</p><p className="mt-2 text-xs text-[#c5c4bd]">Od narzędzi do planu działań</p></div></div>
    <div className="mt-7 rounded-lg bg-[#faf8f4] p-5 text-[#151719] shadow-xl">{steps.map((step, index) => <ServiceMotion key={step} delay={index * 0.8} className="flex items-center gap-3 border-b border-[#d8d4cc] py-4 first:pt-0 last:border-0 last:pb-0"><Check className="size-4 shrink-0 text-[#c93820]" /><span className="text-sm">{step}</span></ServiceMotion>)}</div>
    <p className="mt-5 text-xs leading-relaxed text-[#c5c4bd]">Zakres działań wynika z tego, jak Twoja firma korzysta z AI.</p>
  </div>
}
