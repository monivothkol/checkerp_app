import { defineStore } from "pinia";
import RetrieveAdjustmentList from "@/services/api/STK/retrieveAdjustmentList";
import type { AdjustmentRow, STK30000Response } from "@/models/POS/STK/STK30000";

/** STK30000 adjustment-list screen store: filter/paging state + list api call. */
export const STK30000Store = defineStore("STK30000Store", {
    state: () => ({
        keyword: "",
        rows: [] as AdjustmentRow[],
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        adjustmentApi: RetrieveAdjustmentList.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.adjustmentApi.request({
                dataBody: { searchKeyword: this.keyword, pageNo: this.pageNo, pageSize: this.pageSize },
                listener: {
                    onSuccess: (p: STK30000Response) => {
                        this.rows = p.adjustmentList ?? [];
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
