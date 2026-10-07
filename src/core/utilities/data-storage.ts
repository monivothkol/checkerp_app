import secureStorage from "@/shared/utils/secure-storage";
import { clearToken, getTokenSync, setToken, type TokenBlob } from "@/services/token-store";

/**
 * checkerp_web's DataStorage contract for the app. "token" goes through the token store
 * (encrypted, in-memory cache for the Bearer header); "userInfo" is encrypted; the rest is
 * plain localStorage. Values are stored as given (the web stores JSON strings).
 */
const SENSITIVE = new Set(["userInfo"]);
const PREFIX = "checkerp:";

export default class DataStorage {
	static set(param: { key: string; value: any }): void {
		if (param.key === "token") {
			const blob = typeof param.value === "string" ? JSON.parse(param.value) : param.value;
			void setToken(blob as TokenBlob);
		} else if (SENSITIVE.has(param.key)) {
			void secureStorage.setItem(param.key, String(param.value));
		} else {
			localStorage.setItem(PREFIX + param.key, typeof param.value === "string" ? param.value : JSON.stringify(param.value));
		}
	}

	static async get(param: { key: string; onSuccess?: (data: any) => void; onFail?: (error: any) => void }): Promise<any> {
		try {
			let value: string | null;
			if (param.key === "token") {
				const t = getTokenSync();
				value = t ? JSON.stringify(t) : null;
			} else if (SENSITIVE.has(param.key)) {
				value = await secureStorage.getItem(param.key);
			} else {
				value = localStorage.getItem(PREFIX + param.key);
			}
			param.onSuccess?.(value);
			return value;
		} catch (error) {
			param.onFail?.(error);
			return null;
		}
	}

	static remove(param: { key: string }): void {
		if (param.key === "token") void clearToken();
		else if (SENSITIVE.has(param.key)) secureStorage.removeItem(param.key);
		else localStorage.removeItem(PREFIX + param.key);
	}

	/** Clears session data on logout but keeps UI preferences (pref:*), as on the web. */
	static clear(): void {
		void clearToken();
		for (const key of SENSITIVE) secureStorage.removeItem(key);
		for (const k of Object.keys(localStorage)) {
			if (k.startsWith(PREFIX) && !k.startsWith(PREFIX + "pref:")) localStorage.removeItem(k);
		}
	}
}
