import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { DepreciationRunRequest, DepreciationPreviewResponse } from "@/models/POS/AST/AST40000";

/** AST40000I01 — what one month's depreciation run would post. */
export default class PreviewDepreciation
implements IRequest<DepreciationRunRequest, DepreciationPreviewResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: PreviewDepreciation;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): PreviewDepreciation {
        if (!this.instance) { this.instance = new PreviewDepreciation(); }
        return this.instance;
    }
    public request(option: RequestOption<DepreciationRunRequest, DepreciationPreviewResponse>) {
        this.networkService.request({
            trCode: "AST40000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as DepreciationPreviewResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
