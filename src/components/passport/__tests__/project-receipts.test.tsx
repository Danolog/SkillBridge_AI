// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectReceipts } from "../project-receipts";

const mockReceipts = [
	{
		projectTitle: "Analiza GUS",
		projectLevel: "L1",
		score: 85,
		verifiedAt: "2026-05-01T10:00:00Z",
		repoUrl: "https://github.com/user/repo",
		notebookUrl: null,
		feedback: "Dobra praca!",
	},
	{
		projectTitle: "Dashboard React",
		projectLevel: "L2",
		score: 92,
		verifiedAt: "2026-04-15T10:00:00Z",
		repoUrl: null,
		notebookUrl: "https://colab.google.com/notebook",
		feedback: null,
	},
];

describe("ProjectReceipts", () => {
	it("renders nothing when receipts is empty", () => {
		const { container } = render(<ProjectReceipts receipts={[]} />);
		expect(container.firstChild).toBeNull();
	});

	it("renders receipt cards with project titles", () => {
		render(<ProjectReceipts receipts={mockReceipts} />);
		expect(screen.getByText("Analiza GUS")).toBeInTheDocument();
		expect(screen.getByText("Dashboard React")).toBeInTheDocument();
	});

	it("renders scores", () => {
		render(<ProjectReceipts receipts={mockReceipts} />);
		expect(screen.getByText("85/100")).toBeInTheDocument();
		expect(screen.getByText("92/100")).toBeInTheDocument();
	});

	it("renders level badges", () => {
		render(<ProjectReceipts receipts={mockReceipts} />);
		expect(screen.getByText("L1")).toBeInTheDocument();
		expect(screen.getByText("L2")).toBeInTheDocument();
	});

	it("renders section title", () => {
		render(<ProjectReceipts receipts={mockReceipts} />);
		expect(screen.getByText("Zweryfikowane projekty")).toBeInTheDocument();
	});

	it("renders count badge", () => {
		render(<ProjectReceipts receipts={mockReceipts} />);
		expect(screen.getByText("2 projektów")).toBeInTheDocument();
	});

	it("renders repo link as github.com/user/repo with the GitHub URL", () => {
		render(<ProjectReceipts receipts={mockReceipts} />);
		const link = screen.getByText(/github\.com\/user\/repo/).closest("a");
		expect(link).toHaveAttribute("href", "https://github.com/user/repo");
	});

	it("renders notebook link when available", () => {
		render(<ProjectReceipts receipts={mockReceipts} />);
		expect(screen.getByText("Notebook")).toBeInTheDocument();
	});
});
