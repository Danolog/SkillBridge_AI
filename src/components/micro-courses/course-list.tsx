"use client";

import { ArrowRight, BookOpen, CheckCircle, Clock, Layers, LinkIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { MicroCourseContent } from "@/lib/ai/generate-micro-course";

interface Course {
	id: string;
	competencyName: string;
	title: string;
	content: MicroCourseContent;
	completed: boolean;
}

interface CourseListProps {
	initialCourses: Course[];
	generateGapId?: string | null;
}

export function CourseList({ initialCourses, generateGapId }: CourseListProps) {
	const [courses, setCourses] = useState(initialCourses);
	const [generating, setGenerating] = useState(false);
	const router = useRouter();
	const didGenerate = useRef(false);

	const completedCount = courses.filter((c) => c.completed).length;
	const totalCount = courses.length;
	const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	const handleGenerate = useCallback(
		async (gapId: string) => {
			setGenerating(true);
			try {
				const res = await fetch("/api/micro-courses", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ gapId }),
				});
				if (!res.ok) throw new Error("Błąd generowania");
				const { course } = await res.json();
				setCourses((prev) => {
					if (prev.some((c) => c.id === course.id)) return prev;
					return [...prev, course];
				});
				toast.success("Mikro-kurs wygenerowany!");
				router.push(`/micro-courses/${course.id}`);
			} catch {
				toast.error("Nie udało się wygenerować kursu");
			} finally {
				setGenerating(false);
			}
		},
		[router],
	);

	// Auto-generate if ?generate=gapId (run once on mount)
	useEffect(() => {
		if (generateGapId && !didGenerate.current) {
			didGenerate.current = true;
			handleGenerate(generateGapId);
		}
	}, [generateGapId, handleGenerate]);

	if (generating) {
		return (
			<div className="mc-generating">
				<div className="mc-generating-spinner" />
				<div className="mc-generating-title">Generuję mikro-kurs...</div>
				<div className="mc-generating-desc">
					AI tworzy spersonalizowany kurs — to może zająć do 30 sekund
				</div>
			</div>
		);
	}

	if (courses.length === 0) {
		return (
			<div className="mc-empty">
				<div className="mc-empty-icon">
					<BookOpen size={36} strokeWidth={1.5} />
				</div>
				<h2 className="mc-empty-title">Brak mikro-kursów</h2>
				<p className="mc-empty-desc">
					Przejdź do Gap Analysis, żeby wygenerować pierwszy mikro-kurs dopasowany do Twoich luk
					kompetencyjnych.
				</p>
				<Link href="/gap-analysis" className="mc-empty-link">
					Przejdź do Gap Analysis
					<ArrowRight size={16} />
				</Link>
			</div>
		);
	}

	return (
		<>
			{/* Progress */}
			<div className="mc-progress-section">
				<div className="mc-progress-header">
					<span className="mc-progress-label">Postęp nauki</span>
					<span className="mc-progress-count">
						{completedCount} / {totalCount} ukończone
					</span>
				</div>
				<div className="mc-progress-bar">
					<div className="mc-progress-fill" style={{ width: `${progressPercent}%` }} />
				</div>
				<div className="mc-progress-stats">
					<span className="mc-progress-stat">
						<CheckCircle size={14} color="#16a34a" />
						{completedCount} ukończone
					</span>
					<span className="mc-progress-stat">
						<Clock size={14} color="#94a3b8" />
						{totalCount - completedCount} do zrobienia
					</span>
				</div>
			</div>

			{/* Grid */}
			<div className="mc-grid">
				{courses.map((course) => (
					<Link
						key={course.id}
						href={`/micro-courses/${course.id}`}
						className={`mc-card ${course.completed ? "is-completed" : ""}`}
					>
						<div className="mc-card-body">
							<div className="mc-card-top">
								<div className="mc-card-icon">
									{course.completed ? (
										<CheckCircle size={24} strokeWidth={1.5} />
									) : (
										<BookOpen size={24} strokeWidth={1.5} />
									)}
								</div>
								<span
									className={`mc-card-status ${course.completed ? "completed" : "not-started"}`}
								>
									<span className="mc-card-status-dot" />
									{course.completed ? "Ukończone" : "Do zrobienia"}
								</span>
							</div>
							<h3 className="mc-card-title">{course.title}</h3>
							<div className="mc-card-competency">
								<Layers size={14} />
								{course.competencyName}
							</div>
						</div>
						<div className="mc-card-meta">
							<span className="mc-card-meta-item">
								<Clock size={13} />~{course.content.estimatedMinutes} min
							</span>
							<span className="mc-card-meta-item">
								<Layers size={13} />
								{course.content.steps.length} kroków
							</span>
							<span className="mc-card-meta-item">
								<LinkIcon size={13} />
								{course.content.resources.length} zasobów
							</span>
						</div>
					</Link>
				))}
			</div>
		</>
	);
}
