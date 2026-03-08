"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface CompetencyItem {
	id: string;
	name: string;
}

interface StepCompetenciesProps {
	competencies: CompetencyItem[];
	onChange: (competencies: CompetencyItem[]) => void;
}

let nextId = 0;
export function createCompetencyItem(name: string): CompetencyItem {
	return { id: `c-${Date.now()}-${nextId++}`, name };
}

export function StepCompetencies({ competencies, onChange }: StepCompetenciesProps) {
	const updateItem = (id: string, value: string) => {
		onChange(competencies.map((c) => (c.id === id ? { ...c, name: value } : c)));
	};

	const removeItem = (id: string) => {
		onChange(competencies.filter((c) => c.id !== id));
	};

	const addItem = () => {
		onChange([...competencies, createCompetencyItem("")]);
	};

	const filledCount = competencies.filter((c) => c.name.trim() !== "").length;

	return (
		<div className="space-y-4">
			<div className="ob-competency-scroll max-h-[340px] overflow-y-auto pr-1">
				<div className="space-y-2">
					{competencies.map((item) => (
						<div
							key={item.id}
							className="flex items-center gap-2.5 animate-in slide-in-from-left-2 duration-200"
						>
							<Input
								value={item.name}
								onChange={(e) => updateItem(item.id, e.target.value)}
								placeholder="Nazwa kompetencji..."
								className="flex-1"
							/>
							<button
								type="button"
								onClick={() => removeItem(item.id)}
								className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/8 text-destructive transition-all hover:bg-destructive/15 hover:scale-105"
								title="Usuń"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
					))}
				</div>
			</div>

			<div className="text-right font-mono text-xs text-muted-foreground">
				<span className="font-bold text-[#6366F1]">{filledCount}</span> / 40 kompetencji
			</div>

			<button
				type="button"
				onClick={addItem}
				className="flex w-full items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed border-[#6366F1]/20 bg-[#6366F1]/[0.03] px-4 py-3 text-sm font-medium text-[#6366F1] transition-all hover:border-[#6366F1] hover:bg-[#6366F1]/[0.06]"
			>
				<Plus className="h-4 w-4" />
				Dodaj kompetencję
			</button>
		</div>
	);
}
