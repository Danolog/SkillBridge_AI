// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CourseView } from "../course-view";

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

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

const mockContent = {
	estimatedMinutes: 20,
	steps: [
		{ title: "Krok 1", content: "Treść kroku 1", exercise: "Ćwiczenie 1" },
		{ title: "Krok 2", content: "Treść kroku 2" },
	],
	resources: [
		{ title: "Tutorial SQL", url: "https://example.com/sql", type: "docs" as const },
		{ title: "Video kurs", url: "https://youtube.com/watch?v=123", type: "video" as const },
	],
	project: {
		title: "Mini-projekt SQL",
		description: "Stwórz bazę danych z zapytaniami.",
		tools: ["Google Colab", "SQLite"],
	},
};

describe("CourseView", () => {
	it("renders course title", () => {
		render(
			<CourseView
				id="c1"
				title="Podstawy SQL"
				competencyName="SQL"
				content={mockContent}
				completed={false}
			/>,
		);
		expect(screen.getByText("Podstawy SQL")).toBeInTheDocument();
	});

	it("renders competency badge", () => {
		render(
			<CourseView
				id="c1"
				title="Podstawy SQL"
				competencyName="SQL"
				content={mockContent}
				completed={false}
			/>,
		);
		expect(screen.getByText("SQL")).toBeInTheDocument();
	});

	it("renders estimated time", () => {
		render(
			<CourseView
				id="c1"
				title="Podstawy SQL"
				competencyName="SQL"
				content={mockContent}
				completed={false}
			/>,
		);
		expect(screen.getByText(/20 minut/)).toBeInTheDocument();
	});

	it("renders back link to courses list", () => {
		render(
			<CourseView
				id="c1"
				title="Podstawy SQL"
				competencyName="SQL"
				content={mockContent}
				completed={false}
			/>,
		);
		const backLink = screen.getByRole("link", { name: /Powrót do kursów/ });
		expect(backLink).toHaveAttribute("href", "/micro-courses");
	});

	it("renders resources section", () => {
		render(
			<CourseView
				id="c1"
				title="Podstawy SQL"
				competencyName="SQL"
				content={mockContent}
				completed={false}
			/>,
		);
		expect(screen.getByText("Zasoby")).toBeInTheDocument();
		expect(screen.getByText("Tutorial SQL")).toBeInTheDocument();
		expect(screen.getByText("Video kurs")).toBeInTheDocument();
	});

	it("renders resource type labels", () => {
		render(
			<CourseView
				id="c1"
				title="Podstawy SQL"
				competencyName="SQL"
				content={mockContent}
				completed={false}
			/>,
		);
		expect(screen.getByText("docs")).toBeInTheDocument();
		expect(screen.getByText("video")).toBeInTheDocument();
	});

	it("renders mini-project section", () => {
		render(
			<CourseView
				id="c1"
				title="Podstawy SQL"
				competencyName="SQL"
				content={mockContent}
				completed={false}
			/>,
		);
		expect(screen.getByText("Mini-projekt")).toBeInTheDocument();
		expect(screen.getByText("Mini-projekt SQL")).toBeInTheDocument();
		expect(screen.getByText("Stwórz bazę danych z zapytaniami.")).toBeInTheDocument();
	});

	it("renders project tools", () => {
		render(
			<CourseView
				id="c1"
				title="Podstawy SQL"
				competencyName="SQL"
				content={mockContent}
				completed={false}
			/>,
		);
		expect(screen.getByText("Google Colab")).toBeInTheDocument();
		expect(screen.getByText("SQLite")).toBeInTheDocument();
	});

	it("renders 'Ukończ kurs' button when not completed", () => {
		render(
			<CourseView
				id="c1"
				title="Podstawy SQL"
				competencyName="SQL"
				content={mockContent}
				completed={false}
			/>,
		);
		expect(screen.getByText("Ukończ kurs")).toBeInTheDocument();
	});

	it("renders 'Ukończone!' when already completed", () => {
		render(
			<CourseView
				id="c1"
				title="Podstawy SQL"
				competencyName="SQL"
				content={mockContent}
				completed={true}
			/>,
		);
		expect(screen.getByText("Ukończone!")).toBeInTheDocument();
	});

	it("calls API and shows success on complete", async () => {
		const { toast } = await import("sonner");
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ course: { id: "c1", completed: true } }),
		});

		render(
			<CourseView
				id="c1"
				title="Podstawy SQL"
				competencyName="SQL"
				content={mockContent}
				completed={false}
			/>,
		);

		fireEvent.click(screen.getByText("Ukończ kurs"));

		await waitFor(() => {
			expect(toast.success).toHaveBeenCalledWith(
				"Gratulacje! Kompetencja zaktualizowana w Paszporcie.",
			);
		});

		expect(global.fetch).toHaveBeenCalledWith("/api/micro-courses/c1", { method: "PATCH" });
	});

	it("shows error toast when API fails on complete", async () => {
		const { toast } = await import("sonner");
		global.fetch = vi.fn().mockResolvedValue({ ok: false });

		render(
			<CourseView
				id="c1"
				title="Podstawy SQL"
				competencyName="SQL"
				content={mockContent}
				completed={false}
			/>,
		);

		fireEvent.click(screen.getByText("Ukończ kurs"));

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith("Nie udało się oznaczyć kursu jako ukończony");
		});
	});

	it("renders resource links with target=_blank", () => {
		render(
			<CourseView
				id="c1"
				title="Podstawy SQL"
				competencyName="SQL"
				content={mockContent}
				completed={false}
			/>,
		);
		const resourceLinks = screen
			.getAllByRole("link")
			.filter((l) => l.getAttribute("target") === "_blank");
		expect(resourceLinks).toHaveLength(2);
		for (const link of resourceLinks) {
			expect(link).toHaveAttribute("rel", "noopener noreferrer");
		}
	});

	it("renders step count and resource count in meta", () => {
		render(
			<CourseView
				id="c1"
				title="Podstawy SQL"
				competencyName="SQL"
				content={mockContent}
				completed={false}
			/>,
		);
		expect(screen.getByText("2 kroków")).toBeInTheDocument();
		expect(screen.getByText("2 zasobów")).toBeInTheDocument();
	});
});
