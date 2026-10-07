import { defineStore } from "pinia";
import ExportBalanceSheet from "@/services/api/ACT/exportBalanceSheet";
import type { StatementExportResponse } from "@/models/ACT/statement-export";
import RetrieveBalanceSheet from "@/services/api/ACT/retrieveBalanceSheet";
import type { ActReportRow } from "@/models/ACT/ACT40000";

/** ACT31000 balance-sheet screen store: asset/liability/equity rows as of a date. */
export const ACT31000Store = defineStore("ACT31000Store", {
    state: () => ({
        loading: false,
        asOfDate: undefined as string | undefined,
        assetList: [] as ActReportRow[],
        liabilityList: [] as ActReportRow[],
        equityList: [] as ActReportRow[],
        totalAssets: 0,
        totalLiabilities: 0,
        totalEquity: 0,
        balanced: true,
        balanceApi: RetrieveBalanceSheet.getInstance(),
        exporting: false,
        exportApi: ExportBalanceSheet.getInstance()
    }),
    actions: {
        /** Book-format statement file; the screen opens the returned url. */
        exportStatement(format: "pdf" | "excel", onDone: (ok: boolean, res?: StatementExportResponse, error?: unknown) => void) {
            this.exporting = true;
            this.exportApi.request({
                dataBody: { asOfDate: this.asOfDate ?? "", format },
                listener: {
                    onSuccess: (res) => { this.exporting = false; onDone(true, res); },
                    onFail: (e) => { this.exporting = false; onDone(false, undefined, e); }
                }
            });
        },
        load() {
            this.loading = true;
            this.balanceApi.request({
                dataBody: { asOfDate: this.asOfDate ?? "" },
                listener: {
                    onSuccess: (p) => {
                        this.assetList = (p.assetList ?? []) as ActReportRow[];
                        this.liabilityList = (p.liabilityList ?? []) as ActReportRow[];
                        this.equityList = (p.equityList ?? []) as ActReportRow[];
                        this.totalAssets = Number(p.totalAssets ?? 0);
                        this.totalLiabilities = Number(p.totalLiabilities ?? 0);
                        this.totalEquity = Number(p.totalEquity ?? 0);
                        this.balanced = !!p.balanced;
                        this.loading = false;
                    },
                    onFail: () => {
                        this.assetList = [];
                        this.liabilityList = [];
                        this.equityList = [];
                        this.loading = false;
                    }
                }
            });
        }
    }
});
