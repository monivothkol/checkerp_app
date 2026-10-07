import { defineStore } from "pinia";
import RetrievePayrollRunDetail from "@/services/api/PRM/retrievePayrollRunDetail";
import GeneratePayrollLines from "@/services/api/PRM/generatePayrollLines";
import FinalizePayrollRun from "@/services/api/PRM/finalizePayrollRun";
import VoidPayrollRun from "@/services/api/PRM/voidPayrollRun";
import type { PayrollRunHeader, PayrollRunItem, PayrollRunActionResponse } from "@/models/POS/PRM/PRM14000";
import type { IRequest } from "@/services/api/api-request-option";

type ActionResult = (ok: boolean, res?: PayrollRunActionResponse, error?: unknown) => void;

/** PRM14000 payroll-run detail store: header + items load, plus run lifecycle actions. */
export const PRM14000Store = defineStore("PRM14000Store", {
    state: () => ({
        loading: true,
        acting: false,
        runId: "",
        run: null as PayrollRunHeader | null,
        items: [] as PayrollRunItem[],
        runDetailApi: RetrievePayrollRunDetail.getInstance(),
        generateApi: GeneratePayrollLines.getInstance(),
        finalizeApi: FinalizePayrollRun.getInstance(),
        voidApi: VoidPayrollRun.getInstance()
    }),
    actions: {
        load(runId: string) {
            this.runId = runId;
            if (!runId) { this.loading = false; return; }
            this.loading = true;
            this.runDetailApi.request({
                dataBody: { runId },
                listener: {
                    onSuccess: (p) => {
                        // Header may come nested (p.run) or flat alongside items.
                        this.run = p.run ?? p;
                        this.items = p.items ?? p.itemList ?? [];
                        this.loading = false;
                    },
                    onFail: () => { this.run = null; this.items = []; this.loading = false; }
                }
            });
        },
        // Shared runner for the three run-lifecycle actions; reloads the run on success.
        runAction(api: IRequest<{ runId: string }, PayrollRunActionResponse>, done: ActionResult) {
            this.acting = true;
            api.request({
                dataBody: { runId: this.runId },
                listener: {
                    onSuccess: (res) => { this.acting = false; this.load(this.runId); done(true, res); },
                    onFail: (e) => { this.acting = false; done(false, undefined, e); }
                }
            });
        },
        generateLines(done: ActionResult) { this.runAction(this.generateApi, done); },
        finalize(done: ActionResult) { this.runAction(this.finalizeApi, done); },
        voidRun(done: ActionResult) { this.runAction(this.voidApi, done); }
    }
});
