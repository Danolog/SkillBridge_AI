"use client";

import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { GapCard } from "./gap-card";

type GapPriority = "critical" | "important" | "nice_to_have";

interface Gap {
	id: string;
	competencyName: string;
	priority: GapPriority;
	marketPercentage: number;
	estimatedHours: number;
	whyImportant: string | null;
}

interface GapListProps {
	gaps: Gap[];
	stats: { critical: number; important: number; niceToHave: number };
}

export function GapList({ gaps, stats }: GapListProps) {
	if (gaps.length === 0) {
		return (
			<div className="ga-empty">
				<div className="ga-empty-icon">
					<CheckCircle size={36} strokeWidth={1.5} />
				</div>
				<h2 className="ga-empty-title">Gratulacje!</h2>
				<p className="ga-empty-desc">
					Twój profil pokrywa wymagania rynku pracy. Nie znaleźliśmy żadnych luk kompetencyjnych.
				</p>
				<Link href="/dashboard" className="ga-empty-link">
					Wróć do Dashboard
					<ArrowRight size={16} />
				</Link>
			</div>
		);
	}

	return (
		<>
			{/* Summary stats */}
			<div className="ga-stats">
				<div className="ga-stat-card ga-stat-critical">
					<div className="ga-stat-label">Krytyczne</div>
					<div className="ga-stat-value ga-stat-value-critical">{stats.critical}</div>
					<div className="ga-stat-badge-row">
						<span className="ga-badge ga-badge-critical">
							<span className="ga-badge-dot" />
							Krytyczna
						</span>
					</div>
				</div>
				<div className="ga-stat-card ga-stat-important">
					<div className="ga-stat-label">Ważne</div>
					<div className="ga-stat-value ga-stat-value-important">{stats.important}</div>
					<div className="ga-stat-badge-row">
						<span className="ga-badge ga-badge-important">
							<span className="ga-badge-dot" />
							Ważna
						</span>
					</div>
				</div>
				<div className="ga-stat-card ga-stat-nice">
					<div className="ga-stat-label">Warto znać</div>
					<div className="ga-stat-value ga-stat-value-nice">{stats.niceToHave}</div>
					<div className="ga-stat-badge-row">
						<span className="ga-badge ga-badge-nice">
							<span className="ga-badge-dot" />
							Warto znać
						</span>
					</div>
				</div>
			</div>

			{/* Gap cards grid */}
			<div className="ga-grid">
				{gaps.map((gap) => (
					<GapCard
						key={gap.id}
						id={gap.id}
						competencyName={gap.competencyName}
						priority={gap.priority}
						marketPercentage={gap.marketPercentage}
						estimatedHours={gap.estimatedHours}
						whyImportant={gap.whyImportant}
					/>
				))}
			</div>
		</>
	);
}
