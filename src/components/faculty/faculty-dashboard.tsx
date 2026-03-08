"use client";

import {
	AlertTriangle,
	BarChart3,
	GraduationCap,
	Lightbulb,
	Loader2,
	LogOut,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center space-y-4">
					<Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
					<p className="text-muted-foreground">Ładowanie danych i generowanie sugestii AI...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-destructive">{error}</p>
			</div>
		);
	}

	if (!data) return null;

	if (data.tooFewStudents) {
		return (
			<div className="min-h-screen bg-background">
				<Header onLogout={handleLogout} />
				<div className="max-w-4xl mx-auto p-6">
					<Card>
						<CardContent className="py-12 text-center space-y-4">
							<AlertTriangle className="w-12 h-12 mx-auto text-yellow-500" />
							<h2 className="text-xl font-semibold">Za mało danych</h2>
							<p className="text-muted-foreground">
								Zachęć studentów do korzystania z SkillBridge AI.
								<br />
								Minimum 3 studentów potrzebne do generowania raportu.
							</p>
							<p className="text-sm text-muted-foreground">
								Aktualnie: {data.studentCount} {data.studentCount === 1 ? "student" : "studentów"}
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<Header onLogout={handleLogout} />
			<div className="max-w-6xl mx-auto p-6 space-y-6">
				{/* Stats */}
				<Card>
					<CardContent className="py-4">
						<div className="flex items-center gap-2 text-muted-foreground">
							<Users className="w-4 h-4" />
							<span>
								Analiza oparta na danych{" "}
								<span className="font-semibold text-foreground">{data.studentCount}</span> studentów
							</span>
						</div>
					</CardContent>
				</Card>

				{/* Heatmap */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BarChart3 className="w-5 h-5" />
							Pokrycie kompetencji rynkowych
						</CardTitle>
					</CardHeader>
					<CardContent>
						<CompetencyHeatmap data={data.heatmapData} />
					</CardContent>
				</Card>

				{/* Top Missing */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertTriangle className="w-5 h-5" />
							Top 5 brakujących kompetencji
						</CardTitle>
					</CardHeader>
					<CardContent>
						{data.topMissingCompetencies.length === 0 ? (
							<p className="text-muted-foreground">Brak danych o lukach kompetencyjnych.</p>
						) : (
							<div className="space-y-3">
								{data.topMissingCompetencies.map((comp, i) => (
									<div key={comp.name} className="flex items-start gap-3 p-3 rounded-lg border">
										<span className="flex items-center justify-center w-7 h-7 rounded-full bg-destructive/10 text-destructive text-sm font-bold shrink-0">
											{i + 1}
										</span>
										<div className="flex-1 min-w-0">
											<p className="font-medium">{comp.name}</p>
											<p className="text-sm text-muted-foreground">
												Brakuje {comp.missingCount} studentom
												{comp.requiredByPercent > 0 &&
													` \u00B7 ${comp.requiredByPercent}% ofert pracy`}
											</p>
											{comp.careerGoals.length > 0 && (
												<div className="flex flex-wrap gap-1 mt-1">
													{comp.careerGoals.map((goal) => (
														<span key={goal} className="text-xs px-2 py-0.5 rounded-full bg-muted">
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
					</CardContent>
				</Card>

				{/* AI Suggestions */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Lightbulb className="w-5 h-5" />
							Sugestie AI dla rady programowej
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{data.aiSuggestions.map((suggestion) => (
								<div
									key={suggestion}
									className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10"
								>
									<Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
									<p className="text-sm">{suggestion}</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Generated at */}
				<p className="text-xs text-muted-foreground text-center">
					Raport wygenerowany: {new Date(data.generatedAt).toLocaleString("pl-PL")}
				</p>
			</div>
		</div>
	);
}

function Header({ onLogout }: { onLogout: () => void }) {
	return (
		<header className="border-b bg-card">
			<div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<GraduationCap className="w-6 h-6 text-primary" />
					<div>
						<h1 className="font-semibold">Panel Uczelni</h1>
						<p className="text-xs text-muted-foreground">SkillBridge AI</p>
					</div>
				</div>
				<Button variant="outline" size="sm" onClick={onLogout}>
					<LogOut className="w-4 h-4 mr-2" />
					Wyloguj
				</Button>
			</div>
		</header>
	);
}
