import { defineStore } from "pinia";
import CreateLoan from "@/services/api/DBT/createLoan";
import PreviewLoanSchedule from "@/services/api/DBT/previewLoanSchedule";
import type { CashAccount, LenderType } from "@/models/POS/DBT/DBT10000";
import type { CreateLoanResponse, ScheduleRow, SchedulePreviewResponse } from "@/models/POS/DBT/DBT20000";

/** DBT20000 new-loan store: the terms, a live schedule preview, and the create call. */
export const DBT20000Store = defineStore("DBT20000Store", {
    state: () => ({
        lenderName: "",
        lenderType: "BANK" as LenderType,
        principal: undefined as number | undefined,
        interestRate: 0 as number | undefined,
        startDate: undefined as string | undefined,
        termMonths: 12 as number | undefined,
        receivedTo: "BANK" as CashAccount,
        referenceNo: "",
        remark: "",
        schedule: [] as ScheduleRow[],
        monthlyPayment: 0,
        totalInterest: 0,
        previewing: false,
        submitting: false,
        previewTimer: 0 as ReturnType<typeof setTimeout> | 0,
        createApi: CreateLoan.getInstance(),
        previewApi: PreviewLoanSchedule.getInstance()
    }),
    getters: {
        termsComplete: (s) => Number(s.principal) > 0 && Number(s.termMonths) > 0 && !!s.startDate
    },
    actions: {
        reset() {
            this.lenderName = ""; this.lenderType = "BANK"; this.principal = undefined; this.interestRate = 0;
            this.startDate = undefined; this.termMonths = 12; this.receivedTo = "BANK";
            this.referenceNo = ""; this.remark = ""; this.schedule = []; this.monthlyPayment = 0; this.totalInterest = 0;
            this.submitting = false;
        },
        terms() {
            return {
                principal: Number(this.principal), interestRate: Number(this.interestRate ?? 0),
                startDate: this.startDate as string, termMonths: Number(this.termMonths)
            };
        },
        /** Debounced: every terms edit refreshes the schedule table. */
        onTermsChange() {
            if (this.previewTimer) clearTimeout(this.previewTimer);
            this.previewTimer = setTimeout(() => this.preview(), 300);
        },
        preview() {
            if (!this.termsComplete) { this.schedule = []; return; }
            this.previewing = true;
            this.previewApi.request({
                dataBody: this.terms(),
                listener: {
                    onSuccess: (p: SchedulePreviewResponse) => {
                        this.schedule = p.scheduleList ?? [];
                        this.monthlyPayment = Number(p.monthlyPayment ?? 0);
                        this.totalInterest = Number(p.totalInterest ?? 0);
                        this.previewing = false;
                    },
                    onFail: () => { this.schedule = []; this.previewing = false; }
                }
            });
        },
        submit(onDone: (ok: boolean, res?: CreateLoanResponse, error?: unknown) => void) {
            this.submitting = true;
            this.createApi.request({
                dataBody: {
                    lenderName: this.lenderName.trim(), lenderType: this.lenderType, receivedTo: this.receivedTo,
                    referenceNo: this.referenceNo || undefined, remark: this.remark || undefined, ...this.terms()
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
