import { defineStore } from "pinia";
import RetrieveScheduleList from "@/services/api/ATD/retrieveScheduleList";
import type { ScheduleRow, ATD30000Response } from "@/models/POS/ATD/ATD30000";

/** ATD30000 work-schedule list store: search state + list api call. */
export const ATD30000Store = defineStore("ATD30000Store", {
    state: () => ({
        keyword: "",
        rows: [] as ScheduleRow[],
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        scheduleApi: RetrieveScheduleList.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.scheduleApi.request({
                dataBody: { pageNo: this.pageNo, pageSize: this.pageSize, searchKeyword: this.keyword },
                listener: {
                    onSuccess: (p: ATD30000Response) => {
                        this.rows = p.scheduleList ?? [];
                        this.total = p.totalCount ?? 0;
                        this.loading = false;
                    },
                    onFail: () => { this.rows = []; this.total = 0; this.loading = false; }
                }
            });
        },
        onSearch() {
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => { this.pageNo = 1; this.reload(); }, 300);
        },
        setPage(pageNo: number, pageSize: number) {
            this.pageNo = pageNo;
            this.pageSize = pageSize;
            this.reload();
        }
    }
});
