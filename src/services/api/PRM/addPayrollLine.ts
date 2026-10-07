import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { AddPayrollLineRequest, AddPayrollLineResponse } from "@/models/POS/PRM/PRM16000";

/** PRM16000I01 — add a manual adjustment line to a staff's payslip on a DRAFT run. */
export default class AddPayrollLine
implements IRequest<AddPayrollLineRequest, AddPayrollLineResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: AddPayrollLine;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): AddPayrollLine {
        if (!this.instance) { this.instance = new AddPayrollLine(); }
        return this.instance;
    }
    public request(option: RequestOption<AddPayrollLineRequest, AddPayrollLineResponse>) {
        this.networkService.request({
            trCode: "PRM16000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as AddPayrollLineResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
