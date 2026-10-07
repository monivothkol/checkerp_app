import { defineStore } from "pinia";
import { PUR21000Store } from "@/store/POS/PUR/PUR21000Store";
import CreatePurchaseIn from "@/services/api/PUR/createPurchaseIn";
import type { ModuleApiError } from "@/services/api/COMMON/module-api";
import POP from "@/core/utilities/pop";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { PurchaseInDraft } from "@/models/POS/PUR/PUR21000";

/** PUR22000 purchase-in confirm store: holds the draft + submits it, exposing redirectTo for the screen. */
export const PUR22000Store = defineStore("PUR22000Store", {
    state: () => ({
        draft: null as PurchaseInDraft | null,
        submitting: false,
        redirectTo: null as string | null,
        createApi: CreatePurchaseIn.getInstance()
    }),
    actions: {
        /** Pull the PURIN draft from the flow store; returns it (null → screen redirects back). */
        loadDraft(): PurchaseInDraft | null {
            // Fresh visit: clear last run's outcome so setting the SAME redirect
            // value again still triggers the view's change watcher.
            this.redirectTo = null;
            this.submitting = false;
            this.draft = ModuleFlowStore.loadDraft("PURIN") as PurchaseInDraft | null;
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
                        PUR21000Store().$reset();
                        this.submitting = false;
                        ModuleFlowStore.saveResult("PURIN", {
                            adjustmentId: p.adjustmentId,
                            adjustmentCode: p.adjustmentCode,
                            grandTotal: p.grandTotal,
                            supplierName: draft.display.supplierName
                        });
                        ModuleFlowStore.clearDraft("PURIN");
                        this.redirectTo = "/PUR23000";
                    },
                    onFail: (err: ModuleApiError) => {
                        this.submitting = false;
                        POP.alert({ title: failTitle, status: "error", content: err?.message, errorCode: err?.code });
                    }
                }
            });
        }
    }
});
