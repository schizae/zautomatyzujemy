# Skill: SEO Audit & Optimization (Next.js App Router)

Przeprowadź kompletny audyt SEO i zaproponuj/wdroż poprawki dla projektu Next.js z App Routerem.

Użytkownik może podać konkretną stronę (`$ARGUMENTS`) lub poprosić o audyt całego projektu.

---

## Tryb pracy

1. Jeśli `$ARGUMENTS` zawiera ścieżkę (np. `/blog`, `/kontakt`) — audytuj tylko tę stronę
2. Jeśli `$ARGUMENTS` jest puste lub zawiera "all"/"cały"/"projekt" — audytuj cały projekt
3. Jeśli `$ARGUMENTS` zawiera "fix"/"napraw"/"wdroż" — od razu wdrażaj poprawki (nie tylko raportuj)

---

## Faza 1: Zbieranie danych (PRZECZYTAJ przed analizą)

Przeczytaj następujące pliki (jeśli istnieją):

### Konfiguracja globalna
- `next.config.ts` / `next.config.mjs` — redirects, rewrites, headers, images
- `app/layout.tsx` — root metadata, viewport, fonts, scripts
- `app/sitemap.ts` — dynamiczna mapa strony
- `app/robots.ts` — reguły dla crawlerów
- `app/manifest.ts` / `app/manifest.json` — PWA manifest
- `public/` — sprawdź favicon.ico, apple-touch-icon, og-image

### Strony (dla każdej audytowanej strony)
- `app/[ścieżka]/page.tsx` — komponent strony
- `app/[ścieżka]/layout.tsx` — layout strony (jeśli istnieje)
- `app/[ścieżka]/loading.tsx` — loading state
- `app/[ścieżka]/opengraph-image.tsx` — dynamiczny OG image (jeśli istnieje)

### Komponenty współdzielone
- `components/` — szukaj komponentów SEO, Head, JsonLd, Breadcrumbs
- `lib/` — szukaj helperów SEO, metadata utilities

---

## Faza 2: Audyt — Checklist (sprawdź KAŻDY punkt)

### 2.1 Meta Tags & Metadata API

```
[ ] Root layout eksportuje `metadata` lub `generateMetadata` z:
    - title (z template: `{ default: '...', template: '%s | Brand' }`)
    - description (150-160 znaków)
    - metadataBase (URL bazowy dla OG images)
    - keywords (opcjonalnie — mały wpływ, ale nie szkodzi)
    - authors
    - creator
    - publisher
[ ] Każda strona ma własne metadata lub generateMetadata
[ ] Dynamiczne strony ([slug]) używają generateMetadata z danymi z bazy
[ ] Brak duplikatów title/description między stronami
[ ] Title nie przekracza 60 znaków, description 160 znaków
```

### 2.2 Open Graph & Twitter Cards

```
[ ] metadata.openGraph zawiera:
    - title, description, url, siteName
    - images (min 1200x630px)
    - type ('website' dla strony głównej, 'article' dla bloga)
    - locale ('pl_PL')
[ ] metadata.twitter zawiera:
    - card: 'summary_large_image'
    - title, description, images
    - creator (opcjonalnie)
[ ] Dynamiczne strony generują OG data z rzeczywistych danych
[ ] Rozważ app/opengraph-image.tsx dla dynamicznych OG images (ImageResponse)
```

### 2.3 Structured Data (JSON-LD)

```
[ ] Strona główna: Organization lub WebSite schema
[ ] Blog listing: CollectionPage schema
[ ] Blog post: Article lub BlogPosting schema z:
    - headline, description, image
    - author (Person), publisher (Organization)
    - datePublished, dateModified
    - mainEntityOfPage
[ ] Strona kontaktowa: LocalBusiness lub ContactPage
[ ] FAQ (jeśli istnieje): FAQPage schema
[ ] Breadcrumbs: BreadcrumbList schema
[ ] JSON-LD wstrzyknięty przez <script type="application/ld+json">
```

Wzorzec implementacji JSON-LD w Next.js:

```tsx
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```

### 2.4 Sitemap & Robots

```
[ ] app/sitemap.ts istnieje i:
    - Zwraca wszystkie publiczne strony
    - Zawiera dynamiczne strony z bazy (blog posts, etc.)
    - Ma lastModified dla każdego URL
    - Ma changeFrequency i priority
[ ] app/robots.ts istnieje i:
    - Pozwala na crawling publicznych stron
    - Blokuje /admin, /api, /_next
    - Wskazuje na sitemap
[ ] Nie ma stron orphaned (w sitemap ale nie linkowanych, lub odwrotnie)
```

### 2.5 Canonical URLs

```
[ ] metadata.alternates.canonical ustawiony na każdej stronie
[ ] Dynamiczne strony generują canonical z rzeczywistego URL
[ ] Brak duplikatów treści bez canonical (www vs non-www, trailing slash)
```

### 2.6 Semantic HTML & Accessibility

```
[ ] Jedna <h1> na stronę
[ ] Hierarchia nagłówków (h1 > h2 > h3) — bez przeskoków
[ ] <main> opakowuje główną treść
[ ] <nav> dla nawigacji
[ ] <article> dla postów blogowych
[ ] lang="pl" na <html> elemencie
```

### 2.7 Image Optimization

```
[ ] Wszystkie obrazy używają next/image (<Image> komponent)
[ ] Każdy obraz ma alt text
[ ] Obrazy hero/above-the-fold mają priority={true}
[ ] Rozmiary (width/height lub fill) ustawione — zapobiega CLS
[ ] next.config: images.remotePatterns skonfigurowane
```

### 2.8 Core Web Vitals

```
[ ] LCP: Hero image ma priority={true}, fonty preload (next/font)
[ ] CLS: Wszystkie obrazy mają wymiary, fonty font-display: swap
[ ] INP: Ciężkie komponenty lazy-loaded
```

### 2.9 URL Structure

```
[ ] URL-e są krótkie, opisowe, kebab-case
[ ] Blog: /blog/[slug] z czytelnym slugiem
[ ] Trailing slash — konsekwentne
```

### 2.10 Internal Linking

```
[ ] Nawigacja zawiera linki do kluczowych stron
[ ] Breadcrumbs na podstronach
[ ] Użycie next/link (<Link>) zamiast <a> dla wewnętrznych linków
```

---

## Faza 3: Raport

```
## Raport SEO — [nazwa strony lub "Cały projekt"]

### Krytyczne (blokują indeksowanie / ranking)
- [ ] [opis problemu] — plik: `ścieżka`

### Ważne (znaczący wpływ na SEO)
- [ ] [opis problemu] — plik: `ścieżka`

### Rekomendacje (ulepszenia)
- [ ] [opis problemu] — plik: `ścieżka`

### OK (co działa dobrze)
- [x] [co jest poprawne]
```

---

## Faza 4: Implementacja (jeśli tryb "fix")

Wdrażaj poprawki w kolejności priorytetów:

1. **Krytyczne** — najpierw
2. **Ważne** — potem
3. **Rekomendacje** — na końcu (pytaj użytkownika)

---

## Narzędzia do weryfikacji (poleć użytkownikowi)

1. **Google Rich Results Test** — https://search.google.com/test/rich-results
2. **PageSpeed Insights** — https://pagespeed.web.dev/
3. **Open Graph Debugger** — https://www.opengraph.xyz/
4. **Schema.org Validator** — https://validator.schema.org/
5. **Lighthouse** — Chrome DevTools > Lighthouse > SEO
