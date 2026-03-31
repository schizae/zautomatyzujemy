# Reguła: Standardy TypeScript

Projekt używa TypeScript w trybie strict. Poniższe reguły są bezwzględne.

---

## Konfiguracja (wymagana)

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

---

## Absolutne zakazy

### Zakaz `any`

```typescript
// BŁĄD
const data: any = await fetch(...)
function process(input: any) { ... }

// POPRAWNIE — użyj unknown i zawęź typ
const data: unknown = await fetch(...)
function process(input: unknown) {
  if (typeof input === 'string') { ... }
}
```

### Zakaz `as` (type assertion) bez type guard

```typescript
// BŁĄD — zakładasz typ bez weryfikacji
const user = data as User

// POPRAWNIE — zbuduj type guard
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value
  )
}
const user = isUser(data) ? data : null
```

### Wyjątek dopuszczalny: `as` przy typach DOM

```typescript
// Akceptowalne — TypeScript nie może wywnioskować typów DOM
const input = document.getElementById('email') as HTMLInputElement
```

---

## Typy vs Interfejsy

- `interface` — dla kształtu obiektów i kontraktów (preferowane dla props komponentów)
- `type` — dla union types, intersection types, mapped types, tuple types

```typescript
// Props komponentu — interface
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

// Union type — type alias
type Status = 'idle' | 'loading' | 'success' | 'error'

// Mapped type — type alias
type Readonly<T> = { readonly [K in keyof T]: T[K] }
```

---

## Explicite typy zwracane

Wszystkie funkcje eksportowane muszą mieć explicite typy zwracane:

```typescript
// BŁĄD — brak typu zwracanego
export async function getProducts() {
  return db.product.findMany()
}

// POPRAWNIE
export async function getProducts(): Promise<Product[]> {
  return db.product.findMany()
}

// Wyjątek: komponenty React (typ jest inferowany przez JSX)
export default function Page() {  // OK — JSX.Element jest wnioskowany
  return <main>...</main>
}
```

---

## Walidacja danych wejściowych (Zod)

Zawsze waliduj dane z zewnątrz (formularze, API, URL params) przez Zod:

```typescript
import { z } from 'zod'

const CreateProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
})

type CreateProductInput = z.infer<typeof CreateProductSchema>

// W Server Action:
export async function createProduct(formData: FormData) {
  const parsed = CreateProductSchema.safeParse({
    name: formData.get('name'),
    price: Number(formData.get('price')),
    categoryId: formData.get('categoryId'),
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten() }
  }

  // parsed.data jest bezpieczne i w pełni typowane
  await db.product.create({ data: parsed.data })
}
```

---

## Generyki — używaj zamiast duplikować

```typescript
// BŁĄD — duplikowanie dla różnych typów
async function fetchUser(id: string): Promise<User> { ... }
async function fetchProduct(id: string): Promise<Product> { ... }

// POPRAWNIE — generyk
async function fetchById<T>(endpoint: string, id: string): Promise<T> {
  const res = await fetch(`${endpoint}/${id}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}
```

---

## Typy dla Next.js

```typescript
import type { NextRequest, NextResponse } from 'next/server'
import type { Metadata } from 'next'

// Props strony w App Router (Next.js 15+)
interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params
  ...
}
```

---

## Konwencje nazewnictwa

| Co | Konwencja | Przykład |
|---|---|---|
| Typy i interfejsy | PascalCase | `UserProfile`, `ApiResponse` |
| Zmienne i funkcje | camelCase | `getUserById`, `isLoading` |
| Stałe globalne | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Pliki komponentów | PascalCase.tsx | `UserCard.tsx` |
| Pliki utility | kebab-case.ts | `format-date.ts` |
| Pliki hooków | useXxx.ts | `useLocalStorage.ts` |
| Enum wartości | PascalCase | `Status.Active` |
