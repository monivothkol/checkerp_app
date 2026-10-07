import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type {
    CreateStaffFinancialTransactionRequest,
    CreateStaffFinancialTransactionResponse
} from "@/models/POS/SFM/SFM30000";

/** SFM30000 — post a staff financial transaction (disbursement/repayment/deposit/refund). */
export default class CreateStaffFinancialTransaction
implements IRequest<CreateStaffFinancialTransactionRequest, CreateStaffFinancialTransactionResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateStaffFinancialTransaction;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): CreateStaffFinancialTransaction {
        if (!this.instance) { this.instance = new CreateStaffFinancialTransaction(); }
        return this.instance;
    }
    public request(option: RequestOption<CreateStaffFinancialTransactionRequest, CreateStaffFinancialTransactionResponse>) {
        this.networkService.request({
            trCode: "SFM30000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as CreateStaffFinancialTransactionResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
