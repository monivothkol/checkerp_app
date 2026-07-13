/**
 * Secure Storage Utility  (ported from NivotsApp — keep behaviour in sync)
 * Encrypts sensitive data with the Web Crypto API (AES-GCM) before storing it
 * in localStorage, so a raw token never sits in plaintext.
 *
 * NOTE: the key is derived (PBKDF2) from a build-time app secret. This is strong
 * obfuscation for data-at-rest (devtools inspection, backups, other tooling) but
 * NOT a defence against active XSS — that is mitigated separately (v-safe-html,
 * short access-token TTL). It matches NivotsApp's util.
 */

import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";

// App-specific secret from environment; falls back to a dev-only default.
const APP_SECRET = import.meta.env.VITE_ENCRYPTION_SECRET || "BizCheck-Mobile-App-v1.0-Secret-Key-DEV-ONLY";

// Storage key prefix for encrypted data
const ENCRYPTED_PREFIX = "__encrypted__";

interface EncryptedData {
	iv: string;           // Initialization vector (base64)
	data: string;         // Encrypted data (base64)
	version: number;      // Encryption version
}

export class SecureStorage {
	private cryptoKey: CryptoKey | null = null;
	private isInitialized = false;
	private cryptoAvailable = false;

	constructor() {
		// Web Crypto API requires a secure context (HTTPS or localhost).
		this.cryptoAvailable = !!(window.crypto && window.crypto.subtle);
		if (!this.cryptoAvailable) {
			BizCheckMobileLogger.warn("Web Crypto API not available. Falling back to plain storage. Run on HTTPS or localhost for encryption.");
		}
	}

	/** Initialize the encryption key. */
	private async initialize(): Promise<void> {
		if (this.isInitialized) return;
		if (!this.cryptoAvailable) {
			throw new Error("Web Crypto API not available");
		}

		try {
			const keyMaterial = await this.getKeyMaterial();

			this.cryptoKey = await window.crypto.subtle.deriveKey(
				{
					name: "PBKDF2",
					salt: new TextEncoder().encode("BizCheckSalt"),
					iterations: 100000,
					hash: "SHA-256",
				},
				keyMaterial,
				{ name: "AES-GCM", length: 256 },
				false,
				["encrypt", "decrypt"]
			);

			this.isInitialized = true;
			BizCheckMobileLogger.debug("Secure storage initialized");
		} catch (error) {
			BizCheckMobileLogger.error("Failed to initialize secure storage:", error);
			throw error;
		}
	}

	/** Derive key material from the app secret. */
	private async getKeyMaterial(): Promise<CryptoKey> {
		const keyData = new TextEncoder().encode(APP_SECRET);
		return await window.crypto.subtle.importKey(
			"raw",
			keyData,
			{ name: "PBKDF2" },
			false,
			["deriveKey"]
		);
	}

	private async encryptData(data: string): Promise<string> {
		await this.initialize();
		/* v8 ignore next 3 -- unreachable: initialize() sets the key or throws */
		if (!this.cryptoKey) {
			throw new Error("Encryption key not available");
		}

		const dataBuffer = new TextEncoder().encode(data);
		const iv = window.crypto.getRandomValues(new Uint8Array(12));
		const encryptedBuffer = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, this.cryptoKey, dataBuffer);

		const encryptedData: EncryptedData = {
			iv: this.arrayBufferToBase64(iv),
			data: this.arrayBufferToBase64(encryptedBuffer),
			version: 1,
		};
		return JSON.stringify(encryptedData);
	}

	private async decryptData(encryptedString: string): Promise<string> {
		await this.initialize();
		/* v8 ignore next 3 -- unreachable: initialize() sets the key or throws */
		if (!this.cryptoKey) {
			throw new Error("Decryption key not available");
		}

		const encryptedData: EncryptedData = JSON.parse(encryptedString);
		const iv = this.base64ToArrayBuffer(encryptedData.iv);
		const data = this.base64ToArrayBuffer(encryptedData.data);
		const decryptedBuffer = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, this.cryptoKey, data);
		return new TextDecoder().decode(decryptedBuffer);
	}

	/** Set item in encrypted storage. */
	async setItem(key: string, value: string): Promise<void> {
		try {
			const encrypted = await this.encryptData(value);
			localStorage.setItem(ENCRYPTED_PREFIX + key, encrypted);
		} catch {
			// Fallback to plain storage (prevents app breakage if crypto is unavailable).
			BizCheckMobileLogger.warn(`Storing ${key} as plain text (crypto unavailable)`);
			localStorage.setItem(key, value);
		}
	}

	/** Get item from encrypted storage (migrates any legacy plain value). */
	async getItem(key: string): Promise<string | null> {
		try {
			const encryptedValue = localStorage.getItem(ENCRYPTED_PREFIX + key);
			if (encryptedValue) {
				return await this.decryptData(encryptedValue);
			}

			const plainValue = localStorage.getItem(key);
			if (plainValue) {
				if (this.cryptoAvailable) {
					// Migrate legacy plaintext to encrypted, then drop the plaintext.
					await this.setItem(key, plainValue);
					localStorage.removeItem(key);
				}
				return plainValue;
			}
			return null;
		} catch (error) {
			BizCheckMobileLogger.error(`Failed to decrypt ${key}:`, error);
			return localStorage.getItem(key);
		}
	}

	/** Remove item from encrypted storage. */
	removeItem(key: string): void {
		localStorage.removeItem(ENCRYPTED_PREFIX + key);
		localStorage.removeItem(key); // also remove any plain version
	}

	/** Clear all encrypted storage. */
	clear(): void {
		Object.keys(localStorage).forEach((key) => {
			if (key.startsWith(ENCRYPTED_PREFIX)) {
				localStorage.removeItem(key);
			}
		});
	}

	private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
		const bytes = new Uint8Array(buffer as ArrayBuffer);
		let binary = "";
		for (let i = 0; i < bytes.length; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary);
	}

	private base64ToArrayBuffer(base64: string): ArrayBuffer {
		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		return bytes.buffer;
	}
}

export const secureStorage = new SecureStorage();
export default secureStorage;
