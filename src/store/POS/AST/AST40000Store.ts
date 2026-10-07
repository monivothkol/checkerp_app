import { defineStore } from "pinia";
import PreviewDepreciation from "@/services/api/AST/previewDepreciation";
import PostDepreciation from "@/services/api/AST/postDepreciation";
import type { DepreciationDueRow, DepreciationPreviewResponse, DepreciationPostResponse } from "@/models/POS/AST/AST40000";

/** AST40000 depreciation run store: pick a month, preview what is due, post it. */
export const AST40000Store = defineStore("AST40000Store", {
    state: () => ({
        periodMonth: new Date().toISOString().slice(0, 7),
        rows: [] as DepreciationDueRow[],
        totalAmount: 0,
        loading: false,
        posting: false,
        lastResult: undefined as DepreciationPostResponse | undefined,
        previewApi: PreviewDepreciation.getInstance(),
        postApi: PostDepreciation.getInstance()
    }),
    actions: {
        preview() {
            this.loading = true;
            this.lastResult = undefined;
            this.previewApi.request({
                dataBody: { periodMonth: this.periodMonth },
                listener: {
                    onSuccess: (p: DepreciationPreviewResponse) => {
                        this.rows = p.assetList ?? [];
                        this.totalAmount = Number(p.totalAmount ?? 0);
                        this.loading = false;
                    },
                    onFail: () => { this.rows = []; this.totalAmount = 0; this.loading = false; }
                }
            });
        },
        post(onDone: (ok: boolean, res?: DepreciationPostResponse, error?: unknown) => void) {
            this.posting = true;
            this.postApi.request({
                dataBody: { periodMonth: this.periodMonth },
                headers: { "Idempotency-Key": crypto.randomUUID() },
                listener: {
                    onSuccess: (res) => { this.posting = false; this.lastResult = res; onDone(true, res); this.preview(); },
                    onFail: (e) => { this.posting = false; onDone(false, undefined, e); }
                }
            });
        }
    }
});
