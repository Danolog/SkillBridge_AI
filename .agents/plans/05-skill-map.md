# Feature: Skill Map (React Flow)

Read `00-master-roadmap.md`, `01-database-schema.md`, `04-dashboard-layout.md` before implementing.
**Requires Features 01, 03, 04.**

## Feature Description

Interactive competency visualization using React Flow (`@xyflow/react`). Nodes colored by status (green=acquired, yellow=in_progress, red=missing). Clicking a node opens a side panel with details. "Zamknij tę lukę" button leads to micro-course generation.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: `src/app/(dashboard)/skill-map/`, `src/components/skill-map/`
**Dependencies**: Features 01, 03, 04. Requires `skillMaps` table data (generated during onboarding).

---

## CONTEXT REFERENCES

### External Packages to Install FIRST

```bash
pnpm add @xyflow/react
```

**@xyflow/react docs**: https://reactflow.dev/api-reference
- Custom nodes: https://reactflow.dev/learn/customization/custom-nodes
- Controls + MiniMap: `import { Controls, MiniMap } from "@xyflow/react"`
- CSS: `import "@xyflow/react/dist/style.css"`

### Files to Read Before Implementing

- `src/lib/db/schema.ts` — `skillMaps` table (`nodes: jsonb`, `edges: jsonb`)
- `src/app/(dashboard)/dashboard/page.tsx` — server component pattern with auth + DB query
- `src/components/ui/card.tsx`, `button.tsx`, `separator.tsx`
- `00-master-roadmap.md` — shared auth check pattern

### New Files to Create

- `src/app/(dashboard)/skill-map/page.tsx` — server component
- `src/app/api/skill-map/route.ts` — GET endpoint
- `src/components/skill-map/skill-map-view.tsx` — "use client" React Flow wrapper
- `src/components/skill-map/skill-node.tsx` — custom node component
- `src/components/skill-map/node-detail-panel.tsx` — side panel

### Data Shape for Nodes/Edges

```typescript
// Node stored in DB (jsonb)
type SkillNode = {
	id: string;
	type: "skillNode";
	position: { x: number; y: number };
	data: {
		label: string;          // competency name
		status: "acquired" | "in_progress" | "missing";
		marketPercentage?: number;
		category?: string;
	};
};

// Edge stored in DB (jsonb)
type SkillEdge = {
	id: string;
	source: string;
	target: string;
	animated?: boolean;
};
```

---

## IMPLEMENTATION PLAN

### Phase 1: Install Package and API

**Install**: `pnpm add @xyflow/react`

**`src/app/api/skill-map/route.ts`** (GET):
```typescript
// Auth check → get student → get skillMap from DB
// If no skillMap: trigger regeneration and return 202
// Return: { nodes: SkillNode[], edges: SkillEdge[] }
```

If skill map is not yet generated (background job from onboarding didn't finish):
- Return `{ generating: true }` with status 202
- Frontend shows skeleton loader

### Phase 2: Custom Node Component

**`src/components/skill-map/skill-node.tsx`** — "use client":
```typescript
import { Handle, Position, type NodeProps } from "@xyflow/react";

const STATUS_COLORS = {
	acquired: "bg-green-500 border-green-600",
	in_progress: "bg-yellow-400 border-yellow-500",
	missing: "bg-red-500 border-red-600",
};

const STATUS_LABELS = {
	acquired: "Masz",
	in_progress: "W trakcie",
	missing: "Brakuje",
};

export function SkillNode({ data, selected }: NodeProps) {
	return (
		<div className={`px-3 py-2 rounded-lg border-2 text-white text-sm font-medium min-w-[120px] text-center cursor-pointer ${STATUS_COLORS[data.status]} ${selected ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}>
			<Handle type="target" position={Position.Top} className="opacity-0" />
			<div>{data.label}</div>
			<div className="text-xs opacity-80 mt-1">{STATUS_LABELS[data.status]}</div>
			{data.marketPercentage && (
				<div className="text-xs opacity-70">{data.marketPercentage}% ofert</div>
			)}
			<Handle type="source" position={Position.Bottom} className="opacity-0" />
		</div>
	);
}
```

### Phase 3: Side Panel

**`src/components/skill-map/node-detail-panel.tsx`** — "use client":

Shows when a node is selected:
- Competency name (large)
- Status badge
- Market percentage
- "Zamknij tę lukę" button (only for `missing` status) → links to `/micro-courses?generate=[competencyName]`
- Close button (X)

### Phase 4: Main View

**`src/components/skill-map/skill-map-view.tsx`** — "use client":
```typescript
"use client";
import { ReactFlow, Controls, MiniMap, Background, useNodesState, useEdgesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SkillNode } from "./skill-node";
import { NodeDetailPanel } from "./node-detail-panel";

const nodeTypes = { skillNode: SkillNode };

export function SkillMapView({ nodes: initialNodes, edges: initialEdges }: Props) {
	const [nodes, , onNodesChange] = useNodesState(initialNodes);
	const [edges, , onEdgesChange] = useEdgesState(initialEdges);
	const [selectedNode, setSelectedNode] = useState(null);

	return (
		<div className="relative w-full h-[calc(100vh-140px)]">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onNodeClick={(_, node) => setSelectedNode(node)}
				fitView
			>
				<Controls />
				<MiniMap />
				<Background />
			</ReactFlow>
			{selectedNode && (
				<NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
			)}
			{/* Legend */}
			<div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-md text-sm flex gap-4">
				<span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" />Masz</span>
				<span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-400" />W trakcie</span>
				<span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" />Brakuje</span>
			</div>
		</div>
	);
}
```

### Phase 5: Page Component

**`src/app/(dashboard)/skill-map/page.tsx`** — server component:
- Auth check
- Fetch skill map from DB
- If not generated: show loading state with "Generujemy Twoją Skill Map…"
- Render `<SkillMapView>`

### Phase 6: Skill Map Generation (if not done in Feature 03)

**`src/lib/ai/generate-skill-map.ts`** — generates nodes/edges from competencies:

```typescript
// Algorithm:
// 1. Get student competencies from DB
// 2. Get job market data for career goal
// 3. Create nodes for each competency (acquired/missing)
// 4. Use AI to determine relationships between competencies
// 5. Position nodes: acquired on left, missing on right, in_progress in middle
// 6. Save to skill_maps table

// Node positions: use a simple grid layout
// Acquired: x=0-300, Missing: x=400-700, use y incrementing by 100
```

---

## STEP-BY-STEP TASKS

### TASK 1: INSTALL `@xyflow/react`
- **RUN**: `pnpm add @xyflow/react`
- **VALIDATE**: `pnpm build`

### TASK 2: CREATE `src/lib/ai/generate-skill-map.ts`
- **IMPLEMENT** node generation from competencies
- **IMPLEMENT** simple grid positioning (no AI needed for layout)
- **IMPLEMENT** edge generation: use AI to find 5-10 key relationships
- **IMPLEMENT** save to `skillMaps` table
- **VALIDATE**: `pnpm build`

### TASK 3: CREATE `src/app/api/skill-map/route.ts`
- **IMPLEMENT** GET with auth + student lookup
- **IMPLEMENT** skillMap fetch from DB
- **IMPLEMENT** if not exists: call generateSkillMap() and return
- **VALIDATE**: `curl -X GET http://localhost:3000/api/skill-map` (with auth cookie)

### TASK 4: CREATE `src/components/skill-map/skill-node.tsx`
- **IMPLEMENT** custom React Flow node with status colors
- **GOTCHA**: Must import `Handle` from `@xyflow/react`
- **VALIDATE**: `pnpm build`

### TASK 5: CREATE `src/components/skill-map/node-detail-panel.tsx`
- **IMPLEMENT** side panel with competency details
- **IMPLEMENT** "Zamknij tę lukę" link for missing nodes
- **VALIDATE**: `pnpm build`

### TASK 6: CREATE `src/components/skill-map/skill-map-view.tsx`
- **IMPLEMENT** ReactFlow with custom nodeTypes
- **IMPLEMENT** node click → side panel
- **IMPLEMENT** legend overlay
- **GOTCHA**: `import "@xyflow/react/dist/style.css"` MUST be imported
- **GOTCHA**: Parent container must have explicit height (use `h-[calc(100vh-140px)]`)
- **VALIDATE**: `pnpm build`

### TASK 7: CREATE `src/app/(dashboard)/skill-map/page.tsx`
- **IMPLEMENT** server component with auth + DB fetch
- **IMPLEMENT** loading state skeleton when map not generated
- **VALIDATE**: `pnpm build`, then open `/skill-map` in browser

---

## VALIDATION COMMANDS

```bash
pnpm add @xyflow/react
pnpm build
pnpm lint
# Manual:
# 1. Complete onboarding with syllabus
# 2. Navigate to /skill-map
# 3. Verify nodes render with correct colors
# 4. Click a node → verify side panel opens
# 5. Click "Zamknij tę lukę" on red node → goes to /micro-courses
# 6. Zoom/pan the graph — verify smooth interaction
# 7. Verify minimap shows in corner
```

## ACCEPTANCE CRITERIA

- [ ] React Flow renders with competency nodes
- [ ] Green nodes = acquired, yellow = in_progress, red = missing
- [ ] Click on node opens side panel with details
- [ ] "Zamknij tę lukę" button visible on missing nodes
- [ ] Controls (zoom, fit), MiniMap visible
- [ ] Legend visible in corner
- [ ] Loading skeleton shown when map is generating
- [ ] Responsive: works on mobile (scrollable/scalable)
- [ ] `pnpm build` passes
