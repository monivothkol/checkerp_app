import { defineStore } from "pinia";
import RetrieveAdjustmentDetail from "@/services/api/STK/retrieveAdjustmentDetail";
import type { AdjustmentDetail } from "@/models/POS/STK/STK33000";

/** STK33000 adjustment-detail screen store: detail load by adjustment code. */
export const STK33000Store = defineStore("STK33000Store", {
    state: () => ({
        loading: true,
        detail: null as AdjustmentDetail | null,
        adjustmentDetailApi: RetrieveAdjustmentDetail.getInstance()
    }),
    actions: {
        load(code: string) {
            if (!code) { this.loading = false; return; }
            this.loading = true;
            this.adjustmentDetailApi.request({
                dataBody: { adjustmentCode: code },
                listener: {
                    onSuccess: (p) => { this.detail = p; this.loading = false; },
                    onFail: () => { this.detail = null; this.loading = false; }
                }
            });
        }
    }
});
