import { defineStore } from "pinia";
import RetrievePosInvoice from "@/services/api/POS/retrievePosInvoice";
import type { SaleInvoice } from "@/models/POS/invoice";

/** Store for the invoice preview modal: loads a sale invoice by sale code. */
export const InvoiceModalStore = defineStore("InvoiceModalStore", {
    state: () => ({
        loading: true,
        invoice: null as SaleInvoice | null,
        invoiceApi: RetrievePosInvoice.getInstance()
    }),
    actions: {
        load(saleCode: string) {
            this.loading = true;
            this.invoice = null;
            this.invoiceApi.request({
                dataBody: { saleCode },
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
