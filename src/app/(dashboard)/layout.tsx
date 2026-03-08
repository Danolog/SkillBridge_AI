import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { auth } from "@/lib/auth/server";

export default async function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/login");

	return (
		<div className="db-shell">
			<Sidebar user={session.user} />
			<main className="db-main">{children}</main>
		</div>
	);
}
