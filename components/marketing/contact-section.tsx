'use client'
import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ContactForm } from './contact-form'
import { Button } from '@/components/ui/button'
export function ContactSection() {
  const formRef = useRef<HTMLDetailsElement>(null)
  function openForm() {
    if (!formRef.current) return
    formRef.current.open = true
    formRef.current.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
  }
  return <section id="kontakt" className="relative isolate scroll-mt-20 overflow-hidden bg-[#101214] px-6 py-20 text-[#f5f2ed] md:px-8 lg:py-24">
    <Image src="/redesign/contact-door.webp" alt="" fill sizes="100vw" className="-z-20 object-cover object-right" />
    <div className="absolute inset-0 -z-10 bg-black/30" />
    <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
      <div><h2 className="font-body text-5xl font-semibold leading-[1.04] tracking-[-0.055em] xl:text-8xl">Zróbmy miejsce<br />na <span className="font-editorial font-normal italic text-[#f34c30]">rozwój.</span></h2><p className="mt-8 text-xs uppercase leading-loose tracking-[0.25em] text-[#c0bfba]">Sztuczna inteligencja.<br />Realne możliwości.</p></div>
      <div><p className="mb-6 text-xl leading-relaxed">Opowiedz o swojej firmie.<br />Wybierzemy pierwszy krok.</p><div className="flex flex-wrap gap-3"><Button onClick={openForm} className="h-auto whitespace-normal rounded-md bg-[#e84324] px-5 py-4 text-white hover:bg-[#c93820]">Umów bezpłatną konsultację ↗</Button><Button asChild className="h-auto rounded-md border border-white bg-transparent px-5 py-4 text-white hover:bg-white/10"><Link href="/#klara">Porozmawiaj z Klarą</Link></Button></div><p className="mt-6 text-sm">Wolisz e-mail? <a href="mailto:n.chojnacki1993@gmail.com" className="underline underline-offset-4">Napisz bezpośrednio</a></p></div>
    </div>
    <details ref={formRef} id="formularz-kontaktowy" className="group mx-auto mt-10 max-w-[1500px] scroll-mt-24"><summary className="cursor-pointer py-4 text-base underline underline-offset-8">Wolę napisać — formularz kontaktowy →</summary><div className="mt-6 max-w-2xl rounded-xl bg-[#151719]/95 p-6"><ContactForm /></div></details>
  </section>
}
