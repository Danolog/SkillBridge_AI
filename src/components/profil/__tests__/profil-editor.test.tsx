// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProfilEditor, type ProfilEditorInitial } from "../profil-editor";

const pushMock = vi.fn();
const refreshMock = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

vi.mock("sonner", () => ({
	toast: {
		success: (...args: unknown[]) => toastSuccess(...args),
		error: (...args: unknown[]) => toastError(...args),
	},
}));

const baseInitial: ProfilEditorInitial = {
	university: "WSB Merito Gdańsk",
	fieldOfStudy: "Informatyka",
	semester: 4,
	careerGoal: "Frontend Developer",
	syllabusText: "x".repeat(200),
	competencies: ["React", "TypeScript", "HTML", "CSS", "Git"],
};

beforeEach(() => {
	pushMock.mockReset();
	refreshMock.mockReset();
	toastSuccess.mockReset();
	toastError.mockReset();
	global.fetch = vi.fn();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("ProfilEditor — prefill", () => {
	it("prefills form fields with student data", () => {
		render(<ProfilEditor initial={baseInitial} />);
		expect(screen.getByDisplayValue("Informatyka")).toBeInTheDocument();
		expect(screen.getByDisplayValue("React")).toBeInTheDocument();
		expect(screen.getByDisplayValue("TypeScript")).toBeInTheDocument();
		expect(screen.getByDisplayValue("Git")).toBeInTheDocument();
	});

	it("shows the syllabus text in the textarea", () => {
		render(<ProfilEditor initial={baseInitial} />);
		const textarea = screen.getByPlaceholderText(
			/Wklej tutaj treść sylabusa/i,
		) as HTMLTextAreaElement;
		expect(textarea.value).toBe(baseInitial.syllabusText);
	});

	it("treats predefined career goal as standard (no custom input visible)", () => {
		render(<ProfilEditor initial={baseInitial} />);
		expect(screen.queryByPlaceholderText("Wpisz swój cel kariery...")).not.toBeInTheDocument();
	});

	it("treats unknown career goal as custom and prefills the custom input", () => {
		render(
			<ProfilEditor initial={{ ...baseInitial, careerGoal: "AI Researcher (niestandardowy)" }} />,
		);
		const customInput = screen.getByPlaceholderText(
			"Wpisz swój cel kariery...",
		) as HTMLInputElement;
		expect(customInput.value).toBe("AI Researcher (niestandardowy)");
	});
});

describe("ProfilEditor — save flow", () => {
	it("save button is enabled when prefilled data is valid", () => {
		render(<ProfilEditor initial={baseInitial} />);
		const save = screen.getByRole("button", { name: /Zapisz zmiany/i });
		expect(save).not.toBeDisabled();
	});

	it("disables save when fewer than 5 competencies remain", () => {
		render(<ProfilEditor initial={{ ...baseInitial, competencies: ["React", "Git"] }} />);
		const save = screen.getByRole("button", { name: /Zapisz zmiany/i });
		expect(save).toBeDisabled();
	});

	it("posts updated payload to /api/onboarding and redirects on success", async () => {
		(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ success: true, studentId: "stu-1" }),
		});

		render(<ProfilEditor initial={baseInitial} />);
		fireEvent.click(screen.getByRole("button", { name: /Zapisz zmiany/i }));

		await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

		const [url, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(url).toBe("/api/onboarding");
		expect((init as RequestInit).method).toBe("POST");
		const body = JSON.parse((init as RequestInit).body as string);
		expect(body).toEqual({
			university: "WSB Merito Gdańsk",
			fieldOfStudy: "Informatyka",
			semester: 4,
			careerGoal: "Frontend Developer",
			syllabusText: baseInitial.syllabusText,
			competencies: ["React", "TypeScript", "HTML", "CSS", "Git"],
		});

		await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
		expect(toastSuccess).toHaveBeenCalled();
	});

	it("shows error toast and does not navigate when API returns failure", async () => {
		(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
			ok: false,
			json: async () => ({ error: "Coś poszło nie tak" }),
		});

		render(<ProfilEditor initial={baseInitial} />);
		fireEvent.click(screen.getByRole("button", { name: /Zapisz zmiany/i }));

		await waitFor(() => expect(toastError).toHaveBeenCalledWith("Coś poszło nie tak"));
		expect(pushMock).not.toHaveBeenCalled();
	});

	it("uses customCareerGoal when career goal is set to custom", async () => {
		(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ success: true }),
		});

		render(
			<ProfilEditor initial={{ ...baseInitial, careerGoal: "AI Researcher (niestandardowy)" }} />,
		);
		fireEvent.click(screen.getByRole("button", { name: /Zapisz zmiany/i }));

		await waitFor(() => expect(global.fetch).toHaveBeenCalled());
		const body = JSON.parse(
			(global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body as string,
		);
		expect(body.careerGoal).toBe("AI Researcher (niestandardowy)");
	});

	it("cancel button navigates back to /dashboard", () => {
		render(<ProfilEditor initial={baseInitial} />);
		fireEvent.click(screen.getByRole("button", { name: /Anuluj/i }));
		expect(pushMock).toHaveBeenCalledWith("/dashboard");
	});
});

describe("ProfilEditor — re-analyze syllabus", () => {
	it("calls /api/syllabus/parse and overwrites competency list", async () => {
		(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ competencies: ["Python", "Pandas", "NumPy"] }),
		});

		render(<ProfilEditor initial={baseInitial} />);
		fireEvent.click(screen.getByRole("button", { name: /Analizuj sylabus/i }));

		await waitFor(() =>
			expect(global.fetch).toHaveBeenCalledWith(
				"/api/syllabus/parse",
				expect.objectContaining({ method: "POST" }),
			),
		);

		await waitFor(() => expect(screen.getByDisplayValue("Python")).toBeInTheDocument());
		expect(screen.getByDisplayValue("Pandas")).toBeInTheDocument();
		expect(screen.getByDisplayValue("NumPy")).toBeInTheDocument();
		expect(screen.queryByDisplayValue("React")).not.toBeInTheDocument();
		expect(toastSuccess).toHaveBeenCalled();
	});

	it("disables analyze button when syllabus is too short", () => {
		render(<ProfilEditor initial={{ ...baseInitial, syllabusText: "krótki" }} />);
		const analyze = screen.getByRole("button", { name: /Analizuj sylabus/i });
		expect(analyze).toBeDisabled();
		fireEvent.click(analyze);
		expect(global.fetch).not.toHaveBeenCalled();
	});

	it("propagates server error to toast", async () => {
		(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
			ok: false,
			json: async () => ({ error: "AI niedostępne" }),
		});

		render(<ProfilEditor initial={baseInitial} />);
		fireEvent.click(screen.getByRole("button", { name: /Analizuj sylabus/i }));

		await waitFor(() => expect(toastError).toHaveBeenCalledWith("AI niedostępne"));
	});
});
