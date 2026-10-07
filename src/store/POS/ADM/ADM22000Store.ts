import { defineStore } from "pinia";
import { ADM21000Store } from "@/store/POS/ADM/ADM21000Store";
import POP from "@/core/utilities/pop";
import CreateRole from "@/services/api/ADM/createRole";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { RoleDraft } from "@/models/POS/ADM/ADM20000";

/** ADM22000 role-confirm store: holds the draft + submits it, exposing redirectTo for the screen. */
export const ADM22000Store = defineStore("ADM22000Store", {
    state: () => ({
        draft: null as RoleDraft | null,
        saving: false,
        redirectTo: null as string | null,
        createApi: CreateRole.getInstance()
    }),
    actions: {
        /** Pull the ADMR draft from the flow store; returns it (null → screen redirects back). */
        loadDraft(): RoleDraft | null {
            // Fresh visit: clear last run's outcome so setting the SAME redirect
            // value again still triggers the view's change watcher.
            this.redirectTo = null;
            this.saving = false;
            this.draft = ModuleFlowStore.loadDraft("ADMR") as RoleDraft | null;
            return this.draft;
        },
        /** Submit the draft; `failTitle` is the already-translated alert title. */
        submit(failTitle: string) {
            const draft = this.draft;
            if (!draft || this.saving) return;
            this.saving = true;
            this.createApi.request({
                dataBody: {
                    roleName: draft.form.roleName,
                    description: draft.form.description || undefined,
                    permissionCodes: draft.selected
                },
                headers: { "Idempotency-Key": draft.idempotencyKey },
                listener: {
                    onSuccess: (payload) => {
                        // The create form was submitted — clear it so the next visit starts blank.
                        ADM21000Store().$reset();
                        // Navigate to result ONLY on success — the returned roleCode proves the commit.
                        ModuleFlowStore.saveResult("ADMR", { ...payload });
                        ModuleFlowStore.clearDraft("ADMR");
                        this.redirectTo = "/ADM23000";
                    },
                    onFail: (error) => {
                        this.saving = false;
                        POP.alert({
                            title: failTitle,
                            status: "error",
                            content: error?.message || "Please try again.",
                            errorCode: error?.code
                        });
                    }
                }
            });
        }
    }
});
