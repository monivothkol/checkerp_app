import { defineStore } from "pinia";
import RetrieveInventoryValuationReport from "@/services/api/RPT/RetrieveInventoryValuationReport";
import ProductFilterRefs from "@/core/modules/product-filter-refs";
import type { StockValueRow, InventoryValuationResponse } from "@/models/POS/RPT/RPT20000";
import type { InventoryLookup } from "@/models/POS/COMMON/lookups";

type StockValueRowKeyed = StockValueRow & { rowKey: string };

/** RPT20000 inventory valuation store: summary totals + paged items. */
export const RPT20000Store = defineStore("RPT20000Store", {
    state: () => ({
        loading: false,
        inventoryId: undefined as string | undefined,
        inventories: [] as InventoryLookup[],
        rows: [] as StockValueRowKeyed[],
        totalProducts: 0,
        totalQuantity: 0,
        totalCostValue: 0,
        totalStockValue: 0,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        api: RetrieveInventoryValuationReport.getInstance()
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
                    onSuccess: (p: InventoryValuationResponse) => {
                        this.rows = (p.items ?? []).map((r, i) => ({ ...r, rowKey: `${r.productId}-${r.inventoryId}-${i}` }));
                        this.total = p.totalItems ?? 0;
                        this.totalProducts = p.totalProducts ?? 0;
                        this.totalQuantity = Number(p.totalQuantity ?? 0);
                        this.totalCostValue = Number(p.totalCostValue ?? 0);
                        this.totalStockValue = Number(p.totalStockValue ?? 0);
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
