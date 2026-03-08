"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const UNIVERSITIES = [
	"WSB Merito Gdańsk",
	"WSB Merito Gdynia",
	"WSB Merito Wrocław",
	"WSB Merito Poznań",
	"WSB Merito Warszawa",
	"WSB Merito Bydgoszcz",
	"WSB Merito Toruń",
	"WSB Merito Łódź",
	"WSB Merito Szczecin",
	"WSB Merito Opole",
	"WSB Merito Chorzów",
	"WSB Merito Kraków",
	"WSB Merito Rzeszów",
	"WSB Merito Lublin",
];

const CAREER_GOALS = [
	"Data Analyst",
	"Data Scientist",
	"Frontend Developer",
	"Backend Developer",
	"Full-stack Developer",
	"UX/UI Designer",
	"Project Manager",
	"DevOps Engineer",
	"Cybersecurity Analyst",
];

const SEMESTERS = Array.from({ length: 10 }, (_, i) => String(i + 1));

export interface ProfileData {
	university: string;
	fieldOfStudy: string;
	semester: string;
	careerGoal: string;
	customCareerGoal: string;
}

interface StepProfileProps {
	data: ProfileData;
	onChange: (data: ProfileData) => void;
}

export function StepProfile({ data, onChange }: StepProfileProps) {
	const isCustomGoal = data.careerGoal === "custom";

	return (
		<div className="space-y-5">
			<div className="space-y-1.5">
				<Label>
					Uczelnia <span className="text-destructive">*</span>
				</Label>
				<Select value={data.university} onValueChange={(v) => onChange({ ...data, university: v })}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Wybierz uczelnię..." />
					</SelectTrigger>
					<SelectContent>
						{UNIVERSITIES.map((u) => (
							<SelectItem key={u} value={u}>
								{u}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-1.5">
				<Label>
					Kierunek studiów <span className="text-destructive">*</span>
				</Label>
				<Input
					value={data.fieldOfStudy}
					onChange={(e) => onChange({ ...data, fieldOfStudy: e.target.value })}
					placeholder="np. Informatyka, Zarządzanie, Finanse..."
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-1.5">
					<Label>
						Semestr <span className="text-destructive">*</span>
					</Label>
					<Select value={data.semester} onValueChange={(v) => onChange({ ...data, semester: v })}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Wybierz..." />
						</SelectTrigger>
						<SelectContent>
							{SEMESTERS.map((s) => (
								<SelectItem key={s} value={s}>
									{s}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5">
					<Label>
						Cel kariery <span className="text-destructive">*</span>
					</Label>
					<Select
						value={data.careerGoal}
						onValueChange={(v) => onChange({ ...data, careerGoal: v, customCareerGoal: "" })}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Wybierz..." />
						</SelectTrigger>
						<SelectContent>
							{CAREER_GOALS.map((g) => (
								<SelectItem key={g} value={g}>
									{g}
								</SelectItem>
							))}
							<SelectItem value="custom">Inne (wpisz)</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{isCustomGoal && (
				<div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
					<Label>
						Twój cel kariery <span className="text-destructive">*</span>
					</Label>
					<Input
						value={data.customCareerGoal}
						onChange={(e) => onChange({ ...data, customCareerGoal: e.target.value })}
						placeholder="Wpisz swój cel kariery..."
						autoFocus
					/>
				</div>
			)}
		</div>
	);
}
