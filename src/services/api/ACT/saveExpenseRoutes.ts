import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SaveExpenseRouteRequest, SaveExpenseRouteResponse } from "@/models/ACT/ACT42000";

/** ACT42000I02 - set/clear expense category → account routes. */
export default class SaveExpenseRoutes implements IRequest<SaveExpenseRouteRequest, SaveExpenseRouteResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: SaveExpenseRoutes;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): SaveExpenseRoutes {
        if (!this.instance) { this.instance = new SaveExpenseRoutes(); }
        return this.instance;
    }
    public request(option: RequestOption<SaveExpenseRouteRequest, SaveExpenseRouteResponse>) {
        this.networkService.request({
            trCode: "ACT42000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as SaveExpenseRouteResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
