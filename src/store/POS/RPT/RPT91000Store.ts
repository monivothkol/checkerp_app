import { defineStore } from "pinia";
import RetrieveSupplierAnalysisReport from "@/services/api/RPT/RetrieveSupplierAnalysisReport";
import type { SupplierAnalysisRow, SupplierAnalysisResponse } from "@/models/POS/RPT/RPT91000";

/** RPT91000 supplier analysis store: summary cards + paged supplier rows. */
export const RPT91000Store = defineStore("RPT91000Store", {
    state: () => ({
        loading: false,
        dateRange: undefined as [string, string] | undefined,
        rows: [] as SupplierAnalysisRow[],
        suppliersUsed: 0,
        topSupplierSpend: 0,
        totalOutstanding: 0,
        averageDeliveryDays: undefined as number | undefined,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        api: RetrieveSupplierAnalysisReport.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.api.request({
                dataBody: {
                    pageNo: this.pageNo, pageSize: this.pageSize,
                    dateFrom: this.dateRange?.[0] || undefined, dateTo: this.dateRange?.[1] || undefined
                },
                listener: {
                    onSuccess: (p: SupplierAnalysisResponse) => {
                        this.rows = p.suppliers ?? [];
                        this.total = p.totalElements ?? 0;
                        this.suppliersUsed = p.suppliersUsed ?? 0;
                        this.topSupplierSpend = Number(p.topSupplierSpend ?? 0);
                        this.totalOutstanding = Number(p.totalOutstanding ?? 0);
                        this.averageDeliveryDays = p.averageDeliveryDays ?? undefined;
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
