import { defineStore } from "pinia";
import ExportIncomeStatement from "@/services/api/ACT/exportIncomeStatement";
import type { StatementExportResponse } from "@/models/ACT/statement-export";
import RetrieveIncomeStatement from "@/services/api/ACT/retrieveIncomeStatement";
import type { ActReportRow } from "@/models/ACT/ACT40000";

/** ACT30000 income-statement screen store: revenue/expense rows for a date range. */
export const ACT30000Store = defineStore("ACT30000Store", {
    state: () => ({
        loading: false,
        dateRange: undefined as [string, string] | undefined,
        revenueList: [] as ActReportRow[],
        expenseList: [] as ActReportRow[],
        totalRevenue: 0,
        totalExpense: 0,
        netIncome: 0,
        incomeApi: RetrieveIncomeStatement.getInstance(),
        exporting: false,
        exportApi: ExportIncomeStatement.getInstance()
    }),
    actions: {
        /** Book-format statement file; the screen opens the returned url. */
        exportStatement(format: "pdf" | "excel", onDone: (ok: boolean, res?: StatementExportResponse, error?: unknown) => void) {
            this.exporting = true;
            this.exportApi.request({
                dataBody: { fromDate: this.dateRange?.[0] ?? "", toDate: this.dateRange?.[1] ?? "", format },
                listener: {
                    onSuccess: (res) => { this.exporting = false; onDone(true, res); },
                    onFail: (e) => { this.exporting = false; onDone(false, undefined, e); }
                }
            });
        },
        load() {
            this.loading = true;
            this.incomeApi.request({
                dataBody: { fromDate: this.dateRange?.[0] ?? "", toDate: this.dateRange?.[1] ?? "" },
                listener: {
                    onSuccess: (p) => {
                        this.revenueList = (p.revenueList ?? []) as ActReportRow[];
                        this.expenseList = (p.expenseList ?? []) as ActReportRow[];
                        this.totalRevenue = Number(p.totalRevenue ?? 0);
                        this.totalExpense = Number(p.totalExpense ?? 0);
                        this.netIncome = Number(p.netIncome ?? 0);
                        this.loading = false;
                    },
                    onFail: () => {
                        this.revenueList = [];
                        this.expenseList = [];
                        this.loading = false;
                    }
                }
            });
        }
    }
});
