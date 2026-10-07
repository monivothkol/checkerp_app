import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { UpdateAssetRequest, UpdateAssetResponse } from "@/models/POS/AST/AST30000";

/** AST30000I02 — edit an active asset. */
export default class UpdateAsset
implements IRequest<UpdateAssetRequest, UpdateAssetResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: UpdateAsset;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): UpdateAsset {
        if (!this.instance) { this.instance = new UpdateAsset(); }
        return this.instance;
    }
    public request(option: RequestOption<UpdateAssetRequest, UpdateAssetResponse>) {
        this.networkService.request({
            trCode: "AST30000I02", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as UpdateAssetResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
