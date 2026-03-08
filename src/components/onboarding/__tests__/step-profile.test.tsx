// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { type ProfileData, StepProfile } from "../step-profile";

const emptyProfile: ProfileData = {
	university: "",
	fieldOfStudy: "",
	semester: "",
	careerGoal: "",
	customCareerGoal: "",
};

describe("StepProfile", () => {
	it("renders all form fields", () => {
		render(<StepProfile data={emptyProfile} onChange={vi.fn()} />);

		expect(screen.getByText("Uczelnia")).toBeInTheDocument();
		expect(screen.getByText("Kierunek studiów")).toBeInTheDocument();
		expect(screen.getByText("Semestr")).toBeInTheDocument();
		expect(screen.getByText("Cel kariery")).toBeInTheDocument();
	});

	it("renders field of study input with placeholder", () => {
		render(<StepProfile data={emptyProfile} onChange={vi.fn()} />);

		const input = screen.getByPlaceholderText("np. Informatyka, Zarządzanie, Finanse...");
		expect(input).toBeInTheDocument();
	});

	it("shows custom goal input when careerGoal is 'custom'", () => {
		const profile: ProfileData = {
			...emptyProfile,
			careerGoal: "custom",
		};
		render(<StepProfile data={profile} onChange={vi.fn()} />);

		expect(screen.getByText("Twój cel kariery")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Wpisz swój cel kariery...")).toBeInTheDocument();
	});

	it("does not show custom goal input for standard career goals", () => {
		const profile: ProfileData = {
			...emptyProfile,
			careerGoal: "Data Analyst",
		};
		render(<StepProfile data={profile} onChange={vi.fn()} />);

		expect(screen.queryByText("Twój cel kariery")).not.toBeInTheDocument();
	});

	it("renders required asterisks on all fields", () => {
		render(<StepProfile data={emptyProfile} onChange={vi.fn()} />);

		const asterisks = screen.getAllByText("*");
		expect(asterisks.length).toBeGreaterThanOrEqual(4);
	});
});
