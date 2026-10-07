import { defineStore } from "pinia";
import RetrieveProductList from "@/services/api/PRD/retrieveProductList";
import RetrieveInventoryList from "@/services/api/INV/retrieveInventoryList";
import RetrieveQuotationDetail from "@/services/api/SAL/retrieveQuotationDetail";
import UpdateQuotation from "@/services/api/SAL/updateQuotation";
import IndexedDBCache from "@/core/modules/indexeddb-cache";
import { getTenantContext } from "@/core/config/tenant-nav";
import POP from "@/core/utilities/pop";
import type { QuotationLine } from "@/models/POS/SAL/SAL12000";
import type { QuotationDetail, QuotationDetailItem } from "@/models/POS/SAL/SAL15000";
import type { ProductListItem } from "@/models/PRD/PRD10000";
import type { InventoryLookup } from "@/models/POS/COMMON/lookups";

/** SAL17000 quotation-EDIT store: refills from the detail (SAL15000I01), edits
 *  lines like the create form, then submits the update (SAL17000I01). Mirrors the
 *  invoice-edit (SIV15000) pattern — reuses the detail API to refill, no confirm step. */
export const SAL17000Store = defineStore("SAL17000Store", {
    state: () => ({
        quotationNo: "",
        loading: true,
        notFound: false,
        submitting: false,
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
        lines: [] as QuotationLine[],
        redirectTo: null as string | null
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
        lineTotal(l: QuotationLine): number {
            return Number(l.unitPrice || 0) * Number(l.quantity || 0) - Number(l.discountAmount || 0);
        },
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
        async loadInventories() {
            const invKey = `INV:list:${getTenantContext().subdomain}`;
            try {
                this.inventories = await IndexedDBCache.resolve(invKey, () => this.fetchInventories(), 60 * 60_000);
            } catch { this.inventories = []; }
        },
        /** Refill the form from the existing quotation (reuses the detail API). */
        loadForEdit(quotationNo: string) {
            this.quotationNo = quotationNo;
            if (!quotationNo) { this.loading = false; this.notFound = true; return; }
            this.loading = true;
            void this.loadInventories();
            RetrieveQuotationDetail.getInstance().request({
                dataBody: { quotationNo },
                listener: {
                    onSuccess: (d: QuotationDetail) => {
                        this.customerName = d.customerName ?? "";
                        this.customerPhone = d.phoneNo ?? "";
                        this.quotationDate = d.quotationDate ?? this.quotationDate;
                        this.remark = d.remark ?? "";
                        this.inventoryId = d.inventoryId ?? this.inventoryId;
                        this.lines = (d.itemList ?? []).map((it: QuotationDetailItem) => ({
                            itemCode: it.productCode ?? "",
                            itemName: it.productName ?? "",
                            quantity: Number(it.quantity ?? 1),
                            unitPrice: Number(it.unitPrice ?? 0),
                            discountAmount: Number(it.discountAmount ?? 0)
                        }));
                        this.loading = false;
                    },
                    onFail: () => { this.notFound = true; this.loading = false; }
                }
            });
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
        onPickProduct(productId: string) {
            const p = this.productResults.find((x) => x.productId === productId);
            this.productPick = undefined;
            if (!p) return;
            const existing = this.lines.find((l) => l.itemCode === p.productCode);
            if (existing) { existing.quantity += 1; return; }
            this.lines.push({
                itemCode: p.productCode, itemName: p.productName, quantity: 1,
                unitPrice: Number(p.sellingPrice ?? 0), discountAmount: 0
            });
        },
        setQty(i: number, v: number) { this.lines[i].quantity = v && v > 0 ? v : 1; },
        setPrice(i: number, v: number) { this.lines[i].unitPrice = v && v >= 0 ? v : 0; },
        setDiscount(i: number, v: number) { this.lines[i].discountAmount = v && v >= 0 ? v : 0; },
        removeLine(i: number) { this.lines.splice(i, 1); },
        /** Submit the update; `failTitle` is the already-translated alert title. */
        submit(failTitle: string) {
            if (this.submitting || !this.canConfirm) return;
            this.submitting = true;
            UpdateQuotation.getInstance().request({
                dataBody: {
                    quotationNo: this.quotationNo,
                    customerName: this.customerName.trim(),
                    customerPhone: this.customerPhone.trim() || undefined,
                    quotationDate: this.quotationDate,
                    remark: this.remark.trim() || undefined,
                    inventoryId: this.inventoryId,
                    itemList: this.lines.map((l) => ({
                        itemCode: l.itemCode, itemName: l.itemName, quantity: l.quantity,
                        unitPrice: l.unitPrice, discountAmount: l.discountAmount
                    }))
                },
                headers: { "Idempotency-Key": crypto.randomUUID() },
                listener: {
                    onSuccess: () => {
                        this.submitting = false;
                        this.redirectTo = "/SAL11000";
                    },
                    onFail: (err) => {
                        this.submitting = false;
                        POP.alert({ title: failTitle, status: "error", content: err?.message, errorCode: err?.code });
                    }
                }
            });
        }
    }
});
