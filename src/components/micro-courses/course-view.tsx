"use client";

import {
	ArrowLeft,
	BookOpen,
	CheckCircle,
	Clock,
	ExternalLink,
	FileText,
	Layers,
	Link as LinkIcon,
	Loader2,
	Monitor,
	Play,
	Wrench,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { MicroCourseContent } from "@/lib/ai/generate-micro-course";
import { StepAccordion } from "./step-accordion";

interface CourseViewProps {
	id: string;
	title: string;
	competencyName: string;
	content: MicroCourseContent;
	completed: boolean;
}

const resourceIcons = {
	video: Play,
	article: FileText,
	docs: BookOpen,
	interactive: Monitor,
} as const;

const resourceIconClass = {
	video: "mc-resource-icon video",
	article: "mc-resource-icon article",
	docs: "mc-resource-icon docs",
	interactive: "mc-resource-icon interactive",
} as const;

export function CourseView({ id, title, competencyName, content, completed }: CourseViewProps) {
	const [isCompleted, setIsCompleted] = useState(completed);
	const [completing, setCompleting] = useState(false);

	const handleComplete = useCallback(async () => {
		if (isCompleted || completing) return;
		setCompleting(true);
		try {
			const res = await fetch(`/api/micro-courses/${id}`, { method: "PATCH" });
			if (!res.ok) throw new Error("Błąd");
			setIsCompleted(true);
			toast.success("Gratulacje! Kompetencja zaktualizowana w Paszporcie.");
		} catch {
			toast.error("Nie udało się oznaczyć kursu jako ukończony");
		} finally {
			setCompleting(false);
		}
	}, [id, isCompleted, completing]);

	return (
		<>
			{/* Back link */}
			<Link href="/micro-courses" className="mc-back">
				<ArrowLeft size={16} />
				Powrót do kursów
			</Link>

			{/* Header */}
			<div className="mc-view-header">
				<h1 className="mc-view-title">{title}</h1>
				<div className="mc-view-meta">
					<span className="mc-view-competency">{competencyName}</span>
					<span className="mc-view-meta-item">
						<Clock size={14} />~{content.estimatedMinutes} minut
					</span>
					<span className="mc-view-meta-item">
						<Layers size={14} />
						{content.steps.length} kroków
					</span>
					<span className="mc-view-meta-item">
						<LinkIcon size={14} />
						{content.resources.length} zasobów
					</span>
				</div>
			</div>

			{/* Steps */}
			<StepAccordion steps={content.steps} />

			{/* Resources */}
			{content.resources.length > 0 && (
				<div className="mc-resources">
					<h2 className="mc-resources-title">
						<LinkIcon size={18} />
						Zasoby
					</h2>
					<div className="mc-resources-list">
						{content.resources.map((resource) => {
							const Icon = resourceIcons[resource.type] || FileText;
							const iconClass = resourceIconClass[resource.type] || "mc-resource-icon article";
							return (
								<a
									key={resource.url}
									href={resource.url}
									target="_blank"
									rel="noopener noreferrer"
									className="mc-resource"
								>
									<div className={iconClass}>
										<Icon size={16} />
									</div>
									<div className="mc-resource-info">
										<div className="mc-resource-name">{resource.title}</div>
										<div className="mc-resource-type">{resource.type}</div>
									</div>
									<ExternalLink size={16} className="mc-resource-arrow" />
								</a>
							);
						})}
					</div>
				</div>
			)}

			{/* Mini-project */}
			<div className="mc-project">
				<div className="mc-project-label">Mini-projekt</div>
				<h2 className="mc-project-title">
					<Wrench size={18} />
					{content.project.title}
				</h2>
				<div className="mc-project-desc">{content.project.description}</div>
				<div className="mc-project-tools">
					{content.project.tools.map((tool) => (
						<span key={tool} className="mc-project-tool">
							{tool}
						</span>
					))}
				</div>
			</div>

			{/* Complete button */}
			<div className="mc-complete-section">
				<button
					type="button"
					className={`mc-complete-btn ${isCompleted ? "done" : ""}`}
					onClick={handleComplete}
					disabled={isCompleted || completing}
				>
					{completing ? (
						<>
							<Loader2 size={20} className="mc-complete-spinner" />
							Zapisuję...
						</>
					) : isCompleted ? (
						<>
							<CheckCircle size={20} />
							Ukończone!
						</>
					) : (
						<>
							<CheckCircle size={20} />
							Ukończ kurs
						</>
					)}
				</button>
			</div>
		</>
	);
}
