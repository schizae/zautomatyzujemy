# Reguła: Sequential Thinking (Myślenie Sekwencyjne)

Każde zadanie — niezależnie od pozornej prostoty — wymaga przejścia przez poniższe fazy
**w tej właśnie kolejności**. Nie wolno przeskakiwać kroków.

---

## Faza 1 — ZROZUMIENIE (przed dotyknięciem kodu)

Odpowiedz sobie na pytania:

- [ ] Co dokładnie prosi użytkownik? (przepisz własnymi słowami)
- [ ] Jakie pliki są objęte tą zmianą?
- [ ] Jakie pliki MOGĄ być objęte (pośrednio — importy, typy, testy)?
- [ ] Czy rozumiem obecny kształt kodu, który zmieniam?

Jeśli nie możesz odpowiedzieć na którekolwiek pytanie — **przeczytaj kod, zanim przejdziesz dalej**.

---

## Faza 2 — PLANOWANIE (przed pisaniem)

Zapisz plan w krótkiej formie (może być wewnętrznie, nie musi być widoczny):

```
1. Zmienię plik X, ponieważ ...
2. Dodam komponent Y w katalogu Z, ponieważ pasuje do konwencji ...
3. Zaktualizuję typy w pliku W, bo nowa funkcja zmienia interfejs ...
```

Sprawdź plan pod kątem:
- Czy nie łamię istniejących konwencji projektu?
- Czy nie duplikuję czegoś, co już istnieje?
- Czy nie tworzę pliku, który będzie używany tylko raz (YAGNI)?

---

## Faza 3 — IMPLEMENTACJA (pisanie kodu)

- Pisz jeden plik na raz
- Po każdym pliku sprawdź, czy TypeScript byłby zadowolony (typy, importy)
- Nie zostawiaj `TODO` ani `// fix later` — jeśli czegoś nie wiesz, zapytaj

---

## Faza 4 — WERYFIKACJA (po zapisaniu)

- [ ] Czy wszystkie importy prowadzą do istniejących plików?
- [ ] Czy typy są zgodne w całym łańcuchu wywołań?
- [ ] Czy zmieniłem coś, co psuje inne pliki (re-export, zmiana sygnatury)?
- [ ] Czy nowa funkcja/komponent jest spójna z resztą projektu?

---

## Kiedy używać `mcp__sequential-thinking__sequentialthinking`

Użyj narzędzia Sequential Thinking (jeśli dostępne w sesji) gdy:
- Zadanie dotyczy architektury lub struktury projektu
- Zadanie dotyka więcej niż 3 pliki
- Coś jest niejednoznaczne i potrzebujesz rozłożyć problem
- Naprawiasz skomplikowany bug z wieloma możliwymi przyczynami

Wywołanie: użyj narzędzia `mcp__sequential-thinking__sequentialthinking` z opisem problemu.
