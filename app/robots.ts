import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://zautomatyzujemy.pl'

  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/account/'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/account/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
