import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { competencies, projects, students } from "@/lib/db/schema";
import { generateLearningSteps, type LearningStep } from "./generate-micro-course";

export interface ProjectBrief {
	objective: string;
	inputData: string;
	suggestedSteps: string[];
	learningSteps: LearningStep[];
	successDefinition: string;
	acceptanceCriteria: Array<{ criterion: string; weight: number; description: string }>;
}

export async function generateProjectBrief(
	projectId: string,
	studentId: string,
): Promise<ProjectBrief> {
	const project = await db.query.projects.findFirst({
		where: eq(projects.id, projectId),
		with: { competencies: true },
	});
	if (!project) throw new Error("Project not found");

	const student = await db.query.students.findFirst({
		where: eq(students.id, studentId),
	});
	if (!student) throw new Error("Student not found");

	const studentComps = await db.query.competencies.findMany({
		where: eq(competencies.studentId, studentId),
	});
	const acquiredNames = studentComps
		.filter((c) => c.status === "acquired")
		.map((c) => c.name.toLowerCase());

	const requiredComps = project.competencies
		.filter((c) => c.role === "required")
		.map((c) => c.competencyName);
	const missingComps = requiredComps.filter(
		(name) =>
			!acquiredNames.some((a) => a.includes(name.toLowerCase()) || name.toLowerCase().includes(a)),
	);

	let learningSteps: LearningStep[] = [];
	if (missingComps.length > 0) {
		learningSteps = await generateLearningSteps(
			missingComps[0],
			student.careerGoal,
			student.semester,
			acquiredNames,
			3,
		);
	}

	const { text } = await generateText({
		model: anthropic("claude-sonnet-4-6"),
		maxOutputTokens: 3000,
		prompt: `Jesteś mentorem projektów studenckich. Stwórz spersonalizowany brief projektu.

Projekt: "${project.title}"
Opis: ${project.description}
Poziom: ${project.level}
Źródło danych: ${project.sourceUrl || "brak"}

Student: ${student.careerGoal}, semestr ${student.semester}
Znane kompetencje: ${acquiredNames.join(", ") || "brak danych"}
Brakujące kompetencje: ${missingComps.join(", ") || "brak — student jest gotowy"}

Zwróć TYLKO JSON (bez markdown code block):
{
  "objective": "Cel projektu w 2-3 zdaniach po polsku",
  "inputData": "Opis danych wejściowych i jak je uzyskać",
  "suggestedSteps": ["Krok 1", "Krok 2", "Krok 3", "..."],
  "successDefinition": "Definicja sukcesu w 2-3 zdaniach"
}`,
	});

	const cleaned = text
		.trim()
		.replace(/^```(?:json)?\n?/, "")
		.replace(/\n?```$/, "");
	let parsed: {
		objective: string;
		inputData: string;
		suggestedSteps: string[];
		successDefinition: string;
	};
	try {
		parsed = JSON.parse(cleaned);
	} catch {
		const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			parsed = JSON.parse(jsonMatch[0]);
		} else {
			throw new Error("AI zwróciło nieprawidłowy JSON");
		}
	}

	return {
		...parsed,
		learningSteps,
		acceptanceCriteria: project.rubricJson as ProjectBrief["acceptanceCriteria"],
	};
}
