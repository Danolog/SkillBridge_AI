import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { facultySessions } from "@/lib/db/schema";
import { FACULTY_COOKIE_NAME, hashToken } from "@/lib/faculty-auth";

export async function POST() {
	const cookieStore = await cookies();
	const token = cookieStore.get(FACULTY_COOKIE_NAME)?.value;
	if (token) {
		await db.delete(facultySessions).where(eq(facultySessions.tokenHash, hashToken(token)));
	}

	const response = NextResponse.json({ success: true });
	response.cookies.delete(FACULTY_COOKIE_NAME);
	return response;
}
