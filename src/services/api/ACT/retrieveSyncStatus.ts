import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SyncJobResponse } from "@/models/ACT/ACT44000";

/** ACT44000I05 - sync job progress, read from memory (no SQL) — safe to poll every second. */
export default class RetrieveSyncStatus implements IRequest<Record<string, never>, SyncJobResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveSyncStatus;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveSyncStatus {
        if (!this.instance) { this.instance = new RetrieveSyncStatus(); }
        return this.instance;
    }
    public request(option: RequestOption<Record<string, never>, SyncJobResponse>) {
        this.networkService.request({
            trCode: "ACT44000I05",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as SyncJobResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
