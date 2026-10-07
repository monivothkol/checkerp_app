import { defineStore } from "pinia";
import RetrieveTransferDetail from "@/services/api/STK/retrieveTransferDetail";
import ApproveTransfer from "@/services/api/STK/approveTransfer";
import RejectTransfer from "@/services/api/STK/rejectTransfer";
import CancelTransfer from "@/services/api/STK/cancelTransfer";
import POP from "@/core/utilities/pop";
import type { TransferDetail } from "@/models/POS/STK/STK23000";

/** STK23000 transfer-detail screen store: detail load by transfer code. */
export const STK23000Store = defineStore("STK23000Store", {
    state: () => ({
        loading: true,
        acting: false,
        detail: null as TransferDetail | null,
        transferDetailApi: RetrieveTransferDetail.getInstance()
    }),
    actions: {
        load(code: string) {
            if (!code) { this.loading = false; return; }
            this.loading = true;
            this.transferDetailApi.request({
                dataBody: { transferCode: code },
                listener: {
                    onSuccess: (p) => { this.detail = p; this.loading = false; },
                    onFail: () => { this.detail = null; this.loading = false; }
                }
            });
        },
        /** approve / cancel / reject a PENDING transfer, then refresh the detail. */
        act(kind: "approve" | "cancel" | "reject", failTitle: string) {
            const transferId = this.detail?.transferId;
            const code = this.detail?.transferCode;
            if (!transferId || this.acting) return;
            this.acting = true;
            const apiByKind = {
                approve: ApproveTransfer,
                cancel: CancelTransfer,
                reject: RejectTransfer
            };
            const api = apiByKind[kind].getInstance();
            api.request({
                dataBody: { transferId },
                listener: {
                    onSuccess: () => { this.acting = false; if (code) this.load(code); },
                    onFail: (e: { message?: string; code?: string }) => {
                        this.acting = false;
                        POP.alert({ title: failTitle, status: "error", content: e?.message, errorCode: e?.code });
                    }
                }
            });
        }
    }
});
