import { defineStore } from "pinia";
import RetrieveSaleForReturn from "@/services/api/SAL/retrieveSaleForReturn";
import POP from "@/core/utilities/pop";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { ReturnLine, SaleReturnLookup, SaleReturnLookupItem } from "@/models/POS/SAL/SAL21000";

/** SAL21000 sale-return create form store: sale lookup, return lines + draft handoff to SAL22000. */
export const SAL21000Store = defineStore("SAL21000Store", {
    state: () => ({
        saleCode: "",
        loadingSale: false,
        sale: null as SaleReturnLookup | null,
        lines: [] as ReturnLine[],
        notes: ""
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
        /** Full refund cap for a line = suggested unit refund × returned qty. */
        lineCap(l: ReturnLine): number {
            const sold = Number(l.quantitySold ?? 0);
            if (sold <= 0) return 0;
            return Math.round(Number(l.suggestedRefund ?? 0) * (Number(l.returnQty ?? 0) / sold) * 100) / 100;
        },
        /** Actual refund for a line (operator-editable, defaults to the cap). */
        lineRefund(l: ReturnLine): number {
            return Number(l.refundAmount ?? 0);
        },
        setQty(i: number, v: number | null) {
            const l = this.lines[i];
            if (!l) return;
            const n = Number(v ?? 0);
            l.returnQty = Math.max(0, Math.min(l.returnableQuantity, Number.isFinite(n) ? n : 0));
            // Qty drives the cap; reset the refund to full for the new qty. The
            // operator can then lower it for a partial refund.
            l.refundAmount = this.lineCap(l);
        },
        /** Partial refund: clamp the operator's input to [0, cap]. */
        setRefund(i: number, v: number | null) {
            const l = this.lines[i];
            if (!l) return;
            const cap = this.lineCap(l);
            const n = Number(v ?? 0);
            l.refundAmount = Math.max(0, Math.min(cap, Number.isFinite(n) ? n : 0));
        },
        /** Look up a sale by code; `failTitle` is the already-translated alert title (i18n stays in the screen). */
        loadSale(failTitle: string) {
            const code = this.saleCode.trim();
            if (!code || this.loadingSale) return;
            this.loadingSale = true;
            RetrieveSaleForReturn.getInstance().request({
                dataBody: { saleCode: code },
                listener: {
                    onSuccess: (p) => {
                        this.loadingSale = false;
                        this.sale = p;
                        this.lines = (p.items ?? []).map((it: SaleReturnLookupItem) => ({
                            saleItemId: it.saleItemId,
                            productCode: it.productCode,
                            productName: it.productName,
                            quantitySold: Number(it.quantitySold ?? 0),
                            alreadyReturned: Number(it.alreadyReturned ?? 0),
                            returnableQuantity: Number(it.returnableQuantity ?? 0),
                            unitPrice: Number(it.unitPrice ?? 0),
                            suggestedRefund: Number(it.suggestedRefund ?? 0),
                            returnQty: 0,
                            refundAmount: 0
                        }));
                        this.notes = "";
                    },
                    onFail: (err) => {
                        this.loadingSale = false;
                        POP.alert({ title: failTitle, status: "error", content: err?.message, errorCode: err?.code });
                    }
                }
            });
        },
        /** Validate + stash the SALR draft; returns true when saved (screen then navigates). */
        buildAndSaveDraft(): boolean {
            if (!this.canConfirm || !this.sale) return false;
            const picked = this.lines.filter((l) => l.returnQty > 0);
            ModuleFlowStore.saveDraft("SALR", {
                payload: {
                    saleId: this.sale.saleId,
                    inventoryId: this.sale.inventoryId,
                    notes: this.notes || undefined,
                    itemList: picked.map((l) => ({ saleItemId: l.saleItemId, quantityReturned: l.returnQty, refundAmount: l.refundAmount }))
                },
                idempotencyKey: crypto.randomUUID(),
                display: {
                    saleCode: this.sale.saleCode,
                    customerName: this.sale.customerName,
                    lines: picked.map((l) => ({ name: l.productName, code: l.productCode, qty: l.returnQty, refund: this.lineRefund(l) })),
                    totalRefund: this.totalRefund
                }
            });
            return true;
        }
    }
});
