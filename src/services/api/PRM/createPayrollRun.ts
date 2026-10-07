import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CreatePayrollRunRequest, CreatePayrollRunResponse } from "@/models/POS/PRM/PRM11000";

/** PRM11000 — open a DRAFT payroll run (one item per active staff). */
export default class CreatePayrollRun implements IRequest<CreatePayrollRunRequest, CreatePayrollRunResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreatePayrollRun;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): CreatePayrollRun {
        if (!this.instance) { this.instance = new CreatePayrollRun(); }
        return this.instance;
    }
    public request(option: RequestOption<CreatePayrollRunRequest, CreatePayrollRunResponse>) {
        this.networkService.request({
            trCode: "PRM11000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as CreatePayrollRunResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
