# Feature: Dashboard Layout + Navigation

Read `00-master-roadmap.md` before implementing. **Requires Feature 01 and 03 to be completed first.**

## Feature Description

Create the authenticated dashboard shell: layout with sidebar navigation, and the main dashboard hub page with 4 navigation tiles (Skill Map, Gap Analysis, Mikro-kursy, Paszport) and a welcome card.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Low
**Primary Systems Affected**: `src/app/(dashboard)/`, `src/components/`
**Dependencies**: Feature 01 (DB Schema), Feature 03 (Onboarding — students table must exist)

---

## CONTEXT REFERENCES

### Files to Read Before Implementing

- `src/app/(auth)/layout.tsx` — auth layout pattern (centered wrapper)
- `src/app/layout.tsx` — root layout (Geist font, AuthProvider, Toaster)
- `src/lib/auth/server.ts` — `auth` for session check
- `src/lib/db/schema.ts` — `students`, `competencies`, `gaps`, `microCourses` tables
- `src/components/ui/card.tsx`, `button.tsx`, `avatar.tsx`, `separator.tsx`

### New Files to Create

- `src/app/(dashboard)/layout.tsx` — sidebar + top bar shell
- `src/app/(dashboard)/dashboard/page.tsx` — dashboard hub with 4 tiles
- `src/components/dashboard/sidebar.tsx` — navigation sidebar
- `src/components/dashboard/nav-tiles.tsx` — 4 tiles with counts

---

## IMPLEMENTATION PLAN

### Dashboard Layout Structure

```
┌─────────────────────────────────────────┐
│ Header: Logo | User avatar + name       │
├──────────┬──────────────────────────────┤
│ Sidebar  │  Main content area           │
│ ─────    │                              │
│ Dashboard│                              │
│ Skill Map│                              │
│ Gap      │                              │
│ Analysis │                              │
│ Kursy    │                              │
│ Paszport │                              │
│ ─────    │                              │
│ Wyloguj  │                              │
└──────────┴──────────────────────────────┘
```

**Mobile**: sidebar collapses to hamburger menu or bottom navigation.

### Dashboard Hub Content (per PRD section 9)

```
Welcome: "Cześć, [name]! 👋"
Subtitle: "[university] · [fieldOfStudy] · Cel: [careerGoal]"

Progress bar: "Twój Paszport: X% pokrycia rynku"

4 Tiles:
┌─────────────┐ ┌─────────────┐
│ Skill Map   │ │ Gap Analysis│
│ 🗺 [icon]   │ │ ⚠️ [icon]   │
│ 15 komp.    │ │ 5 luk       │
└─────────────┘ └─────────────┘
┌─────────────┐ ┌─────────────┐
│ Mikro-kursy │ │ Paszport    │
│ 📚 [icon]   │ │ 🏆 [icon]   │
│ 2 ukończone │ │ Udostępnij  │
└─────────────┘ └─────────────┘
```

---

## STEP-BY-STEP TASKS

### TASK 1: CREATE `src/app/(dashboard)/layout.tsx`

Server component with auth check:
```typescript
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/login");

	return (
		<div className="flex h-screen">
			<Sidebar user={session.user} />
			<main className="flex-1 overflow-y-auto p-6">{children}</main>
		</div>
	);
}
```

- **GOTCHA**: This layout applies to ALL routes inside `(dashboard)/` — onboarding, dashboard, skill-map, etc.
- **GOTCHA**: The `(dashboard)` route group means the URL path does NOT include "dashboard" in the prefix
- **VALIDATE**: `pnpm build`

### TASK 2: CREATE `src/components/dashboard/sidebar.tsx`

"use client" component (needs router for active state):
```typescript
const navItems = [
	{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/skill-map", label: "Skill Map", icon: Map },
	{ href: "/gap-analysis", label: "Gap Analysis", icon: AlertTriangle },
	{ href: "/micro-courses", label: "Mikro-kursy", icon: BookOpen },
	{ href: "/passport", label: "Paszport", icon: Award },
];
```

- Logo at top: "SkillBridge AI"
- Nav links with active state (highlight current route using `usePathname()`)
- User name + email at bottom
- Logout button using `authClient.signOut()` → `router.push("/")`
- Mobile: responsive — collapses on `md:` breakpoint

### TASK 3: CREATE `src/app/(dashboard)/dashboard/page.tsx`

Server component that fetches student data:
```typescript
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { eq, count } from "drizzle-orm";
import { students, competencies, gaps, microCourses, passports } from "@/lib/db/schema";

export default async function DashboardPage() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/login");

	const student = await db.query.students.findFirst({
		where: eq(students.userId, session.user.id),
	});
	if (!student) redirect("/onboarding");

	// Fetch counts for tiles
	const [competencyCount, gapCount, courseStats, passport] = await Promise.all([
		db.select({ count: count() }).from(competencies).where(eq(competencies.studentId, student.id)),
		db.select({ count: count() }).from(gaps).where(eq(gaps.studentId, student.id)),
		db.select({ count: count() }).from(microCourses).where(eq(microCourses.studentId, student.id)),
		db.query.passports.findFirst({ where: eq(passports.studentId, student.id) }),
	]);

	return (
		<DashboardHub
			user={session.user}
			student={student}
			competencyCount={competencyCount[0]?.count ?? 0}
			gapCount={gapCount[0]?.count ?? 0}
			courseCount={courseStats[0]?.count ?? 0}
			marketCoverage={passport?.marketCoveragePercent ?? 0}
		/>
	);
}
```

- **CREATE** `src/components/dashboard/dashboard-hub.tsx` — "use client" component rendering the tiles
- Each tile is a Card with icon + title + subtitle (count) + link

### TASK 4: UPDATE `src/middleware.ts`

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const allCookies = request.cookies.getAll();
	const sessionCookie = allCookies.find((c) => c.name.includes("better-auth.session_token"));

	if (!sessionCookie?.value) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/dashboard/:path*",
		"/onboarding/:path*",
		"/skill-map/:path*",
		"/gap-analysis/:path*",
		"/micro-courses/:path*",
		"/passport",
	],
};
```

---

## VALIDATION COMMANDS

```bash
pnpm build
pnpm lint
# Manual:
# 1. Login at /login
# 2. Should redirect to /dashboard
# 3. Verify sidebar shows all nav items
# 4. Verify dashboard shows welcome + 4 tiles
# 5. Logout button → should redirect to /
# 6. Try accessing /dashboard without login → should redirect to /login
```

## ACCEPTANCE CRITERIA

- [ ] Dashboard layout renders with sidebar on all `(dashboard)` routes
- [ ] Sidebar shows 5 nav items with active state highlighting
- [ ] Logout works and redirects to `/`
- [ ] Dashboard page shows welcome card with student info
- [ ] Dashboard page shows 4 navigation tiles with counts
- [ ] Unauthenticated access redirects to `/login`
- [ ] Users without student record redirect to `/onboarding`
- [ ] Responsive: works on mobile (sidebar collapses)
- [ ] `pnpm build` passes
