import { defineStore } from "pinia";
import RetrieveSaleReturnList from "@/services/api/SAL/retrieveSaleReturnList";
import ApproveSaleReturn from "@/services/api/SAL/approveSaleReturn";
import RejectSaleReturn from "@/services/api/SAL/rejectSaleReturn";
import ProductFilterRefs from "@/core/modules/product-filter-refs";
import POP from "@/core/utilities/pop";
import type { ReturnRow, SAL20000Response, SAL20000ListTotals, ReturnCreator } from "@/models/POS/SAL/SAL20000";
import type { InventoryLookup } from "@/models/POS/COMMON/lookups";

/** Values managed by the filter panel (date range + inventory live outside it). */
export interface SAL20000FilterValues {
    status?: string;
    createdBy?: string;
}

/** SAL20000 sale-return list store: filter state + list api call. */
export const SAL20000Store = defineStore("SAL20000Store", {
    state: () => ({
        keyword: "",
        status: undefined as string | undefined,
        statuses: ["PENDING", "APPROVED", "REJECTED"],
        createdBy: undefined as string | undefined,
        dateRange: null as [string, string] | null,
        inventoryId: undefined as string | undefined,
        lookupsLoaded: false,
        inventories: [] as InventoryLookup[],
        users: [] as ReturnCreator[],
        rows: [] as ReturnRow[],
        totals: null as SAL20000ListTotals | null,
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        returnApi: RetrieveSaleReturnList.getInstance(),
        approveApi: ApproveSaleReturn.getInstance(),
        rejectApi: RejectSaleReturn.getInstance()
    }),
    actions: {
        /** Approve a PENDING return; alerts name the credit note when one was issued.
         *  `titles.creditNote` is a template with a {code} placeholder. */
        approve(returnId: string, titles: { done: string; failed: string; creditNote: string }) {
            this.approveApi.request({
                dataBody: { returnId },
                listener: {
                    onSuccess: (p: { creditNoteCode?: string }) => {
                        POP.alert({ title: titles.done, status: "success",
                            content: p.creditNoteCode ? titles.creditNote.replace("{code}", p.creditNoteCode) : undefined });
                        this.reload();
                    },
                    onFail: (err: { message?: string; code?: string }) => {
                        POP.alert({ title: titles.failed, status: "error",
                            content: err?.message, errorCode: err?.code });
                    }
                }
            });
        },
        reject(returnId: string, failTitle: string) {
            this.rejectApi.request({
                dataBody: { returnId },
                listener: {
                    onSuccess: () => { this.reload(); },
                    onFail: (err: { message?: string; code?: string }) => {
                        POP.alert({ title: failTitle, status: "error",
                            content: err?.message, errorCode: err?.code });
                    }
                }
            });
        },
        /** Filter changed: results start over from page 1. */
        onFilter() {
            this.pageNo = 1;
            this.reload();
        },

        /** Inventory lookup for the filter panel — cache-first from IndexedDB
         *  (WebSocket-evicted, 24h TTL), so no network call after the first load.
         *  Created By options arrive with the list response (store.users). */
        loadLookups() {
            if (this.lookupsLoaded) return;
            this.lookupsLoaded = true;
            ProductFilterRefs.inventories().then((list) => { this.inventories = list; });
        },
        /** Current panel-managed filter values. */
        filterValues(): SAL20000FilterValues {
            return { status: this.status, createdBy: this.createdBy };
        },
        /** Replace all panel filters at once ({} clears them); date/inventory stay put. */
        applyFilters(v: SAL20000FilterValues) {
            this.status = v.status;
            this.createdBy = v.createdBy;
            this.onFilter();
        },

        reload() {
            this.loading = true;
            this.returnApi.request({
                dataBody: {
                    searchKeyword: this.keyword, status: this.status,
                    inventoryId: this.inventoryId || undefined,
                    createdBy: this.createdBy || undefined,
                    dateFrom: this.dateRange?.[0] || undefined,
                    dateTo: this.dateRange?.[1] || undefined,
                    pageNo: this.pageNo, pageSize: this.pageSize
                },
                listener: {
                    onSuccess: (p: SAL20000Response) => {
                        this.rows = p.returnList ?? [];
                        this.totals = p.totals ?? null;
                        this.total = p.totalCount ?? 0;
                        this.users = p.creators ?? [];
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
        setPage(pageNo: number, pageSize: number) {
            this.pageNo = pageNo;
            this.pageSize = pageSize;
            this.reload();
        }
    }
});
