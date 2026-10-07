import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { MarkPayslipRequest, MarkPayslipResponse } from "@/models/POS/PRM/PRM15000";

/** PRM15000I04 — mark a FINALIZED run's payslip paid/unpaid (paying implies verified). */
export default class MarkPayslipPaid
implements IRequest<MarkPayslipRequest, MarkPayslipResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: MarkPayslipPaid;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): MarkPayslipPaid {
        if (!this.instance) { this.instance = new MarkPayslipPaid(); }
        return this.instance;
    }
    public request(option: RequestOption<MarkPayslipRequest, MarkPayslipResponse>) {
        this.networkService.request({
            trCode: "PRM15000I04", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as MarkPayslipResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
