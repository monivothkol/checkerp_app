import { defineStore } from "pinia";
import { SAL31000Store } from "@/store/POS/SAL/SAL31000Store";
import CreatePackaging from "@/services/api/SAL/createPackaging";
import POP from "@/core/utilities/pop";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";

/** The PACKAGING draft handed from SAL31000 → SAL32000. */
export interface PackagingDraft {
    payload: {
        sourceType?: string;
        saleId?: string;
        referenceNumber?: string;
        notes?: string;
        items: {
            saleItemId?: string;
            productId?: string;
            productCode?: string;
            productName?: string;
            barcode?: string;
            unitName?: string;
            quantityRequired: number;
            sortOrder?: number;
        }[];
    };
    idempotencyKey: string;
    display: {
        saleCode?: string;
        itemCount: number;
        referenceNumber?: string;
        packerName?: string;
        notes?: string;
        lines: { name?: string; code?: string; unitName?: string; quantityRequired: number }[];
    };
}

/** SAL32000 packaging-confirm store: holds the draft + submits it, exposing redirectTo for the screen. */
export const SAL32000Store = defineStore("SAL32000Store", {
    state: () => ({
        draft: null as PackagingDraft | null,
        submitting: false,
        redirectTo: null as string | null,
        createApi: CreatePackaging.getInstance()
    }),
    actions: {
        /** Pull the PACKAGING draft from the flow store; returns it (null → screen redirects back). */
        loadDraft(): PackagingDraft | null {
            // Fresh visit: clear last run's outcome so setting the SAME redirect
            // value again still triggers the view's change watcher.
            this.redirectTo = null;
            this.submitting = false;
            this.draft = ModuleFlowStore.loadDraft("PACKAGING") as PackagingDraft | null;
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
                        SAL31000Store().$reset();
                        this.submitting = false;
                        ModuleFlowStore.saveResult("PACKAGING", { packagingCode: p.packagingCode, packagingId: p.packagingId });
                        ModuleFlowStore.clearDraft("PACKAGING");
                        this.redirectTo = "/SAL33000";
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
