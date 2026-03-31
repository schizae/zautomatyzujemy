# Reguła: Standardy Next.js (App Router)

Wszystkie reguły dotyczą Next.js z App Routerem. Jeśli projekt używa Pages Routera,
poinformuj użytkownika o różnicach zanim zaczniesz pracę.

---

## Server Components vs Client Components

### Domyślne zachowanie

Każdy plik w `app/` jest domyślnie **Server Component**. To jest wartość domyślna — nie dodawaj `'use server'` do Server Components.

```typescript
// Server Component — POPRAWNIE (brak dyrektywy)
export default function Page() {
  return <main>...</main>
}

// Client Component — wymagana dyrektywa NA GÓRZE pliku
'use client'
export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### Kiedy używać `'use client'`

Tylko gdy komponent używa:
- `useState`, `useReducer`, `useEffect`, `useRef`, innych hooków React
- Event listenerów (`onClick`, `onChange`, itp.)
- Browser-only API (`window`, `document`, `localStorage`)
- Bibliotek, które nie obsługują Server Components

**Zasada minimum:** Push `'use client'` jak najdalej w dół drzewa komponentów.

### Czego NIE robić

```typescript
// BŁĄD: niepotrzebne 'use client' na całej stronie
'use client'
export default function ProductPage({ products }) {
  // ta strona nie ma żadnych hooków ani event listenerów
  return <ProductList products={products} />
}

// POPRAWNIE: tylko interaktywny komponent dostaje 'use client'
// page.tsx — Server Component (brak dyrektywy)
export default function ProductPage({ products }) {
  return <ProductList products={products} />
}

// product-filter.tsx — Client Component
'use client'
export function ProductFilter({ onFilter }) {
  const [query, setQuery] = useState('')
  ...
}
```

---

## Pobieranie danych (Data Fetching)

### W Server Components — `async/await` bezpośrednio

```typescript
// app/products/page.tsx
export default async function ProductsPage() {
  const products = await getProducts() // wywołanie bezpośrednie, bez useEffect
  return <ProductList products={products} />
}
```

### W Client Components — React Query

```typescript
'use client'
import { useQuery } from '@tanstack/react-query'

export function ProductList() {
  const { data, isPending } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(r => r.json()),
  })
}
```

### Nigdy nie używaj `useEffect` do fetchowania — użyj React Query.

---

## Server Actions

```typescript
// lib/actions/product.actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createProduct(formData: FormData) {
  // walidacja danych wejściowych
  // zapis do bazy danych
  revalidatePath('/products')
}
```

- Server Actions muszą mieć `'use server'` — albo na górze pliku, albo wewnątrz funkcji
- Zawsze waliduj dane wejściowe (np. przez Zod)
- Zawsze wywołuj `revalidatePath` lub `revalidateTag` po mutacji

---

## Metadane i SEO

```typescript
// app/products/[id]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.id)
  return {
    title: product.name,
    description: product.description,
  }
}
```

---

## Struktura katalogów (App Router)

```
app/
  layout.tsx          # Root layout (wymagany)
  page.tsx            # Strona główna
  globals.css         # Globalne style
  (auth)/             # Route group — nie wpływa na URL
    login/page.tsx
    register/page.tsx
  dashboard/
    layout.tsx        # Nested layout
    page.tsx
    _components/      # Prywatne komponenty (podkreślnik = nie route)
      sidebar.tsx
  api/
    products/
      route.ts        # GET, POST handler

components/
  ui/                 # shadcn/ui komponenty (generowane automatycznie)
  [feature]/          # komponenty specyficzne dla feature

lib/
  actions/            # Server Actions
  db/                 # klient bazy danych
  utils.ts            # cn() i inne utility
  validations/        # schematy Zod
```

---

## Routing i nawigacja

```typescript
// UŻYWAJ Link dla nawigacji
import Link from 'next/link'
<Link href="/products">Produkty</Link>

// UŻYWAJ useRouter tylko dla programatycznej nawigacji w Client Components
'use client'
import { useRouter } from 'next/navigation'  // NIE z 'next/router'!

// UŻYWAJ redirect() w Server Components i Server Actions
import { redirect } from 'next/navigation'
```

---

## Obsługa błędów

```
app/
  error.tsx           # Obsługa błędów runtime ('use client' wymagane)
  not-found.tsx       # Obsługa 404
  loading.tsx         # Suspense fallback
```

```typescript
// error.tsx — MUSI być Client Component
'use client'
export default function Error({ error, reset }) {
  return (
    <div>
      <p>Wystąpił błąd: {error.message}</p>
      <button onClick={reset}>Spróbuj ponownie</button>
    </div>
  )
}
```

---

## Gotchas — częste pułapki Next.js

1. `useRouter` importuj z `next/navigation`, NIE z `next/router` (App Router)
2. `cookies()` i `headers()` są asynchroniczne w Next.js 15+ — używaj `await`
3. `params` w page.tsx to Promise w Next.js 15+ — używaj `await params`
4. Nie używaj `getServerSideProps` / `getStaticProps` — to Pages Router API
5. `'use server'` nie czyni pliku Server Component — oznacza Server Actions
