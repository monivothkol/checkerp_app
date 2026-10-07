import { defineStore } from "pinia";
import { ADM11000Store } from "@/store/POS/ADM/ADM11000Store";
import CreateUser from "@/services/api/ADM/createUser";
import type { ModuleApiError } from "@/services/api/COMMON/module-api";
import POP from "@/core/utilities/pop";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { UserDraft } from "@/models/POS/ADM/ADM11000";

/** ADM12000 user-confirm store: holds the draft + submits it, exposing redirectTo for the screen.
 * The password is passed in from UserCreateSecret (kept in the component) — never stored here. */
export const ADM12000Store = defineStore("ADM12000Store", {
    state: () => ({
        draft: null as UserDraft | null,
        submitting: false,
        redirectTo: null as string | null,
        createApi: CreateUser.getInstance()
    }),
    actions: {
        /** Pull the ADM user draft from the flow store; returns it (null → screen redirects back). */
        loadDraft(): UserDraft | null {
            // Fresh visit: clear last run's outcome so setting the SAME redirect
            // value again still triggers the view's change watcher.
            this.redirectTo = null;
            this.submitting = false;
            this.draft = ModuleFlowStore.loadDraft("ADM") as UserDraft | null;
            return this.draft;
        },
        clearDraft() {
            ModuleFlowStore.clearDraft("ADM");
        },
        /** Submit the draft with the in-memory `password`; `failTitle` is the already-translated alert title. */
        submit(password: string, failTitle: string) {
            const draft = this.draft;
            if (this.submitting || !draft) return;
            this.submitting = true;
            this.createApi.request({
                dataBody: { ...draft.payload, password },
                headers: { "Idempotency-Key": draft.idempotencyKey },
                listener: {
                    onSuccess: (p) => {
                        // The create form was submitted — clear it so the next visit starts blank.
                        ADM11000Store().$reset();
                        this.submitting = false;
                        ModuleFlowStore.saveResult("ADM", { userId: p.userId, username: p.username, name: draft.display.name });
                        ModuleFlowStore.clearDraft("ADM");
                        this.redirectTo = "/ADM13000";
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
