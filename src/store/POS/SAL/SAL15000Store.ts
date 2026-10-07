import { defineStore } from "pinia";
import RetrieveQuotationDetail from "@/services/api/SAL/retrieveQuotationDetail";
import type { QuotationDetail, QuotationDetailItem } from "@/models/POS/SAL/SAL15000";

/** SAL15000 quotation-detail store: detail load by quotationNo. */
export const SAL15000Store = defineStore("SAL15000Store", {
    state: () => ({
        loading: true,
        detail: null as QuotationDetail | null,
        quotationDetailApi: RetrieveQuotationDetail.getInstance()
    }),
    getters: {
        items(state): QuotationDetailItem[] {
            return state.detail?.itemList ?? [];
        },
        // Backend may name these subTotal/subtotal and discountAmount/discountTotal.
        subTotal(state): number {
            return Number(state.detail?.subTotalAmount ?? state.detail?.subTotal ?? state.detail?.subtotal ?? 0);
        },
        discountTotal(state): number {
            return Number(state.detail?.discountAmount ?? state.detail?.discountTotal ?? 0);
        }
    },
    actions: {
        load(code: string) {
            if (!code) { this.loading = false; return; }
            this.loading = true;
            this.quotationDetailApi.request({
                dataBody: { quotationNo: code },
                listener: {
                    onSuccess: (p) => { this.detail = p; this.loading = false; },
                    onFail: () => { this.detail = null; this.loading = false; }
                }
            });
        }
    }
});
