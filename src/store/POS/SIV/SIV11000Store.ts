import { defineStore } from "pinia";
import RetrieveInventoryList from "@/services/api/INV/retrieveInventoryList";
import RetrieveCustomerList from "@/services/api/CUS/retrieveCustomerList";
import RetrieveSalePersonList from "@/services/api/SIV/retrieveSalePersonList";
import RetrievePosContext from "@/services/api/POS/retrievePosContext";
import RetrieveQuotationDetail from "@/services/api/SAL/retrieveQuotationDetail";
import RetrieveGroupPriceQuote from "@/services/api/POS/retrieveGroupPriceQuote";
import RetrieveProductList from "@/services/api/PRD/retrieveProductList";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { InvoiceLine, SIV11000CreatePayload } from "@/models/POS/SIV/SIV11000";
import type { InventoryLookup, CustomerLookup, SalePersonLookup, PaymentMethodLookup } from "@/models/POS/COMMON/lookups";
import type { ProductListItem } from "@/models/PRD/PRD10000";

/** SIV11000 invoice create-form store: lookups, cart lines, totals, and draft handoff to SIV12000. */
export const SIV11000Store = defineStore("SIV11000Store", {
    state: () => ({
        inventories: [] as InventoryLookup[],
        customers: [] as CustomerLookup[],
        salePersons: [] as SalePersonLookup[],
        paymentMethods: [] as PaymentMethodLookup[],
        inventoryId: undefined as string | undefined,
        sellType: "retail",
        customerName: undefined as string | undefined,
        customerId: undefined as string | undefined,
        // member group prices for the current lines (productId -> price)
        groupPrices: {} as Record<string, number>,
        salePersonId: undefined as string | undefined,
        productPick: undefined as string | undefined,
        freePick: undefined as string | undefined,
        productResults: [] as ProductListItem[],
        searching: false,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        lines: [] as InvoiceLine[],
        invoiceDiscount: 0,
        paymentMethodId: undefined as string | undefined,
        paidAmount: 0,
        note: "",
        sourceQuotationNo: "",
        inventoryApi: RetrieveInventoryList.getInstance(),
        customerApi: RetrieveCustomerList.getInstance(),
        salePersonApi: RetrieveSalePersonList.getInstance(),
        posContextApi: RetrievePosContext.getInstance(),
        productApi: RetrieveProductList.getInstance()
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
        balance(): number {
            return Math.max(0, this.total - Number(this.paidAmount || 0));
        },
        canConfirm(state): boolean {
            return state.lines.length > 0;
        }
    },
    actions: {
        lineTotal(l: InvoiceLine): number {
            return Number(l.actualPrice || 0) * Number(l.quantity || 0) - Number(l.discount || 0);
        },
        /** Deep link from a quotation: prefill customer + lines from its detail.
         *  The source code is kept so the created invoice marks it SOLD. */
        prefillFromQuotation(quotationNo: string) {
            this.sourceQuotationNo = quotationNo;
            RetrieveQuotationDetail.getInstance().request({
                dataBody: { quotationNo },
                listener: {
                    onSuccess: (q) => {
                        this.customerName = q.customerName || this.customerName;
                        this.note = q.remark || this.note;
                        this.lines = (q.itemList ?? [])
                            .filter((it) => it.productId)
                            .map((it) => ({
                                productId: String(it.productId),
                                productCode: it.productCode,
                                variantId: it.variantId,
                                variantName: it.variantName,
                                productName: String(it.productName ?? it.productCode ?? ""),
                                actualPrice: Number(it.unitPrice ?? 0),
                                standardPrice: Number(it.unitPrice ?? 0),
                                quantity: Number(it.quantity ?? 1),
                                discount: Number(it.discountAmount ?? 0),
                                isFree: false
                            }));
                    },
                    onFail: () => { /* fall back to a blank form */ }
                }
            });
        },
        loadLookups() {
            this.inventoryApi.request({
                dataBody: { pageNo: 1, pageSize: 100, isActive: true },
                listener: {
                    onSuccess: (p: { inventoryList?: InventoryLookup[] }) => {
                        this.inventories = p.inventoryList ?? [];
                        const def = this.inventories.find((i) => i.isDefault) ?? this.inventories[0];
                        this.inventoryId = def?.inventoryId;
                    }
                }
            });
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
            this.posContextApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p: { paymentMethods?: PaymentMethodLookup[] }) => {
                        this.paymentMethods = p.paymentMethods ?? [];
                        const cash = this.paymentMethods.find((m) => m.methodCode === "CASH");
                        this.paymentMethodId = cash?.paymentMethodId ?? this.paymentMethods[0]?.paymentMethodId;
                    }
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
        onPickProduct(productId: string, variant?: { variantId: string; variantName?: string; sellingPrice?: number }) {
            const p = this.productResults.find((x) => x.productId === productId);
            this.productPick = undefined;
            if (!p) return;
            const existing = this.lines.find((l) => l.productId === productId && l.variantId === variant?.variantId && !l.isFree);
            if (existing) { existing.quantity += 1; return; }
            const retail = Number(variant?.sellingPrice ?? p.sellingPrice ?? 0);
            const gp = this.groupPrices[p.productId];
            this.lines.push({
                productId: p.productId,
                variantId: variant?.variantId,
                variantName: variant?.variantName,
                productCode: p.productCode,
                productName: p.productName,
                actualPrice: gp != null && gp > 0 ? gp : retail,
                standardPrice: retail,
                quantity: 1,
                discount: 0
            });
        },
        /** Select a member by name: resolve id, load group prices, re-price the form. */
        setCustomer(name?: string) {
            this.customerName = name || undefined;
            this.customerId = this.customers.find((c) => c.customerName === name)?.customerId;
            this.loadGroupPrices();
        },
        loadGroupPrices() {
            this.groupPrices = {};
            if (!this.customerId || !this.lines.length) { this.applyGroupPrices(); return; }
            const lines = [...new Set(this.lines.map((l) => l.productId))].map((productId) => ({ productId }));
            RetrieveGroupPriceQuote.getInstance().request({
                dataBody: { customerId: this.customerId, lines },
                listener: {
                    onSuccess: (p) => {
                        this.groupPrices = Object.fromEntries((p.priceList ?? []).map((r) => [r.productId, Number(r.groupPrice)]));
                        this.applyGroupPrices();
                    },
                    onFail: () => { this.applyGroupPrices(); }
                }
            });
        },
        /** Push group prices onto non-manual, non-free lines; revert others to retail. */
        applyGroupPrices() {
            for (const l of this.lines) {
                if (l.isFree || l.manual) continue;
                const gp = this.groupPrices[l.productId];
                l.actualPrice = gp != null && gp > 0 ? gp : Number(l.standardPrice ?? l.actualPrice);
            }
        },
        // Free item: a real product added at price 0, flagged free (still deducts stock).
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
        setPrice(i: number, v: number) { this.lines[i].actualPrice = v && v >= 0 ? v : 0; this.lines[i].manual = true; },
        setDiscount(i: number, v: number) { this.lines[i].discount = v && v >= 0 ? v : 0; },
        removeLine(i: number) { this.lines.splice(i, 1); },
        /** Validate + stash the SIV draft; `walkInLabel` is the translated walk-in fallback (i18n stays in the screen). */
        buildAndSaveDraft(walkInLabel: string): boolean {
            if (!this.canConfirm) return false;
            const paid = Number(this.paidAmount || 0);
            const payload: SIV11000CreatePayload = {
                inventoryId: this.inventoryId,
                sellType: this.sellType,
                customerName: this.customerName || undefined,
                // Resolve the picked name back to its customer so server-side
                // group pricing (and credit checks) key off the real customer.
                customerId: this.customerId ?? this.customers.find((c) => c.customerName === this.customerName)?.customerId,
                salePersonId: this.salePersonId || undefined,
                notes: this.note || undefined,
                quotationNo: this.sourceQuotationNo || undefined,
                manualInvoiceDiscount: Number(this.invoiceDiscount || 0),
                items: this.lines.map((l) => ({
                    productId: l.productId,
                    variantId: l.variantId,
                    quantity: l.quantity,
                    actualSellingPrice: l.isFree ? 0 : l.actualPrice,
                    discountAmount: l.isFree ? 0 : l.discount,
                    isFreeItem: !!l.isFree
                })),
                payments: paid > 0 && this.paymentMethodId
                    ? [{
                        paymentMethodId: this.paymentMethodId,
                        amount: Math.min(paid, this.total),
                        receivedAmount: paid,
                        changeAmount: Math.max(0, paid - this.total)
                    }]
                    : []
            };
            ModuleFlowStore.saveDraft("SIV", {
                payload,
                idempotencyKey: crypto.randomUUID(),
                display: {
                    customerName: this.customerName || walkInLabel,
                    lines: this.lines.map((l) => ({ name: l.productName, qty: l.quantity, amount: this.lineTotal(l), free: !!l.isFree })),
                    subtotal: this.subtotal,
                    invoiceDiscount: Number(this.invoiceDiscount || 0),
                    total: this.total,
                    paid,
                    balance: this.balance
                }
            });
            return true;
        }
    }
});
