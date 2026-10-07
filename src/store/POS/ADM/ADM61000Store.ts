import { defineStore } from "pinia";
import RetrieveBakongInfo from "@/services/api/ADM/retrieveBakongInfo";
import SaveBakongInfo from "@/services/api/ADM/saveBakongInfo";
import POP from "@/core/utilities/pop";
import type { ModuleApiError } from "@/services/api/COMMON/module-api";
import type { SaveMessages } from "@/store/POS/ADM/ADM31000Store";

/** ADM61000 Bakong-config edit store: load existing config, save, redirect on success. */
export const ADM61000Store = defineStore("ADM61000Store", {
    state: () => ({
        loading: true,
        saving: false,
        redirectTo: null as string | null,
        form: {
            bakongAccountId: "", merchantType: "MERCHANT", merchantName: "", merchantCity: "", merchantId: "",
            acquiringBank: "", merchantCategoryCode: "", defaultCurrency: "840", storeLabel: "", terminalLabel: "", mobileNumber: ""
        },
        retrieveApi: RetrieveBakongInfo.getInstance(),
        saveApi: SaveBakongInfo.getInstance()
    }),
    getters: {
        canSave(state): boolean {
            return !!state.form.bakongAccountId && !!state.form.merchantName && !!state.form.merchantCity;
        }
    },
    actions: {
        load() {
            this.loading = true;
            this.redirectTo = null;
            this.retrieveApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => {
                        if (p.exists) {
                            const target = this.form as Record<string, unknown>;
                            for (const [k, v] of Object.entries(p) as [string, unknown][]) {
                                if (v != null && k in this.form) target[k] = v;
                            }
                        }
                        this.loading = false;
                    },
                    onFail: () => { this.loading = false; }
                }
            });
        },
        save(msgs: SaveMessages) {
            if (!this.canSave) return;
            this.saving = true;
            this.saveApi.request({
                dataBody: { ...this.form },
                listener: {
                    onSuccess: () => {
                        this.saving = false;
                        POP.alert({ title: msgs.savedTitle, status: "success", content: msgs.savedMsg });
                        this.redirectTo = "/ADM60000";
                    },
                    onFail: (e: ModuleApiError) => {
                        this.saving = false;
                        POP.alert({ title: msgs.failedTitle, status: "error", content: e?.message, errorCode: e?.code });
                    }
                }
            });
        }
    }
});
