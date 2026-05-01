import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const project = await db.query.projects.findFirst({
		where: eq(projects.id, id),
		with: { competencies: true },
	});
	if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json({ project });
}
