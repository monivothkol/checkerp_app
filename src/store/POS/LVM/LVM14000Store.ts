import { defineStore } from "pinia";
import RetrieveLeaveRequestDetail from "@/services/api/LVM/retrieveLeaveRequestDetail";
import ApproveLeaveRequest from "@/services/api/LVM/approveLeaveRequest";
import RejectLeaveRequest from "@/services/api/LVM/rejectLeaveRequest";
import CancelLeaveRequestApi from "@/services/api/LVM/cancelLeaveRequest";
import type { LeaveRequestHeader, LeaveApproval, LeaveFollower, ActLeaveRequest, ActLeaveResponse } from "@/models/POS/LVM/LVM10000";
import type { IRequest } from "@/services/api/api-request-option";

type ActDone = (ok: boolean, error?: unknown) => void;

/** LVM14000 leave-request detail store: header/approvals/followers load by requestId. */
export const LVM14000Store = defineStore("LVM14000Store", {
    state: () => ({
        loading: true,
        requestId: "",
        acting: false,
        header: null as LeaveRequestHeader | null,
        approvals: [] as LeaveApproval[],
        followers: [] as LeaveFollower[],
        detailApi: RetrieveLeaveRequestDetail.getInstance(),
        approveApi: ApproveLeaveRequest.getInstance(),
        rejectApi: RejectLeaveRequest.getInstance(),
        cancelApi: CancelLeaveRequestApi.getInstance()
    }),
    actions: {
        load(requestId: string) {
            this.requestId = requestId;
            if (!requestId) { this.loading = false; return; }
            this.loading = true;
            this.detailApi.request({
                dataBody: { requestId },
                listener: {
                    onSuccess: (p) => {
                        // Tolerant read: header may come nested under `request` or flat.
                        const h = p?.request ?? p;
                        this.header = h && Object.keys(h).length ? h : null;
                        this.approvals = p?.approvals ?? h?.approvals ?? [];
                        this.followers = p?.followers ?? h?.followers ?? [];
                        this.loading = false;
                    },
                    onFail: () => { this.header = null; this.approvals = []; this.followers = []; this.loading = false; }
                }
            });
        },
        // Shared runner for approve/reject; reloads the request on success.
        act(api: IRequest<ActLeaveRequest, ActLeaveResponse>, comment: string | undefined, done: ActDone) {
            this.acting = true;
            api.request({
                dataBody: { requestId: this.requestId, comment },
                listener: {
                    onSuccess: () => { this.acting = false; this.load(this.requestId); done(true); },
                    onFail: (e) => { this.acting = false; done(false, e); }
                }
            });
        },
        approve(comment: string | undefined, done: ActDone) { this.act(this.approveApi, comment, done); },
        reject(comment: string | undefined, done: ActDone) { this.act(this.rejectApi, comment, done); },
        cancel(done: ActDone) {
            this.acting = true;
            this.cancelApi.request({
                dataBody: { requestId: this.requestId },
                listener: {
                    onSuccess: () => { this.acting = false; this.load(this.requestId); done(true); },
                    onFail: (e) => { this.acting = false; done(false, e); }
                }
            });
        }
    }
});
