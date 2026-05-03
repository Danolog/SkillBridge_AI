import Link from "next/link";
import { GoogleButton } from "@/components/auth/google-button";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
	return (
		<>
			<h1 className="auth-title">Utwórz konto</h1>
			<p className="auth-subtitle">Dołącz do SkillBridge</p>

			<GoogleButton />

			<div className="auth-divider">
				<span>lub</span>
			</div>

			<SignupForm />

			<p className="auth-footer-text">
				Masz już konto?{" "}
				<Link href="/login" className="auth-link">
					Zaloguj się
				</Link>
			</p>
		</>
	);
}
