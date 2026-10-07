import { defineStore } from "pinia";
import RetrieveAccountingOverview from "@/services/api/ACT/retrieveAccountingOverview";

export interface RecentJournal {
    journalNo: string;
    entryDate: string;
    description?: string;
    sourceType: string;
    amount: number;
}

/** ACT10000 accounting-overview screen store: KPI figures + recent journals. */
export const ACT10000Store = defineStore("ACT10000Store", {
    state: () => ({
        loading: false,
        data: {} as Record<string, unknown>,
        recent: [] as RecentJournal[],
        overviewApi: RetrieveAccountingOverview.getInstance()
    }),
    actions: {
        load() {
            this.loading = true;
            this.overviewApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p) => {
                        this.data = p;
                        this.recent = (p.recentJournalList ?? []) as RecentJournal[];
                        this.loading = false;
                    },
                    onFail: () => {
                        this.data = {};
                        this.recent = [];
                        this.loading = false;
                    }
                }
            });
        }
    }
});
