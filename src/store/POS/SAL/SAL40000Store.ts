import { defineStore } from "pinia";
import RetrieveDeliveryList from "@/services/api/SAL/retrieveDeliveryList";
import type { DeliveryRow, SAL40000Response } from "@/models/POS/SAL/SAL40000";

/** SAL40000 delivery-list store: filter state + list api call. */
export const SAL40000Store = defineStore("SAL40000Store", {
    state: () => ({
        keyword: "",
        status: undefined as string | undefined,
        statuses: ["PENDING", "PICKED_UP", "DELIVERED", "CANCELLED"],
        rows: [] as DeliveryRow[],
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        listApi: RetrieveDeliveryList.getInstance()
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
                    onSuccess: (p: SAL40000Response) => {
                        this.rows = p.deliveryList ?? [];
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
        }
    }
});
