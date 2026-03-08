import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("ai", () => ({
	generateText: vi.fn(),
}));

vi.mock("@ai-sdk/anthropic", () => ({
	anthropic: vi.fn(() => "mocked-model"),
}));

import { generateText } from "ai";
import { generateMicroCourse } from "../generate-micro-course";

const mockGenerateText = vi.mocked(generateText);

const validResponse = {
	title: "Podstawy SQL",
	content: {
		estimatedMinutes: 20,
		steps: [
			{
				title: "Wprowadzenie",
				content: "Treść kroku 1",
				exercise: "Ćwiczenie 1",
			},
			{
				title: "SELECT i WHERE",
				content: "Treść kroku 2",
			},
			{
				title: "JOIN",
				content: "Treść kroku 3",
				exercise: "Ćwiczenie 3",
			},
		],
		resources: [
			{
				title: "SQL Tutorial",
				url: "https://www.w3schools.com/sql/",
				type: "docs",
			},
			{
				title: "SQL dla początkujących",
				url: "https://youtube.com/watch?v=123",
				type: "video",
			},
			{
				title: "SQLBolt — interaktywne ćwiczenia",
				url: "https://sqlbolt.com/",
				type: "interactive",
			},
		],
		project: {
			title: "Analiza danych sprzedażowych",
			description: "Stwórz zapytania SQL do analizy danych.",
			tools: ["Google Colab", "SQLite"],
		},
	},
};

describe("generateMicroCourse", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns parsed title and content from AI response", async () => {
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify(validResponse),
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		const result = await generateMicroCourse("SQL", "Data Analyst", 3, ["Python", "Excel"]);

		expect(result.title).toBe("Podstawy SQL");
		expect(result.content.estimatedMinutes).toBe(20);
		expect(result.content.steps).toHaveLength(3);
		expect(result.content.resources).toHaveLength(3);
		expect(result.content.project.title).toBe("Analiza danych sprzedażowych");
	});

	it("strips JSON code block wrappers", async () => {
		mockGenerateText.mockResolvedValue({
			text: `\`\`\`json\n${JSON.stringify(validResponse)}\n\`\`\``,
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		const result = await generateMicroCourse("SQL", "Data Analyst", 3, []);

		expect(result.title).toBe("Podstawy SQL");
		expect(result.content.steps).toHaveLength(3);
	});

	it("includes competency name in the prompt", async () => {
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify(validResponse),
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		await generateMicroCourse("Docker", "DevOps Engineer", 5, ["Linux"]);

		const call = mockGenerateText.mock.calls[0][0];
		expect(call.prompt).toContain("Docker");
	});

	it("includes career goal and semester in the prompt", async () => {
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify(validResponse),
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		await generateMicroCourse("Python", "Data Scientist", 4, []);

		const call = mockGenerateText.mock.calls[0][0];
		expect(call.prompt).toContain("Data Scientist");
		expect(call.prompt).toContain("4. semestru");
	});

	it("includes related competencies in the prompt", async () => {
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify(validResponse),
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		await generateMicroCourse("SQL", "Data Analyst", 3, ["Python", "Excel", "Statistics"]);

		const call = mockGenerateText.mock.calls[0][0];
		expect(call.prompt).toContain("Python");
		expect(call.prompt).toContain("Excel");
	});

	it("uses maxOutputTokens of 3000", async () => {
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify(validResponse),
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		await generateMicroCourse("SQL", "Data Analyst", 3, []);

		const call = mockGenerateText.mock.calls[0][0];
		expect(call.maxOutputTokens).toBe(3000);
	});

	it("propagates AI SDK errors", async () => {
		mockGenerateText.mockRejectedValue(new Error("API error"));

		await expect(generateMicroCourse("SQL", "Data Analyst", 3, [])).rejects.toThrow("API error");
	});

	it("handles empty related competencies", async () => {
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify(validResponse),
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		await generateMicroCourse("SQL", "Data Analyst", 3, []);

		const call = mockGenerateText.mock.calls[0][0];
		expect(call.prompt).toContain("brak danych");
	});

	it("throws on invalid JSON from AI", async () => {
		mockGenerateText.mockResolvedValue({
			text: "This is not valid JSON at all",
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		await expect(generateMicroCourse("SQL", "Data Analyst", 3, [])).rejects.toThrow();
	});

	it("strips backtick wrapper without json label", async () => {
		mockGenerateText.mockResolvedValue({
			text: `\`\`\`\n${JSON.stringify(validResponse)}\n\`\`\``,
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		const result = await generateMicroCourse("SQL", "Data Analyst", 3, []);
		expect(result.title).toBe("Podstawy SQL");
	});

	it("limits related competencies to 5", async () => {
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify(validResponse),
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		await generateMicroCourse("SQL", "Data Analyst", 3, ["A", "B", "C", "D", "E", "F", "G"]);

		const call = mockGenerateText.mock.calls[0][0];
		expect(call.prompt).toContain("A");
		expect(call.prompt).toContain("E");
		expect(call.prompt).not.toContain("F");
	});
});
