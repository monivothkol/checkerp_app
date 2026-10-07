import { defineStore } from "pinia";
import CreateSchedule from "@/services/api/ATD/createSchedule";
import POP from "@/core/utilities/pop";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { ScheduleDraft } from "@/models/POS/ATD/ATD30000";

/** ATD32000 schedule-confirm store: holds the draft + submits it, exposing redirectTo for the screen. */
export const ATD32000Store = defineStore("ATD32000Store", {
    state: () => ({
        draft: null as ScheduleDraft | null,
        submitting: false,
        redirectTo: null as string | null,
        createApi: CreateSchedule.getInstance()
    }),
    actions: {
        /** Pull the ATD draft from the flow store; returns it (null → screen redirects back). */
        loadDraft(): ScheduleDraft | null {
            // Fresh visit: clear last run's outcome so setting the SAME redirect
            // value again still triggers the view's change watcher.
            this.redirectTo = null;
            this.submitting = false;
            this.draft = ModuleFlowStore.loadDraft("ATD") as ScheduleDraft | null;
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
                        this.submitting = false;
                        ModuleFlowStore.saveResult("ATD", {
                            scheduleId: p.scheduleId,
                            scheduleCode: p.scheduleCode,
                            name: draft.display.name
                        });
                        ModuleFlowStore.clearDraft("ATD");
                        this.redirectTo = "/ATD33000";
                    },
                    onFail: (err: { message?: string; code?: string }) => {
                        this.submitting = false;
                        POP.alert({ title: failTitle, status: "error", content: err?.message ?? "", errorCode: err?.code });
                    }
                }
            });
        }
    }
});
