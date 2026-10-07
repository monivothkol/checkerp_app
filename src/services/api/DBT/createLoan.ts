import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CreateLoanRequest, CreateLoanResponse } from "@/models/POS/DBT/DBT20000";

/** DBT20000I01 — record a loan and its schedule (posts the drawdown). */
export default class CreateLoan
implements IRequest<CreateLoanRequest, CreateLoanResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateLoan;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): CreateLoan {
        if (!this.instance) { this.instance = new CreateLoan(); }
        return this.instance;
    }
    public request(option: RequestOption<CreateLoanRequest, CreateLoanResponse>) {
        this.networkService.request({
            trCode: "DBT20000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as CreateLoanResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
