import { defineStore } from "pinia";
import RetrieveProductList from "@/services/api/PRD/retrieveProductList";
import RestoreProduct from "@/services/api/PRD/restoreProduct";
import POP from "@/core/utilities/pop";
import type { ProductListItem, PRD10000Response } from "@/models/PRD/PRD10000";

/** TRB10000 Trash Bin: deactivated (soft-deleted) products, with restore. */
export const TRB10000Store = defineStore("TRB10000Store", {
    state: () => ({
        keyword: "",
        rows: [] as ProductListItem[],
        loading: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        productApi: RetrieveProductList.getInstance(),
        restoreApi: RestoreProduct.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.productApi.request({
                dataBody: {
                    searchKeyword: this.keyword || undefined,
                    isActive: false, // trash = inactive only
                    pageNo: this.pageNo,
                    pageSize: this.pageSize
                },
                enableLoading: false,
                listener: {
                    onSuccess: (p: PRD10000Response) => {
                        this.rows = p.productList ?? [];
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
        restore(productId: string, failTitle: string) {
            if (!productId) return;
            this.restoreApi.request({
                dataBody: { productId },
                listener: {
                    onSuccess: () => this.reload(),
                    onFail: (e) => POP.alert({ title: failTitle, status: "error", content: e?.message, errorCode: e?.code })
                }
            });
        }
    }
});
