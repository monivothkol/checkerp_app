import { defineStore } from "pinia";
import RetrieveInventoryList from "@/services/api/INV/retrieveInventoryList";
import RetrieveStockHistory from "@/services/api/STK/retrieveStockHistory";
import type { HistoryListRow, STK40000Response } from "@/models/POS/STK/STK40000";
import type { InventoryLookup } from "@/models/POS/COMMON/lookups";

/** STK40000 stock-history screen store: filter state + inventory/history api calls. */
export const STK40000Store = defineStore("STK40000Store", {
    state: () => ({
        keyword: "",
        inventoryId: undefined as string | undefined,
        movementType: undefined as string | undefined,
        types: ["SALE", "PURCHASE", "TRANSFER_IN", "TRANSFER_OUT", "ADJUSTMENT"],
        inventories: [] as InventoryLookup[],
        rows: [] as HistoryListRow[],
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        inventoryApi: RetrieveInventoryList.getInstance(),
        historyApi: RetrieveStockHistory.getInstance()
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
            this.historyApi.request({
                dataBody: {
                    searchKeyword: this.keyword,
                    inventoryId: this.inventoryId,
                    movementType: this.movementType,
                    pageNo: this.pageNo,
                    pageSize: this.pageSize
                },
                listener: {
                    onSuccess: (p: STK40000Response) => {
                        this.rows = (p.historyList ?? []).map((r, i) => ({ ...r, rowKey: `${r.referenceCode}-${r.productCode}-${i}` }));
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
