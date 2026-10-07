import { defineStore } from "pinia";
import RetrievePromotionDetail from "@/services/api/PMM/retrievePromotionDetail";
import type { PMM50000Response } from "@/models/POS/PMM/PMM50000";

/** PMM50000 promotion-detail screen store: detail load by promotion code. */
export const PMM50000Store = defineStore("PMM50000Store", {
    state: () => ({
        loading: true,
        detail: null as PMM50000Response | null,
        promotionApi: RetrievePromotionDetail.getInstance()
    }),
    actions: {
        load(code: string) {
            if (!code) { this.loading = false; return; }
            this.loading = true;
            this.promotionApi.request({
                dataBody: { promotionCode: code },
                listener: {
                    onSuccess: (p) => { this.detail = p; this.loading = false; },
                    onFail: () => { this.detail = null; this.loading = false; }
                }
            });
        }
    }
});
