import { getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import {
	account,
	competencies,
	competenciesRelations,
	competencyStatusEnum,
	gapPriorityEnum,
	gaps,
	gapsRelations,
	jobMarketData,
	microCourses,
	microCoursesRelations,
	passports,
	session,
	skillMaps,
	students,
	studentsRelations,
	user,
	verification,
} from "../schema";

describe("DB Schema — Better Auth tables", () => {
	it("exports user table", () => {
		expect(user).toBeDefined();
		expect(getTableName(user)).toBe("user");
	});

	it("exports session table", () => {
		expect(session).toBeDefined();
		expect(getTableName(session)).toBe("session");
	});

	it("exports account table", () => {
		expect(account).toBeDefined();
		expect(getTableName(account)).toBe("account");
	});

	it("exports verification table", () => {
		expect(verification).toBeDefined();
		expect(getTableName(verification)).toBe("verification");
	});
});

describe("DB Schema — Enums", () => {
	it("competencyStatusEnum has correct values", () => {
		const values = competencyStatusEnum.enumValues;
		expect(values).toContain("acquired");
		expect(values).toContain("in_progress");
		expect(values).toContain("missing");
		expect(values).toHaveLength(3);
	});

	it("gapPriorityEnum has correct values", () => {
		const values = gapPriorityEnum.enumValues;
		expect(values).toContain("critical");
		expect(values).toContain("important");
		expect(values).toContain("nice_to_have");
		expect(values).toHaveLength(3);
	});
});

describe("DB Schema — Domain tables", () => {
	it("students table exists with correct SQL name", () => {
		expect(students).toBeDefined();
		expect(getTableName(students)).toBe("students");
	});

	it("competencies table exists with correct SQL name", () => {
		expect(competencies).toBeDefined();
		expect(getTableName(competencies)).toBe("competencies");
	});

	it("gaps table exists with correct SQL name", () => {
		expect(gaps).toBeDefined();
		expect(getTableName(gaps)).toBe("gaps");
	});

	it("skillMaps table exists with correct SQL name", () => {
		expect(skillMaps).toBeDefined();
		expect(getTableName(skillMaps)).toBe("skill_maps");
	});

	it("microCourses table exists with correct SQL name", () => {
		expect(microCourses).toBeDefined();
		expect(getTableName(microCourses)).toBe("micro_courses");
	});

	it("passports table exists with correct SQL name", () => {
		expect(passports).toBeDefined();
		expect(getTableName(passports)).toBe("passports");
	});

	it("jobMarketData table exists with correct SQL name", () => {
		expect(jobMarketData).toBeDefined();
		expect(getTableName(jobMarketData)).toBe("job_market_data");
	});
});

describe("DB Schema — Column presence", () => {
	it("students has required columns", () => {
		const colNames = Object.keys(students);
		expect(colNames).toContain("id");
		expect(colNames).toContain("userId");
		expect(colNames).toContain("university");
		expect(colNames).toContain("fieldOfStudy");
		expect(colNames).toContain("semester");
		expect(colNames).toContain("careerGoal");
		expect(colNames).toContain("onboardingCompleted");
	});

	it("gaps has required columns", () => {
		const colNames = Object.keys(gaps);
		expect(colNames).toContain("id");
		expect(colNames).toContain("studentId");
		expect(colNames).toContain("competencyName");
		expect(colNames).toContain("priority");
		expect(colNames).toContain("marketPercentage");
		expect(colNames).toContain("estimatedHours");
		expect(colNames).toContain("whyImportant");
	});

	it("jobMarketData has required columns", () => {
		const colNames = Object.keys(jobMarketData);
		expect(colNames).toContain("id");
		expect(colNames).toContain("careerGoal");
		expect(colNames).toContain("competencyName");
		expect(colNames).toContain("demandPercentage");
		expect(colNames).toContain("category");
		expect(colNames).toContain("salaryRange");
	});

	it("skillMaps has nodes and edges JSON columns", () => {
		const colNames = Object.keys(skillMaps);
		expect(colNames).toContain("nodes");
		expect(colNames).toContain("edges");
	});

	it("microCourses has content JSON column", () => {
		const colNames = Object.keys(microCourses);
		expect(colNames).toContain("content");
		expect(colNames).toContain("completed");
		expect(colNames).toContain("gapId");
	});
});

describe("DB Schema — Relations", () => {
	it("exports studentsRelations", () => {
		expect(studentsRelations).toBeDefined();
	});

	it("exports competenciesRelations", () => {
		expect(competenciesRelations).toBeDefined();
	});

	it("exports gapsRelations", () => {
		expect(gapsRelations).toBeDefined();
	});

	it("exports microCoursesRelations", () => {
		expect(microCoursesRelations).toBeDefined();
	});
});
