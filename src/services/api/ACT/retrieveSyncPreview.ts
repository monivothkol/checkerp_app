import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SyncPreviewResponse } from "@/models/ACT/ACT44000";

/** ACT44000I01 - operations with no journal entry, counted per type (read-only). */
export default class RetrieveSyncPreview implements IRequest<Record<string, never>, SyncPreviewResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveSyncPreview;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveSyncPreview {
        if (!this.instance) { this.instance = new RetrieveSyncPreview(); }
        return this.instance;
    }
    public request(option: RequestOption<Record<string, never>, SyncPreviewResponse>) {
        this.networkService.request({
            trCode: "ACT44000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as SyncPreviewResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
