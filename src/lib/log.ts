/**
 * Strukturalny logger błędów — loguje tylko message + name, nigdy raw error object.
 *
 * Powód: Anthropic SDK error objects zawierają oryginalny prompt (z PII użytkownika
 * — sylabus, cel kariery, nazwiska). Trafiają na Vercel runtime logs, dostępne
 * dla każdego z project tokenem. Surowy log = wyciek PII / GDPR issue.
 *
 * Użycie:
 *   try { ... } catch (err) {
 *     logError("onboarding", err, { studentId });
 *     return NextResponse.json(...);
 *   }
 */
export function logError(
	scope: string,
	err: unknown,
	ctx: Record<string, string | number | undefined> = {},
): void {
	const message = err instanceof Error ? err.message : String(err);
	const name = err instanceof Error ? err.name : undefined;
	console.error(`[${scope}]`, { ...ctx, name, message });
}
