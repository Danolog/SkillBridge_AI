import { asc, desc, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { gaps, students } from "@/lib/db/schema";

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const student = await db.query.students.findFirst({
		where: eq(students.userId, session.user.id),
	});
	if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

	const studentGaps = await db
		.select()
		.from(gaps)
		.where(eq(gaps.studentId, student.id))
		.orderBy(
			asc(
				sql`CASE ${gaps.priority}
					WHEN 'critical' THEN 1
					WHEN 'important' THEN 2
					WHEN 'nice_to_have' THEN 3
				END`,
			),
			desc(gaps.marketPercentage),
		);

	return NextResponse.json({ gaps: studentGaps });
}
