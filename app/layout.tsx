import type { Metadata } from 'next'
import { Space_Grotesk, Manrope, Inter } from 'next/font/google'
import '@/app/globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-label',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Zautomatyzujemy.pl — Agencja Automatyzacji AI',
    template: '%s | Zautomatyzujemy.pl',
  },
  description:
    'Wdrażamy AI i automatyzacje, które oszczędzają czas, redukują koszty i skalują Twój biznes. Chatboty, integracje n8n, RAG.',
  metadataBase: new URL(
    process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000'
  ),
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    siteName: 'Zautomatyzujemy.pl',
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="pl"
      className={`dark ${spaceGrotesk.variable} ${manrope.variable} ${inter.variable}`}
    >
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
