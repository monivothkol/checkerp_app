import { defineStore } from "pinia";
import RetrieveVatReturn from "@/services/api/ACT/retrieveVatReturn";
import ExportVatReturn from "@/services/api/ACT/exportVatReturn";
import type { StatementExportResponse } from "@/models/ACT/statement-export";
import type { VatReturnRow } from "@/models/ACT/ACT36000";

/** ACT36000 VAT return store: output vs input VAT for a date range, by source. */
export const ACT36000Store = defineStore("ACT36000Store", {
    state: () => ({
        loading: false,
        dateRange: undefined as [string, string] | undefined,
        outputVatCode: "",
        inputVatCode: "",
        outputList: [] as VatReturnRow[],
        inputList: [] as VatReturnRow[],
        outputVat: 0,
        inputVat: 0,
        netPayable: 0,
        vatApi: RetrieveVatReturn.getInstance(),
        exporting: false,
        exportApi: ExportVatReturn.getInstance()
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
            this.vatApi.request({
                dataBody: { fromDate: this.dateRange?.[0] ?? "", toDate: this.dateRange?.[1] ?? "" },
                listener: {
                    onSuccess: (p) => {
                        this.outputVatCode = p.outputVatCode ?? "";
                        this.inputVatCode = p.inputVatCode ?? "";
                        this.outputList = p.outputList ?? [];
                        this.inputList = p.inputList ?? [];
                        this.outputVat = Number(p.outputVat ?? 0);
                        this.inputVat = Number(p.inputVat ?? 0);
                        this.netPayable = Number(p.netPayable ?? 0);
                        this.loading = false;
                    },
                    onFail: () => {
                        this.outputList = [];
                        this.inputList = [];
                        this.loading = false;
                    }
                }
            });
        }
    }
});
