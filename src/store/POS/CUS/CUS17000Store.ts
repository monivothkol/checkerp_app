import { defineStore } from "pinia";
import RetrieveCustomerList from "@/services/api/CUS/retrieveCustomerList";
import RetrieveCustomerBalance from "@/services/api/CUS/retrieveCustomerBalance";
import POP from "@/core/utilities/pop";
import type { CustomerLookup } from "@/models/POS/COMMON/lookups";
import type { CUS17000Response } from "@/models/POS/CUS/CUS17000";

/** CUS17000 customer-balance report store: customer lookup + balance-statement api calls. */
export const CUS17000Store = defineStore("CUS17000Store", {
    state: () => ({
        customers: [] as CustomerLookup[],
        customerId: undefined as string | undefined,
        range: [] as string[],
        report: null as CUS17000Response | null,
        searching: false,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        customerApi: RetrieveCustomerList.getInstance(),
        balanceApi: RetrieveCustomerBalance.getInstance()
    }),
    actions: {
        onCustomerSearch(kw: string) {
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searching = true;
            this.searchTimer = setTimeout(() => this.searchCustomers(kw), 250);
        },
        searchCustomers(kw: string) {
            this.customerApi.request({
                dataBody: { searchKeyword: kw || undefined, pageNo: 1, pageSize: 30 },
                enableLoading: false,
                listener: {
                    onSuccess: (p: { customerList?: CustomerLookup[] }) => { this.customers = p.customerList ?? []; this.searching = false; },
                    onFail: () => { this.searching = false; }
                }
            });
        },
        /** Load the balance statement for the selected customer; `failTitle` is already translated (i18n stays in the screen). */
        load(failTitle: string) {
            if (!this.customerId) return;
            this.balanceApi.request({
                dataBody: {
                    customerId: this.customerId,
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
