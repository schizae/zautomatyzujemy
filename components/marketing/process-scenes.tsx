import { Check, CornerDownRight, Mail, Paperclip } from 'lucide-react'

interface ActProps { stage: 0 | 1 | 2 }

export function SupportAct({ stage }: ActProps) {
  if (stage === 0) return <IncomingMail />
  if (stage === 1) return <MailExtraction />
  return <PreparedTicket />
}

export function WorkflowAct({ stage }: ActProps) {
  if (stage === 0) return <LooseDocuments />
  if (stage === 1) return <ReconciledOrder />
  return <PreparedActions />
}

function IncomingMail() {
  return <div className="relative mx-auto flex min-h-[390px] max-w-lg items-center px-2 sm:px-5">
    <div aria-hidden="true" className="absolute inset-x-5 bottom-9 top-12 rotate-3 bg-[#a9a397] shadow-2xl" />
    <article className="relative w-full -rotate-1 bg-[#f4f0e7] px-5 py-6 text-[#252723] shadow-2xl sm:px-8">
      <div className="flex items-center justify-between border-b border-[#d5d0c5] pb-4">
        <span className="flex items-center gap-2 text-[10px] uppercase tracking-[.16em]"><Mail className="size-3.5" />Skrzynka odbiorcza</span>
        <span className="font-mono text-[10px] text-[#74746b]">09:41</span>
      </div>
      <p className="mt-5 text-[10px] text-[#74746b]">Od: klient@example.com</p>
      <h4 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">Klimatyzacja do biura</h4>
      <div className="mt-5 space-y-3 text-[13px] leading-relaxed">
        <p>Dzień dobry,</p>
        <p>proszę o ofertę montażu klimatyzacji w biurze o powierzchni <strong className="font-medium">80 m² w Krakowie</strong>.</p>
        <p>Zależy nam na realizacji <strong className="font-medium">w październiku</strong>. Jakie informacje będą potrzebne do wyceny?</p>
        <p className="text-[#74746b]">Pozdrawiam, Anna</p>
      </div>
      <div className="mt-5 flex items-center gap-2 border-t border-[#d5d0c5] pt-3 text-[10px] text-[#74746b]"><Paperclip className="size-3" />Bez załączników</div>
    </article>
  </div>
}

function MailExtraction() {
  return <div className="mx-auto flex min-h-[390px] max-w-lg flex-col justify-center px-3 py-4 sm:px-6">
    <p className="text-[10px] uppercase tracking-[.18em] text-[#b9b5ac]">Z wiadomości do konkretów</p>
    <p className="mt-5 font-editorial text-2xl leading-snug text-[#f4f0e7] sm:text-[28px]">
      „Proszę o <mark data-story-detail="0.36" className="bg-[#d9c7a1] px-1 text-[#252723]">ofertę montażu</mark> klimatyzacji w biurze <mark data-story-detail="0.36" className="bg-[#bfc9bd] px-1 text-[#252723]">80 m² w Krakowie</mark>. Realizacja <mark data-story-detail="0.36" className="bg-[#e3baa7] px-1 text-[#252723]">w październiku</mark>”.
    </p>
    <dl className="mt-7 text-xs">
      <div className="grid grid-cols-[6rem_1fr] gap-4 border-t border-white/15 py-3"><dt className="text-[#d9c7a1]">Intencja</dt><dd className="font-medium text-[#f4f0e7]">Prośba o wycenę</dd></div>
      <div className="grid grid-cols-[6rem_1fr] gap-4 border-t border-white/15 py-3"><dt className="text-[#bfc9bd]">Obiekt</dt><dd className="font-medium text-[#f4f0e7]">Biuro · 80 m² · Kraków</dd></div>
      <div className="grid grid-cols-[6rem_1fr] gap-4 border-y border-white/15 py-3"><dt className="text-[#e3baa7]">Termin</dt><dd className="font-medium text-[#f4f0e7]">Październik</dd></div>
    </dl>
    <p className="mt-4 flex items-center gap-2 text-[11px] text-[#b9b5ac]"><CornerDownRight className="size-3.5 shrink-0" />Do uzupełnienia: układ pomieszczeń.</p>
  </div>
}

function PreparedTicket() {
  return <div className="mx-auto flex min-h-[390px] max-w-lg items-center px-1 py-3 sm:px-4">
    <article className="w-full overflow-hidden bg-[#f4f0e7] text-[#252723] shadow-2xl">
      <div className="flex items-center justify-between gap-2 border-b border-[#d5d0c5] px-5 py-3 text-[10px]"><span className="font-mono text-[#74746b]">ZGŁOSZENIE / 024</span><span className="flex items-center gap-1.5 font-medium"><span className="size-1.5 rounded-full bg-[#788b70]" />Przypisane</span></div>
      <div className="px-5 py-5 sm:px-7">
        <h4 className="text-xl font-semibold tracking-tight">Wycena klimatyzacji</h4>
        <p className="mt-1 text-[11px] text-[#74746b]">Biuro 80 m² · Kraków · październik</p>
        <div className="mt-5 flex items-center justify-between border-b border-[#d5d0c5] pb-2 text-[10px] uppercase tracking-wider"><span>Szkic odpowiedzi</span><span className="text-[#74746b]">Niewysłany</span></div>
        <p className="mt-3 text-[13px] leading-relaxed">Dzień dobry, Pani Anno. Dziękujemy za zapytanie o montaż klimatyzacji w biurze w Krakowie. Aby przygotować wycenę, prosimy o rzut pomieszczeń i informację o liczbie osób pracujących w biurze.</p>
        <p className="mt-3 text-[13px] leading-relaxed">Dostępność terminu październikowego potwierdzi nasz zespół.</p>
      </div>
      <div className="flex items-center gap-3 bg-[#dedfd4] px-5 py-3 sm:px-7"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#c4c8b8] text-[10px] font-semibold">BO</span><div><p className="text-[11px] font-semibold">Do sprawdzenia przez człowieka</p><p className="mt-0.5 text-[10px] text-[#5b6252]">Biuro obsługi · przed wysłaniem</p></div></div>
    </article>
  </div>
}

function LooseDocuments() {
  return <div className="relative mx-auto min-h-[390px] max-w-lg px-4 pt-8 sm:px-8">
    <article className="relative ml-auto w-[82%] rotate-3 bg-[#d4d5c8] p-5 text-[#30362e] shadow-xl">
      <p className="text-[9px] uppercase tracking-[.16em]">E-mail · ustalenia</p><p className="mt-3 text-sm font-medium">Dostawa: 14 października</p><p className="mt-2 text-xs leading-relaxed">Prosimy o 12 krzeseł w kolorze grafitowym.</p>
    </article>
    <article className="relative -mt-3 mr-7 -rotate-3 bg-[#f4f0e7] p-5 text-[#252723] shadow-2xl sm:mr-12">
      <div className="flex items-start justify-between gap-2"><h4 className="text-xl font-semibold tracking-tight">Zamówienie</h4><span className="font-mono text-[10px] text-[#74746b]">018/10</span></div>
      <p className="mt-1 text-[10px] text-[#74746b]">Pracownia Północ · przykład</p>
      <div className="mt-5 flex justify-between border-y border-[#d5d0c5] py-3 text-xs"><span>Krzesło biurowe</span><span className="font-mono">12 szt.</span></div>
      <div className="mt-3 flex justify-between text-xs"><span className="text-[#74746b]">Wartość netto</span><strong className="font-medium">4 800 zł</strong></div>
      <p className="mt-4 font-editorial text-lg italic text-[#666959]">Potwierdzić kolor i transport.</p>
    </article>
    <div className="relative -mt-2 ml-auto mr-2 w-fit rotate-2 bg-[#dbc7a2] px-4 py-3 text-[#3c372e] shadow-lg"><p className="text-[9px] uppercase tracking-wider">Notatka z rozmowy</p><p className="mt-1 font-editorial text-lg italic">Kraków, odbiór do 15:00</p></div>
  </div>
}

function ReconciledOrder() {
  return <div className="mx-auto flex min-h-[390px] max-w-lg flex-col justify-center px-3 py-4 sm:px-6">
    <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[.16em] text-[#b9b5ac]">Trzy źródła. Jedno zamówienie.</p><h4 className="mt-3 font-editorial text-3xl text-[#f4f0e7]">Wszystko się zgadza.</h4></div><span className="pb-1 font-mono text-xs text-[#bfc9bd]">018/10</span></div>
    <table className="mt-6 w-full table-fixed text-left text-[11px] text-[#f4f0e7]">
      <thead><tr className="border-b border-white/20 text-[9px] uppercase tracking-wider text-[#b9b5ac]"><th className="w-[31%] pb-3 font-normal">Pole</th><th className="w-[44%] pb-3 font-normal">Odczytana wartość</th><th className="pb-3 text-right font-normal">Źródło</th></tr></thead>
      <tbody>
        {[
          ['Produkt', '12 krzeseł · grafit', 'E-mail'],
          ['Kwota netto', '4 800 zł', 'Dokument'],
          ['Dostawa', '14 października', 'E-mail'],
          ['Miejsce', 'Kraków, do 15:00', 'Notatka'],
        ].map(([field, value, source], index) => <tr data-story-detail={.36 + index * .045} key={field} className="border-b border-white/10"><td className="py-4 text-[#b9b5ac]">{field}</td><td className="py-4 font-medium">{value}</td><td className="py-4 text-right text-[10px] text-[#bfc9bd]">{source}</td></tr>)}
      </tbody>
    </table>
    <p className="mt-5 flex items-center gap-2 text-[11px] text-[#bfc9bd]"><Check className="size-3.5" />Dane połączone, bez ponownego przepisywania.</p>
  </div>
}

function PreparedActions() {
  return <div className="mx-auto flex min-h-[390px] max-w-lg items-center px-1 py-3 sm:px-4">
    <article className="w-full bg-[#f4f0e7] text-[#252723] shadow-2xl">
      <div className="flex items-center justify-between bg-[#d4d5c8] px-5 py-3 text-[10px] uppercase tracking-wider"><span>Plan realizacji</span><span className="font-mono">018/10</span></div>
      <div className="px-5 py-5 sm:px-7">
        <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] text-[#74746b]">Pracownia Północ</p><h4 className="mt-1 text-xl font-semibold tracking-tight">Dostawa 12 krzeseł</h4></div><div className="text-right"><p className="font-editorial text-3xl leading-none">14</p><p className="mt-1 text-[9px] uppercase">października</p></div></div>
        <ol className="mt-5 divide-y divide-[#d5d0c5] border-y border-[#d5d0c5]">
          {[
            ['01', 'Sprawdzić dostępność', 'Magazyn · 12 szt., kolor grafit'],
            ['02', 'Zarezerwować transport', 'Logistyka · Kraków, przed 15:00'],
            ['03', 'Potwierdzić zamówienie', 'Obsługa · szkic wiadomości gotowy'],
          ].map(([number, title, detail], index) => <li data-story-detail={.69 + index * .045} key={number} className="flex gap-3 py-3"><span className="pt-0.5 font-mono text-[10px] text-[#8b8c80]">{number}</span><div><p className="text-xs font-semibold">{title}</p><p className="mt-1 text-[10px] text-[#74746b]">{detail}</p></div></li>)}
        </ol>
        <div className="mt-4 flex items-center gap-2 text-[10px] text-[#5b6252]"><Check className="size-3.5 shrink-0" /><span>3 zadania przygotowane do zatwierdzenia</span></div>
      </div>
    </article>
  </div>
}
