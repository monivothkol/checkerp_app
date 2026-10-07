import { defineStore } from "pinia";
import RetrieveCommissionList from "@/services/api/RPT/RetrieveCommissionList";
import type { CommissionListItem } from "@/models/POS/RPT/RPT80000";

/** RPT80000 commission list store: paged, optional status filter. */
export const RPT80000Store = defineStore("RPT80000Store", {
    state: () => ({
        loading: false,
        rows: [] as CommissionListItem[],
        total: 0,
        pageNo: 1,
        pageSize: 10,
        status: undefined as string | undefined,
        api: RetrieveCommissionList.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.api.request({
                dataBody: { pageNo: this.pageNo, pageSize: this.pageSize, status: this.status || undefined },
                listener: {
                    onSuccess: (p) => { this.rows = p.commissionList ?? []; this.total = p.totalCount ?? 0; this.loading = false; },
                    onFail: () => { this.rows = []; this.total = 0; this.loading = false; }
                }
            });
        },
        onFilter() { this.pageNo = 1; this.reload(); },
        setPage(pageNo: number, pageSize: number) { this.pageNo = pageNo; this.pageSize = pageSize; this.reload(); }
    }
});
