import type { Metadata } from 'next'
import Link from 'next/link'
import { MailX, CircleCheck, TriangleAlert } from 'lucide-react'
import { unsubscribeNewsletterAction } from '@/lib/actions/newsletter.actions'

export const metadata: Metadata = {
  title: 'Wypisz się z newslettera',
  description: 'Rezygnacja z otrzymywania newslettera Zautomatyzujemy.pl.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/newsletter/wypisz' },
}

interface PageProps {
  searchParams: Promise<{ token?: string; status?: string }>
}

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const { token, status } = await searchParams

  return (
    <main className="min-h-screen bg-[#0d0f0d] text-[#e2e3df] flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-lg rounded-2xl border border-[#3d4949]/30 bg-[#111311] p-8 md:p-10 text-center">

        {status === 'ok' ? (
          <>
            <div className="w-14 h-14 rounded-full bg-[#7bc87b]/10 border border-[#7bc87b]/30 flex items-center justify-center mx-auto mb-6">
              <CircleCheck className="text-[#7bc87b]" size={26} />
            </div>
            <h1 className="text-2xl font-headline font-bold mb-3">Wypisano</h1>
            <p className="text-[#bcc9c9] font-body leading-relaxed">
              Nie będziesz już otrzymywać naszego newslettera. Możesz zapisać się ponownie
              w każdej chwili — bez urazy.
            </p>
          </>
        ) : status === 'blad' || !token ? (
          <>
            <div className="w-14 h-14 rounded-full bg-[#ffa07b]/10 border border-[#ffa07b]/30 flex items-center justify-center mx-auto mb-6">
              <TriangleAlert className="text-[#ffa07b]" size={26} />
            </div>
            <h1 className="text-2xl font-headline font-bold mb-3">
              Link jest nieprawidłowy
            </h1>
            <p className="text-[#bcc9c9] font-body leading-relaxed">
              Ten link do wypisu wygasł albo jest niekompletny. Napisz na{' '}
              <a
                href="mailto:n.chojnacki1993@gmail.com"
                className="text-[#70e5ea] hover:underline"
              >
                n.chojnacki1993@gmail.com
              </a>
              , a wypiszemy Cię ręcznie.
            </p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-[#1a1c1a] border border-[#3d4949]/40 flex items-center justify-center mx-auto mb-6">
              <MailX className="text-[#bcc9c9]" size={26} />
            </div>
            <h1 className="text-2xl font-headline font-bold mb-3">
              Wypisać Cię z newslettera?
            </h1>
            <p className="text-[#bcc9c9] font-body leading-relaxed mb-8">
              Przestaniemy wysyłać Ci treści o AI, automatyzacji i zmianach w przepisach.
            </p>
            <form action={unsubscribeNewsletterAction}>
              <input type="hidden" name="token" value={token} />
              <button
                type="submit"
                className="w-full px-6 py-3.5 rounded-xl bg-[#ffa07b] text-[#1a0a00] font-headline font-bold text-base hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffa07b]/40 active:scale-[0.99] transition-all"
              >
                Tak, wypisz mnie
              </button>
            </form>
          </>
        )}

        <Link
          href="/"
          className="inline-block mt-8 text-sm text-[#5a6464] hover:text-[#70e5ea] transition-colors font-body"
        >
          ← Powrót na stronę główną
        </Link>
      </div>
    </main>
  )
}
