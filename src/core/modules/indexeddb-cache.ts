/**
 * Real IndexedDB key-value cache for BULK / larger data — product lists, menu
 * trees, lookup tables, offline datasets, etc.
 *
 * Why this and not DataStorage/localStorage:
 *  - Capacity: hundreds of MB+ vs localStorage's ~5 MB.
 *  - Async + structured-clone: stores objects directly (no JSON.stringify), and
 *    large writes don't block the main thread.
 *
 * Session/credential state stays in DataStorage (localStorage) — it's tiny and
 * needs synchronous, reliable access on every request, and the token is
 * encrypted there. Use this cache for data you're fine loading asynchronously.
 *
 * Usage:
 *   await IndexedDBCache.set("PRD10000:list", productList, 5 * 60_000); // 5-min TTL
 *   const cached = await IndexedDBCache.get<ProductListItem[]>("PRD10000:list");
 */

const DB_NAME = "checkerp-cache";
const STORE = "kv";
const VERSION = 1;

interface Entry<T = unknown> {
    value: T;
    /** Epoch ms after which the entry is stale; undefined = never expires. */
    expiresAt?: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE);
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
    return dbPromise;
}

function runTx<T>(mode: IDBTransactionMode, op: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    return openDb().then(
        (db) =>
            new Promise<T>((resolve, reject) => {
                const tx = db.transaction(STORE, mode);
                const req = op(tx.objectStore(STORE));
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            })
    );
}

export default class IndexedDBCache {
    /** Store a value. Pass ttlMs to auto-expire it after that many ms. */
    static async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
        const entry: Entry<T> = {
            value,
            expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
        };
        await runTx("readwrite", (s) => s.put(entry, key));
    }

    /** Read a value, or null if missing or expired (expired entries are purged). */
    static async get<T>(key: string): Promise<T | null> {
        const entry = (await runTx<Entry<T> | undefined>("readonly", (s) => s.get(key))) ?? null;
        if (!entry) {
            return null;
        }
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
            await this.remove(key);
            return null;
        }
        return entry.value;
    }

    static async remove(key: string): Promise<void> {
        await runTx("readwrite", (s) => s.delete(key));
    }

    static async clear(): Promise<void> {
        await runTx("readwrite", (s) => s.clear());
    }

    /** All cache keys (useful for prefix-based invalidation). */
    static async keys(): Promise<string[]> {
        const keys = await runTx<IDBValidKey[]>("readonly", (s) => s.getAllKeys());
        return keys.map(String);
    }

    /** Remove every key starting with the given prefix (e.g. "PRD"). */
    static async removeByPrefix(prefix: string): Promise<void> {
        const keys = await this.keys();
        await Promise.all(keys.filter((k) => k.startsWith(prefix)).map((k) => this.remove(k)));
    }

    /**
     * Cache-first read for reference data: return the cached value, else run the
     * fetcher and cache it. Key the entry as "<NAMESPACE>:..." so the WebSocket
     * invalidation (removeByPrefix(namespace)) drops it when the data changes.
     */
    static async resolve<T>(key: string, fetcher: () => Promise<T>, ttlMs?: number): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached != null) {
            return cached;
        }
        const fresh = await fetcher();
        await this.set(key, fresh, ttlMs);
        return fresh;
    }
}
