import { defineStore } from "pinia";
import RetrieveSupplierList from "@/services/api/SUP/retrieveSupplierList";
import RetrieveInventoryList from "@/services/api/INV/retrieveInventoryList";
import RetrieveProductList from "@/services/api/PRD/retrieveProductList";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import ReferenceData from "@/core/modules/reference-data";
import type { SupplierLookup, InventoryLookup } from "@/models/POS/COMMON/lookups";
import type { ProductListItem } from "@/models/PRD/PRD10000";
import type { PoLine } from "@/models/POS/PUR/PUR11000";

// Pure per-line math (no store state) — shared by getters and actions.
function lineBaseOf(l: PoLine): number {
    return Number(l.unitCost || 0) * Number(l.orderedQuantity || 0) - Number(l.discountAmount || 0);
}
function lineTaxOf(l: PoLine): number {
    return Math.max(0, lineBaseOf(l)) * (Number(l.taxRate || 0) / 100);
}
function lineTotalOf(l: PoLine): number {
    return lineBaseOf(l) + lineTaxOf(l);
}

/** PUR11000 purchase-order create-form store: lookups, line building, and draft handoff to PUR12000. */
export const PUR11000Store = defineStore("PUR11000Store", {
    state: () => ({
        // Store default purchase tax rate (%), from cached reference data.
        defaultPurchaseTaxRate: 0,
        suppliers: [] as SupplierLookup[],
        loadingSuppliers: false,
        inventories: [] as InventoryLookup[],
        loadingInventories: false,
        supplierId: undefined as string | undefined,
        inventoryId: undefined as string | undefined,
        orderDate: new Date().toISOString().slice(0, 10),
        expectedDeliveryDate: undefined as string | undefined,
        paymentTerm: "",
        remark: "",
        productPick: undefined as string | undefined,
        productResults: [] as ProductListItem[],
        searching: false,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        lines: [] as PoLine[],
        supplierApi: RetrieveSupplierList.getInstance(),
        inventoryApi: RetrieveInventoryList.getInstance(),
        productApi: RetrieveProductList.getInstance()
    }),
    getters: {
        subTotal(state): number {
            return state.lines.reduce((s, l) => s + Number(l.unitCost || 0) * Number(l.orderedQuantity || 0), 0);
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
        expectedDateInvalid(state): boolean {
            return !!state.expectedDeliveryDate && !!state.orderDate && state.expectedDeliveryDate < state.orderDate;
        },
        canConfirm(state): boolean {
            return !!state.supplierId && !!state.inventoryId && !!state.orderDate && state.lines.length > 0 && !this.expectedDateInvalid;
        }
    },
    actions: {
        lineBase(l: PoLine): number { return lineBaseOf(l); },
        lineTax(l: PoLine): number { return lineTaxOf(l); },
        lineTotal(l: PoLine): number { return lineTotalOf(l); },
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
        /** `variant` is set when the product has variants (the screen asks first). */
        onPickProduct(productId: string, variant?: { variantId: string; variantName?: string }) {
            const p = this.productResults.find((x) => x.productId === productId);
            this.productPick = undefined;
            if (!p) return;
            const existing = this.lines.find((l) => l.productId === p.productId && l.variantId === variant?.variantId);
            if (existing) { existing.orderedQuantity += 1; return; }
            this.lines.push({
                productId: p.productId,
                productCode: p.productCode,
                productName: p.productName,
                variantId: variant?.variantId,
                variantName: variant?.variantName,
                orderedQuantity: 1,
                unitCost: Number(p.costPrice ?? p.sellingPrice ?? 0),
                discountAmount: 0,
                taxRate: Number(p.taxRatePct ?? this.defaultPurchaseTaxRate ?? 0)
            });
        },
        setQty(i: number, v: number) { this.lines[i].orderedQuantity = v && v > 0 ? v : 1; },
        setCost(i: number, v: number) { this.lines[i].unitCost = v && v >= 0 ? v : 0; },
        setDiscount(i: number, v: number) { this.lines[i].discountAmount = v && v >= 0 ? v : 0; },
        setTaxRate(i: number, v: number) { this.lines[i].taxRate = Math.max(0, Math.min(100, Number(v ?? 0) || 0)); },
        removeLine(i: number) { this.lines.splice(i, 1); },
        /** Validate + stash the PUR draft; returns true when saved (screen then navigates). */
        buildAndSaveDraft(): boolean {
            if (!this.canConfirm) return false;
            const supplier = this.suppliers.find((s) => s.supplierId === this.supplierId);
            const inventory = this.inventories.find((inv) => inv.inventoryId === this.inventoryId);
            ModuleFlowStore.saveDraft("PUR", {
                payload: {
                    supplierId: this.supplierId,
                    inventoryId: this.inventoryId,
                    orderDate: this.orderDate,
                    expectedDeliveryDate: this.expectedDeliveryDate || undefined,
                    paymentTerm: this.paymentTerm.trim() || undefined,
                    remark: this.remark.trim() || undefined,
                    itemList: this.lines.map((l) => ({
                        productId: l.productId,
                        variantId: l.variantId,
                        orderedQuantity: l.orderedQuantity,
                        unitCost: l.unitCost,
                        discountAmount: l.discountAmount,
                        taxRate: l.taxRate
                    }))
                },
                idempotencyKey: crypto.randomUUID(),
                display: {
                    supplierName: supplier?.supplierName ?? supplier?.contactName ?? supplier?.supplierCode ?? "",
                    inventoryName: inventory?.inventoryName ?? "",
                    orderDate: this.orderDate,
                    expectedDeliveryDate: this.expectedDeliveryDate ?? "",
                    paymentTerm: this.paymentTerm.trim(),
                    lines: this.lines.map((l) => ({
                        name: l.productName,
                        code: l.productCode,
                        variantName: l.variantName,
                        qty: l.orderedQuantity,
                        cost: l.unitCost,
                        discount: l.discountAmount,
                        taxRate: l.taxRate,
                        tax: lineTaxOf(l),
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
