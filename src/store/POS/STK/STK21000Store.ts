import { defineStore } from "pinia";
import RetrieveInventoryList from "@/services/api/INV/retrieveInventoryList";
import RetrieveStockList from "@/services/api/STK/retrieveStockList";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { TransferLine } from "@/models/POS/STK/STK21000";
import type { StockRow } from "@/models/POS/STK/STK10000";
import type { InventoryLookup } from "@/models/POS/COMMON/lookups";

/** STK21000 transfer-create form store: lookups, line building, and draft handoff to STK22000. */
export const STK21000Store = defineStore("STK21000Store", {
    state: () => ({
        inventories: [] as InventoryLookup[],
        fromInventoryId: undefined as string | undefined,
        toInventoryId: undefined as string | undefined,
        productPick: undefined as string | undefined,
        productResults: [] as StockRow[],
        searching: false,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        lines: [] as TransferLine[],
        note: "",
        inventoryApi: RetrieveInventoryList.getInstance(),
        stockApi: RetrieveStockList.getInstance()
    }),
    getters: {
        totalQty(state): number {
            return state.lines.reduce((s, l) => s + Number(l.quantity || 0), 0);
        },
        canConfirm(state): boolean {
            return !!state.fromInventoryId && !!state.toInventoryId
                && state.fromInventoryId !== state.toInventoryId && state.lines.length > 0;
        }
    },
    actions: {
        inventoryName(id?: string): string {
            return this.inventories.find((i) => i.inventoryId === id)?.inventoryName ?? "";
        },
        loadInventories() {
            this.inventoryApi.request({
                dataBody: { pageNo: 1, pageSize: 100, isActive: true },
                listener: { onSuccess: (p) => {
                    this.inventories = p.inventoryList ?? [];
                    // Auto-select the user's default inventory as the source (requirement 1).
                    if (!this.fromInventoryId && this.inventories.length) {
                        this.fromInventoryId = (this.inventories.find((i) => i.isDefault) ?? this.inventories[0]).inventoryId;
                    }
                } }
            });
        },
        onFromChange() {
            // Source changed — clear picked lines (their availability no longer applies).
            this.lines = [];
            this.productResults = [];
        },
        searchProducts(kw: string) {
            if (!this.fromInventoryId) return;
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searching = true;
            this.searchTimer = setTimeout(() => {
                this.stockApi.request({
                    dataBody: { searchKeyword: kw, inventoryId: this.fromInventoryId, pageNo: 1, pageSize: 20 },
                    listener: {
                        onSuccess: (p) => { this.productResults = (p.stockList ?? []) as StockRow[]; this.searching = false; },
                        onFail: () => { this.searching = false; }
                    }
                });
            }, 250);
        },
        /** `rowKey` identifies the picked stock row: a product with variants has one row per variant. */
        onPickProduct(rowKey: string) {
            const p = this.productResults.find((x) => this.rowKey(x) === rowKey);
            this.productPick = undefined;
            if (!p) return;
            if (this.lines.some((l) => this.rowKey(l) === rowKey)) return;
            const available = Number(p.availableQuantity ?? p.quantity ?? 0);
            if (available <= 0) return;
            this.lines.push({
                productId: p.productId ?? "",
                productCode: p.productCode,
                productName: p.productName ?? "",
                variantId: p.variantId,
                variantName: p.variantName,
                available,
                quantity: 1
            });
        },
        rowKey(r: { productId?: string; variantId?: string }): string {
            return `${r.productId ?? ""}|${r.variantId ?? ""}`;
        },
        setQty(i: number, v: number) {
            const max = this.lines[i].available;
            this.lines[i].quantity = v && v > 0 ? Math.min(v, max) : 1;
        },
        removeLine(i: number) { this.lines.splice(i, 1); },
        /** Validate + stash the STK_TRANSFER draft; returns true when saved (screen then navigates). */
        buildAndSaveDraft(): boolean {
            if (!this.canConfirm) return false;
            const payload = {
                fromInventoryId: this.fromInventoryId,
                toInventoryId: this.toInventoryId,
                notes: this.note || undefined,
                items: this.lines.map((l) => ({ productId: l.productId, productName: l.productName,
                    variantId: l.variantId, quantity: l.quantity }))
            };
            ModuleFlowStore.saveDraft("STK_TRANSFER", {
                payload,
                idempotencyKey: crypto.randomUUID(),
                display: {
                    fromName: this.inventoryName(this.fromInventoryId),
                    toName: this.inventoryName(this.toInventoryId),
                    lines: this.lines.map((l) => ({ name: l.productName, code: l.productCode, variantName: l.variantName, qty: l.quantity })),
                    totalQty: this.totalQty
                }
            });
            return true;
        }
    }
});
