# Feature: Competency Passport + PDF Export + Public Link

Read `00-master-roadmap.md`, `01-database-schema.md`, `04-dashboard-layout.md` before implementing.
**Requires Features 01, 03, 04, 07.**

## Feature Description

Student's digital Competency Passport: profile + market coverage progress bar + competency badges (green/yellow/red). PDF export via client-side generation. Public shareable link at `/passport/[uuid]` — read-only, no login required.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: `src/app/(dashboard)/passport/`, `src/app/passport/[id]/`, `src/app/api/passport/`
**Dependencies**: Features 01, 03, 04, 07 (completion updates passport)

---

## CONTEXT REFERENCES

### External Packages to Install

```bash
pnpm add jspdf html2canvas
```

**jspdf docs**: https://raw.githack.com/MrRio/jsPDF/master/docs/
**html2canvas docs**: https://html2canvas.hertzen.com/

### Files to Read Before Implementing

- `src/lib/db/schema.ts` — `passports` table: `id (uuid = public link), studentId, marketCoveragePercent`
- `src/lib/db/schema.ts` — `competencies` table: `name, status, marketPercentage`
- `src/lib/db/schema.ts` — `students` table: `university, fieldOfStudy, semester, careerGoal`
- `src/app/(dashboard)/dashboard/page.tsx` — server component + DB query pattern

### New Files to Create

- `src/app/(dashboard)/passport/page.tsx` — authenticated passport view
- `src/app/passport/[id]/page.tsx` — PUBLIC passport view (no auth)
- `src/app/api/passport/route.ts` — GET passport data
- `src/components/passport/passport-view.tsx` — "use client" passport card
- `src/components/passport/passport-public.tsx` — public read-only view
- `src/components/passport/competency-badge.tsx` — colored badge component
- `src/components/passport/pdf-export.tsx` — PDF generation button

### Passport Data Shape

```typescript
type PassportData = {
	id: string; // UUID = public link
	student: {
		name: string;
		university: string;
		fieldOfStudy: string;
		semester: number;
		careerGoal: string;
	};
	marketCoveragePercent: number;
	competencies: Array<{
		name: string;
		status: "acquired" | "in_progress" | "missing";
		marketPercentage?: number;
	}>;
	generatedAt: string;
};
```

---

## IMPLEMENTATION PLAN

### Phase 1: API

**`src/app/api/passport/route.ts`** (GET — authenticated):
```typescript
// Auth → get student → get passport + competencies
// Return: PassportData
```

**`src/app/api/passport/[id]/route.ts`** (GET — PUBLIC, no auth):
```typescript
// GET passport by public UUID
// No auth required — read-only
// Return: PassportData (without sensitive info)
// 404 if not found
```

**Market coverage calculation** (helper function):
```typescript
function calculateCoverage(competencies: Competency[]): number {
	const total = competencies.length;
	if (total === 0) return 0;
	const acquired = competencies.filter((c) => c.status === "acquired").length;
	const inProgress = competencies.filter((c) => c.status === "in_progress").length;
	return Math.round(((acquired + inProgress * 0.5) / total) * 100);
}
```

### Phase 2: Competency Badge

**`src/components/passport/competency-badge.tsx`**:
```typescript
const STATUS_STYLES = {
	acquired: "bg-green-100 text-green-800 border border-green-300",
	in_progress: "bg-yellow-100 text-yellow-800 border border-yellow-300",
	missing: "bg-red-100 text-red-800 border border-red-300",
};

const STATUS_LABELS = {
	acquired: "Masz",
	in_progress: "W trakcie",
	missing: "Brakuje",
};
// Render as small pill badge with name + status label
```

### Phase 3: Passport View (authenticated)

**`src/components/passport/passport-view.tsx`** — "use client":

```
┌─────────────────────────────────────┐
│ 🏆 Paszport Kompetencji             │
│─────────────────────────────────────│
│ [Avatar initials]                   │
│ Jan Kowalski                        │
│ WSB Merito Warszawa                 │
│ Informatyka · Sem. 3               │
│ 🎯 Cel: Frontend Developer          │
│─────────────────────────────────────│
│ Pokrycie wymagań rynkowych          │
│ ████████░░ 73%                      │
│─────────────────────────────────────│
│ Kompetencje (20):                   │
│ [JavaScript ✓] [React ✓] [Python ×] │
│ [SQL ⚡] [Git ✓] [TypeScript ×]    │
│ ...                                 │
│─────────────────────────────────────│
│ [📥 Eksportuj PDF] [🔗 Kopiuj link] │
└─────────────────────────────────────┘
```

**"Kopiuj link" button**:
```typescript
const publicUrl = `${window.location.origin}/passport/${passportId}`;
await navigator.clipboard.writeText(publicUrl);
toast.success("Link skopiowany!");
```

### Phase 4: PDF Export

**`src/components/passport/pdf-export.tsx`** — "use client":

```typescript
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export function PdfExportButton({ passportRef }: { passportRef: RefObject<HTMLDivElement> }) {
	const [generating, setGenerating] = useState(false);

	const handleExport = async () => {
		if (!passportRef.current) return;
		setGenerating(true);
		try {
			const canvas = await html2canvas(passportRef.current, { scale: 2 });
			const imgData = canvas.toDataURL("image/png");
			const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
			const width = pdf.internal.pageSize.getWidth();
			const height = (canvas.height * width) / canvas.width;
			pdf.addImage(imgData, "PNG", 0, 0, width, height);
			pdf.save("paszport-kompetencji.pdf");
		} finally {
			setGenerating(false);
		}
	};

	return (
		<Button onClick={handleExport} disabled={generating} variant="outline">
			{generating ? "Generowanie..." : "📥 Eksportuj PDF"}
		</Button>
	);
}
```

**In passport-view.tsx**: wrap passport content in a `ref` div, pass ref to PdfExportButton.

### Phase 5: Public Passport Page

**`src/app/passport/[id]/page.tsx`** — server component (NO auth check):
```typescript
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { passports } from "@/lib/db/schema";
import { notFound } from "next/navigation";
import { PassportPublic } from "@/components/passport/passport-public";

export default async function PublicPassportPage({ params }: { params: { id: string } }) {
	const passport = await db.query.passports.findFirst({
		where: eq(passports.id, params.id),
		with: { student: { with: { user: true, competencies: true } } },
	});

	if (!passport) notFound();

	return <PassportPublic data={passport} />;
}
```

**`src/components/passport/passport-public.tsx`** — server component:
- Same layout as passport-view but WITHOUT: sidebar, export button, edit options
- Add "Stwórz swój Paszport →" CTA at bottom (links to `/`)
- No navigation bar — clean standalone page

---

## STEP-BY-STEP TASKS

### TASK 1: INSTALL packages
- **RUN**: `pnpm add jspdf html2canvas`
- **VALIDATE**: `pnpm build`

### TASK 2: CREATE `src/app/api/passport/route.ts`
- **IMPLEMENT** GET with auth + full passport data
- **IMPLEMENT** coverage calculation helper
- **VALIDATE**: `pnpm build`

### TASK 3: CREATE `src/app/api/passport/[id]/route.ts`
- **IMPLEMENT** GET by public UUID, no auth
- **IMPLEMENT** 404 for invalid UUID
- **VALIDATE**: `pnpm build`

### TASK 4: CREATE `src/components/passport/competency-badge.tsx`
- **IMPLEMENT** three-color badge (acquired/in_progress/missing)
- **IMPLEMENT** Polish status labels
- **VALIDATE**: `pnpm build`

### TASK 5: CREATE `src/components/passport/pdf-export.tsx`
- **IMPLEMENT** html2canvas + jsPDF export
- **GOTCHA**: `html2canvas` may not capture external fonts — use system fonts fallback
- **GOTCHA**: jspdf is client-only — no SSR
- **VALIDATE**: `pnpm build`

### TASK 6: CREATE `src/components/passport/passport-view.tsx`
- **IMPLEMENT** full passport layout with ref for PDF
- **IMPLEMENT** copy link button with toast
- **IMPLEMENT** competency badges list
- **IMPLEMENT** progress bar (use Tailwind width utility)
- **VALIDATE**: `pnpm build`

### TASK 7: CREATE `src/app/(dashboard)/passport/page.tsx`
- **IMPLEMENT** server component fetching all passport data
- **VALIDATE**: `pnpm build`, navigate to `/passport`

### TASK 8: CREATE `src/components/passport/passport-public.tsx`
- **IMPLEMENT** read-only passport without nav
- **IMPLEMENT** CTA footer link to `/`
- **VALIDATE**: `pnpm build`

### TASK 9: CREATE `src/app/passport/[id]/page.tsx`
- **IMPLEMENT** public page with notFound() for invalid UUID
- **ADD** metadata: `export async function generateMetadata({ params }) { return { title: "Paszport Kompetencji" } }`
- **VALIDATE**: `pnpm build`, open `/passport/[valid-uuid]` in browser

---

## VALIDATION COMMANDS

```bash
pnpm add jspdf html2canvas
pnpm build
pnpm lint
# Manual:
# 1. Navigate to /passport (authenticated)
# 2. Verify all competencies shown with colored badges
# 3. Verify progress bar shows correct %
# 4. Click "Eksportuj PDF" → verify PDF downloads
# 5. Click "Kopiuj link" → verify toast + URL in clipboard
# 6. Open public URL in incognito → verify read-only view, no nav
# 7. Open invalid UUID → verify 404 page
```

## ACCEPTANCE CRITERIA

- [ ] Passport shows student name, university, career goal
- [ ] Progress bar shows market coverage %
- [ ] All competencies shown with colored badges
- [ ] Polish status labels (Masz/W trakcie/Brakuje)
- [ ] PDF export downloads a-4 formatted file
- [ ] "Kopiuj link" copies public URL, shows toast
- [ ] Public URL `/passport/[id]` accessible without login
- [ ] Public view has no dashboard navigation
- [ ] Invalid UUID returns 404
- [ ] CTA "Stwórz swój Paszport" shown on public page
- [ ] `pnpm build` passes
