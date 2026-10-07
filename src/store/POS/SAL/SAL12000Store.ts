import { defineStore } from "pinia";
import RetrieveProductList from "@/services/api/PRD/retrieveProductList";
import RetrieveInventoryList from "@/services/api/INV/retrieveInventoryList";
import IndexedDBCache from "@/core/modules/indexeddb-cache";
import { getTenantContext } from "@/core/config/tenant-nav";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { QuotationLine } from "@/models/POS/SAL/SAL12000";
import type { ProductListItem } from "@/models/PRD/PRD10000";
import type { InventoryLookup } from "@/models/POS/COMMON/lookups";

/** SAL12000 quotation-create form store: line building + draft handoff to SAL13000. */
export const SAL12000Store = defineStore("SAL12000Store", {
    state: () => ({
        customerName: "",
        customerPhone: "",
        quotationDate: new Date().toISOString().slice(0, 10),
        remark: "",
        inventoryId: undefined as string | undefined,
        inventories: [] as InventoryLookup[],
        productPick: undefined as string | undefined,
        productResults: [] as ProductListItem[],
        searching: false,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        lines: [] as QuotationLine[]
    }),
    getters: {
        subTotal(state): number {
            return state.lines.reduce((s, l) => s + Number(l.unitPrice || 0) * Number(l.quantity || 0), 0);
        },
        discountTotal(state): number {
            return state.lines.reduce((s, l) => s + Number(l.discountAmount || 0), 0);
        },
        totalAmount(): number {
            return Math.max(0, this.subTotal - this.discountTotal);
        },
        canConfirm(state): boolean {
            return !!state.customerName.trim() && !!state.quotationDate
                && !!state.inventoryId && state.lines.length > 0;
        }
    },
    actions: {
        /** Fetch inventories; REJECTS on failure so a transient error is never cached
         *  (an empty list would blank the picker for the whole TTL). */
        fetchInventories(): Promise<InventoryLookup[]> {
            return new Promise((resolve, reject) => {
                RetrieveInventoryList.getInstance().request({
                    dataBody: { pageNo: 1, pageSize: 100, isActive: true },
                    listener: {
                        onSuccess: (p) => resolve(p.inventoryList ?? []),
                        onFail: (e) => reject(e instanceof Error ? e : new Error("inventory fetch failed"))
                    }
                });
            });
        },
        /** Cache-first (IndexedDB, per-tenant, WS-invalidated, 1h TTL) — same as
         *  POS10000, so the inventory picker is instant and doesn't re-hit the API. */
        async loadInventories() {
            const invKey = `INV:list:${getTenantContext().subdomain}`;
            try {
                this.inventories = await IndexedDBCache.resolve(invKey, () => this.fetchInventories(), 60 * 60_000);
            } catch {
                this.inventories = [];
            }
            if (!this.inventoryId && this.inventories.length) {
                const def = this.inventories.find((i) => i.isDefault) ?? this.inventories[0];
                this.inventoryId = def?.inventoryId;
            }
        },
        lineTotal(l: QuotationLine): number {
            return Number(l.unitPrice || 0) * Number(l.quantity || 0) - Number(l.discountAmount || 0);
        },
        searchProducts(kw: string) {
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searching = true;
            this.searchTimer = setTimeout(() => {
                RetrieveProductList.getInstance().request({
                    dataBody: { searchKeyword: kw, pageNo: 1, pageSize: 20, isActive: true },
                    listener: {
                        onSuccess: (p: { productList?: ProductListItem[] }) => { this.productResults = p.productList ?? []; this.searching = false; },
                        onFail: () => { this.searching = false; }
                    }
                });
            }, 250);
        },
        /** `variant` is set when the product has variants (the screen asks first). */
        onPickProduct(productId: string, variant?: { variantId: string; variantName?: string }) {
            const p = this.productResults.find((x) => x.productId === productId);
            this.productPick = undefined;
            if (!p) return;
            const existing = this.lines.find((l) => l.itemCode === p.productCode && l.variantId === variant?.variantId);
            if (existing) { existing.quantity += 1; return; }
            this.lines.push({
                itemCode: p.productCode,
                itemName: p.productName,
                variantId: variant?.variantId,
                variantName: variant?.variantName,
                quantity: 1,
                unitPrice: Number(p.sellingPrice ?? 0),
                discountAmount: 0
            });
        },
        setQty(i: number, v: number) { this.lines[i].quantity = v && v > 0 ? v : 1; },
        setPrice(i: number, v: number) { this.lines[i].unitPrice = v && v >= 0 ? v : 0; },
        setDiscount(i: number, v: number) { this.lines[i].discountAmount = v && v >= 0 ? v : 0; },
        removeLine(i: number) { this.lines.splice(i, 1); },
        /** Validate + stash the SAL draft; returns true when saved (screen then navigates). */
        buildAndSaveDraft(): boolean {
            if (!this.canConfirm) return false;
            ModuleFlowStore.saveDraft("SAL", {
                payload: {
                    customerName: this.customerName.trim(),
                    customerPhone: this.customerPhone.trim() || undefined,
                    quotationDate: this.quotationDate,
                    remark: this.remark.trim() || undefined,
                    inventoryId: this.inventoryId,
                    itemList: this.lines.map((l) => ({
                        itemCode: l.itemCode,
                        itemName: l.itemName,
                        variantId: l.variantId,
                        quantity: l.quantity,
                        unitPrice: l.unitPrice,
                        discountAmount: l.discountAmount
                    }))
                },
                idempotencyKey: crypto.randomUUID(),
                display: {
                    customer: this.customerName.trim(),
                    phone: this.customerPhone.trim(),
                    date: this.quotationDate,
                    lines: this.lines.map((l) => ({
                        name: l.itemName,
                        code: l.itemCode,
                        qty: l.quantity,
                        price: l.unitPrice,
                        discount: l.discountAmount,
                        amount: this.lineTotal(l)
                    })),
                    subTotal: this.subTotal,
                    discountTotal: this.discountTotal,
                    totalAmount: this.totalAmount
                }
            });
            return true;
        }
    }
});
