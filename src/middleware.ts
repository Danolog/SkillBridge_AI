import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	const sessionCookie = request.cookies.get("better-auth.session_token");

	if (!sessionCookie) {
		const loginUrl = new URL("/login", request.url);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/onboarding/:path*"],
};
