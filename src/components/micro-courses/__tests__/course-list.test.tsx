// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CourseList } from "../course-list";

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

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn() }),
	useSearchParams: () => new URLSearchParams(),
}));

const mockCourses = [
	{
		id: "c1",
		competencyName: "SQL",
		title: "Podstawy SQL i zapytania bazodanowe",
		content: {
			estimatedMinutes: 20,
			steps: [
				{ title: "Krok 1", content: "Treść" },
				{ title: "Krok 2", content: "Treść" },
				{ title: "Krok 3", content: "Treść" },
			],
			resources: [
				{ title: "Link 1", url: "https://example.com", type: "docs" as const },
				{ title: "Link 2", url: "https://example.com", type: "video" as const },
			],
			project: { title: "Projekt", description: "Opis", tools: ["Google Colab"] },
		},
		completed: true,
	},
	{
		id: "c2",
		competencyName: "Python",
		title: "Python — analiza danych z Pandas",
		content: {
			estimatedMinutes: 25,
			steps: [
				{ title: "Krok 1", content: "Treść" },
				{ title: "Krok 2", content: "Treść" },
			],
			resources: [{ title: "Link 1", url: "https://example.com", type: "article" as const }],
			project: { title: "Projekt", description: "Opis", tools: ["Jupyter"] },
		},
		completed: false,
	},
];

describe("CourseList", () => {
	it("renders empty state when no courses", () => {
		render(<CourseList initialCourses={[]} />);
		expect(screen.getByText("Brak mikro-kursów")).toBeInTheDocument();
		expect(screen.getByText(/żeby wygenerować pierwszy mikro-kurs/)).toBeInTheDocument();
	});

	it("renders empty state link to gap analysis", () => {
		render(<CourseList initialCourses={[]} />);
		const link = screen.getByRole("link", { name: /Przejdź do Gap Analysis/ });
		expect(link).toHaveAttribute("href", "/gap-analysis");
	});

	it("renders progress section with correct counts", () => {
		render(<CourseList initialCourses={mockCourses} />);
		expect(screen.getByText("Postęp nauki")).toBeInTheDocument();
		expect(screen.getByText("1 / 2 ukończone")).toBeInTheDocument();
	});

	it("renders completed count in stats", () => {
		render(<CourseList initialCourses={mockCourses} />);
		expect(screen.getByText("1 ukończone")).toBeInTheDocument();
		expect(screen.getByText("1 do zrobienia")).toBeInTheDocument();
	});

	it("renders course titles", () => {
		render(<CourseList initialCourses={mockCourses} />);
		expect(screen.getByText("Podstawy SQL i zapytania bazodanowe")).toBeInTheDocument();
		expect(screen.getByText("Python — analiza danych z Pandas")).toBeInTheDocument();
	});

	it("renders competency names on cards", () => {
		render(<CourseList initialCourses={mockCourses} />);
		expect(screen.getByText("SQL")).toBeInTheDocument();
		expect(screen.getByText("Python")).toBeInTheDocument();
	});

	it("renders correct status badges", () => {
		render(<CourseList initialCourses={mockCourses} />);
		expect(screen.getByText("Ukończone")).toBeInTheDocument();
		expect(screen.getByText("Do zrobienia")).toBeInTheDocument();
	});

	it("renders estimated time for courses", () => {
		render(<CourseList initialCourses={mockCourses} />);
		expect(screen.getByText("~20 min")).toBeInTheDocument();
		expect(screen.getByText("~25 min")).toBeInTheDocument();
	});

	it("renders step counts for courses", () => {
		render(<CourseList initialCourses={mockCourses} />);
		expect(screen.getByText("3 kroków")).toBeInTheDocument();
		expect(screen.getByText("2 kroków")).toBeInTheDocument();
	});

	it("renders links to individual courses", () => {
		render(<CourseList initialCourses={mockCourses} />);
		const links = screen.getAllByRole("link");
		const courseLinks = links.filter(
			(l) =>
				l.getAttribute("href") === "/micro-courses/c1" ||
				l.getAttribute("href") === "/micro-courses/c2",
		);
		expect(courseLinks).toHaveLength(2);
	});
});
