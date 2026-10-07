import { defineStore } from "pinia";
import RetrieveAccountList from "@/services/api/ACT/retrieveAccountList";
import InitializeChartOfAccounts from "@/services/api/ACT/initializeChartOfAccounts";
import POP from "@/core/utilities/pop";
import type { ActAccount } from "@/models/ACT/ACT40000";

/** ACT40000 chart-of-accounts screen store: filtered account list + default-COA initializer. */
export const ACT40000Store = defineStore("ACT40000Store", {
    state: () => ({
        loading: false,
        keyword: "",
        typeFilter: undefined as string | undefined,
        accounts: [] as ActAccount[],
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        listApi: RetrieveAccountList.getInstance(),
        initApi: InitializeChartOfAccounts.getInstance()
    }),
    actions: {
        onSearch() {
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this.load(), 300);
        },
        load() {
            this.loading = true;
            this.listApi.request({
                dataBody: { searchKeyword: this.keyword, accountType: this.typeFilter ?? "" },
                listener: {
                    onSuccess: (p) => {
                        this.accounts = p.accountList ?? [];
                        this.loading = false;
                    },
                    onFail: () => {
                        this.accounts = [];
                        this.loading = false;
                    }
                }
            });
        },
        /** Seed the default chart of accounts; `labels` are already-translated (i18n stays in the screen). */
        initialize(labels: { initialized: string; failed: string; complete?: string }) {
            this.initApi.request({
                dataBody: {},
                enableLoading: true,
                listener: {
                    onSuccess: (p) => {
                        // nothing was missing → say so rather than claim accounts were created
                        const content = p?.alreadyInitialized && labels.complete ? labels.complete : labels.initialized;
                        POP.openNotification({ type: "success", content });
                        this.load();
                    },
                    onFail: () => POP.openNotification({ type: "error", content: labels.failed })
                }
            });
        }
    }
});
