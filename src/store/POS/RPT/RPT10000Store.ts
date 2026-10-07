import { defineStore } from "pinia";
import RetrieveStockAgingReport from "@/services/api/RPT/RetrieveStockAgingReport";
import ProductFilterRefs from "@/core/modules/product-filter-refs";
import type { StockAgingRow, StockAgingReportResponse } from "@/models/POS/RPT/RPT10000";
import type { InventoryLookup } from "@/models/POS/COMMON/lookups";

type AgingRowKeyed = StockAgingRow & { rowKey: string };

/** RPT10000 stock aging store: bucket totals + paged items, inventory filter. */
export const RPT10000Store = defineStore("RPT10000Store", {
    state: () => ({
        loading: false,
        inventoryId: undefined as string | undefined,
        inventories: [] as InventoryLookup[],
        rows: [] as AgingRowKeyed[],
        totalValue: 0,
        buckets: { b0: 0, b31: 0, b61: 0, b90: 0 },
        total: 0,
        pageNo: 1,
        pageSize: 10,
        api: RetrieveStockAgingReport.getInstance()
    }),
    actions: {
        loadInventories() {
            // cache-first from IndexedDB; WebSocket drops "INV" on any inventory change
            ProductFilterRefs.inventories().then((list) => { this.inventories = list; });
        },
        reload() {
            this.loading = true;
            this.api.request({
                dataBody: { pageNo: this.pageNo, pageSize: this.pageSize, inventoryId: this.inventoryId || undefined },
                listener: {
                    onSuccess: (p: StockAgingReportResponse) => {
                        this.rows = (p.items ?? []).map((r, i) => ({ ...r, rowKey: `${r.productId}-${r.inventoryId}-${i}` }));
                        this.total = p.totalItems ?? 0;
                        this.totalValue = Number(p.totalValue ?? 0);
                        this.buckets = {
                            b0: Number(p.value0To30Days ?? 0), b31: Number(p.value31To60Days ?? 0),
                            b61: Number(p.value61To90Days ?? 0), b90: Number(p.value90PlusDays ?? 0)
                        };
                        this.loading = false;
                    },
                    onFail: () => { this.rows = []; this.total = 0; this.loading = false; }
                }
            });
        },
        onFilter() { this.pageNo = 1; this.reload(); },
        setPage(pageNo: number, pageSize: number) { this.pageNo = pageNo; this.pageSize = pageSize; this.reload(); }
    }
});
