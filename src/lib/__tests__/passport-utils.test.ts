import { describe, expect, it } from "vitest";
import { calculateCoverage } from "../passport-utils";

describe("calculateCoverage", () => {
	it("returns 0 for empty array and no gaps", () => {
		expect(calculateCoverage([], 0)).toBe(0);
	});

	it("returns 100 when all acquired and no gaps", () => {
		const comps = [
			{ status: "acquired" as const },
			{ status: "acquired" as const },
			{ status: "acquired" as const },
		];
		expect(calculateCoverage(comps, 0)).toBe(100);
	});

	it("returns 0 when all missing and no gaps", () => {
		const comps = [{ status: "missing" as const }, { status: "missing" as const }];
		expect(calculateCoverage(comps, 0)).toBe(0);
	});

	it("counts in_progress as 0.5", () => {
		const comps = [{ status: "in_progress" as const }, { status: "in_progress" as const }];
		// (0 + 2*0.5) / 2 * 100 = 50
		expect(calculateCoverage(comps, 0)).toBe(50);
	});

	it("calculates mixed statuses correctly", () => {
		const comps = [
			{ status: "acquired" as const },
			{ status: "in_progress" as const },
			{ status: "missing" as const },
		];
		// (1 + 1*0.5) / 3 * 100 = 50
		expect(calculateCoverage(comps, 0)).toBe(50);
	});

	it("rounds to nearest integer", () => {
		const comps = [
			{ status: "acquired" as const },
			{ status: "missing" as const },
			{ status: "missing" as const },
		];
		// (1 + 0) / 3 * 100 = 33.33... → 33
		expect(calculateCoverage(comps, 0)).toBe(33);
	});

	it("handles single acquired competency", () => {
		expect(calculateCoverage([{ status: "acquired" as const }], 0)).toBe(100);
	});

	it("handles single missing competency", () => {
		expect(calculateCoverage([{ status: "missing" as const }], 0)).toBe(0);
	});

	it("handles single in_progress competency", () => {
		expect(calculateCoverage([{ status: "in_progress" as const }], 0)).toBe(50);
	});

	it("includes gaps in denominator for market coverage", () => {
		const comps = [
			{ status: "acquired" as const },
			{ status: "acquired" as const },
		];
		// 2 acquired, 2 gaps → total = 4 → 2/4 = 50%
		expect(calculateCoverage(comps, 2)).toBe(50);
	});

	it("calculates realistic scenario: 11 comps + 18 gaps", () => {
		const comps = Array.from({ length: 11 }, () => ({ status: "acquired" as const }));
		// 11 acquired / (11 + 18) = 11/29 ≈ 38%
		expect(calculateCoverage(comps, 18)).toBe(38);
	});

	it("handles gaps with mixed competency statuses", () => {
		const comps = [
			{ status: "acquired" as const },
			{ status: "acquired" as const },
			{ status: "in_progress" as const },
			{ status: "missing" as const },
		];
		// covered = 2 + 0.5 = 2.5, total = 4 + 6 = 10 → 25%
		expect(calculateCoverage(comps, 6)).toBe(25);
	});

	it("defaults gapCount to 0 for backward compatibility", () => {
		const comps = [{ status: "acquired" as const }, { status: "acquired" as const }];
		expect(calculateCoverage(comps)).toBe(100);
	});
});
