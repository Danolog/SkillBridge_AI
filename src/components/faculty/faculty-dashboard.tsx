"use client";

import {
	AlertTriangle,
	BarChart3,
	GraduationCap,
	Lightbulb,
	Loader2,
	LogOut,
	TrendingDown,
	TrendingUp,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CompetencyHeatmap } from "./competency-heatmap";

type HeatmapItem = {
	competencyName: string;
	careerGoal: string;
	coveragePercent: number;
	requiredByPercent: number;
};

type MissingCompetency = {
	name: string;
	missingCount: number;
	requiredByPercent: number;
	careerGoals: string[];
};

type DashboardData = {
	studentCount: number;
	heatmapData: HeatmapItem[];
	topMissingCompetencies: MissingCompetency[];
	aiSuggestions: string[];
	generatedAt: string;
	tooFewStudents?: boolean;
};

export function FacultyDashboard() {
	const router = useRouter();
	const [data, setData] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		async function fetchData() {
			try {
				const res = await fetch("/api/faculty/dashboard");
				if (res.status === 401) {
					router.push("/faculty/login");
					return;
				}
				if (!res.ok) {
					setError("Błąd podczas pobierania danych.");
					return;
				}
				const json = await res.json();
				setData(json);
			} catch {
				setError("Błąd połączenia z serwerem.");
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, [router]);

	async function handleLogout() {
		await fetch("/api/faculty/logout", { method: "POST" });
		router.push("/faculty/login");
	}

	if (loading) {
		return (
			<div className="fc-loading">
				<Loader2 className="fc-loading-spinner" size={32} />
				<p className="fc-loading-text">Ładowanie danych i generowanie sugestii AI...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="fc-error">
				<p>{error}</p>
			</div>
		);
	}

	if (!data) return null;

	if (data.tooFewStudents) {
		return (
			<>
				<FacultyHeader onLogout={handleLogout} />
				<div className="fc-main">
					<div className="fc-content">
						<div className="fc-card">
							<div className="fc-card-body">
								<div className="fc-empty">
									<div className="fc-empty-icon">
										<AlertTriangle size={24} />
									</div>
									<h2 className="fc-empty-title">Za mało danych</h2>
									<p className="fc-empty-text">
										Zachęć studentów do korzystania z SkillBridge AI.
										<br />
										Minimum 3 studentów potrzebne do generowania raportu.
									</p>
									<p className="fc-empty-text" style={{ marginTop: 8 }}>
										Aktualnie: {data.studentCount}{" "}
										{data.studentCount === 1 ? "student" : "studentów"}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</>
		);
	}

	// Compute KPIs
	const avgCoverage =
		data.heatmapData.length > 0
			? Math.round(
					data.heatmapData.reduce((sum, d) => sum + d.coveragePercent, 0) / data.heatmapData.length,
				)
			: 0;
	const criticalGaps = data.topMissingCompetencies.filter((c) => c.requiredByPercent >= 70).length;
	const uniqueGoals = new Set(data.heatmapData.map((d) => d.careerGoal)).size;

	return (
		<>
			<FacultyHeader onLogout={handleLogout} />
			<div className="fc-main">
				<div className="fc-content">
					{/* Welcome card */}
					<div className="fc-welcome">
						<h1 className="fc-welcome-title">Raport Programowy</h1>
						<div className="fc-welcome-meta">
							<span>
								<strong>{data.studentCount}</strong> studentów w analizie
							</span>
							<span className="fc-welcome-dot" />
							<span>
								<strong>{uniqueGoals}</strong>{" "}
								{uniqueGoals === 1 ? "ścieżka kariery" : "ścieżek kariery"}
							</span>
							<span className="fc-welcome-dot" />
							<span>
								Wygenerowano{" "}
								{new Date(data.generatedAt).toLocaleDateString("pl-PL", {
									day: "numeric",
									month: "long",
									year: "numeric",
								})}
							</span>
						</div>
					</div>

					{/* KPI cards */}
					<div className="fc-kpi-grid">
						<div className="fc-kpi">
							<div className="fc-kpi-icon fc-kpi-icon-indigo">
								<Users size={22} />
							</div>
							<div>
								<div className="fc-kpi-value fc-kpi-value-gradient">{data.studentCount}</div>
								<div className="fc-kpi-label">Studentów w bazie</div>
							</div>
						</div>
						<div className="fc-kpi">
							<div className="fc-kpi-icon fc-kpi-icon-emerald">
								<TrendingUp size={22} />
							</div>
							<div>
								<div className="fc-kpi-value">{avgCoverage}%</div>
								<div className="fc-kpi-label">Średnie pokrycie rynku</div>
							</div>
						</div>
						<div className="fc-kpi">
							<div className="fc-kpi-icon fc-kpi-icon-amber">
								<TrendingDown size={22} />
							</div>
							<div>
								<div className="fc-kpi-value">{criticalGaps}</div>
								<div className="fc-kpi-label">Krytycznych luk (&gt;70% rynku)</div>
							</div>
						</div>
					</div>

					{/* Heatmap section */}
					<div className="fc-section-label">
						<span className="fc-section-icon fc-section-icon-indigo">
							<BarChart3 size={16} />
						</span>
						Pokrycie kompetencji rynkowych
					</div>
					<div className="fc-card">
						<div className="fc-card-body">
							<CompetencyHeatmap data={data.heatmapData} />
						</div>
					</div>

					{/* Top Missing section */}
					<div className="fc-section-label">
						<span className="fc-section-icon fc-section-icon-amber">
							<AlertTriangle size={16} />
						</span>
						Top {data.topMissingCompetencies.length} brakujących kompetencji
					</div>
					<div className="fc-card">
						<div className="fc-card-body">
							{data.topMissingCompetencies.length === 0 ? (
								<p className="fc-empty-text">Brak danych o lukach kompetencyjnych.</p>
							) : (
								<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
									{data.topMissingCompetencies.map((comp, i) => (
										<div key={comp.name} className="fc-missing-row">
											<span className="fc-missing-rank">{i + 1}</span>
											<div style={{ flex: 1, minWidth: 0 }}>
												<p className="fc-missing-name">{comp.name}</p>
												<p className="fc-missing-meta">
													Brakuje {comp.missingCount} studentom
													{comp.requiredByPercent > 0 &&
														` · ${comp.requiredByPercent}% ofert pracy`}
												</p>
												{comp.careerGoals.length > 0 && (
													<div className="fc-missing-goals">
														{comp.careerGoals.map((goal) => (
															<span key={goal} className="fc-missing-goal-tag">
																{goal}
															</span>
														))}
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>

					{/* AI Suggestions section */}
					<div className="fc-section-label">
						<span className="fc-section-icon fc-section-icon-cyan">
							<Lightbulb size={16} />
						</span>
						Sugestie AI dla rady programowej
					</div>
					<div className="fc-card">
						<div className="fc-card-body">
							<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
								{data.aiSuggestions.map((suggestion) => (
									<div key={suggestion} className="fc-suggestion">
										<div className="fc-suggestion-icon">
											<Lightbulb size={16} />
										</div>
										<p className="fc-suggestion-text">{suggestion}</p>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Timestamp */}
					<p className="fc-timestamp">
						Raport wygenerowany: {new Date(data.generatedAt).toLocaleString("pl-PL")}
					</p>
				</div>
			</div>
		</>
	);
}

function FacultyHeader({ onLogout }: { onLogout: () => void }) {
	return (
		<header className="fc-header">
			<div className="fc-header-inner">
				<div className="fc-header-left">
					<div className="fc-header-icon">
						<GraduationCap size={20} />
					</div>
					<div>
						<div className="fc-header-title">Panel Uczelni</div>
						<div className="fc-header-subtitle">SkillBridge AI</div>
					</div>
				</div>
				<button type="button" className="fc-logout-btn" onClick={onLogout}>
					<LogOut size={16} />
					Wyloguj
				</button>
			</div>
		</header>
	);
}
