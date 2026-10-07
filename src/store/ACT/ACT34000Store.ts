import { defineStore } from "pinia";
import ExportCashFlow from "@/services/api/ACT/exportCashFlow";
import type { StatementExportResponse } from "@/models/ACT/statement-export";
import RetrieveCashFlow from "@/services/api/ACT/retrieveCashFlow";
import type { CashFlowRow } from "@/models/ACT/ACT34000";

/** ACT34000 cash-flow store: opening/closing cash + movements by activity for a date range. */
export const ACT34000Store = defineStore("ACT34000Store", {
    state: () => ({
        loading: false,
        dateRange: undefined as [string, string] | undefined,
        openingCash: 0,
        closingCash: 0,
        netChange: 0,
        operatingList: [] as CashFlowRow[],
        investingList: [] as CashFlowRow[],
        financingList: [] as CashFlowRow[],
        operatingTotal: 0,
        investingTotal: 0,
        financingTotal: 0,
        cashApi: RetrieveCashFlow.getInstance(),
        exporting: false,
        exportApi: ExportCashFlow.getInstance()
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
            this.cashApi.request({
                dataBody: { fromDate: this.dateRange?.[0] ?? "", toDate: this.dateRange?.[1] ?? "" },
                listener: {
                    onSuccess: (p) => {
                        this.openingCash = Number(p.openingCash ?? 0);
                        this.closingCash = Number(p.closingCash ?? 0);
                        this.netChange = Number(p.netChange ?? 0);
                        this.operatingList = p.operatingList ?? [];
                        this.investingList = p.investingList ?? [];
                        this.financingList = p.financingList ?? [];
                        this.operatingTotal = Number(p.operatingTotal ?? 0);
                        this.investingTotal = Number(p.investingTotal ?? 0);
                        this.financingTotal = Number(p.financingTotal ?? 0);
                        this.loading = false;
                    },
                    onFail: () => {
                        this.operatingList = [];
                        this.investingList = [];
                        this.financingList = [];
                        this.loading = false;
                    }
                }
            });
        }
    }
});
