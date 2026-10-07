import { defineStore } from "pinia";
import { STK21000Store } from "@/store/POS/STK/STK21000Store";
import CreateTransfer from "@/services/api/STK/createTransfer";
import POP from "@/core/utilities/pop";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { TransferDraft } from "@/models/POS/STK/STK21000";

/** STK22000 transfer-confirm store: holds the draft + submits it, exposing redirectTo for the screen. */
export const STK22000Store = defineStore("STK22000Store", {
    state: () => ({
        draft: null as TransferDraft | null,
        submitting: false,
        redirectTo: null as string | null,
        createApi: CreateTransfer.getInstance()
    }),
    actions: {
        /** Pull the STK_TRANSFER draft from the flow store; returns it (null → screen redirects back). */
        loadDraft(): TransferDraft | null {
            // Fresh visit: clear last run's outcome so setting the SAME redirect
            // value again still triggers the view's change watcher.
            this.redirectTo = null;
            this.submitting = false;
            this.draft = ModuleFlowStore.loadDraft("STK_TRANSFER") as TransferDraft | null;
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
                        STK21000Store().$reset();
                        this.submitting = false;
                        ModuleFlowStore.clearDraft("STK_TRANSFER");
                        this.redirectTo = `/STK23000?transferCode=${encodeURIComponent(p.transferCode ?? "")}`;
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
