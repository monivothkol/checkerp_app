import { defineStore } from "pinia";
import { SIV11000Store } from "@/store/POS/SIV/SIV11000Store";
import CreateSale from "@/services/api/SIV/createSale";
import POP from "@/core/utilities/pop";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { InvoiceDraft, SIV11000CreateResponse } from "@/models/POS/SIV/SIV11000";

/** SIV12000 invoice-confirm store: holds the draft + submits it, exposing redirectTo for the screen. */
export const SIV12000Store = defineStore("SIV12000Store", {
    state: () => ({
        draft: null as InvoiceDraft | null,
        submitting: false,
        redirectTo: null as string | null,
        createApi: CreateSale.getInstance()
    }),
    actions: {
        /** Pull the SIV draft from the flow store; returns it (null → screen redirects back). */
        loadDraft(): InvoiceDraft | null {
            // Fresh visit: clear last run's outcome so setting the SAME redirect
            // value again still triggers the view's change watcher.
            this.redirectTo = null;
            this.submitting = false;
            this.draft = ModuleFlowStore.loadDraft("SIV") as InvoiceDraft | null;
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
                    onSuccess: (p: SIV11000CreateResponse) => {
                        // The create form was submitted — clear it so the next visit starts blank.
                        SIV11000Store().$reset();
                        this.submitting = false;
                        ModuleFlowStore.clearDraft("SIV");
                        this.redirectTo = `/SIV13000?saleCode=${encodeURIComponent(p.saleCode ?? "")}`;
                    },
                    onFail: (err: { message?: string; code?: string }) => {
                        this.submitting = false;
                        POP.alert({ title: failTitle, status: "error", content: err?.message, errorCode: err?.code });
                    }
                }
            });
        }
    }
});
