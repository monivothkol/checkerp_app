import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SyncJobResponse } from "@/models/ACT/ACT44000";

/** ACT44000I02 - start the background sync; returns at once with the job status. */
export default class RunAccountingSync implements IRequest<Record<string, never>, SyncJobResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RunAccountingSync;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RunAccountingSync {
        if (!this.instance) { this.instance = new RunAccountingSync(); }
        return this.instance;
    }
    public request(option: RequestOption<Record<string, never>, SyncJobResponse>) {
        this.networkService.request({
            trCode: "ACT44000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as SyncJobResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
