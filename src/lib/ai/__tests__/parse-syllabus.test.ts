import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the AI SDK
vi.mock("ai", () => ({
	generateText: vi.fn(),
}));

vi.mock("@ai-sdk/anthropic", () => ({
	anthropic: vi.fn(() => "mocked-model"),
}));

import { generateText } from "ai";
import { parseSyllabus } from "../parse-syllabus";

const mockGenerateText = vi.mocked(generateText);

describe("parseSyllabus", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns competencies array from AI response", async () => {
		const competencies = ["Python", "SQL", "Analiza danych", "Machine Learning"];
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify(competencies),
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		const result = await parseSyllabus(
			"Programowanie w Python, bazy danych SQL, analiza danych, uczenie maszynowe i wiele więcej na kierunku informatyka stosowana",
			"Data Analyst",
		);

		expect(result).toEqual(competencies);
		expect(mockGenerateText).toHaveBeenCalledOnce();
	});

	it("strips markdown code blocks from AI response", async () => {
		const competencies = ["React", "TypeScript"];
		mockGenerateText.mockResolvedValue({
			text: `\`\`\`json\n${JSON.stringify(competencies)}\n\`\`\``,
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		const result = await parseSyllabus(
			"Kurs programowania webowego z React i TypeScript oraz inne przedmioty na kierunku informatyka na uczelni WSB Merito",
			"Frontend Developer",
		);

		expect(result).toEqual(competencies);
	});

	it("throws on invalid JSON response", async () => {
		mockGenerateText.mockResolvedValue({
			text: "This is not JSON at all",
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		await expect(
			parseSyllabus(
				"Some syllabus text that is long enough to pass the minimum character count for this test purpose",
				"Data Analyst",
			),
		).rejects.toThrow();
	});

	it("truncates syllabus text to 8000 chars in the prompt", async () => {
		const longText = "A".repeat(10000);
		mockGenerateText.mockResolvedValue({
			text: '["Python"]',
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		await parseSyllabus(longText, "Data Analyst");

		const call = mockGenerateText.mock.calls[0][0];
		expect(call.prompt).toContain("A".repeat(8000));
		expect(call.prompt).not.toContain("A".repeat(8001));
	});

	it("includes career goal in the prompt", async () => {
		mockGenerateText.mockResolvedValue({
			text: '["Python"]',
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		await parseSyllabus(
			"Some syllabus text that is long enough to pass the minimum character count for this test purpose",
			"DevOps Engineer",
		);

		const call = mockGenerateText.mock.calls[0][0];
		expect(call.prompt).toContain("DevOps Engineer");
	});

	it("propagates AI SDK errors", async () => {
		mockGenerateText.mockRejectedValue(new Error("API rate limit exceeded"));

		await expect(
			parseSyllabus(
				"Some syllabus text that is long enough to pass the minimum character count for this test purpose",
				"Data Analyst",
			),
		).rejects.toThrow("API rate limit exceeded");
	});
});
