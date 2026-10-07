import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CommissionActionResponse } from "@/models/POS/RPT/RPT80000";

export type ApproveCommissionRequest = { commissionId: string };

/** RPT43000 - approve a pending commission. */
export default class ApproveCommission implements IRequest<ApproveCommissionRequest, CommissionActionResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: ApproveCommission;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): ApproveCommission {
        if (!this.instance) { this.instance = new ApproveCommission(); }
        return this.instance;
    }
    public request(option: RequestOption<ApproveCommissionRequest, CommissionActionResponse>) {
        this.networkService.request({
            trCode: "RPT82000I02", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as CommissionActionResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
