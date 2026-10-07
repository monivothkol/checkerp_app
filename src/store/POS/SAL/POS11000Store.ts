import { defineStore } from "pinia";
import RetrieveInventoryList from "@/services/api/INV/retrieveInventoryList";
import type {
    PosContextPaymentMethod,
    PosContextBank,
    PosContextCurrency
} from "@/services/api/POS/retrievePosContext";
import CreatePosSale from "@/services/api/POS/createPosSale";
import RetrieveCustomerList from "@/services/api/CUS/retrieveCustomerList";
import RetrieveCreditCheck from "@/services/api/POS/retrieveCreditCheck";
import RetrieveGroupPriceQuote from "@/services/api/POS/retrieveGroupPriceQuote";
import IndexedDBCache from "@/core/modules/indexeddb-cache";
import ReferenceData from "@/core/modules/reference-data";
import { getTenantContext } from "@/core/config/tenant-nav";
import type { CustomerLookup } from "@/models/POS/COMMON/lookups";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";

export interface CheckoutLine {
    productId: string;
    variantId?: string;
    variantName?: string;
    productName: string;
    actualPrice: number;      // standard price sent to the backend (promo applied server-side)
    displayPrice?: number;    // promo price shown/collected in the modal
    quantity: number;
    /** Product's own tax rate (%); undefined = the store default sales tax. */
    taxRate?: number;
    // A bundle line shows its name but is expanded into these real items at submit.
    bundleItems?: { productId: string; variantId?: string; quantity: number; bundlePrice: number }[];
}

/** Same arithmetic as the server's TaxCalc: exclusive adds tax on top, inclusive backs it out. */
export function lineTax(net: number, rate: number, inclusive: boolean): number {
    if (net <= 0 || rate <= 0) return 0;
    const f = rate / 100;
    const tax = inclusive ? net - net / (1 + f) : net * f;
    return Math.round(tax * 100) / 100;
}
/**
 * Price waterfall (mirrors the server): promotion/bundle price > customer-group
 * price > retail. A promo display price or a bundle wins outright; otherwise a
 * member group price replaces the retail price.
 */
function effectiveLinePrice(l: CheckoutLine, groupPrices: Record<string, number>): number {
    if (l.bundleItems) return l.actualPrice;            // bundle price is final
    if (l.displayPrice != null && l.displayPrice !== l.actualPrice) return l.displayPrice; // a promotion applied
    const gp = groupPrices[l.productId];
    return gp != null && gp > 0 ? gp : l.actualPrice;   // group price, else retail
}

interface Inventory {
    inventoryId: string;
    inventoryName: string;
    isDefault?: boolean;
}
export interface CheckoutPayment {
    paymentMethodId: string;
    amount: number;
    receivedAmount: number;
    changeAmount: number;
    referenceNumber?: string;
    notes?: string;
}

/** POS11000 checkout/pay modal store: pos-context lookups, per-method inputs, payment build + sale create. */
export const POS11000Store = defineStore("POS11000Store", {
    state: () => ({
        cartLines: [] as CheckoutLine[],
        subtotal: 0,
        // Member group prices for the cart (productId -> price); display-only,
        // the server re-resolves them authoritatively at submit.
        groupPrices: {} as Record<string, number>,
        // Customer: WALK_IN (default) / ONLINE_ORDER — manual name+phone, no credit check;
        // MEMBERSHIP — picked from the customer list (id/code/name/phone) + credit-checked.
        customerType: "WALK_IN" as "WALK_IN" | "ONLINE_ORDER" | "MEMBERSHIP",
        customerName: "",
        customerPhone: "",
        customerId: undefined as string | undefined,
        customerCode: "" as string,
        custResults: [] as CustomerLookup[],
        custPick: undefined as string | undefined,
        searchingCust: false,
        custTimer: 0 as ReturnType<typeof setTimeout> | 0,
        creditChecking: false,
        creditBlocked: false,
        creditMessage: "",
        inventories: [] as Inventory[],
        inventoryId: undefined as string | undefined,
        methods: [] as PosContextPaymentMethod[],
        banks: [] as PosContextBank[],
        currency: { primaryCurrency: "USD" } as PosContextCurrency,
        // From Sales Setting: default sales tax rate, pricing mode, and whether tax is charged at all.
        tax: { defaultRate: 0, inclusive: false, charge: true },
        loadingCtx: true,
        paymentMethodId: "",
        payCurrency: "USD",
        received: 0,
        bankCode: undefined as string | undefined,
        chequeNumber: "",
        chequeNote: "",
        confirming: false,
        processing: false,
        saved: false,
        savedSaleCode: undefined as string | undefined,
        idempotencyKey: "",
        inventoryApi: RetrieveInventoryList.getInstance(),
        createApi: CreatePosSale.getInstance(),
        customerApi: RetrieveCustomerList.getInstance(),
        creditApi: RetrieveCreditCheck.getInstance()
    }),
    getters: {
        /** Goods value before tax (promo / group prices applied). */
        netTotal(state): number {
            if (!Object.keys(state.groupPrices).length) return state.subtotal;
            return state.cartLines.reduce((sum, l) => sum + effectiveLinePrice(l, state.groupPrices) * l.quantity, 0);
        },
        /** Preview of the tax the server will compute: line rate, else the store default. */
        taxTotal(state): number {
            if (!state.tax.charge) return 0;
            const sum = state.cartLines.reduce((acc, l) => {
                const rate = l.taxRate ?? state.tax.defaultRate;
                return acc + lineTax(effectiveLinePrice(l, state.groupPrices) * l.quantity, rate, state.tax.inclusive);
            }, 0);
            return Math.round(sum * 100) / 100;
        },
        /** What the customer pays: net plus tax, unless prices already include it. */
        total(state): number {
            return Math.round((this.netTotal + (state.tax.inclusive ? 0 : this.taxTotal)) * 100) / 100;
        },
        primaryCurrency(state): string {
            return state.currency.primaryCurrency || "USD";
        },
        secondaryCurrency(state): string {
            return state.currency.secondaryCurrency || "";
        },
        exchangeRate(state): number {
            return Number(state.currency.exchangeRate) || 0;
        },
        hasSecondary(): boolean {
            return !!this.secondaryCurrency && this.exchangeRate > 0;
        },
        inSecondary(state): boolean {
            return this.isCash && state.payCurrency === this.secondaryCurrency && this.hasSecondary;
        },
        displayTotal(): number {
            return this.inSecondary ? this.total * this.exchangeRate : this.total;
        },
        displayNet(): number {
            return this.inSecondary ? this.netTotal * this.exchangeRate : this.netTotal;
        },
        displayTax(): number {
            return this.inSecondary ? this.taxTotal * this.exchangeRate : this.taxTotal;
        },
        change(state): number {
            return Math.max(0, Number(state.received || 0) - this.displayTotal);
        },
        selectedMethod(state): PosContextPaymentMethod | undefined {
            return state.methods.find((m) => m.paymentMethodId === state.paymentMethodId);
        },
        selectedMethodName(): string {
            return this.selectedMethod?.methodName ?? "";
        },
        isCash(): boolean {
            return this.selectedMethod?.methodCode === "CASH";
        },
        isKhqr(): boolean {
            return this.selectedMethod?.methodCode === "KHQR";
        },
        isBankTransfer(): boolean {
            return this.selectedMethod?.methodCode === "BANK_TRANSFER";
        },
        isCheque(): boolean {
            return this.selectedMethod?.methodCode === "CHEQUE";
        },
        canProcess(state): boolean {
            if (!state.cartLines.length || !state.paymentMethodId || !state.inventoryId) return false;
            if (state.creditBlocked) return false; // customer over credit limit / overdue
            if (this.isKhqr) return true;
            if (Number(state.received || 0) < this.displayTotal) return false;
            if (this.isBankTransfer && !state.bankCode) return false;
            return true;
        }
    },
    actions: {
        /** Reset + seed the modal from the parent cart (store is a singleton reused across opens). */
        /** What this line costs for the current customer: the lower of the promo
         *  display price and the member group price (mirrors server resolution). */
        linePrice(l: CheckoutLine): number {
            return effectiveLinePrice(l, this.groupPrices);
        },
        /** Fetch the member's group prices for the cart; clears on non-members. */
        loadGroupPrices() {
            this.groupPrices = {};
            if (this.customerType !== "MEMBERSHIP" || !this.customerId || !this.cartLines.length) {
                this.runCreditCheck();
                return;
            }
            const lines = this.cartLines
                .filter((l) => !l.bundleItems)
                .map((l) => ({ productId: l.productId }));
            if (!lines.length) { this.runCreditCheck(); return; }
            RetrieveGroupPriceQuote.getInstance().request({
                dataBody: { customerId: this.customerId, lines },
                listener: {
                    onSuccess: (p) => {
                        this.groupPrices = Object.fromEntries(
                            (p.priceList ?? []).map((r) => [r.productId, Number(r.groupPrice)]));
                        this.runCreditCheck(); // re-check credit against the member total
                    },
                    onFail: () => { this.runCreditCheck(); }
                }
            });
        },
        init(cartLines: CheckoutLine[], subtotal: number, inventoryId?: string) {
            this.cartLines = cartLines;
            this.subtotal = subtotal;
            this.customerType = "WALK_IN";
            this.customerName = "";
            this.customerPhone = "";
            this.customerId = undefined;
            this.customerCode = "";
            this.custResults = [];
            this.custPick = undefined;
            this.creditChecking = false;
            this.creditBlocked = false;
            this.creditMessage = "";
            this.inventories = [];
            // Pre-select the inventory chosen on the New Order screen — no need to pick again.
            this.inventoryId = inventoryId;
            this.methods = [];
            this.banks = [];
            this.currency = { primaryCurrency: "USD" };
            this.tax = { defaultRate: 0, inclusive: false, charge: true };
            this.loadingCtx = true;
            this.paymentMethodId = "";
            this.payCurrency = "USD";
            this.received = 0;
            this.bankCode = undefined;
            this.chequeNumber = "";
            this.chequeNote = "";
            this.confirming = false;
            this.processing = false;
            this.saved = false;
            this.savedSaleCode = undefined;
            this.idempotencyKey = globalThis.crypto?.randomUUID?.() ?? String(Date.now());
        },
        /** Convert a value entered in payCurrency back to primary (USD) for storage. */
        toPrimary(v: number): number {
            return this.inSecondary && this.exchangeRate > 0 ? v / this.exchangeRate : v;
        },
        async loadInventories() {
            // Inventory is common reference data — cache-first (INV namespace, WS-invalidated),
            // per-tenant keyed; a FAILED fetch rejects so it is never cached (no blank picker).
            const key = `INV:list:${getTenantContext().subdomain}`;
            try {
                this.inventories = await IndexedDBCache.resolve<Inventory[]>(key, () => new Promise((resolve, reject) => {
                    this.inventoryApi.request({
                        dataBody: { pageNo: 1, pageSize: 100, isActive: true },
                        listener: {
                            onSuccess: (p) => resolve((p.inventoryList ?? []) as Inventory[]),
                            onFail: (e) => reject(e instanceof Error ? e : Object.assign(new Error((e as { message?: string } | undefined)?.message ?? "inventory fetch failed"), e ?? {}))
                        }
                    });
                }), 60 * 60_000);
            } catch {
                this.inventories = [];
            }
            // Keep the pre-selected inventory (from New Order); only default if none was passed.
            if (!this.inventoryId) {
                const def = this.inventories.find((i) => i.isDefault) ?? this.inventories[0];
                this.inventoryId = def?.inventoryId;
            }
        },
        /** Switch customer type; clears any selected member + credit state. */
        setCustomerType(type: "WALK_IN" | "ONLINE_ORDER" | "MEMBERSHIP") {
            this.customerType = type;
            this.customerId = undefined;
            this.customerCode = "";
            this.custPick = undefined;
            this.custResults = [];
            this.groupPrices = {}; // back to standard pricing until a member is picked
            this.creditBlocked = false;
            this.creditMessage = "";
            if (type !== "MEMBERSHIP") {
                // Walk-in / online: manual entry, no saved customer, no credit gate.
                this.customerName = "";
                this.customerPhone = "";
            }
        },
        /** Debounced membership-customer search (name / code / phone). */
        searchCustomers(kw: string) {
            if (this.custTimer) clearTimeout(this.custTimer);
            this.searchingCust = true;
            this.custTimer = setTimeout(() => {
                this.customerApi.request({
                    dataBody: { searchKeyword: kw, pageNo: 1, pageSize: 20 },
                    listener: {
                        onSuccess: (p) => { this.custResults = p.customerList ?? []; this.searchingCust = false; },
                        onFail: () => { this.searchingCust = false; }
                    }
                });
            }, 300);
        },
        /** Pick a member: capture id/code/name/phone, then run the credit gate. */
        onPickCustomer(customerId: string) {
            const c = this.custResults.find((x) => x.customerId === customerId);
            this.custPick = undefined;
            if (!c) return;
            this.customerId = c.customerId;
            this.customerCode = c.customerCode ?? "";
            this.customerName = c.customerName ?? "";
            this.customerPhone = c.phone ?? "";
            this.loadGroupPrices();
        },
        /** Ask the server whether this member may check out for the current total. */
        runCreditCheck() {
            if (this.customerType !== "MEMBERSHIP" || !this.customerId) {
                this.creditBlocked = false;
                this.creditMessage = "";
                return;
            }
            this.creditChecking = true;
            this.creditApi.request({
                dataBody: { customerId: this.customerId, amount: this.total },
                listener: {
                    onSuccess: (r) => {
                        this.creditBlocked = !!r.blocked;
                        this.creditMessage = r.message ?? "";
                        this.creditChecking = false;
                    },
                    // Fail-open in the UI: the server re-checks authoritatively on submit.
                    onFail: () => { this.creditBlocked = false; this.creditMessage = ""; this.creditChecking = false; }
                }
            });
        },
        async loadContext() {
            // Payment methods / banks / currency are common reference data — cached, not per-screen.
            const ref = await ReferenceData.get();
            this.methods = (ref.paymentMethods ?? []) as PosContextPaymentMethod[];
            this.banks = (ref.banks ?? []) as PosContextBank[];
            this.currency = (ref.currency ?? { primaryCurrency: "USD" }) as PosContextCurrency;
            const taxCfg = ref.tax ?? {};
            const def = (ref.taxRates ?? []).find((r) => r.taxId === taxCfg.defaultSalesTaxId);
            this.tax = { defaultRate: Number(def?.rate ?? 0), inclusive: !!taxCfg.pricesIncludeTax, charge: taxCfg.customerPayVat !== false };
            this.payCurrency = this.primaryCurrency;
            const cash = this.methods.find((m) => m.methodCode === "CASH");
            this.paymentMethodId = cash?.paymentMethodId ?? this.methods[0]?.paymentMethodId ?? "";
            this.loadingCtx = false;
        },
        /** Reset per-method inputs on method change; prefill received with the exact total. */
        onMethodChanged() {
            this.payCurrency = this.primaryCurrency;
            this.bankCode = undefined;
            this.chequeNumber = "";
            this.chequeNote = "";
            this.received = this.total;
        },
        /** Keep the prefilled received in step with the chosen currency. */
        onCurrencyChanged() {
            this.received = this.displayTotal;
        },
        buildPayment(): CheckoutPayment {
            const receivedPrimary = this.toPrimary(Number(this.received || 0));
            const changePrimary = Math.max(0, receivedPrimary - this.total);
            let referenceNumber: string | undefined;
            let notes: string | undefined;
            if (this.isBankTransfer) referenceNumber = this.bankCode;
            if (this.isCheque) {
                referenceNumber = this.chequeNumber || undefined;
                notes = this.chequeNote || undefined;
            }
            if (this.inSecondary) {
                notes = `Received ${UT.currency(this.received, this.secondaryCurrency)} ${this.secondaryCurrency}`;
            }
            return {
                paymentMethodId: this.paymentMethodId,
                amount: this.total,
                receivedAmount: receivedPrimary,
                changeAmount: changePrimary,
                referenceNumber,
                notes
            };
        },
        buildKhqrPayment(txnId?: string, manual?: boolean): CheckoutPayment {
            return {
                paymentMethodId: this.paymentMethodId,
                amount: this.total,
                receivedAmount: this.total,
                changeAmount: 0,
                referenceNumber: txnId,
                notes: manual ? "KHQR (manual confirm)" : undefined
            };
        },
        submitSale(payment: CheckoutPayment, failTitle: string) {
            if (this.processing) return;
            this.processing = true;
            const payload = {
                inventoryId: this.inventoryId,
                customerType: this.customerType,
                customerId: this.customerType === "MEMBERSHIP" ? this.customerId : undefined,
                customerName: this.customerName || undefined,
                customerPhone: this.customerPhone || undefined,
                // Expand bundle lines into their real items at the bundle price (flagged so
                // the backend never re-discounts them); each component keeps the bundle's
                // identity (name + promotion id) so the sale/invoice can group them back.
                // Product lines pass through unchanged.
                items: this.cartLines.flatMap((l): Record<string, unknown>[] =>
                    l.bundleItems?.length
                        ? l.bundleItems.map((bi) => ({
                            productId: bi.productId,
                            variantId: bi.variantId,
                            quantity: bi.quantity * l.quantity,
                            actualSellingPrice: bi.bundlePrice,
                            isBundleItem: true,
                            isBundle: true,
                            bundleName: l.productName,
                            bundleDetails: l.productId.startsWith("bundle:")
                                ? l.productId.slice("bundle:".length)
                                : undefined
                        }))
                        : [{ productId: l.productId, variantId: l.variantId, quantity: l.quantity, actualSellingPrice: l.actualPrice }]
                ),
                taxAmount: this.taxTotal, // preview only; the server recomputes from rates
                payments: [payment]
            };
            this.createApi.request({
                dataBody: payload,
                headers: { "Idempotency-Key": this.idempotencyKey },
                listener: {
                    onSuccess: (p: { saleCode?: string }) => {
                        this.processing = false;
                        this.savedSaleCode = p.saleCode;
                        this.saved = true;
                    },
                    onFail: (err: { message?: string; code?: string }) => {
                        this.processing = false;
                        this.confirming = false;
                        POP.alert({ title: failTitle, status: "error", content: err?.message, errorCode: err?.code });
                    }
                }
            });
        }
    }
});
