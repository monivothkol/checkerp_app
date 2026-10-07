import { defineStore } from "pinia";
import RetrieveJournalList from "@/services/api/ACT/retrieveJournalList";
import ReverseJournal from "@/services/api/ACT/reverseJournal";
import POP from "@/core/utilities/pop";
import type { ActJournalRow } from "@/models/ACT/ACT40000";

/** ACT20000 journal-list screen store: filters, paging, list load, and reverse write. */
export const ACT20000Store = defineStore("ACT20000Store", {
    state: () => ({
        loading: false,
        keyword: "",
        sourceType: undefined as string | undefined,
        status: undefined as string | undefined,
        dateRange: undefined as [string, string] | undefined,
        rows: [] as ActJournalRow[],
        totalCount: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        listApi: RetrieveJournalList.getInstance(),
        reverseApi: ReverseJournal.getInstance()
    }),
    actions: {
        onSearch() {
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this.onFilter(), 300);
        },
        /** Filter changed: results start over from page 1. */
        onFilter() {
            this.pageNo = 1;
            this.reload();
        },

        reload() {
            this.pageNo = 1;
            this.load();
        },
        load() {
            this.loading = true;
            this.listApi.request({
                dataBody: {
                    searchKeyword: this.keyword,
                    sourceType: this.sourceType ?? "",
                    journalStatusCode: this.status ?? "",
                    fromDate: this.dateRange?.[0] ?? "",
                    toDate: this.dateRange?.[1] ?? "",
                    pageNo: this.pageNo,
                    pageSize: this.pageSize
                },
                listener: {
                    onSuccess: (p) => {
                        this.rows = p.journalList ?? [];
                        this.totalCount = Number(p.totalCount ?? 0);
                        this.loading = false;
                    },
                    onFail: () => {
                        this.rows = [];
                        this.totalCount = 0;
                        this.loading = false;
                    }
                }
            });
        },
        /** Reverse a posted journal; `labels` are already-translated (i18n stays in the screen). */
        reverse(journalNo: string, reason: string, labels: { reversedAs: string; failed: string }) {
            this.reverseApi.request({
                dataBody: { journalNo, reason },
                enableLoading: true,
                listener: {
                    onSuccess: (p) => {
                        POP.openNotification({ type: "success", content: `${labels.reversedAs} ${p.journalNo ?? ""}` });
                        this.load();
                    },
                    onFail: (e) =>
                        POP.openNotification({ type: "error", content: e?.message ?? labels.failed })
                }
            });
        }
    }
});
