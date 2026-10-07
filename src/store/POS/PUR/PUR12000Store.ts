import { defineStore } from "pinia";
import { PUR11000Store } from "@/store/POS/PUR/PUR11000Store";
import CreatePurchaseOrder from "@/services/api/PUR/createPurchaseOrder";
import type { ModuleApiError } from "@/services/api/COMMON/module-api";
import POP from "@/core/utilities/pop";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { PoDraft } from "@/models/POS/PUR/PUR11000";

/** PUR12000 PO-confirm store: holds the draft + submits it, exposing redirectTo for the screen. */
export const PUR12000Store = defineStore("PUR12000Store", {
    state: () => ({
        draft: null as PoDraft | null,
        submitting: false,
        redirectTo: null as string | null,
        createApi: CreatePurchaseOrder.getInstance()
    }),
    actions: {
        /** Pull the PUR draft from the flow store; returns it (null → screen redirects back). */
        loadDraft(): PoDraft | null {
            // Fresh visit: clear last run's outcome so setting the SAME redirect
            // value again still triggers the view's change watcher.
            this.redirectTo = null;
            this.submitting = false;
            this.draft = ModuleFlowStore.loadDraft("PUR") as PoDraft | null;
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
                        PUR11000Store().$reset();
                        this.submitting = false;
                        ModuleFlowStore.saveResult("PUR", {
                            poId: p.poId,
                            poCode: p.poCode,
                            grandTotal: p.grandTotal,
                            supplierName: draft.display.supplierName
                        });
                        ModuleFlowStore.clearDraft("PUR");
                        this.redirectTo = "/PUR13000";
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
