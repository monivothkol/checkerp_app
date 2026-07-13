import { beforeEach, describe, expect, it, vi } from "vitest";

// In-memory fake for the encrypted store, so we test the seam's logic (memory
// cache, merge, hydrate) without real crypto.
const backing = new Map<string, string>();
vi.mock("@/shared/utils/secure-storage", () => ({
	default: {
		getItem: vi.fn(async (k: string) => backing.get(k) ?? null),
		setItem: vi.fn(async (k: string, v: string) => { backing.set(k, v); }),
		removeItem: vi.fn((k: string) => { backing.delete(k); }),
	},
}));

import secureStorage from "@/shared/utils/secure-storage";

type TS = typeof import("@/services/token-store");

async function freshModule(): Promise<TS> {
	vi.resetModules();               // reset token-store's module-level memory/hydrated
	return import("@/services/token-store");
}

describe("token-store", () => {
	beforeEach(() => backing.clear());

	it("setToken updates the sync cache immediately and persists", async () => {
		const ts = await freshModule();
		await ts.setToken({ accessToken: "a1", refreshToken: "r1" });
		expect(ts.getTokenSync()).toEqual({ accessToken: "a1", refreshToken: "r1" });
		expect(backing.get("token")).toBe(JSON.stringify({ accessToken: "a1", refreshToken: "r1" }));
	});

	it("hydrate loads the persisted token into memory", async () => {
		backing.set("token", JSON.stringify({ accessToken: "persisted" }));
		const ts = await freshModule();
		expect(ts.getTokenSync()).toBeNull(); // not loaded yet
		await ts.hydrateTokenStore();
		expect(ts.getTokenSync()).toEqual({ accessToken: "persisted" });
	});

	it("mergeToken keeps existing fields and overwrites given ones", async () => {
		const ts = await freshModule();
		await ts.setToken({ accessToken: "old", refreshToken: "r1", userId: "u1" });
		await ts.mergeToken({ accessToken: "new" });
		expect(ts.getTokenSync()).toEqual({ accessToken: "new", refreshToken: "r1", userId: "u1" });
	});

	it("clearToken empties both memory and storage", async () => {
		const ts = await freshModule();
		await ts.setToken({ accessToken: "a1" });
		await ts.clearToken();
		expect(ts.getTokenSync()).toBeNull();
		expect(backing.get("token")).toBeUndefined();
	});

	it("hydrate is idempotent (second call is a no-op)", async () => {
		backing.set("token", JSON.stringify({ accessToken: "first" }));
		const ts = await freshModule();
		await ts.hydrateTokenStore();
		backing.set("token", JSON.stringify({ accessToken: "changed-after" }));
		await ts.hydrateTokenStore(); // should NOT reload
		expect(ts.getTokenSync()).toEqual({ accessToken: "first" });
	});

	it("setToken keeps the memory cache even if persistence throws", async () => {
		const ts = await freshModule();
		(secureStorage.setItem as any).mockImplementationOnce(async () => { throw new Error("disk full"); });
		await ts.setToken({ accessToken: "mem-only" });
		expect(ts.getTokenSync()).toEqual({ accessToken: "mem-only" });
	});

	it("hydrate leaves memory null when decryption throws", async () => {
		const ts = await freshModule();
		(secureStorage.getItem as any).mockImplementationOnce(async () => { throw new Error("corrupt"); });
		await ts.hydrateTokenStore();
		expect(ts.getTokenSync()).toBeNull();
	});

	it("clearToken empties memory even if removeItem throws", async () => {
		const ts = await freshModule();
		await ts.setToken({ accessToken: "x" });
		(secureStorage.removeItem as any).mockImplementationOnce(() => { throw new Error("boom"); });
		await ts.clearToken();
		expect(ts.getTokenSync()).toBeNull();
	});

	it("mergeToken works when there is no existing token", async () => {
		const ts = await freshModule();       // memory starts null
		await ts.mergeToken({ accessToken: "brand-new" });
		expect(ts.getTokenSync()).toEqual({ accessToken: "brand-new" });
	});

	it("hydrate with no stored token leaves memory null", async () => {
		const ts = await freshModule();       // backing cleared in beforeEach
		await ts.hydrateTokenStore();
		expect(ts.getTokenSync()).toBeNull();
	});
});
