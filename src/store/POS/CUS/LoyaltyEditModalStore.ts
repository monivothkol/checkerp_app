import { defineStore } from "pinia";
import POP from "@/core/utilities/pop";
import UpdateLoyaltyCondition from "@/services/api/CUS/updateLoyaltyCondition";
import type { LoyaltyConditionRow } from "@/models/POS/CUS/CUS30000";

/**
 * Store for the loyalty-condition edit modal (CUS35000). Only name, points and
 * active are editable — the rule (type + condition value) is immutable; create
 * a new condition to change what earns points.
 */
export const LoyaltyEditModalStore = defineStore("LoyaltyEditModalStore", {
    state: () => ({
        saving: false,
        saved: false,
        form: {
            conditionName: "",
            pointReward: 0,
            isActive: true
        },
        updateApi: UpdateLoyaltyCondition.getInstance()
    }),
    getters: {
        canSave(state): boolean {
            return !!state.form.conditionName && Number(state.form.pointReward ?? 0) > 0;
        }
    },
    actions: {
        /** Reset + prefill the form from the row (store is a singleton reused across modal opens). */
        init(record: LoyaltyConditionRow) {
            this.saving = false;
            this.saved = false;
            this.form = {
                conditionName: String(record.conditionName ?? ""),
                pointReward: Number(record.pointReward ?? 0),
                isActive: Boolean(record.isActive ?? true)
            };
        },
        /** Save the mutable fields; on success sets `saved` (modal watches it to $emit ok). */
        save(conditionId: string, failTitle: string) {
            if (!this.canSave || this.saving) return;
            this.saving = true;
            this.updateApi.request({
                dataBody: {
                    conditionId,
                    conditionName: this.form.conditionName,
                    pointReward: this.form.pointReward,
                    isActive: this.form.isActive
                },
                listener: {
                    onSuccess: () => {
                        this.saving = false;
                        this.saved = true;
                    },
                    onFail: (error: { message?: string; code?: string }) => {
                        this.saving = false;
                        POP.alert({ title: failTitle, status: "error", content: error?.message, errorCode: error?.code });
                    }
                }
            });
        }
    }
});
