import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { UpdatePayrollLineAmountRequest, UpdatePayrollLineAmountResponse } from "@/models/POS/PRM/PRM11000";

/** PRM19000 — set an editable FINANCIAL recovery line's amount on a DRAFT run. */
export default class UpdatePayrollLineAmount
implements IRequest<UpdatePayrollLineAmountRequest, UpdatePayrollLineAmountResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: UpdatePayrollLineAmount;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): UpdatePayrollLineAmount {
        if (!this.instance) { this.instance = new UpdatePayrollLineAmount(); }
        return this.instance;
    }
    public request(option: RequestOption<UpdatePayrollLineAmountRequest, UpdatePayrollLineAmountResponse>) {
        this.networkService.request({
            trCode: "PRM19000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as UpdatePayrollLineAmountResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
