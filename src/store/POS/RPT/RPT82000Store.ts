import { defineStore } from "pinia";
import RetrieveCommissionDetail from "@/services/api/RPT/RetrieveCommissionDetail";
import ApproveCommission from "@/services/api/RPT/ApproveCommission";
import RejectCommission from "@/services/api/RPT/RejectCommission";
import type { CommissionDetail, CommissionActionResponse } from "@/models/POS/RPT/RPT80000";

type ActionDone = (ok: boolean, res?: CommissionActionResponse, error?: unknown) => void;

/** RPT82000 commission detail store: header + recipients, with approve/reject. */
export const RPT82000Store = defineStore("RPT82000Store", {
    state: () => ({
        loading: true,
        acting: false,
        commissionId: "",
        detail: null as CommissionDetail | null,
        detailApi: RetrieveCommissionDetail.getInstance(),
        approveApi: ApproveCommission.getInstance(),
        rejectApi: RejectCommission.getInstance()
    }),
    actions: {
        load(commissionId: string) {
            this.commissionId = commissionId;
            if (!commissionId) { this.loading = false; return; }
            this.loading = true;
            this.detailApi.request({
                dataBody: { commissionId },
                listener: {
                    onSuccess: (p) => { this.detail = p; this.loading = false; },
                    onFail: () => { this.detail = null; this.loading = false; }
                }
            });
        },
        approve(done: ActionDone) {
            this.acting = true;
            this.approveApi.request({
                dataBody: { commissionId: this.commissionId },
                listener: {
                    onSuccess: (res) => { this.acting = false; this.load(this.commissionId); done(true, res); },
                    onFail: (e) => { this.acting = false; done(false, undefined, e); }
                }
            });
        },
        reject(reason: string, done: ActionDone) {
            this.acting = true;
            this.rejectApi.request({
                dataBody: { commissionId: this.commissionId, rejectionReason: reason },
                listener: {
                    onSuccess: (res) => { this.acting = false; this.load(this.commissionId); done(true, res); },
                    onFail: (e) => { this.acting = false; done(false, undefined, e); }
                }
            });
        }
    }
});
