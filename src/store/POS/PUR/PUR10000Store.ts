import { defineStore } from "pinia";
import RetrieveSupplierList from "@/services/api/SUP/retrieveSupplierList";
import RetrievePurchaseOrderList from "@/services/api/PUR/retrievePurchaseOrderList";
import type { SupplierLookup } from "@/models/POS/COMMON/lookups";
import type { PurchaseOrderRow, PUR10000ListTotals } from "@/models/POS/PUR/PUR10000";

/** PUR10000 purchase-order list store: filter state + supplier/PO list api calls. */
export const PUR10000Store = defineStore("PUR10000Store", {
    state: () => ({
        keyword: "",
        status: undefined as string | undefined,
        statuses: ["DRAFT", "SENT", "CONFIRMED", "PARTIAL", "COMPLETED", "CANCELLED"],
        supplierId: undefined as string | undefined,
        suppliers: [] as SupplierLookup[],
        loadingSuppliers: false,
        rows: [] as PurchaseOrderRow[],
        totals: null as PUR10000ListTotals | null,
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        supplierApi: RetrieveSupplierList.getInstance(),
        poApi: RetrievePurchaseOrderList.getInstance()
    }),
    actions: {
        loadSuppliers() {
            this.loadingSuppliers = true;
            this.supplierApi.request({
                dataBody: { pageNo: 1, pageSize: 200 },
                listener: {
                    onSuccess: (p) => { this.suppliers = p.supplierList ?? []; this.loadingSuppliers = false; },
                    onFail: () => { this.loadingSuppliers = false; }
                }
            });
        },
        reload() {
            this.loading = true;
            this.poApi.request({
                dataBody: { pageNo: this.pageNo, pageSize: this.pageSize, status: this.status, supplierId: this.supplierId, searchKeyword: this.keyword },
                listener: {
                    onSuccess: (p) => { this.rows = p.poList ?? [];
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
