import { defineStore } from "pinia";
import ExportTrialBalance from "@/services/api/ACT/exportTrialBalance";
import type { StatementExportResponse } from "@/models/ACT/statement-export";
import RetrieveTrialBalance from "@/services/api/ACT/retrieveTrialBalance";
import type { ActReportRow } from "@/models/ACT/ACT40000";

/** ACT32000 trial-balance screen store: per-account debit/credit rows for a date range. */
export const ACT32000Store = defineStore("ACT32000Store", {
    state: () => ({
        loading: false,
        dateRange: undefined as [string, string] | undefined,
        rows: [] as ActReportRow[],
        totalDebit: 0,
        totalCredit: 0,
        balanced: true,
        trialApi: RetrieveTrialBalance.getInstance(),
        exporting: false,
        exportApi: ExportTrialBalance.getInstance()
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
            this.trialApi.request({
                dataBody: { fromDate: this.dateRange?.[0] ?? "", toDate: this.dateRange?.[1] ?? "" },
                listener: {
                    onSuccess: (p) => {
                        this.rows = (p.accountList ?? []) as ActReportRow[];
                        this.totalDebit = Number(p.totalDebit ?? 0);
                        this.totalCredit = Number(p.totalCredit ?? 0);
                        this.balanced = !!p.balanced;
                        this.loading = false;
                    },
                    onFail: () => {
                        this.rows = [];
                        this.loading = false;
                    }
                }
            });
        }
    }
});
