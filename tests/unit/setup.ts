import { webcrypto } from "node:crypto";

// jsdom does not implement SubtleCrypto. Back window/global crypto with Node's
// Web Crypto so secure-storage (AES-GCM) works under test.
if (!globalThis.crypto || !("subtle" in globalThis.crypto)) {
	Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true });
}
if (typeof window !== "undefined" && (!window.crypto || !("subtle" in window.crypto))) {
	Object.defineProperty(window, "crypto", { value: globalThis.crypto, configurable: true });
}
