import { ContactForm } from './contact-form'
export function ContactSection() {
  return <section id="kontakt" className="scroll-mt-20 bg-[#151719] px-6 py-20 text-[#f5f2ed] md:px-8">
    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
      <div>
        <p className="mb-6 text-xs uppercase tracking-[0.2em] text-[#c0bfba]">06 / Twój kolejny krok</p>
        <h2 className="font-headline text-5xl font-medium leading-tight tracking-tight md:text-6xl">Zróbmy miejsce<br />na <span className="font-serif italic">rozwój.</span>
        </h2>
        <p className="my-8 max-w-md text-lg leading-relaxed text-[#c0bfba]">Opowiedz, co zajmuje Ci za dużo czasu lub co chcesz zbudować. Podczas bezpłatnej konsultacji ustalimy, od czego warto zacząć.</p>
        <p className="text-sm text-[#ffab98]">Bez zobowiązań. Bez technicznego żargonu.</p>
        <a href="mailto:n.chojnacki1993@gmail.com" className="mt-10 inline-block break-all underline underline-offset-4">n.chojnacki1993@gmail.com</a>
        <p className="mt-4">
          <a href="tel:+48730094465">+48 730 094 465</a>
        </p>
      </div>
      <ContactForm />
    </div>
  </section>
}
