import { defineStore } from "pinia";
import RetrieveInventoryList from "@/services/api/INV/retrieveInventoryList";
import RetrieveStockList from "@/services/api/STK/retrieveStockList";
import type { StockListRow, STK10000Response } from "@/models/POS/STK/STK10000";
import type { InventoryLookup } from "@/models/POS/COMMON/lookups";

type StockRowKeyed = StockListRow & { rowKey: string };

/** STK10000 stock-list screen store: filter state + list/inventory api calls. */
export const STK10000Store = defineStore("STK10000Store", {
    state: () => ({
        keyword: "",
        inventoryId: undefined as string | undefined,
        inventories: [] as InventoryLookup[],
        rows: [] as StockRowKeyed[],
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        inventoryApi: RetrieveInventoryList.getInstance(),
        stockApi: RetrieveStockList.getInstance()
    }),
    actions: {
        loadInventories() {
            this.inventoryApi.request({
                dataBody: { pageNo: 1, pageSize: 100, isActive: true },
                listener: { onSuccess: (p) => { this.inventories = p.inventoryList ?? []; } }
            });
        },
        /** Filter changed: results start over from page 1. */
        onFilter() {
            this.pageNo = 1;
            this.reload();
        },

        reload() {
            this.loading = true;
            this.stockApi.request({
                dataBody: { searchKeyword: this.keyword, inventoryId: this.inventoryId, isActive: true, pageNo: this.pageNo, pageSize: this.pageSize },
                listener: {
                    onSuccess: (p: STK10000Response) => {
                        this.rows = (p.stockList ?? []).map((r, i) => ({ ...r, rowKey: `${r.productCode}-${r.inventoryName}-${i}` }));
                        this.total = p.totalCount ?? 0;
                        this.loading = false;
                    },
                    onFail: () => { this.rows = []; this.total = 0; this.loading = false; }
                }
            });
        },
        onSearch() {
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => { this.pageNo = 1; this.reload(); }, 300);
        },
        setPage(pageNo: number, pageSize: number) {
            this.pageNo = pageNo;
            this.pageSize = pageSize;
            this.reload();
        }
    }
});
