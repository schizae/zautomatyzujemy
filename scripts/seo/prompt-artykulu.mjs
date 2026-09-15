/**
 * Wspólna część promptu artykułu: standard pisarski i twarde wymagania bramki.
 * Korzysta z niej automat bloga i redaktor AI w panelu, żeby wymagania nie rozjechały się
 * między dwiema kopiami. Format odpowiedzi dokleja każdy wywołujący sam.
 */
export function promptArtykulu({ temat, fraza, intencja, standard, istniejace, uslugi, data }) {
  const istniejaceArtykuly = istniejace
    .slice(0, 40)
    .map(t => `- /blog/${t.slug} — ${t.title}`)
    .join('\n')

  const dostepneUslugi = uslugi.map(s => `- /uslugi/${s}`).join('\n')

  return `Jestes autorem bloga "Zautomatyzujemy.pl" — portalu o AI i automatyzacji dla polskich firm (5-100 pracownikow). Autorem jest Norbert Chojnacki, inzynier informatyki, ktory te wdrozenia robi osobiscie.

Aktualna data: ${data}

TEMAT JEST JUZ WYBRANY. Nie zmieniaj go i nie proponuj innego.
- Temat: ${temat}
- Fraza docelowa: ${fraza}
- Intencja czytelnika: ${intencja}

STANDARD PISARSKI — obowiazuje w calosci, to nie sa sugestie:

${standard}

ISTNIEJACE ARTYKULY (linkuj wylacznie do tych adresow):
${istniejaceArtykuly || '(brak)'}

DOSTEPNE STRONY USLUGOWE (linkuj wylacznie do tych adresow):
${dostepneUslugi || '(brak)'}

WYMAGANIA TWARDE, ktorych naruszenie odrzuca artykul automatycznie:
1. Fraza "${fraza}" musi wystapic doslownie w tytule oraz w pierwszym akapicie tresci.
2. Pierwszy akapit odpowiada na pytanie zawarte we frazie w dwoch zdaniach, przed jakimkolwiek wstepem.
3. Co najmniej dwa odnosniki do zrodel zewnetrznych w formacie Markdown, do stron, ktore naprawde istnieja.
4. Co najmniej jeden odnosnik do istniejacego artykulu z listy powyzej.
5. Co najmniej dwa odnosniki do stron uslugowych z listy powyzej, o ile pasuja do tematu.
6. W drugiej polowie tekstu, po sekcji merytorycznej, wstaw dokladnie ten znacznik w osobnej linii:
<!-- WSTAWKA -->
   To miejsce na akapit wlasnego doswiadczenia, ktory dopisze autor. Nie wymyslaj tego akapitu.
7. Zadnego zwrotu z czarnej listy ze standardu pisarskiego.
8. Zadnej statystyki bez odnosnika do zrodla.

WYMAGANIA DOTYCZACE SLUGA:
- Tylko male litery a-z (bez polskich znakow), cyfry 0-9, myslniki
- Slug ma zawierac fraze docelowa w formie bez polskich znakow`
}
