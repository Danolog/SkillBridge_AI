import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("ai", () => ({
	generateText: vi.fn(),
}));

vi.mock("@ai-sdk/anthropic", () => ({
	anthropic: vi.fn(() => "mocked-model"),
}));

vi.mock("@/lib/db", () => ({
	db: {
		query: {
			jobMarketData: {
				findMany: vi.fn(),
			},
		},
		insert: vi.fn(() => ({
			values: vi.fn(),
		})),
		update: vi.fn(() => ({
			set: vi.fn(() => ({
				where: vi.fn(),
			})),
		})),
		delete: vi.fn(() => ({
			where: vi.fn(),
		})),
	},
}));

import { generateText } from "ai";
import { db } from "@/lib/db";
import { generateGaps } from "../generate-gaps";

const mockGenerateText = vi.mocked(generateText);
const mockFindMany = vi.mocked(db.query.jobMarketData.findMany);
const mockInsert = vi.mocked(db.insert);
const mockUpdate = vi.mocked(db.update);
const mockDelete = vi.mocked(db.delete);

const validResponse = {
	gaps: [
		{ name: "Docker", priority: "critical", marketPercentage: 70, estimatedHours: 20 },
		{ name: "Kubernetes", priority: "important", marketPercentage: 50, estimatedHours: 30 },
	],
	competencyUpdates: [{ name: "Python", status: "acquired", marketPercentage: 80 }],
	marketCoveragePercent: 45,
};

describe("generateGaps", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockFindMany.mockResolvedValue([]);
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify(validResponse),
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);
		mockInsert.mockReturnValue({ values: vi.fn() } as never);
		mockUpdate.mockReturnValue({
			set: vi.fn(() => ({ where: vi.fn() })),
		} as never);
		mockDelete.mockReturnValue({ where: vi.fn() } as never);
	});

	it("deletes existing gaps before inserting new ones (idempotent re-run)", async () => {
		const callOrder: string[] = [];
		mockDelete.mockImplementation(((..._args: unknown[]) => {
			callOrder.push("delete");
			return { where: vi.fn() } as never;
		}) as typeof db.delete);
		mockInsert.mockImplementation(((..._args: unknown[]) => {
			callOrder.push("insert");
			return { values: vi.fn() } as never;
		}) as typeof db.insert);

		await generateGaps("student-1", ["Python"], "Data Analyst");

		expect(callOrder.indexOf("delete")).toBeLessThan(callOrder.indexOf("insert"));
		expect(mockDelete).toHaveBeenCalled();
	});

	it("still deletes when AI returns zero gaps (avoids stale leftovers)", async () => {
		mockGenerateText.mockResolvedValue({
			text: JSON.stringify({ ...validResponse, gaps: [] }),
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		await generateGaps("student-1", ["Python"], "Data Analyst");

		expect(mockDelete).toHaveBeenCalled();
		expect(mockInsert).not.toHaveBeenCalled();
	});

	it("inserts gap rows tagged with the studentId", async () => {
		const valuesSpy = vi.fn();
		mockInsert.mockReturnValue({ values: valuesSpy } as never);

		await generateGaps("student-42", ["Python"], "Data Analyst");

		expect(valuesSpy).toHaveBeenCalledOnce();
		const inserted = valuesSpy.mock.calls[0][0] as Array<{ studentId: string }>;
		expect(inserted).toHaveLength(2);
		expect(inserted.every((row) => row.studentId === "student-42")).toBe(true);
	});

	it("updates passport market coverage from AI output", async () => {
		const setSpy = vi.fn(() => ({ where: vi.fn() }));
		mockUpdate.mockReturnValue({ set: setSpy } as never);

		await generateGaps("student-1", ["Python"], "Data Analyst");

		const passportUpdate = setSpy.mock.calls.find((call) => {
			const arg = call[0] as Record<string, unknown>;
			return "marketCoveragePercent" in arg;
		});
		expect(passportUpdate).toBeDefined();
		expect((passportUpdate?.[0] as { marketCoveragePercent: number }).marketCoveragePercent).toBe(
			45,
		);
	});

	it("strips markdown code fences from AI output", async () => {
		mockGenerateText.mockResolvedValue({
			text: `\`\`\`json\n${JSON.stringify(validResponse)}\n\`\`\``,
		} as ReturnType<typeof generateText> extends Promise<infer T> ? T : never);

		await expect(
			generateGaps("student-1", ["Python"], "Data Analyst"),
		).resolves.toBeUndefined();
		expect(mockInsert).toHaveBeenCalled();
	});

	it("propagates AI SDK errors", async () => {
		mockGenerateText.mockRejectedValue(new Error("rate limit"));
		await expect(generateGaps("student-1", ["Python"], "Data Analyst")).rejects.toThrow(
			"rate limit",
		);
	});
});
