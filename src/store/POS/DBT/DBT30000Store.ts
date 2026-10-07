import { defineStore } from "pinia";
import RetrieveLoanDetail from "@/services/api/DBT/retrieveLoanDetail";
import RecordLoanRepayment from "@/services/api/DBT/recordLoanRepayment";
import type { CashAccount } from "@/models/POS/DBT/DBT10000";
import type { LoanDetailResponse, RecordRepaymentResponse } from "@/models/POS/DBT/DBT30000";

/** DBT30000 loan detail store: loan + schedule + payments, and the repayment form. */
export const DBT30000Store = defineStore("DBT30000Store", {
    state: () => ({
        loanId: "",
        detail: undefined as LoanDetailResponse | undefined,
        loading: false,
        // repayment form
        paymentDate: undefined as string | undefined,
        principalAmount: 0 as number | undefined,
        interestAmount: 0 as number | undefined,
        paidFrom: "BANK" as CashAccount,
        referenceNo: "",
        submitting: false,
        api: RetrieveLoanDetail.getInstance(),
        repayApi: RecordLoanRepayment.getInstance()
    }),
    actions: {
        load(loanId: string) {
            this.loanId = loanId;
            this.loading = true;
            this.api.request({
                dataBody: { loanId },
                listener: {
                    onSuccess: (p: LoanDetailResponse) => { this.detail = p; this.loading = false; },
                    onFail: () => { this.detail = undefined; this.loading = false; }
                }
            });
        },
        /** Pre-fill the next unpaid instalment so a routine payment is one click. */
        resetRepayment() {
            const next = (this.detail?.scheduleList ?? []).find((s) => s.status !== "PAID");
            this.paymentDate = undefined;
            this.principalAmount = next ? Number(next.principalDue) : 0;
            this.interestAmount = next ? Number(next.interestDue) : 0;
            this.paidFrom = this.detail?.receivedTo ?? "BANK";
            this.referenceNo = "";
            this.submitting = false;
        },
        repay(onDone: (ok: boolean, res?: RecordRepaymentResponse, error?: unknown) => void) {
            this.submitting = true;
            this.repayApi.request({
                dataBody: {
                    loanId: this.loanId,
                    paymentDate: this.paymentDate as string,
                    principalAmount: Number(this.principalAmount ?? 0),
                    interestAmount: Number(this.interestAmount ?? 0),
                    paidFrom: this.paidFrom,
                    referenceNo: this.referenceNo || undefined
                },
                headers: { "Idempotency-Key": crypto.randomUUID() },
                listener: {
                    onSuccess: (res) => { this.submitting = false; onDone(true, res); },
                    onFail: (e) => { this.submitting = false; onDone(false, undefined, e); }
                }
            });
        }
    }
});
