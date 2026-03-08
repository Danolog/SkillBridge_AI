import { redirect } from "next/navigation";
import { FacultyDashboard } from "@/components/faculty/faculty-dashboard";
import { checkFacultyAuth } from "@/lib/faculty-auth";

export default async function FacultyPage() {
	const isAuth = await checkFacultyAuth();
	if (!isAuth) redirect("/faculty/login");

	return <FacultyDashboard />;
}
