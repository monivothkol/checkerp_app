import { defineStore } from "pinia";
import RetrieveStoreInfo from "@/services/api/ADM/retrieveStoreInfo";
import type { StoreInfo } from "@/models/POS/ADM/ADM30000";

/** ADM30000 store-info detail screen store: loads the company/store profile. */
export const ADM30000Store = defineStore("ADM30000Store", {
    state: () => ({
        loading: true,
        info: null as StoreInfo | null,
        storeInfoApi: RetrieveStoreInfo.getInstance()
    }),
    actions: {
        load() {
            this.loading = true;
            this.storeInfoApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => { this.info = p; this.loading = false; },
                    onFail: () => { this.info = null; this.loading = false; }
                }
            });
        }
    }
});
