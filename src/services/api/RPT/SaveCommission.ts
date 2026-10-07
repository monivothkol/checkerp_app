import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CommissionCalcRequest, CommissionSaveResponse } from "@/models/POS/RPT/RPT80000";

/** RPT42000 - persist a calculated commission. */
export default class SaveCommission implements IRequest<CommissionCalcRequest, CommissionSaveResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: SaveCommission;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): SaveCommission {
        if (!this.instance) { this.instance = new SaveCommission(); }
        return this.instance;
    }
    public request(option: RequestOption<CommissionCalcRequest, CommissionSaveResponse>) {
        this.networkService.request({
            trCode: "RPT81000I02", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as CommissionSaveResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
