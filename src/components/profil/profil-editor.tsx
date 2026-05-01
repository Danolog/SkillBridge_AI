"use client";

import { Save, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
	type CompetencyItem,
	createCompetencyItem,
	StepCompetencies,
} from "@/components/onboarding/step-competencies";
import { CAREER_GOALS, type ProfileData, StepProfile } from "@/components/onboarding/step-profile";
import { StepSyllabus } from "@/components/onboarding/step-syllabus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface ProfilEditorInitial {
	university: string;
	fieldOfStudy: string;
	semester: number;
	careerGoal: string;
	syllabusText: string;
	competencies: string[];
}

interface ProfilEditorProps {
	initial: ProfilEditorInitial;
}

function buildInitialProfile(initial: ProfilEditorInitial): ProfileData {
	const isPredefinedGoal = CAREER_GOALS.includes(initial.careerGoal);
	return {
		university: initial.university,
		fieldOfStudy: initial.fieldOfStudy,
		semester: String(initial.semester),
		careerGoal: isPredefinedGoal ? initial.careerGoal : "custom",
		customCareerGoal: isPredefinedGoal ? "" : initial.careerGoal,
	};
}

export function ProfilEditor({ initial }: ProfilEditorProps) {
	const router = useRouter();
	const [profile, setProfile] = useState<ProfileData>(() => buildInitialProfile(initial));
	const [syllabusText, setSyllabusText] = useState(initial.syllabusText);
	const [competencies, setCompetencies] = useState<CompetencyItem[]>(() =>
		initial.competencies.map((name) => createCompetencyItem(name)),
	);
	const [analyzing, setAnalyzing] = useState(false);
	const [saving, setSaving] = useState(false);

	const resolvedCareerGoal =
		profile.careerGoal === "custom" ? profile.customCareerGoal.trim() : profile.careerGoal;

	const filledCompetencies = competencies.filter((c) => c.name.trim() !== "");

	const isProfileValid =
		profile.university &&
		profile.fieldOfStudy.trim() &&
		profile.semester &&
		profile.careerGoal &&
		(profile.careerGoal !== "custom" || profile.customCareerGoal.trim());

	const canSave = Boolean(isProfileValid) && filledCompetencies.length >= 5 && !saving;

	const handleAnalyze = async () => {
		if (syllabusText.trim().length < 100) {
			toast.error("Sylabus musi mieć co najmniej 100 znaków.");
			return;
		}
		if (!resolvedCareerGoal) {
			toast.error("Najpierw uzupełnij cel kariery w sekcji Profil.");
			return;
		}
		setAnalyzing(true);
		try {
			const res = await fetch("/api/syllabus/parse", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ syllabusText, careerGoal: resolvedCareerGoal }),
			});
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Błąd analizy");
			}
			const data = await res.json();
			setCompetencies((data.competencies as string[]).map((name) => createCompetencyItem(name)));
			toast.success("Lista kompetencji zaktualizowana przez AI.");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Nie udało się przeanalizować sylabusa.");
		} finally {
			setAnalyzing(false);
		}
	};

	const handleSave = async () => {
		if (!isProfileValid) {
			toast.error("Wypełnij wszystkie wymagane pola w sekcji Profil.");
			return;
		}
		if (filledCompetencies.length < 5) {
			toast.error("Dodaj co najmniej 5 kompetencji.");
			return;
		}
		setSaving(true);
		try {
			const res = await fetch("/api/onboarding", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					university: profile.university,
					fieldOfStudy: profile.fieldOfStudy,
					semester: Number(profile.semester),
					careerGoal: resolvedCareerGoal,
					syllabusText,
					competencies: filledCompetencies.map((c) => c.name.trim()),
				}),
			});
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Błąd zapisu");
			}
			toast.success("Zapisano zmiany. Skill Map i Gap Analysis są regenerowane w tle.");
			router.push("/dashboard");
			router.refresh();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Nie udało się zapisać danych.");
			setSaving(false);
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 md:py-10">
			<header className="space-y-1.5">
				<h1 className="font-heading text-2xl font-extrabold md:text-3xl">Twój profil</h1>
				<p className="text-sm text-muted-foreground">
					Zaktualizuj swoje dane, sylabus lub listę kompetencji. Po zapisie Skill Map oraz Gap
					Analysis zostaną przeliczone od nowa. Twój Paszport, ukończone projekty i Verified
					Receipts pozostaną bez zmian.
				</p>
			</header>

			<Card>
				<CardHeader>
					<CardTitle>Dane podstawowe</CardTitle>
					<CardDescription>Uczelnia, kierunek, semestr i cel kariery.</CardDescription>
				</CardHeader>
				<CardContent>
					<StepProfile data={profile} onChange={setProfile} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Sylabus</CardTitle>
					<CardDescription>
						Edytuj treść sylabusa i kliknij „Analizuj sylabus”, aby AI ponownie wyciągnęło listę
						kompetencji.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<StepSyllabus
						syllabusText={syllabusText}
						onSyllabusChange={setSyllabusText}
						onAnalyze={handleAnalyze}
						loading={analyzing}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Kompetencje</CardTitle>
					<CardDescription>
						Dodaj, usuń lub popraw nazwy kompetencji. Minimum 5 wpisów.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<StepCompetencies competencies={competencies} onChange={setCompetencies} />
				</CardContent>
			</Card>

			<div className="flex items-center justify-end gap-3 pt-2">
				<Button variant="ghost" onClick={() => router.push("/dashboard")} disabled={saving}>
					Anuluj
				</Button>
				<Button onClick={handleSave} disabled={!canSave} className="ob-btn-accent gap-2">
					{saving ? (
						<>
							<Sparkles className="h-4 w-4 animate-spin" />
							Zapisywanie…
						</>
					) : (
						<>
							<Save className="h-4 w-4" />
							Zapisz zmiany
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
