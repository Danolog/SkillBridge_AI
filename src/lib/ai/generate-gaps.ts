import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { competencies, gaps, jobMarketData, passports } from "@/lib/db/schema";

interface GapResult {
	gaps: Array<{
		name: string;
		priority: "critical" | "important" | "nice_to_have";
		marketPercentage: number;
		estimatedHours: number;
	}>;
	competencyUpdates: Array<{
		name: string;
		status: "acquired" | "in_progress" | "missing";
		marketPercentage: number;
	}>;
	marketCoveragePercent: number;
}

export async function generateGaps(
	studentId: string,
	studentCompetencies: string[],
	careerGoal: string,
): Promise<void> {
	const marketData = await db.query.jobMarketData.findMany({
		where: eq(jobMarketData.careerGoal, careerGoal),
	});

	const marketList =
		marketData.length > 0
			? marketData
					.map((m) => `${m.competencyName} (${m.demandPercentage}% demand, ${m.category})`)
					.join("\n")
			: `Brak danych rynkowych dla "${careerGoal}" — wygeneruj realistyczne dane na podstawie wiedzy o polskim rynku IT.`;

	const { text } = await generateText({
		model: anthropic("claude-sonnet-4-6"),
		maxOutputTokens: 3000,
		prompt: `Jesteś ekspertem od rynku pracy IT w Polsce.

Kompetencje studenta: ${JSON.stringify(studentCompetencies)}

Wymagania rynkowe dla "${careerGoal}":
${marketList}

Porównaj kompetencje studenta z wymaganiami rynku i zwróć JSON:
{
  "gaps": [
    {"name": "nazwa kompetencji", "priority": "critical|important|nice_to_have", "marketPercentage": 0-100, "estimatedHours": 5-40}
  ],
  "competencyUpdates": [
    {"name": "nazwa kompetencji studenta", "status": "acquired|in_progress", "marketPercentage": 0-100}
  ],
  "marketCoveragePercent": 0-100
}

Zasady:
- "critical": >60% demand na rynku, student tego nie ma
- "important": 40-60% demand
- "nice_to_have": <40% demand
- competencyUpdates: aktualizuj status i marketPercentage dla kompetencji studenta
- marketCoveragePercent: jaki % wymagań rynkowych student już pokrywa
- 8-20 gaps, 15-40 competencyUpdates
- Tylko JSON, bez innego tekstu`,
	});

	const cleaned = text
		.trim()
		.replace(/^```(?:json)?\n?/, "")
		.replace(/\n?```$/, "");
	const result = JSON.parse(cleaned) as GapResult;

	// Save gaps (idempotent — wipe existing first so re-running on profile edit doesn't duplicate)
	await db.delete(gaps).where(eq(gaps.studentId, studentId));
	if (result.gaps.length > 0) {
		await db.insert(gaps).values(
			result.gaps.map((g) => ({
				studentId,
				competencyName: g.name,
				priority: g.priority,
				marketPercentage: g.marketPercentage,
				estimatedHours: g.estimatedHours,
			})),
		);
	}

	// Update competency statuses
	for (const update of result.competencyUpdates) {
		await db
			.update(competencies)
			.set({
				status: update.status,
				marketPercentage: update.marketPercentage,
			})
			.where(eq(competencies.name, update.name));
	}

	// Update passport market coverage
	await db
		.update(passports)
		.set({
			marketCoveragePercent: result.marketCoveragePercent,
			updatedAt: new Date(),
		})
		.where(eq(passports.studentId, studentId));
}
