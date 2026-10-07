import { defineStore } from "pinia";
import RetrieveProductDetail, { type ProductDetail } from "@/services/api/PRD/retrieveProductDetail";
import RetrieveProductHistory, { type ProductHistoryRow, type ProductHistoryType } from "@/services/api/PRD/retrieveProductHistory";

interface HistoryTab {
    rows: ProductHistoryRow[];
    total: number;
    page: number;
    loading: boolean;
    loaded: boolean;
}

const emptyTab = (): HistoryTab => ({ rows: [], total: 0, page: 1, loading: false, loaded: false });

/** PRD50000 product-detail screen store: detail load + lazy per-tab history. */
export const PRD50000Store = defineStore("PRD50000Store", {
    state: () => ({
        loading: true,
        product: null as ProductDetail | null,
        productDetailApi: RetrieveProductDetail.getInstance(),
        historyApi: RetrieveProductHistory.getInstance(),
        pageSize: 10,
        history: {
            sale: emptyTab(),
            quotation: emptyTab(),
            purchase: emptyTab(),
            transfer: emptyTab(),
            adjustment: emptyTab(),
            movement: emptyTab()
        } as Record<ProductHistoryType, HistoryTab>
    }),
    actions: {
        load(code: string) {
            if (!code) { this.loading = false; return; }
            this.loading = true;
            // reset history so navigating between products doesn't show stale tabs
            (Object.keys(this.history) as ProductHistoryType[]).forEach((k) => { this.history[k] = emptyTab(); });
            this.productDetailApi.request({
                dataBody: { productCode: code },
                listener: {
                    onSuccess: (p: ProductDetail) => { this.product = p; this.loading = false; },
                    onFail: () => { this.product = null; this.loading = false; }
                }
            });
        },
        /** Lazy-load a history tab; first call loads page 1, later calls page through. */
        loadHistory(type: ProductHistoryType, page = 1) {
            const productId = this.product?.productId;
            if (!productId) return;
            const tab = this.history[type];
            tab.loading = true;
            tab.page = page;
            this.historyApi.request({
                dataBody: { productId, type, pageNo: page, pageSize: this.pageSize },
                listener: {
                    onSuccess: (r) => { tab.rows = r.list ?? []; tab.total = r.totalCount ?? 0; tab.loading = false; tab.loaded = true; },
                    onFail: () => { tab.rows = []; tab.total = 0; tab.loading = false; tab.loaded = true; }
                }
            });
        },
        /** Called on tab activation — load once, then only on pagination. */
        ensureHistory(type: ProductHistoryType) {
            if (!this.history[type].loaded && !this.history[type].loading) this.loadHistory(type, 1);
        }
    }
});
