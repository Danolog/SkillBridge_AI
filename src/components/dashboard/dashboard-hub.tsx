"use client";

import { ArrowRight, Award, BookOpen, Map as MapIcon, TriangleAlert } from "lucide-react";
import Link from "next/link";

interface DashboardHubProps {
	user: { name: string };
	student: {
		university: string;
		fieldOfStudy: string;
		semester: number;
		careerGoal: string;
	};
	competencyCount: number;
	gapCount: number;
	courseCount: number;
	marketCoverage: number;
}

const tiles = [
	{
		href: "/skill-map",
		title: "Skill Map",
		icon: MapIcon,
		colorClass: "db-tile-icon-indigo",
		getStat: (p: DashboardHubProps) => `${p.competencyCount} kompetencji`,
	},
	{
		href: "/gap-analysis",
		title: "Gap Analysis",
		icon: TriangleAlert,
		colorClass: "db-tile-icon-amber",
		getStat: (p: DashboardHubProps) => `${p.gapCount} luk do zamknięcia`,
	},
	{
		href: "/micro-courses",
		title: "Mikro-kursy",
		icon: BookOpen,
		colorClass: "db-tile-icon-emerald",
		getStat: (p: DashboardHubProps) => `${p.courseCount} ukończone`,
	},
	{
		href: "/passport",
		title: "Paszport",
		icon: Award,
		colorClass: "db-tile-icon-cyan",
		getStat: () => "Udostępnij",
	},
];

export function DashboardHub(props: DashboardHubProps) {
	const { user, student, marketCoverage } = props;

	const initials = user.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<>
			{/* Welcome card */}
			<div className="db-welcome-card">
				<div className="db-welcome-top">
					<div>
						<h1 className="db-welcome-greeting">Cześć, {user.name.split(" ")[0]}!</h1>
						<div className="db-welcome-subtitle">
							<span>{student.university}</span>
							<span className="db-dot" />
							<span>
								{student.fieldOfStudy}, sem. {student.semester}
							</span>
							<span className="db-dot" />
							<span>Cel: {student.careerGoal}</span>
						</div>
					</div>
					<div className="db-welcome-avatar">{initials}</div>
				</div>

				<div className="db-progress-section">
					<div className="db-progress-header">
						<span className="db-progress-label">Twój Paszport Kompetencji</span>
						<span className="db-progress-value">{marketCoverage}%</span>
					</div>
					<div className="db-progress-bar">
						<div className="db-progress-fill" style={{ width: `${marketCoverage}%` }} />
					</div>
				</div>
			</div>

			{/* Nav tiles */}
			<h2 className="db-section-label">Twoje narzędzia</h2>

			<div className="db-tiles-grid">
				{tiles.map((tile) => (
					<Link key={tile.href} href={tile.href} className="db-tile">
						<div className={`db-tile-icon ${tile.colorClass}`}>
							<tile.icon size={24} />
						</div>
						<div className="db-tile-content">
							<div className="db-tile-title">{tile.title}</div>
							<div className="db-tile-stat">{tile.getStat(props)}</div>
						</div>
						<div className="db-tile-arrow">
							<ArrowRight size={16} />
						</div>
					</Link>
				))}
			</div>
		</>
	);
}
