import { defineStore } from "pinia";
import RetrieveSupplierList from "@/services/api/SUP/retrieveSupplierList";
import RetrieveSupplierBalance from "@/services/api/SUP/retrieveSupplierBalance";
import POP from "@/core/utilities/pop";
import type { SupplierLookup } from "@/models/POS/COMMON/lookups";
import type { SUP17000Response } from "@/models/POS/SUP/SUP17000";

/** SUP17000 supplier-balance report store: supplier lookup + balance-statement api calls. */
export const SUP17000Store = defineStore("SUP17000Store", {
    state: () => ({
        suppliers: [] as SupplierLookup[],
        supplierId: undefined as string | undefined,
        range: [] as string[],
        report: null as SUP17000Response | null,
        searching: false,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        supplierApi: RetrieveSupplierList.getInstance(),
        balanceApi: RetrieveSupplierBalance.getInstance()
    }),
    actions: {
        onSupplierSearch(kw: string) {
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searching = true;
            this.searchTimer = setTimeout(() => this.searchSuppliers(kw), 250);
        },
        searchSuppliers(kw: string) {
            this.supplierApi.request({
                dataBody: { searchKeyword: kw || undefined, pageNo: 1, pageSize: 30 },
                enableLoading: false,
                listener: {
                    onSuccess: (p: { supplierList?: SupplierLookup[] }) => { this.suppliers = p.supplierList ?? []; this.searching = false; },
                    onFail: () => { this.searching = false; }
                }
            });
        },
        /** Load the balance statement for the selected supplier; `failTitle` is already translated (i18n stays in the screen). */
        load(failTitle: string) {
            if (!this.supplierId) return;
            this.balanceApi.request({
                dataBody: {
                    supplierId: this.supplierId,
                    startDate: this.range?.[0] || undefined,
                    endDate: this.range?.[1] || undefined
                },
                listener: {
                    onSuccess: (p) => {
                        this.report = p;
                        if (!this.range?.length && p.startDate && p.endDate) {
                            this.range = [p.startDate, p.endDate];
                        }
                    },
                    onFail: (error: { message?: string; code?: string }) => {
                        this.report = null;
                        POP.alert({ title: failTitle, status: "error", content: error?.message, errorCode: error?.code });
                    }
                }
            });
        }
    }
});
