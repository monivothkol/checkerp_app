import { defineStore } from "pinia";
import RetrieveAssetList from "@/services/api/AST/retrieveAssetList";
import RetrieveComputedAssets from "@/services/api/AST/retrieveComputedAssets";
import type { AssetClass, AssetRow, AssetStatus, AssetTotals, AssetType, AST10000Response, ComputedAssetsResponse } from "@/models/POS/AST/AST10000";

/** AST10000 asset register store: filters/paging, recorded totals and the computed (cash/AR/stock) cards. */
export const AST10000Store = defineStore("AST10000Store", {
    state: () => ({
        keyword: "",
        assetClass: undefined as AssetClass | undefined,
        assetType: undefined as AssetType | undefined,
        status: "ACTIVE" as AssetStatus | undefined,
        rows: [] as AssetRow[],
        totals: undefined as AssetTotals | undefined,
        computed: undefined as ComputedAssetsResponse | undefined,
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        api: RetrieveAssetList.getInstance(),
        computedApi: RetrieveComputedAssets.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.api.request({
                dataBody: {
                    searchKeyword: this.keyword || undefined,
                    assetClass: this.assetClass || undefined,
                    assetType: this.assetType || undefined,
                    status: this.status || undefined,
                    pageNo: this.pageNo, pageSize: this.pageSize
                },
                listener: {
                    onSuccess: (p: AST10000Response) => {
                        this.rows = p.assetList ?? [];
                        this.total = p.totalCount ?? 0;
                        this.totals = p.totals;
                        this.loading = false;
                    },
                    onFail: () => { this.rows = []; this.total = 0; this.totals = undefined; this.loading = false; }
                }
            });
        },
        loadComputed() {
            this.computedApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p: ComputedAssetsResponse) => { this.computed = p; },
                    onFail: () => { this.computed = undefined; }
                }
            });
        },
        onFilter() { this.pageNo = 1; this.reload(); },
        onSearch() {
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this.onFilter(), 300);
        },
        setPage(pageNo: number, pageSize: number) {
            this.pageNo = pageNo;
            this.pageSize = pageSize;
            this.reload();
        }
    }
});
