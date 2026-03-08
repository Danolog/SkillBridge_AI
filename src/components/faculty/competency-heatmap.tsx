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
	// Group by competencyName, average coveragePercent across career goals
	const grouped = new Map<string, { total: number; count: number }>();
	for (const item of data) {
		const existing = grouped.get(item.competencyName) || { total: 0, count: 0 };
		existing.total += item.coveragePercent;
		existing.count++;
		grouped.set(item.competencyName, existing);
	}

	const chartData = Array.from(grouped.entries())
		.map(([name, val]) => ({
			name: name.length > 20 ? `${name.slice(0, 18)}...` : name,
			fullName: name,
			coverage: Math.round(val.total / val.count),
		}))
		.sort((a, b) => a.coverage - b.coverage)
		.slice(0, 15);

	if (chartData.length === 0) {
		return (
			<p className="text-muted-foreground text-center py-8">Brak danych do wyświetlenia wykresu.</p>
		);
	}

	return (
		<div>
			<ResponsiveContainer width="100%" height={400}>
				<BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
					<CartesianGrid strokeDasharray="3 3" horizontal={false} />
					<XAxis type="number" domain={[0, 100]} unit="%" />
					<YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
					<Tooltip
						formatter={(value) => [`${value}%`, "Pokrycie"]}
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
			<div className="flex items-center justify-center gap-6 mt-4 text-sm">
				<div className="flex items-center gap-1.5">
					<span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#22c55e" }} />
					<span>&gt;70% (Dobry)</span>
				</div>
				<div className="flex items-center gap-1.5">
					<span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#eab308" }} />
					<span>40-70% (Średni)</span>
				</div>
				<div className="flex items-center gap-1.5">
					<span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#ef4444" }} />
					<span>&lt;40% (Wymaga uwagi)</span>
				</div>
			</div>
		</div>
	);
}
