import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { generateMicroCourse } from "@/lib/ai/generate-micro-course";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { competencies, gaps, microCourses, students } from "@/lib/db/schema";

export const maxDuration = 60;

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const student = await db.query.students.findFirst({
		where: eq(students.userId, session.user.id),
	});
	if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

	const courses = await db.query.microCourses.findMany({
		where: eq(microCourses.studentId, student.id),
	});

	return NextResponse.json({ courses });
}

export async function POST(req: Request) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { gapId } = (await req.json()) as { gapId: string };
	if (!gapId) return NextResponse.json({ error: "gapId is required" }, { status: 400 });

	const student = await db.query.students.findFirst({
		where: eq(students.userId, session.user.id),
	});
	if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

	const gap = await db.query.gaps.findFirst({
		where: eq(gaps.id, gapId),
	});
	if (!gap || gap.studentId !== student.id) {
		return NextResponse.json({ error: "Gap not found" }, { status: 404 });
	}

	// Check if course already exists for this gap (idempotent)
	const existing = await db.query.microCourses.findFirst({
		where: eq(microCourses.gapId, gapId),
	});
	if (existing) {
		return NextResponse.json({ course: existing });
	}

	// Get student's existing competencies for context
	const studentCompetencies = await db.query.competencies.findMany({
		where: eq(competencies.studentId, student.id),
	});
	const relatedNames = studentCompetencies.map((c) => c.name);

	// Generate course via AI
	let title: string;
	let content: Awaited<ReturnType<typeof generateMicroCourse>>["content"];
	try {
		const result = await generateMicroCourse(
			gap.competencyName,
			student.careerGoal,
			student.semester,
			relatedNames,
		);
		title = result.title;
		content = result.content;
	} catch (err) {
		console.error("[micro-courses] AI generation failed:", err);
		return NextResponse.json(
			{ error: "Nie udało się wygenerować kursu. Spróbuj ponownie." },
			{ status: 500 },
		);
	}

	// Save to DB
	const [course] = await db
		.insert(microCourses)
		.values({
			studentId: student.id,
			gapId: gap.id,
			competencyName: gap.competencyName,
			title,
			content,
		})
		.returning();

	return NextResponse.json({ course });
}
