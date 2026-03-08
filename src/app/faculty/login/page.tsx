import { BrainCircuit } from "lucide-react";
import Link from "next/link";
import { FacultyLoginForm } from "@/components/faculty/faculty-login-form";

export default function FacultyLoginPage() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
			<Link
				href="/"
				className="flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors"
			>
				<BrainCircuit size={20} strokeWidth={1.8} />
				<span className="font-medium">SkillBridge AI</span>
			</Link>

			<div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
				<FacultyLoginForm />
			</div>
		</div>
	);
}
