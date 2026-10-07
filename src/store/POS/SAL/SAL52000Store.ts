import { defineStore } from "pinia";
import { SAL41000Store } from "@/store/POS/SAL/SAL41000Store";
import CreateDelivery from "@/services/api/SAL/createDelivery";
import POP from "@/core/utilities/pop";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";

/** The DELIVERY draft handed from SAL41000 → SAL52000. */
export interface DeliveryDraft {
    payload: {
        saleId: string;
        driverId?: string;
        deliveryAddress?: string;
        scheduledDate?: string;
        notes?: string;
        customerName?: string;
        customerPhone?: string;
    };
    idempotencyKey: string;
    display: {
        saleCode?: string;
        customerName?: string;
        customerPhone?: string;
        deliveryAddress?: string;
        scheduledDate?: string;
        driverName?: string;
    };
}

/** SAL52000 delivery-confirm store: holds the draft + submits it, exposing redirectTo for the screen. */
export const SAL52000Store = defineStore("SAL52000Store", {
    state: () => ({
        draft: null as DeliveryDraft | null,
        submitting: false,
        redirectTo: null as string | null,
        createApi: CreateDelivery.getInstance()
    }),
    actions: {
        /** Pull the DELIVERY draft from the flow store; returns it (null → screen redirects back). */
        loadDraft(): DeliveryDraft | null {
            // Fresh visit: clear last run's outcome so setting the SAME redirect
            // value again still triggers the view's change watcher.
            this.redirectTo = null;
            this.submitting = false;
            this.draft = ModuleFlowStore.loadDraft("DELIVERY") as DeliveryDraft | null;
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
                        SAL41000Store().$reset();
                        this.submitting = false;
                        ModuleFlowStore.saveResult("DELIVERY", { deliveryCode: p.deliveryCode, deliveryId: p.deliveryId });
                        ModuleFlowStore.clearDraft("DELIVERY");
                        this.redirectTo = "/SAL63000";
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
