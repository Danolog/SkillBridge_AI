import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export async function parseSyllabus(syllabusText: string, careerGoal: string): Promise<string[]> {
	const { text } = await generateText({
		model: anthropic("claude-sonnet-4-6"),
		maxOutputTokens: 2000,
		prompt: `Jesteś ekspertem od analizy programów studiów i wymagań rynku pracy w Polsce.

Przeanalizuj poniższy sylabus i wyciągnij listę konkretnych kompetencji, umiejętności i technologii, których student się uczy.

Student chce zostać: ${careerGoal}

Sylabus:
${syllabusText.slice(0, 8000)}

Zwróć TYLKO tablicę JSON z kompetencjami w formacie:
["Python", "SQL", "Analiza danych", ...]

Wymagania:
- 15-40 kompetencji
- Konkretne nazwy (nie ogólniki)
- Mix technicznych i miękkich kompetencji
- Tylko JSON array, bez żadnego innego tekstu`,
	});

	const cleaned = text
		.trim()
		.replace(/^```(?:json)?\n?/, "")
		.replace(/\n?```$/, "");
	return JSON.parse(cleaned) as string[];
}
