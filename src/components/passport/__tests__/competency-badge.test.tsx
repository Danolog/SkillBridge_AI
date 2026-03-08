// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CompetencyCard } from "../competency-badge";

const defaultProps = {
	name: "JavaScript",
	status: "acquired" as const,
	marketPercentage: 85,
};

describe("CompetencyCard", () => {
	it("renders competency name", () => {
		render(<CompetencyCard {...defaultProps} />);
		expect(screen.getByText("JavaScript")).toBeInTheDocument();
	});

	it("renders acquired status with card class", () => {
		const { container } = render(<CompetencyCard {...defaultProps} />);
		const card = container.querySelector(".pp-comp-card.acquired");
		expect(card).toBeInTheDocument();
	});

	it("renders in_progress status with card class", () => {
		const { container } = render(
			<CompetencyCard name="React" status="in_progress" marketPercentage={60} />,
		);
		const card = container.querySelector(".pp-comp-card.in-progress");
		expect(card).toBeInTheDocument();
	});

	it("renders missing status with card class", () => {
		const { container } = render(
			<CompetencyCard name="Python" status="missing" marketPercentage={40} />,
		);
		const card = container.querySelector(".pp-comp-card.missing");
		expect(card).toBeInTheDocument();
	});

	it("renders 'Zaawansowany' level for marketPercentage >= 80", () => {
		render(<CompetencyCard {...defaultProps} marketPercentage={85} />);
		expect(screen.getByText("Zaawansowany")).toBeInTheDocument();
	});

	it("renders 'Sredni' level for marketPercentage >= 50 and < 80", () => {
		render(<CompetencyCard {...defaultProps} marketPercentage={60} />);
		expect(screen.getByText("Sredni")).toBeInTheDocument();
	});

	it("renders 'Podstawowy' level for marketPercentage < 50", () => {
		render(<CompetencyCard {...defaultProps} marketPercentage={30} />);
		expect(screen.getByText("Podstawowy")).toBeInTheDocument();
	});

	it("renders 'Podstawowy' level when marketPercentage is null", () => {
		render(<CompetencyCard name="Git" status="acquired" marketPercentage={null} />);
		expect(screen.getByText("Podstawowy")).toBeInTheDocument();
	});

	it("renders 'Podstawowy' level when marketPercentage is undefined", () => {
		render(<CompetencyCard name="Git" status="acquired" />);
		expect(screen.getByText("Podstawowy")).toBeInTheDocument();
	});

	it("renders demand bar when marketPercentage is provided", () => {
		const { container } = render(<CompetencyCard {...defaultProps} marketPercentage={85} />);
		const demandFill = container.querySelector(".pp-demand-fill");
		expect(demandFill).toBeInTheDocument();
		expect(demandFill).toHaveStyle({ width: "85%" });
	});

	it("renders demand percentage label", () => {
		render(<CompetencyCard {...defaultProps} marketPercentage={85} />);
		expect(screen.getByText("85%")).toBeInTheDocument();
		expect(screen.getByText("popyt")).toBeInTheDocument();
	});

	it("does not render demand bar when marketPercentage is null", () => {
		const { container } = render(
			<CompetencyCard name="Git" status="acquired" marketPercentage={null} />,
		);
		const demandBar = container.querySelector(".pp-demand-bar");
		expect(demandBar).not.toBeInTheDocument();
	});

	it("renders status icon container", () => {
		const { container } = render(<CompetencyCard {...defaultProps} />);
		const iconContainer = container.querySelector(".pp-comp-status-icon.acquired");
		expect(iconContainer).toBeInTheDocument();
	});

	it("renders level badge with correct class for advanced", () => {
		const { container } = render(<CompetencyCard {...defaultProps} marketPercentage={90} />);
		const badge = container.querySelector(".pp-level-badge.advanced");
		expect(badge).toBeInTheDocument();
	});

	it("renders level badge with correct class for intermediate", () => {
		const { container } = render(<CompetencyCard {...defaultProps} marketPercentage={55} />);
		const badge = container.querySelector(".pp-level-badge.intermediate");
		expect(badge).toBeInTheDocument();
	});

	it("renders level badge with correct class for basic", () => {
		const { container } = render(<CompetencyCard {...defaultProps} marketPercentage={20} />);
		const badge = container.querySelector(".pp-level-badge.basic");
		expect(badge).toBeInTheDocument();
	});
});
