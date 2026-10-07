import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { EXP15000Request, ExpenseDetail } from "@/models/POS/EXP/EXP10000";

/** EXP15000I01 — one expense record. */
export default class RetrieveExpenseDetail implements IRequest<EXP15000Request, ExpenseDetail> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveExpenseDetail;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveExpenseDetail {
        if (!this.instance) { this.instance = new RetrieveExpenseDetail(); }
        return this.instance;
    }
    public request(option: RequestOption<EXP15000Request, ExpenseDetail>) {
        this.networkService.request({
            trCode: "EXP15000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as ExpenseDetail))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
