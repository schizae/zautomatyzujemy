import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckSquare, Square, AlertTriangle, Clock, Shield, BookOpen, FileText, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Checklista AI Act dla MŚP 2026 | Zautomatyzujemy.pl',
  description:
    'Praktyczna checklista zgodności z rozporządzeniem EU AI Act dla małych i średnich firm. Bez prawniczego żargonu — konkretne kroki przed 2 sierpnia 2026.',
  alternates: { canonical: '/ai-act-checklist' },
}

interface CheckItem {
  text: string
  note?: string
}

interface Section {
  id: string
  icon: React.ElementType
  title: string
  badge?: string
  badgeColor?: string
  items: CheckItem[]
}

const sections: Section[] = [
  {
    id: 'podstawy',
    icon: BookOpen,
    title: 'Czy i jak AI Act dotyczy Twojej firmy?',
    items: [
      {
        text: 'Ustaliłem rolę mojej firmy: dostawca (provider), wdrażający (deployer), importer czy dystrybutor systemów AI',
        note: 'Większość MŚP to deployer — firma, która kupuje/używa gotowego AI. Obowiązki są lżejsze niż dla dostawcy.',
      },
      {
        text: 'Zebrałem listę wszystkich systemów AI używanych w firmie',
        note: 'Zaliczają się: ChatGPT, Copilot, chatboty, narzędzia rekrutacyjne, systemy oceny kredytowej, e-maile pisane przez AI, generatory treści.',
      },
      {
        text: 'Sprawdziłem, czy któryś z używanych systemów AI należy do kategorii zakazanej (obowiązuje od 2 lutego 2025)',
        note: 'Zakazane m.in.: scoring społeczny obywateli, manipulacja podprogowa, biometria w przestrzeni publicznej bez zgody.',
      },
    ],
  },
  {
    id: 'klasyfikacja',
    icon: AlertTriangle,
    title: 'Klasyfikacja ryzyka każdego systemu AI',
    badge: 'Kluczowe',
    badgeColor: 'text-[#ffa07b] border-[#ffa07b]/30 bg-[#ffa07b]/10',
    items: [
      {
        text: 'Zidentyfikowałem systemy AI nieakceptowalnego ryzyka i zrezygnowałem z nich',
        note: 'Kategoria zakazana od 2 lutego 2025.',
      },
      {
        text: 'Sprawdziłem, czy używam AI wysokiego ryzyka (Aneks III AI Act)',
        note: 'Dotyczy m.in.: rekrutacji i selekcji pracowników, oceny zdolności kredytowej, decyzji w opiece zdrowotnej, systemów bezpieczeństwa infrastruktury krytycznej.',
      },
      {
        text: 'Sprawdziłem systemy ograniczonego ryzyka (chatboty, generatory treści)',
        note: 'Wymagana transparentność wobec użytkowników — muszą wiedzieć, że rozmawiają z AI.',
      },
      {
        text: 'Potwierdziłem, że pozostałe narzędzia AI należą do kategorii minimalnego ryzyka',
        note: 'Np. filtry spamu, rekomendacje produktów — brak szczególnych obowiązków.',
      },
    ],
  },
  {
    id: 'obowiazki',
    icon: Shield,
    title: 'Obowiązki wdrażającego (deployer) — systemy wysokiego ryzyka',
    badge: 'Termin: sierpień 2026',
    badgeColor: 'text-[#70e5ea] border-[#70e5ea]/30 bg-[#70e5ea]/10',
    items: [
      {
        text: 'Weryfikuję, że systemy AI wysokiego ryzyka posiadają oznaczenie CE i deklarację zgodności dostawcy',
      },
      {
        text: 'Zapewniłem nadzór człowieka (human oversight) nad decyzjami podejmowanymi przez AI wysokiego ryzyka',
        note: 'Żadna istotna decyzja dotycząca człowieka nie może być w pełni automatyczna bez możliwości interwencji.',
      },
      {
        text: 'Wdrożyłem procedurę przechowywania logów działania systemów AI wysokiego ryzyka (minimum 6 miesięcy)',
      },
      {
        text: 'Mam procedurę zgłaszania poważnych incydentów do organu nadzorczego (w Polsce: UODO lub UKE)',
      },
      {
        text: 'Przeprowadziłem ocenę wpływu na prawa podstawowe przed wdrożeniem AI wysokiego ryzyka',
        note: 'Wymagane dla podmiotów publicznych i niektórych prywatnych.',
      },
    ],
  },
  {
    id: 'transparentnosc',
    icon: Users,
    title: 'Transparentność wobec klientów i użytkowników',
    badge: 'Obowiązuje już teraz',
    badgeColor: 'text-[#7bc87b] border-[#7bc87b]/30 bg-[#7bc87b]/10',
    items: [
      {
        text: 'Informuję klientów i użytkowników, gdy kontaktują się z chatbotem lub innym systemem AI',
        note: 'Wyjątek: gdy kontekst jest oczywisty (np. asystent głosowy Google). W razie wątpliwości — informuj.',
      },
      {
        text: 'Oznaczam treści generowane przez AI, jeśli mogą być mylone z ludzkimi (deepfake, syntetyczny głos)',
      },
      {
        text: 'Nie stosuję systemów AI do manipulacji podprogowej, wykorzystywania słabości psychicznych ani ukrytego profilowania',
      },
      {
        text: 'Zaktualizowałem politykę prywatności o informacje o stosowaniu AI i przetwarzaniu danych do celów AI',
      },
    ],
  },
  {
    id: 'ai-literacy',
    icon: BookOpen,
    title: 'AI literacy — szkolenia pracowników',
    badge: 'Termin: sierpień 2025',
    badgeColor: 'text-[#ffa07b] border-[#ffa07b]/30 bg-[#ffa07b]/10',
    items: [
      {
        text: 'Zapewniłem odpowiedni poziom wiedzy o AI wszystkim pracownikom korzystającym z systemów AI',
        note: 'Art. 4 AI Act: obowiązek "AI literacy" obowiązuje od 2 sierpnia 2025. Nie wymaga certyfikatów — wystarczy udokumentowane szkolenie wewnętrzne.',
      },
      {
        text: 'Przeszkoliłem osoby odpowiedzialne za zarządzanie systemami AI wysokiego ryzyka (pełna interpretacja wymagań)',
      },
      {
        text: 'Przechowuję dokumentację szkoleń (kto, kiedy, zakres) na wypadek kontroli',
      },
    ],
  },
  {
    id: 'dokumentacja',
    icon: FileText,
    title: 'Dokumentacja i polityki wewnętrzne',
    items: [
      {
        text: 'Stworzyłem lub zaktualizowałem firmową politykę korzystania z AI (AI Policy)',
        note: 'Powinna określać: jakich narzędzi AI wolno używać, do jakich celów, jak chronić dane.',
      },
      {
        text: 'Dokumentuję przeznaczenie i sposób użycia każdego systemu AI wysokiego ryzyka (instrukcje, zakres zastosowania)',
      },
      {
        text: 'Zaktualizowałem umowy z dostawcami AI — sprawdziłem, kto odpowiada za zgodność z AI Act',
        note: 'Dostawca powinien dostarczyć deklarację zgodności i instrukcję użytkowania.',
      },
      {
        text: 'Sprawdziłem zgodność z RODO w kontekście AI — szczególnie przy przetwarzaniu danych osobowych przez modele AI',
      },
    ],
  },
]

const timeline = [
  { date: '2 luty 2025', label: 'Zakaz systemów AI nieakceptowalnego ryzyka', done: true },
  { date: '2 sierpień 2025', label: 'Przepisy o modelach GPAI (AI ogólnego przeznaczenia) + AI literacy', done: false },
  { date: '2 sierpień 2026', label: 'Pełne obowiązki dla systemów AI wysokiego ryzyka (Aneks I)', done: false },
  { date: '2 sierpień 2027', label: 'Obowiązki dla istniejących systemów AI wysokiego ryzyka (Aneks III)', done: false },
]

export default function AiActChecklistPage() {
  return (
    <div className="min-h-screen bg-[#0d0f0d] text-[#e2e3df]">

      {/* Header */}
      <div className="border-b border-[#3d4949]/20 bg-[#111311]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#bcc9c9] hover:text-[#70e5ea] transition-colors mb-6 font-body"
          >
            ← Powrót na stronę główną
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffa07b]/10 border border-[#ffa07b]/20 mb-4">
            <Shield size={12} className="text-[#ffa07b]" />
            <span className="text-xs font-label uppercase tracking-widest text-[#ffa07b]">Bezpłatny przewodnik</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold mb-3">
            Checklista: Zgodność z AI Act dla MŚP
          </h1>
          <p className="text-[#bcc9c9] font-body text-base leading-relaxed max-w-2xl">
            Praktyczny przewodnik dla małych i średnich firm. Bez prawniczego żargonu —
            konkretne kroki, które musisz podjąć przed <strong className="text-[#ffa07b]">2 sierpnia 2026</strong>.
          </p>
          <p className="text-[#5a6464] text-xs font-body mt-4">
            Opracowano na podstawie Rozporządzenia (UE) 2024/1689 (EU AI Act). Aktualizacja: kwiecień 2026.
            To jest przewodnik informacyjny — w sprawach prawnych skonsultuj się z radcą prawnym.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-4">

        {/* Timeline */}
        <div className="rounded-2xl border border-[#3d4949]/30 bg-[#111311] p-6 md:p-8 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={15} className="text-[#70e5ea]" />
            <h2 className="text-sm font-label uppercase tracking-wider text-[#70e5ea]">Kluczowe daty</h2>
          </div>
          <div className="space-y-3">
            {timeline.map((item) => (
              <div key={item.date} className="flex gap-4 items-start">
                <div className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${item.done ? 'bg-[#3d4949]' : 'bg-[#ffa07b]'}`} />
                <div>
                  <span className={`text-xs font-label ${item.done ? 'text-[#5a6464]' : 'text-[#ffa07b]'}`}>
                    {item.date}{item.done ? ' (minęło)' : ''}
                  </span>
                  <p className={`text-sm font-body ${item.done ? 'text-[#5a6464] line-through' : 'text-[#e2e3df]'}`}>
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <div
              key={section.id}
              className="rounded-2xl border border-[#3d4949]/30 bg-[#111311] p-6 md:p-8"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1c1a] flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-[#70e5ea]" />
                  </div>
                  <h2 className="text-base md:text-lg font-headline font-bold text-[#e2e3df]">
                    {section.title}
                  </h2>
                </div>
                {section.badge && (
                  <span className={`shrink-0 text-xs font-label px-2.5 py-1 rounded-full border ${section.badgeColor}`}>
                    {section.badge}
                  </span>
                )}
              </div>

              <ul className="space-y-4">
                {section.items.map((item, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <div className="shrink-0 mt-0.5">
                      <Square size={16} className="text-[#3d4949]" />
                    </div>
                    <div>
                      <p className="text-sm font-body text-[#e2e3df] leading-relaxed">{item.text}</p>
                      {item.note && (
                        <p className="text-xs font-body text-[#5a6464] mt-1 leading-relaxed">{item.note}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}

        {/* Action plan */}
        <div className="rounded-2xl border border-[#70e5ea]/20 bg-gradient-to-br from-[#0d1f1f] to-[#111311] p-6 md:p-8">
          <h2 className="text-lg font-headline font-bold text-[#e2e3df] mb-5">
            Plan działania dla MŚP — krok po kroku
          </h2>
          <ol className="space-y-3">
            {[
              'Audyt narzędzi AI używanych w firmie — stwórz listę',
              'Klasyfikacja każdego narzędzia według poziomów ryzyka AI Act',
              'Wdrożenie transparentności: chatboty i AI muszą się identyfikować',
              'Szkolenie pracowników z AI literacy (termin: sierpień 2025)',
              'Opracowanie firmowej polityki AI (AI Policy)',
              'Aktualizacja polityki prywatności i umów z dostawcami AI',
              'Przygotowanie dokumentacji dla systemów wysokiego ryzyka (termin: sierpień 2026)',
            ].map((step, idx) => (
              <li key={idx} className="flex gap-4 items-start">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[#70e5ea]/10 border border-[#70e5ea]/30 text-[#70e5ea] text-xs font-label flex items-center justify-center">
                  {idx + 1}
                </span>
                <p className="text-sm font-body text-[#bcc9c9] leading-relaxed pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-[#3d4949]/30 bg-[#111311] p-6 md:p-8 text-center">
          <CheckSquare size={28} className="text-[#ffa07b] mx-auto mb-4" />
          <h2 className="text-xl font-headline font-bold text-[#e2e3df] mb-3">
            Potrzebujesz pomocy z wdrożeniem?
          </h2>
          <p className="text-[#bcc9c9] font-body text-sm leading-relaxed mb-6 max-w-lg mx-auto">
            Przeprowadzimy Twoją firmę przez cały proces — od audytu narzędzi AI po przygotowanie
            dokumentacji zgodnej z AI Act. Bezpłatna konsultacja, bez zobowiązań.
          </p>
          <Link
            href="/#kontakt"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#ffa07b] text-[#1a0a00] font-headline font-bold text-base hover:brightness-110 transition-all shadow-lg"
          >
            Umów bezpłatną konsultację →
          </Link>
        </div>

      </div>
    </div>
  )
}
