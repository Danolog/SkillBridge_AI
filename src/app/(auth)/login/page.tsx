import Link from "next/link";
import { GoogleButton } from "@/components/auth/google-button";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
	return (
		<>
			<h1 className="auth-title">Witaj ponownie</h1>
			<p className="auth-subtitle">Zaloguj się na swoje konto</p>

			<GoogleButton />

			<div className="auth-divider">
				<span>lub</span>
			</div>

			<LoginForm />

			<p className="auth-footer-text">
				Nie masz konta?{" "}
				<Link href="/signup" className="auth-link">
					Zarejestruj się
				</Link>
			</p>
		</>
	);
}
