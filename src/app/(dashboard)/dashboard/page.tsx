import { count, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHub } from "@/components/dashboard/dashboard-hub";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { competencies, gaps, passports, projectSubmissions, students } from "@/lib/db/schema";

export default async function DashboardPage() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/login");

	const student = await db.query.students.findFirst({
		where: eq(students.userId, session.user.id),
	});
	if (!student) redirect("/onboarding");

	const [competencyCount, gapCount, courseCount, passport] = await Promise.all([
		db.select({ count: count() }).from(competencies).where(eq(competencies.studentId, student.id)),
		db.select({ count: count() }).from(gaps).where(eq(gaps.studentId, student.id)),
		db
			.select({ count: count() })
			.from(projectSubmissions)
			.where(eq(projectSubmissions.studentId, student.id)),
		db.query.passports.findFirst({
			where: eq(passports.studentId, student.id),
		}),
	]);

	return (
		<DashboardHub
			user={session.user}
			student={student}
			competencyCount={competencyCount[0]?.count ?? 0}
			gapCount={gapCount[0]?.count ?? 0}
			courseCount={courseCount[0]?.count ?? 0}
			marketCoverage={passport?.marketCoveragePercent ?? 0}
		/>
	);
}
