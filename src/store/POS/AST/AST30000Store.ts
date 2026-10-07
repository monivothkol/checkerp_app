import { defineStore } from "pinia";
import RetrieveAssetDetail from "@/services/api/AST/retrieveAssetDetail";
import DisposeAsset from "@/services/api/AST/disposeAsset";
import type { AssetDetailResponse, DisposeAssetResponse } from "@/models/POS/AST/AST30000";
import type { PaidFrom } from "@/models/POS/AST/AST10000";

/** AST30000 asset detail store: the asset + depreciation history, and the dispose form. */
export const AST30000Store = defineStore("AST30000Store", {
    state: () => ({
        assetId: "",
        detail: undefined as AssetDetailResponse | undefined,
        loading: false,
        // dispose form
        disposalDate: undefined as string | undefined,
        disposalAmount: 0 as number | undefined,
        receivedTo: "CASH" as PaidFrom,
        submitting: false,
        api: RetrieveAssetDetail.getInstance(),
        disposeApi: DisposeAsset.getInstance()
    }),
    actions: {
        load(assetId: string) {
            this.assetId = assetId;
            this.loading = true;
            this.api.request({
                dataBody: { assetId },
                listener: {
                    onSuccess: (p: AssetDetailResponse) => { this.detail = p; this.loading = false; },
                    onFail: () => { this.detail = undefined; this.loading = false; }
                }
            });
        },
        resetDispose() {
            this.disposalDate = undefined;
            this.disposalAmount = 0;
            this.receivedTo = "CASH";
            this.submitting = false;
        },
        dispose(onDone: (ok: boolean, res?: DisposeAssetResponse, error?: unknown) => void) {
            this.submitting = true;
            this.disposeApi.request({
                dataBody: {
                    assetId: this.assetId,
                    disposalDate: this.disposalDate as string,
                    disposalAmount: Number(this.disposalAmount ?? 0),
                    receivedTo: this.receivedTo
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
