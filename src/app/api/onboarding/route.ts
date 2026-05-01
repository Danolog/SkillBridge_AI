import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { generateGaps } from "@/lib/ai/generate-gaps";
import { generateSkillMap } from "@/lib/ai/generate-skill-map";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { competencies, passports, students } from "@/lib/db/schema";

export const maxDuration = 60;

interface OnboardingBody {
	university: string;
	fieldOfStudy: string;
	semester: number;
	careerGoal: string;
	syllabusText: string;
	competencies: string[];
}

export async function POST(req: Request) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = (await req.json()) as OnboardingBody;
	const { university, fieldOfStudy, semester, careerGoal, syllabusText } = body;
	const competencyNames = body.competencies;

	if (!university || !fieldOfStudy || !semester || !careerGoal || !competencyNames?.length) {
		return NextResponse.json({ error: "Wszystkie pola są wymagane." }, { status: 400 });
	}

	const userId = session.user.id;

	// Upsert student record
	const existing = await db.query.students.findFirst({
		where: eq(students.userId, userId),
	});

	let studentId: string;

	if (existing) {
		await db
			.update(students)
			.set({
				university,
				fieldOfStudy,
				semester,
				careerGoal,
				syllabusText,
				onboardingCompleted: true,
				updatedAt: new Date(),
			})
			.where(eq(students.userId, userId));
		studentId = existing.id;

		// Delete old competencies for idempotency
		await db.delete(competencies).where(eq(competencies.studentId, studentId));
	} else {
		const [newStudent] = await db
			.insert(students)
			.values({
				userId,
				university,
				fieldOfStudy,
				semester,
				careerGoal,
				syllabusText,
				onboardingCompleted: true,
			})
			.returning({ id: students.id });
		studentId = newStudent.id;
	}

	// Insert competencies
	await db.insert(competencies).values(
		competencyNames.map((name) => ({
			studentId,
			name,
			status: "acquired" as const,
		})),
	);

	// Create passport if not exists
	const existingPassport = await db.query.passports.findFirst({
		where: eq(passports.studentId, studentId),
	});
	if (!existingPassport) {
		await db.insert(passports).values({ studentId });
	}

	// Synchronous AI generation — Vercel serverless terminates the function after the response,
	// so fire-and-forget would lose the work. Awaiting also lets us tell the client whether the
	// skill map is ready or whether they need to retry from /skill-map.
	try {
		await Promise.all([
			generateGaps(studentId, competencyNames, careerGoal),
			generateSkillMap(studentId, competencyNames, careerGoal),
		]);
	} catch (err) {
		console.error("[onboarding] AI generation failed:", { studentId, err });
		return NextResponse.json({ success: true, studentId, aiGenerationFailed: true });
	}

	return NextResponse.json({ success: true, studentId });
}
