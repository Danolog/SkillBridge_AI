import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
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

	// No skill map yet — show generating/empty state
	if (!skillMap) {
		return (
			<div className="flex flex-col items-center justify-center h-[calc(100vh-theme(spacing.0))] gap-6 p-8">
				<div className="w-16 h-16 rounded-full bg-indigo-500/8 flex items-center justify-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
						className="w-8 h-8 text-indigo-500 animate-pulse"
					>
						<title>Skill Map</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
						/>
					</svg>
				</div>
				<div className="text-center">
					<h2 className="font-[Nunito] font-extrabold text-xl text-slate-900 mb-1">
						Generujemy Twoją Skill Map...
					</h2>
					<p className="text-sm text-slate-500">
						AI analizuje Twoje kompetencje i dane rynkowe. Odśwież stronę za chwilę.
					</p>
				</div>
			</div>
		);
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
