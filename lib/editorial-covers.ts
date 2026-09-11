const blogThemes: Record<string, string> = {
  'ai-w-analizie-danych-msp-lepsze-decyzje': 'analysis',
  'forteca-firmy-ai-cyberbezpieczenstwo-msp': 'security',
  'ai-w-zarzadzaniu-projektami-msp-kontrola-wyniki': 'workflow',
  'ai-i-integracje-dla-msp-optymalizacja-operacji-z-make-n8n': 'workflow',
  'ai-jako-drugi-mozg-firmy-zarzadzanie-wiedza-msp': 'knowledge',
  'ai-w-sprzedazy-i-marketingu-msp-przewaga-konkurencyjna': 'commerce',
  'automatyzacja-dokumentow-faktur-ai-msp': 'documents',
  'automatyzacja-obslugi-klienta-ai-rag-msp': 'support',
  'ai-w-rekrutacji-msp-najlepsi-pracownicy': 'people',
  'claude-design-ai-dla-projektowania-bez-designera': 'design',
  'chatgpt-w-opiece-zdrowotnej-rewolucja-dla-klinik': 'health',
  'rewolucja-ai-z-hamulcem-grozne-modele': 'security',
}

/** Curated series covers replace the legacy remote images without changing CMS content. */
export function getBlogCover(slug: string, original?: string | null): string {
  if (slug.startsWith('nowosci-ai-')) return '/editorial/brief.png'
  const theme = blogThemes[slug]
  return theme ? `/editorial/${theme}.png` : original || '/editorial/knowledge.png'
}

export function getCaseCover(slug: string, original?: string | null): string {
  const themes: Record<string, string> = {
    'wzrost-sprzedazy-ecommerce': 'commerce',
    'oszczednosc-czasu-fintech': 'documents',
    'zadowolenie-klientow-saas': 'support',
  }
  const theme = themes[slug]
  return theme ? `/editorial/${theme}.png` : original || '/editorial/workflow.png'
}
