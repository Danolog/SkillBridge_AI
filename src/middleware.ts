import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	const allCookies = request.cookies.getAll();
	const sessionCookie = allCookies.find((c) => c.name.includes("better-auth.session_token"));

	if (!sessionCookie?.value) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/dashboard/:path*",
		"/onboarding/:path*",
		"/skill-map/:path*",
		"/gap-analysis/:path*",
		"/micro-courses/:path*",
		"/projects/:path*",
		"/passport",
		"/profil/:path*",
	],
};
