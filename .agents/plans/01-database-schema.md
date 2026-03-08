# Feature: Database Schema + Job Market Seed Data

Read `00-master-roadmap.md` before implementing. Validate all patterns against existing files before writing code.

## Feature Description

Extend the existing Drizzle schema with all SkillBridge AI domain tables: students, competencies, skill_maps, gaps, micro_courses, passports, and job_market_data. Then seed the job_market_data table with a static dataset of competency requirements per career goal.

## Feature Metadata

**Feature Type**: Foundation
**Estimated Complexity**: Medium
**Primary Systems Affected**: `src/lib/db/schema.ts`, `src/lib/db/seed.ts`
**Dependencies**: None (runs first)

---

## CONTEXT REFERENCES

### Files to Read Before Implementing

- `src/lib/db/schema.ts` — existing Better Auth tables (user, session, account, verification). ADD new tables to this file.
- `src/lib/db/index.ts` — db instance with `drizzle(sql, { schema })` — all schema exports auto-included
- `drizzle.config.ts` — config with dotenv loading
- `00-master-roadmap.md` — Drizzle query pattern to verify

### Patterns to Follow

**Table definition pattern** (from existing schema.ts):
```typescript
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});
```

**New imports needed**: `uuid`, `integer`, `jsonb`, `pgEnum`, `index`, `uniqueIndex`

---

## IMPLEMENTATION PLAN

### Phase 1: Schema Tables

**ADD to `src/lib/db/schema.ts`**:

```typescript
import {
	boolean, index, integer, jsonb, pgEnum, pgTable,
	text, timestamp, uniqueIndex, uuid,
} from "drizzle-orm/pg-core";
```

#### Table: `students`
```typescript
export const students = pgTable("students", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id").notNull().unique().references(() => user.id, { onDelete: "cascade" }),
	university: text("university").notNull(),
	fieldOfStudy: text("field_of_study").notNull(),
	semester: integer("semester").notNull(), // 1-10
	careerGoal: text("career_goal").notNull(),
	syllabusText: text("syllabus_text"), // raw syllabus for re-parsing
	onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	index("idx_students_user_id").on(table.userId),
]);
```

#### Enum: `competency_status`
```typescript
export const competencyStatusEnum = pgEnum("competency_status", [
	"acquired",
	"in_progress",
	"missing",
]);
```

#### Table: `competencies`
```typescript
export const competencies = pgTable("competencies", {
	id: uuid("id").defaultRandom().primaryKey(),
	studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	status: competencyStatusEnum("status").notNull().default("acquired"),
	marketPercentage: integer("market_percentage"), // % of job offers requiring this
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	index("idx_competencies_student_id").on(table.studentId),
]);
```

#### Enum: `gap_priority`
```typescript
export const gapPriorityEnum = pgEnum("gap_priority", [
	"critical",
	"important",
	"nice_to_have",
]);
```

#### Table: `gaps`
```typescript
export const gaps = pgTable("gaps", {
	id: uuid("id").defaultRandom().primaryKey(),
	studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
	competencyName: text("competency_name").notNull(),
	priority: gapPriorityEnum("priority").notNull().default("important"),
	marketPercentage: integer("market_percentage").notNull().default(0),
	estimatedHours: integer("estimated_hours").notNull().default(5),
	whyImportant: text("why_important"), // AI generated, nullable until generated
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	index("idx_gaps_student_id").on(table.studentId),
]);
```

#### Table: `skill_maps`
```typescript
export const skillMaps = pgTable("skill_maps", {
	id: uuid("id").defaultRandom().primaryKey(),
	studentId: uuid("student_id").notNull().unique().references(() => students.id, { onDelete: "cascade" }),
	nodes: jsonb("nodes").notNull().default([]), // React Flow nodes array
	edges: jsonb("edges").notNull().default([]), // React Flow edges array
	generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

#### Table: `micro_courses`
```typescript
export const microCourses = pgTable("micro_courses", {
	id: uuid("id").defaultRandom().primaryKey(),
	studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
	gapId: uuid("gap_id").references(() => gaps.id, { onDelete: "set null" }),
	competencyName: text("competency_name").notNull(),
	title: text("title").notNull(),
	content: jsonb("content").notNull(), // { steps: Step[], resources: Resource[], project: string, estimatedMinutes: number }
	completed: boolean("completed").notNull().default(false),
	completedAt: timestamp("completed_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	index("idx_micro_courses_student_id").on(table.studentId),
]);
```

#### Table: `passports`
```typescript
export const passports = pgTable("passports", {
	id: uuid("id").defaultRandom().primaryKey(), // this IS the public UUID
	studentId: uuid("student_id").notNull().unique().references(() => students.id, { onDelete: "cascade" }),
	marketCoveragePercent: integer("market_coverage_percent").notNull().default(0),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

#### Table: `job_market_data`
```typescript
export const jobMarketData = pgTable("job_market_data", {
	id: uuid("id").defaultRandom().primaryKey(),
	careerGoal: text("career_goal").notNull(), // e.g. "Data Analyst"
	competencyName: text("competency_name").notNull(),
	demandPercentage: integer("demand_percentage").notNull(), // % of job offers
	category: text("category").notNull(), // e.g. "Technical", "Soft Skills"
	salaryRange: text("salary_range"), // e.g. "8000-15000 PLN"
}, (table) => [
	index("idx_job_market_career_goal").on(table.careerGoal),
]);
```

#### Relations (add after all tables)
```typescript
import { relations } from "drizzle-orm";

export const studentsRelations = relations(students, ({ one, many }) => ({
	user: one(user, { fields: [students.userId], references: [user.id] }),
	competencies: many(competencies),
	gaps: many(gaps),
	skillMap: one(skillMaps, { fields: [students.id], references: [skillMaps.studentId] }),
	microCourses: many(microCourses),
	passport: one(passports, { fields: [students.id], references: [passports.studentId] }),
}));

export const competenciesRelations = relations(competencies, ({ one }) => ({
	student: one(students, { fields: [competencies.studentId], references: [students.id] }),
}));

export const gapsRelations = relations(gaps, ({ one, many }) => ({
	student: one(students, { fields: [gaps.studentId], references: [students.id] }),
	microCourses: many(microCourses),
}));

export const microCoursesRelations = relations(microCourses, ({ one }) => ({
	student: one(students, { fields: [microCourses.studentId], references: [students.id] }),
	gap: one(gaps, { fields: [microCourses.gapId], references: [gaps.id] }),
}));
```

### Phase 2: Seed Script

**CREATE `src/lib/db/seed.ts`**:

Script that inserts job market data for all career goals. Run with `npx tsx src/lib/db/seed.ts`.

Include at minimum 10 competencies per career goal for: Data Analyst, Frontend Developer, Backend Developer, Full-stack Developer, UX/UI Designer, Project Manager, Data Scientist, DevOps Engineer, Cybersecurity Analyst.

Example seed data structure:
```typescript
const DATA: Array<{ careerGoal: string; competencies: Array<{ name: string; demandPercentage: number; category: string; salaryRange: string }> }> = [
	{
		careerGoal: "Data Analyst",
		competencies: [
			{ name: "Python", demandPercentage: 78, category: "Technical", salaryRange: "8000-15000 PLN" },
			{ name: "SQL", demandPercentage: 89, category: "Technical", salaryRange: "8000-15000 PLN" },
			{ name: "Excel/Arkusze kalkulacyjne", demandPercentage: 72, category: "Technical", salaryRange: "7000-12000 PLN" },
			{ name: "Tableau/Power BI", demandPercentage: 61, category: "Technical", salaryRange: "9000-16000 PLN" },
			{ name: "Statystyka", demandPercentage: 67, category: "Technical", salaryRange: "8000-14000 PLN" },
			{ name: "Pandas", demandPercentage: 55, category: "Technical", salaryRange: "9000-15000 PLN" },
			{ name: "Machine Learning (podstawy)", demandPercentage: 43, category: "Technical", salaryRange: "10000-18000 PLN" },
			{ name: "Komunikacja wyników", demandPercentage: 71, category: "Soft Skills", salaryRange: "8000-15000 PLN" },
			{ name: "Myślenie analityczne", demandPercentage: 83, category: "Soft Skills", salaryRange: "8000-15000 PLN" },
			{ name: "Git/GitHub", demandPercentage: 48, category: "Technical", salaryRange: "8000-15000 PLN" },
		],
	},
	// ... repeat for all career goals
];
```

**Full seed data to include** (at minimum):
- Data Analyst: Python, SQL, Excel, Power BI, Statystyka, Pandas, Komunikacja wyników, Myślenie analityczne, Git, Machine Learning basics
- Frontend Developer: JavaScript, TypeScript, React, HTML/CSS, Git, REST API, Responsive Design, Testing (Jest), Figma basics, Performance Optimization
- Backend Developer: Node.js, Python/Java, SQL, NoSQL, REST API, Docker, Git, Security basics, Microservices, Cloud (AWS/GCP/Azure basics)
- Full-stack Developer: JavaScript/TypeScript, React, Node.js, SQL, Git, Docker, REST API, CI/CD, Testing, Cloud basics
- UX/UI Designer: Figma, User Research, Wireframing, Prototyping, Design Systems, Usability Testing, Information Architecture, HTML/CSS basics, Accessibility, Komunikacja
- Project Manager: Agile/Scrum, Zarządzanie ryzykiem, Komunikacja, MS Project/Jira, Budżetowanie, Zarządzanie stakeholderami, Priorytetyzacja, Excel, Prezentacje, Negocjacje
- Data Scientist: Python, Machine Learning, Deep Learning, SQL, Statystyka, TensorFlow/PyTorch, Pandas/NumPy, Git, Komunikacja wyników, Big Data
- DevOps Engineer: Docker, Kubernetes, CI/CD, Linux, Terraform, AWS/GCP/Azure, Git, Monitoring, Networking, Security
- Cybersecurity Analyst: Networking, Security protocols, Penetration Testing, SIEM tools, Linux, Python/Bash, Risk Assessment, Compliance (RODO/GDPR), Incident Response, Ethical Hacking

### Phase 3: Push Schema

After writing schema.ts, run `pnpm db:push` to create tables in Docker PostgreSQL.

---

## STEP-BY-STEP TASKS

### TASK 1: UPDATE `src/lib/db/schema.ts`

- **ADD** imports: `uuid, integer, jsonb, pgEnum, index, relations` to existing import line
- **ADD** enum definitions: `competencyStatusEnum`, `gapPriorityEnum`
- **ADD** table definitions in order: `students`, `competencies`, `gaps`, `skillMaps`, `microCourses`, `passports`, `jobMarketData`
- **ADD** relations after all tables
- **GOTCHA**: Keep existing Better Auth tables (user, session, account, verification) — only ADD new tables
- **GOTCHA**: `jsonb` columns default must be valid JSON — use `default([])` or `default({})`
- **VALIDATE**: `pnpm build` — no TypeScript errors

### TASK 2: CREATE `src/lib/db/seed.ts`

- **IMPLEMENT**: Full seed script with job market data for 9 career goals
- **IMPLEMENT**: Delete existing jobMarketData before re-inserting (idempotent)
- **PATTERN**: Use `db.insert(jobMarketData).values([...])` with `onConflictDoNothing()`
- **IMPORTS**: `import { config } from "dotenv"; config({ path: ".env.local" });` at top
- **IMPORTS**: `import { db } from "./index";`
- **IMPORTS**: `import { jobMarketData } from "./schema";`
- **VALIDATE**: `npx tsx src/lib/db/seed.ts` — exits without error

### TASK 3: PUSH SCHEMA AND SEED

- **RUN**: `pnpm db:push` — creates all new tables
- **RUN**: `npx tsx src/lib/db/seed.ts` — seeds job market data
- **VALIDATE**: `pnpm db:studio` — verify tables exist and seed data is present

### TASK 4: ADD `pnpm db:seed` script to package.json

- **UPDATE**: `package.json` scripts section
- **ADD**: `"db:seed": "tsx src/lib/db/seed.ts"`
- **VALIDATE**: `pnpm db:seed` — runs seed without errors

---

## VALIDATION COMMANDS

```bash
pnpm build              # TypeScript compile check
pnpm db:push            # Push schema to DB
pnpm db:seed            # Seed job market data
pnpm lint               # Biome linter check
```

## ACCEPTANCE CRITERIA

- [ ] All 7 new tables created in PostgreSQL
- [ ] Both enums created (competency_status, gap_priority)
- [ ] All relations defined
- [ ] Job market data seeded for 9 career goals (min 10 competencies each)
- [ ] `pnpm build` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm db:push` exits 0
- [ ] `pnpm db:seed` exits 0
