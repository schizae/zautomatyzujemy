import type { Metadata } from 'next'
import { Inter, Geist } from 'next/font/google'
import '@/app/globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
    <html lang="pl" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
