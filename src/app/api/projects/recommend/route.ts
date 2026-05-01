import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { matchProjects } from "@/lib/ai/match-projects";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const gapId = req.nextUrl.searchParams.get("gapId");
	if (!gapId) return NextResponse.json({ error: "gapId is required" }, { status: 400 });

	const student = await db.query.students.findFirst({
		where: eq(students.userId, session.user.id),
	});
	if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

	const recommendations = await matchProjects(student.id, gapId, 5);
	return NextResponse.json({ recommendations });
}
