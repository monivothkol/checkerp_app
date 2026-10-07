import { defineStore } from "pinia";
import { STK31000Store } from "@/store/POS/STK/STK31000Store";
import CreateAdjustment from "@/services/api/STK/createAdjustment";
import POP from "@/core/utilities/pop";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { AdjustmentDraft } from "@/models/POS/STK/STK31000";

/** STK32000 adjustment-confirm store: holds the draft + submits it, exposing redirectTo for the screen. */
export const STK32000Store = defineStore("STK32000Store", {
    state: () => ({
        draft: null as AdjustmentDraft | null,
        submitting: false,
        redirectTo: null as string | null,
        createApi: CreateAdjustment.getInstance()
    }),
    actions: {
        /** Pull the STK_ADJUST draft from the flow store; returns it (null → screen redirects back). */
        loadDraft(): AdjustmentDraft | null {
            // Fresh visit: clear last run's outcome so setting the SAME redirect
            // value again still triggers the view's change watcher.
            this.redirectTo = null;
            this.submitting = false;
            this.draft = ModuleFlowStore.loadDraft("STK_ADJUST") as AdjustmentDraft | null;
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
                        STK31000Store().$reset();
                        this.submitting = false;
                        ModuleFlowStore.clearDraft("STK_ADJUST");
                        this.redirectTo = `/STK33000?adjustmentCode=${encodeURIComponent(p.adjustmentCode ?? "")}`;
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
