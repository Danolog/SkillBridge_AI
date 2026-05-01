import { createHash } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { facultySessions } from "@/lib/db/schema";

export const FACULTY_COOKIE_NAME = "faculty_session";

export function hashToken(token: string): string {
	return createHash("sha256").update(token).digest("hex");
}

export async function checkFacultyAuth(): Promise<boolean> {
	const cookieStore = await cookies();
	const token = cookieStore.get(FACULTY_COOKIE_NAME)?.value;
	if (!token) return false;

	const tokenHash = hashToken(token);
	try {
		const row = await db.query.facultySessions.findFirst({
			where: and(
				eq(facultySessions.tokenHash, tokenHash),
				gt(facultySessions.expiresAt, new Date()),
			),
		});
		return Boolean(row);
	} catch {
		return false;
	}
}
