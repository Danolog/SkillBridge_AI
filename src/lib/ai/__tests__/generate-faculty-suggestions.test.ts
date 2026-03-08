import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("ai", () => ({
	generateText: vi.fn(),
}));

vi.mock("@ai-sdk/anthropic", () => ({
	anthropic: vi.fn(() => "mocked-model"),
}));

import { generateText } from "ai";
import { generateFacultySuggestions } from "../generate-faculty-suggestions";

const mockGenerateText = vi.mocked(generateText);

describe("generateFacultySuggestions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns parsed suggestions array", async () => {
		const suggestions = ["Sugestia 1", "Sugestia 2", "Sugestia 3"];
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify(suggestions),
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		const result = await generateFacultySuggestions(
			[{ name: "Python", requiredByPercent: 78 }],
			50,
		);

		expect(result).toEqual(suggestions);
	});

	it("strips markdown code blocks from response", async () => {
		const suggestions = ["Sugestia 1"];
		mockGenerateText.mockResolvedValue({
			text: `\`\`\`json\n${JSON.stringify(suggestions)}\n\`\`\``,
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		const result = await generateFacultySuggestions([{ name: "SQL", requiredByPercent: 89 }], 30);

		expect(result).toEqual(suggestions);
	});

	it("includes student count in prompt", async () => {
		mockGenerateText.mockResolvedValue({
			text: '["Sugestia"]',
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		await generateFacultySuggestions([{ name: "Python", requiredByPercent: 78 }], 42);

		const call = mockGenerateText.mock.calls[0][0];
		expect(call.prompt).toContain("42");
	});

	it("includes competency names in prompt", async () => {
		mockGenerateText.mockResolvedValue({
			text: '["Sugestia"]',
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		await generateFacultySuggestions(
			[
				{ name: "Docker", requiredByPercent: 71 },
				{ name: "Kubernetes", requiredByPercent: 55 },
			],
			20,
		);

		const call = mockGenerateText.mock.calls[0][0];
		expect(call.prompt).toContain("Docker");
		expect(call.prompt).toContain("Kubernetes");
	});

	it("includes market percentage in prompt", async () => {
		mockGenerateText.mockResolvedValue({
			text: '["Sugestia"]',
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		await generateFacultySuggestions([{ name: "Python", requiredByPercent: 78 }], 20);

		const call = mockGenerateText.mock.calls[0][0];
		expect(call.prompt).toContain("78%");
	});

	it("slices to max 5 competencies in prompt", async () => {
		mockGenerateText.mockResolvedValue({
			text: '["Sugestia"]',
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		const manyCompetencies = Array.from({ length: 8 }, (_, i) => ({
			name: `Skill${i}`,
			requiredByPercent: 50 + i,
		}));

		await generateFacultySuggestions(manyCompetencies, 30);

		const call = mockGenerateText.mock.calls[0][0];
		// Should include first 5 but not 6th
		expect(call.prompt).toContain("Skill0");
		expect(call.prompt).toContain("Skill4");
		expect(call.prompt).not.toContain("Skill5");
	});

	it("uses maxOutputTokens of 600", async () => {
		mockGenerateText.mockResolvedValue({
			text: '["Sugestia"]',
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		await generateFacultySuggestions([{ name: "Python", requiredByPercent: 78 }], 10);

		const call = mockGenerateText.mock.calls[0][0];
		expect(call.maxOutputTokens).toBe(600);
	});

	it("propagates AI SDK errors", async () => {
		mockGenerateText.mockRejectedValue(new Error("API error"));

		await expect(
			generateFacultySuggestions([{ name: "Python", requiredByPercent: 78 }], 50),
		).rejects.toThrow("API error");
	});
});
