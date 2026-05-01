import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SkillMapEmptyState } from "@/components/skill-map/skill-map-empty-state";
import { SkillMapView } from "@/components/skill-map/skill-map-view";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { skillMaps, students } from "@/lib/db/schema";

export default async function SkillMapPage() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/login");

	const student = await db.query.students.findFirst({
		where: eq(students.userId, session.user.id),
	});
	if (!student) redirect("/onboarding");

	const skillMap = await db.query.skillMaps.findFirst({
		where: eq(skillMaps.studentId, student.id),
	});

	if (!skillMap) {
		return <SkillMapEmptyState />;
	}

	const nodes = (skillMap.nodes as unknown[]) || [];
	const edges = (skillMap.edges as unknown[]) || [];

	return (
		<SkillMapView
			initialNodes={nodes as Parameters<typeof SkillMapView>[0]["initialNodes"]}
			initialEdges={edges as Parameters<typeof SkillMapView>[0]["initialEdges"]}
		/>
	);
}
