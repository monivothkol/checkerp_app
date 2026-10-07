import { defineStore } from "pinia";
import RetrieveSupplierList from "@/services/api/SUP/retrieveSupplierList";
import RetrieveInventoryList from "@/services/api/INV/retrieveInventoryList";
import RetrievePurchaseOrderList from "@/services/api/PUR/retrievePurchaseOrderList";
import RetrievePurchaseOrderDetail from "@/services/api/PUR/retrievePurchaseOrderDetail";
import RetrieveProductList from "@/services/api/PRD/retrieveProductList";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import ReferenceData from "@/core/modules/reference-data";
import type { SupplierLookup, InventoryLookup } from "@/models/POS/COMMON/lookups";
import type { ProductListItem } from "@/models/PRD/PRD10000";
import type { PurchaseOrderRow } from "@/models/POS/PUR/PUR10000";
import type { PurchaseInLine, PoOption } from "@/models/POS/PUR/PUR21000";

// Pure per-line math (no store state) — shared by getters and actions.
function lineBaseOf(l: PurchaseInLine): number {
    return Number(l.unitCost || 0) * Number(l.quantity || 0) - Number(l.discountAmount || 0);
}
function lineTaxOf(l: PurchaseInLine): number {
    return Math.max(0, lineBaseOf(l)) * (Number(l.taxRate || 0) / 100);
}
function lineTotalOf(l: PurchaseInLine): number {
    return lineBaseOf(l) + lineTaxOf(l);
}

/** PUR21000 purchase-in create-form store: lookups, line building, and draft handoff to PUR22000. */
export const PUR21000Store = defineStore("PUR21000Store", {
    state: () => ({
        // Store default purchase tax rate (%), from cached reference data.
        defaultPurchaseTaxRate: 0,
        suppliers: [] as SupplierLookup[],
        loadingSuppliers: false,
        inventories: [] as InventoryLookup[],
        loadingInventories: false,
        pos: [] as PurchaseOrderRow[],
        loadingPos: false,
        supplierId: undefined as string | undefined,
        inventoryId: undefined as string | undefined,
        purchaseOrderId: undefined as string | undefined,
        supplierInvoiceId: "",
        notes: "",
        productPick: undefined as string | undefined,
        productResults: [] as ProductListItem[],
        searching: false,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        lines: [] as PurchaseInLine[],
        supplierApi: RetrieveSupplierList.getInstance(),
        inventoryApi: RetrieveInventoryList.getInstance(),
        poApi: RetrievePurchaseOrderList.getInstance(),
        productApi: RetrieveProductList.getInstance()
    }),
    getters: {
        poOptions(state): PoOption[] {
            // PO lookup is client-side: list the first 100 POs and drop cancelled ones.
            return state.pos
                .filter((po) => po.status !== "CANCELLED")
                .map((po) => ({ poId: po.poId, label: `${po.poCode} — ${po.supplierName ?? ""}` }));
        },
        subTotal(state): number {
            return state.lines.reduce((s, l) => s + Number(l.unitCost || 0) * Number(l.quantity || 0), 0);
        },
        discountTotal(state): number {
            return state.lines.reduce((s, l) => s + Number(l.discountAmount || 0), 0);
        },
        taxTotal(state): number {
            return state.lines.reduce((s, l) => s + lineTaxOf(l), 0);
        },
        grandTotal(): number {
            return Math.max(0, this.subTotal - this.discountTotal + this.taxTotal);
        },
        canConfirm(state): boolean {
            return !!state.supplierId && !!state.inventoryId && state.lines.length > 0;
        }
    },
    actions: {
        lineBase(l: PurchaseInLine): number { return lineBaseOf(l); },
        lineTax(l: PurchaseInLine): number { return lineTaxOf(l); },
        lineTotal(l: PurchaseInLine): number { return lineTotalOf(l); },
        /** Default purchase tax rate for new lines; a product with its own tax overrides it. */
        async loadTaxDefaults() {
            const ref = await ReferenceData.get();
            const def = (ref.taxRates ?? []).find((r) => r.taxId === ref.tax?.defaultPurchaseTaxId);
            this.defaultPurchaseTaxRate = Number(def?.rate ?? 0);
        },
        loadSuppliers() {
            this.loadingSuppliers = true;
            this.supplierApi.request({
                dataBody: { pageNo: 1, pageSize: 200 },
                listener: {
                    onSuccess: (p) => { this.suppliers = p.supplierList ?? []; this.loadingSuppliers = false; },
                    onFail: () => { this.loadingSuppliers = false; }
                }
            });
        },
        loadInventories() {
            this.loadingInventories = true;
            this.inventoryApi.request({
                dataBody: { pageNo: 1, pageSize: 200 },
                listener: {
                    onSuccess: (p) => { this.inventories = p.inventoryList ?? []; this.loadingInventories = false; },
                    onFail: () => { this.loadingInventories = false; }
                }
            });
        },
        loadPos() {
            this.loadingPos = true;
            this.poApi.request({
                dataBody: { pageNo: 1, pageSize: 100 },
                listener: {
                    onSuccess: (p) => { this.pos = p.poList ?? []; this.loadingPos = false; },
                    onFail: () => { this.loadingPos = false; }
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
                        onSuccess: (p) => { this.productResults = p.productList ?? []; this.searching = false; },
                        onFail: () => { this.searching = false; }
                    }
                });
            }, 250);
        },
        /** Deep link from a PO: prefill supplier, inventory, the PO link and its
         *  outstanding lines (ordered - already received). */
        loadFromPurchaseOrder(poId: string) {
            if (!poId) return;
            this.loadingPos = true;
            RetrievePurchaseOrderDetail.getInstance().request({
                dataBody: { poId },
                listener: {
                    onSuccess: (p: { po?: any; header?: any; items?: any[]; itemList?: any[] }) => {
                        const h = p.po ?? p.header ?? {};
                        const items = p.items ?? p.itemList ?? h.items ?? h.itemList ?? [];
                        this.supplierId = h.supplierId ?? this.supplierId;
                        this.inventoryId = h.inventoryId ?? this.inventoryId;
                        this.purchaseOrderId = h.poId ?? poId;
                        this.lines = items
                            .filter((it: any) => it.productId)
                            .map((it: any) => {
                                const remaining = Math.max(0, Number(it.orderedQuantity ?? 0) - Number(it.receivedQuantity ?? 0));
                                return {
                                    productId: String(it.productId),
                                    productCode: it.productCode ?? "",
                                    productName: String(it.productName ?? it.productCode ?? ""),
                                    quantity: remaining > 0 ? remaining : Number(it.orderedQuantity ?? 1),
                                    unitCost: Number(it.unitCost ?? 0),
                                    discountAmount: Number(it.discountAmount ?? 0),
                                    taxRate: Number(it.taxRate ?? 0),
                                    taxRecoverable: true
                                };
                            });
                        this.loadingPos = false;
                    },
                    onFail: () => { this.loadingPos = false; }
                }
            });
        },
        /** `variant` is set when the product has variants (the screen asks first). */
        onPickProduct(productId: string, variant?: { variantId: string; variantName?: string }) {
            const p = this.productResults.find((x) => x.productId === productId);
            this.productPick = undefined;
            if (!p) return;
            const existing = this.lines.find((l) => l.productId === p.productId && l.variantId === variant?.variantId);
            if (existing) { existing.quantity += 1; return; }
            this.lines.push({
                productId: p.productId,
                productCode: p.productCode,
                productName: p.productName,
                variantId: variant?.variantId,
                variantName: variant?.variantName,
                quantity: 1,
                unitCost: Number(p.costPrice ?? p.sellingPrice ?? 0),
                discountAmount: 0,
                taxRate: Number(p.taxRatePct ?? this.defaultPurchaseTaxRate ?? 0),
                taxRecoverable: true,
                expiryDate: ""
            });
        },
        setExpiry(i: number, v: string) { this.lines[i].expiryDate = v || ""; },
        setQty(i: number, v: number) { this.lines[i].quantity = v && v > 0 ? v : 1; },
        setCost(i: number, v: number) { this.lines[i].unitCost = v && v >= 0 ? v : 0; },
        setDiscount(i: number, v: number) { this.lines[i].discountAmount = v && v >= 0 ? v : 0; },
        setTaxRate(i: number, v: number) { this.lines[i].taxRate = Math.max(0, Math.min(100, Number(v ?? 0) || 0)); },
        setRecoverable(i: number, v: boolean) { this.lines[i].taxRecoverable = !!v; },
        removeLine(i: number) { this.lines.splice(i, 1); },
        /** Validate + stash the PURIN draft; returns true when saved (screen then navigates). */
        buildAndSaveDraft(): boolean {
            if (!this.canConfirm) return false;
            const supplier = this.suppliers.find((s) => s.supplierId === this.supplierId);
            const inventory = this.inventories.find((inv) => inv.inventoryId === this.inventoryId);
            const po = this.poOptions.find((p) => p.poId === this.purchaseOrderId);
            ModuleFlowStore.saveDraft("PURIN", {
                payload: {
                    supplierId: this.supplierId,
                    inventoryId: this.inventoryId,
                    purchaseOrderId: this.purchaseOrderId || undefined,
                    supplierInvoiceId: this.supplierInvoiceId.trim() || undefined,
                    notes: this.notes.trim() || undefined,
                    itemList: this.lines.map((l) => ({
                        productId: l.productId,
                        variantId: l.variantId,
                        quantity: l.quantity,
                        unitCost: l.unitCost,
                        discountAmount: l.discountAmount,
                        taxRate: l.taxRate,
                        taxRecoverable: l.taxRecoverable,
                        expiryDate: l.expiryDate || undefined
                    }))
                },
                idempotencyKey: crypto.randomUUID(),
                display: {
                    supplierName: supplier?.supplierName ?? supplier?.contactName ?? "",
                    inventoryName: inventory?.inventoryName ?? "",
                    poLabel: po?.label ?? "",
                    supplierInvoiceId: this.supplierInvoiceId.trim(),
                    lines: this.lines.map((l) => ({
                        name: l.productName,
                        code: l.productCode,
                        variantName: l.variantName,
                        qty: l.quantity,
                        cost: l.unitCost,
                        discount: l.discountAmount,
                        taxRate: l.taxRate,
                        tax: lineTaxOf(l),
                        recoverable: l.taxRecoverable,
                        amount: lineTotalOf(l)
                    })),
                    subTotal: this.subTotal,
                    discountTotal: this.discountTotal,
                    taxTotal: this.taxTotal,
                    grandTotal: this.grandTotal
                }
            });
            return true;
        }
    }
});
