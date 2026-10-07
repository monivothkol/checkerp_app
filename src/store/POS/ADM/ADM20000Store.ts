import { defineStore } from "pinia";
import RetrieveRoleList from "@/services/api/ADM/retrieveRoleList";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** ADM20000 role-list screen store: search/paging state + role list api call. */
export const ADM20000Store = defineStore("ADM20000Store", {
    state: () => ({
        keyword: "",
        loading: false,
        rows: [] as Record<string, any>[],
        pageNo: 1,
        pageSize: 10,
        totalCount: 0,
        roleApi: RetrieveRoleList.getInstance()
    }),
    actions: {
        load() {
            this.loading = true;
            this.roleApi.request({
                dataBody: { searchKeyword: this.keyword || undefined, pageNo: this.pageNo, pageSize: this.pageSize },
                listener: {
                    onSuccess: (p) => { this.rows = p.roleList ?? []; this.totalCount = p.totalCount ?? 0; this.loading = false; },
                    onFail: () => { this.loading = false; }
                }
            });
        },
        onSearch() {
            this.pageNo = 1;
            this.load();
        },
        setPage(pageNo: number, pageSize: number) {
            this.pageNo = pageNo;
            this.pageSize = pageSize;
            this.load();
        }
    }
});
