// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GapList } from "../gap-list";

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		...props
	}: {
		children: React.ReactNode;
		href: string;
		className?: string;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

const mockGaps = [
	{
		id: "g1",
		competencyName: "Python",
		priority: "critical" as const,
		marketPercentage: 78,
		estimatedHours: 10,
		whyImportant: null,
	},
	{
		id: "g2",
		competencyName: "SQL",
		priority: "important" as const,
		marketPercentage: 85,
		estimatedHours: 8,
		whyImportant: null,
	},
	{
		id: "g3",
		competencyName: "Docker",
		priority: "nice_to_have" as const,
		marketPercentage: 22,
		estimatedHours: 5,
		whyImportant: null,
	},
];

const defaultStats = { critical: 1, important: 1, niceToHave: 1 };

describe("GapList", () => {
	it("renders empty state when no gaps", () => {
		render(<GapList gaps={[]} stats={{ critical: 0, important: 0, niceToHave: 0 }} />);
		expect(screen.getByText("Gratulacje!")).toBeInTheDocument();
		expect(
			screen.getByText(
				"Twój profil pokrywa wymagania rynku pracy. Nie znaleźliśmy żadnych luk kompetencyjnych.",
			),
		).toBeInTheDocument();
		expect(screen.getByText("Wróć do Dashboard")).toBeInTheDocument();
	});

	it("renders empty state link to dashboard", () => {
		render(<GapList gaps={[]} stats={{ critical: 0, important: 0, niceToHave: 0 }} />);
		const link = screen.getByRole("link", { name: /Wróć do Dashboard/i });
		expect(link).toHaveAttribute("href", "/dashboard");
	});

	it("renders summary stat cards with correct counts", () => {
		render(<GapList gaps={mockGaps} stats={defaultStats} />);
		expect(screen.getByText("Krytyczne")).toBeInTheDocument();
		expect(screen.getByText("Ważne")).toBeInTheDocument();
		expect(screen.getAllByText("Warto znać").length).toBeGreaterThanOrEqual(1);
	});

	it("renders all gap cards", () => {
		render(<GapList gaps={mockGaps} stats={defaultStats} />);
		expect(screen.getByText("Python")).toBeInTheDocument();
		expect(screen.getByText("SQL")).toBeInTheDocument();
		expect(screen.getByText("Docker")).toBeInTheDocument();
	});

	it("renders priority badges", () => {
		render(<GapList gaps={mockGaps} stats={defaultStats} />);
		expect(screen.getAllByText("Krytyczna")).toHaveLength(2); // stat card + gap card
		expect(screen.getAllByText("Ważna")).toHaveLength(2);
	});

	it("renders market percentages", () => {
		render(<GapList gaps={mockGaps} stats={defaultStats} />);
		expect(screen.getByText("78%")).toBeInTheDocument();
		expect(screen.getByText("85%")).toBeInTheDocument();
		expect(screen.getByText("22%")).toBeInTheDocument();
	});

	it("renders estimated hours", () => {
		render(<GapList gaps={mockGaps} stats={defaultStats} />);
		expect(screen.getByText("10h nauki")).toBeInTheDocument();
		expect(screen.getByText("8h nauki")).toBeInTheDocument();
		expect(screen.getByText("5h nauki")).toBeInTheDocument();
	});

	it("renders 'Zamknij lukę' links with correct hrefs", () => {
		render(<GapList gaps={mockGaps} stats={defaultStats} />);
		const closeLinks = screen.getAllByText("Zamknij lukę");
		expect(closeLinks).toHaveLength(3);
		expect(closeLinks[0].closest("a")).toHaveAttribute(
			"href",
			"/micro-courses?generate=g1",
		);
	});

	it("renders 'Dlaczego to ważne?' buttons", () => {
		render(<GapList gaps={mockGaps} stats={defaultStats} />);
		const whyButtons = screen.getAllByText("Dlaczego to ważne?");
		expect(whyButtons).toHaveLength(3);
	});
});
