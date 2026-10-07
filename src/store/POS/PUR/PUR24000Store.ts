import { defineStore } from "pinia";
import RetrievePurchaseInDetail from "@/services/api/PUR/retrievePurchaseInDetail";
import ReceivePurchaseIn from "@/services/api/PUR/receivePurchaseIn";
import RetrievePosContext from "@/services/api/POS/retrievePosContext";
import type { PurchaseInDetail, PurchaseInDetailItem } from "@/models/POS/PUR/PUR24000";
import type { PaymentMethodLookup } from "@/models/POS/COMMON/lookups";

/** PUR24000 purchase-in detail store: tolerant header/item read + receive + pay lookups. */
export const PUR24000Store = defineStore("PUR24000Store", {
    state: () => ({
        loading: true,
        acting: false,
        header: null as PurchaseInDetail | null,
        items: [] as PurchaseInDetailItem[],
        paymentMethods: [] as PaymentMethodLookup[],
        detailApi: RetrievePurchaseInDetail.getInstance(),
        receiveApi: ReceivePurchaseIn.getInstance(),
        posContextApi: RetrievePosContext.getInstance()
    }),
    getters: {
        /** Amount still owed to the supplier on a received purchase-in. */
        outstanding(state): number {
            const h = state.header;
            if (!h) return 0;
            return Math.max(0, Number(h.grandTotal ?? 0) - Number(h.paidAmount ?? 0));
        }
    },
    actions: {
        load(adjustmentId: string) {
            if (!adjustmentId) { this.loading = false; return; }
            this.loading = true;
            this.detailApi.request({
                dataBody: { adjustmentId },
                listener: {
                    onSuccess: (p) => {
                        // Tolerant read: header may be nested under `purchaseIn`/`adjustment`, items under `items`/`itemList`.
                        const h = p?.purchaseIn ?? p?.adjustment ?? p;
                        this.header = h && Object.keys(h).length ? h : null;
                        this.items = p?.items ?? p?.itemList ?? h?.items ?? h?.itemList ?? [];
                        this.loading = false;
                    },
                    onFail: () => { this.header = null; this.items = []; this.loading = false; }
                }
            });
        },
        loadPaymentMethods() {
            this.posContextApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p: { paymentMethods?: PaymentMethodLookup[] }) => { this.paymentMethods = p.paymentMethods ?? []; }
                }
            });
        },
        /** Receive a PENDING purchase-in (stock + WAC + GL), then reload. */
        receive(adjustmentId: string, onDone: (ok: boolean, err?: unknown) => void) {
            this.acting = true;
            this.receiveApi.request({
                dataBody: { adjustmentId },
                headers: { "Idempotency-Key": crypto.randomUUID() },
                listener: {
                    onSuccess: () => { this.acting = false; this.load(adjustmentId); onDone(true); },
                    onFail: (err) => { this.acting = false; onDone(false, err); }
                }
            });
        }
    }
});
