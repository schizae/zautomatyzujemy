import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Manrope, Inter } from 'next/font/google'
import '@/app/globals.css'
import { Providers } from '@/app/_components/providers'
import { CookieBanner } from '@/components/marketing/cookie-banner'
import { Analytics } from '@vercel/analytics/next'

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

// Oba klucze są publiczne z definicji — trafiają do kodu strony.
// Renderujemy widget tylko wtedy, gdy są ustawione, żeby brak konfiguracji
// dawał brak przycisku, a nie przycisk, który po kliknięciu wyrzuca błąd.

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
  icons: {
    icon: [{ url: '/brand-icon.svg', type: 'image/svg+xml' }],
    apple: '/brand-apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: SITE_URL,
    siteName: 'Zautomatyzujemy.pl',
    title: 'Zautomatyzujemy.pl — AI i automatyzacja dla firm',
    description:
      'Wdrażamy AI i automatyzacje, które oszczędzają czas, redukują koszty i skalują Twój biznes.',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'Zautomatyzujemy.pl — AI i automatyzacja dla firm',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zautomatyzujemy.pl — AI i automatyzacja dla firm',
    description:
      'Wdrażamy AI i automatyzacje, które oszczędzają czas, redukują koszty i skalują Twój biznes.',
    images: [`${SITE_URL}/opengraph-image`],
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
  // Potwierdzenie własności domeny w Google Search Console — bez tego
  // konsola nie pokazuje zapytań ani nie przyjmuje zgłoszenia sitemapy
  verification: {
    google: 'PHlAs0l2ULVg1abJnn9xI5e0l4RTwb7vl1Mo6DEEpEc',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f2ed' },
    { media: '(prefers-color-scheme: dark)', color: '#151719' },
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
      className={`dark motion-reduce:!scroll-auto ${spaceGrotesk.variable} ${manrope.variable} ${inter.variable}`}
    >
      <body className="font-body antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:rounded-lg focus:bg-[#c93820] focus:px-4 focus:py-2 focus:text-white focus:font-bold focus:text-sm"
        >
          Przejdź do treści
        </a>
        <Providers>{children}</Providers>
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  )
}
