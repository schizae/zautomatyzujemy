'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { subscribeLeadMagnetAction } from '@/lib/actions/contact.actions'
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
    <section className="py-24 px-6 md:px-8 bg-gradient-to-b from-[#0d0f0d] to-[#121412]">
      <div className="max-w-screen-2xl mx-auto">
        <div className="rounded-[2.5rem] border border-[#ffa07b]/20 bg-gradient-to-br from-[#1a1208] via-[#1a1c1a] to-[#121412] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* LEFT — info */}
            <div className="p-10 md:p-14 border-b lg:border-b-0 lg:border-r border-[#ffa07b]/10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffa07b]/10 border border-[#ffa07b]/20 mb-8">
                <Shield size={13} className="text-[#ffa07b]" />
                <span className="text-xs font-label uppercase tracking-widest text-[#ffa07b]">Bezpłatny PDF</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-headline font-bold text-[#e2e3df] mb-4 leading-tight">
                Checklista:{' '}
                <span className="text-[#ffa07b]">Zgodność z AI Act</span>
                {' '}dla MŚP
              </h2>
              <p className="text-[#bcc9c9] font-body text-base leading-relaxed mb-10">
                Praktyczny przewodnik dla małych i średnich firm. Bez prawniczego żargonu —
                konkretne kroki, które musisz podjąć przed 2 sierpnia 2026.
              </p>

              <ul className="space-y-3">
                {checklistItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="text-[#ffa07b] shrink-0 mt-0.5" size={16} />
                    <span className="text-[#bcc9c9] text-sm font-body">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT — form */}
            <div className="p-10 md:p-14 flex flex-col justify-center">
              {state.success ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#ffa07b]/10 border border-[#ffa07b]/30 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-[#ffa07b]" size={28} />
                  </div>
                  <h3 className="text-2xl font-headline font-bold text-[#e2e3df] mb-3">
                    Sprawdź skrzynkę!
                  </h3>
                  <p className="text-[#bcc9c9] font-body text-base leading-relaxed mb-4">
                    Wysłałem Ci email z linkiem do checklisty. Możesz też otworzyć ją od razu:
                  </p>
                  <Link
                    href="/ai-act-checklist"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#ffa07b]/30 text-[#ffa07b] text-sm font-label hover:bg-[#ffa07b]/10 transition-colors mb-6"
                  >
                    Otwórz checklistę →
                  </Link>
                  <p className="text-[#5a6464] font-body text-sm">
                    Możesz też od razu umówić{' '}
                    <Link href="/#kontakt" className="text-[#70e5ea] hover:underline">
                      bezpłatną konsultację
                    </Link>.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-headline font-bold text-[#e2e3df] mb-3">
                    Pobierz bezpłatnie
                  </h3>
                  <p className="text-[#bcc9c9] font-body text-sm mb-8">
                    Podaj swój adres email — link do checklisty dostaniesz natychmiast.
                    Bez spamu, bez automatycznych sekwencji.
                  </p>

                  <form action={formAction} className="space-y-4">
                    {/* Honeypot — ukryte przed ludźmi, widoczne dla botów */}
                    <div aria-hidden="true" className="hidden">
                      <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                    </div>

                    <div>
                      <label htmlFor="lm-email" className="block text-xs font-label uppercase tracking-wider text-[#bcc9c9] mb-2">
                        Adres e-mail
                      </label>
                      <input
                        id="lm-email"
                        name="email"
                        type="email"
                        required
                        placeholder="twoj@email.pl"
                        className="w-full bg-[#1a1c1a] border border-[#3d4949]/30 rounded-xl px-4 py-3 text-[#e2e3df] text-sm font-body placeholder:text-[#5a6464] outline-none focus:border-[#ffa07b]/50 focus:ring-2 focus:ring-[#ffa07b]/10 transition-colors"
                      />
                    </div>

                    {!state.success && state.error && (
                      <p className="text-red-400 text-sm font-body">{state.error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#ffa07b] text-[#1a0a00] font-headline font-bold text-base hover:brightness-110 transition-all disabled:opacity-60 shadow-lg"
                    >
                      {isPending ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Wysyłam…
                        </>
                      ) : (
                        'Wyślij mi checklistę →'
                      )}
                    </button>

                    <p className="text-[#5a6464] text-xs font-body text-center">
                      Twój email nie trafi do żadnej bazy marketingowej.
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
