'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useActionState } from 'react'
import { subscribeLeadMagnetAction } from '@/lib/actions/contact.actions'
import { NEWSLETTER_CONSENT_TEXT } from '@/lib/newsletter-consent'
import { Shield, CheckCircle2, Loader2 } from 'lucide-react'
import type { ActionResult } from '@/types'

const initialState: ActionResult = { success: false, error: '' }

const checklistItems = [
  'Klasyfikacja systemów AI według poziomu ryzyka',
  'Obowiązki dla firm korzystających z AI (nawet ChatGPT)',
  'Lista wymaganych dokumentów i polityk',
  'Wymagania szkoleniowe dla pracowników (AI literacy)',
  'Terminy wejścia w życie poszczególnych przepisów',
  'Plan działania krok po kroku dla MŚP',
]

export function LeadMagnetSection() {
  const [state, formAction, isPending] = useActionState(subscribeLeadMagnetAction, initialState)

  return (
    <section id="checklista" className="py-24 px-6 md:px-8 bg-gradient-to-b from-[#f5f2ed] to-[#f5f2ed]">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl border border-[#c93820]/20 bg-gradient-to-br from-[#eeebe5] via-[#ffffff] to-[#f5f2ed] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* LEFT — info */}
            <div className="p-10 md:p-14 border-b lg:border-b-0 lg:border-r border-[#c93820]/10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c93820]/10 border border-[#c93820]/20 mb-8">
                <Shield size={13} className="text-[#c93820]" />
                <span className="text-xs font-label uppercase tracking-widest text-[#c93820]">Bezpłatny PDF</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-headline font-bold text-[#151719] mb-4 leading-tight">
                Checklista:{' '}
                <span className="text-[#c93820]">Zgodność z AI Act</span>
                {' '}dla MŚP
              </h2>
              <p className="text-[#686862] font-body text-base leading-relaxed mb-10">
                Zacznij od uporządkowania wiedzy. Praktyczna checklista pomoże Ci przyjrzeć się wykorzystaniu AI w Twojej firmie.
              </p>

              <ul className="space-y-3">
                {checklistItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="text-[#c93820] shrink-0 mt-0.5" size={16} />
                    <span className="text-[#686862] text-sm font-body">{item}</span>
                  </li>
                ))}
              </ul><div className="mt-8 flex flex-wrap gap-4 text-sm text-[#c93820]"><Link href="/#uslugi" className="underline underline-offset-4">Szkolenia AI</Link><Link href="/#kontakt" className="underline underline-offset-4">Porozmawiaj o audycie</Link></div>
            </div>

            {/* RIGHT — form */}
            <div className="p-10 md:p-14 flex flex-col justify-center">
              {state.success ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#c93820]/10 border border-[#c93820]/30 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-[#c93820]" size={28} />
                  </div>
                  <h3 className="text-2xl font-headline font-bold text-[#151719] mb-3">
                    Sprawdź skrzynkę!
                  </h3>
                  <p className="text-[#686862] font-body text-base leading-relaxed mb-4">
                    Wysłałem Ci email z linkiem do checklisty. Możesz też otworzyć ją od razu:
                  </p>
                  <Link
                    href="/ai-act-checklist"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#c93820]/30 text-[#c93820] text-sm font-label hover:bg-[#c93820]/10 transition-colors mb-6"
                  >
                    Otwórz checklistę →
                  </Link>
                  <p className="text-[#686862] font-body text-sm">
                    Możesz też od razu umówić{' '}
                    <Link href="/#kontakt" className="text-[#c93820] hover:underline">
                      bezpłatną konsultację
                    </Link>.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-headline font-bold text-[#151719] mb-3">
                    Pobierz bezpłatnie
                  </h3>
                  <p className="text-[#686862] font-body text-sm mb-8">
                    Podaj swój adres email — link do checklisty dostaniesz natychmiast.
                    Sama checklista jest bezwarunkowa, newsletter to osobna decyzja.
                  </p>

                  <form action={formAction} className="space-y-4">
                    {/* Honeypot — ukryte przed ludźmi, widoczne dla botów */}
                    <div aria-hidden="true" className="hidden">
                      <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                    </div>

                    <div>
                      <label htmlFor="lm-email" className="block text-xs font-label uppercase tracking-wider text-[#686862] mb-2">
                        Adres e-mail
                      </label>
                      <Input
                        id="lm-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="twoj@email.pl"
                        className="w-full bg-[#ffffff] border border-[#c7c3bb]/30 rounded-xl px-4 py-3 text-[#151719] text-sm font-body placeholder:text-[#686862] outline-none focus:border-[#c93820]/50 focus:ring-2 focus:ring-[#c93820]/10 transition-colors"
                      />
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="newsletterConsent"
                        value="true"
                        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[#c7c3bb] bg-[#ffffff] accent-[#c93820] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c93820]/40"
                      />
                      <span className="text-[#686862] text-xs font-body leading-relaxed group-hover:text-[#151719] transition-colors">
                        {NEWSLETTER_CONSENT_TEXT}
                      </span>
                    </label>

                    {!state.success && state.error && (
                      <p className="text-red-400 text-sm font-body">{state.error}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={isPending}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#c93820] text-[#ffffff] font-headline font-bold text-base hover:brightness-110 transition-all disabled:opacity-60 shadow-lg"
                    >
                      {isPending ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Wysyłam…
                        </>
                      ) : (
                        'Wyślij mi checklistę →'
                      )}
                    </Button>

                    <p className="text-[#686862] text-xs font-body text-center leading-relaxed">
                      Bez zaznaczonej zgody użyjemy Twojego adresu wyłącznie do wysłania
                      checklisty. Zasady opisuje{' '}
                      <Link href="/privacy-policy" className="text-[#c93820] hover:underline">
                        polityka prywatności
                      </Link>.
                    </p>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
