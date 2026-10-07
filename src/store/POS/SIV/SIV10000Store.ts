import { defineStore } from "pinia";
import RetrieveSaleList from "@/services/api/SIV/retrieveSaleList";
import RetrieveInventoryList from "@/services/api/INV/retrieveInventoryList";
import RetrieveSalePersonList from "@/services/api/SIV/retrieveSalePersonList";
import RetrieveUserList from "@/services/api/ADM/retrieveUserList";
import type { SaleRow, SIV10000Request, SIV10000Response, SaleListTotals } from "@/models/POS/SIV/SIV10000";
import type { InventoryLookup, SalePersonLookup } from "@/models/POS/COMMON/lookups";
import type { UserRow } from "@/models/POS/ADM/ADM10000";

/** Values managed by the filter panel (date range + inventory live outside the panel). */
export interface SIV10000FilterValues {
    paymentStatus?: string;
    salePersonId?: string;
    sellType?: string;
    customerType?: string;
    createdBy?: string;
    hasDiscount?: boolean;
}

/** SIV10000 invoice-list screen store: filter/paging state + sale-list api call.
 *  Filter lookups load on mount; the Created By list needs USER:READ, so a
 *  permission failure just hides that filter. */
export const SIV10000Store = defineStore("SIV10000Store", {
    state: () => ({
        keyword: "",
        paymentStatus: undefined as string | undefined,
        dateFrom: undefined as string | undefined,
        dateTo: undefined as string | undefined,
        inventoryId: undefined as string | undefined,
        salePersonId: undefined as string | undefined,
        sellType: undefined as string | undefined,
        customerType: undefined as string | undefined,
        createdBy: undefined as string | undefined,
        hasDiscount: false,
        lookupsLoaded: false,
        inventories: [] as InventoryLookup[],
        salePersons: [] as SalePersonLookup[],
        users: [] as UserRow[],
        rows: [] as SaleRow[],
        totals: null as SaleListTotals | null,
        costVisible: false,
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        saleApi: RetrieveSaleList.getInstance(),
        inventoryApi: RetrieveInventoryList.getInstance(),
        salePersonApi: RetrieveSalePersonList.getInstance(),
        userApi: RetrieveUserList.getInstance()
    }),
    actions: {
        filterBody(): SIV10000Request {
            return {
                searchKeyword: this.keyword,
                paymentStatus: this.paymentStatus,
                dateFrom: this.dateFrom,
                dateTo: this.dateTo,
                inventoryId: this.inventoryId,
                salePersonId: this.salePersonId,
                sellType: this.sellType,
                customerType: this.customerType,
                createdBy: this.createdBy,
                hasDiscount: this.hasDiscount || undefined,
                pageNo: this.pageNo,
                pageSize: this.pageSize
            };
        },
        reload() {
            this.loading = true;
            this.saleApi.request({
                dataBody: this.filterBody(),
                listener: {
                    onSuccess: (p: SIV10000Response) => {
                        this.rows = p.saleList ?? [];
                        this.totals = p.totals ?? null;
                        this.total = p.totalCount ?? 0;
                        this.costVisible = p.costVisible === true;
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
        /** Any non-text filter changed: back to page 1 and refetch. */
        onFilterChange() {
            this.pageNo = 1;
            this.reload();
        },
        /** Current values in the filter-panel shape. */
        filterValues(): SIV10000FilterValues {
            return {
                paymentStatus: this.paymentStatus,
                salePersonId: this.salePersonId,
                sellType: this.sellType,
                customerType: this.customerType,
                createdBy: this.createdBy,
                hasDiscount: this.hasDiscount || undefined
            };
        },
        /** Replace all panel-managed filters at once ({} clears them) and reload.
         *  dateFrom/dateTo/inventoryId are untouched — the controls next to the search box own them. */
        applyFilters(v: SIV10000FilterValues) {
            this.paymentStatus = v.paymentStatus;
            this.salePersonId = v.salePersonId;
            this.sellType = v.sellType;
            this.customerType = v.customerType;
            this.createdBy = v.createdBy;
            this.hasDiscount = v.hasDiscount === true;
            this.onFilterChange();
        },
        loadLookups() {
            if (this.lookupsLoaded) return;
            this.lookupsLoaded = true;
            this.inventoryApi.request({
                dataBody: { pageNo: 1, pageSize: 100, isActive: true },
                listener: {
                    onSuccess: (p: { inventoryList?: InventoryLookup[] }) => { this.inventories = p.inventoryList ?? []; },
                    onFail: () => { this.inventories = []; }
                }
            });
            this.salePersonApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p: { salePersons?: SalePersonLookup[] }) => { this.salePersons = p.salePersons ?? []; },
                    onFail: () => { this.salePersons = []; }
                }
            });
            this.userApi.request({
                dataBody: { pageNo: 1, pageSize: 200 },
                listener: {
                    onSuccess: (p: { userList?: UserRow[] }) => { this.users = p.userList ?? []; },
                    onFail: () => { this.users = []; } // no USER:READ → hide the select
                }
            });
        },
        setPage(pageNo: number, pageSize: number) {
            this.pageNo = pageNo;
            this.pageSize = pageSize;
            this.reload();
        }
    }
});
