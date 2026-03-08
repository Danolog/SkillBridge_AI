import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { skillMaps, students } from "@/lib/db/schema";

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const student = await db.query.students.findFirst({
		where: eq(students.userId, session.user.id),
	});
	if (!student) {
		return NextResponse.json({ error: "Student not found" }, { status: 404 });
	}

	const skillMap = await db.query.skillMaps.findFirst({
		where: eq(skillMaps.studentId, student.id),
	});

	if (!skillMap) {
		return NextResponse.json({ generating: true }, { status: 202 });
	}

	return NextResponse.json({
		nodes: skillMap.nodes,
		edges: skillMap.edges,
	});
}
