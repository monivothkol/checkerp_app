import { defineStore } from "pinia";
import RetrieveExpiryReport from "@/services/api/STK/retrieveExpiryReport";
import type { ProductBatch } from "@/services/api/STK/retrieveProductBatches";

/** STK50000 expiry report: batches expiring within N days (or already expired). */
export const STK50000Store = defineStore("STK50000Store", {
    state: () => ({
        loading: false,
        rows: [] as ProductBatch[],
        total: 0,
        withinDays: 30 as number,
        expiredOnly: false,
        pageNo: 1,
        pageSize: 20,
        api: RetrieveExpiryReport.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.api.request({
                dataBody: {
                    withinDays: this.expiredOnly ? undefined : this.withinDays,
                    expiredOnly: this.expiredOnly || undefined,
                    pageNo: this.pageNo,
                    pageSize: this.pageSize
                },
                listener: {
                    onSuccess: (r) => { this.rows = r.batchList ?? []; this.total = r.totalCount ?? 0; this.loading = false; },
                    onFail: () => { this.rows = []; this.total = 0; this.loading = false; }
                }
            });
        },
        setPage(page: number, size: number) { this.pageNo = page; this.pageSize = size; this.reload(); },
        applyFilter() { this.pageNo = 1; this.reload(); }
    }
});
