import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const nunito = Nunito({
	variable: "--font-nunito",
	subsets: ["latin", "latin-ext"],
	weight: ["400", "600", "700", "800", "900"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "SkillBridge — Twój Paszport Kompetencji",
	description: "Platforma AI mapująca kompetencje studentów na wymagania rynku pracy.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pl" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} antialiased`}
			>
				<AuthProvider>{children}</AuthProvider>
				<Toaster />
			</body>
		</html>
	);
}
