import { defineStore } from "pinia";
import RetrievePayrollRunList from "@/services/api/PRM/retrievePayrollRunList";
import type { PayrollRunRow, PRM10000Response, PRM10000ListTotals } from "@/models/POS/PRM/PRM10000";

/** PRM10000 payroll-run list store: filter/paging state + list api call. */
export const PRM10000Store = defineStore("PRM10000Store", {
    state: () => ({
        periodMonth: undefined as string | undefined,
        status: undefined as string | undefined,
        statuses: ["DRAFT", "FINALIZED", "VOID"],
        rows: [] as PayrollRunRow[],
        totals: null as PRM10000ListTotals | null,
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        runApi: RetrievePayrollRunList.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.runApi.request({
                dataBody: { pageNo: this.pageNo, pageSize: this.pageSize, periodMonth: this.periodMonth, status: this.status },
                listener: {
                    onSuccess: (p: PRM10000Response) => {
                        this.rows = p.runList ?? [];
                        this.totals = p.totals ?? null;
                        this.total = p.totalCount ?? 0;
                        this.loading = false;
                    },
                    onFail: () => { this.rows = []; this.totals = null; this.total = 0; this.loading = false; }
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
