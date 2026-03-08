import { NextResponse } from "next/server";

export async function POST() {
	const response = NextResponse.json({ success: true });
	response.cookies.delete("faculty_session");
	return response;
}
