import { defineStore } from "pinia";
import CreateStaffFinancialTransaction from "@/services/api/SFM/createStaffFinancialTransaction";
import type { CreateStaffFinancialTransactionResponse } from "@/models/POS/SFM/SFM30000";

/**
 * SFM30000 transaction-entry store: posts one staff financial transaction
 * (disbursement / repayment / deposit / refund) and reports success/failure.
 */
export const SFM30000Store = defineStore("SFM30000Store", {
    state: () => ({
        staffId: "",
        accountType: undefined as string | undefined,
        transactionType: undefined as string | undefined,
        amount: undefined as number | undefined,
        referenceNo: "",
        remark: "",
        trnDate: undefined as string | undefined,
        submitting: false,
        api: CreateStaffFinancialTransaction.getInstance()
    }),
    actions: {
        reset(staffId: string) {
            this.staffId = staffId;
            this.accountType = undefined;
            this.transactionType = undefined;
            this.amount = undefined;
            this.referenceNo = "";
            this.remark = "";
            this.trnDate = undefined;
            this.submitting = false;
        },
        submit(onDone: (ok: boolean, res?: CreateStaffFinancialTransactionResponse, error?: unknown) => void) {
            this.submitting = true;
            this.api.request({
                dataBody: {
                    staffId: this.staffId,
                    transactionType: this.transactionType as string,
                    amount: Number(this.amount),
                    referenceNo: this.referenceNo || undefined,
                    remark: this.remark || undefined,
                    trnDate: this.trnDate || undefined
                },
                listener: {
                    onSuccess: (res) => { this.submitting = false; onDone(true, res); },
                    onFail: (e) => { this.submitting = false; onDone(false, undefined, e); }
                }
            });
        }
    }
});
