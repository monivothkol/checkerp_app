import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CommissionActionResponse } from "@/models/POS/RPT/RPT80000";

export type RejectCommissionRequest = { commissionId: string; rejectionReason?: string };

/** RPT44000 - reject a pending commission. */
export default class RejectCommission implements IRequest<RejectCommissionRequest, CommissionActionResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RejectCommission;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RejectCommission {
        if (!this.instance) { this.instance = new RejectCommission(); }
        return this.instance;
    }
    public request(option: RequestOption<RejectCommissionRequest, CommissionActionResponse>) {
        this.networkService.request({
            trCode: "RPT82000I03", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as CommissionActionResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
