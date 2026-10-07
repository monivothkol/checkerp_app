import { defineStore } from "pinia";
import RetrievePayrollSettings from "@/services/api/PRM/retrievePayrollSettings";
import SavePayrollSettings from "@/services/api/PRM/savePayrollSettings";
import POP from "@/core/utilities/pop";

/** Already-translated alert titles the screen hands to save() (i18n stays in the screen). */
export interface PRM30000SaveTitles {
    savedTitle: string;
    savedMsg: string;
    failTitle: string;
}

/** PRM30000 payroll-settings store: currency + exchange rate (working days and day rules live in ATD50000). */
export const PRM30000Store = defineStore("PRM30000Store", {
    state: () => ({
        loading: true,
        saving: false,
        form: {
            currency: "USD",
            exchangeRate: undefined as number | undefined
        },
        loadApi: RetrievePayrollSettings.getInstance(),
        saveApi: SavePayrollSettings.getInstance()
    }),
    actions: {
        load() {
            this.loading = true;
            this.loadApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => {
                        this.form.currency = p.currency ?? "USD";
                        this.form.exchangeRate = p.exchangeRate;
                        this.loading = false;
                    },
                    onFail: () => { this.loading = false; }
                }
            });
        },
        /** Persist the form; `titles` are already-translated alert strings. */
        save(titles: PRM30000SaveTitles) {
            if (this.saving) return;
            this.saving = true;
            this.saveApi.request({
                dataBody: { ...this.form },
                listener: {
                    onSuccess: () => {
                        this.saving = false;
                        POP.alert({ title: titles.savedTitle, status: "success", content: titles.savedMsg });
                        this.load();
                    },
                    onFail: (err: { message?: string; code?: string }) => {
                        this.saving = false;
                        POP.alert({ title: titles.failTitle, status: "error", content: err?.message ?? "", errorCode: err?.code });
                    }
                }
            });
        }
    }
});
