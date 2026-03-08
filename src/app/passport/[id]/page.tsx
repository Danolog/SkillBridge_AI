import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PassportPublic } from "@/components/passport/passport-public";
import type { PassportData } from "@/components/passport/passport-view";
import { db } from "@/lib/db";
import { competencies, passports, students, user } from "@/lib/db/schema";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	const passport = await db.query.passports.findFirst({
		where: eq(passports.id, id),
	});

	if (!passport) {
		return { title: "Paszport nie znaleziony" };
	}

	const student = await db.query.students.findFirst({
		where: eq(students.id, passport.studentId),
	});
	const studentUser = student
		? await db.query.user.findFirst({ where: eq(user.id, student.userId) })
		: null;

	return {
		title: `Paszport Kompetencji — ${studentUser?.name ?? "Student"} | SkillBridge AI`,
		description: `Paszport kompetencji: ${student?.careerGoal ?? ""}. Pokrycie rynkowe: ${passport.marketCoveragePercent}%`,
	};
}

export default async function PublicPassportPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const passport = await db.query.passports.findFirst({
		where: eq(passports.id, id),
	});
	if (!passport) notFound();

	const student = await db.query.students.findFirst({
		where: eq(students.id, passport.studentId),
	});
	if (!student) notFound();

	const studentUser = await db.query.user.findFirst({
		where: eq(user.id, student.userId),
	});

	const studentCompetencies = await db.query.competencies.findMany({
		where: eq(competencies.studentId, student.id),
	});

	const data: PassportData = {
		id: passport.id,
		student: {
			name: studentUser?.name ?? "Student",
			university: student.university,
			fieldOfStudy: student.fieldOfStudy,
			semester: student.semester,
			careerGoal: student.careerGoal,
		},
		marketCoveragePercent: passport.marketCoveragePercent,
		competencies: studentCompetencies.map((c) => ({
			name: c.name,
			status: c.status,
			marketPercentage: c.marketPercentage,
		})),
		generatedAt: passport.updatedAt.toISOString(),
	};

	return <PassportPublic data={data} />;
}
