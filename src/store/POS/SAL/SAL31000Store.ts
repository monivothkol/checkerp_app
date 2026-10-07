import { defineStore } from "pinia";
import RetrieveSaleList from "@/services/api/SIV/retrieveSaleList";
import RetrievePackagingDraft from "@/services/api/SAL/retrievePackagingDraft";
import RetrieveProductList from "@/services/api/PRD/retrieveProductList";
import RetrieveSalePersonList from "@/services/api/SIV/retrieveSalePersonList";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { PackagingDraftItem } from "@/models/POS/SAL/SAL30000";
import type { SaleRow } from "@/models/POS/SIV/SIV10000";
import type { ProductListItem } from "@/models/PRD/PRD10000";
import type { SalePersonLookup } from "@/models/POS/COMMON/lookups";

/** An editable packaging line held while building the draft. */
export interface PackagingFormItem {
    saleItemId?: string;
    productId?: string;
    productCode?: string;
    productName?: string;
    barcode?: string;
    unitName?: string;
    quantityRequired: number;
    sortOrder?: number;
}

/** SAL31000 packaging-create form store: SALE/MANUAL source, item building + draft handoff to SAL32000. */
/** Cancelled/voided invoices are closed records: nothing can be packed or delivered from them. */
const openSales = (list?: SaleRow[]) => (list ?? []).filter((s) => !["CANCELLED", "VOIDED"].includes(String(s.status ?? "").toUpperCase()));

export const SAL31000Store = defineStore("SAL31000Store", {
    state: () => ({
        sourceType: "SALE" as "SALE" | "MANUAL",
        // Locked when deep-linked from an invoice: the sale is fixed, so the
        // SALE/MANUAL toggle and the find-sale search are disabled.
        locked: false,
        // SALE source
        salePick: undefined as string | undefined,
        saleResults: [] as SaleRow[],
        searchingSale: false,
        saleTimer: 0 as ReturnType<typeof setTimeout> | 0,
        selectedSale: null as SaleRow | null,
        loadingItems: false,
        // MANUAL source
        productPick: undefined as string | undefined,
        productResults: [] as ProductListItem[],
        searchingProduct: false,
        productTimer: 0 as ReturnType<typeof setTimeout> | 0,
        // packer (staff assigned to pack)
        packers: [] as SalePersonLookup[],
        packerId: undefined as string | undefined,
        // shared
        items: [] as PackagingFormItem[],
        referenceNumber: "",
        notes: ""
    }),
    getters: {
        canConfirm(state): boolean {
            return state.items.length > 0;
        }
    },
    actions: {
        setSource(type: "SALE" | "MANUAL") {
            if (this.sourceType === type) return;
            this.sourceType = type;
            this.selectedSale = null;
            this.salePick = undefined;
            this.productPick = undefined;
            this.items = [];
        },
        /** Active staff for the packer dropdown (reuses the sale-person lookup). */
        loadPackers() {
            RetrieveSalePersonList.getInstance().request({
                dataBody: {},
                listener: {
                    onSuccess: (p: { salePersons?: SalePersonLookup[] }) => { this.packers = p.salePersons ?? []; }
                }
            });
        },
        /** Deep-link support: resolve a sale code (e.g. from the invoice detail) and select it. */
        preselectSale(saleCode: string) {
            const code = saleCode.trim();
            if (!code) return;
            this.locked = true; // sale comes from the invoice — can't be changed here
            this.searchingSale = true;
            RetrieveSaleList.getInstance().request({
                dataBody: { searchKeyword: code, pageNo: 1, pageSize: 20 },
                listener: {
                    onSuccess: (p) => {
                        this.saleResults = openSales(p.saleList);
                        this.searchingSale = false;
                        const hit = this.saleResults.find((x) => x.saleCode === code) ?? this.saleResults[0];
                        if (hit) this.onPickSale(hit.saleId);
                    },
                    onFail: () => { this.searchingSale = false; }
                }
            });
        },
        searchSales(kw: string) {
            if (this.saleTimer) clearTimeout(this.saleTimer);
            this.searchingSale = true;
            this.saleTimer = setTimeout(() => {
                RetrieveSaleList.getInstance().request({
                    dataBody: { searchKeyword: kw, pageNo: 1, pageSize: 20 },
                    listener: {
                        onSuccess: (p) => { this.saleResults = openSales(p.saleList); this.searchingSale = false; },
                        onFail: () => { this.searchingSale = false; }
                    }
                });
            }, 300);
        },
        onPickSale(saleId: string) {
            const sale = this.saleResults.find((x) => x.saleId === saleId) ?? null;
            this.salePick = undefined;
            this.selectedSale = sale;
            this.items = [];
            if (!sale) return;
            this.loadingItems = true;
            RetrievePackagingDraft.getInstance().request({
                dataBody: { saleId: sale.saleId },
                listener: {
                    onSuccess: (p) => {
                        this.items = (p.itemList ?? []).map((it: PackagingDraftItem, i: number) => ({
                            saleItemId: it.saleItemId,
                            productId: it.productId,
                            productCode: it.productCode,
                            productName: it.productName,
                            barcode: it.barcode,
                            unitName: it.unitName,
                            quantityRequired: Number(it.quantityRequired ?? 0),
                            sortOrder: it.sortOrder ?? i
                        }));
                        this.loadingItems = false;
                    },
                    onFail: () => { this.loadingItems = false; }
                }
            });
        },
        searchProducts(kw: string) {
            if (this.productTimer) clearTimeout(this.productTimer);
            this.searchingProduct = true;
            this.productTimer = setTimeout(() => {
                RetrieveProductList.getInstance().request({
                    dataBody: { searchKeyword: kw, pageNo: 1, pageSize: 20, isActive: true },
                    listener: {
                        onSuccess: (p) => { this.productResults = p.productList ?? []; this.searchingProduct = false; },
                        onFail: () => { this.searchingProduct = false; }
                    }
                });
            }, 250);
        },
        onPickProduct(productId: string) {
            const p = this.productResults.find((x) => x.productId === productId);
            this.productPick = undefined;
            if (!p) return;
            const existing = this.items.find((l) => l.productId === p.productId);
            if (existing) { existing.quantityRequired += 1; return; }
            this.items.push({
                productId: p.productId,
                productCode: p.productCode,
                productName: p.productName,
                barcode: p.barcode,
                unitName: p.unitOfMeasure,
                quantityRequired: 1,
                sortOrder: this.items.length
            });
        },
        setQty(i: number, v: number | null) {
            const l = this.items[i];
            if (!l) return;
            const n = Number(v ?? 0);
            l.quantityRequired = Number.isFinite(n) && n > 0 ? n : 1;
        },
        removeItem(i: number) { this.items.splice(i, 1); },
        /** Validate + stash the PACKAGING draft; returns true when saved (screen then navigates). */
        buildAndSaveDraft(): boolean {
            if (!this.canConfirm) return false;
            const isSale = this.sourceType === "SALE";
            ModuleFlowStore.saveDraft("PACKAGING", {
                payload: {
                    sourceType: this.sourceType,
                    saleId: isSale ? this.selectedSale?.saleId : undefined,
                    packerId: this.packerId || undefined,
                    referenceNumber: this.referenceNumber.trim() || undefined,
                    notes: this.notes.trim() || undefined,
                    items: this.items.map((l, i) => ({
                        saleItemId: l.saleItemId,
                        productId: l.productId,
                        productCode: l.productCode,
                        productName: l.productName,
                        barcode: l.barcode,
                        unitName: l.unitName,
                        quantityRequired: l.quantityRequired,
                        sortOrder: l.sortOrder ?? i
                    }))
                },
                idempotencyKey: crypto.randomUUID(),
                display: {
                    saleCode: isSale ? this.selectedSale?.saleCode : undefined,
                    itemCount: this.items.length,
                    referenceNumber: this.referenceNumber.trim() || undefined,
                    packerName: this.packers.find((p) => p.salePersonId === this.packerId)?.name,
                    notes: this.notes.trim() || undefined,
                    lines: this.items.map((l) => ({
                        name: l.productName,
                        code: l.productCode,
                        unitName: l.unitName,
                        quantityRequired: l.quantityRequired
                    }))
                }
            });
            return true;
        }
    }
});
