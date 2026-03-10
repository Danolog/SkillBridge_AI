// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FacultyDashboard } from "../faculty-dashboard";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: mockPush }),
}));

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

const dashboardData = {
	studentCount: 25,
	heatmapData: [
		{
			competencyName: "Python",
			careerGoal: "Data Analyst",
			coveragePercent: 80,
			requiredByPercent: 78,
		},
		{
			competencyName: "SQL",
			careerGoal: "Data Analyst",
			coveragePercent: 30,
			requiredByPercent: 89,
		},
	],
	topMissingCompetencies: [
		{ name: "Docker", missingCount: 15, requiredByPercent: 71, careerGoals: ["DevOps Engineer"] },
		{
			name: "Kubernetes",
			missingCount: 12,
			requiredByPercent: 55,
			careerGoals: ["DevOps Engineer"],
		},
	],
	aiSuggestions: ["Sugestia testowa 1", "Sugestia testowa 2"],
	generatedAt: new Date().toISOString(),
};

describe("FacultyDashboard", () => {
	it("shows loading state initially", () => {
		const mockFetch = vi.fn().mockReturnValue(new Promise(() => {}));
		vi.stubGlobal("fetch", mockFetch);

		render(<FacultyDashboard />);
		expect(screen.getByText("Ładowanie danych i generowanie sugestii AI...")).toBeInTheDocument();

		vi.unstubAllGlobals();
	});

	it("renders dashboard with data", async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: () => Promise.resolve(dashboardData),
		});
		vi.stubGlobal("fetch", mockFetch);

		render(<FacultyDashboard />);

		await waitFor(() => {
			expect(screen.getByText("Studentów w bazie")).toBeInTheDocument();
		});

		expect(screen.getByText("Docker")).toBeInTheDocument();
		expect(screen.getByText("Kubernetes")).toBeInTheDocument();
		expect(screen.getByText("Sugestia testowa 1")).toBeInTheDocument();
		expect(screen.getByText("Sugestia testowa 2")).toBeInTheDocument();

		vi.unstubAllGlobals();
	});

	it("shows too few students message", async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: () => Promise.resolve({ tooFewStudents: true, studentCount: 2 }),
		});
		vi.stubGlobal("fetch", mockFetch);

		render(<FacultyDashboard />);

		await waitFor(() => {
			expect(screen.getByText("Za mało danych")).toBeInTheDocument();
		});

		expect(screen.getByText(/Minimum 3 studentów/)).toBeInTheDocument();

		vi.unstubAllGlobals();
	});

	it("redirects to login on 401", async () => {
		const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 401 });
		vi.stubGlobal("fetch", mockFetch);

		render(<FacultyDashboard />);

		await waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith("/faculty/login");
		});

		vi.unstubAllGlobals();
	});

	it("shows error message on fetch failure", async () => {
		const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
		vi.stubGlobal("fetch", mockFetch);

		render(<FacultyDashboard />);

		await waitFor(() => {
			expect(screen.getByText("Błąd podczas pobierania danych.")).toBeInTheDocument();
		});

		vi.unstubAllGlobals();
	});

	it("shows connection error on network exception", async () => {
		const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
		vi.stubGlobal("fetch", mockFetch);

		render(<FacultyDashboard />);

		await waitFor(() => {
			expect(screen.getByText("Błąd połączenia z serwerem.")).toBeInTheDocument();
		});

		vi.unstubAllGlobals();
	});

	it("renders logout button in header", async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: () => Promise.resolve(dashboardData),
		});
		vi.stubGlobal("fetch", mockFetch);

		render(<FacultyDashboard />);

		await waitFor(() => {
			expect(screen.getByText("Wyloguj")).toBeInTheDocument();
		});

		vi.unstubAllGlobals();
	});

	it("renders AI suggestions section", async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: () => Promise.resolve(dashboardData),
		});
		vi.stubGlobal("fetch", mockFetch);

		render(<FacultyDashboard />);

		await waitFor(() => {
			expect(screen.getByText("Sugestie AI dla rady programowej")).toBeInTheDocument();
		});

		vi.unstubAllGlobals();
	});

	it("renders empty missing competencies message", async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: () =>
				Promise.resolve({
					...dashboardData,
					topMissingCompetencies: [],
				}),
		});
		vi.stubGlobal("fetch", mockFetch);

		render(<FacultyDashboard />);

		await waitFor(() => {
			expect(screen.getByText("Brak danych o lukach kompetencyjnych.")).toBeInTheDocument();
		});

		vi.unstubAllGlobals();
	});

	it("renders top missing competencies with counts", async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: () => Promise.resolve(dashboardData),
		});
		vi.stubGlobal("fetch", mockFetch);

		render(<FacultyDashboard />);

		await waitFor(() => {
			expect(screen.getByText(/Brakuje 15 studentom/)).toBeInTheDocument();
		});

		expect(screen.getAllByText("DevOps Engineer").length).toBeGreaterThan(0);

		vi.unstubAllGlobals();
	});
});
