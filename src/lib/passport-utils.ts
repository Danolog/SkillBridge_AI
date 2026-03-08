export function calculateCoverage(
	comps: { status: "acquired" | "in_progress" | "missing" }[],
): number {
	const total = comps.length;
	if (total === 0) return 0;
	const acquired = comps.filter((c) => c.status === "acquired").length;
	const inProgress = comps.filter((c) => c.status === "in_progress").length;
	return Math.round(((acquired + inProgress * 0.5) / total) * 100);
}
