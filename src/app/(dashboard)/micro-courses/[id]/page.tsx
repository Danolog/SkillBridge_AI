import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { CourseView } from "@/components/micro-courses/course-view";
import type { MicroCourseContent } from "@/lib/ai/generate-micro-course";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { microCourses, students } from "@/lib/db/schema";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function MicroCoursePage({ params }: PageProps) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/login");

	const { id } = await params;

	const student = await db.query.students.findFirst({
		where: eq(students.userId, session.user.id),
	});
	if (!student) redirect("/onboarding");

	const course = await db.query.microCourses.findFirst({
		where: eq(microCourses.id, id),
	});
	if (!course || course.studentId !== student.id) notFound();

	return (
		<CourseView
			id={course.id}
			title={course.title}
			competencyName={course.competencyName}
			content={course.content as MicroCourseContent}
			completed={course.completed}
		/>
	);
}
