import { defineStore } from "pinia";
import RetrievePurchaseReturnList from "@/services/api/PUR/retrievePurchaseReturnList";
import CreatePurchaseReturn from "@/services/api/PUR/createPurchaseReturn";
import type { PurchaseReturnCreateRequest } from "@/services/api/PUR/createPurchaseReturn";
import RetrievePurchaseReturnDetail from "@/services/api/PUR/retrievePurchaseReturnDetail";
import ApprovePurchaseReturn from "@/services/api/PUR/approvePurchaseReturn";
import RejectPurchaseReturn from "@/services/api/PUR/rejectPurchaseReturn";
import RetrieveSupplierList from "@/services/api/SUP/retrieveSupplierList";
import RetrieveInventoryList from "@/services/api/INV/retrieveInventoryList";
import RetrieveProductList from "@/services/api/PRD/retrieveProductList";
import type { PurchaseReturnCreateResponse, PurchaseReturnDetail, PurchaseReturnRow } from "@/models/POS/PUR/PUR30000";
import type { InventoryLookup, SupplierLookup } from "@/models/POS/COMMON/lookups";
import type { ProductListItem } from "@/models/PRD/PRD10000";

interface ApiError { message?: string; code?: string }
type Done<T = void> = (ok: boolean, result?: T, err?: ApiError) => void;

/** PUR30000 purchase-return store: paged list, create refs, create, detail, decide. */
export const PUR30000Store = defineStore("PUR30000Store", {
    state: () => ({
        keyword: "",
        status: undefined as string | undefined,
        statuses: ["PENDING", "APPROVED", "REJECTED"],
        rows: [] as PurchaseReturnRow[],
        grandTotal: 0,
        loading: false,
        acting: false,
        total: 0,
        pageNo: 1,
        pageSize: 10,
        searchTimer: 0 as ReturnType<typeof setTimeout> | 0,
        // create-modal reference data
        suppliers: [] as SupplierLookup[],
        inventories: [] as InventoryLookup[],
        products: [] as ProductListItem[],
        loadingRefs: false,
        searchingProducts: false,
        listApi: RetrievePurchaseReturnList.getInstance(),
        createApi: CreatePurchaseReturn.getInstance(),
        detailApi: RetrievePurchaseReturnDetail.getInstance(),
        approveApi: ApprovePurchaseReturn.getInstance(),
        rejectApi: RejectPurchaseReturn.getInstance(),
        supplierApi: RetrieveSupplierList.getInstance(),
        inventoryApi: RetrieveInventoryList.getInstance(),
        productApi: RetrieveProductList.getInstance()
    }),
    actions: {
        reload() {
            this.loading = true;
            this.listApi.request({
                dataBody: {
                    searchKeyword: this.keyword, status: this.status,
                    pageNo: this.pageNo, pageSize: this.pageSize
                },
                listener: {
                    onSuccess: (p) => {
                        this.rows = p.purchaseReturnList ?? [];
                        this.total = p.totalCount ?? 0;
                        this.grandTotal = Number(p.totals?.grandTotal ?? 0);
                        this.loading = false;
                    },
                    onFail: () => { this.rows = []; this.total = 0; this.loading = false; }
                }
            });
        },
        onSearch() {
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this.onFilter(), 300);
        },
        /** Filter changed: results start over from page 1. */
        onFilter() {
            this.pageNo = 1;
            this.reload();
        },
        setPage(pageNo: number, pageSize: number) {
            this.pageNo = pageNo;
            this.pageSize = pageSize;
            this.reload();
        },

        /** Reference data for the create modal (suppliers + inventories). */
        loadCreateRefs() {
            this.loadingRefs = true;
            this.supplierApi.request({
                dataBody: { pageNo: 1, pageSize: 200 },
                listener: {
                    onSuccess: (p) => { this.suppliers = p.supplierList; this.loadingRefs = false; },
                    onFail: () => { this.loadingRefs = false; }
                }
            });
            this.inventoryApi.request({
                dataBody: { pageNo: 1, pageSize: 100, isActive: true },
                listener: {
                    onSuccess: (p) => { this.inventories = p.inventoryList; },
                    onFail: () => undefined
                }
            });
        },
        searchProducts(searchKeyword: string) {
            this.searchingProducts = true;
            this.productApi.request({
                dataBody: { pageNo: 1, pageSize: 20, searchKeyword },
                listener: {
                    onSuccess: (p) => { this.products = p.productList ?? []; this.searchingProducts = false; },
                    onFail: () => { this.searchingProducts = false; }
                }
            });
        },

        create(body: PurchaseReturnCreateRequest, done: Done<PurchaseReturnCreateResponse>) {
            this.acting = true;
            this.createApi.request({
                dataBody: body,
                listener: {
                    onSuccess: (res) => { this.acting = false; done(true, res); },
                    onFail: (e) => { this.acting = false; done(false, undefined, e); }
                }
            });
        },

        loadDetail(adjustmentId: string, onLoaded: (d: PurchaseReturnDetail | null) => void) {
            this.detailApi.request({
                dataBody: { adjustmentId },
                listener: {
                    onSuccess: (d) => onLoaded(d),
                    onFail: () => onLoaded(null)
                }
            });
        },

        /** PENDING -> APPROVED (stock leaves + GL posts) or REJECTED; list refreshes after. */
        decide(adjustmentId: string, approve: boolean, done: Done) {
            this.acting = true;
            (approve ? this.approveApi : this.rejectApi).request({
                dataBody: { adjustmentId },
                listener: {
                    onSuccess: () => { this.acting = false; this.reload(); done(true); },
                    onFail: (e) => { this.acting = false; done(false, undefined, e); }
                }
            });
        }
    }
});
