"use client";

import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";

const STATUS_COLORS = {
	acquired: "bg-emerald-500/12 border-emerald-500/40 shadow-[0_2px_12px_rgba(16,185,129,0.15)]",
	in_progress: "bg-amber-400/12 border-amber-400/40 shadow-[0_2px_12px_rgba(245,158,11,0.15)]",
	missing: "bg-red-500/12 border-red-500/40 shadow-[0_2px_12px_rgba(239,68,68,0.15)]",
} as const;

const STATUS_COLORS_HOVER = {
	acquired: "hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] hover:border-emerald-500/70",
	in_progress: "hover:shadow-[0_4px_24px_rgba(245,158,11,0.3)] hover:border-amber-400/70",
	missing: "hover:shadow-[0_4px_24px_rgba(239,68,68,0.3)] hover:border-red-500/70",
} as const;

const STATUS_LABELS: Record<string, string> = {
	acquired: "Masz",
	in_progress: "W trakcie",
	missing: "Brakuje",
};

const STATUS_TEXT_COLORS: Record<string, string> = {
	acquired: "text-emerald-600",
	in_progress: "text-amber-500",
	missing: "text-red-500",
};

export type SkillNodeData = {
	label: string;
	status: "acquired" | "in_progress" | "missing";
	marketPercentage?: number;
	category?: string;
};

export type SkillNodeType = Node<SkillNodeData, "skillNode">;

export function SkillNode({ data, selected }: NodeProps<SkillNodeType>) {
	const status = data.status || "acquired";

	return (
		<div
			className={`px-4 py-3 rounded-2xl border-2 min-w-[140px] max-w-[180px] text-center cursor-pointer backdrop-blur-sm transition-all duration-200 ${STATUS_COLORS[status]} ${STATUS_COLORS_HOVER[status]} ${selected ? "ring-2 ring-offset-2 ring-indigo-500 scale-105" : ""}`}
		>
			<Handle type="target" position={Position.Top} className="!opacity-0 !w-2 !h-2" />
			<div className="font-[Nunito] font-bold text-[13px] text-slate-900 leading-tight mb-1">
				{data.label}
			</div>
			<div
				className={`text-[11px] font-semibold uppercase tracking-wide ${STATUS_TEXT_COLORS[status]}`}
			>
				{STATUS_LABELS[status]}
			</div>
			{data.marketPercentage != null && (
				<div className="font-mono text-[11px] text-slate-400 mt-0.5">
					{data.marketPercentage}% ofert
				</div>
			)}
			<Handle type="source" position={Position.Bottom} className="!opacity-0 !w-2 !h-2" />
		</div>
	);
}
