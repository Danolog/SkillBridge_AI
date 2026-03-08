import { count, desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generateFacultySuggestions } from "@/lib/ai/generate-faculty-suggestions";
import { db } from "@/lib/db";
import { competencies, gaps, jobMarketData, students } from "@/lib/db/schema";
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

	// Heatmap data: join competencies + students to get careerGoal context
	const competencyData = await db
		.select({
			competencyName: competencies.name,
			careerGoal: students.careerGoal,
			status: competencies.status,
		})
		.from(competencies)
		.innerJoin(students, eq(competencies.studentId, students.id));

	// Aggregate heatmap: for each (careerGoal, competencyName), compute coverage %
	const heatmapMap = new Map<string, { total: number; acquired: number }>();
	const careerGoalCounts = new Map<string, number>();

	for (const row of competencyData) {
		const key = `${row.careerGoal}|||${row.competencyName}`;
		let entry = heatmapMap.get(key);
		if (!entry) {
			entry = { total: 0, acquired: 0 };
			heatmapMap.set(key, entry);
		}
		entry.total++;
		if (row.status === "acquired") {
			entry.acquired++;
		}

		careerGoalCounts.set(row.careerGoal, (careerGoalCounts.get(row.careerGoal) || 0) + 1);
	}

	// Get job market data for requiredByPercent
	const allMarketData = await db.select().from(jobMarketData);
	const marketMap = new Map<string, number>();
	for (const m of allMarketData) {
		marketMap.set(`${m.careerGoal}|||${m.competencyName}`, m.demandPercentage);
	}

	const heatmapData = Array.from(heatmapMap.entries()).map(([key, val]) => {
		const [careerGoal, competencyName] = key.split("|||");
		return {
			competencyName,
			careerGoal,
			coveragePercent: Math.round((val.acquired / val.total) * 100),
			requiredByPercent: marketMap.get(key) ?? 0,
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
