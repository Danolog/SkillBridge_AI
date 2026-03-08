"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface Step {
	title: string;
	content: string;
	exercise?: string;
}

interface StepAccordionProps {
	steps: Step[];
}

export function StepAccordion({ steps }: StepAccordionProps) {
	const [openIndex, setOpenIndex] = useState(0);

	return (
		<div className="mc-steps">
			{steps.map((step, i) => {
				const isOpen = openIndex === i;
				return (
					<div key={step.title} className={`mc-step ${isOpen ? "open" : ""}`}>
						<button
							type="button"
							className="mc-step-header"
							onClick={() => setOpenIndex(isOpen ? -1 : i)}
						>
							<div className="mc-step-number">{i + 1}</div>
							<div className="mc-step-title">{step.title}</div>
							<ChevronDown size={20} className="mc-step-chevron" />
						</button>
						{isOpen && (
							<div className="mc-step-body">
								<div className="mc-step-content">
									<ReactMarkdown>{step.content}</ReactMarkdown>
								</div>
								{step.exercise && (
									<div className="mc-step-exercise">
										<div className="mc-step-exercise-label">Ćwiczenie</div>
										<div className="mc-step-exercise-text">{step.exercise}</div>
									</div>
								)}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
