// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PassportView } from "../passport-view";

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../pdf-export", () => ({
	PdfExportButton: (_props: { passportRef: unknown }) => (
		<button type="button">Eksportuj PDF</button>
	),
}));

const mockData = {
	id: "passport-uuid-123",
	student: {
		name: "Jan Kowalski",
		university: "WSB Merito Warszawa",
		fieldOfStudy: "Informatyka",
		semester: 3,
		careerGoal: "Frontend Developer",
	},
	marketCoveragePercent: 73,
	competencies: [
		{ name: "JavaScript", status: "acquired" as const, marketPercentage: 85 },
		{ name: "React", status: "acquired" as const, marketPercentage: 90 },
		{ name: "TypeScript", status: "in_progress" as const, marketPercentage: 75 },
		{ name: "Python", status: "missing" as const, marketPercentage: 40 },
	],
	gapCount: 1,
	generatedAt: "2026-03-08T12:00:00.000Z",
};

describe("PassportView", () => {
	it("renders page title", () => {
		render(<PassportView data={mockData} />);
		expect(screen.getByText("Paszport Kompetencji")).toBeInTheDocument();
	});

	it("renders student name", () => {
		render(<PassportView data={mockData} />);
		expect(screen.getByText("Jan Kowalski")).toBeInTheDocument();
	});

	it("renders student university", () => {
		render(<PassportView data={mockData} />);
		expect(screen.getByText("WSB Merito Warszawa")).toBeInTheDocument();
	});

	it("renders student field of study", () => {
		render(<PassportView data={mockData} />);
		expect(screen.getByText("Informatyka")).toBeInTheDocument();
	});

	it("renders student semester", () => {
		render(<PassportView data={mockData} />);
		expect(screen.getByText("Semestr 3")).toBeInTheDocument();
	});

	it("renders career goal", () => {
		render(<PassportView data={mockData} />);
		expect(screen.getByText(/Cel: Frontend Developer/)).toBeInTheDocument();
	});

	it("renders avatar with initials", () => {
		render(<PassportView data={mockData} />);
		expect(screen.getByText("JK")).toBeInTheDocument();
	});

	it("renders market coverage percentage", () => {
		render(<PassportView data={mockData} />);
		expect(screen.getByText("73%")).toBeInTheDocument();
	});

	it("renders coverage progress bar with correct width", () => {
		const { container } = render(<PassportView data={mockData} />);
		const fill = container.querySelector(".pp-progress-fill");
		expect(fill).toHaveStyle({ width: "73%" });
	});

	it("renders stat card with acquired count", () => {
		render(<PassportView data={mockData} />);
		const statCards = screen.getAllByText("Opanowane");
		expect(statCards.length).toBeGreaterThan(0);
	});

	it("renders acquired competency count as 2", () => {
		render(<PassportView data={mockData} />);
		expect(screen.getByText("2 kompetencji")).toBeInTheDocument();
	});

	it("renders in progress stat label", () => {
		render(<PassportView data={mockData} />);
		const labels = screen.getAllByText("W trakcie nauki");
		expect(labels.length).toBeGreaterThan(0);
	});

	it("renders missing count", () => {
		render(<PassportView data={mockData} />);
		expect(screen.getByText("Brakuje")).toBeInTheDocument();
	});

	it("renders names of acquired and in-progress competencies", () => {
		render(<PassportView data={mockData} />);
		expect(screen.getByText("JavaScript")).toBeInTheDocument();
		expect(screen.getByText("React")).toBeInTheDocument();
		expect(screen.getByText("TypeScript")).toBeInTheDocument();
	});

	it("renders section headers for acquired and in-progress groups", () => {
		render(<PassportView data={mockData} />);
		expect(screen.getByText("Opanowane kompetencje")).toBeInTheDocument();
		expect(screen.getAllByText(/W trakcie nauki/).length).toBeGreaterThan(0);
	});

	it("does not render a list section for missing competencies (only stat card count)", () => {
		render(<PassportView data={mockData} />);
		expect(screen.queryByText("Brakujace kompetencje")).not.toBeInTheDocument();
	});

	it("renders gap count from data.gapCount in the stat card", () => {
		const data = { ...mockData, gapCount: 14 };
		render(<PassportView data={data} />);
		expect(screen.getByText("14")).toBeInTheDocument();
	});

	it("renders Kopiuj link button", () => {
		render(<PassportView data={mockData} />);
		expect(screen.getByText("Kopiuj link")).toBeInTheDocument();
	});

	it("copies public URL to clipboard on Kopiuj link click", async () => {
		const { toast } = await import("sonner");
		const mockWriteText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, {
			clipboard: { writeText: mockWriteText },
		});

		render(<PassportView data={mockData} />);
		fireEvent.click(screen.getByText("Kopiuj link"));

		await waitFor(() => {
			expect(mockWriteText).toHaveBeenCalledWith(
				expect.stringContaining("/passport/passport-uuid-123"),
			);
		});

		await waitFor(() => {
			expect(toast.success).toHaveBeenCalledWith("Link skopiowany!");
		});
	});

	it("shows error toast when clipboard fails", async () => {
		const { toast } = await import("sonner");
		Object.assign(navigator, {
			clipboard: {
				writeText: vi.fn().mockRejectedValue(new Error("Clipboard error")),
			},
		});

		render(<PassportView data={mockData} />);
		fireEvent.click(screen.getByText("Kopiuj link"));

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith("Nie udalo sie skopiowac linku");
		});
	});

	it("renders formatted date in footer", () => {
		render(<PassportView data={mockData} />);
		expect(screen.getByText(/Wygenerowano:/)).toBeInTheDocument();
	});

	it("renders SkillBridge in footer", () => {
		render(<PassportView data={mockData} />);
		expect(screen.getByText("SkillBridge")).toBeInTheDocument();
	});

	it("renders Eksportuj PDF button", () => {
		render(<PassportView data={mockData} />);
		expect(screen.getByText("Eksportuj PDF")).toBeInTheDocument();
	});

	it("does not render acquired section when no acquired competencies", () => {
		const data = {
			...mockData,
			competencies: [{ name: "Python", status: "missing" as const, marketPercentage: 40 }],
		};
		render(<PassportView data={data} />);
		expect(screen.queryByText("Opanowane kompetencje")).not.toBeInTheDocument();
	});

	it("handles empty competencies array", () => {
		const data = { ...mockData, competencies: [], gapCount: 0, marketCoveragePercent: 0 };
		const { container } = render(<PassportView data={data} />);
		const coverageValue = container.querySelector(".pp-coverage-value");
		expect(coverageValue).toHaveTextContent("0%");
	});

	it("renders coverage sublabel with career goal", () => {
		render(<PassportView data={mockData} />);
		expect(screen.getByText(/kluczowych kompetencji dla Frontend Developer/)).toBeInTheDocument();
	});

	it("renders progress markers", () => {
		const { container } = render(<PassportView data={mockData} />);
		const markers = container.querySelector(".pp-progress-markers");
		expect(markers).toBeInTheDocument();
		expect(markers?.textContent).toContain("0%");
		expect(markers?.textContent).toContain("25%");
		expect(markers?.textContent).toContain("50%");
		expect(markers?.textContent).toContain("75%");
		expect(markers?.textContent).toContain("100%");
	});
});
