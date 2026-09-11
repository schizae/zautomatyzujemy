'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ContactForm } from './contact-form'
import { FadeInUp, RevealText } from '@/components/animations'
import { MotionCta } from './motion-cta'

export function ContactSection() {
  const formRef = useRef<HTMLDetailsElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const [wide, setWide] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)')
    const update = () => setWide(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  // Koniec ruchu wypada, gdy górna krawędź sekcji dojdzie do środka ekranu —
  // punkt osiągalny także przy dolnej granicy dokumentu, gdzie pod kontaktem
  // jest już tylko stopka.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'start center'] })
  // Ograniczony ruch przypina postęp do końca: kadr docelowy widać od razu,
  // a przełączenie preferencji w trakcie zatrzymuje efekt bez utraty stanu.
  const progress = useTransform(scrollYProgress, value => (reduced === false ? value : 1))
  const zoom = wide ? 1.06 : 1.02
  const scale = useTransform(progress, [0, 1], [zoom, 1])
  const y = useTransform(progress, [0, 1], [12, 0])
  const shade = useTransform(progress, [0, 1], [.55, .3])

  function openForm() {
    if (!formRef.current) return
    formRef.current.open = true
    formRef.current.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  }

  return <section ref={sectionRef} id="kontakt" className="relative isolate scroll-mt-20 overflow-hidden bg-[#101214] px-6 py-20 text-[#f5f2ed] md:px-8 lg:py-24">
    <motion.div aria-hidden="true" className="absolute inset-0 -z-20" style={{ scale, y }}>
      <Image src="/redesign/contact-door.webp" alt="" fill sizes="100vw" className="object-cover object-right" />
    </motion.div>
    <motion.div aria-hidden="true" className="absolute inset-0 -z-10 bg-black" initial={false} style={{ opacity: shade }} />
    <div className="mx-auto grid max-w-[1616px] items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <h2 className="font-body text-5xl font-semibold leading-[1.04] tracking-[-0.055em] xl:text-[88px]"><RevealText>Zróbmy miejsce</RevealText><br />na <RevealText delay={.2} className="font-editorial font-normal italic tracking-[-0.065em] text-[#f34c30]">rozwój.</RevealText></h2>
        <p className="mt-8 text-xs uppercase leading-loose tracking-[0.25em] text-[#dedbd5]">Sztuczna inteligencja.<br />Realne możliwości.</p>
      </div>
      <FadeInUp delay={.2} duration={1.3} className="lg:pt-5">
        <p className="mb-6 text-xl leading-relaxed xl:text-2xl">Opowiedz o swojej firmie.<br />Wybierzemy pierwszy krok.</p>
        <div className="flex flex-wrap gap-3">
          <MotionCta onClick={openForm} className="min-h-14 h-auto whitespace-normal rounded-md bg-[#c93820] px-6 py-4 text-base text-white hover:bg-[#a82e19]">Umów bezpłatną konsultację ↗</MotionCta>
          <MotionCta href="/#klara" className="min-h-14 h-auto rounded-md border border-white/60 bg-transparent px-6 py-4 text-base text-white hover:bg-white/10">Porozmawiaj z Klarą</MotionCta>
        </div>
        <details ref={formRef} id="formularz-kontaktowy" className="group mt-6 scroll-mt-24">
          <summary className="cursor-pointer py-3 text-base underline underline-offset-8">Wolę napisać — formularz kontaktowy</summary>
          <div className="mt-5 rounded-lg border border-white/20 bg-[#151719] p-5 sm:p-7"><ContactForm /></div>
        </details>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#dedbd5]">
          <a href="mailto:norbert@zautomatyzujemy.pl" className="underline underline-offset-4">norbert@zautomatyzujemy.pl</a>
          <a href="tel:+48730094465" className="hover:underline">+48 730 094 465</a>
        </div>
      </FadeInUp>
    </div>
  </section>
}
