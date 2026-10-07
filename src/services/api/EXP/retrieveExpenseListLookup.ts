import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { EXP11000I03Request, EXP11000I03Response } from "@/models/POS/EXP/EXP20000";

/** EXP11000I03 — active expense lists (choices) under a category. */
export default class RetrieveExpenseListLookup implements IRequest<EXP11000I03Request, EXP11000I03Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveExpenseListLookup;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveExpenseListLookup {
        if (!this.instance) { this.instance = new RetrieveExpenseListLookup(); }
        return this.instance;
    }
    public request(option: RequestOption<EXP11000I03Request, EXP11000I03Response>) {
        this.networkService.request({
            trCode: "EXP11000I03", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as EXP11000I03Response))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
