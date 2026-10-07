import { defineStore } from "pinia";
import RetrievePurchaseReport from "@/services/api/RPT/RetrievePurchaseReport";
import type { PurchaseReportRow, PurchaseReportResponse } from "@/models/POS/RPT/RPT90000";

/** RPT90000 purchase report store: summary cards + paged goods receipts. */
export const RPT90000Store = defineStore("RPT90000Store", {
    state: () => ({
        loading: false,
        dateRange: undefined as [string, string] | undefined,
        status: undefined as string | undefined,
        paymentStatus: undefined as string | undefined,
        keyword: "",
        rows: [] as PurchaseReportRow[],
        totalPurchase: 0,
        totalPaid: 0,
        totalUnpaid: 0,
        orderedAmount: 0,
        averageOrderValue: 0,
        purchaseCount: 0,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        api: RetrievePurchaseReport.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.api.request({
                dataBody: {
                    pageNo: this.pageNo, pageSize: this.pageSize,
                    dateFrom: this.dateRange?.[0] || undefined, dateTo: this.dateRange?.[1] || undefined,
                    status: this.status || undefined, paymentStatus: this.paymentStatus || undefined,
                    searchKeyword: this.keyword || undefined
                },
                listener: {
                    onSuccess: (p: PurchaseReportResponse) => {
                        this.rows = p.items ?? [];
                        this.total = p.totalElements ?? 0;
                        this.totalPurchase = Number(p.totalPurchase ?? 0);
                        this.totalPaid = Number(p.totalPaid ?? 0);
                        this.totalUnpaid = Number(p.totalUnpaid ?? 0);
                        this.orderedAmount = Number(p.orderedAmount ?? 0);
                        this.averageOrderValue = Number(p.averageOrderValue ?? 0);
                        this.purchaseCount = p.purchaseCount ?? 0;
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
