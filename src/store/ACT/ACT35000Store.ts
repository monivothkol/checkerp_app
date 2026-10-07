import { defineStore } from "pinia";
import RetrieveBalanceStatement from "@/services/api/ACT/retrieveBalanceStatement";
import ExportBalanceStatement from "@/services/api/ACT/exportBalanceStatement";
import type { BalanceStatementResponse, ExportBalanceStatementResponse } from "@/models/ACT/ACT35000";

/** ACT35000 balance statement store: assets/liabilities/equity as of a date. */
export const ACT35000Store = defineStore("ACT35000Store", {
    state: () => ({
        loading: false,
        asOfDate: undefined as string | undefined,
        report: undefined as BalanceStatementResponse | undefined,
        exporting: false,
        api: RetrieveBalanceStatement.getInstance(),
        exportApi: ExportBalanceStatement.getInstance()
    }),
    actions: {
        load() {
            this.loading = true;
            this.api.request({
                dataBody: { asOfDate: this.asOfDate || undefined },
                listener: {
                    onSuccess: (p: BalanceStatementResponse) => { this.report = p; this.loading = false; },
                    onFail: () => { this.report = undefined; this.loading = false; }
                }
            });
        },
        /** Book-format statement file; the screen opens the returned url. */
        exportStatement(format: "pdf" | "excel", onDone: (ok: boolean, res?: ExportBalanceStatementResponse, error?: unknown) => void) {
            this.exporting = true;
            this.exportApi.request({
                dataBody: { asOfDate: this.asOfDate || undefined, format },
                listener: {
                    onSuccess: (res) => { this.exporting = false; onDone(true, res); },
                    onFail: (e) => { this.exporting = false; onDone(false, undefined, e); }
                }
            });
        }
    }
});
