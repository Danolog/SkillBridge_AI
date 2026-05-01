"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProjectCard } from "./project-card";

interface ProjectCompetency {
	id: string;
	projectId: string;
	competencyName: string;
	role: string;
}

interface Project {
	id: string;
	slug: string;
	title: string;
	description: string;
	level: string;
	estimatedHours: number;
	sourceType: string;
	sourceUrl: string | null;
	competencies: ProjectCompetency[];
}

interface Recommendation {
	projectId: string;
	matchScore: number;
	reasoning: string;
}

interface ProjectCatalogProps {
	projects: Project[];
	gapId?: string;
	initialLevel?: string;
	initialSourceType?: string;
}

export function ProjectCatalog({
	projects,
	gapId,
	initialLevel,
	initialSourceType,
}: ProjectCatalogProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [level, setLevel] = useState(initialLevel ?? "");
	const [sourceType, setSourceType] = useState(initialSourceType ?? "");
	const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
	const [loadingRecs, setLoadingRecs] = useState(false);

	useEffect(() => {
		if (!gapId) return;
		setLoadingRecs(true);
		fetch(`/api/projects/recommend?gapId=${gapId}`)
			.then((res) => res.json())
			.then((data) => setRecommendations(data.recommendations ?? []))
			.catch(() => setRecommendations([]))
			.finally(() => setLoadingRecs(false));
	}, [gapId]);

	const updateFilters = useCallback(
		(newLevel: string, newSourceType: string) => {
			const params = new URLSearchParams(searchParams.toString());
			if (newLevel) params.set("level", newLevel);
			else params.delete("level");
			if (newSourceType) params.set("sourceType", newSourceType);
			else params.delete("sourceType");
			if (gapId) params.set("gapId", gapId);
			router.push(`/projects?${params.toString()}`);
		},
		[router, searchParams, gapId],
	);

	const filtered = useMemo(() => {
		return projects.filter((p) => {
			if (level && p.level !== level) return false;
			if (sourceType && p.sourceType !== sourceType) return false;
			return true;
		});
	}, [projects, level, sourceType]);

	const recommendedProjects = useMemo(() => {
		const recIds = new Set(recommendations.map((r) => r.projectId));
		return projects.filter((p) => recIds.has(p.id));
	}, [projects, recommendations]);

	return (
		<div className="proj-catalog">
			{gapId && (
				<div className="proj-rec-section">
					<h2 className="proj-rec-title">Rekomendowane dla Twojej luki</h2>
					{loadingRecs ? (
						<div className="proj-rec-loading">
							<Loader2 size={20} className="animate-spin" />
							Szukam najlepszych projektów...
						</div>
					) : recommendedProjects.length > 0 ? (
						<div className="proj-grid">
							{recommendedProjects.map((p) => (
								<ProjectCard
									key={p.id}
									id={p.id}
									title={p.title}
									description={p.description}
									level={p.level}
									estimatedHours={p.estimatedHours}
									sourceType={p.sourceType}
									competencyCount={p.competencies.length}
								/>
							))}
						</div>
					) : (
						<p className="proj-rec-empty">Brak rekomendacji dla tej luki.</p>
					)}
				</div>
			)}

			<div className="proj-filters">
				<select
					value={level}
					onChange={(e) => {
						setLevel(e.target.value);
						updateFilters(e.target.value, sourceType);
					}}
					className="proj-filter-select"
				>
					<option value="">Wszystkie poziomy</option>
					<option value="L1">L1 — Podstawowy</option>
					<option value="L2">L2 — Średni</option>
					<option value="L3">L3 — Zaawansowany</option>
				</select>
				<select
					value={sourceType}
					onChange={(e) => {
						setSourceType(e.target.value);
						updateFilters(level, e.target.value);
					}}
					className="proj-filter-select"
				>
					<option value="">Wszystkie źródła</option>
					<option value="open_data">Open Data</option>
					<option value="oss">Open Source</option>
				</select>
			</div>

			<div className="proj-grid">
				{filtered.map((p) => (
					<ProjectCard
						key={p.id}
						id={p.id}
						title={p.title}
						description={p.description}
						level={p.level}
						estimatedHours={p.estimatedHours}
						sourceType={p.sourceType}
						competencyCount={p.competencies.length}
					/>
				))}
			</div>

			{filtered.length === 0 && <p className="proj-empty">Brak projektów pasujących do filtrów.</p>}
		</div>
	);
}
