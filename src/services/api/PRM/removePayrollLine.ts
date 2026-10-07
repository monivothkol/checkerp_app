import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { RemovePayrollLineRequest, RemovePayrollLineResponse } from "@/models/POS/PRM/PRM15000";

/** PRM15000I02 — remove a MANUAL line (and its PENDING backing adjustment) from a DRAFT run. */
export default class RemovePayrollLine
implements IRequest<RemovePayrollLineRequest, RemovePayrollLineResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RemovePayrollLine;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RemovePayrollLine {
        if (!this.instance) { this.instance = new RemovePayrollLine(); }
        return this.instance;
    }
    public request(option: RequestOption<RemovePayrollLineRequest, RemovePayrollLineResponse>) {
        this.networkService.request({
            trCode: "PRM15000I02", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as RemovePayrollLineResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
