import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface SetBatchTrackedRequest {
    productId: string;
    enabled: boolean;
}

export interface SetBatchTrackedResponse {
    productId: string;
    isBatchTracked: boolean;
}

export default class SetBatchTracked implements IRequest<SetBatchTrackedRequest, SetBatchTrackedResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: SetBatchTracked;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): SetBatchTracked {
        if (!this.instance) { this.instance = new SetBatchTracked(); }
        return this.instance;
    }
    public request(option: RequestOption<SetBatchTrackedRequest, SetBatchTrackedResponse>) {
        this.networkService.request({
            trCode: "PRD50000I04",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as SetBatchTrackedResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
