import { defineStore } from "pinia";
import RetrieveStockDetail from "@/services/api/STK/retrieveStockDetail";
import RetrieveProductBatches, { type ProductBatch } from "@/services/api/STK/retrieveProductBatches";
import type { StockDetail, StockDetailInventory } from "@/models/POS/STK/STK13000";

/** STK13000 stock-detail screen store: detail load by product code (+ batch lots). */
export const STK13000Store = defineStore("STK13000Store", {
    state: () => ({
        loading: true,
        detail: null as StockDetail | null,
        batches: [] as ProductBatch[],
        stockDetailApi: RetrieveStockDetail.getInstance(),
        batchApi: RetrieveProductBatches.getInstance()
    }),
    getters: {
        totalQty(state): string {
            const list = state.detail?.inventories ?? [];
            return String(list.reduce((s: number, r: StockDetailInventory) => s + Number(r.quantity ?? 0), 0));
        }
    },
    actions: {
        load(code: string) {
            if (!code) { this.loading = false; return; }
            this.loading = true;
            this.stockDetailApi.request({
                dataBody: { productCode: code },
                listener: {
                    onSuccess: (p) => { this.detail = p; this.loading = false; },
                    onFail: () => { this.detail = null; this.loading = false; }
                }
            });
            this.batchApi.request({
                dataBody: { productCode: code },
                listener: {
                    onSuccess: (r) => { this.batches = r.batchList ?? []; },
                    onFail: () => { this.batches = []; }
                }
            });
        }
    }
});
