import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export type MicroCourseContent = {
	estimatedMinutes: number;
	steps: Array<{
		title: string;
		content: string;
		exercise?: string;
	}>;
	resources: Array<{
		title: string;
		url: string;
		type: "video" | "article" | "interactive" | "docs";
	}>;
	project: {
		title: string;
		description: string;
		tools: string[];
	};
};

export async function generateMicroCourse(
	competencyName: string,
	careerGoal: string,
	semester: number,
	relatedCompetencies: string[],
): Promise<{ title: string; content: MicroCourseContent }> {
	const { text } = await generateText({
		model: anthropic("claude-sonnet-4-6"),
		maxOutputTokens: 3000,
		prompt: `Jesteś ekspertem edukacji technicznej. Stwórz PRAKTYCZNY mikro-kurs dla studenta ${semester}. semestru, który chce zostać ${careerGoal}.

Temat kursu: ${competencyName}
Student już zna: ${relatedCompetencies.slice(0, 5).join(", ") || "brak danych"}

Wymagania:
- 3-5 kroków (każdy max 200 słów, markdown)
- Każde ćwiczenie wykonywalne ONLINE (Google Colab, CodePen, repl.it, online IDE)
- 3-5 linków do DARMOWYCH, REALNYCH zasobów (YouTube, dokumentacja, Google Colab notebook)
- 1 mini-projekt wykonywalny online
- Czas: 15-30 minut łącznie
- Język: POLSKI

Zwróć TYLKO JSON (bez markdown code block):
{
  "title": "Tytuł kursu po polsku",
  "content": {
    "estimatedMinutes": 20,
    "steps": [
      {
        "title": "Tytuł kroku",
        "content": "Treść w markdown...",
        "exercise": "Opcjonalne ćwiczenie praktyczne"
      }
    ],
    "resources": [
      {
        "title": "Nazwa zasobu",
        "url": "https://...",
        "type": "video"
      }
    ],
    "project": {
      "title": "Mini-projekt",
      "description": "Opis w markdown...",
      "tools": ["Google Colab"]
    }
  }
}`,
	});

	const cleaned = text
		.trim()
		.replace(/^```(?:json)?\n?/, "")
		.replace(/\n?```$/, "");
	const result = JSON.parse(cleaned) as { title: string; content: MicroCourseContent };
	return result;
}
