import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { EXP10000Request, EXP10000Response } from "@/models/POS/EXP/EXP10000";

/** EXP10000I01 — expense records list (date range + category filters). */
export default class RetrieveExpenseList implements IRequest<EXP10000Request, EXP10000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveExpenseList;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveExpenseList {
        if (!this.instance) { this.instance = new RetrieveExpenseList(); }
        return this.instance;
    }
    public request(option: RequestOption<EXP10000Request, EXP10000Response>) {
        this.networkService.request({
            trCode: "EXP10000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as EXP10000Response))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
