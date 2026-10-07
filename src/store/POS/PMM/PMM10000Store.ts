import { defineStore } from "pinia";
import RetrievePromotionList from "@/services/api/PMM/retrievePromotionList";
import type { PromotionRow, PMM10000Response } from "@/models/POS/PMM/PMM10000";

/** PMM10000 promotion-list screen store: filter state + list api call. */
export const PMM10000Store = defineStore("PMM10000Store", {
    state: () => ({
        keyword: "",
        promotionType: undefined as string | undefined,
        rows: [] as PromotionRow[],
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        promotionApi: RetrievePromotionList.getInstance()
    }),
    actions: {
        /** Filter changed: results start over from page 1. */
        onFilter() {
            this.pageNo = 1;
            this.reload();
        },

        reload() {
            this.loading = true;
            this.promotionApi.request({
                dataBody: { searchKeyword: this.keyword, promotionType: this.promotionType, pageNo: this.pageNo, pageSize: this.pageSize },
                listener: {
                    onSuccess: (p: PMM10000Response) => {
                        this.rows = p.promotionList ?? [];
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
