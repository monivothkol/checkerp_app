import { defineStore } from "pinia";
import RetrieveSaleReturnForEdit from "@/services/api/SAL/retrieveSaleReturnForEdit";
import UpdateSaleReturn from "@/services/api/SAL/updateSaleReturn";
import POP from "@/core/utilities/pop";
import type { ReturnLine } from "@/models/POS/SAL/SAL21000";
import type { SAL27000EditItem } from "@/models/POS/SAL/SAL27000";

/** SAL27000 sale-return EDIT store: refills from SAL27000I02, edits qty/refund
 *  per line like the create form, submits SAL27000I01 (no confirm step).
 *  Mirrors the quotation-edit (SAL17000) pattern. PENDING returns only. */
export const SAL27000Store = defineStore("SAL27000Store", {
    state: () => ({
        returnId: "",
        returnCode: "",
        saleCode: "",
        customerName: "",
        inventoryId: undefined as string | undefined,
        notes: "",
        lines: [] as ReturnLine[],
        loading: true,
        notFound: false,
        submitting: false,
        redirectTo: null as string | null
    }),
    getters: {
        totalRefund(state): number {
            return state.lines.reduce((sum, l) => sum + (l.returnQty > 0 ? Number(l.refundAmount ?? 0) : 0), 0);
        },
        canConfirm(state): boolean {
            return state.lines.some((l) => l.returnQty > 0);
        }
    },
    actions: {
        /** Full refund cap = suggested unit refund × returned qty (same as create). */
        lineCap(l: ReturnLine): number {
            const sold = Number(l.quantitySold ?? 0);
            if (sold <= 0) return 0;
            return Math.round(Number(l.suggestedRefund ?? 0) * (Number(l.returnQty ?? 0) / sold) * 100) / 100;
        },
        setQty(i: number, v: number | null) {
            const l = this.lines[i];
            if (!l) return;
            const n = Number(v ?? 0);
            l.returnQty = Math.max(0, Math.min(l.returnableQuantity, Number.isFinite(n) ? n : 0));
            // Qty drives the cap; reset refund to full for the new qty (operator can lower it).
            l.refundAmount = this.lineCap(l);
        },
        setRefund(i: number, v: number | null) {
            const l = this.lines[i];
            if (!l) return;
            const cap = this.lineCap(l);
            const n = Number(v ?? 0);
            l.refundAmount = Math.max(0, Math.min(cap, Number.isFinite(n) ? n : 0));
        },
        /** Refill the form from the PENDING return (SAL27000I02). */
        loadForEdit(returnId: string) {
            this.returnId = returnId;
            if (!returnId) { this.loading = false; this.notFound = true; return; }
            this.loading = true;
            RetrieveSaleReturnForEdit.getInstance().request({
                dataBody: { returnId },
                listener: {
                    onSuccess: (d) => {
                        this.returnCode = d.returnCode ?? "";
                        this.saleCode = d.saleCode ?? "";
                        this.customerName = d.customerName ?? "";
                        this.inventoryId = d.inventoryId;
                        this.notes = d.notes ?? "";
                        this.lines = (d.items ?? []).map((it: SAL27000EditItem) => ({
                            saleItemId: it.saleItemId,
                            productCode: it.productCode,
                            productName: it.productName,
                            quantitySold: Number(it.quantitySold ?? 0),
                            alreadyReturned: Number(it.alreadyReturned ?? 0),
                            returnableQuantity: Number(it.returnableQuantity ?? 0),
                            unitPrice: Number(it.unitPrice ?? 0),
                            suggestedRefund: Number(it.suggestedRefund ?? 0),
                            returnQty: Number(it.returnQty ?? 0),
                            refundAmount: Number(it.refundAmount ?? 0)
                        }));
                        this.loading = false;
                    },
                    onFail: () => { this.notFound = true; this.loading = false; }
                }
            });
        },
        /** Submit the update; `failTitle` is the already-translated alert title. */
        submit(failTitle: string) {
            if (this.submitting || !this.canConfirm) return;
            this.submitting = true;
            const picked = this.lines.filter((l) => l.returnQty > 0);
            UpdateSaleReturn.getInstance().request({
                dataBody: {
                    returnId: this.returnId,
                    inventoryId: this.inventoryId,
                    notes: this.notes || undefined,
                    itemList: picked.map((l) => ({ saleItemId: l.saleItemId, quantityReturned: l.returnQty, refundAmount: l.refundAmount }))
                },
                headers: { "Idempotency-Key": crypto.randomUUID() },
                listener: {
                    onSuccess: () => { this.submitting = false; this.redirectTo = "/SAL20000"; },
                    onFail: (err) => {
                        this.submitting = false;
                        POP.alert({ title: failTitle, status: "error", content: err?.message, errorCode: err?.code });
                    }
                }
            });
        }
    }
});
