import secureStorage from "@/shared/utils/secure-storage";
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";

/**
 * Single source of truth for the auth token.
 *
 *  - At rest: encrypted via secureStorage (AES-GCM), never plaintext localStorage.
 *  - In memory: a decrypted cache so synchronous callers (the Bearer-header
 *    builder in the network layer) keep working — secureStorage is async.
 *
 * Boot flow: call hydrateTokenStore() once (router guard) to decrypt the stored
 * token into memory before any authenticated request is made.
 *
 * NATIVE TODO: when the app is packaged natively, route setToken/getToken through
 * the platform secure store (iOS Keychain / Android Keystore) here — every token
 * access already funnels through this module, so it's a one-place change.
 */

const TOKEN_KEY = "token";

export interface TokenBlob {
	accessToken?: string;
	refreshToken?: string;
	userId?: string;
	userName?: string;
	[k: string]: unknown;
}

let memoryToken: TokenBlob | null = null;
let hydrated = false;

/** Decrypt the persisted token into memory. Idempotent; call once at boot. */
export async function hydrateTokenStore(): Promise<void> {
	if (hydrated) return;
	hydrated = true;
	try {
		const raw = await secureStorage.getItem(TOKEN_KEY);
		memoryToken = raw ? (JSON.parse(raw) as TokenBlob) : null;
	} catch (error) {
		BizCheckMobileLogger.warn("token-store: hydrate failed", error);
		memoryToken = null;
	}
}

/** Synchronous read (Bearer header, guards). Requires hydrateTokenStore() first. */
export function getTokenSync(): TokenBlob | null {
	return memoryToken;
}

/** Persist the token: memory immediately (sync), encrypted at rest (async). */
export async function setToken(blob: TokenBlob): Promise<void> {
	memoryToken = blob; // sync — Bearer reads work before the write settles
	try {
		await secureStorage.setItem(TOKEN_KEY, JSON.stringify(blob));
	} catch (error) {
		BizCheckMobileLogger.warn("token-store: setToken persist failed", error);
	}
}

/** Merge fields into the current token (used by silent refresh). */
export async function mergeToken(patch: Partial<TokenBlob>): Promise<void> {
	await setToken({ ...(memoryToken ?? {}), ...patch });
}

/** Drop the token from memory and encrypted storage. */
export async function clearToken(): Promise<void> {
	memoryToken = null;
	try {
		secureStorage.removeItem(TOKEN_KEY);
	} catch (error) {
		BizCheckMobileLogger.warn("token-store: clear failed", error);
	}
}
