import { describe, expect, it } from "vitest";
import { calculateCoverage } from "../passport-utils";

describe("calculateCoverage", () => {
	it("returns 0 for empty array", () => {
		expect(calculateCoverage([])).toBe(0);
	});

	it("returns 100 when all acquired", () => {
		const comps = [
			{ status: "acquired" as const },
			{ status: "acquired" as const },
			{ status: "acquired" as const },
		];
		expect(calculateCoverage(comps)).toBe(100);
	});

	it("returns 0 when all missing", () => {
		const comps = [{ status: "missing" as const }, { status: "missing" as const }];
		expect(calculateCoverage(comps)).toBe(0);
	});

	it("counts in_progress as 0.5", () => {
		const comps = [{ status: "in_progress" as const }, { status: "in_progress" as const }];
		// (0 + 2*0.5) / 2 * 100 = 50
		expect(calculateCoverage(comps)).toBe(50);
	});

	it("calculates mixed statuses correctly", () => {
		const comps = [
			{ status: "acquired" as const },
			{ status: "in_progress" as const },
			{ status: "missing" as const },
		];
		// (1 + 1*0.5) / 3 * 100 = 50
		expect(calculateCoverage(comps)).toBe(50);
	});

	it("rounds to nearest integer", () => {
		const comps = [
			{ status: "acquired" as const },
			{ status: "missing" as const },
			{ status: "missing" as const },
		];
		// (1 + 0) / 3 * 100 = 33.33... → 33
		expect(calculateCoverage(comps)).toBe(33);
	});

	it("handles single acquired competency", () => {
		expect(calculateCoverage([{ status: "acquired" as const }])).toBe(100);
	});

	it("handles single missing competency", () => {
		expect(calculateCoverage([{ status: "missing" as const }])).toBe(0);
	});

	it("handles single in_progress competency", () => {
		expect(calculateCoverage([{ status: "in_progress" as const }])).toBe(50);
	});

	it("handles realistic mix of 10 competencies", () => {
		const comps = [
			{ status: "acquired" as const },
			{ status: "acquired" as const },
			{ status: "acquired" as const },
			{ status: "acquired" as const },
			{ status: "in_progress" as const },
			{ status: "in_progress" as const },
			{ status: "missing" as const },
			{ status: "missing" as const },
			{ status: "missing" as const },
			{ status: "missing" as const },
		];
		// (4 + 2*0.5) / 10 * 100 = 50
		expect(calculateCoverage(comps)).toBe(50);
	});
});
