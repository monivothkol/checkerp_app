import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CreateAssetRequest, CreateAssetResponse } from "@/models/POS/AST/AST20000";

/** AST20000I01 — record an asset (posts the acquisition). */
export default class CreateAsset
implements IRequest<CreateAssetRequest, CreateAssetResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateAsset;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): CreateAsset {
        if (!this.instance) { this.instance = new CreateAsset(); }
        return this.instance;
    }
    public request(option: RequestOption<CreateAssetRequest, CreateAssetResponse>) {
        this.networkService.request({
            trCode: "AST20000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as CreateAssetResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
