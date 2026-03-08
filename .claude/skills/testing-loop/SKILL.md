---
name: testing-loop
description: >
  Kompleksowy skill do testowania aplikacji Next.js/React w dwóch trybach:
  (1) Feature Testing Loop — testuj każdy feature natychmiast po napisaniu,
  zanim przejdziesz do następnego; (2) Pre-Production Testing — pełny audyt
  i CI/CD setup dla gotowej aplikacji. Użyj tego skilla zawsze gdy:
  użytkownik kończy feature i chce go przetestować, gdy projekt ma bugi
  i trzeba je znaleźć systematycznie, gdy trzeba skonfigurować CI/CD pipeline,
  gdy testy są flaky lub wolne, gdy aplikacja idzie na produkcję i potrzebuje
  quality gate. Skill zawiera zakodowane lekcje z realnego projektu —
  konkretne antywzorce i gotowe rozwiązania dla Next.js + Better Auth +
  Playwright + GitHub Actions.
---

# Testing Loop Skill

Skill działa w dwóch trybach. Wybierz właściwy na podstawie kontekstu.

## Wybór trybu

**Tryb A — Feature Testing Loop** (podczas budowania)
→ Użyj gdy: właśnie skończono pisać feature i chcesz go przetestować od razu

**Tryb B — Pre-Production Testing** (gotowa aplikacja)  
→ Użyj gdy: aplikacja jest gotowa, ma bugi, trzeba przygotować ją na produkcję

---

## TRYB A — Feature Testing Loop

### Cel
Każdy feature jest przetestowany i zacommitowany zanim zaczniesz następny.
Bugi naprawiasz gdy masz kontekst — nie tydzień później.

### Prompt dla agenta po skończeniu feature

```
Feature: [NAZWA] jest gotowy. Uruchom Feature Testing Loop.

1. Przeanalizuj nowe/zmienione pliki w src/ od ostatniego commita:
   git diff --name-only HEAD

2. Dla każdego nowego pliku napisz:
   UNIT TESTY (w __tests__/):
   - Każda funkcja: happy path + edge cases
   - Edge cases: null, undefined, empty array, 0, negative numbers
   - Error paths: co gdy API zwraca błąd, baza nie odpowiada
   
   E2E TESTY (w tests/):
   - Happy path flow (tag @smoke jeśli krytyczny dla aplikacji)
   - Error path (błędne dane, brak uprawnień)
   - Tag @full dla pozostałych

3. Uruchom testy:
   pnpm test
   npx playwright test --grep @smoke

4. Jeśli wszystko zielone:
   git add .
   git commit -m "feat: [NAZWA] + tests"

5. Jeśli testy failują:
   Napraw bugi ZANIM zrobisz commit.
   Nie przechodzisz do następnego feature z czerwonymi testami.
```

### Kryteria tagowania testów

```
@smoke  → czy aplikacja w ogóle działa po tej zmianie?
          max 10-15 testów total w projekcie
          przykłady: logowanie, główny flow, home page

@full   → wszystkie pozostałe scenariusze
          edge cases, walidacje, rzadkie ścieżki

@production → tylko read-only, nigdy nie modyfikują danych
              health check, czy strony się ładują
```

---

## TRYB B — Pre-Production Testing

Wykonuj etapy w tej kolejności. Nie przeskakuj.

### Etap 1 — Audyt (zawsze pierwszy)

```
Przeprowadź pełny audyt projektu:
1. pnpm run typecheck → zapisz wszystkie błędy TypeScript
2. pnpm run lint → zapisz problemy ESLint
3. pnpm audit → zapisz podatności
4. Przejrzyj src/ szukając: brakujących try/catch, null errors,
   unused imports, N+1 queries w pętlach
5. Wygeneruj AUDIT_REPORT.md z priorytetyzowaną listą
```

### Etap 2 — Naprawy (TypeScript → Security → Logika)

```
Naprawiaj w tej kolejności:
1. TypeScript errors (blokują wszystko inne)
2. Critical/High vulnerabilities: pnpm audit fix
3. N+1 queries → Prisma/Drizzle include/select zamiast pętli
4. Brakujące indeksy DB → composite indexes dla najczęstszych zapytań
5. React re-renders → React.memo + useCallback gdzie potrzeba

Po każdej naprawie: pnpm test → musi być zielone zanim idziesz dalej
```

### Etap 3 — Setup testów

Przeczytaj: `references/test-setup.md`

### Etap 4 — Podział na warstwy i CI/CD

Przeczytaj: `references/ci-cd-setup.md`

### Etap 5 — Weryfikacja produkcyjna

```
Przed deploymentem:
pnpm test                    → musi być 100% green
npx playwright test @smoke   → musi być 0 failed, 0 flaky
pnpm typecheck               → 0 errors
pnpm audit --audit-level=critical → 0 critical
pnpm build:ci                → SUCCESS

Po deploymencie na Vercel:
npx playwright test --grep @production
→ sprawdza czy produkcja żyje (nie modyfikuje danych)
```

---

## ⚠️ ANTYWZORCE — nigdy nie rób tego

Zakodowane lekcje z realnego projektu. Każdy z tych błędów kosztował
godziny debugowania w CI.

### 1. React Hydration w CI

```typescript
// ❌ ZŁE — zawodne w CI (React może nie być jeszcze hydrated)
await page.keyboard.press('Enter');
await page.waitForLoadState('networkidle'); // Next.js nigdy nie osiąga networkidle

// ✅ DOBRE — czekaj na hydration, potem kliknij przycisk
await page.waitForFunction(() => {
  const btn = document.querySelector('button[type="submit"]');
  return btn !== null && !btn.hasAttribute('disabled');
}, { timeout: 15000 });
await page.locator('button[type="submit"]').click();
```

### 2. Global Setup — logowanie przez UI vs API

```typescript
// ❌ ZŁE — logowanie przez UI w global setup jest flaky
await page.goto('/login');
await page.fill('#email', email);
await page.keyboard.press('Enter'); // race condition z hydration

// ✅ DOBRE — logowanie przez API, deterministyczne, < 1s
const response = await page.request.post('/api/auth/sign-in/email', {
  data: { email: OWNER_EMAIL, password: OWNER_PASSWORD },
  headers: { 'Content-Type': 'application/json' }
});
await page.context().storageState({ path: 'tests/.auth/owner.json' });
```

### 3. waitUntil w Next.js

```typescript
// ❌ ZŁE — Next.js production nigdy nie osiąga networkidle
// (keep-alive connections, SSE, polling)
await page.goto('/login', { waitUntil: 'networkidle' }); // timeout po 60s

// ✅ DOBRE
await page.goto('/login', { waitUntil: 'load' });
// Dla formularzy wystarczy:
await page.goto('/login', { waitUntil: 'domcontentloaded' });
```

### 4. Seed bazy danych

```typescript
// ❌ ZŁE — insert failuje jeśli dane już istnieją
await db.insert(users).values({ email: 'test@test.com', ... });

// ✅ DOBRE — idempotentny seed, można uruchomić wielokrotnie
await db.insert(users)
  .values({ email: 'test@test.com', emailVerified: true, ... })
  .onConflictDoUpdate({
    target: users.email,
    set: { emailVerified: true }
  });

// ⚠️ WAŻNE: Better Auth wymaga wpisu w tabeli verification
// samo pole emailVerified: true w tabeli user NIE wystarczy
await db.insert(verifications).values({
  identifier: 'test@test.com',
  value: 'verified',
  expiresAt: new Date('2099-01-01')
}).onConflictDoNothing();
```

### 5. N+1 Queries

```typescript
// ❌ ZŁE — N+1: 1 query na listę + N queries na każdy element
const employees = await db.select().from(employeesTable);
for (const emp of employees) {
  const appointments = await db.select()  // N dodatkowych queries!
    .from(appointmentsTable)
    .where(eq(appointmentsTable.employeeId, emp.id));
}

// ✅ DOBRE — 1 query z JOIN lub inArray
const employees = await db.select().from(employeesTable);
const employeeIds = employees.map(e => e.id);
const appointments = await db.select()
  .from(appointmentsTable)
  .where(inArray(appointmentsTable.employeeId, employeeIds));
// Potem groupBy w JS
```

### 6. Podatności — pnpm overrides zamiast direct update

```json
// ✅ DOBRE — gdy nie możesz zaktualizować paczki bezpośrednio
// (tranzytywna zależność), użyj overrides w package.json:
{
  "pnpm": {
    "overrides": {
      "vulnerable-package": ">=safe-version"
    }
  }
}
```

---

## Struktura plików testowych (standard)

```
projekt/
├── __tests__/                    ← unit testy
│   ├── components/
│   └── lib/
├── tests/                        ← E2E testy Playwright
│   ├── auth/
│   │   └── authentication.spec.ts
│   ├── dashboard/
│   │   ├── employees.spec.ts
│   │   └── ...
│   ├── production/
│   │   └── health.spec.ts        ← tylko @production testy
│   └── global-setup.ts           ← API login, storageState
├── scripts/
│   └── seed-test.ts              ← idempotentny seed
├── CLAUDE.md                     ← kontekst dla agentów
└── playwright.config.ts
```

---

## CLAUDE.md — minimalny szablon

```markdown
# Project: [Nazwa]

## Stack
- Frontend: [React/Next.js/etc] + TypeScript
- Backend: [Node/Express/etc]
- DB: [PostgreSQL/MySQL] + [Prisma/Drizzle]
- Auth: [Better Auth/NextAuth/etc]
- Testy: Vitest + Playwright

## Komendy
- `pnpm dev` — development
- `pnpm build:ci` — build bez DB connection (CI)
- `pnpm test` — unit testy
- `pnpm test:coverage` — unit testy + coverage
- `pnpm db:seed:test` — seed testowej bazy (idempotentny)

## Zasady dla agentów
- Naprawiaj błędy od fundamentalnych (TypeScript) do złożonych (logika)
- Po każdej zmianie uruchom: pnpm test
- Nie commituj z czerwonymi testami
- Nie używaj networkidle w Playwright (Next.js)
- Logowanie w global setup zawsze przez API, nie przez UI
```

---

## Referencje

- `references/test-setup.md` — pełna konfiguracja Playwright, 
  global setup, storageState, seed
- `references/ci-cd-setup.md` — GitHub Actions workflows dla 
  trzech warstw testów (@smoke/@full/@production)
