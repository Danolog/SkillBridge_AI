import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { password } = await req.json();
	if (password !== process.env.FACULTY_PASSWORD) {
		return NextResponse.json({ error: "Nieprawidłowe hasło" }, { status: 401 });
	}
	const response = NextResponse.json({ success: true });
	response.cookies.set("faculty_session", "authenticated", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 60 * 60 * 8,
		path: "/",
	});
	return response;
}
