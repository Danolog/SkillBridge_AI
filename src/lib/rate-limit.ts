import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasUpstashConfig = Boolean(
	process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

const redis = hasUpstashConfig ? Redis.fromEnv() : null;

function makeLimiter(limiter: ReturnType<typeof Ratelimit.slidingWindow>, prefix: string) {
	if (!redis) return null;
	return new Ratelimit({
		redis,
		limiter,
		analytics: false,
		prefix: `skillbridge:${prefix}`,
	});
}

export const rateLimiters = {
	facultyLogin: makeLimiter(Ratelimit.slidingWindow(5, "15 m"), "faculty-login"),
	aiHeavy: makeLimiter(Ratelimit.slidingWindow(5, "1 m"), "ai-heavy"),
	aiLight: makeLimiter(Ratelimit.slidingWindow(30, "1 m"), "ai-light"),
};

export type RateLimitResult = {
	success: boolean;
	reset: number;
	remaining: number;
};

export async function applyRateLimit(
	limiter: Ratelimit | null,
	key: string,
): Promise<RateLimitResult> {
	if (!limiter) {
		return { success: true, reset: 0, remaining: Number.MAX_SAFE_INTEGER };
	}
	const { success, reset, remaining } = await limiter.limit(key);
	return { success, reset, remaining };
}

export function getClientIp(req: Request): string {
	const forwarded = req.headers.get("x-forwarded-for");
	if (forwarded) {
		const first = forwarded.split(",")[0]?.trim();
		if (first) return first;
	}
	return req.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimitResponse(reset: number): Response {
	const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
	return new Response(JSON.stringify({ error: "Too many requests" }), {
		status: 429,
		headers: {
			"content-type": "application/json",
			"retry-after": String(retryAfter),
		},
	});
}
