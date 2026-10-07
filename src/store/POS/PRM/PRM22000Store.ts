import { defineStore } from "pinia";
import { PRM21000Store } from "@/store/POS/PRM/PRM21000Store";
import CreateAdjustment from "@/services/api/PRM/createAdjustment";
import POP from "@/core/utilities/pop";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { AdjustmentDraft } from "@/models/POS/PRM/PRM21000";

/** PRM22000 adjustment-confirm store: holds the draft + submits it, exposing redirectTo for the screen. */
export const PRM22000Store = defineStore("PRM22000Store", {
    state: () => ({
        draft: null as AdjustmentDraft | null,
        submitting: false,
        redirectTo: null as string | null,
        createApi: CreateAdjustment.getInstance()
    }),
    actions: {
        /** Pull the PRM draft from the flow store; returns it (null → screen redirects back). */
        loadDraft(): AdjustmentDraft | null {
            // Fresh visit: clear last run's outcome so setting the SAME redirect
            // value again still triggers the view's change watcher.
            this.redirectTo = null;
            this.submitting = false;
            this.draft = ModuleFlowStore.loadDraft("PRM") as AdjustmentDraft | null;
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
                        PRM21000Store().$reset();
                        this.submitting = false;
                        ModuleFlowStore.saveResult("PRM", {
                            adjustmentId: p.adjustmentId,
                            staffName: draft.display.staffName,
                            typeName: draft.display.typeName
                        });
                        ModuleFlowStore.clearDraft("PRM");
                        this.redirectTo = "/PRM23000";
                    },
                    onFail: (err) => {
                        this.submitting = false;
                        POP.alert({ title: failTitle, status: "error", content: err?.message ?? "", errorCode: err?.code });
                    }
                }
            });
        }
    }
});
