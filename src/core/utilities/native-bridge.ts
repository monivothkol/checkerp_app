/**
 * Client for the AppBuild native shell (NivotMobiShell Android/iOS), same contract as NivotsApp:
 * JS → native: `window.NivotBridge.call(action, data)` (message `{ action, data }`);
 * native → JS: `CustomEvent("nivot:bridge", { detail: { action, data } })`.
 * The bridge is looked up at call time: Android injects it only after the page has loaded.
 */

interface NivotBridgeApi {
	call?: (action: string, data?: Record<string, unknown> | null) => unknown;
	postMessage?: (payload: unknown) => unknown;
}

interface BridgeEvent { action?: string; data?: Record<string, unknown> | null }

function bridge(): NivotBridgeApi | undefined {
	return typeof window === "undefined" ? undefined : (window as unknown as { NivotBridge?: NivotBridgeApi }).NivotBridge;
}

/** Running inside the AppBuild shell. */
export function isNativeShell(): boolean {
	const b = bridge();
	return !!(b && (typeof b.call === "function" || typeof b.postMessage === "function"));
}

function isIOSShell(): boolean {
	return isNativeShell() && !!(window as unknown as { webkit?: { messageHandlers?: { NativeBridge?: unknown } } }).webkit?.messageHandlers?.NativeBridge;
}

/** Fire-and-forget native action; false when not in the shell. */
export function callNative(action: string, data: Record<string, unknown> | null = null): boolean {
	const b = bridge();
	if (b?.call) {
		b.call(action, data);
		return true;
	}
	if (b?.postMessage) {
		b.postMessage({ action, data });
		return true;
	}
	return false;
}

/** Native action whose answer comes back as a `nivot:bridge` event named `resultAction`. */
export function requestNative<T>(action: string, resultAction: string, data: Record<string, unknown> | null = null, timeoutMs = 120_000): Promise<T | null> {
	return new Promise((resolve) => {
		const done = (value: T | null) => {
			window.removeEventListener("nivot:bridge", onEvent);
			clearTimeout(timer);
			resolve(value);
		};
		const onEvent = (e: Event) => {
			const detail = (e as CustomEvent<BridgeEvent>).detail;
			if (detail?.action === resultAction) done((detail.data ?? null) as T | null);
		};
		const timer = setTimeout(() => done(null), timeoutMs);
		window.addEventListener("nivot:bridge", onEvent);
		if (!callNative(action, data)) done(null);
	});
}

const NATIVE = {
	isNativeShell,

	/** The shell's native barcode scanner is available (iOS today; the Android shell has no scanBarcode handler yet). */
	canScanBarcode(): boolean {
		return isIOSShell();
	},

	/** Native barcode/QR scan; resolves the code, or null when cancelled/unavailable. */
	async scanBarcode(): Promise<string | null> {
		if (!NATIVE.canScanBarcode()) return null;
		const r = await requestNative<{ barcode?: string | null }>("scanBarcode", "scanBarcodeResult");
		return r?.barcode ? String(r.barcode) : null;
	},

	/** Open a URL/file outside the app: system browser via the shell, a new tab on the web. */
	openURL(url: string): void {
		if (!callNative("openURL", { url })) window.open(url, "_blank", "noopener");
	},

	/** Phone dialer (both shells implement it). */
	phoneCall(number: string): void {
		if (!callNative("phoneCall", { number })) window.location.href = `tel:${number}`;
	}
};

export default NATIVE;
