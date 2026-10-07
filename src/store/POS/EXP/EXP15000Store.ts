import { defineStore } from "pinia";
import RetrieveExpenseDetail from "@/services/api/EXP/retrieveExpenseDetail";
import type { ExpenseDetail } from "@/models/POS/EXP/EXP10000";

/** EXP15000 expense detail store. */
export const EXP15000Store = defineStore("EXP15000Store", {
    state: () => ({
        detail: null as ExpenseDetail | null,
        loading: false,
        api: RetrieveExpenseDetail.getInstance()
    }),
    actions: {
        load(expenseId: string) {
            this.loading = true;
            this.api.request({
                dataBody: { expenseId },
                listener: {
                    onSuccess: (d: ExpenseDetail) => { this.detail = d; this.loading = false; },
                    onFail: () => { this.detail = null; this.loading = false; }
                }
            });
        }
    }
});
