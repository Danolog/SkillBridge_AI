import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export async function generateWhyImportant(
	competencyName: string,
	careerGoal: string,
	marketPercentage: number,
): Promise<string> {
	const { text } = await generateText({
		model: anthropic("claude-sonnet-4-6"),
		maxOutputTokens: 400,
		prompt: `Jesteś doradcą kariery dla studentów w Polsce.

Napisz KRÓTKIE wyjaśnienie (150-250 słów) dlaczego umiejętność "${competencyName}" jest ważna dla osoby, która chce zostać ${careerGoal}.

Wymagania wymagane przez ${marketPercentage}% ofert pracy.

Uwzględnij:
- 3 konkretne zawody/role, w których ta umiejętność jest używana
- 2-3 konkretne zadania w pracy, gdzie ta umiejętność pomaga
- Orientacyjne widełki płacowe w Polsce (brutto, miesięcznie)

Pisz po polsku, bezpośrednio do studenta (forma "Ty"). Bez wstępów.`,
	});
	return text.trim();
}
