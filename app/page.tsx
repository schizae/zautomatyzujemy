import type { Metadata } from 'next'
import { ChatWidget } from '@/components/chat/chat-widget'
import { Navbar } from '@/components/marketing/navbar'
import { HeroSection } from '@/components/marketing/hero-section'
import { SmoothScroll } from '@/components/marketing/smooth-scroll'
import { ServicesSection } from '@/components/marketing/services-section'
import { AboutSection } from '@/components/marketing/about-section'
import { LeadMagnetSection } from '@/components/marketing/lead-magnet-section'
import { BlogPreview } from '@/components/marketing/blog-preview'
import { RoiCalculator } from '@/components/marketing/roi-calculator'
import { FaqSection } from '@/components/marketing/faq-section'
import { ContactSection } from '@/components/marketing/contact-section'
import { Footer } from '@/components/marketing/footer'
import { JsonLd } from '@/components/seo/json-ld'
import { createServiceClient } from '@/lib/supabase/server'
import type { FaqItem } from '@/types'

async function getHeroContent(): Promise<Record<string, string>> {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

  if (!supabaseUrl || !supabaseAnonKey) return {}

  const keys = 'hero_title,hero_description,hero_cta_primary,hero_cta_secondary'

  const res = await fetch(
    `${supabaseUrl}/rest/v1/page_content?select=key,value&key=in.(${keys})`,
    {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      next: { revalidate: 3600 },
    }
  )

  if (!res.ok) return {}

  const data: { key: string; value: string }[] = await res.json()
  return Object.fromEntries(data.map(item => [item.key, item.value]))
}

const SITE_URL =
  process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://zautomatyzujemy.pl'

export const metadata: Metadata = {
  title: 'Automatyzacja AI dla firm | Zautomatyzujemy.pl',
  description:
    'Automatyzuję procesy i wdrażam AI w małych i średnich firmach. Chatboty, n8n, zgodność z AI Act. Bezpłatna konsultacja.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Automatyzacja AI dla firm | Zautomatyzujemy.pl',
    description:
      'Automatyzuję procesy i wdrażam AI w małych i średnich firmach. Chatboty, integracje n8n, zgodność z AI Act. Bezpłatna konsultacja.',
    url: SITE_URL,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'Zautomatyzujemy.pl — AI i automatyzacja dla Twojej firmy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export default async function HomePage() {
  const heroContent = await getHeroContent()

  const supabase = createServiceClient()
  const { data: faqData } = await supabase
    .from('faq_items')
    .select('question, answer')
    .eq('is_active', true)
    .order('sort_order')

  const faqItems = (faqData ?? []) as Pick<FaqItem, 'question' | 'answer'>[]

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Zautomatyzujemy.pl',
          url: SITE_URL,
          description:
            'Automatyzacja procesów z AI — chatboty, integracje n8n, RAG i wdrożenia LLM.',
          sameAs: [],
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Zautomatyzujemy.pl',
          url: SITE_URL,
          description:
            'Wdrażamy AI i automatyzacje, które oszczędzają czas, redukują koszty i skalują Twój biznes.',
          inLanguage: 'pl-PL',
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'Zautomatyzujemy.pl',
          url: SITE_URL,
          telephone: '+48730094465',
          email: 'n.chojnacki1993@gmail.com',
          description:
            'Automatyzacja procesów z AI — chatboty, integracje n8n, RAG i wdrożenia LLM dla małych i średnich firm.',
          // Bez ulicy i współrzędnych — działalność prowadzona z domu, wizytówka
          // Google w trybie firmy usługowej również nie pokazuje adresu
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Chojnice',
            postalCode: '89-600',
            addressCountry: 'PL',
          },
          areaServed: {
            '@type': 'Country',
            name: 'Polska',
          },
          priceRange: '$$',
        }}
      />
      {faqItems.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map(item => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }}
        />
      )}
      <Navbar />
      <SmoothScroll />
      <main id="main" className="marketing-theme bg-[#f5f2ed] text-[#151719] [color-scheme:light]">
        <HeroSection content={heroContent} />
        <ServicesSection />
        <RoiCalculator />
        <LeadMagnetSection />
        <AboutSection />
        <BlogPreview />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}
