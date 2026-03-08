"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";

export function SignupForm() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		const { error: authError } = await authClient.signUp.email({ email, password, name });

		if (authError) {
			setError(authError.message || "Nie udało się utworzyć konta");
			setLoading(false);
			return;
		}

		router.push("/dashboard");
	};

	return (
		<form onSubmit={handleSubmit} className="auth-form">
			<div className="auth-field">
				<label htmlFor="name" className="auth-label">
					Imię i nazwisko
				</label>
				<input
					id="name"
					type="text"
					className="auth-input"
					placeholder="Jan Kowalski"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>
			</div>

			<div className="auth-field">
				<label htmlFor="email" className="auth-label">
					Email
				</label>
				<input
					id="email"
					type="email"
					className="auth-input"
					placeholder="twoj@email.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
			</div>

			<div className="auth-field">
				<label htmlFor="password" className="auth-label">
					Hasło
				</label>
				<input
					id="password"
					type="password"
					className="auth-input"
					placeholder="Minimum 8 znaków"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					minLength={8}
				/>
			</div>

			{error && <p className="auth-error">{error}</p>}

			<button type="submit" className="auth-btn-primary" disabled={loading}>
				{loading ? "Tworzenie konta..." : "Utwórz konto"}
			</button>
		</form>
	);
}
