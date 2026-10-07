import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { StaffFinancialDetail } from "@/models/POS/SFM/SFM20000";

export interface RetrieveStaffFinancialDetailRequest { staffId: string; }

/** SFM20000 — one staff's financial account. */
export default class RetrieveStaffFinancialDetail
implements IRequest<RetrieveStaffFinancialDetailRequest, StaffFinancialDetail> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveStaffFinancialDetail;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveStaffFinancialDetail {
        if (!this.instance) { this.instance = new RetrieveStaffFinancialDetail(); }
        return this.instance;
    }
    public request(option: RequestOption<RetrieveStaffFinancialDetailRequest, StaffFinancialDetail>) {
        this.networkService.request({
            trCode: "SFM20000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as StaffFinancialDetail))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
