"use client";

import { BarChart3, Check, Clock, Link as LinkIcon, XCircle } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { CompetencyCard } from "./competency-badge";
import { PdfExportButton } from "./pdf-export";
import { type ProjectReceipt, ProjectReceipts } from "./project-receipts";

export interface PassportData {
	id: string;
	student: {
		name: string;
		university: string;
		fieldOfStudy: string;
		semester: number;
		careerGoal: string;
	};
	marketCoveragePercent: number;
	competencies: Array<{
		name: string;
		status: "acquired" | "in_progress" | "missing";
		marketPercentage?: number | null;
	}>;
	generatedAt: string;
	projectReceipts?: ProjectReceipt[];
}

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export function PassportView({ data }: { data: PassportData }) {
	const passportRef = useRef<HTMLDivElement>(null);

	const acquired = data.competencies.filter((c) => c.status === "acquired");
	const inProgress = data.competencies.filter((c) => c.status === "in_progress");
	const missing = data.competencies.filter((c) => c.status === "missing");
	const total = data.competencies.length;

	const copyLink = async () => {
		const publicUrl = `${window.location.origin}/passport/${data.id}`;
		try {
			await navigator.clipboard.writeText(publicUrl);
			toast.success("Link skopiowany!");
		} catch {
			toast.error("Nie udalo sie skopiowac linku");
		}
	};

	const formattedDate = new Date(data.generatedAt).toLocaleDateString("pl-PL", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});

	return (
		<>
			{/* Page Header */}
			<div className="pp-page-header">
				<h1 className="pp-page-title">Paszport Kompetencji</h1>
				<div className="pp-actions">
					<button type="button" className="pp-btn pp-btn-secondary" onClick={copyLink}>
						<LinkIcon size={16} />
						Kopiuj link
					</button>
					<PdfExportButton passportRef={passportRef} />
				</div>
			</div>

			<div ref={passportRef}>
				{/* Hero Profile */}
				<div className="pp-hero">
					<div className="pp-hero-dots" />
					<div className="pp-hero-content">
						<div className="pp-avatar">{getInitials(data.student.name)}</div>
						<div className="pp-hero-info">
							<h2 className="pp-hero-name">{data.student.name}</h2>
							<div className="pp-hero-meta">
								<span>{data.student.university}</span>
								<span className="dot">&middot;</span>
								<span>{data.student.fieldOfStudy}</span>
								<span className="dot">&middot;</span>
								<span>Semestr {data.student.semester}</span>
							</div>
							<div className="pp-career-pill">
								<Check size={16} />
								Cel: {data.student.careerGoal}
							</div>
						</div>
					</div>
				</div>

				{/* Stats Row */}
				<div className="pp-stats-row">
					<div className="pp-stat-card green">
						<div className="pp-stat-icon green">
							<Check size={24} />
						</div>
						<div className="pp-stat-value">{acquired.length}</div>
						<div className="pp-stat-label">Opanowane</div>
						<div className="pp-stat-sub">
							{total > 0 ? Math.round((acquired.length / total) * 100) : 0}% wszystkich kompetencji
						</div>
					</div>
					<div className="pp-stat-card yellow">
						<div className="pp-stat-icon yellow">
							<Clock size={24} />
						</div>
						<div className="pp-stat-value">{inProgress.length}</div>
						<div className="pp-stat-label">W trakcie nauki</div>
						<div className="pp-stat-sub">
							{total > 0 ? Math.round((inProgress.length / total) * 100) : 0}% wszystkich
							kompetencji
						</div>
					</div>
					<div className="pp-stat-card red">
						<div className="pp-stat-icon red">
							<XCircle size={24} />
						</div>
						<div className="pp-stat-value">{missing.length}</div>
						<div className="pp-stat-label">Brakuje</div>
						<div className="pp-stat-sub">
							{total > 0 ? Math.round((missing.length / total) * 100) : 0}% do uzupelnienia
						</div>
					</div>
				</div>

				{/* Coverage Bar */}
				<div className="pp-coverage-card">
					<div className="pp-coverage-header">
						<div className="pp-coverage-left">
							<div className="pp-coverage-icon">
								<BarChart3 size={22} />
							</div>
							<div>
								<div className="pp-coverage-label">Pokrycie wymagan rynkowych</div>
								<div className="pp-coverage-sublabel">
									Na podstawie {total} kluczowych kompetencji dla {data.student.careerGoal}
								</div>
							</div>
						</div>
						<div className="pp-coverage-value">{data.marketCoveragePercent}%</div>
					</div>
					<div className="pp-progress-track">
						<div className="pp-progress-fill" style={{ width: `${data.marketCoveragePercent}%` }} />
					</div>
					<div className="pp-progress-markers">
						<span>0%</span>
						<span>25%</span>
						<span>50%</span>
						<span>75%</span>
						<span>100%</span>
					</div>
				</div>

				{/* Acquired */}
				{acquired.length > 0 && (
					<div className="pp-comp-section">
						<div className="pp-comp-section-header">
							<div className="pp-comp-section-title">
								<span className="section-dot green" />
								Opanowane kompetencje
							</div>
							<span className="pp-comp-count-badge green">{acquired.length} kompetencji</span>
						</div>
						<div className="pp-comp-grid">
							{acquired.map((c) => (
								<CompetencyCard key={c.name} {...c} />
							))}
						</div>
					</div>
				)}

				{/* In Progress */}
				{inProgress.length > 0 && (
					<div className="pp-comp-section">
						<div className="pp-comp-section-header">
							<div className="pp-comp-section-title">
								<span className="section-dot yellow" />W trakcie nauki
							</div>
							<span className="pp-comp-count-badge yellow">{inProgress.length} kompetencje</span>
						</div>
						<div className="pp-comp-grid">
							{inProgress.map((c) => (
								<CompetencyCard key={c.name} {...c} />
							))}
						</div>
					</div>
				)}

				{/* Missing */}
				{missing.length > 0 && (
					<div className="pp-comp-section">
						<div className="pp-comp-section-header">
							<div className="pp-comp-section-title">
								<span className="section-dot red" />
								Brakujace kompetencje
							</div>
							<span className="pp-comp-count-badge red">{missing.length} kompetencje</span>
						</div>
						<div className="pp-comp-grid">
							{missing.map((c) => (
								<CompetencyCard key={c.name} {...c} />
							))}
						</div>
					</div>
				)}

				{data.projectReceipts && data.projectReceipts.length > 0 && (
					<ProjectReceipts receipts={data.projectReceipts} />
				)}

				{/* Footer */}
				<div className="pp-gen-footer">
					<span className="pp-generated">
						Wygenerowano: <span>{formattedDate}</span>
					</span>
					<span className="pp-powered">SkillBridge</span>
				</div>
			</div>
		</>
	);
}
