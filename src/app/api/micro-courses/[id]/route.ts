import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { competencies, gaps, microCourses, passports, students } from "@/lib/db/schema";
import { calculateCoverage } from "@/lib/passport-utils";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;

	const student = await db.query.students.findFirst({
		where: eq(students.userId, session.user.id),
	});
	if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

	const course = await db.query.microCourses.findFirst({
		where: eq(microCourses.id, id),
	});
	if (!course || course.studentId !== student.id) {
		return NextResponse.json({ error: "Course not found" }, { status: 404 });
	}

	return NextResponse.json({ course });
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;

	const student = await db.query.students.findFirst({
		where: eq(students.userId, session.user.id),
	});
	if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

	const course = await db.query.microCourses.findFirst({
		where: eq(microCourses.id, id),
	});
	if (!course || course.studentId !== student.id) {
		return NextResponse.json({ error: "Course not found" }, { status: 404 });
	}

	// Mark course as completed
	const [updated] = await db
		.update(microCourses)
		.set({ completed: true, completedAt: new Date() })
		.where(eq(microCourses.id, id))
		.returning();

	// Update related competency status to in_progress (or acquired if was missing)
	const relatedCompetency = await db.query.competencies.findFirst({
		where: and(
			eq(competencies.studentId, student.id),
			eq(competencies.name, course.competencyName),
		),
	});
	if (relatedCompetency && relatedCompetency.status === "missing") {
		await db
			.update(competencies)
			.set({ status: "in_progress" })
			.where(eq(competencies.id, relatedCompetency.id));
	}

	// Recalculate passport coverage
	const [allCompetencies, allGaps] = await Promise.all([
		db.query.competencies.findMany({
			where: eq(competencies.studentId, student.id),
		}),
		db.query.gaps.findMany({
			where: eq(gaps.studentId, student.id),
		}),
	]);
	const coveragePercent = calculateCoverage(allCompetencies, allGaps.length);

	await db
		.update(passports)
		.set({ marketCoveragePercent: coveragePercent, updatedAt: new Date() })
		.where(eq(passports.studentId, student.id));

	return NextResponse.json({ course: updated });
}
