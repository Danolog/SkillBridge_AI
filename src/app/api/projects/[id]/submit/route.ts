import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { reviewSubmission } from "@/lib/ai/review-submission";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { projectSubmissions, projects, students } from "@/lib/db/schema";

export const maxDuration = 60;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id: projectId } = await params;
	const body = (await req.json()) as {
		repoUrl?: string;
		notebookUrl?: string;
		additionalUrls?: string[];
	};
	const { repoUrl, notebookUrl, additionalUrls } = body;

	if (!repoUrl && !notebookUrl) {
		return NextResponse.json({ error: "repoUrl or notebookUrl required" }, { status: 400 });
	}

	const student = await db.query.students.findFirst({
		where: eq(students.userId, session.user.id),
	});
	if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

	const project = await db.query.projects.findFirst({
		where: eq(projects.id, projectId),
	});
	if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

	const review = await reviewSubmission(
		repoUrl ?? null,
		notebookUrl ?? null,
		project.rubricJson,
		project.title,
		project.description,
	);

	let status: "verified" | "submitted" | "rejected" = "submitted";
	if (review.score >= 70 && review.cheatRiskScore < 0.5) {
		status = "verified";
	} else if (review.score < 30) {
		status = "rejected";
	}

	const existing = await db.query.projectSubmissions.findFirst({
		where: and(
			eq(projectSubmissions.studentId, student.id),
			eq(projectSubmissions.projectId, projectId),
		),
	});

	const submissionData = {
		repoUrl: repoUrl ?? null,
		notebookUrl: notebookUrl ?? null,
		additionalUrls: additionalUrls ?? [],
		submittedAt: new Date(),
		score: review.score,
		status,
	};

	let submission: typeof projectSubmissions.$inferSelect;
	if (existing) {
		[submission] = await db
			.update(projectSubmissions)
			.set({
				...submissionData,
				aiReviewJson: { ...((existing.aiReviewJson as object) ?? {}), review },
				updatedAt: new Date(),
			})
			.where(eq(projectSubmissions.id, existing.id))
			.returning();
	} else {
		[submission] = await db
			.insert(projectSubmissions)
			.values({
				studentId: student.id,
				projectId,
				...submissionData,
				aiReviewJson: { review },
			})
			.returning();
	}

	return NextResponse.json({ submission, review });
}
