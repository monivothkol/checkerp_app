import { defineStore } from "pinia";
import { LVM11000Store } from "@/store/POS/LVM/LVM11000Store";
import CreateLeaveRequest from "@/services/api/LVM/createLeaveRequest";
import POP from "@/core/utilities/pop";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { LeaveDraft } from "@/models/POS/LVM/LVM10000";

/** LVM12000 confirm-leave-request store: holds the draft + submits it, exposing redirectTo for the screen. */
export const LVM12000Store = defineStore("LVM12000Store", {
    state: () => ({
        draft: null as LeaveDraft | null,
        submitting: false,
        redirectTo: null as string | null,
        createApi: CreateLeaveRequest.getInstance()
    }),
    getters: {
        approvers(state): string[] {
            return state.draft?.display?.approvers ?? [];
        }
    },
    actions: {
        /** Pull the LVM draft from the flow store; returns it (null → screen redirects back). */
        loadDraft(): LeaveDraft | null {
            // Fresh visit: clear last run's outcome so setting the SAME redirect
            // value again still triggers the view's change watcher.
            this.redirectTo = null;
            this.submitting = false;
            this.draft = ModuleFlowStore.loadDraft("LVM") as LeaveDraft | null;
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
                        LVM11000Store().$reset();
                        this.submitting = false;
                        ModuleFlowStore.saveResult("LVM", {
                            requestId: p.requestId,
                            totalDays: p.totalDays,
                            approverCount: p.approverCount,
                            staffName: draft.display.staffName,
                            typeName: draft.display.typeName
                        });
                        ModuleFlowStore.clearDraft("LVM");
                        this.redirectTo = "/LVM13000";
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
