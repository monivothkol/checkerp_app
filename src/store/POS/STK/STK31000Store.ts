import { defineStore } from "pinia";
import RetrieveInventoryList from "@/services/api/INV/retrieveInventoryList";
import RetrieveStockList from "@/services/api/STK/retrieveStockList";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { AdjustmentLine } from "@/models/POS/STK/STK31000";
import type { StockRow } from "@/models/POS/STK/STK10000";
import type { InventoryLookup } from "@/models/POS/COMMON/lookups";

/** STK31000 adjustment-create form store: lookups, physical-count lines, draft handoff to STK32000. */
export const STK31000Store = defineStore("STK31000Store", {
    state: () => ({
        inventories: [] as InventoryLookup[],
        reasons: ["RECOUNT", "DAMAGE", "LOSS", "FOUND", "EXPIRED"],
        inventoryId: undefined as string | undefined,
        reason: undefined as string | undefined,
        productPick: undefined as string | undefined,
        productResults: [] as StockRow[],
        searching: false,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        lines: [] as AdjustmentLine[],
        note: "",
        inventoryApi: RetrieveInventoryList.getInstance(),
        stockApi: RetrieveStockList.getInstance()
    }),
    getters: {
        increases(state): number {
            return state.lines.reduce((s, l) => s + Math.max(0, l.counted - l.current), 0);
        },
        decreases(state): number {
            return state.lines.reduce((s, l) => s + Math.max(0, l.current - l.counted), 0);
        },
        canConfirm(state): boolean {
            return !!state.inventoryId && state.lines.some((l) => l.counted !== l.current);
        }
    },
    actions: {
        inventoryName(id?: string): string {
            return this.inventories.find((i) => i.inventoryId === id)?.inventoryName ?? "";
        },
        loadInventories() {
            this.inventoryApi.request({
                dataBody: { pageNo: 1, pageSize: 100, isActive: true },
                listener: { onSuccess: (p) => { this.inventories = p.inventoryList ?? []; } }
            });
        },
        onInventoryChange() {
            this.lines = [];
            this.productResults = [];
        },
        searchProducts(kw: string) {
            if (!this.inventoryId) return;
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searching = true;
            this.searchTimer = setTimeout(() => {
                this.stockApi.request({
                    dataBody: { searchKeyword: kw, inventoryId: this.inventoryId, pageNo: 1, pageSize: 20 },
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
            const current = Number(p.quantity ?? 0);
            this.lines.push({
                productId: p.productId ?? "",
                productCode: p.productCode,
                productName: p.productName ?? "",
                variantId: p.variantId,
                variantName: p.variantName,
                current,
                counted: current
            });
        },
        rowKey(r: { productId?: string; variantId?: string }): string {
            return `${r.productId ?? ""}|${r.variantId ?? ""}`;
        },
        setCounted(i: number, v: number) {
            this.lines[i].counted = v != null && v >= 0 ? v : 0;
        },
        removeLine(i: number) { this.lines.splice(i, 1); },
        /**
         * Validate + stash the STK_ADJUST draft; returns true when saved (screen then navigates).
         * `reasonLabel` is the already-translated reason text (i18n stays in the screen).
         */
        buildAndSaveDraft(reasonLabel?: string): boolean {
            if (!this.canConfirm) return false;
            const changed = this.lines.filter((l) => l.counted !== l.current);
            const payload = {
                inventoryId: this.inventoryId,
                reason: this.reason || undefined,
                notes: this.note || undefined,
                items: changed.map((l) => ({ productId: l.productId, productName: l.productName,
                    variantId: l.variantId, newQuantity: l.counted }))
            };
            ModuleFlowStore.saveDraft("STK_ADJUST", {
                payload,
                idempotencyKey: crypto.randomUUID(),
                display: {
                    inventoryName: this.inventoryName(this.inventoryId),
                    reason: reasonLabel || "—",
                    lines: changed.map((l) => ({ name: l.productName, code: l.productCode, variantName: l.variantName,
                        before: l.current, after: l.counted })),
                    increases: this.increases,
                    decreases: this.decreases
                }
            });
            return true;
        }
    }
});
