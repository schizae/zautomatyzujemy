/**
 * Wewnętrzny rejestr systemów AI używanych przez Zautomatyzujemy.pl.
 *
 * Świadomie w kodzie, a nie w bazie: pięć pozycji zmienianych raz na kwartał
 * nie potrzebuje schematu ani edytora. Rejestr jest wewnętrzny — właściciel nie
 * pokazuje konkurencji, z czego korzysta.
 */

/** Rola w rozumieniu rozporządzenia: budujemy system czy tylko go stosujemy. */
export type AiRole = 'dostawca' | 'podmiot stosujący'

export interface AiSystemEntry {
  name: string
  model: string
  purpose: string
  inputs: string
  role: AiRole
}

export const AI_SYSTEMS: readonly AiSystemEntry[] = [
  {
    name: 'Klara — czat tekstowy',
    model: 'gemini-2.5-flash',
    purpose: 'Odpowiedzi na pytania odwiedzających i zbieranie zgłoszeń kontaktowych',
    inputs: 'Wiadomości użytkownika, baza wiedzy o ofercie',
    role: 'podmiot stosujący',
  },
  {
    name: 'Klara — kanał głosowy',
    model: 'Konfiguracja po stronie Vapi — do uzupełnienia po weryfikacji',
    purpose: 'Rozmowa głosowa z odwiedzającym stronę',
    inputs: 'Mowa użytkownika, kontekst przekazywany ze strony',
    role: 'podmiot stosujący',
  },
  {
    name: 'blog-auto',
    model: 'gemini-3.8-flash oraz gemini-3.1-flash-image',
    purpose: 'Cotygodniowy artykuł na blog wraz z okładką',
    inputs: 'Lista dotychczasowych tematów pobierana ze strony',
    role: 'podmiot stosujący',
  },
  {
    name: 'blog-brief',
    model: 'gemini-3.8-flash oraz gemini-3.1-flash-image',
    purpose: 'Cotygodniowy przegląd nowości AI wraz z okładką',
    inputs: 'Kanały RSS producentów modeli',
    role: 'podmiot stosujący',
  },
  {
    name: 'Baza wiedzy — embeddingi',
    model: 'gemini-embedding-001',
    purpose: 'Wyszukiwanie fragmentów dokumentów do odpowiedzi czatu',
    inputs: 'Treści marketingowe i opisy usług z tego repozytorium',
    role: 'podmiot stosujący',
  },
]
