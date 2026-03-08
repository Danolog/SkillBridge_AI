import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";

export default async function OnboardingPage() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/login");

	// If already onboarded, redirect to dashboard
	const student = await db.query.students.findFirst({
		where: eq(students.userId, session.user.id),
	});
	if (student?.onboardingCompleted) redirect("/dashboard");

	return <OnboardingWizard user={session.user} />;
}
