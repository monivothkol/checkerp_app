import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ExpenseRouteResponse } from "@/models/ACT/ACT42000";

/** ACT42000I01 - expense categories with their routed GL account + account options. */
export default class RetrieveExpenseRoutes implements IRequest<Record<string, never>, ExpenseRouteResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveExpenseRoutes;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveExpenseRoutes {
        if (!this.instance) { this.instance = new RetrieveExpenseRoutes(); }
        return this.instance;
    }
    public request(option: RequestOption<Record<string, never>, ExpenseRouteResponse>) {
        this.networkService.request({
            trCode: "ACT42000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as ExpenseRouteResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
