import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CourseList } from "@/components/micro-courses/course-list";
import type { MicroCourseContent } from "@/lib/ai/generate-micro-course";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { microCourses, students } from "@/lib/db/schema";

interface PageProps {
	searchParams: Promise<{ generate?: string }>;
}

export default async function MicroCoursesPage({ searchParams }: PageProps) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/login");

	const student = await db.query.students.findFirst({
		where: eq(students.userId, session.user.id),
	});
	if (!student) redirect("/onboarding");

	const courses = await db.query.microCourses.findMany({
		where: eq(microCourses.studentId, student.id),
	});

	const { generate } = await searchParams;

	const serialized = courses.map((c) => ({
		id: c.id,
		competencyName: c.competencyName,
		title: c.title,
		content: c.content as MicroCourseContent,
		completed: c.completed,
	}));

	return (
		<>
			<div className="mc-deprecation-banner">
				<p>
					Ta funkcja została przeniesiona. Sprawdź <Link href="/projects">Projekty</Link> — realne
					projekty dopasowane do Twoich luk kompetencyjnych.
				</p>
			</div>
			<div className="mc-page-header">
				<h1 className="mc-page-title">Mikro-kursy</h1>
				<p className="mc-page-desc">
					Spersonalizowane kursy AI dopasowane do Twoich luk kompetencyjnych
				</p>
			</div>
			<CourseList initialCourses={serialized} generateGapId={generate} />
		</>
	);
}
