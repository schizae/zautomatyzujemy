# CLAUDE.md — Instrukcje dla agenta Claude Code

Ten plik jest automatycznie wczytywany przez Claude Code na początku każdej sesji.
Zawiera wiążące reguły pracy z tym projektem. Nieprzestrzeganie ich jest błędem.

---

## Obowiązkowy protokół przed każdą akcją

Przed napisaniem JAKIEGOKOLWIEK kodu lub pliku:

1. **CZYTAJ** — przeczytaj istniejące pliki, które będziesz modyfikować lub z którymi nowy plik będzie sąsiadował
2. **MYŚL** — wykonaj analizę sekwencyjną (patrz @.claude/rules/sequential-thinking.md)
3. **WERYFIKUJ** — sprawdź architekturę i konwencje (patrz @.claude/rules/architecture-verification.md)
4. **DZIAŁAJ** — dopiero wtedy zapisuj pliki

> Jeśli któregokolwiek z kroków nie możesz wykonać (np. brak dostępu do pliku), powiedz to użytkownikowi zamiast zgadywać.

---

## Dołączone zestawy reguł

@.claude/rules/sequential-thinking.md
@.claude/rules/architecture-verification.md
@.claude/rules/no-guessing.md
@.claude/rules/nextjs-standards.md
@.claude/rules/typescript-standards.md
@.claude/rules/frontend-designer.md
@.claude/rules/ai-sdk-rag.md
@.claude/rules/n8n-webhooks.md

---

## Stos technologiczny (domyślny dla tego projektu)

- **Framework:** Next.js (App Router)
- **Język:** TypeScript (strict mode)
- **Style:** Tailwind CSS
- **Komponenty UI:** shadcn/ui
- **State/fetch:** React Query (TanStack Query)
- **AI/Chat:** Vercel AI SDK v6 (`ai` + `@ai-sdk/openai`)
- **Animacje:** Framer Motion
- **Automatyzacja:** n8n (webhooks inbound/outbound)
- **Linter:** ESLint + Prettier

---

## Szybkie komendy

```bash
pnpm dev          # development server
pnpm build        # production build
pnpm lint         # ESLint
pnpm type-check   # tsc --noEmit
pnpm test         # testy jednostkowe
```

---

## Bezwzględne zakazy

- Nigdy nie używaj `any` w TypeScript
- Nigdy nie zgaduj API, importów ani ścieżek — sprawdź je w kodzie
- Nigdy nie twórz pliku bez wcześniejszego przeczytania jego sąsiadów
- Nigdy nie dodawaj nowej zależności bez pytania użytkownika
- Nigdy nie umieszczaj sekretów w plikach śledzonych przez git
