// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StepAccordion } from "../step-accordion";

const mockSteps = [
	{
		title: "Wprowadzenie do SQL",
		content: "SQL to język zapytań do baz danych.",
		exercise: "Otwórz SQLBolt i wykonaj ćwiczenie 1.",
	},
	{
		title: "SELECT i WHERE",
		content: "Klauzula **SELECT** pozwala wybrać kolumny.",
	},
	{
		title: "JOIN — łączenie tabel",
		content: "JOIN pozwala łączyć dane z wielu tabel.",
		exercise: "Napisz zapytanie z INNER JOIN.",
	},
];

describe("StepAccordion", () => {
	it("renders all step titles", () => {
		render(<StepAccordion steps={mockSteps} />);
		expect(screen.getByText("Wprowadzenie do SQL")).toBeInTheDocument();
		expect(screen.getByText("SELECT i WHERE")).toBeInTheDocument();
		expect(screen.getByText("JOIN — łączenie tabel")).toBeInTheDocument();
	});

	it("renders step numbers", () => {
		render(<StepAccordion steps={mockSteps} />);
		expect(screen.getByText("1")).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument();
		expect(screen.getByText("3")).toBeInTheDocument();
	});

	it("has first step open by default", () => {
		render(<StepAccordion steps={mockSteps} />);
		// First step content should be visible
		expect(screen.getByText("SQL to język zapytań do baz danych.")).toBeInTheDocument();
		// First step exercise should be visible
		expect(screen.getByText("Otwórz SQLBolt i wykonaj ćwiczenie 1.")).toBeInTheDocument();
	});

	it("second step content is not visible initially", () => {
		render(<StepAccordion steps={mockSteps} />);
		expect(screen.queryByText(/Klauzula/)).not.toBeInTheDocument();
	});

	it("clicking a closed step opens it and closes the current one", () => {
		render(<StepAccordion steps={mockSteps} />);

		// Click on step 2
		fireEvent.click(screen.getByText("SELECT i WHERE"));

		// Step 2 content should now be visible
		expect(screen.getByText(/Klauzula/)).toBeInTheDocument();
		// Step 1 content should be hidden
		expect(screen.queryByText("SQL to język zapytań do baz danych.")).not.toBeInTheDocument();
	});

	it("clicking an open step closes it", () => {
		render(<StepAccordion steps={mockSteps} />);

		// Click on step 1 (already open) to close it
		fireEvent.click(screen.getByText("Wprowadzenie do SQL"));

		// Step 1 content should be hidden
		expect(screen.queryByText("SQL to język zapytań do baz danych.")).not.toBeInTheDocument();
	});

	it("renders exercise section when exercise exists", () => {
		render(<StepAccordion steps={mockSteps} />);
		expect(screen.getByText("Ćwiczenie")).toBeInTheDocument();
		expect(screen.getByText("Otwórz SQLBolt i wykonaj ćwiczenie 1.")).toBeInTheDocument();
	});

	it("does not render exercise when step has no exercise", () => {
		render(<StepAccordion steps={mockSteps} />);
		// Open step 2 (no exercise)
		fireEvent.click(screen.getByText("SELECT i WHERE"));
		// Should show content but no exercise label for step 2
		expect(screen.getByText(/Klauzula/)).toBeInTheDocument();
		// The "Ćwiczenie" label should not be present now (step 1 closed, step 2 has no exercise)
		expect(screen.queryByText("Ćwiczenie")).not.toBeInTheDocument();
	});
});
