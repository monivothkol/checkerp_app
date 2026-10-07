import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { DisposeAssetRequest, DisposeAssetResponse } from "@/models/POS/AST/AST30000";

/** AST30000I03 — dispose / sell an active asset (posts the gain or loss). */
export default class DisposeAsset
implements IRequest<DisposeAssetRequest, DisposeAssetResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: DisposeAsset;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): DisposeAsset {
        if (!this.instance) { this.instance = new DisposeAsset(); }
        return this.instance;
    }
    public request(option: RequestOption<DisposeAssetRequest, DisposeAssetResponse>) {
        this.networkService.request({
            trCode: "AST30000I03", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as DisposeAssetResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
