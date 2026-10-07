import { defineStore } from "pinia";
import RetrievePayslipDetail from "@/services/api/PRM/retrievePayslipDetail";
import RemovePayrollLine from "@/services/api/PRM/removePayrollLine";
import MarkPayslipVerified from "@/services/api/PRM/markPayslipVerified";
import MarkPayslipPaid from "@/services/api/PRM/markPayslipPaid";
import type { PayslipItem, PayslipLine, MarkPayslipRequest, MarkPayslipResponse } from "@/models/POS/PRM/PRM15000";
import type { IRequest } from "@/services/api/api-request-option";

type MarkDone = (ok: boolean, error?: unknown) => void;

/** PRM15000 payslip detail store: item + earning/deduction lines load by itemId. */
export const PRM15000Store = defineStore("PRM15000Store", {
    state: () => ({
        loading: true,
        itemId: "",
        detail: null as PayslipItem | null,
        lines: [] as PayslipLine[],
        payslipApi: RetrievePayslipDetail.getInstance(),
        removeApi: RemovePayrollLine.getInstance(),
        verifyApi: MarkPayslipVerified.getInstance(),
        paidApi: MarkPayslipPaid.getInstance()
    }),
    getters: {
        earnings(state): PayslipLine[] {
            return state.lines.filter((l) => l.category === "EARNING");
        },
        deductions(state): PayslipLine[] {
            return state.lines.filter((l) => l.category === "DEDUCTION");
        }
    },
    actions: {
        load(itemId: string) {
            this.itemId = itemId;
            if (!itemId) { this.loading = false; return; }
            this.loading = true;
            this.payslipApi.request({
                dataBody: { itemId },
                listener: {
                    onSuccess: (p) => {
                        // Item may come nested (p.item) or flat alongside lines.
                        this.detail = p.item ?? p;
                        this.lines = p.lines ?? p.lineList ?? [];
                        this.loading = false;
                    },
                    onFail: () => { this.detail = null; this.lines = []; this.loading = false; }
                }
            });
        },
        /** Remove a MANUAL/COMMISSION line from the draft run, then reload the payslip. */
        removeLine(lineId: string, done: (ok: boolean, error?: unknown) => void) {
            this.removeApi.request({
                dataBody: { lineId },
                listener: {
                    onSuccess: () => { this.load(this.itemId); done(true); },
                    onFail: (e) => done(false, e)
                }
            });
        },
        // Shared runner for the two verify/pay marks; reloads the payslip on success.
        mark(api: IRequest<MarkPayslipRequest, MarkPayslipResponse>, body: MarkPayslipRequest, done: MarkDone) {
            api.request({
                dataBody: body,
                listener: {
                    onSuccess: () => { this.load(this.itemId); done(true); },
                    onFail: (e) => done(false, e)
                }
            });
        },
        markVerified(verified: boolean, done: MarkDone) {
            this.mark(this.verifyApi, { itemId: this.itemId, verified }, done);
        },
        markPaid(paid: boolean, done: MarkDone) {
            this.mark(this.paidApi, { itemId: this.itemId, paid }, done);
        }
    }
});
