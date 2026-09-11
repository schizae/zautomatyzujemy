import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Zautomatyzujemy.pl — Automatyzacja Procesów z AI',
    short_name: 'Zautomatyzujemy',
    description:
      'Wdrażamy AI i automatyzacje, które oszczędzają czas, redukują koszty i skalują Twój biznes.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f2ed',
    theme_color: '#e84324',
    icons: [
      {
        src: '/brand-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
