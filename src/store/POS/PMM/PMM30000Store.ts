import { defineStore } from "pinia";
import { PMM20000Store } from "@/store/POS/PMM/PMM20000Store";
import CreatePromotion from "@/services/api/PMM/createPromotion";
import POP from "@/core/utilities/pop";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { PromotionDraft } from "@/models/POS/PMM/PMM20000";

/** PMM30000 promotion-confirm store: holds the draft + submits it, exposing redirectTo for the screen. */
export const PMM30000Store = defineStore("PMM30000Store", {
    state: () => ({
        draft: null as PromotionDraft | null,
        submitting: false,
        redirectTo: null as string | null,
        createApi: CreatePromotion.getInstance()
    }),
    actions: {
        /** Pull the PMM draft from the flow store; returns it (null → screen redirects back). */
        loadDraft(): PromotionDraft | null {
            // Fresh visit: clear last run's outcome so setting the SAME redirect
            // value again still triggers the view's change watcher.
            this.redirectTo = null;
            this.submitting = false;
            this.draft = ModuleFlowStore.loadDraft("PMM") as PromotionDraft | null;
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
                        PMM20000Store().$reset();
                        this.submitting = false;
                        ModuleFlowStore.saveResult("PMM", { promotionCode: p.promotionCode, name: draft.display.name });
                        ModuleFlowStore.clearDraft("PMM");
                        this.redirectTo = "/PMM40000";
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
