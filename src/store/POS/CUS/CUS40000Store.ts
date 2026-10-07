import { defineStore } from "pinia";
import RetrieveCustomerGroupList from "@/services/api/CUS/retrieveCustomerGroupList";
import RetrievePriceGroupList from "@/services/api/PMM/retrievePriceGroupList";
import type { PriceGroupRow, CustomerGroupLookup } from "@/models/POS/CUS/CUS40000";

/** CUS40000 price-group list store: group lookup + filtered price list api calls. */
export const CUS40000Store = defineStore("CUS40000Store", {
    state: () => ({
        groups: [] as CustomerGroupLookup[],
        groupId: undefined as string | undefined,
        keyword: "",
        exporting: false,
        rows: [] as PriceGroupRow[],
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        groupApi: RetrieveCustomerGroupList.getInstance(),
        priceApi: RetrievePriceGroupList.getInstance()
    }),
    actions: {
        loadGroups() {
            this.groupApi.request({
                dataBody: { pageNo: 1, pageSize: 100 },
                enableLoading: false,
                listener: {
                    onSuccess: (p: { groupList?: CustomerGroupLookup[] }) => { this.groups = p.groupList ?? []; }
                }
            });
        },
        /** Filter changed: results start over from page 1. */
        onFilter() {
            this.pageNo = 1;
            this.reload();
        },

        reload() {
            this.loading = true;
            this.priceApi.request({
                dataBody: {
                    groupId: this.groupId || undefined,
                    searchKeyword: this.keyword || undefined,
                    pageNo: this.pageNo,
                    pageSize: this.pageSize
                },
                listener: {
                    onSuccess: (p) => {
                        this.rows = p.priceList ?? [];
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
        },
        /** Reset to the first page and reload (used after an import completes). */
        reloadFromStart() {
            this.pageNo = 1;
            this.reload();
        }
    }
});
