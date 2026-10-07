import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ExpenseSaveRequest, ExpenseSaveResponse } from "@/models/POS/EXP/EXP10000";

/** EXP15000I02 — update an expense record. */
export default class UpdateExpense implements IRequest<ExpenseSaveRequest, ExpenseSaveResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: UpdateExpense;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): UpdateExpense {
        if (!this.instance) { this.instance = new UpdateExpense(); }
        return this.instance;
    }
    public request(option: RequestOption<ExpenseSaveRequest, ExpenseSaveResponse>) {
        this.networkService.request({
            trCode: "EXP15000I02", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as ExpenseSaveResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
