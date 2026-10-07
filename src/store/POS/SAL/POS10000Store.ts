import { defineStore } from "pinia";
import RetrievePosProducts from "@/services/api/POS/retrievePosProducts";
import RetrievePosBundles from "@/services/api/POS/retrievePosBundles";
import RetrieveInventoryList from "@/services/api/INV/retrieveInventoryList";
import DataStorage from "@/core/utilities/data-storage";
import IndexedDBCache from "@/core/modules/indexeddb-cache";
import ReferenceData from "@/core/modules/reference-data";
import { getTenantContext } from "@/core/config/tenant-nav";
import type { PosProductRow, PosBundle } from "@/models/POS/SAL/POS10000";
import type { InventoryLookup } from "@/models/POS/COMMON/lookups";

/** Constituent of a bundle cart line — expanded into real sale items at checkout. */
export interface CartBundleItem {
    productId: string;
    variantId?: string;
    quantity: number;
    bundlePrice: number;
}

export interface CartLine {
    productId: string;         // for a bundle: "bundle:<promotionId>" (never sent to the backend as-is)
    /** Set when the product has variants — the cart keys on product + variant. */
    variantId?: string;
    variantName?: string;
    sku: string;
    productName: string;       // for a bundle: the bundle name shown in the cart
    imageUrl?: string;
    unitOfMeasure?: string;
    sellingPrice: number;
    promotionPrice?: number;
    actualPrice: number;
    quantity: number;
    /** Product's own tax rate (%); undefined = store default applies at checkout. */
    taxRate?: number;
    isBundle?: boolean;
    bundleItems?: CartBundleItem[];
}

/** Unit price the customer pays: promotion price when it is lower than the line price. */
function effectivePrice(line: CartLine): number {
    const price = Number(line.actualPrice || 0);
    const promo = line.promotionPrice;
    return promo != null && Number(promo) < price ? Number(promo) : price;
}

/** Inventories the signed-in user may sell from (login userInfo), primary first; [] = unrestricted. */
async function assignedInventoryIds(): Promise<string[]> {
    try {
        const raw = await DataStorage.get({ key: "userInfo" });
        const ids = raw ? (JSON.parse(raw) as { assignedInventoryIds?: unknown }).assignedInventoryIds : undefined;
        return Array.isArray(ids) ? ids.map(String) : [];
    } catch {
        return [];
    }
}

/** Grid page size; a full page means there may be more (the API returns no grand total). */
const PAGE_SIZE = 48;

/** POS10000 checkout terminal store: inventory-scoped product grid (stock + promo) + cart. */
export const POS10000Store = defineStore("POS10000Store", {
    state: () => ({
        keyword: "",
        loading: false,
        loadingMore: false,
        pageNo: 1,
        hasMore: false,
        products: [] as PosProductRow[],
        bundles: [] as PosBundle[],
        cart: [] as CartLine[],
        inventoryId: undefined as string | undefined,
        inventories: [] as InventoryLookup[],
        allowSellWithoutStock: false,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        reqSeq: 0,
        productApi: RetrievePosProducts.getInstance(),
        bundleApi: RetrievePosBundles.getInstance(),
        inventoryApi: RetrieveInventoryList.getInstance()
    }),
    getters: {
        subtotal(state): number {
            return state.cart.reduce((sum, l) => sum + effectivePrice(l) * Number(l.quantity || 0), 0);
        },
        cartCount(state): number {
            return state.cart.reduce((sum, l) => sum + l.quantity, 0);
        }
    },
    actions: {
        /** Whether a product can be added: not tracked, in stock, or the store allows overselling. */
        canSell(p: PosProductRow): boolean {
            return !p.isTrackInventory || Number(p.stockQuantity) > 0 || this.allowSellWithoutStock;
        },
        /**
         * Unit price the customer actually pays: the promotion price when it beats
         * the (possibly manually-set) line price. The cart still SENDS the standard
         * price to checkout — the backend applies the promotion once, authoritatively
         * — so this is display/collection only and never double-discounts.
         */
        effectivePrice(line: CartLine): number {
            return effectivePrice(line);
        },
        lineTotal(line: CartLine): number {
            return effectivePrice(line) * Number(line.quantity || 0);
        },
        /**
         * Fetch the inventory list for the cache-first resolver. REJECTS on failure
         * (never resolves []) so a transient error is not cached — otherwise an empty
         * list would blank the inventory picker for the whole TTL.
         */
        fetchInventories(): Promise<InventoryLookup[]> {
            return new Promise((resolve, reject) => {
                this.inventoryApi.request({
                    dataBody: { pageNo: 1, pageSize: 100, isActive: true },
                    listener: {
                        onSuccess: (p) => resolve(p.inventoryList ?? []),
                        onFail: (e) => reject(e instanceof Error ? e : Object.assign(new Error((e as { message?: string } | undefined)?.message ?? "inventory fetch failed"), e ?? {}))
                    }
                });
            });
        },
        /** Mount: load the sell-without-stock flag, inventories (cached), then products. */
        async init() {
            // Common reference data (sale flags) — cached in IndexedDB, WS-invalidated.
            const ref = await ReferenceData.get();
            this.allowSellWithoutStock = !!ref.allowSellWithoutStock;
            // Cache-first, per-tenant (subdomain), and a FAILED fetch is NOT cached
            // (the resolver only caches a successful response) so a transient error
            // can't blank the picker for the full TTL — the next open just retries.
            const invKey = `INV:list:${getTenantContext().subdomain}`;
            try {
                this.inventories = await IndexedDBCache.resolve(invKey, () => this.fetchInventories(), 60 * 60_000);
            } catch {
                this.inventories = [];
            }
            // Assigned staff only see their inventories and land on the primary (the server enforces it too).
            const assigned = await assignedInventoryIds();
            if (assigned.length) {
                this.inventories = assigned
                    .map((id) => this.inventories.find((i) => i.inventoryId === id))
                    .filter((i): i is InventoryLookup => !!i);
            }
            const def = (assigned.length ? this.inventories[0] : undefined)
                ?? this.inventories.find((i) => i.isDefault) ?? this.inventories[0];
            this.inventoryId = def?.inventoryId;
            this.loadProducts();
            this.loadBundles();
        },
        loadBundles() {
            this.bundleApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => { this.bundles = p.bundles ?? []; },
                    onFail: () => { this.bundles = []; }
                }
            });
        },
        /** First page for the current inventory + keyword (search / inventory change restart here). */
        loadProducts() {
            this.loading = true;
            this.loadingMore = false;
            const seq = ++this.reqSeq;
            this.productApi.request({
                dataBody: { inventoryId: this.inventoryId, searchKeyword: this.keyword, pageNo: 1, pageSize: PAGE_SIZE },
                listener: {
                    // Ignore a stale response — only the latest search updates the grid.
                    onSuccess: (p) => {
                        if (seq !== this.reqSeq) return;
                        this.products = p.productList ?? [];
                        this.pageNo = 1;
                        this.hasMore = this.products.length === PAGE_SIZE;
                        this.loading = false;
                    },
                    onFail: () => {
                        if (seq !== this.reqSeq) return;
                        this.products = [];
                        this.hasMore = false;
                        this.loading = false;
                    }
                }
            });
        },
        /** Infinite scroll: append the next page; a newer search drops it (same reqSeq guard). */
        loadMore() {
            if (this.loading || this.loadingMore || !this.hasMore) return;
            this.loadingMore = true;
            const seq = this.reqSeq;
            const next = this.pageNo + 1;
            this.productApi.request({
                dataBody: { inventoryId: this.inventoryId, searchKeyword: this.keyword, pageNo: next, pageSize: PAGE_SIZE },
                enableLoading: false,
                listener: {
                    onSuccess: (p) => {
                        if (seq !== this.reqSeq) return;
                        const rows = p.productList ?? [];
                        this.products.push(...rows);
                        this.pageNo = next;
                        this.hasMore = rows.length === PAGE_SIZE;
                        this.loadingMore = false;
                    },
                    onFail: () => {
                        if (seq !== this.reqSeq) return;
                        this.loadingMore = false;
                    }
                }
            });
        },
        onSearch() {
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this.loadProducts(), 350);
        },
        onInventoryChange() {
            this.loadProducts();
        },
        /** A barcode scan already named the variant, so it goes straight into the cart. */
        addScannedVariant(p: PosProductRow) {
            if (!p.scannedVariantId) return;
            this.addToCart(p, { variantId: p.scannedVariantId, variantName: p.productName });
        },
        addToCart(p: PosProductRow, variant?: { variantId: string; variantName?: string; sellingPrice?: number }) {
            if (!this.canSell(p)) return;
            const existing = this.cart.find((l) => l.productId === p.productId && l.variantId === variant?.variantId);
            if (existing) {
                existing.quantity += 1;
                return;
            }
            // Send the STANDARD price; the backend applies the promotion once at
            // checkout (double-discount guard). promotionPrice is kept for display.
            const price = Number(variant?.sellingPrice ?? p.sellingPrice ?? 0);
            this.cart.push({
                productId: p.productId,
                variantId: variant?.variantId,
                variantName: variant?.variantName,
                sku: p.sku,
                productName: p.productName,
                imageUrl: p.imageUrl,
                unitOfMeasure: p.unitOfMeasure,
                sellingPrice: price,
                promotionPrice: p.promotionPrice,
                actualPrice: price,
                quantity: 1,
                taxRate: p.taxRate == null ? undefined : Number(p.taxRate)
            });
        },
        /** Add a bundle as ONE cart line (shown by its name); expanded into items at checkout. */
        addBundle(b: PosBundle) {
            const key = "bundle:" + b.promotionId;
            const existing = this.cart.find((l) => l.productId === key);
            if (existing) {
                existing.quantity += 1;
                return;
            }
            this.cart.push({
                productId: key,
                sku: "",
                productName: b.promotionName,
                sellingPrice: Number(b.bundleTotal ?? 0),
                actualPrice: Number(b.bundleTotal ?? 0),
                quantity: 1,
                isBundle: true,
                bundleItems: (b.items ?? []).map((i) => ({
                    productId: i.productId,
                    variantId: i.variantId,
                    quantity: Number(i.quantity ?? 0),
                    bundlePrice: Number(i.bundlePrice ?? 0)
                }))
            });
        },
        stepQty(i: number, delta: number) {
            const next = this.cart[i].quantity + delta;
            if (next < 1) return;
            this.cart[i].quantity = next;
        },
        setQty(i: number, v: number) {
            this.cart[i].quantity = v && v > 0 ? v : 1;
        },
        setPrice(i: number, v: number) {
            this.cart[i].actualPrice = v && v >= 0 ? v : 0;
        },
        removeLine(i: number) {
            this.cart.splice(i, 1);
        },
        clearCart() {
            this.cart = [];
        }
    }
});
