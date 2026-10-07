import { defineStore } from "pinia";
import RetrieveFailedEventList from "@/services/api/ADM/retrieveFailedEventList";
import type { FailedEventRow } from "@/models/POS/ADM/ADM80000";

/** ADM80000 failed-events list screen store: status filter + paged list. */
export const ADM80000Store = defineStore("ADM80000Store", {
    state: () => ({
        status: "PENDING",
        rows: [] as FailedEventRow[],
        loading: false,
        total: 0,
        pendingCount: 0,
        pageNo: 1,
        pageSize: 10,
        eventApi: RetrieveFailedEventList.getInstance()
    }),
    actions: {
        /** Filter changed: results start over from page 1. */
        onFilter() {
            this.pageNo = 1;
            this.reload();
        },

        reload() {
            this.loading = true;
            this.eventApi.request({
                dataBody: { status: this.status, pageNo: this.pageNo, pageSize: this.pageSize },
                listener: {
                    onSuccess: (p) => {
                        this.rows = p.eventList ?? [];
                        this.total = p.totalCount ?? 0;
                        this.pendingCount = p.pendingCount ?? 0;
                        this.loading = false;
                    },
                    onFail: () => { this.rows = []; this.total = 0; this.loading = false; }
                }
            });
        },
        setPage(pageNo: number, pageSize: number) {
            this.pageNo = pageNo;
            this.pageSize = pageSize;
            this.reload();
        }
    }
});
