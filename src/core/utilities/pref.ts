import ModuleApi from "@/services/api/COMMON/module-api";

/**
 * Durable UI preferences — a tiny JSON key/value store over localStorage, with
 * optional server sync for cross-device presets.
 *
 * - Keys are namespaced under "pref:" so they SURVIVE the localStorage clear on
 *   login/logout (DataStorage.clear preserves pref:* keys).
 * - localStorage is the instant, device-local source of truth.
 * - When sync is enabled (enablePrefSync, called once at app init), writes are
 *   ALSO pushed to the server — DEBOUNCED so a burst of tick/untick collapses
 *   into one request, with a max-wait cap and a flush on tab close/hide.
 *
 * Use for any "remember my setup" preset: column visibility, export options,
 * filters, layouts. Callers pass a logical key (e.g. "PRD10000:view"); the
 * prefix is added here.
 */

const PREFIX = "pref:";
const DEBOUNCE_MS = 800;
const MAX_WAIT_MS = 5000;

/** Read a preference, JSON-decoded, falling back on missing/corrupt values. */
export function getPref<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(PREFIX + key);
        if (raw === null) return fallback;
        const parsed = JSON.parse(raw);
        return (parsed ?? fallback) as T;
    } catch {
        return fallback;
    }
}

/** Write a preference (JSON-encoded) + queue a debounced server sync. */
export function setPref(key: string, value: unknown): void {
    const json = JSON.stringify(value);
    try {
        localStorage.setItem(PREFIX + key, json);
    } catch {
        /* storage unavailable — best-effort */
    }
    if (syncEnabled) {
        pending.set(key, json);
        scheduleFlush();
    }
}

export function removePref(key: string): void {
    try {
        localStorage.removeItem(PREFIX + key);
    } catch {
        /* ignore */
    }
}

// ---- Server sync (cross-device). Off until enablePrefSync() at app init. ----

let syncEnabled = false;
const pending = new Map<string, string>(); // logical key -> raw JSON string
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let maxWaitTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush(): void {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(flushPrefs, DEBOUNCE_MS);
    // Max-wait: if changes never pause, still save at least this often.
    if (!maxWaitTimer) maxWaitTimer = setTimeout(flushPrefs, MAX_WAIT_MS);
}

/** Send everything queued now (also called on tab close/hide). */
export function flushPrefs(): void {
    if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
    if (maxWaitTimer) { clearTimeout(maxWaitTimer); maxWaitTimer = null; }
    if (pending.size === 0) return;

    const prefs = Array.from(pending.entries()).map(([key, value]) => ({ key, value }));
    pending.clear();
    // Fire-and-forget: the UI never waits on this. localStorage is the device's
    // truth; this is a best-effort cross-device sync (debounced upstream).
    ModuleApi.request("PRE10000I02", { prefs }, {
        onSuccess: () => { /* saved */ },
        onFail: () => { /* ignored — next change re-syncs */ }
    });
}

/** Load the user's server-stored prefs into localStorage. Call once after login. */
export function hydratePrefs(): Promise<void> {
    return new Promise((resolve) => {
        ModuleApi.request("PRE10000I01", {}, {
            onSuccess: (p) => {
                const prefs = (p?.preferences ?? {}) as Record<string, unknown>;
                for (const key of Object.keys(prefs)) {
                    const value = prefs[key];
                    if (typeof value === "string") localStorage.setItem(PREFIX + key, value);
                }
                resolve();
            },
            onFail: () => resolve()
        });
    });
}

/** Turn on server sync + flush-on-leave. Idempotent; call once at app init. */
export function enablePrefSync(): void {
    if (syncEnabled || typeof window === "undefined") return;
    syncEnabled = true;
    window.addEventListener("beforeunload", flushPrefs);
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") flushPrefs();
    });
}
