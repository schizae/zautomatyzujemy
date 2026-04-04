import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0d0f0d] px-6 text-center">
      <div className="mx-auto max-w-md">
        <p className="text-8xl font-headline font-black text-[#70e5ea]">404</p>
        <h1 className="mt-4 text-2xl font-headline font-bold text-[#e2e3df]">
          Strona nie znaleziona
        </h1>
        <p className="mt-3 text-[#bcc9c9] leading-relaxed">
          Przepraszamy, ale strona której szukasz nie istnieje lub została przeniesiona.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-full bg-[#70e5ea] px-6 py-3 text-sm font-semibold text-[#003739] transition-all hover:brightness-110 hover:-translate-y-0.5"
          >
            Strona główna
          </Link>
          <Link
            href="/blog"
            className="rounded-full border border-[#3d4949]/50 px-6 py-3 text-sm font-semibold text-[#bcc9c9] transition-all hover:border-[#70e5ea]/50 hover:text-[#70e5ea]"
          >
            Blog
          </Link>
        </div>
      </div>
    </main>
  )
}
