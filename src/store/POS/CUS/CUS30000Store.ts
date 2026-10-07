import { defineStore } from "pinia";
import RetrieveLoyaltyConditionList from "@/services/api/CUS/retrieveLoyaltyConditionList";
import DeleteLoyaltyCondition from "@/services/api/CUS/deleteLoyaltyCondition";
import POP from "@/core/utilities/pop";
import type { LoyaltyConditionRow, CUS30000Response } from "@/models/POS/CUS/CUS30000";

/** CUS30000 loyalty-condition list screen store: filter state + list api call. */
export const CUS30000Store = defineStore("CUS30000Store", {
    state: () => ({
        keyword: "",
        rows: [] as LoyaltyConditionRow[],
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        listApi: RetrieveLoyaltyConditionList.getInstance(),
        deleteApi: DeleteLoyaltyCondition.getInstance()
    }),
    actions: {
        /** Hard delete (v1 parity for point conditions); `failTitle` is pre-translated. */
        remove(conditionId: string, failTitle: string) {
            this.deleteApi.request({
                dataBody: { conditionId },
                listener: {
                    onSuccess: () => { this.reload(); },
                    onFail: (err: { message?: string; code?: string }) => {
                        POP.alert({ title: failTitle, status: "error", content: err?.message, errorCode: err?.code });
                    }
                }
            });
        },
        reload() {
            this.loading = true;
            this.listApi.request({
                dataBody: { searchKeyword: this.keyword, pageNo: this.pageNo, pageSize: this.pageSize },
                listener: {
                    onSuccess: (p: CUS30000Response) => {
                        this.rows = p.conditionList ?? [];
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
