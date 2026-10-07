import { defineStore } from "pinia";
import RetrievePosContext from "@/services/api/POS/retrievePosContext";
import CreateInvoicePayment from "@/services/api/SIV/createInvoicePayment";
import POP from "@/core/utilities/pop";
import type { PaymentMethodLookup } from "@/models/POS/COMMON/lookups";
import type { SIV13100PayPayload, SIV13100PayResponse } from "@/models/POS/SIV/SIV13100";

/** SIV13100 invoice-payment modal store: payment methods + the pay api call. */
export const SIV13100Store = defineStore("SIV13100Store", {
    state: () => ({
        paymentMethods: [] as PaymentMethodLookup[],
        paymentMethodId: undefined as string | undefined,
        submitting: false,
        posContextApi: RetrievePosContext.getInstance(),
        payApi: CreateInvoicePayment.getInstance()
    }),
    actions: {
        loadMethods() {
            this.posContextApi.request({
                dataBody: {},
                listener: {
                    onSuccess: (p: { paymentMethods?: PaymentMethodLookup[] }) => {
                        this.paymentMethods = p.paymentMethods ?? [];
                        const cash = this.paymentMethods.find((m) => m.methodCode === "CASH");
                        this.paymentMethodId = cash?.paymentMethodId ?? this.paymentMethods[0]?.paymentMethodId;
                    }
                }
            });
        },
        /** Record the payment; resolves true on success. `failTitle` is already translated. */
        submit(payload: SIV13100PayPayload, failTitle: string): Promise<SIV13100PayResponse | null> {
            if (this.submitting) return Promise.resolve(null);
            this.submitting = true;
            return new Promise((resolve) => {
                this.payApi.request({
                    dataBody: payload,
                    headers: { "Idempotency-Key": crypto.randomUUID() },
                    listener: {
                        onSuccess: (p: SIV13100PayResponse) => {
                            this.submitting = false;
                            resolve(p);
                        },
                        onFail: (err: { message?: string; code?: string }) => {
                            this.submitting = false;
                            POP.alert({ title: failTitle, status: "error", content: err?.message, errorCode: err?.code });
                            resolve(null);
                        }
                    }
                });
            });
        }
    }
});
