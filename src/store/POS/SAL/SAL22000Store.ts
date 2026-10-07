import { defineStore } from "pinia";
import { SAL21000Store } from "@/store/POS/SAL/SAL21000Store";
import CreateSaleReturn from "@/services/api/SAL/createSaleReturn";
import POP from "@/core/utilities/pop";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { ReturnDraft } from "@/models/POS/SAL/SAL21000";

/** SAL22000 sale-return confirm store: holds the draft + submits it, exposing redirectTo for the screen. */
export const SAL22000Store = defineStore("SAL22000Store", {
    state: () => ({
        draft: null as ReturnDraft | null,
        submitting: false,
        redirectTo: null as string | null,
        createApi: CreateSaleReturn.getInstance()
    }),
    actions: {
        /** Pull the SALR draft from the flow store; returns it (null → screen redirects back). */
        loadDraft(): ReturnDraft | null {
            // Fresh visit: clear last run's outcome so setting the SAME redirect
            // value again still triggers the view's change watcher.
            this.redirectTo = null;
            this.submitting = false;
            this.draft = ModuleFlowStore.loadDraft("SALR") as ReturnDraft | null;
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
                        SAL21000Store().$reset();
                        this.submitting = false;
                        ModuleFlowStore.saveResult("SALR", {
                            returnId: p.returnId,
                            returnCode: p.returnCode,
                            totalRefund: p.totalRefund,
                            saleCode: draft.display.saleCode
                        });
                        ModuleFlowStore.clearDraft("SALR");
                        this.redirectTo = "/SAL23000";
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
