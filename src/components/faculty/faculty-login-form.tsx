"use client";

import { GraduationCap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
		<div className="w-full max-w-sm mx-auto">
			<div className="text-center mb-8">
				<div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
					<GraduationCap className="w-6 h-6 text-primary" />
				</div>
				<h1 className="text-2xl font-bold">Panel Uczelni</h1>
				<p className="text-muted-foreground mt-1">SkillBridge AI</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="password">Hasło dostępu</Label>
					<Input
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Wprowadź hasło"
						required
						autoFocus
					/>
				</div>

				{error && <p className="text-sm text-destructive font-medium">{error}</p>}

				<Button type="submit" className="w-full" disabled={loading}>
					{loading ? (
						<>
							<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							Logowanie...
						</>
					) : (
						"Zaloguj się"
					)}
				</Button>
			</form>
		</div>
	);
}
