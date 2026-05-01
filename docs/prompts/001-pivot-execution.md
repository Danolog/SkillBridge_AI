# Misja: pivot SkillBridge AI z mikro-kursów na Project Marketplace

Wdrażasz pivot produktu zgodnie z poniższym Decision Documentem. Praca dzieli się na
ponumerowane atomowe kroki. Każdy krok kończy się commitem, a przed przejściem do
następnego musi przejść pełen test-gate. Pracujesz na nowym branchu, PR otwierasz dopiero
po Step 4.4.

---

## Reguły operacyjne (BEZWZGLĘDNE)

1. **Branch**: utwórz na początku `feat/project-marketplace` od `main`. Nie pracuj na main.
2. **Commit per krok**: jeden krok = jeden commit. Format: conventional commits
   (`feat(projects): ...`, `chore(db): ...`, `refactor(ai): ...`, `test(...)`, `docs(...)`).
3. **Test-gate po każdym kroku — wszystkie trzy muszą zwrócić 0 błędów / 0 warnings:**

   ```
   pnpm build
   pnpm lint
   pnpm test:run
   ```

   Jeśli krok dotyczy schemy DB, dodatkowo: `pnpm db:generate` (musi zwrócić czystą
   migrację) i `pnpm db:push` na lokalnym Postgresie.
4. **Jeśli test-gate nie przechodzi: NIE przechodź do następnego kroku.** Napraw albo
   zgłoś blocker w komentarzu i czekaj na decyzję.
5. **Język**: UI i wszystkie teksty user-facing po polsku. Kod, komentarze, nazwy zmiennych
   po angielsku. Spójne z istniejącymi konwencjami w `CLAUDE.md`.
6. **Stack**: bez nowych dużych zależności. Jeśli pojawia się potrzeba (np. queue, pgvector),
   zgłoś jako blocker — nie instaluj samodzielnie.
7. **AI model**: `anthropic("claude-sonnet-4-6")` dla generacji jakościowej (brief, review),
   `claude-haiku-4-5-20251001` dla matchmakera. Nie używaj innych.
8. **Każda zmiana DB**: aktualizuj `src/lib/db/schema.ts`, generuj migrację przez
   `pnpm db:generate`, commituj plik migracji razem z kodem.
9. **Czy się odzywasz?** Pytaj tylko gdy: (a) jakaś decyzja jest poza Decision Documentem,
   (b) kod produkcyjny wymagałby breaking change w istniejącym API,
   (c) test-gate failuje powtarzalnie po dwóch próbach naprawy.

---

## Decision Document (skrót — pełna wersja powstaje w Step 0.2)

**Goal**: zastąpić mikro-kursy AI marketplace'em realnych projektów graduowanych 1–5,
łączących studentów z otwartymi danymi, OSS i (w fazie C) firmami partnerskimi. AI w
roli matchmakera, brief writera, reviewera — nie generatora pełnej treści.

**Kluczowe decyzje (zamknięte)**:

- Pełen pivot, nie równoległa koegzystencja. `microCourses` tabela zostaje (deprecated,
  read-only), nowe wpisy nie powstają. Sidebar nav `/micro-courses` znika.
- Teoria/wyjaśnienia teoretyczne wracają jako **Learning Steps inline w briefie projektu**,
  generowane przez `generate-brief.ts` (które używa `generate-micro-course.ts` jako helpera).
- MVP fazy A: tylko źródła open-data + OSS. Partnerów (L4+) odraczamy do osobnej iteracji.
- Matchmaker: keyword overlap + LLM rerank (bez embeddings — to faza B).
- AI review submission: synchronous z `maxDuration = 60` (queue async to faza B).
- Wszystkie nowe dane przez Drizzle migrations (nie `db:push` standalone). Adopcja
  generowanych migracji to Step 1.1.
- Auth: zostaje Better Auth (student) + faculty cookie (panel uczelni). Partner module
  i unified roles to faza C.

**Out of scope dla tej iteracji**: payments, mobile, międzynarodowość, partner module,
NDA flow, embeddings, async review queue, L4–L5 projektów.

---

## Plan implementacji — kroki atomowe

Każdy krok ma: cel, deliverables, jak testować, treść commita.

### FAZA 0 — Setup

**Step 0.1: Branch + odświeżenie CLAUDE.md**

- Utwórz branch `feat/project-marketplace` od `main`.
- Przeczytaj `CLAUDE.md` — sekcja „Implementation Status" jest mocno nieaktualna
  (mówi o większości features jako planowanych, podczas gdy git log i kod pokazują że
  features 01–09 są zaimplementowane). Zaktualizuj sekcję do faktycznego stanu PRZED
  rozpoczęciem pivota.
- Test-gate: `pnpm build && pnpm lint && pnpm test:run`
- Commit: `docs(claude): sync implementation status with actual codebase`

**Step 0.2: Decision Document**

- Utwórz `docs/decisions/001-project-marketplace.md` z pełną treścią Decision Documentu
  (rozszerzony skrót z tego briefu, plus: 10 kluczowych decyzji w tabeli, lista open
  questions, risks & mitigations, implementation order, out of scope). Skopiuj poniższą
  strukturę i wypełnij.
- Test-gate: `pnpm build && pnpm lint && pnpm test:run`
- Commit: `docs(decisions): add 001 project marketplace pivot`

### FAZA 1 — Fundament DB

**Step 1.1: Adopcja Drizzle migrations**

- Wygeneruj baseline migrację z aktualnej schemy: `pnpm db:generate`. Zacommituj
  artefakty z `drizzle/` jeśli takiego folderu jeszcze nie ma.
- Zweryfikuj na świeżej bazie lokalnej, że `pnpm db:migrate` odbudowuje schemat.
- Zaktualizuj `CLAUDE.md`: usuń notkę „use `pnpm db:push` in development (no migration
  files needed until production)" — od teraz migracje są źródłem prawdy.
- Test-gate: `pnpm build && pnpm lint && pnpm test:run && pnpm db:generate`
- Commit: `chore(db): adopt drizzle migrations as source of truth`

**Step 1.2: Schemat Project Marketplace**

- Dodaj do `src/lib/db/schema.ts`:
  - enum `project_level` (`L1 | L2 | L3 | L4 | L5`)
  - enum `project_source_type` (`open_data | oss | partner | ngo | faculty`)
  - enum `project_competency_role` (`required | acquired`)
  - enum `submission_status` (`in_progress | submitted | verified | rejected`)
  - tabela `projects` (id uuid, slug text unique, title text, description text,
    level, estimatedHours int, sourceType, sourceUrl text nullable,
    partnerId nullable (na razie text, fk dodamy z partner module),
    exclusivity boolean default false, briefTemplate text nullable,
    rubricJson jsonb, status text default 'active', timestamps)
  - tabela `projectCompetencies` (projectId fk → projects, competencyName text, role)
  - tabela `projectSubmissions` (id, studentId fk → students, projectId fk → projects,
    repoUrl text nullable, notebookUrl text nullable, additionalUrls jsonb default [],
    submittedAt timestamp nullable, aiReviewJson jsonb nullable,
    score int nullable, status, timestamps, index na studentId+projectId)
  - tabela `projectSources` (id, type, url, lastSyncedAt nullable) — placeholder na
    przyszłą automatyzację ingestion, dla MVP unused ale schema-ready
- Dodaj relacje: `projects` ↔ `projectCompetencies`, `projects` ↔ `projectSubmissions`,
  `students` ↔ `projectSubmissions`.
- Dodaj testy schematu w `src/lib/db/__tests__/schema.test.ts` (na wzór istniejących).
- `pnpm db:generate` musi wyprodukować jedną nową migrację.
- Test-gate: pełen + `pnpm db:generate && pnpm db:push` na lokalnej bazie
- Commit: `feat(db): add project marketplace schema (projects, submissions, sources)`

**Step 1.3: Seed projektów L1–L3**

- Rozszerz `src/lib/db/seed.ts` o 20 projektów (15 open-data + 5 OSS) rozłożonych
  po 3 ścieżkach kariery z istniejącego seedu (Data Analyst, Frontend Developer,
  Backend Developer). Każdy projekt ma:
  - poziom L1, L2 albo L3 (rozkład: 8 × L1, 8 × L2, 4 × L3)
  - 2–5 wpisów w `projectCompetencies`
  - realne `sourceUrl` (dane.gov.pl, BDL GUS, GitHub OSS)
  - `briefTemplate` (placeholder na razie, AI go uzupełni przy generowaniu)
  - `rubricJson` z 3–5 kryteriami akceptacji
- Dodaj test `seed-data.test.ts`: dokładnie 20 projektów, każdy ma min. 2 kompetencje,
  każdy `sourceUrl` jest poprawnym URL.
- Test-gate: pełen + `pnpm db:seed` na czystej bazie
- Commit: `feat(seed): add 20 starter projects across L1-L3`

### FAZA 2 — Backend AI + API

**Step 2.1: AI matchmaker `match-projects.ts`**

- `src/lib/ai/match-projects.ts`: funkcja `matchProjects(studentId, gapId, limit = 5)`.
- Algorytm: keyword overlap (kompetencje studenta + nazwa luki vs `projectCompetencies`),
  filtrowanie po `careerGoal` studenta, sortowanie top 20 → LLM rerank (Haiku) z
  uzasadnieniem „dlaczego ten projekt dla TEGO studenta" → zwróć top 5.
- Wynik: `{ projectId, matchScore (0-100), reasoning (string PL) }[]`.
- Defensywny JSON parsing (jak w istniejących modułach AI).
- Testy w `__tests__/match-projects.test.ts` (mock AI SDK, 4 scenariusze: pełen match,
  częściowy, brak danych, fallback gdy LLM zwróci śmieci).
- Test-gate: pełen
- Commit: `feat(ai): add project matchmaker with hybrid scoring`

**Step 2.2: API `/api/projects/recommend`**

- `src/app/api/projects/recommend/route.ts` GET z query `gapId`.
- Auth: Better Auth session check (jak w istniejących route'ach).
- `maxDuration = 60`.
- Test-gate: pełen
- Commit: `feat(api): add projects recommend endpoint`

**Step 2.3: API `/api/projects/[id]` + lista `/api/projects`**

- Lista z filtrami: `level`, `sourceType`, `careerGoal`, `maxHours`. Public (no auth).
- Detail: pełne dane projektu + `projectCompetencies`. Public.
- Test-gate: pełen
- Commit: `feat(api): add projects catalog and detail endpoints`

**Step 2.4: Refactor `generate-micro-course.ts` → helper + nowy `generate-brief.ts`**

- Wyodrębnij z `generate-micro-course.ts` funkcję `generateLearningSteps(competency, ...)`
  która generuje 1–3 krótkie sekcje teorii (ale nie cały kurs).
- Nowy plik `src/lib/ai/generate-brief.ts`: funkcja `generateProjectBrief(projectId, studentId)`
  która składa: cel, dane wejściowe, suggested steps (z uwzględnieniem semestru i sylabusa
  studenta), Learning Steps (przez `generateLearningSteps` dla brakujących kompetencji),
  definicja sukcesu, kryteria akceptacji z `rubricJson`.
- `generate-micro-course.ts` ZOSTAJE jako helper, ale jego dotychczasowy publiczny entry
  point (`generateMicroCourse`) oznacz `@deprecated` w JSDoc i nie wywołuj go z nowych
  miejsc.
- Testy: `generate-brief.test.ts` z mockami.
- Test-gate: pełen
- Commit: `refactor(ai): extract learning-steps helper, add project brief generator`

**Step 2.5: API `/api/projects/[id]/brief` (POST — generowanie spersonalizowane)**

- Generuje brief dla zalogowanego studenta + projektu, cache'uje wynik w
  `projectSubmissions.aiReviewJson` jako `brief` field (na czas MVP — w fazie B
  oddzielimy do swojej tabeli).
- `maxDuration = 60`.
- Test-gate: pełen
- Commit: `feat(api): add personalized project brief endpoint`

**Step 2.6: AI review `review-submission.ts` + endpoint submit**

- `src/lib/ai/review-submission.ts`: pobiera URL repo/notebook, rubrik z projektu,
  generuje feedback + score 0–100 + flag `cheatRiskScore` (commit history check
  — fetch z GitHub API jeśli to repo, w przeciwnym razie tylko struktura).
- `src/app/api/projects/[id]/submit/route.ts` POST: zapisuje submission,
  uruchamia review synchronously (`maxDuration = 60`), aktualizuje `submission.status`
  do `verified` jeśli `score >= 70` i `cheatRiskScore < 0.5`, inaczej `submitted`
  (manual review pending) lub `rejected`.
- Testy z mock fetch + mock AI.
- Test-gate: pełen
- Commit: `feat(api): add project submission with AI review`

### FAZA 3 — Frontend

**Step 3.1: Strona katalogu `/projects`**

- `src/app/(dashboard)/projects/page.tsx` — server component, fetch listy z DB.
- `src/components/projects/project-catalog.tsx` — client component z filtrami
  (level, sourceType, maxHours). Filtry sterowane query params (URL state).
- `src/components/projects/project-card.tsx` — pojedyncza karta z poziomem, czasem,
  liczbą kompetencji.
- shadcn/ui: `card`, `select`, `separator`. lucide icons.
- Testy komponentów (na wzór gap-card.test.tsx).
- Test-gate: pełen
- Commit: `feat(projects): add catalog page with filters`

**Step 3.2: Strona projektu `/projects/[id]`**

- `src/app/(dashboard)/projects/[id]/page.tsx` — server component, fetch projektu
  + lista kompetencji + sprawdzenie czy student już ma submission.
- Brief generowany on-demand button „Wygeneruj spersonalizowany brief" (call do
  `/api/projects/[id]/brief`).
- Wyświetlanie Learning Steps inline.
- Test-gate: pełen
- Commit: `feat(projects): add project detail page with personalized brief`

**Step 3.3: Submission flow component**

- `src/components/projects/submission-form.tsx` — pole na URL repo + opcjonalnie
  notebook URL + dodatkowe linki, submit do `/api/projects/[id]/submit`, loading
  state przez 30–60 s („Sprawdzamy twoje rozwiązanie…"), wyświetlenie wyniku
  (score, feedback, status).
- Test-gate: pełen
- Commit: `feat(projects): add submission form with AI review feedback`

**Step 3.4: Replace gap-card CTA**

- W `src/components/gap-analysis/gap-card.tsx`: zamień przycisk „Generuj kurs"
  (lub jego odpowiednik) na „Znajdź projekty" linkujący do `/projects?gapId=<id>`.
- W `/projects` przy obecnym `gapId` query — pokaż na górze sekcję „Rekomendowane
  pod twoją lukę: <nazwa>" z wynikami z `/api/projects/recommend`.
- Aktualizuj test gap-card.
- Test-gate: pełen
- Commit: `refactor(gap-analysis): replace course CTA with project recommendations`

**Step 3.5: Passport — sekcja Verified Project Receipts**

- `src/components/passport/project-receipts.tsx` — lista submissions z statusem
  `verified`, każda receipt ma: tytuł projektu, level, datę, score, link do
  artefaktu (repoUrl/notebookUrl), AI feedback (collapsed).
- Render w `passport-view.tsx` i `passport-public.tsx`.
- Update PDF export, żeby zawierał receipts.
- Aktualizuj testy + dodaj nowy test.
- Test-gate: pełen
- Commit: `feat(passport): add verified project receipts section`

**Step 3.6: Sidebar nav cleanup**

- W `src/components/dashboard/sidebar.tsx`: usuń wpis dla `/micro-courses`,
  dodaj `/projects` z ikoną (lucide `Briefcase` lub `FolderKanban`).
- Strona `/micro-courses` zostaje w kodzie, ale dodaj na górze banner
  „Funkcja przeniesiona — zobacz Projekty" z linkiem.
- Aktualizuj test sidebar.
- Test-gate: pełen
- Commit: `refactor(nav): replace micro-courses with projects in sidebar`

### FAZA 4 — Walidacja końcowa + PR

**Step 4.1: E2E test pełnej ścieżki**

- Dodaj `tests/e2e/project-flow.sh` na wzór istniejących skryptów: signup →
  onboarding → wymuś gap → recommend → wybierz projekt → submit URL repo →
  weryfikuj receipt w passport.
- Uruchom przez `pnpm test:e2e`.
- Test-gate: pełen + `pnpm test:e2e`
- Commit: `test(e2e): add full project marketplace flow`

**Step 4.2: README + CLAUDE.md update**

- `README.md`: zaktualizuj sekcję Features — usuń „Micro-Courses" jako oddzielny
  feature, dodaj „Project Marketplace" z opisem 5 poziomów. Wzmianka o Verified
  Project Receipts.
- `CLAUDE.md`: zaktualizuj „Implementation Status" oraz „Project Structure"
  (dodaj `app/(dashboard)/projects/`, `lib/ai/match-projects.ts`,
  `lib/ai/generate-brief.ts`, `lib/ai/review-submission.ts`).
- `.agents/plans/`: dodaj `10-project-marketplace.md` z linkiem do Decision Document.
- Test-gate: pełen
- Commit: `docs: update readme, claude.md, plans for project marketplace`

**Step 4.3: Final validation**

- Pełen test-gate jeszcze raz na świeżym shell: `pnpm install --frozen-lockfile &&
pnpm build && pnpm lint && pnpm test:run && pnpm test:e2e`.
- Jeśli cokolwiek failuje — napraw i recommituj na ten sam branch.
- Bez commita jeśli wszystko zielone.

**Step 4.4: Open PR**

- Push branch: `git push -u origin feat/project-marketplace`.
- Otwórz PR do `main` z tytułem: `feat: pivot to project marketplace (replaces
micro-courses)`.
- W opisie PR użyj poniższego template:

  ```
  ## Cel
  Pivot z generowanych mikro-kursów AI na marketplace realnych projektów
  graduowanych 1–5. AI w roli matchmakera, brief writera i reviewera —
  nie generatora pełnej treści.

  Pełen kontekst: docs/decisions/001-project-marketplace.md

  ## Co się zmienia
  - Nowa schema: projects, projectCompetencies, projectSubmissions, projectSources
  - Nowe AI: match-projects, generate-brief, review-submission
  - Nowe UI: /projects (katalog + detail + submission flow)
  - Refactor: gap-analysis CTA → "Find projects"
  - Passport: Verified Project Receipts (z linkami do artefaktów)
  - Sidebar: /micro-courses ukryte, /projects widoczne
  - Adopcja Drizzle migrations jako source of truth dla DB
  - 20 zaseedowanych projektów L1–L3 × 3 ścieżki kariery

  ## Co NIE zmienia (świadomie odroczone)
  - Partner module + L4–L5 (faza C)
  - Async review queue (faza B)
  - Embeddings dla matchmakera (faza B)
  - Tabela microCourses pozostaje (deprecated, read-only)

  ## Walidacja
  - [ ] pnpm build (0 errors)
  - [ ] pnpm lint (0 warnings)
  - [ ] pnpm test:run (wszystkie passed, X new tests)
  - [ ] pnpm test:e2e (project-flow.sh passed)
  - [ ] pnpm db:generate produkuje czystą migrację

  ## Plan migracyjny
  - DB: jedna nowa migracja (zaaplikowana automatycznie przez `pnpm db:migrate`)
  - Brak breaking changes dla istniejących endpointów
  - microCourses dane zostają nietknięte
  ```

- Po otwarciu PR: zatrzymaj się i raportuj numer PR + podsumowanie.

---

## Co robić, gdy coś idzie źle

- **Test failuje po Twojej zmianie** → napraw i recommituj na ten sam krok. Nie idź dalej.
- **Test failuje na coś, czego nie tknąłeś** → najpierw zbadaj, czy to flaky test
  (uruchom 3×). Jeśli stabilnie failuje — to blocker, raportuj.
- **Decyzja architektoniczna nie pokryta w Decision Documencie** → zatrzymaj się,
  zaproponuj 2–3 opcje z trade-offami, czekaj.
- **Migracja DB konfliktuje z istniejącymi danymi** → backfill script jako część
  tego samego commita; nie zostawiaj sytuacji niespójnej.
- **AI cost concern** → jeśli któryś krok wymaga więcej niż 50 wywołań AI w testach,
  zaproponuj mock/fixture zamiast realnych calli.

Pracuj sekwencyjnie, jeden krok po drugim, commit po każdym kroku, test-gate po każdym
commicie. Powodzenia.
