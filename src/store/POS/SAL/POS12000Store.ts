import { defineStore } from "pinia";
import RetrievePosInvoice from "@/services/api/POS/retrievePosInvoice";
import type { SaleInvoice } from "@/models/POS/invoice";

/** POS12000 invoice-view screen store: loads a sale invoice by sale code. */
export const POS12000Store = defineStore("POS12000Store", {
    state: () => ({
        loading: true,
        invoice: null as SaleInvoice | null,
        invoiceApi: RetrievePosInvoice.getInstance()
    }),
    actions: {
        load(code: string) {
            if (!code) {
                this.loading = false;
                return;
            }
            this.loading = true;
            this.invoiceApi.request({
                dataBody: { saleCode: code },
                listener: {
                    onSuccess: (payload: SaleInvoice) => {
                        this.invoice = payload;
                        this.loading = false;
                    },
                    onFail: () => {
                        this.invoice = null;
                        this.loading = false;
                    }
                }
            });
        }
    }
});
