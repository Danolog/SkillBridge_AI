import { cookies } from "next/headers";

export async function checkFacultyAuth(): Promise<boolean> {
	const cookieStore = await cookies();
	return cookieStore.get("faculty_session")?.value === "authenticated";
}
