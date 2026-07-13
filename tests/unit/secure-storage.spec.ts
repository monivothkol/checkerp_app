import { afterEach, beforeEach, describe, expect, it } from "vitest";
import secureStorage, { SecureStorage } from "@/shared/utils/secure-storage";

const ENCRYPTED_PREFIX = "__encrypted__";

describe("secure-storage", () => {
	beforeEach(() => localStorage.clear());

	it("stores ciphertext at rest, never plaintext", async () => {
		const secret = JSON.stringify({ accessToken: "aaa.bbb.ccc", refreshToken: "r-123" });
		await secureStorage.setItem("token", secret);

		const raw = localStorage.getItem("__encrypted__token");
		expect(raw).toBeTruthy();
		// the raw persisted value must NOT contain the plaintext token
		expect(raw).not.toContain("aaa.bbb.ccc");
		expect(raw).not.toContain("r-123");
		// but it decrypts back to exactly what we stored
		expect(await secureStorage.getItem("token")).toBe(secret);
	});

	it("uses a fresh IV each encryption (same input -> different ciphertext)", async () => {
		await secureStorage.setItem("a", "same-value");
		const first = localStorage.getItem("__encrypted__a");
		await secureStorage.setItem("a", "same-value");
		const second = localStorage.getItem("__encrypted__a");
		expect(first).not.toBe(second);
	});

	it("removeItem clears both encrypted and plain copies", async () => {
		await secureStorage.setItem("k", "v");
		secureStorage.removeItem("k");
		expect(await secureStorage.getItem("k")).toBeNull();
	});

	it("returns null for a missing key", async () => {
		expect(await secureStorage.getItem("nope")).toBeNull();
	});

	it("migrates a legacy plaintext value to encrypted on read", async () => {
		localStorage.setItem("legacy", "plain-secret");     // pre-existing plaintext
		const value = await secureStorage.getItem("legacy");
		expect(value).toBe("plain-secret");
		// after migration: plaintext removed, encrypted copy written
		expect(localStorage.getItem("legacy")).toBeNull();
		expect(localStorage.getItem(ENCRYPTED_PREFIX + "legacy")).toBeTruthy();
	});

	it("falls back to the plain value when the ciphertext is corrupt", async () => {
		localStorage.setItem(ENCRYPTED_PREFIX + "broken", "not-valid-json{{");
		localStorage.setItem("broken", "plain-fallback");
		expect(await secureStorage.getItem("broken")).toBe("plain-fallback");
	});

	it("clear() removes only the encrypted entries", async () => {
		await secureStorage.setItem("a", "1");
		await secureStorage.setItem("b", "2");
		localStorage.setItem("keep", "untouched");
		secureStorage.clear();
		expect(localStorage.getItem(ENCRYPTED_PREFIX + "a")).toBeNull();
		expect(localStorage.getItem(ENCRYPTED_PREFIX + "b")).toBeNull();
		expect(localStorage.getItem("keep")).toBe("untouched");
	});

	describe("when Web Crypto is unavailable", () => {
		let original: PropertyDescriptor | undefined;

		beforeEach(() => {
			original = Object.getOwnPropertyDescriptor(window, "crypto");
			// No `subtle` -> constructor marks crypto unavailable.
			Object.defineProperty(window, "crypto", { value: {}, configurable: true });
		});
		afterEach(() => {
			if (original) Object.defineProperty(window, "crypto", original);
		});

		it("stores as plain text and reads it back", async () => {
			const s = new SecureStorage();
			await s.setItem("t", "plain-when-no-crypto");
			// stored under the plain key, not the encrypted one
			expect(localStorage.getItem("t")).toBe("plain-when-no-crypto");
			expect(localStorage.getItem(ENCRYPTED_PREFIX + "t")).toBeNull();
			expect(await s.getItem("t")).toBe("plain-when-no-crypto");
		});
	});

	describe("when key derivation fails", () => {
		let original: PropertyDescriptor | undefined;

		beforeEach(() => {
			original = Object.getOwnPropertyDescriptor(window, "crypto");
			Object.defineProperty(window, "crypto", {
				value: {
					subtle: {
						importKey: async () => ({}),
						deriveKey: async () => { throw new Error("kdf fail"); },
					},
					getRandomValues: (a: Uint8Array) => a,
				},
				configurable: true,
			});
		});
		afterEach(() => {
			if (original) Object.defineProperty(window, "crypto", original);
		});

		it("falls back to plain storage when the key cannot be derived", async () => {
			const s = new SecureStorage();          // crypto looks available (has subtle)
			await s.setItem("k", "v");              // deriveKey throws -> init catch -> setItem fallback
			expect(localStorage.getItem("k")).toBe("v");
		});
	});
});
