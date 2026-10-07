import { defineStore } from "pinia";
import RetrieveCogsReport from "@/services/api/RPT/RetrieveCogsReport";
import type { ProductProfitRow, ProductProfitResponse } from "@/models/POS/RPT/RPT40000";

function monthStart(): string { return new Date().toISOString().slice(0, 8) + "01"; }
function today(): string { return new Date().toISOString().slice(0, 10); }

/** RPT40000 COGS store: per-product cost totals for a date range (cost-sorted). */
export const RPT40000Store = defineStore("RPT40000Store", {
    state: () => ({
        loading: false,
        dateRange: [monthStart(), today()] as [string, string],
        rows: [] as ProductProfitRow[],
        api: RetrieveCogsReport.getInstance()
    }),
    getters: {
        totalCost: (s) => s.rows.reduce((a, r) => a + Number(r.totalCost ?? 0), 0),
        totalQty: (s) => s.rows.reduce((a, r) => a + Number(r.totalQuantitySold ?? 0), 0)
    },
    actions: {
        reload() {
            this.loading = true;
            this.api.request({
                dataBody: { dateFrom: this.dateRange[0], dateTo: this.dateRange[1] },
                listener: {
                    onSuccess: (p: ProductProfitResponse) => {
                        this.rows = (p.products ?? []).slice()
                            .sort((a, b) => Number(b.totalCost ?? 0) - Number(a.totalCost ?? 0));
                        this.loading = false;
                    },
                    onFail: () => { this.rows = []; this.loading = false; }
                }
            });
        }
    }
});
