import { defineStore } from "pinia";
import RetrievePackagingDetail from "@/services/api/SAL/retrievePackagingDetail";
import RetrieveProductList from "@/services/api/PRD/retrieveProductList";
import RetrieveSalePersonList from "@/services/api/SIV/retrieveSalePersonList";
import UpdatePackaging from "@/services/api/SAL/updatePackaging";
import POP from "@/core/utilities/pop";
import type { PackagingFormItem } from "@/store/POS/SAL/SAL31000Store";
import type { PackagingHeader, PackagingItem } from "@/models/POS/SAL/SAL30000";
import type { ProductListItem } from "@/models/PRD/PRD10000";
import type { SalePersonLookup } from "@/models/POS/COMMON/lookups";

/** SAL37000 packaging-EDIT store: refill from the detail (SAL34000I01), edit
 *  header + item quantities like the create form, submit the update (SAL37000I01).
 *  Mirrors the sale-return-edit (SAL27000) pattern. PENDING packagings only. */
export const SAL37000Store = defineStore("SAL37000Store", {
    state: () => ({
        packagingId: "",
        packagingCode: "",
        sourceType: "SALE" as string,
        saleCode: "",
        referenceNumber: "",
        notes: "",
        packerId: undefined as string | undefined,
        packers: [] as SalePersonLookup[],
        items: [] as PackagingFormItem[],
        productPick: undefined as string | undefined,
        productResults: [] as ProductListItem[],
        searchingProduct: false,
        productTimer: 0 as ReturnType<typeof setTimeout> | 0,
        loading: true,
        notFound: false,
        submitting: false,
        redirectTo: null as string | null
    }),
    getters: {
        canConfirm(state): boolean {
            return state.items.length > 0;
        }
    },
    actions: {
        loadPackers() {
            RetrieveSalePersonList.getInstance().request({
                dataBody: {},
                listener: {
                    onSuccess: (p: { salePersons?: SalePersonLookup[] }) => { this.packers = p.salePersons ?? []; }
                }
            });
        },
        /** Refill from the packaging detail (reuses SAL34000I01). */
        loadForEdit(packagingId: string) {
            this.packagingId = packagingId;
            if (!packagingId) { this.loading = false; this.notFound = true; return; }
            this.loading = true;
            RetrievePackagingDetail.getInstance().request({
                dataBody: { packagingId },
                listener: {
                    onSuccess: (p: { packaging?: PackagingHeader; items?: PackagingItem[]; itemList?: PackagingItem[] }) => {
                        const h = p?.packaging ?? (p as unknown as PackagingHeader);
                        const list = p?.items ?? p?.itemList ?? [];
                        if (!h?.packagingId) { this.notFound = true; this.loading = false; return; }
                        this.packagingCode = h.packagingCode ?? "";
                        this.sourceType = h.sourceType ?? "SALE";
                        this.saleCode = h.saleCode ?? "";
                        this.referenceNumber = h.referenceNumber ?? "";
                        this.notes = h.notes ?? "";
                        this.packerId = h.packerId;
                        this.items = list.map((it: PackagingItem, i: number) => ({
                            saleItemId: it.saleItemId,
                            productId: it.productId,
                            productCode: it.productCode,
                            productName: it.productName,
                            barcode: it.barcode,
                            unitName: it.unitName,
                            quantityRequired: Number(it.quantityRequired ?? 0),
                            sortOrder: it.sortOrder ?? i
                        }));
                        this.loading = false;
                    },
                    onFail: () => { this.notFound = true; this.loading = false; }
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
        /** Submit the update; `failTitle` is the already-translated alert title. */
        submit(failTitle: string) {
            if (this.submitting || !this.canConfirm) return;
            this.submitting = true;
            UpdatePackaging.getInstance().request({
                dataBody: {
                    packagingId: this.packagingId,
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
                headers: { "Idempotency-Key": crypto.randomUUID() },
                listener: {
                    onSuccess: () => { this.submitting = false; this.redirectTo = "/SAL30000"; },
                    onFail: (err) => {
                        this.submitting = false;
                        POP.alert({ title: failTitle, status: "error", content: err?.message, errorCode: err?.code });
                    }
                }
            });
        }
    }
});
