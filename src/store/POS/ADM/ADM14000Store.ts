import { defineStore } from "pinia";
import RetrieveUserDetail from "@/services/api/ADM/retrieveUserDetail";
import type { UserDetail } from "@/models/POS/ADM/ADM14000";

/** ADM14000 user-detail screen store: detail load by target user id. */
export const ADM14000Store = defineStore("ADM14000Store", {
    state: () => ({
        loading: true,
        detail: null as UserDetail | null,
        userDetailApi: RetrieveUserDetail.getInstance()
    }),
    actions: {
        load(targetUserId: string) {
            if (!targetUserId) { this.loading = false; return; }
            this.loading = true;
            this.userDetailApi.request({
                dataBody: { targetUserId },
                listener: {
                    onSuccess: (p) => { this.detail = p.user ?? p; this.loading = false; },
                    onFail: () => { this.detail = null; this.loading = false; }
                }
            });
        }
    }
});
