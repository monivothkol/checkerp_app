import { defineStore } from "pinia";
import RetrievePurchaseOrderDetail from "@/services/api/PUR/retrievePurchaseOrderDetail";
import ApprovePurchaseOrder from "@/services/api/PUR/approvePurchaseOrder";
import RejectPurchaseOrder from "@/services/api/PUR/rejectPurchaseOrder";
import CancelPurchaseOrder from "@/services/api/PUR/cancelPurchaseOrder";
import SendPurchaseOrder from "@/services/api/PUR/sendPurchaseOrder";
import type { PurchaseOrderDetail, PurchaseOrderDetailItem } from "@/models/POS/PUR/PUR14000";

/** PUR14000 purchase-order detail store: tolerant header/item read by poId. */
export const PUR14000Store = defineStore("PUR14000Store", {
    state: () => ({
        loading: true,
        acting: false,
        header: null as PurchaseOrderDetail | null,
        items: [] as PurchaseOrderDetailItem[],
        detailApi: RetrievePurchaseOrderDetail.getInstance(),
        approveApi: ApprovePurchaseOrder.getInstance(),
        rejectApi: RejectPurchaseOrder.getInstance(),
        cancelApi: CancelPurchaseOrder.getInstance(),
        sendApi: SendPurchaseOrder.getInstance()
    }),
    getters: {
        receivedHint(state): string {
            const ordered = state.items.reduce((s, it) => s + Number(it.orderedQuantity ?? 0), 0);
            const received = state.items.reduce((s, it) => s + Number(it.receivedQuantity ?? 0), 0);
            if (!ordered) return "—";
            const pct = Math.round((received / ordered) * 100);
            return `${received} / ${ordered} (${pct}%)`;
        }
    },
    actions: {
        load(poId: string) {
            if (!poId) { this.loading = false; return; }
            this.loading = true;
            this.detailApi.request({
                dataBody: { poId },
                listener: {
                    onSuccess: (p) => {
                        // Tolerant read: header may be nested under `po`, items under `items` or `itemList`.
                        const h = p?.po ?? p;
                        this.header = h && Object.keys(h).length ? h : null;
                        this.items = p?.items ?? p?.itemList ?? h?.items ?? h?.itemList ?? [];
                        this.loading = false;
                    },
                    onFail: () => { this.header = null; this.items = []; this.loading = false; }
                }
            });
        },

        send(poId: string, onDone: (ok: boolean, err?: unknown) => void) {
            this.transition(this.sendApi, { poId }, onDone);
        },

        approve(poId: string, onDone: (ok: boolean, err?: unknown) => void) {
            this.transition(this.approveApi, { poId }, onDone);
        },

        reject(poId: string, reason: string, onDone: (ok: boolean, err?: unknown) => void) {
            this.transition(this.rejectApi, { poId, reason }, onDone);
        },

        cancel(poId: string, reason: string, onDone: (ok: boolean, err?: unknown) => void) {
            this.transition(this.cancelApi, { poId, reason }, onDone);
        },

        /** Shared transition runner: fire the trCode, then reload the detail. */
        transition(
            api: { request: (option: never) => void },
            dataBody: { poId: string; reason?: string },
            onDone: (ok: boolean, err?: unknown) => void
        ) {
            this.acting = true;
            (api as { request: (option: unknown) => void }).request({
                dataBody,
                listener: {
                    onSuccess: () => {
                        this.acting = false;
                        this.load(dataBody.poId);
                        onDone(true);
                    },
                    onFail: (err: unknown) => {
                        this.acting = false;
                        onDone(false, err);
                    }
                }
            });
        }
    }
});
