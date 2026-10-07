import { defineStore } from "pinia";
import RetrieveLoanList from "@/services/api/DBT/retrieveLoanList";
import type { DBT10000Response, LenderType, LoanRow, LoanStatus, LoanTotals } from "@/models/POS/DBT/DBT10000";

/** DBT10000 loan register store: filters/paging + totals (outstanding, current, long-term). */
export const DBT10000Store = defineStore("DBT10000Store", {
    state: () => ({
        keyword: "",
        lenderType: undefined as LenderType | undefined,
        status: "ACTIVE" as LoanStatus | undefined,
        rows: [] as LoanRow[],
        totals: undefined as LoanTotals | undefined,
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        api: RetrieveLoanList.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.api.request({
                dataBody: {
                    searchKeyword: this.keyword || undefined,
                    lenderType: this.lenderType || undefined,
                    status: this.status || undefined,
                    pageNo: this.pageNo, pageSize: this.pageSize
                },
                listener: {
                    onSuccess: (p: DBT10000Response) => {
                        this.rows = p.loanList ?? [];
                        this.total = p.totalCount ?? 0;
                        this.totals = p.totals;
                        this.loading = false;
                    },
                    onFail: () => { this.rows = []; this.total = 0; this.totals = undefined; this.loading = false; }
                }
            });
        },
        onFilter() { this.pageNo = 1; this.reload(); },
        onSearch() {
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this.onFilter(), 300);
        },
        setPage(pageNo: number, pageSize: number) {
            this.pageNo = pageNo;
            this.pageSize = pageSize;
            this.reload();
        }
    }
});
