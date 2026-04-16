import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Manrope, Inter } from 'next/font/google'
import '@/app/globals.css'
import { Providers } from '@/app/_components/providers'
import { CookieBanner } from '@/components/marketing/cookie-banner'

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

const SITE_URL =
  process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://zautomatyzujemy.pl'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Zautomatyzujemy.pl — AI i automatyzacja dla firm',
    template: '%s | Zautomatyzujemy.pl',
  },
  description:
    'Wdrażamy AI i automatyzacje, które oszczędzają czas, redukują koszty i skalują Twój biznes. Chatboty, integracje n8n, RAG.',
  keywords: [
    'automatyzacja',
    'AI',
    'sztuczna inteligencja',
    'chatbot',
    'n8n',
    'LLM',
    'automatyzacja procesów',
    'integracje API',
    'RAG',
    'transformacja cyfrowa',
  ],
  authors: [{ name: 'Zautomatyzujemy.pl' }],
  creator: 'Zautomatyzujemy.pl',
  publisher: 'Zautomatyzujemy.pl',
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: SITE_URL,
    siteName: 'Zautomatyzujemy.pl',
    title: 'Zautomatyzujemy.pl — AI i automatyzacja dla firm',
    description:
      'Wdrażamy AI i automatyzacje, które oszczędzają czas, redukują koszty i skalują Twój biznes.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zautomatyzujemy.pl — AI i automatyzacja dla firm',
    description:
      'Wdrażamy AI i automatyzacje, które oszczędzają czas, redukują koszty i skalują Twój biznes.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#121412' },
  ],
  width: 'device-width',
  initialScale: 1,
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
      <body className="font-body antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:rounded-lg focus:bg-[#70e5ea] focus:px-4 focus:py-2 focus:text-[#003739] focus:font-bold focus:text-sm"
        >
          Przejdź do treści
        </a>
        <Providers>{children}</Providers>
        <CookieBanner />
      </body>
    </html>
  )
}
