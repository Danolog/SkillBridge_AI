import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("rate-limit graceful degradation", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("applyRateLimit returns success=true when Upstash env vars are missing", async () => {
		vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
		vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

		const { applyRateLimit, rateLimiters } = await import("../rate-limit");

		expect(rateLimiters.facultyLogin).toBeNull();
		expect(rateLimiters.aiHeavy).toBeNull();
		expect(rateLimiters.aiLight).toBeNull();

		const result = await applyRateLimit(rateLimiters.facultyLogin, "anykey");
		expect(result.success).toBe(true);
		expect(result.remaining).toBe(Number.MAX_SAFE_INTEGER);
	});

	it("applyRateLimit forwards to limiter when configured", async () => {
		const fakeLimiter = {
			limit: vi.fn().mockResolvedValue({ success: false, reset: 12345, remaining: 0 }),
		} as unknown as Parameters<typeof import("../rate-limit").applyRateLimit>[0];

		const { applyRateLimit } = await import("../rate-limit");
		const result = await applyRateLimit(fakeLimiter, "ip:1.2.3.4");

		expect(fakeLimiter?.limit).toHaveBeenCalledWith("ip:1.2.3.4");
		expect(result.success).toBe(false);
		expect(result.reset).toBe(12345);
		expect(result.remaining).toBe(0);
	});
});

describe("getClientIp", () => {
	it("returns first IP from x-forwarded-for", async () => {
		const { getClientIp } = await import("../rate-limit");
		const req = new Request("http://example.com", {
			headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1, 192.168.0.1" },
		});
		expect(getClientIp(req)).toBe("203.0.113.5");
	});

	it("trims whitespace from x-forwarded-for", async () => {
		const { getClientIp } = await import("../rate-limit");
		const req = new Request("http://example.com", {
			headers: { "x-forwarded-for": "  203.0.113.5  ,  10.0.0.1" },
		});
		expect(getClientIp(req)).toBe("203.0.113.5");
	});

	it("falls back to x-real-ip when x-forwarded-for missing", async () => {
		const { getClientIp } = await import("../rate-limit");
		const req = new Request("http://example.com", {
			headers: { "x-real-ip": "203.0.113.7" },
		});
		expect(getClientIp(req)).toBe("203.0.113.7");
	});

	it("returns 'unknown' when both headers missing", async () => {
		const { getClientIp } = await import("../rate-limit");
		const req = new Request("http://example.com");
		expect(getClientIp(req)).toBe("unknown");
	});
});

describe("rateLimitResponse", () => {
	it("returns 429 with Retry-After header", async () => {
		const { rateLimitResponse } = await import("../rate-limit");
		const reset = Date.now() + 30_000;
		const res = rateLimitResponse(reset);

		expect(res.status).toBe(429);
		const retryAfter = res.headers.get("retry-after");
		expect(retryAfter).toBeTruthy();
		expect(Number(retryAfter)).toBeGreaterThanOrEqual(29);
		expect(Number(retryAfter)).toBeLessThanOrEqual(31);

		const body = await res.json();
		expect(body).toEqual({ error: "Too many requests" });
	});

	it("clamps Retry-After to minimum 1 second when reset is in the past", async () => {
		const { rateLimitResponse } = await import("../rate-limit");
		const res = rateLimitResponse(Date.now() - 60_000);
		expect(res.headers.get("retry-after")).toBe("1");
	});
});
