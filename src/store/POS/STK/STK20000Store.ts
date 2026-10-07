import { defineStore } from "pinia";
import RetrieveTransferList from "@/services/api/STK/retrieveTransferList";
import type { TransferRow, STK20000Response } from "@/models/POS/STK/STK20000";

/** STK20000 transfer-list screen store: filter/paging state + list api call. */
export const STK20000Store = defineStore("STK20000Store", {
    state: () => ({
        keyword: "",
        rows: [] as TransferRow[],
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        transferApi: RetrieveTransferList.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.transferApi.request({
                dataBody: { searchKeyword: this.keyword, pageNo: this.pageNo, pageSize: this.pageSize },
                listener: {
                    onSuccess: (p: STK20000Response) => {
                        this.rows = p.transferList ?? [];
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
