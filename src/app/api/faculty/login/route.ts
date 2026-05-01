import { randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auditContextFromRequest, recordAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { facultySessions } from "@/lib/db/schema";
import { FACULTY_COOKIE_NAME, hashToken } from "@/lib/faculty-auth";
import { applyRateLimit, getClientIp, rateLimiters, rateLimitResponse } from "@/lib/rate-limit";

const SESSION_TTL_SECONDS = 60 * 60 * 8;

const LoginSchema = z.object({
	password: z.string().min(1).max(200),
});

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

function assertProductionPasswordStrength(): string | null {
	if (process.env.NODE_ENV !== "production") return null;
	const pw = process.env.FACULTY_PASSWORD ?? "";
	const weakDictionary = ["faculty2024", "admin", "password", "12345678", "qwerty"];
	if (pw.length < 16 || weakDictionary.includes(pw.toLowerCase())) {
		return "FACULTY_PASSWORD too weak for production";
	}
	return null;
}

export async function POST(req: Request) {
	const passwordCheckErr = assertProductionPasswordStrength();
	if (passwordCheckErr) {
		return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
	}
	const expectedOrigin = process.env.BETTER_AUTH_URL;
	const origin = req.headers.get("origin");
	if (expectedOrigin && origin && origin !== expectedOrigin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const rl = await applyRateLimit(rateLimiters.facultyLogin, getClientIp(req));
	if (!rl.success) return rateLimitResponse(rl.reset);

	let raw: unknown;
	try {
		raw = await req.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}
	const parsedBody = LoginSchema.safeParse(raw);
	if (!parsedBody.success) {
		return NextResponse.json({ error: "Invalid input" }, { status: 400 });
	}
	const { password } = parsedBody.data;

	const auditCtx = auditContextFromRequest(req);
	const expected = process.env.FACULTY_PASSWORD ?? "";
	if (expected.length === 0 || !constantTimeEqual(password, expected)) {
		await recordAudit({
			actorType: "anonymous",
			action: "faculty.login.fail",
			...auditCtx,
		});
		return NextResponse.json({ error: "Nieprawidłowe hasło" }, { status: 401 });
	}

	const token = randomBytes(32).toString("base64url");
	const tokenHash = hashToken(token);
	const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

	const [inserted] = await db
		.insert(facultySessions)
		.values({
			tokenHash,
			expiresAt,
			ipAddress: auditCtx.ipAddress,
			userAgent: auditCtx.userAgent,
		})
		.returning({ id: facultySessions.id });

	await recordAudit({
		actorType: "faculty",
		actorId: inserted?.id ?? null,
		action: "faculty.login.success",
		...auditCtx,
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
