import { defineStore } from "pinia";
import RetrieveProductList from "@/services/api/PRD/retrieveProductList";
import type { ProductListItem, PRD10000Response } from "@/models/PRD/PRD10000";

/** PRD10000 product-list screen store: search/filter/paging state + product-list api call. */
export const PRD10000Store = defineStore("PRD10000Store", {
    state: () => ({
        keyword: "",
        categoryId: "ALL",
        brandId: "ALL",
        loading: false,
        productList: [] as ProductListItem[],
        pageNo: 1,
        pageSize: 10,
        totalCount: 0,
        productApi: RetrieveProductList.getInstance()
    }),
    actions: {
        loadProductList() {
            this.loading = true;
            this.productApi.request({
                dataBody: {
                    searchKeyword: this.keyword || undefined,
                    categoryId: this.categoryId === "ALL" ? undefined : this.categoryId,
                    brandId: this.brandId === "ALL" ? undefined : this.brandId,
                    isActive: true,
                    pageNo: this.pageNo,
                    pageSize: this.pageSize
                },
                enableLoading: false,
                listener: {
                    onSuccess: (p: PRD10000Response) => {
                        this.productList = p.productList;
                        this.totalCount = p.totalCount;
                        this.loading = false;
                    },
                    onFail: () => { this.loading = false; }
                }
            });
        },
        onSearch() {
            this.pageNo = 1;
            this.loadProductList();
        },
        setPage(pageNo: number, pageSize: number) {
            this.pageNo = pageNo;
            this.pageSize = pageSize;
            this.loadProductList();
        }
    }
});
