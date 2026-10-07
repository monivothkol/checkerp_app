import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ComputedAssetsResponse } from "@/models/POS/AST/AST10000";

/** AST10000I02 — cash / receivables / inventory computed from other modules. */
export default class RetrieveComputedAssets
implements IRequest<Record<string, never>, ComputedAssetsResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveComputedAssets;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveComputedAssets {
        if (!this.instance) { this.instance = new RetrieveComputedAssets(); }
        return this.instance;
    }
    public request(option: RequestOption<Record<string, never>, ComputedAssetsResponse>) {
        this.networkService.request({
            trCode: "AST10000I02", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as ComputedAssetsResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
