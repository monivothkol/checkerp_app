import { defineStore } from "pinia";
import RetrieveSaleInvoice from "@/services/api/SIV/retrieveSaleInvoice";
import RetrieveInvoiceAuditLog from "@/services/api/SIV/retrieveInvoiceAuditLog";
import VoidInvoice from "@/services/api/SIV/voidInvoice";
import type { SaleInvoice, InvoiceAuditEntry } from "@/models/POS/invoice";

/** SIV13000 invoice-detail screen store: invoice load by sale code + cancel. */
export const SIV13000Store = defineStore("SIV13000Store", {
    state: () => ({
        loading: true,
        voiding: false,
        invoice: null as SaleInvoice | null,
        auditList: [] as InvoiceAuditEntry[],
        saleInvoiceApi: RetrieveSaleInvoice.getInstance(),
        auditApi: RetrieveInvoiceAuditLog.getInstance(),
        voidApi: VoidInvoice.getInstance()
    }),
    getters: {
        /** Cancel any live invoice — the backend cascade deletes all derived
         *  accounting/returns/payments and restores stock. Only a terminal
         *  (already cancelled/voided) invoice is excluded. */
        /** A cancelled/voided invoice is a read-only record: no operation may start from it. */
        isClosed(state): boolean {
            const status = String(state.invoice?.status ?? "").toUpperCase();
            return status === "CANCELLED" || status === "VOIDED";
        },
        canCancel(state): boolean {
            if (!state.invoice) return false;
            const status = String(state.invoice.status ?? "").toUpperCase();
            return status !== "CANCELLED" && status !== "VOIDED";
        }
    },
    actions: {
        load(code: string) {
            if (!code) { this.loading = false; return; }
            this.loading = true;
            this.saleInvoiceApi.request({
                dataBody: { saleCode: code },
                listener: {
                    onSuccess: (p: SaleInvoice) => { this.invoice = p; this.loading = false; },
                    onFail: () => { this.invoice = null; this.loading = false; }
                }
            });
            this.loadAudit(code);
        },
        loadAudit(code: string) {
            this.auditApi.request({
                dataBody: { saleCode: code },
                listener: {
                    onSuccess: (p) => { this.auditList = p.auditList ?? []; },
                    onFail: () => { this.auditList = []; }
                }
            });
        },

        /** Cancel the invoice; backend reverses its journal entry and restores stock. */
        cancel(code: string, onDone: (ok: boolean, err?: unknown) => void) {
            this.voiding = true;
            this.voidApi.request({
                dataBody: { saleCode: code },
                listener: {
                    onSuccess: () => {
                        this.voiding = false;
                        this.load(code);
                        onDone(true);
                    },
                    onFail: (err: unknown) => {
                        this.voiding = false;
                        onDone(false, err);
                    }
                }
            });
        }
    }
});
