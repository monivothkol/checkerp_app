import { defineStore } from "pinia";
import RetrieveStaffFinancialList from "@/services/api/SFM/retrieveStaffFinancialList";
import type { StaffFinancialRow, SFM10000Response } from "@/models/POS/SFM/SFM10000";

/** SFM10000 staff-financial-accounts list store: filter/paging + list api. */
export const SFM10000Store = defineStore("SFM10000Store", {
    state: () => ({
        keyword: "",
        rows: [] as StaffFinancialRow[],
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        api: RetrieveStaffFinancialList.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.api.request({
                dataBody: { searchKeyword: this.keyword || undefined, pageNo: this.pageNo, pageSize: this.pageSize },
                listener: {
                    onSuccess: (p: SFM10000Response) => {
                        this.rows = p.accountList ?? [];
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
