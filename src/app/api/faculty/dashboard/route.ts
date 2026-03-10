import { count, desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generateFacultySuggestions } from "@/lib/ai/generate-faculty-suggestions";
import { db } from "@/lib/db";
import { gaps, jobMarketData, students } from "@/lib/db/schema";
import { checkFacultyAuth } from "@/lib/faculty-auth";

export const maxDuration = 30;

export async function GET() {
	const isAuth = await checkFacultyAuth();
	if (!isAuth) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Count total students
	const [studentCountResult] = await db.select({ count: count() }).from(students);
	const studentCount = studentCountResult?.count ?? 0;

	if (studentCount < 3) {
		return NextResponse.json({ tooFewStudents: true, studentCount });
	}

	// Heatmap: for each market-required competency, calculate what % of students
	// targeting that career goal actually have it covered.
	// Source of truth: jobMarketData defines what's required, gaps defines what's missing.
	// If a market competency has no gap entry for a student → student has it covered.

	// 1. Count students per career goal
	const allStudents = await db
		.select({ id: students.id, careerGoal: students.careerGoal })
		.from(students);
	const studentsPerGoal = new Map<string, number>();
	for (const s of allStudents) {
		studentsPerGoal.set(s.careerGoal, (studentsPerGoal.get(s.careerGoal) || 0) + 1);
	}

	// 2. Count how many students are MISSING each competency per career goal
	const gapData = await db
		.select({
			competencyName: gaps.competencyName,
			careerGoal: students.careerGoal,
			missingCount: count(),
		})
		.from(gaps)
		.innerJoin(students, eq(gaps.studentId, students.id))
		.groupBy(gaps.competencyName, students.careerGoal);

	const gapMap = new Map<string, number>();
	for (const row of gapData) {
		gapMap.set(`${row.careerGoal}|||${row.competencyName}`, row.missingCount);
	}

	// 3. Build heatmap from jobMarketData — only for career goals that have students
	const allMarketData = await db.select().from(jobMarketData);
	const heatmapData = allMarketData
		.filter((m) => studentsPerGoal.has(m.careerGoal))
		.map((m) => {
			const totalInGoal = studentsPerGoal.get(m.careerGoal) || 1;
			const key = `${m.careerGoal}|||${m.competencyName}`;
			const missing = gapMap.get(key) ?? 0;
			return {
				competencyName: m.competencyName,
				careerGoal: m.careerGoal,
				coveragePercent: Math.round(((totalInGoal - missing) / totalInGoal) * 100),
				requiredByPercent: m.demandPercentage,
			};
		});

	// Top missing competencies from gaps table
	const topMissingRaw = await db
		.select({
			name: gaps.competencyName,
			missingCount: count(),
			avgMarketPct: sql<number>`ROUND(AVG(${gaps.marketPercentage}))`.as("avg_market_pct"),
		})
		.from(gaps)
		.groupBy(gaps.competencyName)
		.orderBy(desc(count()))
		.limit(5);

	// Get career goals for each missing competency
	const topMissingWithGoals = await Promise.all(
		topMissingRaw.map(async (missing) => {
			const goalRows = await db
				.select({ careerGoal: students.careerGoal })
				.from(gaps)
				.innerJoin(students, eq(gaps.studentId, students.id))
				.where(eq(gaps.competencyName, missing.name))
				.groupBy(students.careerGoal);

			return {
				name: missing.name,
				missingCount: missing.missingCount,
				requiredByPercent: missing.avgMarketPct,
				careerGoals: goalRows.map((r) => r.careerGoal),
			};
		}),
	);

	// AI suggestions
	let aiSuggestions: string[] = [];
	try {
		aiSuggestions = await generateFacultySuggestions(
			topMissingWithGoals.map((m) => ({
				name: m.name,
				requiredByPercent: m.requiredByPercent,
			})),
			studentCount,
		);
	} catch {
		aiSuggestions = ["Nie udało się wygenerować sugestii AI. Spróbuj odświeżyć stronę."];
	}

	return NextResponse.json({
		studentCount,
		heatmapData,
		topMissingCompetencies: topMissingWithGoals,
		aiSuggestions,
		generatedAt: new Date().toISOString(),
	});
}
