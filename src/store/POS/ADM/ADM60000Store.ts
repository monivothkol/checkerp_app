import { defineStore } from "pinia";
import RetrieveBakongInfo from "@/services/api/ADM/retrieveBakongInfo";
import type { BakongInfo } from "@/models/POS/ADM/ADM60000";

/** ADM60000 Bakong-config detail screen store: loads the merchant config. */
export const ADM60000Store = defineStore("ADM60000Store", {
    state: () => ({
        loading: true,
        info: null as BakongInfo | null,
        bakongApi: RetrieveBakongInfo.getInstance()
    }),
    actions: {
        load() {
            this.loading = true;
            this.bakongApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => { this.info = p; this.loading = false; },
                    onFail: () => { this.info = { exists: false }; this.loading = false; }
                }
            });
        }
    }
});
