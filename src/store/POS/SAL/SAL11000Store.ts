import { defineStore } from "pinia";
import RetrieveQuotationList from "@/services/api/SAL/retrieveQuotationList";
import type { QuotationRow, SAL11000Response, SAL11000ListTotals } from "@/models/POS/SAL/SAL11000";

/** SAL11000 quotation-list store: filter state + list api call. */
export const SAL11000Store = defineStore("SAL11000Store", {
    state: () => ({
        keyword: "",
        statusCode: undefined as string | undefined,
        statuses: ["ACTIVE", "CANCELLED", "SOLD"],
        dateRange: null as [string, string] | null,
        rows: [] as QuotationRow[],
        totals: null as SAL11000ListTotals | null,
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        quotationApi: RetrieveQuotationList.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.quotationApi.request({
                dataBody: {
                    pageNo: this.pageNo,
                    pageSize: this.pageSize,
                    searchKeyword: this.keyword || undefined,
                    quotationStatusCode: this.statusCode || undefined,
                    fromDate: this.dateRange?.[0] || undefined,
                    toDate: this.dateRange?.[1] || undefined
                },
                listener: {
                    onSuccess: (p: SAL11000Response) => {
                        this.rows = p.quotationList ?? [];
                        this.totals = p.totals ?? null;
                        this.total = p.totalCount ?? 0;
                        this.loading = false;
                    },
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
