import { defineStore } from "pinia";
import RetrieveJournalDetail from "@/services/api/ACT/retrieveJournalDetail";
import type { ActJournalDetail } from "@/models/ACT/ACT40000";

/** ACT20100 journal-detail modal store: journal + lines loaded by journal number. */
export const ACT20100Store = defineStore("ACT20100Store", {
    state: () => ({
        loading: false,
        journal: null as ActJournalDetail | null,
        detailApi: RetrieveJournalDetail.getInstance()
    }),
    actions: {
        load(journalNo: string) {
            if (!journalNo) { this.loading = false; return; }
            this.loading = true;
            this.detailApi.request({
                dataBody: { journalNo },
                listener: {
                    onSuccess: (p) => {
                        this.journal = p as ActJournalDetail;
                        this.loading = false;
                    },
                    onFail: () => {
                        this.journal = null;
                        this.loading = false;
                    }
                }
            });
        }
    }
});
