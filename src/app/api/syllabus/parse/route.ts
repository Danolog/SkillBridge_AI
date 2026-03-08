import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { parseSyllabus } from "@/lib/ai/parse-syllabus";
import { auth } from "@/lib/auth/server";

export const maxDuration = 60;

export async function POST(req: Request) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await req.json();
	const { syllabusText, careerGoal } = body as {
		syllabusText?: string;
		careerGoal?: string;
	};

	if (!syllabusText || syllabusText.trim().length < 100) {
		return NextResponse.json(
			{ error: "Sylabus musi mieć co najmniej 100 znaków." },
			{ status: 400 },
		);
	}

	if (!careerGoal) {
		return NextResponse.json({ error: "Cel kariery jest wymagany." }, { status: 400 });
	}

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
