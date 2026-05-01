// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectCard } from "../project-card";

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		className,
	}: {
		children: React.ReactNode;
		href: string;
		className?: string;
	}) => (
		<a href={href} className={className}>
			{children}
		</a>
	),
}));

const defaultProps = {
	id: "proj-1",
	title: "Analiza wynagrodzeń GUS",
	description: "Pobierz dane i przeanalizuj trendy",
	level: "L1",
	estimatedHours: 3,
	sourceType: "open_data",
	competencyCount: 3,
};

describe("ProjectCard", () => {
	it("renders project title", () => {
		render(<ProjectCard {...defaultProps} />);
		expect(screen.getByText("Analiza wynagrodzeń GUS")).toBeInTheDocument();
	});

	it("renders level badge", () => {
		render(<ProjectCard {...defaultProps} />);
		expect(screen.getByText("L1")).toBeInTheDocument();
	});

	it("renders estimated hours", () => {
		render(<ProjectCard {...defaultProps} />);
		expect(screen.getByText("3h")).toBeInTheDocument();
	});

	it("renders competency count", () => {
		render(<ProjectCard {...defaultProps} />);
		expect(screen.getByText("3 kompetencji")).toBeInTheDocument();
	});

	it("links to project detail page", () => {
		render(<ProjectCard {...defaultProps} />);
		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("href", "/projects/proj-1");
	});

	it("shows Open Data label for open_data source", () => {
		render(<ProjectCard {...defaultProps} />);
		expect(screen.getByText("Open Data")).toBeInTheDocument();
	});

	it("shows OSS label for oss source", () => {
		render(<ProjectCard {...defaultProps} sourceType="oss" />);
		expect(screen.getByText("OSS")).toBeInTheDocument();
	});
});
