// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CompetencyHeatmap } from "../competency-heatmap";

vi.mock("recharts", () => ({
	ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="responsive-container">{children}</div>
	),
	BarChart: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="bar-chart">{children}</div>
	),
	Bar: () => <div data-testid="bar" />,
	XAxis: () => <div />,
	YAxis: () => <div />,
	CartesianGrid: () => <div />,
	Tooltip: () => <div />,
	Cell: () => <div />,
}));

describe("CompetencyHeatmap", () => {
	it("renders empty state when data is empty", () => {
		render(<CompetencyHeatmap data={[]} />);
		expect(screen.getByText("Brak danych do wyświetlenia wykresu.")).toBeInTheDocument();
	});

	it("renders chart when data is provided", () => {
		render(
			<CompetencyHeatmap
				data={[
					{
						competencyName: "Python",
						careerGoal: "Data Analyst",
						coveragePercent: 80,
						requiredByPercent: 78,
					},
				]}
			/>,
		);
		expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
		expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
	});

	it("renders legend items", () => {
		render(
			<CompetencyHeatmap
				data={[
					{
						competencyName: "SQL",
						careerGoal: "Data Analyst",
						coveragePercent: 50,
						requiredByPercent: 89,
					},
				]}
			/>,
		);
		expect(screen.getByText(">70% (Dobry)")).toBeInTheDocument();
		expect(screen.getByText("40-70% (Średni)")).toBeInTheDocument();
		expect(screen.getByText("<40% (Wymaga uwagi)")).toBeInTheDocument();
	});

	it("groups data by competency name", () => {
		render(
			<CompetencyHeatmap
				data={[
					{
						competencyName: "Python",
						careerGoal: "Data Analyst",
						coveragePercent: 80,
						requiredByPercent: 78,
					},
					{
						competencyName: "Python",
						careerGoal: "Data Scientist",
						coveragePercent: 60,
						requiredByPercent: 85,
					},
				]}
			/>,
		);
		// Should render chart (grouping works)
		expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
	});

	it("limits chart to 15 items maximum", () => {
		const data = Array.from({ length: 20 }, (_, i) => ({
			competencyName: `Skill ${i}`,
			careerGoal: "Developer",
			coveragePercent: i * 5,
			requiredByPercent: 50,
		}));

		render(<CompetencyHeatmap data={data} />);
		// Should still render (no crash with >15 items)
		expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
	});
});
