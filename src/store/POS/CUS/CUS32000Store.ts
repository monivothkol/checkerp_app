import { defineStore } from "pinia";
import { CUS31000Store } from "@/store/POS/CUS/CUS31000Store";
import CreateLoyaltyCondition from "@/services/api/CUS/createLoyaltyCondition";
import POP from "@/core/utilities/pop";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { LoyaltyDraft } from "@/models/POS/CUS/CUS30000";

/** CUS32000 loyalty-condition confirm store: holds the draft + submits it, exposing redirectTo for the screen. */
export const CUS32000Store = defineStore("CUS32000Store", {
    state: () => ({
        draft: null as LoyaltyDraft | null,
        submitting: false,
        redirectTo: null as string | null,
        createApi: CreateLoyaltyCondition.getInstance()
    }),
    actions: {
        /** Pull the CUSL draft from the flow store; returns it (null → screen redirects back). */
        loadDraft(): LoyaltyDraft | null {
            // Fresh visit: clear last run's outcome so setting the SAME redirect
            // value again still triggers the view's change watcher.
            this.redirectTo = null;
            this.submitting = false;
            this.draft = ModuleFlowStore.loadDraft("CUSL") as LoyaltyDraft | null;
            return this.draft;
        },
        /** Submit the draft; `failTitle` is the already-translated alert title (i18n stays in the screen). */
        submit(failTitle: string) {
            const draft = this.draft;
            if (this.submitting || !draft) return;
            this.submitting = true;
            this.createApi.request({
                dataBody: draft.payload,
                headers: { "Idempotency-Key": draft.idempotencyKey },
                listener: {
                    onSuccess: (p) => {
                        // The create form was submitted — clear it so the next visit starts blank.
                        CUS31000Store().$reset();
                        this.submitting = false;
                        ModuleFlowStore.saveResult("CUSL", { conditionId: p.conditionId, name: draft.display.name });
                        ModuleFlowStore.clearDraft("CUSL");
                        this.redirectTo = "/CUS33000";
                    },
                    onFail: (err) => {
                        this.submitting = false;
                        POP.alert({ title: failTitle, status: "error", content: err?.message, errorCode: err?.code });
                    }
                }
            });
        }
    }
});
