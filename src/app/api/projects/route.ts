import { and, eq, lte } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
	const { searchParams } = req.nextUrl;
	const level = searchParams.get("level");
	const sourceType = searchParams.get("sourceType");
	const maxHours = searchParams.get("maxHours");

	const conditions = [eq(projects.status, "active")];
	if (level)
		conditions.push(eq(projects.level, level as (typeof projects.level.enumValues)[number]));
	if (sourceType)
		conditions.push(
			eq(projects.sourceType, sourceType as (typeof projects.sourceType.enumValues)[number]),
		);
	if (maxHours) conditions.push(lte(projects.estimatedHours, Number(maxHours)));

	const result = await db.query.projects.findMany({
		where: and(...conditions),
		with: { competencies: true },
		orderBy: (p, { desc }) => [desc(p.createdAt)],
	});

	return NextResponse.json({ projects: result });
}
