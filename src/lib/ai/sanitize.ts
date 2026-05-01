/**
 * Prepare untrusted user input for inclusion in an LLM prompt.
 *
 * Strips control characters (which can confuse delimiter parsing or smuggle
 * instructions across lines), collapses to a length cap, and trims whitespace.
 * Always wrap the result in an explicit `<user_input untrusted="true">` block
 * in the prompt and instruct the model to ignore instructions inside.
 */
export function sanitizeForPrompt(input: string | null | undefined, maxLen = 2000): string {
	if (!input) return "";
	let out = "";
	for (const ch of input) {
		const code = ch.charCodeAt(0);
		out += code < 0x20 || code === 0x7f ? " " : ch;
	}
	return out.slice(0, maxLen).trim();
}

const ALLOWED_REPO_HOSTS = new Set(["github.com"]);
const ALLOWED_NOTEBOOK_HOSTS = new Set([
	"colab.research.google.com",
	"www.kaggle.com",
	"kaggle.com",
	"github.com",
	"nbviewer.org",
	"nbviewer.jupyter.org",
]);

export type ParsedUrl = { url: URL; raw: string };

export function parseAllowedUrl(
	raw: string | null | undefined,
	allowed: Set<string>,
): ParsedUrl | null {
	if (!raw) return null;
	let url: URL;
	try {
		url = new URL(raw);
	} catch {
		return null;
	}
	if (url.protocol !== "https:") return null;
	if (!allowed.has(url.hostname)) return null;
	return { url, raw };
}

export function parseRepoUrl(raw: string | null | undefined): ParsedUrl | null {
	return parseAllowedUrl(raw, ALLOWED_REPO_HOSTS);
}

export function parseNotebookUrl(raw: string | null | undefined): ParsedUrl | null {
	return parseAllowedUrl(raw, ALLOWED_NOTEBOOK_HOSTS);
}
