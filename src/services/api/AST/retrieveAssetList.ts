import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { AST10000Response, AssetClass, AssetStatus, AssetType } from "@/models/POS/AST/AST10000";

export interface RetrieveAssetListRequest {
    pageNo?: number;
    pageSize?: number;
    searchKeyword?: string;
    assetClass?: AssetClass;
    assetType?: AssetType;
    status?: AssetStatus;
}

/** AST10000I01 — asset register list with filters + totals. */
export default class RetrieveAssetList
implements IRequest<RetrieveAssetListRequest, AST10000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveAssetList;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveAssetList {
        if (!this.instance) { this.instance = new RetrieveAssetList(); }
        return this.instance;
    }
    public request(option: RequestOption<RetrieveAssetListRequest, AST10000Response>) {
        this.networkService.request({
            trCode: "AST10000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as AST10000Response))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
