import { defineStore } from "pinia";
import { SAL12000Store } from "@/store/POS/SAL/SAL12000Store";
import CreateQuotation from "@/services/api/SAL/createQuotation";
import POP from "@/core/utilities/pop";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { QuotationDraft } from "@/models/POS/SAL/SAL12000";

/** SAL13000 quotation-confirm store: holds the draft + submits it, exposing redirectTo for the screen. */
export const SAL13000Store = defineStore("SAL13000Store", {
    state: () => ({
        draft: null as QuotationDraft | null,
        submitting: false,
        redirectTo: null as string | null,
        createApi: CreateQuotation.getInstance()
    }),
    actions: {
        /** Pull the SAL draft from the flow store; returns it (null → screen redirects back). */
        loadDraft(): QuotationDraft | null {
            // Fresh visit: clear last run's outcome so setting the SAME redirect
            // value again still triggers the view's change watcher.
            this.redirectTo = null;
            this.submitting = false;
            this.draft = ModuleFlowStore.loadDraft("SAL") as QuotationDraft | null;
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
                        SAL12000Store().$reset();
                        this.submitting = false;
                        ModuleFlowStore.saveResult("SAL", { quotationNo: p.quotationNo, customerName: draft.display.customer });
                        ModuleFlowStore.clearDraft("SAL");
                        this.redirectTo = "/SAL14000";
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
