import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { DepreciationRunRequest, DepreciationPostResponse } from "@/models/POS/AST/AST40000";

/** AST40000I02 — post one month's depreciation for every due asset. */
export default class PostDepreciation
implements IRequest<DepreciationRunRequest, DepreciationPostResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: PostDepreciation;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): PostDepreciation {
        if (!this.instance) { this.instance = new PostDepreciation(); }
        return this.instance;
    }
    public request(option: RequestOption<DepreciationRunRequest, DepreciationPostResponse>) {
        this.networkService.request({
            trCode: "AST40000I02", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as DepreciationPostResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
