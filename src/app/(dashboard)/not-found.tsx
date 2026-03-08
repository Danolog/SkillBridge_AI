import Link from "next/link";

export default function DashboardNotFound() {
	return (
		<div className="db-not-found">
			<div className="db-not-found-icon">404</div>
			<h1 className="db-not-found-title">Strona nie została znaleziona</h1>
			<p className="db-not-found-text">Ta strona nie istnieje lub jest w trakcie budowy.</p>
			<Link href="/dashboard" className="db-not-found-link">
				Wróć do Dashboard
			</Link>
		</div>
	);
}
