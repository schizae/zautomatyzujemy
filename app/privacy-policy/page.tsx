import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Polityka Prywatności',
  description: 'Polityka prywatności serwisu zautomatyzujemy.pl — informacje o przetwarzaniu danych osobowych zgodnie z RODO.',
}

export default function PrivacyPolicyPage() {
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
          Polityka Prywatności
        </h1>
        <p className="text-[#bcc9c9] mb-12">
          Ostatnia aktualizacja: 3 kwietnia 2026
        </p>

        <div className="space-y-10 text-[#bcc9c9] leading-7">
          <section>
            <h2 className="text-xl font-headline font-semibold text-[#e2e3df] mb-3">
              1. Administrator danych
            </h2>
            <p>
              Administratorem Twoich danych osobowych jest Zautomatyzujemy.pl
              (dalej: &ldquo;Administrator&rdquo;). W sprawach dotyczących ochrony danych
              osobowych możesz skontaktować się z nami pod adresem e-mail:
              <span className="text-[#70e5ea]"> kontakt@zautomatyzujemy.pl</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-semibold text-[#e2e3df] mb-3">
              2. Jakie dane zbieramy
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-[#e2e3df]">Formularz kontaktowy:</strong> imię
                i nazwisko, adres e-mail, treść wiadomości, wybrany cel współpracy.
              </li>
              <li>
                <strong className="text-[#e2e3df]">Chatbot:</strong> adres e-mail
                (jeśli podany dobrowolnie), treść rozmowy z asystentem AI.
              </li>
              <li>
                <strong className="text-[#e2e3df]">Dane techniczne:</strong> adres IP,
                typ przeglądarki, czas wizyty — zbierane automatycznie w celach
                bezpieczeństwa i analityki.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-headline font-semibold text-[#e2e3df] mb-3">
              3. Cel i podstawa przetwarzania
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-[#e2e3df]">Odpowiedź na zapytanie</strong> —
                art. 6 ust. 1 lit. b RODO (podjęcie działań na żądanie osoby przed
                zawarciem umowy).
              </li>
              <li>
                <strong className="text-[#e2e3df]">Obsługa chatbota AI</strong> —
                art. 6 ust. 1 lit. a RODO (zgoda wyrażona przez dobrowolne podanie
                danych).
              </li>
              <li>
                <strong className="text-[#e2e3df]">Bezpieczeństwo i analityka</strong> —
                art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes administratora).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-headline font-semibold text-[#e2e3df] mb-3">
              4. Odbiorcy danych
            </h2>
            <p>Twoje dane mogą być przekazywane:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong className="text-[#e2e3df]">Supabase Inc.</strong> — hosting bazy
                danych (serwery w EU).
              </li>
              <li>
                <strong className="text-[#e2e3df]">Google LLC</strong> — przetwarzanie
                zapytań AI (Gemini API) — na podstawie standardowych klauzul umownych.
              </li>
              <li>
                <strong className="text-[#e2e3df]">n8n GmbH</strong> — automatyzacja
                procesów biznesowych (webhook do obsługi leadów).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-headline font-semibold text-[#e2e3df] mb-3">
              5. Okres przechowywania
            </h2>
            <p>
              Dane z formularza kontaktowego i chatbota przechowujemy przez okres
              niezbędny do realizacji celu, nie dłużej niż 24 miesiące od ostatniego
              kontaktu. Dane techniczne (logi) przechowujemy maksymalnie 12 miesięcy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-semibold text-[#e2e3df] mb-3">
              6. Twoje prawa
            </h2>
            <p>Zgodnie z RODO przysługuje Ci prawo do:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>dostępu do swoich danych,</li>
              <li>sprostowania danych,</li>
              <li>usunięcia danych (&ldquo;prawo do bycia zapomnianym&rdquo;),</li>
              <li>ograniczenia przetwarzania,</li>
              <li>przenoszenia danych,</li>
              <li>sprzeciwu wobec przetwarzania,</li>
              <li>cofnięcia zgody w dowolnym momencie.</li>
            </ul>
            <p className="mt-3">
              Aby skorzystać z tych praw, napisz na:
              <span className="text-[#70e5ea]"> kontakt@zautomatyzujemy.pl</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-semibold text-[#e2e3df] mb-3">
              7. Pliki cookies
            </h2>
            <p>
              Strona wykorzystuje pliki cookies wyłącznie w celach technicznych
              (sesja administratora). Nie stosujemy cookies śledzących ani reklamowych.
              Możesz zarządzać plikami cookies w ustawieniach przeglądarki.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-semibold text-[#e2e3df] mb-3">
              8. Skarga do organu nadzorczego
            </h2>
            <p>
              Jeśli uważasz, że przetwarzanie Twoich danych narusza przepisy RODO,
              masz prawo złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych
              (PUODO), ul. Stawki 2, 00-193 Warszawa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-semibold text-[#e2e3df] mb-3">
              9. Zmiany polityki prywatności
            </h2>
            <p>
              Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszej
              polityce prywatności. O istotnych zmianach poinformujemy na stronie
              głównej serwisu.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
