import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SFM10000Response } from "@/models/POS/SFM/SFM10000";

export interface RetrieveStaffFinancialListRequest {
    pageNo?: number;
    pageSize?: number;
    searchKeyword?: string;
}

/** SFM10000 — staff financial accounts list. */
export default class RetrieveStaffFinancialList
implements IRequest<RetrieveStaffFinancialListRequest, SFM10000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveStaffFinancialList;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveStaffFinancialList {
        if (!this.instance) { this.instance = new RetrieveStaffFinancialList(); }
        return this.instance;
    }
    public request(option: RequestOption<RetrieveStaffFinancialListRequest, SFM10000Response>) {
        this.networkService.request({
            trCode: "SFM10000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as SFM10000Response))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
