import { defineStore } from "pinia";
import RetrievePurchaseInList from "@/services/api/PUR/retrievePurchaseInList";
import ReceivePurchaseIn from "@/services/api/PUR/receivePurchaseIn";
import POP from "@/core/utilities/pop";
import type { PurchaseInRow, PUR20000ListTotals } from "@/models/POS/PUR/PUR20000";

/** PUR20000 purchase-in (goods-receipt) list store: filter state + list api call. */
export const PUR20000Store = defineStore("PUR20000Store", {
    state: () => ({
        keyword: "",
        status: undefined as string | undefined,
        statuses: ["PENDING", "RECEIVED", "REJECTED", "CANCELLED"],
        rows: [] as PurchaseInRow[],
        totals: null as PUR20000ListTotals | null,
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        purchaseInApi: RetrievePurchaseInList.getInstance(),
        receiveApi: ReceivePurchaseIn.getInstance()
    }),
    actions: {
        /** Receive a PENDING purchase-in (stock + WAC + GL). */
        receive(adjustmentId: string, titles: { done: string; failed: string }) {
            this.receiveApi.request({
                dataBody: { adjustmentId },
                headers: { "Idempotency-Key": crypto.randomUUID() },
                listener: {
                    onSuccess: () => {
                        POP.alert({ title: titles.done, status: "success" });
                        this.reload();
                    },
                    onFail: (err: { message?: string; code?: string }) => {
                        POP.alert({ title: titles.failed, status: "error", content: err?.message, errorCode: err?.code });
                    }
                }
            });
        },
        reload() {
            this.loading = true;
            this.purchaseInApi.request({
                dataBody: { pageNo: this.pageNo, pageSize: this.pageSize, status: this.status, searchKeyword: this.keyword },
                listener: {
                    onSuccess: (p) => { this.rows = p.purchaseInList ?? [];
                        this.totals = p.totals ?? null; this.total = p.totalCount ?? 0; this.loading = false; },
                    onFail: () => { this.rows = []; this.totals = null; this.total = 0; this.loading = false; }
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
        }
    }
});
