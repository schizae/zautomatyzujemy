import { Shield, Zap, MessageSquare, GraduationCap, CalendarCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function ServicesSection() {
  return (
    <section className="py-32 px-6 md:px-8 max-w-screen-2xl mx-auto" id="uslugi">
      {/* Section header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tight mb-6 text-[#e2e3df]">
            Twój problem
            <br />
            <span className="text-[#70e5ea]">— nasze rozwiązanie.</span>
          </h2>
          <p className="text-[#bcc9c9] text-lg font-body">
            Nie sprzedajemy technologii dla technologii. Każde wdrożenie zaczyna się od
            konkretnego problemu, który kosztuje Cię czas albo pieniądze.
          </p>
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 1. AI Act — full width, flagowa */}
        <div className="md:col-span-3 relative bg-gradient-to-br from-[#1a1c1a] to-[#1e2218] p-10 rounded-[2.5rem] border border-[#ffa07b]/20 overflow-hidden group hover:border-[#ffa07b]/40 transition-colors duration-500">
          {/* Glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#ffa07b]/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffa07b]/10 border border-[#ffa07b]/20 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffa07b] animate-pulse" />
                <span className="text-xs font-label uppercase tracking-widest text-[#ffa07b]">Nowa usługa — AI Act</span>
              </div>

              <Shield className="text-[#ffa07b] mb-6" size={44} />
              <h3 className="text-3xl font-headline font-bold mb-4 text-[#e2e3df]">
                Audyt i wdrożenie zgodności z AI Act
              </h3>
              <p className="text-[#bcc9c9] text-base font-body leading-relaxed">
                Używasz AI w swojej firmie albo dopiero planujesz? Od 2 sierpnia 2026 obowiązują
                nowe unijne przepisy (AI Act), które dotyczą każdej firmy korzystającej z systemów
                sztucznej inteligencji — nawet prostych chatbotów czy automatyzacji.
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <p className="text-[#bcc9c9] text-base font-body leading-relaxed">
                Pomagam małym i średnim firmom zrozumieć, co ich obowiązuje, sklasyfikować używane
                systemy AI według poziomu ryzyka, wdrożyć wymagane mechanizmy (oznaczanie treści AI,
                dokumentacja, polityka użycia) oraz przeprowadzić obowiązkowe szkolenie zespołu
                z AI literacy. Otrzymujesz komplet dokumentacji, z którą spokojnie spojrzysz
                w oczy kontroli.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="#kontakt"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#ffa07b]/10 border border-[#ffa07b]/30 text-[#ffa07b] font-headline font-bold text-sm hover:bg-[#ffa07b]/20 transition-colors"
                >
                  Sprawdź zgodność swojej firmy
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Automatyzacja — wide */}
        <div className="md:col-span-2 bg-[#1a1c1a] p-10 rounded-[2.5rem] flex flex-col justify-between group hover:bg-[#1e201e] transition-colors duration-500">
          <div>
            <Zap className="text-[#70e5ea] mb-8" size={44} />
            <h3 className="text-3xl font-headline font-bold mb-4 text-[#e2e3df]">
              Automatyzacja powtarzalnych procesów
            </h3>
            <p className="text-[#bcc9c9] text-base max-w-lg font-body leading-relaxed">
              Wiesz, ile godzin tygodniowo Ty i Twój zespół tracicie na ręczne przepisywanie
              faktur, przeklejanie danych między systemami, odpowiadanie na te same pytania
              klientów? Buduję automatyzacje w n8n i narzędziach AI, które wykonują te
              czynności za Was — 24 godziny na dobę, bez błędów, bez urlopów. Typowo
              oszczędzam klientom od 10 do 40 godzin tygodniowo.
            </p>
          </div>
          <div className="mt-10 flex items-center justify-between">
            <div className="flex -space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  className="w-9 h-9 rounded-full border-2 border-[#1a1c1a] bg-[#282a28]"
                />
              ))}
            </div>
            <ArrowRight
              className="text-[#70e5ea] group-hover:translate-x-2 transition-transform"
              size={22}
            />
          </div>
        </div>

        {/* 3. Chatboty — narrow */}
        <div className="bg-[#1e201e] p-10 rounded-[2.5rem] border border-[#3d4949]/10">
          <MessageSquare className="text-[#50c9ce] mb-6" size={40} />
          <h3 className="text-2xl font-headline font-bold mb-4 text-[#e2e3df]">
            Chatboty i asystenci AI dla obsługi klienta
          </h3>
          <p className="text-[#bcc9c9] font-body leading-relaxed text-sm">
            Twoi klienci zadają wciąż te same pytania? Buduję chatboty, które odpowiadają
            na zapytania w oparciu o Twoją bazę wiedzy — dokumentację, regulamin, FAQ,
            historię zamówień. Integruję z CRM-em, Messengerem, WhatsAppem. Zgodne
            z AI Act od pierwszego dnia.
          </p>
        </div>

        {/* 4. Szkolenia — narrow */}
        <div className="bg-[#1e201e] p-10 rounded-[2.5rem] border border-[#3d4949]/10">
          <GraduationCap className="text-[#70e5ea] mb-6" size={40} />
          <h3 className="text-2xl font-headline font-bold mb-4 text-[#e2e3df]">
            Szkolenia zespołów z AI
          </h3>
          <p className="text-[#bcc9c9] font-body leading-relaxed text-sm">
            Od lutego 2025 AI Act wymaga od firm zapewnienia pracownikom szkoleń z AI
            literacy — nie jako dobra praktyka, ale jako obowiązek prawny. Prowadzę
            szkolenia dostosowane do branży i poziomu zaawansowania zespołu. Wystawiam
            zaświadczenia i dokumentację zgodną z wymogami.
          </p>
        </div>

        {/* 5. Bezpłatna konsultacja — wide, CTA */}
        <div className="md:col-span-2 bg-gradient-to-br from-[#003739] to-[#004d50] p-10 rounded-[2.5rem] flex flex-col justify-between group relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#70e5ea]/10 blur-[60px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <CalendarCheck className="text-[#70e5ea] mb-6" size={40} />
            <h3 className="text-2xl font-headline font-bold mb-4 text-[#e2e3df]">
              Bezpłatna konsultacja wdrożeniowa
            </h3>
            <p className="text-[#bcc9c9] font-body leading-relaxed text-sm max-w-sm">
              Masz konkretny proces, który chciałbyś ulepszyć z pomocą AI, ale nie wiesz
              od czego zacząć? Umów się na bezpłatną 30-minutową konsultację. Wspólnie
              przeanalizujemy Twoje procesy, wskażę obszary, w których AI może realnie
              pomóc, i przygotuję plan wdrożenia z szacunkowym zwrotem z inwestycji.
            </p>
          </div>

          <div className="relative z-10 mt-10">
            <Link
              href="#kontakt"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#70e5ea] text-[#003739] font-headline font-bold text-base hover:brightness-110 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Umów bezpłatną konsultację
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
