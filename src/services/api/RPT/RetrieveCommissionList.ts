import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CommissionListResponse } from "@/models/POS/RPT/RPT80000";

export type RetrieveCommissionListRequest = { pageNo?: number; pageSize?: number; status?: string };

/** RPT80000 - commission list. */
export default class RetrieveCommissionList implements IRequest<RetrieveCommissionListRequest, CommissionListResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveCommissionList;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveCommissionList {
        if (!this.instance) { this.instance = new RetrieveCommissionList(); }
        return this.instance;
    }
    public request(option: RequestOption<RetrieveCommissionListRequest, CommissionListResponse>) {
        this.networkService.request({
            trCode: "RPT80000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as CommissionListResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
