import { randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { facultySessions } from "@/lib/db/schema";
import { FACULTY_COOKIE_NAME, hashToken } from "@/lib/faculty-auth";
import { applyRateLimit, getClientIp, rateLimiters, rateLimitResponse } from "@/lib/rate-limit";

const SESSION_TTL_SECONDS = 60 * 60 * 8;

function constantTimeEqual(a: string, b: string): boolean {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	if (bufA.length !== bufB.length) {
		// Still run a comparison against bufA to avoid early-return timing leak.
		timingSafeEqual(bufA, bufA);
		return false;
	}
	return timingSafeEqual(bufA, bufB);
}

export async function POST(req: Request) {
	const expectedOrigin = process.env.BETTER_AUTH_URL;
	const origin = req.headers.get("origin");
	if (expectedOrigin && origin && origin !== expectedOrigin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const rl = await applyRateLimit(rateLimiters.facultyLogin, getClientIp(req));
	if (!rl.success) return rateLimitResponse(rl.reset);

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}
	const password =
		typeof body === "object" && body !== null && "password" in body
			? (body as { password?: unknown }).password
			: undefined;
	if (typeof password !== "string" || password.length === 0 || password.length > 200) {
		return NextResponse.json({ error: "Invalid input" }, { status: 400 });
	}

	const expected = process.env.FACULTY_PASSWORD ?? "";
	if (expected.length === 0 || !constantTimeEqual(password, expected)) {
		return NextResponse.json({ error: "Nieprawidłowe hasło" }, { status: 401 });
	}

	const token = randomBytes(32).toString("base64url");
	const tokenHash = hashToken(token);
	const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

	const ipAddress =
		req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		req.headers.get("x-real-ip") ??
		null;
	const userAgent = req.headers.get("user-agent") ?? null;

	await db.insert(facultySessions).values({
		tokenHash,
		expiresAt,
		ipAddress,
		userAgent,
	});

	const response = NextResponse.json({ success: true });
	response.cookies.set(FACULTY_COOKIE_NAME, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: SESSION_TTL_SECONDS,
		path: "/",
	});
	return response;
}
