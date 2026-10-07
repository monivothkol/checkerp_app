import { defineStore } from "pinia";
import RetrieveProductProfitReport from "@/services/api/RPT/RetrieveProductProfitReport";
import type { ProductProfitRow, ProductProfitResponse } from "@/models/POS/RPT/RPT40000";

function monthStart(): string { return new Date().toISOString().slice(0, 8) + "01"; }
function today(): string { return new Date().toISOString().slice(0, 10); }

/** RPT50000 gross-profit (P&L) store: per-product profit for a date range. */
export const RPT50000Store = defineStore("RPT50000Store", {
    state: () => ({
        loading: false,
        dateRange: [monthStart(), today()] as [string, string],
        rows: [] as ProductProfitRow[],
        api: RetrieveProductProfitReport.getInstance()
    }),
    getters: {
        totalRevenue: (s) => s.rows.reduce((a, r) => a + Number(r.totalRevenue ?? 0), 0),
        totalCost: (s) => s.rows.reduce((a, r) => a + Number(r.totalCost ?? 0), 0),
        totalProfit: (s) => s.rows.reduce((a, r) => a + Number(r.totalGrossProfit ?? 0), 0),
        marginPct(): number { return this.totalRevenue > 0 ? (this.totalProfit / this.totalRevenue) * 100 : 0; }
    },
    actions: {
        reload() {
            this.loading = true;
            this.api.request({
                dataBody: { dateFrom: this.dateRange[0], dateTo: this.dateRange[1] },
                listener: {
                    onSuccess: (p: ProductProfitResponse) => { this.rows = p.products ?? []; this.loading = false; },
                    onFail: () => { this.rows = []; this.loading = false; }
                }
            });
        }
    }
});
