-- ============================================================
-- Migracja 009: Rzetelne treści usług i FAQ + oznaczenie case studies
-- Projekt: Zautomatyzujemy.pl
-- Wykonaj w: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── Case studies: rozróżnienie przykładu od realizacji ──────────────────────
-- Kolumna jest potrzebna zanim pojawi się pierwszy prawdziwy klient. Zaszycie
-- etykiety w komponencie oznaczałoby zmianę kodu przy pierwszej referencji
-- i ryzyko oznaczenia realnego wdrożenia jako fikcji.
ALTER TABLE case_studies
  ADD COLUMN IF NOT EXISTS is_example BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN case_studies.is_example IS 'TRUE = scenariusz poglądowy, nie zrealizowane wdrożenie';

-- Tytuły opisują rozwiązanie zamiast obiecywać niesprawdzalny wynik.
-- Slugi zostają — są w sitemapie, linkach i jako klucze source w bazie wiedzy RAG.
UPDATE case_studies SET
  title = 'Biuro rachunkowe: automatyzacja księgowania faktur z maili',
  description = 'Faktury przychodzące na skrzynkę są odczytywane automatycznie — numer, kwota, termin i kontrahent trafiają do systemu księgowego bez przepisywania z PDF-a.',
  is_example = TRUE
WHERE slug = 'oszczednosc-czasu-fintech';

UPDATE case_studies SET
  title = 'Platforma SaaS: asystent AI dla wsparcia technicznego',
  description = 'Asystent oparty na bazie wiedzy produktu odpowiada na powtarzalne pytania użytkowników i przekazuje zespołowi tylko te zgłoszenia, które wymagają człowieka.',
  is_example = TRUE
WHERE slug = 'zadowolenie-klientow-saas';

UPDATE case_studies SET
  title = 'Sklep internetowy: chatbot odpowiadający na większość zapytań klientów',
  description = 'Chatbot zna asortyment, status zamówień i zasady zwrotów. Odpowiada od razu o każdej porze, a rozmowy wymagające decyzji przekazuje obsłudze.',
  is_example = TRUE
WHERE slug = 'wzrost-sprzedazy-ecommerce';

-- ─── Usługi ─────────────────────────────────────────────────────────────────
-- Tabela nie jest renderowana publicznie (ServicesSection ma treść w kodzie),
-- ale czyta ją panel admina i skrypt embeddingów — czyli chatbot.
DELETE FROM services;

INSERT INTO services (title, description, icon, sort_order, is_active) VALUES
('Automatyzacja procesów biznesowych',
 'Łączymy narzędzia, z których już korzystasz: CRM, system księgowy, sklep, arkusze, pocztę. Dane przepływają między nimi bez ręcznego przepisywania. Buduję na n8n i Make, więc rozwiązanie zostaje Twoje i możesz je rozwijać bez uzależnienia ode mnie.',
 'Zap', 1, TRUE),

('Chatboty i asystenci AI',
 'Asystent, który zna Twoją ofertę i odpowiada klientom o każdej porze — na stronie, w komunikatorze albo wewnątrz firmy. Zbiera kontakty i przekazuje je do Ciebie wraz z podsumowaniem rozmowy.',
 'MessageSquare', 2, TRUE),

('Automatyzacja dokumentów i faktur',
 'Faktury i dokumenty odczytywane automatycznie: numery, kwoty, terminy, kontrahenci. Trafiają tam, gdzie mają trafić, bez przepisywania z PDF-a do arkusza.',
 'FileText', 3, TRUE),

('Audyt i doradztwo AI',
 'Zanim cokolwiek wdrożymy: przegląd Twoich procesów i uczciwa odpowiedź, co realnie warto zautomatyzować, a co lepiej zostawić człowiekowi. Plan dostajesz niezależnie od tego, czy zdecydujesz się na współpracę.',
 'Search', 4, TRUE),

('Szkolenia z AI dla zespołów',
 'Praktyczne warsztaty pod konkretne stanowiska. Nie ogólniki o rewolucji AI, tylko narzędzia i sposoby pracy, które Twoi ludzie wykorzystają następnego dnia.',
 'GraduationCap', 5, TRUE),

('Strony i oprogramowanie na zamówienie',
 'Szybkie, dostępne strony i aplikacje szyte pod proces, którego nie obsłuży żadne gotowe narzędzie.',
 'Code', 6, TRUE);

-- ─── FAQ ────────────────────────────────────────────────────────────────────
-- Odpowiedzi trafiają do bazy wiedzy RAG, więc muszą być zgodne z granicami
-- decyzyjnymi chatbota: żadnych kwot, terminów ani zobowiązań.
DELETE FROM faq_items;

INSERT INTO faq_items (question, answer, sort_order, is_active) VALUES
('Ile kosztuje wdrożenie automatyzacji?',
 'Każda wycena jest indywidualna, bo zależy od liczby procesów, systemów do połączenia i skali działania. Dlatego zaczynamy od bezpłatnej konsultacji: po niej wiesz, co da się zrobić i ile to kosztuje, bez żadnych zobowiązań.',
 1, TRUE),

('Jak długo trwa wdrożenie?',
 'Zależy od zakresu. Pojedynczą automatyzację uruchamiamy szybciej niż integrację kilku systemów naraz. Konkretny termin ustalam po konsultacji, gdy znam już Twoje procesy — nie obiecuję dat w ciemno.',
 2, TRUE),

('Czy muszę znać się na technologii?',
 'Nie. Moją rolą jest przełożyć Twój proces na działające rozwiązanie i przekazać je w formie, którą obsłużysz bez wiedzy technicznej. Po wdrożeniu dostajesz instrukcję i wsparcie.',
 3, TRUE),

('Co z bezpieczeństwem moich danych?',
 'Pracuję na Twoich kontach i Twojej infrastrukturze, z dostępami ograniczonymi do niezbędnego minimum. Zakres przetwarzania danych ustalamy pisemnie przed startem, zgodnie z RODO.',
 4, TRUE),

('Co, jeśli automatyzacja przestanie działać?',
 'Automatyzacje mają monitoring i powiadomienia o błędach, więc o problemie dowiadujesz się, zanim zauważy go klient. Zasady wsparcia po wdrożeniu ustalamy na starcie, żebyś nie został sam z awarią.',
 5, TRUE),

('Od czego zacząć, gdy nie wiem, co automatyzować?',
 'Od rozmowy. Zwykle wystarczy opowiedzieć, na co schodzi najwięcej czasu w tygodniu — wąskie gardła widać po kilkunastu minutach. Bezpłatna konsultacja właśnie temu służy.',
 6, TRUE);
