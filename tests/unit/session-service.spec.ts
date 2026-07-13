import { beforeEach, describe, expect, it, vi } from "vitest";

// --- mocks ---
const refreshMock = vi.fn();
vi.mock("@/modules/aut-module", () => ({
	default: { getInstance: () => ({ refresh: refreshMock }) },
}));

vi.mock("@/services/token-store", () => ({
	getTokenSync: vi.fn(),
	hydrateTokenStore: vi.fn(async () => undefined),
	clearToken: vi.fn(async () => undefined),
}));

// Silence the shim logger.
vi.mock("@/shared/bizcheckmobile", () => ({
	BizCheckMobileLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), log: vi.fn() },
	BizCheckMobileProperties: { get: vi.fn(), set: vi.fn(), remove: vi.fn() },
}));

import { clearToken, getTokenSync } from "@/services/token-store";
import { ensureAuthenticated } from "@/services/session-service";

/** Build a JWT whose exp is `offsetSeconds` from now. */
function makeJwt(offsetSeconds: number): string {
	const header = btoa(JSON.stringify({ alg: "HS256" }));
	const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + offsetSeconds }));
	return `${header}.${payload}.sig`;
}

describe("session-service.ensureAuthenticated", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns false when there is no token", async () => {
		(getTokenSync as any).mockReturnValue(null);
		expect(await ensureAuthenticated()).toBe(false);
	});

	it("returns true for a still-valid access token without refreshing", async () => {
		(getTokenSync as any).mockReturnValue({ accessToken: makeJwt(3600), refreshToken: "r1" });
		expect(await ensureAuthenticated()).toBe(true);
		expect(refreshMock).not.toHaveBeenCalled();
	});

	it("silently refreshes an expired access token when a refresh token exists", async () => {
		(getTokenSync as any).mockReturnValue({ accessToken: makeJwt(-10), refreshToken: "r1" });
		refreshMock.mockImplementation((opts: any) => opts.onSuccess());
		expect(await ensureAuthenticated()).toBe(true);
		expect(refreshMock).toHaveBeenCalledOnce();
	});

	it("clears the session and returns false when refresh fails", async () => {
		(getTokenSync as any).mockReturnValue({ accessToken: makeJwt(-10), refreshToken: "r1" });
		refreshMock.mockImplementation((opts: any) => opts.onFailed());
		expect(await ensureAuthenticated()).toBe(false);
		expect(clearToken).toHaveBeenCalled();
	});

	it("returns false (and clears) when expired with no refresh token", async () => {
		(getTokenSync as any).mockReturnValue({ accessToken: makeJwt(-10) });
		expect(await ensureAuthenticated()).toBe(false);
		expect(refreshMock).not.toHaveBeenCalled();
		expect(clearToken).toHaveBeenCalled();
	});

	it("treats a malformed access token as expired and refreshes", async () => {
		(getTokenSync as any).mockReturnValue({ accessToken: "not-a-jwt", refreshToken: "r1" });
		refreshMock.mockImplementation((opts: any) => opts.onSuccess());
		expect(await ensureAuthenticated()).toBe(true);
		expect(refreshMock).toHaveBeenCalledOnce();
	});

	it("treats a token with no exp claim as expired", async () => {
		const header = btoa(JSON.stringify({ alg: "HS256" }));
		const payload = btoa(JSON.stringify({ sub: "u1" })); // no exp
		(getTokenSync as any).mockReturnValue({ accessToken: `${header}.${payload}.sig`, refreshToken: "r1" });
		refreshMock.mockImplementation((opts: any) => opts.onSuccess());
		expect(await ensureAuthenticated()).toBe(true);
		expect(refreshMock).toHaveBeenCalledOnce();
	});
});
