import RetrieveReferenceData from "@/services/api/COMMON/retrieveReferenceData";
import IndexedDBCache from "@/core/modules/indexeddb-cache";
import { getTenantContext } from "@/core/config/tenant-nav";
import type { CMM02000I01Response } from "@/models/COMMON/CMM02000I01";

/**
 * Common tenant reference data (payment methods, banks, currency, sale flags),
 * read cache-first from IndexedDB under the "REF" namespace, scoped per tenant
 * (subdomain). Payment methods and banks are effectively static; currency and sale
 * flags change via store settings, which evict REF over the WebSocket so this bucket
 * drops the instant they change. The socket IS the invalidation — the long TTL is
 * only a safety-net refresh for a missed event (e.g. a disconnected tab).
 *
 * A FAILED fetch is never cached (the fetcher rejects, so the resolver stores
 * nothing) — otherwise an empty bucket would mask real settings for the whole TTL.
 */
const KEY = "REF:data";
const TTL_MS = 24 * 60 * 60_000; // 24h safety-net; real invalidation is the WebSocket

function key(): string {
    return `${KEY}:${getTenantContext().subdomain}`;
}

export default class ReferenceData {
    static async get(): Promise<CMM02000I01Response> {
        try {
            return await IndexedDBCache.resolve<CMM02000I01Response>(key(), () => new Promise((resolve, reject) => {
                RetrieveReferenceData.getInstance().request({
                    dataBody: {},
                    listener: {
                        onSuccess: (p) => resolve(p),
                        onFail: (e) => reject(e instanceof Error ? e : Object.assign(new Error((e as { message?: string } | undefined)?.message ?? "reference-data fetch failed"), e ?? {}))
                    }
                });
            }), TTL_MS);
        } catch {
            // Not cached; the next read retries. Return empty so callers degrade gracefully.
            return {};
        }
    }

    /** Force a refetch on next read (used if a screen needs guaranteed-fresh data). */
    static invalidate(): Promise<void> {
        return IndexedDBCache.removeByPrefix(KEY);
    }
}
