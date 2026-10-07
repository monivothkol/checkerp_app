import { defineStore } from "pinia";
import GenerateKhqr from "@/services/api/POS/generateKhqr";
import PollKhqrStatus from "@/services/api/POS/pollKhqrStatus";

/**
 * Store for the KHQR payment modal. Owns the generate + poll API calls and all
 * payment state. The component keeps the poll/countdown intervals, canvas render
 * and $emit — it $watches this store's state (qr / paid / error) to react.
 */
export const KhqrPaymentModalStore = defineStore("KhqrPaymentModalStore", {
    state: () => ({
        amount: 0,
        billNumber: "",
        customerName: "",
        loading: true,
        error: "",
        qr: "",
        md5: "",
        transactionId: "",
        expiresAt: 0,
        verifiable: false,
        paid: false,
        remainingMs: 0,
        generateApi: GenerateKhqr.getInstance(),
        pollApi: PollKhqrStatus.getInstance()
    }),
    getters: {
        countdown(state): string {
            const s = Math.max(0, Math.floor(state.remainingMs / 1000));
            const m = Math.floor(s / 60);
            return `${m}:${String(s % 60).padStart(2, "0")}`;
        }
    },
    actions: {
        /** Reset + seed from props (store is a singleton reused across modal opens). */
        init(amount: number, billNumber: string, customerName: string) {
            this.amount = amount;
            this.billNumber = billNumber;
            this.customerName = customerName;
            this.loading = true;
            this.error = "";
            this.qr = "";
            this.md5 = "";
            this.transactionId = "";
            this.expiresAt = 0;
            this.verifiable = false;
            this.paid = false;
            this.remainingMs = 0;
        },
        generate(errorFallback: string) {
            this.loading = true;
            this.error = "";
            this.qr = "";
            this.generateApi.request({
                dataBody: { amount: this.amount, billNumber: this.billNumber, customerName: this.customerName },
                listener: {
                    onSuccess: (p: { qr?: string; md5?: string; transactionId?: string; expiresAt?: number; verifiable?: boolean }) => {
                        this.md5 = p.md5 ?? "";
                        this.transactionId = p.transactionId ?? "";
                        this.expiresAt = p.expiresAt ?? Date.now() + 15 * 60 * 1000;
                        this.verifiable = !!p.verifiable;
                        this.loading = false;
                        this.qr = p.qr ?? "";
                    },
                    onFail: (err: { message?: string }) => {
                        this.loading = false;
                        this.error = err?.message || errorFallback;
                    }
                }
            });
        },
        /** Advance the expiry clock; sets error when the QR times out. */
        tick(now: number, expiredMsg: string) {
            this.remainingMs = this.expiresAt - now;
            if (this.remainingMs <= 0 && !this.paid) {
                this.error = expiredMsg;
            }
        },
        poll(expiredMsg: string) {
            if (this.paid) return;
            this.pollApi.request({
                dataBody: { md5: this.md5, transactionId: this.transactionId },
                listener: {
                    onSuccess: (p: { paid?: boolean; expired?: boolean }) => {
                        if (p.paid) {
                            this.paid = true;
                        } else if (p.expired) {
                            this.error = expiredMsg;
                        }
                    },
                    onFail: () => {
                        /* transient — keep polling */
                    }
                }
            });
        },
        markPaid() {
            this.paid = true;
        }
    }
});
