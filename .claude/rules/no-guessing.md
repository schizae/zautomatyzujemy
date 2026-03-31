# Reguła: Zakaz Zgadywania (No Guessing Policy)

Ta reguła jest bezwzględna. Zgadywanie w kodzie jest niedopuszczalne,
ponieważ produkuje kod, który wygląda poprawnie, ale nie działa.

---

## Co to jest "zgadywanie"?

Zgadywanie to każda sytuacja, gdy piszesz kod oparty na założeniu
zamiast na zweryfikowanym fakcie. Przykłady:

```typescript
// ZGADYWANIE — nie sprawdziłeś jak naprawdę nazywa się ta funkcja
import { formatDate } from '@/lib/utils'

// FAKT — sprawdziłeś plik @/lib/utils.ts i funkcja tam jest
import { formatDate } from '@/lib/utils'
```

Kod wygląda identycznie — różnica jest w procesie.

---

## Obszary gdzie zgadywanie jest najczęstsze (i najgroźniejsze)

### 1. Importy i ścieżki

**Zakaz:** Nie pisz importu, jeśli nie sprawdziłeś, że plik istnieje i eksportuje to, czego potrzebujesz.

```typescript
// ZANIM napiszesz:
import { Button } from '@/components/ui/button'

// SPRAWDŹ:
// 1. Czy plik @/components/ui/button.tsx istnieje?
// 2. Czy eksportuje 'Button' (named export)?
// 3. Jaki ma interfejs props?
```

### 2. API i endpointy

**Zakaz:** Nie zakładaj kształtu odpowiedzi API. Przeczytaj:
- Definicję route handlera (`app/api/.../route.ts`)
- Typ odpowiedzi
- Możliwe kody błędów

### 3. Sygnatury funkcji i typy

**Zakaz:** Nie zakładaj parametrów funkcji. Jeśli wywołujesz funkcję, którą nie pisałeś — przeczytaj jej definicję.

```typescript
// ZANIM napiszesz:
const result = await createUser(data)

// SPRAWDŹ definicję createUser:
// - Jakie parametry przyjmuje?
// - Co zwraca?
// - Czy może rzucić wyjątek?
```

### 4. Zmienne środowiskowe

**Zakaz:** Nie zgaduj nazw zmiennych środowiskowych. Sprawdź `.env.example` lub `.env.local`.

### 5. Konfiguracja Tailwind / shadcn

**Zakaz:** Nie zgaduj nazw klas Tailwind ani wariantów shadcn. Sprawdź:
- `tailwind.config.ts` dla customowych tokenów
- Dokumentację komponentu shadcn dla dostępnych wariantów

---

## Protokół "nie wiem"

Gdy nie wiesz czegoś i nie możesz tego sprawdzić w kodzie:

1. **Powiedz to wprost:** "Nie widzę definicji tej funkcji — czy możesz mi pokazać plik X?"
2. **Zaproponuj opcje:** "Nie jestem pewien, czy używacie React Query czy SWR — który wolisz?"
3. **Nigdy nie pisz kodu z komentarzem `// TODO: sprawdzić`** — to zgadywanie z odłożonym sprawdzeniem.

---

## Test "czy to zgaduję?"

Przed napisaniem każdej linii kodu zapytaj się:

> "Czy wiem to na pewno, bo przeczytałem kod/plik/dokumentację — czy tylko zakładam?"

Jeśli odpowiedź brzmi "zakładam" — **STOP. Sprawdź najpierw.**

---

## Dopuszczalne wyjątki

Możesz pisać bez uprzedniej weryfikacji tylko gdy:
- Tworzysz plik od zera i jego zawartość jest w pełni Twoją pracą
- Używasz standardowego API frameworka (Next.js, React) zgodnie z oficjalną dokumentacją
- Kopiujesz wzorzec z innego pliku w tym samym projekcie, który właśnie przeczytałeś
