import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { EXP17000Request, ExpenseSaveResponse } from "@/models/POS/EXP/EXP10000";

/** EXP10000I02 — delete an expense record. */
export default class DeleteExpense implements IRequest<EXP17000Request, ExpenseSaveResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: DeleteExpense;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): DeleteExpense {
        if (!this.instance) { this.instance = new DeleteExpense(); }
        return this.instance;
    }
    public request(option: RequestOption<EXP17000Request, ExpenseSaveResponse>) {
        this.networkService.request({
            trCode: "EXP10000I02", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as ExpenseSaveResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
