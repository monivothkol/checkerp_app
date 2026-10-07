import { defineStore } from "pinia";
import RetrieveSaleReturnDetail from "@/services/api/SAL/retrieveSaleReturnDetail";
import RetrieveSaleReturnAuditLog from "@/services/api/SAL/retrieveSaleReturnAuditLog";
import type { ReturnDetailHeader, ReturnDetailItem } from "@/models/POS/SAL/SAL24000";
import type { InvoiceAuditEntry } from "@/models/POS/invoice";

/** SAL24000 sale-return detail store: detail + edit change-history by returnId. */
export const SAL24000Store = defineStore("SAL24000Store", {
    state: () => ({
        loading: true,
        header: null as ReturnDetailHeader | null,
        items: [] as ReturnDetailItem[],
        auditList: [] as InvoiceAuditEntry[],
        returnDetailApi: RetrieveSaleReturnDetail.getInstance(),
        auditApi: RetrieveSaleReturnAuditLog.getInstance()
    }),
    actions: {
        load(returnId: string) {
            if (!returnId) { this.loading = false; return; }
            this.loading = true;
            this.returnDetailApi.request({
                dataBody: { returnId },
                listener: {
                    onSuccess: (p) => {
                        // Tolerant read: header may be nested under `return`, items under `items` or `itemList`.
                        const h = p?.return ?? p;
                        this.header = h && Object.keys(h).length ? h : null;
                        this.items = p?.items ?? p?.itemList ?? h?.items ?? h?.itemList ?? [];
                        this.loading = false;
                    },
                    onFail: () => { this.header = null; this.items = []; this.loading = false; }
                }
            });
            this.auditApi.request({
                dataBody: { returnId },
                listener: {
                    onSuccess: (p) => { this.auditList = p.auditList ?? []; },
                    onFail: () => { this.auditList = []; }
                }
            });
        }
    }
});
