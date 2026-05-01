import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProjectCatalog } from "@/components/projects/project-catalog";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { projects, students } from "@/lib/db/schema";

interface PageProps {
	searchParams: Promise<{ gapId?: string; level?: string; sourceType?: string }>;
}

export default async function ProjectsPage({ searchParams }: PageProps) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/login");

	const student = await db.query.students.findFirst({
		where: eq(students.userId, session.user.id),
	});
	if (!student) redirect("/onboarding");

	const allProjects = await db.query.projects.findMany({
		where: eq(projects.status, "active"),
		with: { competencies: true },
	});

	const { gapId, level, sourceType } = await searchParams;

	return (
		<div className="proj-page">
			<div className="proj-page-header">
				<h1 className="proj-page-title">Projekty</h1>
				<p className="proj-page-desc">Realne projekty dopasowane do Twoich luk kompetencyjnych</p>
			</div>
			<ProjectCatalog
				projects={allProjects}
				gapId={gapId}
				initialLevel={level}
				initialSourceType={sourceType}
			/>
		</div>
	);
}
