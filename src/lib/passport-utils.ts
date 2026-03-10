export function calculateCoverage(
	comps: { status: "acquired" | "in_progress" | "missing" }[],
	gapCount: number = 0,
): number {
	const acquired = comps.filter((c) => c.status === "acquired").length;
	const inProgress = comps.filter((c) => c.status === "in_progress").length;
	const covered = acquired + inProgress * 0.5;
	const total = comps.length + gapCount;
	if (total === 0) return 0;
	return Math.round((covered / total) * 100);
}
