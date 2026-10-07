import { defineStore } from "pinia";
import RetrieveLoyaltyConditionDetail from "@/services/api/CUS/retrieveLoyaltyConditionDetail";
import { conditionSummary } from "@/core/modules/loyalty-condition";
import type { LoyaltyConditionRow } from "@/models/POS/CUS/CUS30000";

/** CUS34000 loyalty-condition detail screen store: detail load by condition id. */
export const CUS34000Store = defineStore("CUS34000Store", {
    state: () => ({
        loading: true,
        detail: null as LoyaltyConditionRow | null,
        detailApi: RetrieveLoyaltyConditionDetail.getInstance()
    }),
    getters: {
        conditionText(state): string {
            return state.detail ? conditionSummary(state.detail.conditionType, state.detail.conditionValue) : "—";
        }
    },
    actions: {
        load(conditionId: string) {
            if (!conditionId) { this.loading = false; return; }
            this.loading = true;
            this.detailApi.request({
                dataBody: { conditionId },
                listener: {
                    onSuccess: (p: LoyaltyConditionRow) => { this.detail = p; this.loading = false; },
                    onFail: () => { this.detail = null; this.loading = false; }
                }
            });
        }
    }
});
