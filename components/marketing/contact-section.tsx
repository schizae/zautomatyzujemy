import { ContactForm } from './contact-form'

const timeSlots = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM']

export function ContactSection() {
  return (
    <section
      className="py-32 bg-[#1a1c1a] border-y border-white/5"
      id="kontakt"
    >
      <div className="max-w-screen-2xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* Left: Calendar */}
          <div>
            <h2 className="text-4xl font-headline font-bold mb-8 text-[#e2e3df]">
              Zaprojektuj{' '}
              <span className="text-[#70e5ea]">Sesję</span> Strategiczną
            </h2>
            <p className="text-[#bcc9c9] mb-12 text-lg font-body">
              Wybierz termin na dogłębną konsultację techniczną. Przeanalizujemy Twój
              obecny stack technologiczny i wskażemy obszary możliwej automatyzacji.
            </p>

            {/* Calendar widget */}
            <div className="glass-card rounded-3xl border border-[#3d4949]/20 p-8">
              <div className="flex justify-between items-center mb-8">
                <h4 className="font-headline font-bold text-xl text-[#e2e3df]">
                  Czerwiec 2026
                </h4>
                <div className="flex gap-4 text-[#bcc9c9]">
                  <button className="hover:text-[#70e5ea] transition-colors font-headline text-xl leading-none">
                    ‹
                  </button>
                  <button className="hover:text-[#70e5ea] transition-colors font-headline text-xl leading-none">
                    ›
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-label text-[#bcc9c9] mb-4">
                {['Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob', 'Nie'].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-2">
                {[27, 28, 29, 30, 31].map((d) => (
                  <div
                    key={`prev-${d}`}
                    className="aspect-square flex items-center justify-center text-sm opacity-20 text-[#e2e3df]"
                  >
                    {d}
                  </div>
                ))}
                {[1, 2].map((d) => (
                  <button
                    key={d}
                    className="aspect-square flex items-center justify-center text-sm hover:bg-[#333533] rounded-lg text-[#e2e3df] transition-colors"
                  >
                    {d}
                  </button>
                ))}
                {[3, 7].map((d) => (
                  <button
                    key={d}
                    className="aspect-square flex items-center justify-center text-sm bg-[#70e5ea]/20 text-[#70e5ea] font-bold rounded-lg border border-[#70e5ea]/30"
                  >
                    {d}
                  </button>
                ))}
                {[4, 5, 6].map((d) => (
                  <button
                    key={d}
                    className="aspect-square flex items-center justify-center text-sm hover:bg-[#333533] rounded-lg text-[#e2e3df] transition-colors"
                  >
                    {d}
                  </button>
                ))}
                {[8, 9].map((d) => (
                  <div
                    key={d}
                    className="aspect-square flex items-center justify-center text-sm text-[#e2e3df]"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Time slots */}
              <div className="mt-8 pt-8 border-t border-[#3d4949]/10">
                <p className="text-xs font-label text-[#bcc9c9] uppercase mb-4">
                  Available Slots (UTC+2)
                </p>
                <div className="flex flex-wrap gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      className="px-4 py-2 rounded-full border border-[#3d4949]/30 text-sm text-[#e2e3df] hover:bg-[#70e5ea] hover:text-[#003739] hover:border-[#70e5ea] transition-all font-label"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
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
