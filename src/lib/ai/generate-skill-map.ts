import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { skillMaps } from "@/lib/db/schema";

interface SkillNode {
	id: string;
	data: {
		label: string;
		status: "acquired" | "in_progress" | "missing";
		category: string;
		marketPercentage?: number;
	};
	position: { x: number; y: number };
	type: string;
}

interface SkillEdge {
	id: string;
	source: string;
	target: string;
}

interface SkillMapResult {
	nodes: SkillNode[];
	edges: SkillEdge[];
}

export async function generateSkillMap(
	studentId: string,
	studentCompetencies: string[],
	careerGoal: string,
): Promise<void> {
	const { text } = await generateText({
		model: anthropic("claude-sonnet-4-6"),
		maxOutputTokens: 4000,
		prompt: `Wygeneruj mapę umiejętności (skill map) jako graf React Flow dla studenta.

Kompetencje studenta: ${JSON.stringify(studentCompetencies)}
Cel kariery: ${careerGoal}

Zwróć JSON:
{
  "nodes": [
    {
      "id": "skill-1",
      "data": { "label": "Python", "status": "acquired", "category": "programming", "marketPercentage": 55 },
      "position": { "x": 0, "y": 0 },
      "type": "skillNode"
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "skill-1", "target": "skill-2" }
  ]
}

Zasady:
- Każda kompetencja studenta = 1 node ze status "acquired"
- Dodaj 5-10 brakujących kompetencji ze status "missing" (na podstawie wymagań rynku dla ${careerGoal})
- Możesz też oznaczyć kompetencje "in_progress" (student ma podstawy, ale wymaga rozwoju)
- marketPercentage: procent ofert pracy wymagających tej kompetencji (0-100)
- Kategorie: "programming", "data", "tools", "soft_skills", "frameworks", "devops"
- Pozycje: grupuj po kategoriach, rozstaw x co 220px, y co 100px
- Krawędzie: łącz powiązane kompetencje (np. Python→Pandas, SQL→Bazy danych)
- Węzły root (kategoria) na górze, liście na dole
- Tylko JSON, bez innego tekstu`,
	});

	const cleaned = text
		.trim()
		.replace(/^```json?\n?/, "")
		.replace(/\n?```$/, "");
	const result = JSON.parse(cleaned) as SkillMapResult;

	// Upsert skill map
	const existing = await db.query.skillMaps.findFirst({
		where: eq(skillMaps.studentId, studentId),
	});

	if (existing) {
		await db
			.update(skillMaps)
			.set({
				nodes: result.nodes,
				edges: result.edges,
				updatedAt: new Date(),
			})
			.where(eq(skillMaps.studentId, studentId));
	} else {
		await db.insert(skillMaps).values({
			studentId,
			nodes: result.nodes,
			edges: result.edges,
		});
	}
}
