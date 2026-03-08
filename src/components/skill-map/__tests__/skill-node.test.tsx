// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SkillNode } from "../skill-node";

// Mock @xyflow/react Handle since we're rendering outside ReactFlow context
vi.mock("@xyflow/react", () => ({
	Handle: () => null,
	Position: { Top: "top", Bottom: "bottom" },
}));

function renderNode(data: {
	label: string;
	status: "acquired" | "in_progress" | "missing";
	marketPercentage?: number;
}) {
	// NodeProps requires id, type, and other fields — we provide minimal stubs
	const props = {
		id: "test-1",
		type: "skillNode" as const,
		data,
		selected: false,
		isConnectable: true,
		zIndex: 0,
		positionAbsoluteX: 0,
		positionAbsoluteY: 0,
	};

	return render(<SkillNode {...(props as Parameters<typeof SkillNode>[0])} />);
}

describe("SkillNode", () => {
	it("renders node label", () => {
		renderNode({ label: "React", status: "acquired" });
		expect(screen.getByText("React")).toBeDefined();
	});

	it("shows 'Masz' for acquired status", () => {
		renderNode({ label: "Python", status: "acquired" });
		expect(screen.getByText("Masz")).toBeDefined();
	});

	it("shows 'W trakcie' for in_progress status", () => {
		renderNode({ label: "TypeScript", status: "in_progress" });
		expect(screen.getByText("W trakcie")).toBeDefined();
	});

	it("shows 'Brakuje' for missing status", () => {
		renderNode({ label: "Docker", status: "missing" });
		expect(screen.getByText("Brakuje")).toBeDefined();
	});

	it("shows market percentage when provided", () => {
		renderNode({ label: "Node.js", status: "missing", marketPercentage: 68 });
		expect(screen.getByText("68% ofert")).toBeDefined();
	});

	it("does not show market percentage when not provided", () => {
		renderNode({ label: "Git", status: "acquired" });
		expect(screen.queryByText(/% ofert/)).toBeNull();
	});

	it("applies selected ring when selected", () => {
		const props = {
			id: "test-1",
			type: "skillNode" as const,
			data: { label: "React", status: "acquired" as const },
			selected: true,
			isConnectable: true,
			zIndex: 0,
			positionAbsoluteX: 0,
			positionAbsoluteY: 0,
		};
		const { container } = render(<SkillNode {...(props as Parameters<typeof SkillNode>[0])} />);
		const node = container.firstChild as HTMLElement;
		expect(node.className).toContain("ring-2");
	});
});
