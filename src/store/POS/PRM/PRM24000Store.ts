import { defineStore } from "pinia";
import RetrieveAdjustmentDetail from "@/services/api/PRM/retrieveAdjustmentDetail";
import type { AdjustmentDetail } from "@/models/POS/PRM/PRM21000";

/** PRM24000 adjustment detail store: detail load by adjustmentId. */
export const PRM24000Store = defineStore("PRM24000Store", {
    state: () => ({
        loading: true,
        detail: null as AdjustmentDetail | null,
        adjustmentApi: RetrieveAdjustmentDetail.getInstance()
    }),
    actions: {
        load(adjustmentId: string) {
            if (!adjustmentId) { this.loading = false; return; }
            this.loading = true;
            this.adjustmentApi.request({
                dataBody: { adjustmentId },
                listener: {
                    onSuccess: (p) => { this.detail = p.adjustment ?? p; this.loading = false; },
                    onFail: () => { this.detail = null; this.loading = false; }
                }
            });
        }
    }
});
