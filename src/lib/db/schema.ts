import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

// Better Auth tables
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
});

// SkillBridge AI domain tables

export const competencyStatusEnum = pgEnum("competency_status", [
	"acquired",
	"in_progress",
	"missing",
]);

export const gapPriorityEnum = pgEnum("gap_priority", ["critical", "important", "nice_to_have"]);

export const students = pgTable(
	"students",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: text("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		university: text("university").notNull(),
		fieldOfStudy: text("field_of_study").notNull(),
		semester: integer("semester").notNull(),
		careerGoal: text("career_goal").notNull(),
		syllabusText: text("syllabus_text"),
		onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [index("idx_students_user_id").on(table.userId)],
);

export const competencies = pgTable(
	"competencies",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		studentId: uuid("student_id")
			.notNull()
			.references(() => students.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		status: competencyStatusEnum("status").notNull().default("acquired"),
		marketPercentage: integer("market_percentage"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [index("idx_competencies_student_id").on(table.studentId)],
);

export const gaps = pgTable(
	"gaps",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		studentId: uuid("student_id")
			.notNull()
			.references(() => students.id, { onDelete: "cascade" }),
		competencyName: text("competency_name").notNull(),
		priority: gapPriorityEnum("priority").notNull().default("important"),
		marketPercentage: integer("market_percentage").notNull().default(0),
		estimatedHours: integer("estimated_hours").notNull().default(5),
		whyImportant: text("why_important"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [index("idx_gaps_student_id").on(table.studentId)],
);

export const skillMaps = pgTable("skill_maps", {
	id: uuid("id").defaultRandom().primaryKey(),
	studentId: uuid("student_id")
		.notNull()
		.unique()
		.references(() => students.id, { onDelete: "cascade" }),
	nodes: jsonb("nodes").notNull().default([]),
	edges: jsonb("edges").notNull().default([]),
	generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const microCourses = pgTable(
	"micro_courses",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		studentId: uuid("student_id")
			.notNull()
			.references(() => students.id, { onDelete: "cascade" }),
		gapId: uuid("gap_id").references(() => gaps.id, { onDelete: "set null" }),
		competencyName: text("competency_name").notNull(),
		title: text("title").notNull(),
		content: jsonb("content").notNull(),
		completed: boolean("completed").notNull().default(false),
		completedAt: timestamp("completed_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [index("idx_micro_courses_student_id").on(table.studentId)],
);

export const passports = pgTable("passports", {
	id: uuid("id").defaultRandom().primaryKey(),
	studentId: uuid("student_id")
		.notNull()
		.unique()
		.references(() => students.id, { onDelete: "cascade" }),
	marketCoveragePercent: integer("market_coverage_percent").notNull().default(0),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const jobMarketData = pgTable(
	"job_market_data",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		careerGoal: text("career_goal").notNull(),
		competencyName: text("competency_name").notNull(),
		demandPercentage: integer("demand_percentage").notNull(),
		category: text("category").notNull(),
		salaryRange: text("salary_range"),
	},
	(table) => [index("idx_job_market_career_goal").on(table.careerGoal)],
);

// Relations

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
