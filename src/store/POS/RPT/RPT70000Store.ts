import { defineStore } from "pinia";
import RetrieveCreditExposureReport from "@/services/api/RPT/RetrieveCreditExposureReport";
import type { CreditExposureRow, CreditExposureResponse } from "@/models/POS/RPT/RPT70000";

/** RPT70000 credit exposure store: summary cards + paged customer rows. */
export const RPT70000Store = defineStore("RPT70000Store", {
    state: () => ({
        loading: false,
        keyword: "",
        rows: [] as CreditExposureRow[],
        customersWithCredit: 0,
        totalOutstanding: 0,
        totalOverdue: 0,
        overLimitCount: 0,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        api: RetrieveCreditExposureReport.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.api.request({
                dataBody: { pageNo: this.pageNo, pageSize: this.pageSize, searchKeyword: this.keyword || undefined },
                listener: {
                    onSuccess: (p: CreditExposureResponse) => {
                        this.rows = p.rows ?? [];
                        this.total = p.totalElements ?? 0;
                        this.customersWithCredit = p.customersWithCredit ?? 0;
                        this.totalOutstanding = Number(p.totalOutstanding ?? 0);
                        this.totalOverdue = Number(p.totalOverdue ?? 0);
                        this.overLimitCount = p.overLimitCount ?? 0;
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
