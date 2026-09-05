'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useActionState } from 'react'
import { subscribeLeadMagnetAction } from '@/lib/actions/contact.actions'
import { NEWSLETTER_CONSENT_TEXT } from '@/lib/newsletter-consent'
import { CheckCircle2, Loader2 } from 'lucide-react'
import type { ActionResult } from '@/types'

const initialState: ActionResult = { success: false, error: '' }

export function LeadMagnetSection() {
  const [state, formAction, isPending] = useActionState(subscribeLeadMagnetAction, initialState)

  return (
    <section id="checklista" className="mx-auto grid max-w-[1600px] items-center gap-10 px-6 py-20 md:px-8 lg:min-h-[820px] lg:grid-cols-[1fr_0.95fr_1fr]">
      <div>
        <p className="mb-10 text-xs uppercase tracking-[0.2em]"><span className="text-[#f34c30]">03 /</span> Wiedza i przygotowanie</p>
        <h2 className="font-body text-4xl font-extrabold leading-[1.04] tracking-[-0.05em] xl:text-6xl">Dobre decyzje<br />zaczynają się<br />od <span className="font-editorial text-[#f34c30] font-normal italic">wiedzy.</span></h2>
        <p className="my-8 text-xl leading-relaxed">Szkolenia z AI, audyty procesów i konkretne wskazówki dla Twojej firmy.</p>
        <div className="mt-10 border-t border-[#c7c3bb] pt-5 text-lg"><Link href="/#uslugi" className="block border-b border-[#c7c3bb] py-4">Poznaj szkolenia →</Link><Link href="/#kontakt" className="block border-b border-[#c7c3bb] py-4">Sprawdź zakres audytu →</Link></div>
      </div>
      <Image src="/redesign/checklist-book.webp" alt="AI Act — checklista dla MŚP, bezpłatny materiał" width={700} height={1050} sizes="(min-width: 1024px) 30vw, 70vw" className="mx-auto w-full max-w-sm rounded-md mix-blend-multiply" />
      <div className="min-w-0">
        <span className="mb-6 inline-block bg-[#e84324] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white">Bezpłatny PDF</span>
              {state.success ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#c93820]/10 border border-[#c93820]/30 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-[#c93820]" size={28} />
                  </div>
                  <h3 className="text-3xl xl:text-4xl font-body font-bold tracking-tight text-[#151719] mb-3">
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
                  <h3 className="text-3xl xl:text-4xl font-body font-bold tracking-tight text-[#151719] mb-3">
                    Zacznij od checklisty.
                  </h3>
                  <p className="text-[#686862] font-body text-lg mb-8">
                    Otrzymaj checklistę AI Act na swój adres e-mail.
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
                        className="h-14 w-full bg-transparent border border-[#c7c3bb]/30 rounded-xl px-4 py-3 text-[#151719] text-sm font-body placeholder:text-[#686862] outline-none focus:border-[#c93820]/50 focus:ring-2 focus:ring-[#c93820]/10 transition-colors"
                      />
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="newsletterConsent"
                        value="true"
                        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[#c7c3bb] bg-[#ffffff] accent-[#c93820] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c93820]/40"
                      />
                      <span className="text-[#686862] text-sm font-body leading-relaxed group-hover:text-[#151719] transition-colors">
                        {NEWSLETTER_CONSENT_TEXT}
                      </span>
                    </label>

                    {!state.success && state.error && (
                      <p className="text-red-400 text-sm font-body">{state.error}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={isPending}
                      className="w-full flex items-center justify-center gap-2 h-auto px-6 py-5 rounded-md bg-[#e84324] text-[#ffffff] font-headline font-bold text-base hover:brightness-110 transition-all disabled:opacity-60 shadow-lg"
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
    </section>
  )
}
