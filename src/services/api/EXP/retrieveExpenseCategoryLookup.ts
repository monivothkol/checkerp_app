import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { EXP11000I02Response } from "@/models/POS/EXP/EXP30000";

/** EXP11000I02 — active expense categories for dropdowns. */
export default class RetrieveExpenseCategoryLookup implements IRequest<Record<string, never>, EXP11000I02Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveExpenseCategoryLookup;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveExpenseCategoryLookup {
        if (!this.instance) { this.instance = new RetrieveExpenseCategoryLookup(); }
        return this.instance;
    }
    public request(option: RequestOption<Record<string, never>, EXP11000I02Response>) {
        this.networkService.request({
            trCode: "EXP11000I02", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as EXP11000I02Response))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
