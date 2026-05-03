import { BrainCircuit } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="auth-page">
			{/* Background effects */}
			<div className="auth-dot-grid" />
			<div className="auth-blob auth-blob-1" />
			<div className="auth-blob auth-blob-2" />

			{/* Logo */}
			<Link href="/" className="auth-logo">
				<div className="auth-logo-icon">
					<BrainCircuit size={20} strokeWidth={1.8} />
				</div>
				<span className="auth-logo-text">SkillBridge</span>
			</Link>

			{/* Card */}
			<div className="auth-card">{children}</div>
		</div>
	);
}
