import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CommissionCalcRequest, CommissionCalcResult } from "@/models/POS/RPT/RPT80000";

/** RPT81000 - calculate a commission preview (not saved). */
export default class CalculateCommission implements IRequest<CommissionCalcRequest, CommissionCalcResult> {
    private readonly networkService: HttpNetworkService;
    private static instance: CalculateCommission;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): CalculateCommission {
        if (!this.instance) { this.instance = new CalculateCommission(); }
        return this.instance;
    }
    public request(option: RequestOption<CommissionCalcRequest, CommissionCalcResult>) {
        this.networkService.request({
            trCode: "RPT81000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as CommissionCalcResult))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
