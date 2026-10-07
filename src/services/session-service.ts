import HttpNetworkService from "@/services/http-network-service";
import { BizCheckMobileLogger, BizCheckMobileProperties } from "@/shared/bizcheckmobile";
import { clearToken, getTokenSync, hydrateTokenStore, TokenBlob } from "@/services/token-store";

/**
 * Session restore for the mobile client.
 *
 * The backend issues a short-lived JWT access token plus a sliding refresh
 * token (multi-device, revocable — user_sessions). This service is what makes
 * that usable across app launches: on boot it checks the stored access token's
 * exp and, if it has expired, silently rotates it via AUT10000I02 BEFORE the user
 * is ever sent back to the login screen.
 *
 * Pitfall this avoids: bouncing a still-valid (or refreshable) session straight
 * to /AUT10000 just because no TTL check was done.
 */

const TOKEN_EXPIRY_BUFFER_MS = 30_000; // refresh 30s before actual expiry

/** exp claim (ms since epoch) from a JWT, or 0 if unreadable. */
function jwtExpiryMs(accessToken: string): number {
	try {
		const payload = JSON.parse(
			atob(accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
		);
		return payload.exp ? payload.exp * 1000 : 0;
	} catch {
		return 0;
	}
}

/** Rotate via AUT10000I02 (refresh token is the credential; the new pair is persisted). */
function refreshToken(_refresh: string): Promise<boolean> {
	return HttpNetworkService.getInstance().refresh();
}

/** Drop the local session (used when refresh is impossible/fails). */
function clearSession(): void {
	void clearToken();
	BizCheckMobileProperties.remove("alreadyLogin");
}

/**
 * True when the user has a usable session. If the access token is expired but a
 * refresh token exists, silently rotates it first — so a valid session is never
 * bounced to the login screen.
 */
export async function ensureAuthenticated(): Promise<boolean> {
	// Decrypt the persisted token into memory before reading it (idempotent).
	await hydrateTokenStore();

	const token: TokenBlob | null = getTokenSync();
	if (!token?.accessToken) {
		return false;
	}

	const expiry = jwtExpiryMs(token.accessToken);
	if (expiry && expiry > Date.now() + TOKEN_EXPIRY_BUFFER_MS) {
		return true; // access token still valid
	}

	// Expired (or exp unreadable): try a silent refresh before giving up.
	if (!token.refreshToken) {
		clearSession();
		return false;
	}

	const ok = await refreshToken(token.refreshToken);
	if (!ok) {
		BizCheckMobileLogger.info("session-service: refresh failed, clearing session");
		clearSession();
	}
	return ok;
}
