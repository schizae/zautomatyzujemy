import type { Metadata } from 'next'
import { ChatWidget } from '@/components/chat/chat-widget'
import { Navbar } from '@/components/marketing/navbar'
import { HeroSection } from '@/components/marketing/hero-section'
import { ServicesSection } from '@/components/marketing/services-section'
import { CaseStudySection } from '@/components/marketing/case-study-section'
import { AboutSection } from '@/components/marketing/about-section'
import { BlogPreview } from '@/components/marketing/blog-preview'
import { ContactSection } from '@/components/marketing/contact-section'
import { Footer } from '@/components/marketing/footer'
import { JsonLd } from '@/components/seo/json-ld'
import { createServiceClient } from '@/lib/supabase/server'

const SITE_URL =
  process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://zautomatyzujemy.pl'

export const metadata: Metadata = {
  title: 'Zautomatyzujemy.pl — AI i automatyzacja dla firm | Chatboty, n8n, AI Act',
  description:
    'Automatyzuję procesy i wdrażam AI w małych i średnich firmach. Chatboty, n8n, zgodność z AI Act. Bezpłatna konsultacja.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Zautomatyzujemy.pl — AI i automatyzacja dla firm',
    description:
      'Automatyzuję procesy i wdrażam AI w małych i średnich firmach. Chatboty, n8n, zgodność z AI Act.',
    url: SITE_URL,
    type: 'website',
  },
}

export default async function HomePage() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('page_content')
    .select('key, value')
    .in('key', ['hero_title', 'hero_description', 'hero_cta_primary', 'hero_cta_secondary'])

  const heroContent: Record<string, string> = Object.fromEntries(
    (data ?? []).map((item: { key: string; value: string }) => [item.key, item.value])
  )

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Zautomatyzujemy.pl',
          url: SITE_URL,
          description:
            'Agencja automatyzacji AI — chatboty, integracje n8n, RAG, wdrożenia LLM.',
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
      <Navbar />
      <main id="main">
        <HeroSection content={heroContent} />
        <ServicesSection />
        <CaseStudySection />
        <AboutSection />
        <BlogPreview />
        <ContactSection />
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}
