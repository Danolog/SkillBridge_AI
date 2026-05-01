"use client";

import { Clock, Database, Github } from "lucide-react";
import Link from "next/link";

interface ProjectCardProps {
	id: string;
	title: string;
	description: string;
	level: string;
	estimatedHours: number;
	sourceType: string;
	competencyCount: number;
}

const levelColors: Record<string, string> = {
	L1: "proj-level-l1",
	L2: "proj-level-l2",
	L3: "proj-level-l3",
	L4: "proj-level-l4",
	L5: "proj-level-l5",
};

export function ProjectCard({
	id,
	title,
	description,
	level,
	estimatedHours,
	sourceType,
	competencyCount,
}: ProjectCardProps) {
	return (
		<Link href={`/projects/${id}`} className="proj-card">
			<div className="proj-card-header">
				<span className={`proj-level-badge ${levelColors[level] ?? ""}`}>{level}</span>
				<span className="proj-source-badge">
					{sourceType === "oss" ? <Github size={12} /> : <Database size={12} />}
					{sourceType === "oss" ? "OSS" : "Open Data"}
				</span>
			</div>
			<h3 className="proj-card-title">{title}</h3>
			<p className="proj-card-desc">{description}</p>
			<div className="proj-card-footer">
				<span className="proj-card-meta">
					<Clock size={14} />
					{estimatedHours}h
				</span>
				<span className="proj-card-meta">{competencyCount} kompetencji</span>
			</div>
		</Link>
	);
}
