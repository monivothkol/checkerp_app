import { defineStore } from "pinia";
import RetrieveDelivery from "@/services/api/SAL/retrieveDelivery";
import RetrieveDeliveryAuditLog from "@/services/api/SAL/retrieveDeliveryAuditLog";
import UpdateDeliveryStatus from "@/services/api/SAL/updateDeliveryStatus";
import POP from "@/core/utilities/pop";
import type { DeliveryHeader, DeliveryInvoiceItem } from "@/models/POS/SAL/SAL40000";
import type { InvoiceAuditEntry } from "@/models/POS/invoice";

/** SAL74000 delivery-invoice store: loads one delivery header, items + edit history. */
export const SAL74000Store = defineStore("SAL74000Store", {
    state: () => ({
        deliveryId: "",
        header: null as DeliveryHeader | null,
        items: [] as DeliveryInvoiceItem[],
        auditList: [] as InvoiceAuditEntry[],
        loading: false,
        acting: false,
        api: RetrieveDelivery.getInstance(),
        auditApi: RetrieveDeliveryAuditLog.getInstance(),
        statusApi: UpdateDeliveryStatus.getInstance()
    }),
    actions: {
        /** Advance this delivery's status, then reload; `failTitle` is already translated. */
        advanceStatus(status: string, failTitle: string) {
            if (!this.deliveryId || !status || this.acting) return;
            this.acting = true;
            this.statusApi.request({
                dataBody: { deliveryId: this.deliveryId, status },
                listener: {
                    onSuccess: () => { this.acting = false; this.load(this.deliveryId, failTitle); },
                    onFail: (err) => { this.acting = false; POP.alert({ title: failTitle, status: "error", content: err?.message, errorCode: err?.code }); }
                }
            });
        },
        load(deliveryId: string, failTitle: string) {
            this.deliveryId = deliveryId;
            if (!deliveryId) { this.header = null; this.items = []; return; }
            this.loading = true;
            this.api.request({
                dataBody: { deliveryId },
                listener: {
                    onSuccess: (p) => {
                        this.header = p.delivery ?? null;
                        this.items = p.items ?? [];
                        this.loading = false;
                    },
                    onFail: (err) => {
                        this.header = null;
                        this.items = [];
                        this.loading = false;
                        POP.alert({ title: failTitle, status: "error", content: err?.message, errorCode: err?.code });
                    }
                }
            });
            this.auditApi.request({
                dataBody: { deliveryId },
                listener: {
                    onSuccess: (p) => { this.auditList = p.auditList ?? []; },
                    onFail: () => { this.auditList = []; }
                }
            });
        }
    }
});
