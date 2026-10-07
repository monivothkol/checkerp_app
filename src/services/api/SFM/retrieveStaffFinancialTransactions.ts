import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { StaffFinancialTransactionsResponse } from "@/models/POS/SFM/SFM20000";

export interface RetrieveStaffFinancialTransactionsRequest {
    staffId: string;
    accountType?: string;
    pageNo?: number;
    pageSize?: number;
}

/** SFM20000I01 — transaction history for one staff (shown in the SFM20000 detail screen). */
export default class RetrieveStaffFinancialTransactions
implements IRequest<RetrieveStaffFinancialTransactionsRequest, StaffFinancialTransactionsResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveStaffFinancialTransactions;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveStaffFinancialTransactions {
        if (!this.instance) { this.instance = new RetrieveStaffFinancialTransactions(); }
        return this.instance;
    }
    public request(option: RequestOption<RetrieveStaffFinancialTransactionsRequest, StaffFinancialTransactionsResponse>) {
        this.networkService.request({
            trCode: "SFM20000I02", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as StaffFinancialTransactionsResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
