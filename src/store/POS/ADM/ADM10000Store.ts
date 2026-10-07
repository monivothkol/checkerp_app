import { defineStore } from "pinia";
import RetrieveUserList from "@/services/api/ADM/retrieveUserList";
import type { UserRow, ADM10000Response } from "@/models/POS/ADM/ADM10000";

/** ADM10000 user-list screen store: filter/paging state + list api call. */
export const ADM10000Store = defineStore("ADM10000Store", {
    state: () => ({
        keyword: "",
        isActive: undefined as string | undefined,
        rows: [] as UserRow[],
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        userApi: RetrieveUserList.getInstance()
    }),
    actions: {
        /** Filter changed: results start over from page 1. */
        onFilter() {
            this.pageNo = 1;
            this.reload();
        },

        reload() {
            this.loading = true;
            this.userApi.request({
                dataBody: {
                    searchKeyword: this.keyword || undefined,
                    isActive: this.isActive || undefined,
                    pageNo: this.pageNo,
                    pageSize: this.pageSize
                },
                listener: {
                    onSuccess: (p: ADM10000Response) => {
                        this.rows = p.userList ?? [];
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
