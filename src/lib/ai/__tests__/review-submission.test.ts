import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("ai", () => ({
	generateText: vi.fn(),
}));

vi.mock("@ai-sdk/anthropic", () => ({
	anthropic: vi.fn(() => "mocked-model"),
}));

import { generateText } from "ai";
import { reviewSubmission } from "../review-submission";

type TextReturn = ReturnType<typeof generateText> extends Promise<infer T> ? T : never;

const mockGenerateText = vi.mocked(generateText);

const validReview = {
	score: 82,
	feedback: "Dobra praca! Analiza jest poprawna.",
	cheatRiskScore: 0.1,
	criteriaScores: [
		{ criterion: "Analiza", score: 85, comment: "Poprawna analiza danych" },
		{ criterion: "Wizualizacja", score: 78, comment: "Wykresy czytelne" },
	],
};

const rubric = [
	{ criterion: "Analiza", weight: 60, description: "Poprawna analiza" },
	{ criterion: "Wizualizacja", weight: 40, description: "Wykresy" },
];

beforeEach(() => {
	vi.clearAllMocks();
	vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("no network")));
});

describe("reviewSubmission", () => {
	it("returns valid review result", async () => {
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify(validReview),
		} as TextReturn);

		const result = await reviewSubmission(
			"https://github.com/user/repo",
			null,
			rubric,
			"Test Project",
			"Description",
		);

		expect(result.score).toBe(82);
		expect(result.feedback).toContain("Dobra praca");
		expect(result.cheatRiskScore).toBe(0.1);
		expect(result.criteriaScores).toHaveLength(2);
	});

	it("handles GitHub API failure gracefully", async () => {
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify(validReview),
		} as TextReturn);

		const result = await reviewSubmission(
			"https://github.com/user/repo",
			null,
			rubric,
			"Test",
			"Desc",
		);

		expect(result.score).toBe(82);
	});

	it("works without repoUrl", async () => {
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify(validReview),
		} as TextReturn);

		const result = await reviewSubmission(
			null,
			"https://colab.google.com/notebook",
			rubric,
			"Test",
			"Desc",
		);

		expect(result.score).toBe(82);
	});

	it("throws on completely invalid AI response", async () => {
		mockGenerateText.mockResolvedValue({
			text: "This is not JSON at all and has no braces",
		} as TextReturn);

		await expect(
			reviewSubmission(null, "https://example.com", rubric, "Test", "Desc"),
		).rejects.toThrow("AI zwróciło nieprawidłowy JSON");
	});
});
