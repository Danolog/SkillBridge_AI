"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

type HeatmapItem = {
	competencyName: string;
	careerGoal: string;
	coveragePercent: number;
	requiredByPercent: number;
};

function getCoverageColor(percent: number): string {
	if (percent >= 70) return "#22c55e";
	if (percent >= 40) return "#eab308";
	return "#ef4444";
}

export function CompetencyHeatmap({ data }: { data: HeatmapItem[] }) {
	// Group by competencyName — average coverage and max demand across career goals
	const grouped = new Map<
		string,
		{ totalCoverage: number; maxDemand: number; count: number; goals: string[] }
	>();
	for (const item of data) {
		const existing = grouped.get(item.competencyName) || {
			totalCoverage: 0,
			maxDemand: 0,
			count: 0,
			goals: [],
		};
		existing.totalCoverage += item.coveragePercent;
		existing.maxDemand = Math.max(existing.maxDemand, item.requiredByPercent);
		existing.count++;
		existing.goals.push(item.careerGoal);
		grouped.set(item.competencyName, existing);
	}

	const chartData = Array.from(grouped.entries())
		.map(([name, val]) => ({
			name: name.length > 22 ? `${name.slice(0, 20)}...` : name,
			fullName: name,
			coverage: Math.round(val.totalCoverage / val.count),
			demand: val.maxDemand,
			goals: val.goals,
		}))
		// Sort by market demand descending — show most important competencies first
		.sort((a, b) => b.demand - a.demand)
		.slice(0, 15);

	if (chartData.length === 0) {
		return (
			<p className="text-muted-foreground py-8 text-center">Brak danych do wyświetlenia wykresu.</p>
		);
	}

	return (
		<div>
			<ResponsiveContainer width="100%" height={Math.max(400, chartData.length * 32)}>
				<BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
					<CartesianGrid strokeDasharray="3 3" horizontal={false} />
					<XAxis type="number" domain={[0, 100]} unit="%" />
					<YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12 }} />
					<Tooltip
						formatter={(value, _name, props) => {
							const item = props.payload;
							return [
								`${value}% pokrycia (zapotrzebowanie rynku: ${item.demand}%)`,
								item.goals?.join(", ") ?? "",
							];
						}}
						labelFormatter={(label) => {
							const item = chartData.find((d) => d.name === label);
							return item?.fullName ?? label;
						}}
					/>
					<Bar dataKey="coverage" name="Pokrycie %" radius={[0, 4, 4, 0]}>
						{chartData.map((entry) => (
							<Cell key={entry.name} fill={getCoverageColor(entry.coverage)} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
			<div className="mt-4 flex items-center justify-center gap-6 text-sm">
				<div className="flex items-center gap-1.5">
					<span className="h-3 w-3 rounded-sm" style={{ backgroundColor: "#22c55e" }} />
					<span>&gt;70% (Dobry)</span>
				</div>
				<div className="flex items-center gap-1.5">
					<span className="h-3 w-3 rounded-sm" style={{ backgroundColor: "#eab308" }} />
					<span>40-70% (Średni)</span>
				</div>
				<div className="flex items-center gap-1.5">
					<span className="h-3 w-3 rounded-sm" style={{ backgroundColor: "#ef4444" }} />
					<span>&lt;40% (Wymaga uwagi)</span>
				</div>
			</div>
		</div>
	);
}
