import { defineStore } from "pinia";
import RetrieveSaleInvoice from "@/services/api/SIV/retrieveSaleInvoice";
import RetrieveCustomerList from "@/services/api/CUS/retrieveCustomerList";
import RetrieveSalePersonList from "@/services/api/SIV/retrieveSalePersonList";
import RetrieveProductList from "@/services/api/PRD/retrieveProductList";
import UpdateSaleInvoice from "@/services/api/SIV/updateSaleInvoice";
import POP from "@/core/utilities/pop";
import type { SaleInvoice } from "@/models/POS/invoice";
import type { InvoiceLine } from "@/models/POS/SIV/SIV11000";
import type { SIV15000UpdatePayload, SIV15000UpdateResponse } from "@/models/POS/SIV/SIV15000";
import type { CustomerLookup, SalePersonLookup } from "@/models/POS/COMMON/lookups";
import type { ProductListItem } from "@/models/PRD/PRD10000";

/** SIV15000 invoice edit-form store: loads the invoice, edits lines like the
 *  create form, and saves via SIV15000 (payments untouched — Pay is a modal). */
export const SIV15000Store = defineStore("SIV15000Store", {
    state: () => ({
        loading: true,
        notFound: false,
        saleCode: "",
        // header prefill + read-only balance context
        totalAmount: 0,
        paidAmount: 0,
        creditAppliedAmount: 0,
        paymentStatus: "",
        customers: [] as CustomerLookup[],
        salePersons: [] as SalePersonLookup[],
        sellType: "retail",
        customerName: undefined as string | undefined,
        customerPhone: undefined as string | undefined,
        salePersonId: undefined as string | undefined,
        productPick: undefined as string | undefined,
        freePick: undefined as string | undefined,
        productResults: [] as ProductListItem[],
        searching: false,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        lines: [] as InvoiceLine[],
        invoiceDiscount: 0,
        note: "",
        submitting: false,
        redirectTo: null as string | null,
        invoiceApi: RetrieveSaleInvoice.getInstance(),
        customerApi: RetrieveCustomerList.getInstance(),
        salePersonApi: RetrieveSalePersonList.getInstance(),
        productApi: RetrieveProductList.getInstance(),
        updateApi: UpdateSaleInvoice.getInstance()
    }),
    getters: {
        subtotal(state): number {
            return state.lines.reduce((s, l) => s + Number(l.actualPrice || 0) * Number(l.quantity || 0), 0);
        },
        lineDiscountTotal(state): number {
            return state.lines.reduce((s, l) => s + Number(l.discount || 0), 0);
        },
        total(): number {
            return Math.max(0, this.subtotal - this.lineDiscountTotal - Number(this.invoiceDiscount || 0));
        },
        settled(state): number {
            return Number(state.paidAmount || 0) + Number(state.creditAppliedAmount || 0);
        },
        balance(): number {
            return Math.max(0, this.total - this.settled);
        },
        /** New total may not go below what is already settled (backend rule). */
        belowPaid(): boolean {
            return this.total < this.settled;
        },
        canSave(state): boolean {
            return state.lines.length > 0 && !this.belowPaid && !state.submitting;
        }
    },
    actions: {
        lineTotal(l: InvoiceLine): number {
            return Number(l.actualPrice || 0) * Number(l.quantity || 0) - Number(l.discount || 0);
        },
        /** Load the invoice by saleCode and prefill the edit form. */
        load(saleCode: string) {
            this.saleCode = saleCode;
            this.notFound = false;
            if (!saleCode) { this.loading = false; this.notFound = true; return; }
            this.loading = true;
            this.invoiceApi.request({
                dataBody: { saleCode },
                listener: {
                    onSuccess: (p: SaleInvoice) => { this.prefill(p); this.loading = false; },
                    onFail: () => { this.notFound = true; this.loading = false; }
                }
            });
        },
        prefill(p: SaleInvoice) {
            this.totalAmount = Number(p.totalAmount ?? 0);
            this.paidAmount = Number(p.paidAmount ?? 0);
            this.creditAppliedAmount = Number(p.creditAppliedAmount ?? 0);
            this.paymentStatus = p.paymentStatus ?? "";
            this.customerName = p.customerName || undefined;
            this.customerPhone = p.customerPhone || undefined;
            this.salePersonId = p.salePersonId || undefined;
            this.note = p.notes ?? "";
            this.invoiceDiscount = Number(p.manualInvoiceDiscount ?? 0);
            this.sellType = p.items?.find((i) => i.sellType)?.sellType ?? "retail";
            this.lines = (p.items ?? []).filter((i) => i.productId).map((i) => ({
                productId: i.productId as string,
                productCode: i.productCode,
                productName: i.productName ?? "",
                actualPrice: i.isFreeItem ? 0 : Number(i.unitPrice ?? 0),
                standardPrice: Number(i.standardPrice ?? i.unitPrice ?? 0),
                quantity: Number(i.quantity ?? 1),
                discount: i.isFreeItem ? 0 : Number(i.discountAmount ?? 0),
                isFree: !!i.isFreeItem
            }));
        },
        loadLookups() {
            this.customerApi.request({
                dataBody: { pageNo: 1, pageSize: 200 },
                listener: {
                    onSuccess: (p: { customerList?: CustomerLookup[] }) => { this.customers = p.customerList ?? []; }
                }
            });
            this.salePersonApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p: { salePersons?: SalePersonLookup[] }) => { this.salePersons = p.salePersons ?? []; }
                }
            });
        },
        searchProducts(kw: string) {
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searching = true;
            this.searchTimer = setTimeout(() => {
                this.productApi.request({
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
            const existing = this.lines.find((l) => l.productId === productId && !l.isFree);
            if (existing) { existing.quantity += 1; return; }
            this.lines.push({
                productId: p.productId,
                productCode: p.productCode,
                productName: p.productName,
                actualPrice: Number(p.sellingPrice ?? 0),
                standardPrice: Number(p.sellingPrice ?? 0),
                quantity: 1,
                discount: 0
            });
        },
        onPickFree(productId: string) {
            const p = this.productResults.find((x) => x.productId === productId);
            this.freePick = undefined;
            if (!p) return;
            const existing = this.lines.find((l) => l.productId === productId && l.isFree);
            if (existing) { existing.quantity += 1; return; }
            this.lines.push({
                productId: p.productId,
                productCode: p.productCode,
                productName: p.productName,
                actualPrice: 0,
                standardPrice: Number(p.sellingPrice ?? 0),
                quantity: 1,
                discount: 0,
                isFree: true
            });
        },
        setQty(i: number, v: number) { this.lines[i].quantity = v && v > 0 ? v : 1; },
        setPrice(i: number, v: number) { this.lines[i].actualPrice = v && v >= 0 ? v : 0; },
        setDiscount(i: number, v: number) { this.lines[i].discount = v && v >= 0 ? v : 0; },
        removeLine(i: number) { this.lines.splice(i, 1); },
        /** Save the edit; `failTitle` is the translated alert title (i18n stays in the screen). */
        submit(failTitle: string) {
            if (!this.canSave) return;
            this.submitting = true;
            const payload: SIV15000UpdatePayload = {
                saleCode: this.saleCode,
                sellType: this.sellType,
                customerName: this.customerName || undefined,
                customerPhone: this.customerPhone || undefined,
                salePersonId: this.salePersonId || undefined,
                notes: this.note || undefined,
                manualInvoiceDiscount: Number(this.invoiceDiscount || 0),
                items: this.lines.map((l) => ({
                    productId: l.productId,
                    quantity: l.quantity,
                    actualSellingPrice: l.isFree ? 0 : l.actualPrice,
                    discountAmount: l.isFree ? 0 : l.discount,
                    isFreeItem: !!l.isFree
                }))
            };
            this.updateApi.request({
                dataBody: payload,
                headers: { "Idempotency-Key": crypto.randomUUID() },
                listener: {
                    onSuccess: (p: SIV15000UpdateResponse) => {
                        this.submitting = false;
                        this.redirectTo = `/SIV13000?saleCode=${encodeURIComponent(p.saleCode ?? this.saleCode)}`;
                    },
                    onFail: (err: { message?: string; code?: string }) => {
                        this.submitting = false;
                        POP.alert({ title: failTitle, status: "error", content: err?.message, errorCode: err?.code });
                    }
                }
            });
        }
    }
});
