# Standard pisarski

Zasady, według których powstaje każdy artykuł na blogu. Czyta ten plik generator
(`.github/scripts/blog-auto.mjs`), czyta go bramka jakości (`scripts/seo/quality-gate.mjs`)
i czyta go człowiek przed publikacją.

Jeden plik zamiast trzech kopii. Gdyby zasady mieszkały osobno w prompcie, osobno w skilcie
i osobno w głowie, rozjechałyby się w trzy miesiące.

---

## Struktura artykułu

1. **Pierwszy akapit odpowiada na pytanie zawarte we frazie docelowej, w dwóch zdaniach.**
   Przed jakimkolwiek wstępem, przed kontekstem, przed „w ostatnich latach". Tak czyta
   wyszukiwarka i tak czyta człowiek, który skanuje stronę przez trzy sekundy.
2. Od trzech do pięciu sekcji merytorycznych z nagłówkami drugiego poziomu.
3. Sekcja pytań i odpowiedzi, od trzech do pięciu pozycji, wzięta z realnych zapytań.
4. Domknięcie wiążące temat z konkretną usługą. Nie „zapraszamy do kontaktu",
   tylko zdanie o tym, co konkretnie da się z tym zrobić.

Długość wynika z tematu, nie z normy. Nie ma dolnego progu liczby słów i nie ma powodu
rozciągać tekstu, żeby wyglądał poważnie.

## Fraza docelowa

Pada w tytule, w nagłówku pierwszego poziomu, w adresie i w pierwszym akapicie.
**Nigdzie więcej w formie dosłownej.** Odmiana, synonimy i formy pochodne są w porządku,
powtarzanie tej samej frazy co akapit nie jest.

## Czarna lista zwrotów

Wystąpienie któregokolwiek oznacza przepisanie akapitu:

- „w dzisiejszym dynamicznym świecie"
- „w erze cyfrowej"
- „w dobie sztucznej inteligencji"
- „nie od dziś wiadomo"
- „game changer"
- „kluczowy element sukcesu"
- „warto pamiętać, że"
- „przełomowy", „rewolucyjny", „rewolucja"

Wspólny mianownik: zdania, które nic nie wnoszą i pasują do dowolnego tekstu o dowolnej branży.

## Konkret zamiast ogólnika

Nazwy narzędzi. Liczba kroków. Czas wykonania. Rząd wielkości kosztu.

Test: **zdanie, które po zamianie nazwy branży nadal brzmi sensownie, jest zdaniem do wyrzucenia.**
„Automatyzacja pozwala zaoszczędzić czas i pieniądze" pasuje do wszystkiego, więc nie znaczy nic.
„Odczyt faktury z PDF-u zajmuje około dwóch sekund, a próg pewności ustawiam na 0,9"
pasuje do jednej rzeczy i dlatego działa.

## Źródła

Minimum dwa odnośniki do źródeł zewnętrznych. Statystyka bez źródła nie wchodzi do tekstu,
nawet jeśli brzmi prawdopodobnie. Zdanie z liczbą, której nie da się sprawdzić, wyrządza
więcej szkody niż jego brak.

## Linkowanie

- Minimum dwa odnośniki do stron usługowych
- Minimum jeden do innego artykułu
- Tekst odnośnika opisuje cel: nigdy „tutaj", nigdy „czytaj więcej", nigdy „kliknij"
- Odnośnik stoi tam, gdzie jest merytorycznie uzasadniony, nie na końcu tekstu w kupce

Jeśli do tematu nie pasuje żadna istniejąca usługa, nie wciskaj odnośnika na siłę.
Bramka zgłosi uwagę, człowiek zdecyduje.

## Język

Zdania krótkie. Strona czynna. Druga osoba liczby pojedynczej.
Bez wykrzykników. Bez pytań retorycznych w roli nagłówków.
Bez zwrotów typu „jak wiadomo", „oczywiście", „rzecz jasna" — jeśli to oczywiste,
nie trzeba pisać, a jeśli trzeba, to nie jest oczywiste.

## Wstawka autorska

Generator zostawia w drugiej połowie tekstu, po sekcji merytorycznej, znacznik:

```
<!-- WSTAWKA -->
```

W to miejsce właściciel wpisuje przy zatwierdzaniu jeden akapit z własnym doświadczeniem:
konkretny przypadek, zrzut przepływu, własną liczbę, rzecz, która nie wyszła.

**Artykuł ze znacznikiem nie może zostać opublikowany.** Bramka odrzuca taki tekst,
więc nie da się o wstawce zapomnieć, nawet w trybie automatycznym.

To jedyny fragment, którego nie napisze model, i jedyny powód, dla którego ten blog
ma czymkolwiek różnić się od tysiąca innych blogów o automatyzacji.

## Czego nie robimy

- Nie obiecujemy efektów, których nie da się pokazać
- Nie powołujemy się na scenariusze poglądowe ze studiów przypadku jako na zrealizowane wdrożenia
- Nie piszemy o cudzych wdrożeniach tak, jakby były nasze
- Nie wymyślamy tematu spoza `docs/seo/plan-tresci.md`
