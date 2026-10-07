import RetrieveCategoryList from "@/services/api/CAT/retrieveCategoryList";
import RetrieveBrandList from "@/services/api/BRD/retrieveBrandList";
import RetrieveInventoryList from "@/services/api/INV/retrieveInventoryList";
import IndexedDBCache from "@/core/modules/indexeddb-cache";
import { getTenantContext } from "@/core/config/tenant-nav";
import type { CategoryLookup, BrandLookup, InventoryLookup } from "@/models/POS/COMMON/lookups";

/**
 * Category / brand / inventory lists for filter dropdowns, read cache-first from
 * IndexedDB. Keys are namespaced "CAT"/"BRD"/"INV" (+ subdomain, so tenants never
 * share) so the reference-data WebSocket drops them the instant one is created/
 * edited/imported (those write adapters evict "CAT"/"BRD"/"INV", which the
 * dispatcher broadcasts; removeByPrefix("CAT") still matches "CAT:list:<tenant>").
 * The 24h TTL is only a safety-net for a missed event.
 *
 * A FAILED fetch is never cached (the fetcher rejects, so the resolver stores
 * nothing) — otherwise a transient error would blank the filter for the full TTL.
 */
const CAT_KEY = "CAT:list";
const BRD_KEY = "BRD:list";
const INV_KEY = "INV:list";
const TTL_MS = 24 * 60 * 60_000;
const PAGE_SIZE = 1000; // filter dropdowns need the whole (small) list, not a page

function scoped(base: string): string {
    return `${base}:${getTenantContext().subdomain}`;
}

export default class ProductFilterRefs {
    static async categories(): Promise<CategoryLookup[]> {
        try {
            return await IndexedDBCache.resolve<CategoryLookup[]>(scoped(CAT_KEY), () => new Promise((resolve, reject) => {
                RetrieveCategoryList.getInstance().request({
                    dataBody: { pageNo: 1, pageSize: PAGE_SIZE, isActive: true },
                    listener: {
                        onSuccess: (p) => resolve(p.categoryList ?? []),
                        onFail: (e) => reject(e instanceof Error ? e : Object.assign(new Error((e as { message?: string } | undefined)?.message ?? "category fetch failed"), e ?? {}))
                    }
                });
            }), TTL_MS);
        } catch {
            return [];
        }
    }

    static async brands(): Promise<BrandLookup[]> {
        try {
            return await IndexedDBCache.resolve<BrandLookup[]>(scoped(BRD_KEY), () => new Promise((resolve, reject) => {
                RetrieveBrandList.getInstance().request({
                    dataBody: { pageNo: 1, pageSize: PAGE_SIZE, isActive: true },
                    listener: {
                        onSuccess: (p) => resolve(p.brandList ?? []),
                        onFail: (e) => reject(e instanceof Error ? e : Object.assign(new Error((e as { message?: string } | undefined)?.message ?? "brand fetch failed"), e ?? {}))
                    }
                });
            }), TTL_MS);
        } catch {
            return [];
        }
    }

    static async inventories(): Promise<InventoryLookup[]> {
        try {
            return await IndexedDBCache.resolve<InventoryLookup[]>(scoped(INV_KEY), () => new Promise((resolve, reject) => {
                RetrieveInventoryList.getInstance().request({
                    dataBody: { pageNo: 1, pageSize: PAGE_SIZE, isActive: true },
                    listener: {
                        onSuccess: (p) => resolve(p.inventoryList ?? []),
                        onFail: (e) => reject(e instanceof Error ? e : Object.assign(new Error((e as { message?: string } | undefined)?.message ?? "inventory fetch failed"), e ?? {}))
                    }
                });
            }), TTL_MS);
        } catch {
            return [];
        }
    }
}
