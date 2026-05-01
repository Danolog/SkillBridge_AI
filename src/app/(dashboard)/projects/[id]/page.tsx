import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ProjectDetail } from "@/components/projects/project-detail";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { projectSubmissions, projects, students } from "@/lib/db/schema";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/login");

	const student = await db.query.students.findFirst({
		where: eq(students.userId, session.user.id),
	});
	if (!student) redirect("/onboarding");

	const { id } = await params;
	const project = await db.query.projects.findFirst({
		where: eq(projects.id, id),
		with: { competencies: true },
	});
	if (!project) notFound();

	const submission = await db.query.projectSubmissions.findFirst({
		where: and(eq(projectSubmissions.studentId, student.id), eq(projectSubmissions.projectId, id)),
	});

	return (
		<div className="proj-page">
			<ProjectDetail project={project} submission={submission ?? null} />
		</div>
	);
}
