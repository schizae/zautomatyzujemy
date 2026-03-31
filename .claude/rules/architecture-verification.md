# Reguła: Weryfikacja Architektury Przed Zapisem

Zanim stworzysz lub zmodyfikujesz plik, musisz zweryfikować architekturę.
To nie jest opcjonalne — to warunek konieczny poprawnej pracy.

---

## Checklist weryfikacyjna (wykonaj PRZED zapisem pliku)

### 1. Sprawdź strukturę katalogów

```
Przeczytaj istniejącą strukturę projektu:
- Gdzie są komponenty? (components/ vs app/_components/ vs features/?)
- Gdzie są typy? (types/ vs lib/types/ vs inline?)
- Gdzie są utility functions? (lib/ vs utils/ vs helpers/?)
- Czy projekt używa feature-based struktury czy type-based?
```

Nowy plik MUSI pasować do istniejącej konwencji, nie do Twojego gustu.

### 2. Sprawdź konwencje nazewnictwa

Przed stworzeniem pliku lub komponentu sprawdź istniejące:

```bash
# Przykład: jak nazywane są komponenty?
ls components/   # PascalCase? kebab-case?

# Jak nazywane są hooki?
ls hooks/        # useXxx.ts? use-xxx.ts?

# Jak nazywane są Server Actions?
ls app/actions/  # xyzAction.ts? xyz.action.ts?
```

Twoje nazewnictwo musi być identyczne.

### 3. Sprawdź istniejące wzorce importu

Przed użyciem importu sprawdź, jak projekt go obsługuje:

```typescript
// NIE zakładaj — sprawdź w istniejących plikach:
// Czy projekt używa path aliases? (@/components vs ../../components)
// Czy są barrel exports (index.ts)?
// Czy komponenty shadcn są re-eksportowane z jednego miejsca?
```

### 4. Sprawdź, czy komponent/funkcja już nie istnieje

```
Zanim stworzysz nowy komponent lub utility:
1. Przeszukaj projekt pod kątem podobnych nazw (Grep)
2. Sprawdź shadcn/ui — czy ten komponent już jest zainstalowany?
3. Sprawdź lib/ i utils/ — czy funkcja pomocnicza już istnieje?
```

**Duplikowanie kodu jest błędem architektonicznym.**

### 5. Sprawdź zależności między warstwami

W Next.js App Router obowiązuje hierarchia:

```
Server Components → mogą importować Client Components
Client Components → NIE mogą importować Server Components
Server Actions    → tylko w Server Components lub Client Components z "use server"
```

Zanim stworzysz plik — wiedz, czy to Server Component czy Client Component.

---

## Pytania kontrolne przed każdym nowym plikiem

| Pytanie | Musisz znać odpowiedź |
|---|---|
| Gdzie ten plik powinien leżeć? | Tak |
| Jak powinien się nazywać? | Tak |
| Co importuje? | Tak |
| Co z niego importują inne pliki? | Tak (jeśli modyfikujesz istniejący) |
| Czy to Server czy Client Component? | Tak (Next.js) |
| Czy ten plik już istnieje w innej formie? | Tak |

---

## Kiedy ZATRZYMAĆ SIĘ i zapytać użytkownika

Zatrzymaj się i zapytaj, gdy:
- Nie rozumiesz struktury projektu po przeczytaniu istniejących plików
- Musisz zmienić architekturę (przenieść katalogi, zmienić konwencje)
- Zadanie wymaga instalacji nowej zależności
- Istniejący wzorzec wydaje się błędny — nie naprawiaj go bez pytania
