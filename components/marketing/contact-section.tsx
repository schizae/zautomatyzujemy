import { ContactForm } from './contact-form'
import { Clock, Target, Lightbulb, ShieldCheck } from 'lucide-react'

const benefits = [
  {
    icon: Clock,
    title: '45 minut, które coś zmienią',
    desc: 'Bez small talku — od razu analizujemy Twoje procesy i szukamy gdzie automatyzacja da największy zwrot.',
  },
  {
    icon: Target,
    title: 'Konkretny plan, nie ogólniki',
    desc: 'Na koniec rozmowy wiesz dokładnie co, jak i za ile możemy zautomatyzować w Twojej firmie.',
  },
  {
    icon: Lightbulb,
    title: 'Zidentyfikujemy "quick wins"',
    desc: 'Pokażemy co można wdrożyć w 2 tygodnie i ile to zaoszczędzi — zanim podpiszesz cokolwiek.',
  },
  {
    icon: ShieldCheck,
    title: 'Bez zobowiązań',
    desc: 'Konsultacja jest bezpłatna. Nie musisz nic kupować — zabierasz wartościową wiedzę niezależnie od decyzji.',
  },
]

export function ContactSection() {
  return (
    <section
      className="py-32 bg-[#1a1c1a] border-y border-white/5"
      id="kontakt"
    >
      <div className="max-w-screen-2xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* Left: benefits */}
          <div>
            <h2 className="text-4xl font-headline font-bold mb-4 text-[#e2e3df]">
              Umów{' '}
              <span className="text-[#70e5ea]">bezpłatną</span>{' '}
              konsultację
            </h2>
            <p className="text-[#bcc9c9] mb-12 text-lg font-body leading-relaxed">
              Przeanalizujemy Twój obecny sposób pracy i wskażemy gdzie automatyzacja
              przyniesie największy zwrot — bez żargonu, bez ściemy.
            </p>

            <ul className="space-y-6">
              {benefits.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.title} className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-[#70e5ea]/10 border border-[#70e5ea]/20 flex items-center justify-center">
                      <Icon size={16} className="text-[#70e5ea]" />
                    </div>
                    <div>
                      <p className="font-headline font-semibold text-[#e2e3df] mb-1">{item.title}</p>
                      <p className="text-[#bcc9c9] text-sm font-body leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Right: Contact form */}
          <div className="flex flex-col justify-center">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  )
}
