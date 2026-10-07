import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { AssetDetailResponse } from "@/models/POS/AST/AST30000";

/** AST30000I01 — one asset with its depreciation history. */
export default class RetrieveAssetDetail
implements IRequest<{ assetId: string }, AssetDetailResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveAssetDetail;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveAssetDetail {
        if (!this.instance) { this.instance = new RetrieveAssetDetail(); }
        return this.instance;
    }
    public request(option: RequestOption<{ assetId: string }, AssetDetailResponse>) {
        this.networkService.request({
            trCode: "AST30000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as AssetDetailResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
