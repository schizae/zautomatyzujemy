import { ChatWidget } from '@/components/chat/chat-widget'
import { Navbar } from '@/components/marketing/navbar'
import { HeroSection } from '@/components/marketing/hero-section'
import { ServicesSection } from '@/components/marketing/services-section'
import { CaseStudySection } from '@/components/marketing/case-study-section'
import { BlogPreview } from '@/components/marketing/blog-preview'
import { ContactSection } from '@/components/marketing/contact-section'
import { Footer } from '@/components/marketing/footer'
import { createServiceClient } from '@/lib/supabase/server'

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
      <Navbar />
      <main>
        <HeroSection content={heroContent} />
        <ServicesSection />
        <CaseStudySection />
        <BlogPreview />
        <ContactSection />
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}
