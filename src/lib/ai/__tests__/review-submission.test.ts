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

	it("throws when AI returns score outside 0-100", async () => {
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify({ ...validReview, score: 150 }),
		} as TextReturn);

		await expect(
			reviewSubmission("https://github.com/user/repo", null, rubric, "Test", "Desc"),
		).rejects.toThrow("AI zwróciło niezgodny ze schematem JSON");
	});

	it("throws when AI returns cheatRiskScore outside 0-1", async () => {
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify({ ...validReview, cheatRiskScore: 5 }),
		} as TextReturn);

		await expect(
			reviewSubmission("https://github.com/user/repo", null, rubric, "Test", "Desc"),
		).rejects.toThrow("AI zwróciło niezgodny ze schematem JSON");
	});

	it("throws when AI omits criteriaScores", async () => {
		const { criteriaScores: _omitted, ...withoutCriteria } = validReview;
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify(withoutCriteria),
		} as TextReturn);

		await expect(
			reviewSubmission("https://github.com/user/repo", null, rubric, "Test", "Desc"),
		).rejects.toThrow("AI zwróciło niezgodny ze schematem JSON");
	});

	it("throws when AI returns empty criteriaScores array (min 1)", async () => {
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify({ ...validReview, criteriaScores: [] }),
		} as TextReturn);

		await expect(
			reviewSubmission("https://github.com/user/repo", null, rubric, "Test", "Desc"),
		).rejects.toThrow("AI zwróciło niezgodny ze schematem JSON");
	});

	it("throws when AI returns empty feedback (min 1 char)", async () => {
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify({ ...validReview, feedback: "" }),
		} as TextReturn);

		await expect(
			reviewSubmission("https://github.com/user/repo", null, rubric, "Test", "Desc"),
		).rejects.toThrow("AI zwróciło niezgodny ze schematem JSON");
	});

	it("does NOT call fetch for repoUrl with disallowed host (SSRF defense)", async () => {
		const fetchSpy = vi.fn().mockRejectedValue(new Error("should not be called"));
		vi.stubGlobal("fetch", fetchSpy);
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify(validReview),
		} as TextReturn);

		await reviewSubmission(
			"https://attacker.com/?x=github.com",
			null,
			rubric,
			"Test",
			"Desc",
		);

		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it("does NOT call fetch for AWS metadata URL (SSRF defense)", async () => {
		const fetchSpy = vi.fn().mockRejectedValue(new Error("should not be called"));
		vi.stubGlobal("fetch", fetchSpy);
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify(validReview),
		} as TextReturn);

		await reviewSubmission("http://169.254.169.254/", null, rubric, "Test", "Desc");

		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it("calls fetch for valid github.com URL with timeout signal", async () => {
		const fetchSpy = vi
			.fn()
			.mockResolvedValue({ ok: false, json: async () => ({}) } as Response);
		vi.stubGlobal("fetch", fetchSpy);
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify(validReview),
		} as TextReturn);

		await reviewSubmission("https://github.com/user/repo", null, rubric, "Test", "Desc");

		expect(fetchSpy).toHaveBeenCalledOnce();
		const [url, init] = fetchSpy.mock.calls[0];
		expect(url).toBe("https://api.github.com/repos/user/repo");
		expect(init).toMatchObject({
			headers: expect.objectContaining({ "user-agent": expect.any(String) }),
		});
		expect(init.signal).toBeInstanceOf(AbortSignal);
	});
});
