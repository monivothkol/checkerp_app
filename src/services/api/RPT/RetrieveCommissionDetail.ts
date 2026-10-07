import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CommissionDetail } from "@/models/POS/RPT/RPT80000";

export type RetrieveCommissionDetailRequest = { commissionId: string };

/** RPT82000 - commission detail + recipients. */
export default class RetrieveCommissionDetail implements IRequest<RetrieveCommissionDetailRequest, CommissionDetail> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveCommissionDetail;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveCommissionDetail {
        if (!this.instance) { this.instance = new RetrieveCommissionDetail(); }
        return this.instance;
    }
    public request(option: RequestOption<RetrieveCommissionDetailRequest, CommissionDetail>) {
        this.networkService.request({
            trCode: "RPT82000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as CommissionDetail))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
