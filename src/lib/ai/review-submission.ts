import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export interface ReviewResult {
	score: number;
	feedback: string;
	cheatRiskScore: number;
	criteriaScores: Array<{ criterion: string; score: number; comment: string }>;
}

export async function reviewSubmission(
	repoUrl: string | null,
	notebookUrl: string | null,
	rubricJson: unknown,
	projectTitle: string,
	projectDescription: string,
): Promise<ReviewResult> {
	let repoContext = "";
	if (repoUrl?.includes("github.com")) {
		try {
			const apiUrl = repoUrl.replace("https://github.com/", "https://api.github.com/repos/");
			const res = await fetch(apiUrl);
			if (res.ok) {
				const data = (await res.json()) as Record<string, unknown>;
				repoContext = `Repository: ${data.full_name}, Language: ${data.language}, Created: ${data.created_at}, Last push: ${data.pushed_at}`;
			}
		} catch {
			// Ignore fetch errors
		}
	}

	const rubric = Array.isArray(rubricJson) ? rubricJson : [];
	const rubricText = rubric
		.map(
			(r: { criterion: string; weight: number; description: string }) =>
				`- ${r.criterion} (waga: ${r.weight}%): ${r.description}`,
		)
		.join("\n");

	const { text } = await generateText({
		model: anthropic("claude-sonnet-4-6"),
		maxOutputTokens: 3000,
		prompt: `Jesteś recenzentem projektów studenckich. Oceń zgłoszenie projektu.

Projekt: "${projectTitle}"
Opis: ${projectDescription}

Zgłoszenie studenta:
- Repozytorium: ${repoUrl || "nie podano"}
- Notebook: ${notebookUrl || "nie podano"}
${repoContext ? `- Metadane repo: ${repoContext}` : ""}

Kryteria oceny:
${rubricText || "Brak szczegółowych kryteriów — oceń ogólną jakość"}

Oceń:
1. Każde kryterium osobno (0-100)
2. Ogólny wynik (0-100) jako średnią ważoną
3. Ryzyko plagiatu (0.0-1.0) — nowe repo, brak historii commitów = wyższe ryzyko
4. Feedback po polsku (markdown, 3-5 zdań)

Zwróć TYLKO JSON (bez markdown code block):
{
  "score": 75,
  "feedback": "Feedback po polsku w markdown...",
  "cheatRiskScore": 0.2,
  "criteriaScores": [{"criterion": "Nazwa", "score": 80, "comment": "Komentarz"}]
}`,
	});

	const cleaned = text
		.trim()
		.replace(/^```(?:json)?\n?/, "")
		.replace(/\n?```$/, "");
	try {
		return JSON.parse(cleaned) as ReviewResult;
	} catch {
		const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
		if (jsonMatch) return JSON.parse(jsonMatch[0]) as ReviewResult;
		throw new Error("AI zwróciło nieprawidłowy JSON");
	}
}
