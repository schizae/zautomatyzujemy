import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Zautomatyzujemy.pl — Agencja Automatyzacji AI',
    short_name: 'Zautomatyzujemy',
    description:
      'Wdrażamy AI i automatyzacje, które oszczędzają czas, redukują koszty i skalują Twój biznes.',
    start_url: '/',
    display: 'standalone',
    background_color: '#121412',
    theme_color: '#70e5ea',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
