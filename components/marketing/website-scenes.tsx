'use client'

import Image from 'next/image'
import { ArrowUpRight, Check, Mail } from 'lucide-react'

export function WebsiteAct({ stage }: { stage: 0 | 1 | 2 }) {
  if (stage === 0) return <div className="flex h-full flex-col justify-between text-[#f5f2ed]">
    <p className="text-[10px] uppercase tracking-[.22em] text-[#b7bebc]">Zaczynamy od tego, co Twoje</p>
    <div className="relative mx-auto w-full max-w-md">
      <div aria-hidden="true" className="absolute inset-0 -rotate-3 rounded-sm bg-[#9c9e92]" />
      <div className="relative bg-[#f1eee5] px-6 py-7 text-[#222823] sm:px-8">
        <div className="flex justify-between border-b border-[#bfc1b5] pb-4 text-[10px] uppercase tracking-[.15em]"><span>Brief / Pracownia architektury</span><span>01</span></div>
        <p className="mb-5 mt-6 font-editorial text-3xl italic leading-tight sm:text-4xl">„Chcemy pokazać<br />nasz sposób myślenia”.</p>
        <div className="space-y-3 text-xs leading-relaxed"><p><span className="mr-3 text-[#7b7e72]">Oferta</span>Architektura i wnętrza</p><p><span className="mr-3 text-[#7b7e72]">Charakter</span>Spokój. Materiał. Światło.</p><p><span className="mr-3 text-[#7b7e72]">Cel</span>Rozmowy o nowych projektach</p></div>
      </div>
    </div>
    <p className="max-w-xs text-xs leading-relaxed text-[#b7bebc]">Wydobywamy to, co wyróżnia firmę.<br />To staje się podstawą projektu.</p>
  </div>
  if (stage === 1) return <div className="flex h-full flex-col justify-center">
    <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[.18em] text-[#b7bebc]"><span>Oferta nabiera formy</span><span>Projekt strony</span></div>
    <div className="overflow-hidden rounded-sm bg-[#edece4] text-[#222823] shadow-[0_24px_55px_-24px_#000]">
      <div className="flex items-center justify-between px-5 py-4"><span className="text-base font-semibold tracking-[.22em]">FORMA</span><span className="text-[9px] uppercase tracking-widest">Architektura · Wnętrza</span></div>
      <div className="relative h-44 sm:h-48"><Image src="/redesign/scenario-architecture.webp" alt="Przykładowa architektura w projekcie strony pracowni" fill sizes="(max-width: 640px) 80vw, 600px" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" /><p className="absolute bottom-4 left-5 font-editorial text-3xl italic text-white sm:text-4xl">Przestrzeń do życia.</p></div>
      <div className="flex items-center justify-between gap-4 px-5 py-5"><p className="max-w-48 text-[11px] leading-relaxed">Tworzymy miejsca, w których chce się zostać.</p><span className="flex shrink-0 items-center gap-2 border-b border-[#222823] pb-1 text-[10px] font-semibold">Porozmawiajmy <ArrowUpRight className="size-3" /></span></div>
    </div>
    <p className="mt-4 text-xs text-[#b7bebc]">Jedna opowieść. Od pierwszego kadru po kontakt.</p>
  </div>
  return <div className="flex h-full flex-col justify-between text-[#f5f2ed]">
    <p className="text-[10px] uppercase tracking-[.22em] text-[#b7bebc]">Strona otwiera drzwi do rozmowy</p>
    <div>
      <div className="mb-5 flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-full border border-[#657369] text-[#c5d4b8]"><Check className="size-5" /></div><div><p className="font-editorial text-3xl italic">Nowa rozmowa.</p><p className="mt-1 text-xs text-[#b7bebc]">Zainteresowanie zamienia się w zapytanie.</p></div></div>
      <div className="rounded-sm bg-[#f1eee5] p-5 text-[#222823] sm:p-6">
        <div className="mb-5 flex items-center justify-between border-b border-[#d1d1c5] pb-4"><p className="flex items-center gap-2 text-xs font-semibold"><Mail className="size-4" />Zapytanie ze strony</p><span className="text-[9px] uppercase tracking-widest text-[#6c7165]">Formularz</span></div>
        <p className="mb-2 text-sm font-semibold">Projekt domu pod miastem</p><p className="text-sm leading-relaxed text-[#555d51]">Szukamy pracowni do projektu naszego domu. Bliskie jest nam Wasze podejście do światła i naturalnych materiałów.</p>
        <p className="mt-4 border-t border-[#d1d1c5] pt-4 text-xs text-[#555d51]">Czy możemy porozmawiać o współpracy?</p>
      </div>
    </div>
    <p className="text-xs leading-relaxed text-[#b7bebc]">Masz punkt wyjścia do kontaktu.<br />Klient wie, dlaczego wybrał właśnie Ciebie.</p>
  </div>
}
