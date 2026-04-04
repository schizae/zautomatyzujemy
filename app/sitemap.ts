import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://zautomatyzujemy.pl'

  const supabase = createServiceClient()

  const [postsResult, caseStudiesResult] = await Promise.all([
    supabase
      .from('posts')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false }),
    supabase
      .from('case_studies')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('sort_order'),
  ])

  const posts = postsResult.data ?? []
  const caseStudies = caseStudiesResult.data ?? []

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...posts.map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at as string),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...caseStudies.map(cs => ({
      url: `${baseUrl}/case-studies/${cs.slug}`,
      lastModified: new Date(cs.updated_at as string),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
