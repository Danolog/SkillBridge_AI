import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { parseSyllabus } from "@/lib/ai/parse-syllabus";
import { auth } from "@/lib/auth/server";
import { applyRateLimit, rateLimiters, rateLimitResponse } from "@/lib/rate-limit";

export const maxDuration = 60;

const SyllabusSchema = z.object({
	syllabusText: z.string().min(100).max(50_000),
	careerGoal: z.string().min(1).max(200),
});

export async function POST(req: Request) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const rl = await applyRateLimit(rateLimiters.aiHeavy, `user:${session.user.id}`);
	if (!rl.success) return rateLimitResponse(rl.reset);

	let raw: unknown;
	try {
		raw = await req.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}
	const parsed = SyllabusSchema.safeParse(raw);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Invalid input", issues: parsed.error.flatten() },
			{ status: 400 },
		);
	}
	const { syllabusText, careerGoal } = parsed.data;

	try {
		const competencies = await parseSyllabus(syllabusText, careerGoal);
		return NextResponse.json({ competencies });
	} catch {
		return NextResponse.json(
			{ error: "Nie udało się przeanalizować sylabusa. Spróbuj ponownie." },
			{ status: 500 },
		);
	}
}
