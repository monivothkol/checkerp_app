import { defineStore } from "pinia";
import RetrievePackagingList from "@/services/api/SAL/retrievePackagingList";
import CancelPackaging from "@/services/api/SAL/cancelPackaging";
import POP from "@/core/utilities/pop";
import type { PackagingRow, SAL30000Response } from "@/models/POS/SAL/SAL30000";

/** SAL30000 packaging-list store: filter state + list/cancel api calls. */
export const SAL30000Store = defineStore("SAL30000Store", {
    state: () => ({
        keyword: "",
        status: undefined as string | undefined,
        statuses: ["PENDING", "IN_PROGRESS", "DONE", "CANCELLED"],
        rows: [] as PackagingRow[],
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        listApi: RetrievePackagingList.getInstance(),
        cancelApi: CancelPackaging.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.listApi.request({
                dataBody: {
                    status: this.status || undefined,
                    searchKeyword: this.keyword || undefined,
                    pageNo: this.pageNo,
                    pageSize: this.pageSize
                },
                listener: {
                    onSuccess: (p: SAL30000Response) => {
                        this.rows = p.packagingList ?? [];
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
        onFilter() {
            this.pageNo = 1;
            this.reload();
        },
        setPage(pageNo: number, pageSize: number) {
            this.pageNo = pageNo;
            this.pageSize = pageSize;
            this.reload();
        },
        /** Cancel one packaging then reload; `failTitle` is the already-translated alert title. */
        cancel(packagingId: string, failTitle: string) {
            if (!packagingId) return;
            this.cancelApi.request({
                dataBody: { packagingId },
                listener: {
                    onSuccess: () => { this.reload(); },
                    onFail: (err) => { POP.alert({ title: failTitle, status: "error", content: err?.message, errorCode: err?.code }); }
                }
            });
        }
    }
});
