import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Regulamin',
  description: 'Regulamin świadczenia usług serwisu zautomatyzujemy.pl.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/regulamin' },
}

export default function RegulaPage() {
  return (
    <main className="min-h-screen bg-[#0d0f0d] text-[#e2e3df]">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <Link
          href="/"
          className="text-sm text-[#70e5ea] hover:underline font-label uppercase tracking-widest mb-8 inline-block"
        >
          &larr; Powrót do strony głównej
        </Link>

        <h1 className="text-4xl font-headline font-bold tracking-tight mb-4">
          Regulamin
        </h1>
        <p className="text-[#bcc9c9] mb-12">
          Ostatnia aktualizacja: 16 kwietnia 2026
        </p>

        <div className="space-y-10 text-[#bcc9c9] leading-7">

          <section>
            <h2 className="text-xl font-headline font-semibold text-[#e2e3df] mb-3">
              1. Postanowienia ogólne
            </h2>
            <p>
              Niniejszy regulamin (dalej: &ldquo;Regulamin&rdquo;) określa zasady korzystania
              z serwisu internetowego dostępnego pod adresem{' '}
              <span className="text-[#70e5ea]">zautomatyzujemy.pl</span> (dalej:
              &ldquo;Serwis&rdquo;), prowadzonego przez Zautomatyzujemy.pl (dalej:
              &ldquo;Usługodawca&rdquo;).
            </p>
            <p className="mt-3">
              Korzystanie z Serwisu oznacza akceptację niniejszego Regulaminu
              w jego aktualnym brzmieniu.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-semibold text-[#e2e3df] mb-3">
              2. Usługi świadczone przez Serwis
            </h2>
            <p>Serwis umożliwia:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>zapoznanie się z ofertą usług automatyzacji i wdrożeń AI,</li>
              <li>kontakt z Usługodawcą za pośrednictwem formularza kontaktowego,</li>
              <li>korzystanie z chatbota AI opartego na technologii RAG,</li>
              <li>czytanie artykułów na blogu dotyczących automatyzacji i sztucznej inteligencji,</li>
              <li>pobranie bezpłatnych materiałów edukacyjnych (lead magnet).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-headline font-semibold text-[#e2e3df] mb-3">
              3. Warunki korzystania
            </h2>
            <p>Użytkownik zobowiązuje się do:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>korzystania z Serwisu zgodnie z obowiązującym prawem oraz dobrymi obyczajami,</li>
              <li>niepodejmowania działań mogących zakłócić prawidłowe funkcjonowanie Serwisu,</li>
              <li>
                niepodawania fałszywych lub cudzych danych osobowych w formularzach
                kontaktowych,
              </li>
              <li>
                nieużywania chatbota AI do generowania treści niezgodnych z prawem,
                obraźliwych lub szkodliwych.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-headline font-semibold text-[#e2e3df] mb-3">
              4. Chatbot AI — ograniczenia odpowiedzialności
            </h2>
            <p>
              Chatbot AI dostępny w Serwisie generuje odpowiedzi na podstawie bazy
              wiedzy Usługodawcy oraz modelu językowego (Google Gemini). Odpowiedzi
              mają charakter informacyjny i pomocniczy.
            </p>
            <p className="mt-3">
              Usługodawca nie ponosi odpowiedzialności za decyzje podjęte wyłącznie
              na podstawie odpowiedzi chatbota. W sprawach istotnych biznesowo
              rekomendujemy kontakt bezpośredni.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-semibold text-[#e2e3df] mb-3">
              5. Własność intelektualna
            </h2>
            <p>
              Wszelkie treści opublikowane w Serwisie — teksty, grafiki, logotypy,
              kod źródłowy — są własnością Usługodawcy lub podmiotów współpracujących
              i podlegają ochronie prawnej.
            </p>
            <p className="mt-3">
              Zabrania się kopiowania, rozpowszechniania lub modyfikowania treści
              Serwisu bez pisemnej zgody Usługodawcy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-semibold text-[#e2e3df] mb-3">
              6. Ochrona danych osobowych
            </h2>
            <p>
              Zasady przetwarzania danych osobowych opisane są w{' '}
              <Link href="/privacy-policy" className="text-[#70e5ea] hover:underline">
                Polityce Prywatności
              </Link>
              , która stanowi integralną część niniejszego Regulaminu.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-semibold text-[#e2e3df] mb-3">
              7. Dostępność Serwisu
            </h2>
            <p>
              Usługodawca dąży do zapewnienia ciągłości działania Serwisu, jednak
              zastrzega sobie prawo do przerw technicznych niezbędnych do utrzymania
              i rozbudowy infrastruktury. Usługodawca nie ponosi odpowiedzialności
              za przerwy w działaniu Serwisu wynikające z przyczyn zewnętrznych
              (awarie sieci, hostingu itp.).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-semibold text-[#e2e3df] mb-3">
              8. Zmiany Regulaminu
            </h2>
            <p>
              Usługodawca zastrzega sobie prawo do zmiany niniejszego Regulaminu
              w dowolnym czasie. Zmiany wchodzą w życie z chwilą opublikowania
              zaktualizowanej wersji na stronie Serwisu. Dalsze korzystanie z Serwisu
              po wprowadzeniu zmian oznacza ich akceptację.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-semibold text-[#e2e3df] mb-3">
              9. Prawo właściwe i sąd właściwy
            </h2>
            <p>
              Regulamin podlega prawu polskiemu. Wszelkie spory wynikające z korzystania
              z Serwisu będą rozstrzygane przez sąd właściwy dla siedziby Usługodawcy,
              o ile bezwzględnie obowiązujące przepisy nie stanowią inaczej.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-semibold text-[#e2e3df] mb-3">
              10. Kontakt
            </h2>
            <p>
              W sprawach związanych z Regulaminem prosimy o kontakt pod adresem:{' '}
              <span className="text-[#70e5ea]">kontakt@zautomatyzujemy.pl</span>
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
