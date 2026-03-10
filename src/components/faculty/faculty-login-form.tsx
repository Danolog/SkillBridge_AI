"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function FacultyLoginForm() {
	const router = useRouter();
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const res = await fetch("/api/faculty/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password }),
			});

			if (!res.ok) {
				setError("Nieprawidłowe hasło");
				return;
			}

			router.push("/faculty");
		} catch {
			setError("Błąd połączenia. Spróbuj ponownie.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<h1 className="auth-title">Panel Uczelni</h1>
			<p className="auth-subtitle">Dostęp dla kadry dydaktycznej</p>

			<form onSubmit={handleSubmit} className="auth-form">
				<div className="auth-field">
					<label htmlFor="password" className="auth-label">
						Hasło dostępu
					</label>
					<input
						id="password"
						type="password"
						className="auth-input"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Wprowadź hasło"
						required
					/>
				</div>

				{error && <p className="auth-error">{error}</p>}

				<button type="submit" className="auth-btn-primary" disabled={loading}>
					{loading ? (
						<span
							style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
						>
							<Loader2 size={16} className="animate-spin" />
							Logowanie...
						</span>
					) : (
						"Zaloguj się"
					)}
				</button>
			</form>
		</>
	);
}
