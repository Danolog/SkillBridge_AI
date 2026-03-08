import { Check, Clock, X } from "lucide-react";

type CompetencyStatus = "acquired" | "in_progress" | "missing";

interface CompetencyBadgeProps {
	name: string;
	status: CompetencyStatus;
	marketPercentage?: number | null;
}

const STATUS_CONFIG = {
	acquired: {
		label: "Masz",
		cardClass: "pp-comp-card acquired",
		iconClass: "pp-comp-status-icon acquired",
		Icon: Check,
	},
	in_progress: {
		label: "W trakcie",
		cardClass: "pp-comp-card in-progress",
		iconClass: "pp-comp-status-icon in-progress",
		Icon: Clock,
	},
	missing: {
		label: "Brakuje",
		cardClass: "pp-comp-card missing",
		iconClass: "pp-comp-status-icon missing",
		Icon: X,
	},
} as const;

function getLevelLabel(marketPercentage?: number | null): {
	label: string;
	className: string;
} {
	if (marketPercentage == null) return { label: "Podstawowy", className: "pp-level-badge basic" };
	if (marketPercentage >= 80)
		return { label: "Zaawansowany", className: "pp-level-badge advanced" };
	if (marketPercentage >= 50) return { label: "Sredni", className: "pp-level-badge intermediate" };
	return { label: "Podstawowy", className: "pp-level-badge basic" };
}

export function CompetencyCard({ name, status, marketPercentage }: CompetencyBadgeProps) {
	const config = STATUS_CONFIG[status];
	const level = getLevelLabel(marketPercentage);

	return (
		<div className={config.cardClass}>
			<div className="pp-comp-card-top">
				<div className="pp-comp-card-name">{name}</div>
				<div className={config.iconClass}>
					<config.Icon size={14} />
				</div>
			</div>
			<div className="pp-comp-card-meta">
				<span className={level.className}>{level.label}</span>
				{marketPercentage != null && (
					<div className="pp-demand-bar">
						<div className="pp-demand-track">
							<div className="pp-demand-fill" style={{ width: `${marketPercentage}%` }} />
						</div>
						<span className="pp-demand-label">{marketPercentage}%</span>
						<span>popyt</span>
					</div>
				)}
			</div>
		</div>
	);
}
