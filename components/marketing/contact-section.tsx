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
    <div className="mx-auto grid max-w-[1616px] items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <h2 className="font-body text-5xl font-semibold leading-[1.04] tracking-[-0.055em] xl:text-[88px]">Zróbmy miejsce<br />na <span className="font-editorial font-normal italic tracking-[-0.065em] text-[#f34c30]">rozwój.</span></h2>
        <p className="mt-8 text-xs uppercase leading-loose tracking-[0.25em] text-[#dedbd5]">Sztuczna inteligencja.<br />Realne możliwości.</p>
      </div>
      <div className="lg:pt-5">
        <p className="mb-6 text-xl leading-relaxed xl:text-2xl">Opowiedz o swojej firmie.<br />Wybierzemy pierwszy krok.</p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={openForm} className="min-h-14 h-auto whitespace-normal rounded-md bg-[#c93820] px-6 py-4 text-base text-white hover:bg-[#a82e19]">Umów bezpłatną konsultację ↗</Button>
          <Button asChild className="min-h-14 h-auto rounded-md border border-white/60 bg-transparent px-6 py-4 text-base text-white hover:bg-white/10"><Link href="/#klara">Porozmawiaj z Klarą</Link></Button>
        </div>
        <details ref={formRef} id="formularz-kontaktowy" className="group mt-6 scroll-mt-24">
          <summary className="cursor-pointer py-3 text-base underline underline-offset-8">Wolę napisać — formularz kontaktowy</summary>
          <div className="mt-5 rounded-lg border border-white/20 bg-[#151719] p-5 sm:p-7"><ContactForm /></div>
        </details>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#dedbd5]">
          <a href="mailto:n.chojnacki1993@gmail.com" className="underline underline-offset-4">Napisz e-mail</a>
          <a href="tel:+48730094465" className="hover:underline">+48 730 094 465</a>
        </div>
      </div>
    </div>
  </section>
}
