import { defineStore } from "pinia";
import RetrieveAdjustmentList from "@/services/api/PRM/retrieveAdjustmentList";
import type { AdjustmentRow, PRM20000Response } from "@/models/POS/PRM/PRM20000";

/** PRM20000 payroll-adjustment list store: filter/paging state + list api call. */
export const PRM20000Store = defineStore("PRM20000Store", {
    state: () => ({
        effectiveMonth: undefined as string | undefined,
        status: undefined as string | undefined,
        rows: [] as AdjustmentRow[],
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        adjustmentApi: RetrieveAdjustmentList.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.adjustmentApi.request({
                dataBody: { pageNo: this.pageNo, pageSize: this.pageSize, effectiveMonth: this.effectiveMonth, status: this.status },
                listener: {
                    onSuccess: (p: PRM20000Response) => {
                        this.rows = p.adjustmentList ?? [];
                        this.total = p.totalCount ?? 0;
                        this.loading = false;
                    },
                    onFail: () => { this.rows = []; this.total = 0; this.loading = false; }
                }
            });
        },
        onFilter() {
            this.pageNo = 1;
            this.reload();
        },
        setPage(pageNo: number, pageSize: number) {
            this.pageNo = pageNo;
            this.pageSize = pageSize;
            this.reload();
        }
    }
});
